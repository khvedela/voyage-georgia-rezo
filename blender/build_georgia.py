"""
Voyage Georgia Rezo: low-poly 3D Georgia, built in Blender from the same data as the site's three.js scene.

Run inside Blender (via the MCP-for-Blender socket):  python3 blender/bl.py blender/build_georgia.py
Rebuilds the whole scene from scratch every run, so iterations are reproducible.

Coordinates match src/scripts/vgr3d.js exactly: three.js world (X, Y-up, Z) = Blender (X, -Y, Z-up), so the glTF
export (+Y up) lands where the site's routes, pins and camera already expect. Map units -> world: S = 0.01.
All animation loops over LOOP frames, so the exported clip repeats seamlessly.
"""
import bpy, bmesh, json, re, math, random, os, time
import numpy as np
from mathutils import Matrix, Vector
from mathutils.geometry import delaunay_2d_cdt
from mathutils.bvhtree import BVHTree

t_start = time.time()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PI, SQ2 = math.pi, math.sqrt(2)

# ------------------------------------------------------------------------------------------------ data
_src = open(os.path.join(ROOT, 'src/scripts/vgr3d.js')).read()
G = json.loads(re.search(r'var G = (\{.*?\});\n', _src, re.S).group(1))
META = json.load(open(os.path.join(ROOT, 'src/scripts/terrain-meta.json')))
S, BASE, EX = 0.01, 0.05, 9
MPU = 0.01532 / 1000 * EX           # world height per metre
SLAB = 0.32; SLAB_BOTTOM = BASE - SLAB
SEA_Y = BASE - 0.008                 # sea surface (three.js world Y)
LM = 2.9                             # landmark scale (the site uses 2.3; larger reads better from a distance)
LMK = LM / 2.3                       # how much the stop areas grew with it
FPS, LOOP = 24, 480                  # a 20 s loop
FINE, MID, COARSE = 1.7, 2.9, 4.8    # terrain triangle size (map units) near stops / around them / elsewhere
SURR = 6.5                           # ... in the neighbouring lands and the sea
M_LAND, M_SEA = 30, 60               # how far the model runs past the border (map units): over land / out to sea
STOPS = [('Tbilisi', 'Tbilisi'), ('Kakheti', 'Telavi'), ('Tusheti', 'Omalo'), ('Svaneti', 'Mestia'), ('Batumi', 'Batumi')]
DEST = {'Tbilisi': 'tbilisi', 'Kakheti': 'kakheti', 'Tusheti': 'tusheti', 'Svaneti': 'svaneti', 'Batumi': 'batumi'}
rng = random.Random(11)

# heights in metres (R*256 + G), lightly smoothed like the site does
_img = bpy.data.images.load(os.path.join(ROOT, 'public/terrain/height.webp'), check_existing=True)
_img.colorspace_settings.name = 'Non-Color'
HW, HH = _img.size
_px = np.empty(HW * HH * 4, np.float32); _img.pixels.foreach_get(_px)
_px = _px.reshape(HH, HW, 4)[::-1]
_raw = np.round(_px[..., 0] * 255) * 256 + np.round(_px[..., 1] * 255)
_pad = np.pad(_raw, 1, mode='edge')
HM = sum(_pad[1 + dy:1 + dy + HH, 1 + dx:1 + dx + HW] for dy in (-1, 0, 1) for dx in (-1, 0, 1)) / 9.0
TR = META['tr']

def h_at(x, y):
    """metres at map coords (scalars or arrays)"""
    x = np.asarray(x, np.float64); y = np.asarray(y, np.float64)
    u = np.clip((x - TR['minx']) / (TR['maxx'] - TR['minx']) * (HW - 1), 0, HW - 1.001)
    v = np.clip((y - TR['miny']) / (TR['maxy'] - TR['miny']) * (HH - 1), 0, HH - 1.001)
    i = np.floor(u).astype(int); j = np.floor(v).astype(int); fu = u - i; fv = v - j
    return (HM[j, i] * (1 - fu) + HM[j, i + 1] * fu) * (1 - fv) + (HM[j + 1, i] * (1 - fu) + HM[j + 1, i + 1] * fu) * fv

RING = [tuple(p) for p in G['geo'][0]]
def _nearest(pt): return min(range(len(RING)), key=lambda k: (RING[k][0] - pt[0]) ** 2 + (RING[k][1] - pt[1]) ** 2)
_iS, _iN = _nearest((267.9, 422.6)), _nearest((74.0, 103.9))
COAST = RING[_iS:len(RING) - 1] + RING[0:_iN + 1]
_out = []
for k in range(len(COAST)):
    sx = sy = 0.0
    for d in range(-6, 7):
        r = COAST[max(0, min(len(COAST) - 1, k + d))]; sx += r[0]; sy += r[1]
    _out.append((sx / 13 - 64, sy / 13 + 14))
_out = [q for k, q in enumerate(_out) if k % 3 == 0 or k == len(_out) - 1][::-1]
SEA_POLY = COAST + [(COAST[-1][0] - 40, COAST[-1][1] - 6)] + _out + [(COAST[0][0] - 30, COAST[0][1] + 24)]
_all = RING + SEA_POLY
bx0, bx1 = min(p[0] for p in _all), max(p[0] for p in _all)
by0, by1 = min(p[1] for p in _all), max(p[1] for p in _all)
cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2
RINGO = RING[:-1] if RING[0] == RING[-1] else RING[:]

def wx(x): return (x - cx) * S
def wz(y): return (y - cy) * S
def y_at(x, y): return BASE + np.maximum(0, h_at(x, y)) * MPU

def pip(px, py, poly):
    """even-odd point in polygon, vectorised"""
    px = np.asarray(px, float); py = np.asarray(py, float); P = np.asarray(poly, float)
    res = np.zeros(px.shape, bool)
    for k in range(len(P)):
        ax, ay = P[k]; bx, by = P[k - 1]
        if ay == by: continue
        res ^= ((ay > py) != (by > py)) & (px < (bx - ax) * (py - ay) / (by - ay) + ax)
    return res

def inside_map(x, y, poly=RINGO): return bool(pip(np.array([x]), np.array([y]), poly)[0])

def dist_poly(px, py, poly):
    d = np.full(np.shape(px), 1e9)
    n = len(poly)
    for k in range(n):
        a = poly[k]; b = poly[(k + 1) % n]; ex, ey = b[0] - a[0], b[1] - a[1]; L2 = ex * ex + ey * ey or 1e-12
        t = np.clip(((px - a[0]) * ex + (py - a[1]) * ey) / L2, 0, 1)
        d = np.minimum(d, np.hypot(px - a[0] - t * ex, py - a[1] - t * ey))
    return d

SP = np.array([G['places'][p] for _, p in STOPS], float)
SCENERY = ['Kutaisi', 'Stepantsminda', 'Vardzia', 'Uplistsikhe']
SP2 = np.array([G['places'][p] for p in SCENERY], float)
def step_of(px, py):
    px = np.atleast_1d(px); py = np.atleast_1d(py)
    d = np.min(np.hypot(px[:, None] - SP[None, :, 0], py[:, None] - SP[None, :, 1]), axis=1)
    d2 = np.min(np.hypot(px[:, None] - SP2[None, :, 0], py[:, None] - SP2[None, :, 1]), axis=1)
    return np.where(d < 50 * LMK, FINE, np.where((d < 88 * LMK) | (d2 < 40), MID, COARSE))

# ------------------------------------------------------------------------------------------------ scene reset
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.actions, bpy.data.curves):
    for b in list(coll): coll.remove(b)
for c in list(bpy.data.collections): bpy.data.collections.remove(c)
scene = bpy.context.scene
scene.render.fps = FPS; scene.frame_start = 0; scene.frame_end = LOOP; scene.frame_set(0)
COLL = bpy.data.collections.new('Georgia'); scene.collection.children.link(COLL)
_prefs = bpy.context.preferences.edit; _old_interp = _prefs.keyframe_new_interpolation_type
_prefs.keyframe_new_interpolation_type = 'LINEAR'

# ------------------------------------------------------------------------------------------------ materials
def srgb(hexv):
    c = [((hexv >> 16) & 255) / 255, ((hexv >> 8) & 255) / 255, (hexv & 255) / 255]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]

MATS = {}
def make_mat(name, hexv, rough=0.85, metal=0.0, emit=0.0, vcol=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*srgb(hexv), 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emit:
        bsdf.inputs['Emission Color'].default_value = (*srgb(hexv), 1)
        bsdf.inputs['Emission Strength'].default_value = emit
    if vcol:
        a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Col'
        nt.links.new(a.outputs['Color'], bsdf.inputs['Base Color'])
    MATS[name] = m
    return m

PALETTE = dict(
    stone=0xefe8d8, stoneY=0xe8d9b4, stoneD=0xcdc2ab, stoneG=0x9f988b, stoneT=0x8c867a, stoneS=0xd8cfbd,
    ochre=0xe2c287, rose=0xe8c9bd, sky=0xcfdde4, roof=0xb4532f, roofD=0x93432a, roofG=0x6f8c7d, roofGrey=0x8c939a,
    slate=0x4e535a, clay=0xb5643a, brick=0xc5895a, wood=0x7a5233, vine=0x6e9437, grape=0x5a2b5c,
    leaf=0x4f8a35, leafL=0x77a345, pine=0x2c5a30, pineL=0x3d6e3a, trunk=0x7c5c3c, palmT=0x9a7a55, white=0xf8f6f1,
    sand=0xead8ad, ink=0x2a2d33, red=0xD62839, wool=0xf3f0e8, horse=0x6b4630, horseD=0x3b2a20, plinth=0xe9e5dc,
    cloud=0xf0f3f7, tractor=0xD62839, tyre=0x1b1d22, sail=0xfbfaf6, hull=0x1f3a5f, deck=0xc89b62, yellow=0xf2c14e, blue=0x2f6db5,
    road=0xd6cfc0, path=0xc9bfa9, asphalt=0x9a9a9e, jeep=0x4f5f42, rockG=0x9a948a, rockD=0x7c7670, flower=0xe25a7a, teal=0x3f8f8a,
)
for k, v in PALETTE.items(): make_mat(k, v)
make_mat('gold', 0xe0ad37, rough=0.3, metal=0.9)
make_mat('steel', 0xc9cdd3, rough=0.3, metal=0.8)
make_mat('glass', 0x9fcfe8, rough=0.15, metal=0.2)
make_mat('glassD', 0x6f9fbe, rough=0.15, metal=0.2)
make_mat('water', 0x4f86b5, rough=0.2)
make_mat('lamp', 0xfff1b8, rough=0.5, emit=4.0)
make_mat('borderline', 0xffffff, rough=0.6, emit=0.35)
make_mat('land', 0xffffff, rough=0.95, vcol=True)
make_mat('sea', 0xffffff, rough=0.22, vcol=True); MATS['sea'].node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value = 0.7
make_mat('highlight', 0xD62839, rough=0.8, emit=1.2); _hl = MATS['highlight']; _hn = _hl.node_tree.nodes.new('ShaderNodeVertexColor'); _hn.layer_name = 'Col'
_hl.node_tree.links.new(_hn.outputs['Alpha'], _hl.node_tree.nodes['Principled BSDF'].inputs['Alpha']); _hl.surface_render_method = 'BLENDED'
_hm = _hl.node_tree.nodes.new('ShaderNodeMix'); _hm.data_type = 'RGBA'; _hm.blend_type = 'MULTIPLY'; _hm.inputs['Factor'].default_value = 1.0
_hm.inputs[6].default_value = (*srgb(0xD62839), 1); _hl.node_tree.links.new(_hn.outputs['Color'], _hm.inputs[7]); _hl.node_tree.links.new(_hm.outputs[2], _hl.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
make_mat('pick', 0xffffff, rough=1.0); _pk = MATS['pick']; _pk.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.0; _pk.surface_render_method = 'BLENDED'; _pk.use_transparent_shadow = True if hasattr(_pk, 'use_transparent_shadow') else None
# the big pieces are closed and correctly wound, so they can cull back faces; the small kit stays two-sided
for k in ('land', 'sea', 'plinth'): MATS[k].use_backface_culling = True

# ------------------------------------------------------------------------------------------------ the land
BANDS = [(0, 0xb4bb72), (150, 0x9fb162), (500, 0x7f9d4c), (1000, 0x5b8439), (1700, 0x66803f), (2250, 0x86896c),
         (2750, 0x9b968c), (3150, 0xe6ebf0), (3600, 0xf2f5f8)]
BUMPS = {(829, 413): (260, 12), (651, 226): (170, 10), (606, 341): (60, 7)}  # (map x, y): (+metres, radius): Sighnaghi's hill, Gergeti's knoll, Uplistsikhe's rock
PEAK_FROM, PEAK_K = 2300, 0.3               # the high Caucasus gets a little taller still, for drama

# Each stop sits on a gently levelled shelf, like a diorama base, so its buildings stand on the valley floor
# rather than climbing the peaks. (centre offset in landmark units, levelling strength, inner/outer radius in map units)
SHELF = {'Tbilisi': ((0.03, -0.01), 0.55, 16, 42), 'Telavi': ((0.06, 0.03), 0.55, 20, 48), 'Omalo': ((-0.05, 0.0), 0.7, 14, 38),
         'Kutaisi': ((0.06, -0.04), 0.5, 18, 44), 'Mestia': ((0.04, -0.02), 0.75, 13, 36), 'Batumi': ((0.08, 0.02), 0.45, 10, 26),
         (469, 188): ((0, 0), 0.7, 9, 24),   # Ushguli
         (741, 264): ((0, 0), 0.7, 8, 20),   # Dartlo
         'Stepantsminda': ((0.0, 0.02), 0.6, 10, 26), 'Vardzia': ((0.0, 0.0), 0.5, 10, 24), 'Uplistsikhe': ((-0.02, 0.0), 0.5, 12, 28)}
def shelf(X, Y, H):
    H = H.copy()
    for name, ((ox, oz), wmax, r0, r1) in SHELF.items():
        r0, r1 = r0 * LMK, r1 * LMK
        p = G['places'][name] if isinstance(name, str) else name; qx, qy = p[0] + ox * LM / S, p[1] + oz * LM / S
        d = np.hypot(X - qx, Y - qy)
        near = d < r0
        if not near.any(): continue
        target = np.percentile(H[near], 25)
        t = np.clip((d - r0) / (r1 - r0), 0, 1); w = wmax * (1 - t * t * (3 - 2 * t))
        H = H * (1 - w) + target * w
    for (qx, qy), (dh, r) in BUMPS.items():
        t = np.clip(np.hypot(X - qx, Y - qy) / r, 0, 1); H = H + dh * (1 - t * t * (3 - 2 * t))
    return H + np.maximum(0, H - PEAK_FROM) * PEAK_K
BANDS = [(h, np.array(srgb(c))) for h, c in BANDS]
ROCK, EARTH, PLINTH = np.array(srgb(0x8f897d)), np.array(srgb(0x6e5c49)), np.array(srgb(0xe9e5dc))
FIELDS = [np.array(srgb(c)) for c in (0xc8c27a, 0x93ad57, 0xa9b86a, 0x7e9a48, 0xd2c98a)]

def land_color(h, slope, x=0.0, y=0.0):
    k = 1
    while k < len(BANDS) - 1 and h >= BANDS[k][0]: k += 1
    t = max(0.0, min(1.0, (h - BANDS[k - 1][0]) / (BANDS[k][0] - BANDS[k - 1][0]))); t = t * t * (3 - 2 * t)
    c = BANDS[k - 1][1] * (1 - t) + BANDS[k][1] * t
    if h < 700 and slope < 0.12:  # a patchwork of fields on the flat lowlands
        cell = (int(math.floor(x / 6.5)) * 73856093) ^ (int(math.floor(y / 5.0)) * 19349663)
        f = FIELDS[cell % len(FIELDS)]
        c = c * 0.6 + f * 0.4
    if h > 1400:
        r = max(0.0, min(1.0, (slope - 0.36) * 2.8)) * min(1.0, (h - 1400) / 600) * 0.95
        c = c * (1 - r) + ROCK * r
    return c

def resample(poly):
    out = []
    n = len(poly)
    for k in range(n):
        a, b = poly[k], poly[(k + 1) % n]
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        st = float(step_of((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)[0])
        m = max(1, math.ceil(L / st))
        for s in range(m): out.append((a[0] + (b[0] - a[0]) * s / m, a[1] + (b[1] - a[1]) * s / m))
    return out

def hex_points(poly, step_fn, steps, x0, x1, y0, y1, margin=0.45, jit=0.24):
    pts = []
    for st in steps:
        ys = np.arange(y0, y1, st * 0.866)
        xs = np.arange(x0, x1, st)
        X, Y = np.meshgrid(xs, ys)
        X = X + (np.arange(len(ys))[:, None] % 2) * st / 2
        X = X.ravel() + np.array([rng.uniform(-jit, jit) * st for _ in range(X.size)])
        Y = Y.ravel() + np.array([rng.uniform(-jit, jit) * st for _ in range(Y.size)])
        keep = step_fn(X, Y) == st
        X, Y = X[keep], Y[keep]
        keep = pip(X, Y, poly); X, Y = X[keep], Y[keep]
        keep = dist_poly(X, Y, poly) > margin * st; X, Y = X[keep], Y[keep]
        pts += list(zip(X.tolist(), Y.tolist()))
    return pts

def cdt(border, interior):
    nb = len(border)
    coords = [Vector(p) for p in border + interior]
    vs, _, fs, ov, _, _ = delaunay_2d_cdt(coords, [], [list(range(nb))], 1, 1e-7, True)
    bmap = {}
    for i, o in enumerate(ov):
        for k in o:
            if k < nb: bmap[k] = i
    return [(v.x, v.y) for v in vs], fs, [bmap[k] for k in range(nb)]

def orient_up(V, faces):
    out = []
    for f in faces:
        a, b, c = V[f[0]], V[f[1]], V[f[2]]
        if (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0: f = f[::-1]
        out.append(tuple(f))
    return out

def build_mesh(name, verts, faces, loop_cols=None, mats=None, mat_idx=None, parent=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    for m in (mats or []): me.materials.append(MATS[m])
    if mat_idx is not None: me.polygons.foreach_set('material_index', mat_idx)
    if loop_cols is not None:
        ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
        ca.data.foreach_set('color', np.asarray(loop_cols, np.float32).ravel())
    me.update()
    ob = bpy.data.objects.new(name, me); COLL.objects.link(ob)
    if parent: ob.parent = parent
    return ob

ROOT_EMPTY = bpy.data.objects.new('Georgia', None); COLL.objects.link(ROOT_EMPTY)

print('building land...')
# Georgia is not cut out as a cliff: the land runs on past the border into the neighbouring countries (muted), their
# relief easing down to a smooth rounded outline, and the Black Sea fills the outline to the west. A cream frame with
# an earth band holds it all, and a thin white line marks the border.
def smooth_loop(P, win, iters=1):
    P = np.asarray(P, float)
    for _ in range(iters): P = sum(np.roll(P, d, axis=0) for d in range(-win, win + 1)) / (2 * win + 1)
    return P

def even_loop(P, step):
    P = np.asarray(P, float); seg = np.roll(P, -1, 0) - P; L = np.hypot(seg[:, 0], seg[:, 1])
    cum = np.concatenate(([0], np.cumsum(L))); n = max(8, int(cum[-1] / step))
    s = np.linspace(0, cum[-1], n, endpoint=False); i = np.searchsorted(cum, s, side='right') - 1
    return P[i] + seg[i] * ((s - cum[i]) / np.maximum(L[i], 1e-9))[:, None]

def dist_open(px, py, line):
    d = np.full(np.shape(px), 1e9)
    for a, b in zip(line, line[1:]):
        ex, ey = b[0] - a[0], b[1] - a[1]; L2 = ex * ex + ey * ey or 1e-12
        t = np.clip(((px - a[0]) * ex + (py - a[1]) * ey) / L2, 0, 1)
        d = np.minimum(d, np.hypot(px - a[0] - t * ex, py - a[1] - t * ey))
    return d

def loop_normals(P):
    t = np.roll(P, -1, 0) - np.roll(P, 1, 0); n = np.column_stack((t[:, 1], -t[:, 0])); n /= np.linalg.norm(n, axis=1)[:, None]
    if pip(P[:, 0] + n[:, 0] * 2, P[:, 1] + n[:, 1] * 2, RINGO).mean() > 0.5: n = -n  # make them point away from Georgia
    return n

R2 = even_loop(RINGO, 2.0)
marg = np.where(dist_open(R2[:, 0], R2[:, 1], COAST) < 0.6, M_SEA, M_LAND).astype(float)
marg = smooth_loop(marg[:, None], 20, 3)[:, 0]
Ps = smooth_loop(R2, 10, 3)
OUTL = smooth_loop(Ps + loop_normals(Ps) * marg[:, None], 6, 3)
OUTL = even_loop(OUTL, SURR * 0.9)
_rin = np.array(RINGO)
print('  outline: %d pts, Georgia inside: %s, closest approach %.1f' % (len(OUTL), bool(pip(_rin[:, 0], _rin[:, 1], OUTL).all()), dist_poly(_rin[:, 0], _rin[:, 1], [tuple(p) for p in OUTL]).min()))
OUTL_L = [tuple(p) for p in OUTL]

BORDER = resample(RINGO)
rx0, rx1 = min(p[0] for p in RINGO), max(p[0] for p in RINGO)
ry0, ry1 = min(p[1] for p in RINGO), max(p[1] for p in RINGO)
interior = hex_points(BORDER, step_of, (FINE, MID, COARSE), rx0, rx1, ry0, ry1)
surr_step = lambda X, Y: np.where(step_of(X, Y) == COARSE, SURR, step_of(X, Y))
ox0, oy0 = OUTL.min(0); ox1, oy1 = OUTL.max(0)
_sur = hex_points(OUTL_L, surr_step, (FINE, MID, SURR), ox0, ox1, oy0, oy1)
_sur = np.array(_sur); _st = surr_step(_sur[:, 0], _sur[:, 1])
_keep = (~pip(_sur[:, 0], _sur[:, 1], BORDER)) & (dist_poly(_sur[:, 0], _sur[:, 1], BORDER) > 0.45 * _st)
surround = [tuple(p) for p in _sur[_keep]]

nb, no = len(BORDER), len(OUTL_L)
coords = [Vector(p) for p in BORDER + OUTL_L + interior + surround]
_vs, _, _fs, _ov, _, _ = delaunay_2d_cdt(coords, [(k, (k + 1) % nb) for k in range(nb)], [list(range(nb, nb + no))], 1, 1e-7, True)
VX = np.array([v.x for v in _vs]); VY = np.array([v.y for v in _vs]); NV = len(_vs)
orig = [min(o) if o else -1 for o in _ov]
LB = [0] * nb; OB = [0] * no
for i, o in enumerate(orig):
    if 0 <= o < nb: LB[o] = i
    elif nb <= o < nb + no: OB[o - nb] = i
in_g = pip(VX, VY, BORDER); in_g[LB] = True
d_b = dist_poly(VX, VY, BORDER); d_o = dist_poly(VX, VY, OUTL_L)
t_out = np.where(in_g, 0.0, d_b / np.maximum(d_b + d_o, 1e-9))
_tt = np.clip(t_out / 0.95, 0, 1); fall = 1 - _tt * _tt * (3 - 2 * _tt)
H_raw = np.maximum(0, h_at(VX, VY))
is_sea = (~in_g) & (H_raw < 1) & (VX < 340)
VH = shelf(VX, VY, H_raw) * fall
H_raw = H_raw + np.maximum(0, H_raw - PEAK_FROM) * PEAK_K
VZ = np.where(is_sea, SEA_Y, BASE + VH * MPU)
VB = np.column_stack((wx(VX), -wz(VY), VZ))
ALLF = orient_up(VB, [tuple(f) for f in _fs])

NAVY = [np.array(srgb(c)) for c in (0x34587e, 0x2f5278, 0x3a6087, 0x31557b)]
SHALLOW = np.array(srgb(0x5b8fb8))
parts = {'Land': ([], []), 'Surround': ([], []), 'Sea': ([], [])}
_FA = np.array(ALLF)
_cin = pip(VX[_FA].mean(1), VY[_FA].mean(1), BORDER) & in_g[_FA].all(1)
for fi, f in enumerate(ALLF):
    mx, my = VX[list(f)].mean(), VY[list(f)].mean()
    a, b, c = VB[f[0]], VB[f[1]], VB[f[2]]
    n = np.cross(b - a, c - a); n /= (np.linalg.norm(n) or 1); slope = 1 - abs(n[2])
    hc = VH[list(f)].mean()
    if _cin[fi]:
        key = 'Land'; col = land_color(hc, slope, mx, my) * (1 + rng.uniform(-0.035, 0.035))
    elif is_sea[list(f)].any() and mx < 340:
        key = 'Sea'; dsh = float(dist_open(np.array([mx]), np.array([my]), COAST)[0])
        ksh = min(1.0, dsh / 11.0) ** 0.8; col = SHALLOW * (1 - ksh) + NAVY[rng.randrange(4)] * ksh
    else:
        key = 'Surround'
        col = land_color(H_raw[list(f)].mean(), slope, mx, my)
        grey = col @ np.array([0.3, 0.59, 0.11])
        col = col * 0.8 + grey * 0.2
        col = col * 0.92 + PLINTH * 0.08
        fade = np.clip((t_out[list(f)].mean() - 0.72) / 0.28, 0, 1)
        col = col * (1 - 0.4 * fade) + PLINTH * 0.4 * fade
        col = col * (1 + rng.uniform(-0.025, 0.025))
    parts[key][0].append(f); parts[key][1].append(np.append(np.clip(col, 0, 1), 1.0))

def sub_mesh(name, faces, fcols, mats):
    used = sorted({i for f in faces for i in f}); remap = {o: k for k, o in enumerate(used)}
    loop_cols = [c for f, c in zip(faces, fcols) for _ in f]
    ob = build_mesh(name, VB[used], [tuple(remap[i] for i in f) for f in faces], loop_cols, mats, parent=ROOT_EMPTY)
    return ob, used
land, _ = sub_mesh('Land', *parts['Land'], ['land'])
sub_mesh('Surround', *parts['Surround'], ['land'])
print('  land: %d tris, surround: %d tris, sea: %d tris' % (len(parts['Land'][0]), len(parts['Surround'][0]), len(parts['Sea'][0])))
_solid = parts['Land'][0] + parts['Surround'][0]
BVH = BVHTree.FromPolygons([tuple(v) for v in VB], _solid)

def ground3(X, Z):
    """three.js world X,Z -> surface height Y on the faceted land"""
    hit = BVH.ray_cast(Vector((X, -Z, 5.0)), Vector((0, 0, -1)))
    if hit[0] is not None: return hit[0].z
    return float(y_at(X / S + cx, Z / S + cy))

# the frame: an earth (or water) band under the outline, a cream ledge, then the plinth wall down to the base
print('building frame...')
OBn = loop_normals(np.array([(VX[i], VY[i]) for i in OB]))
BAND_Z, RIM = BASE - 0.05, 5.5
fv, ff, fc = [], [], []
def _c(hexv, k=1.0): return np.append(np.clip(np.array(srgb(hexv)) * k, 0, 1), 1.0)
for k in range(no):
    i = OB[k]; P = (VX[i], VY[i]); n = OBn[k]; sea_k = bool(is_sea[i])
    top_c, bot_c = (_c(0x4f7eab), _c(0x2b4a6c)) if sea_k else (_c(0x7a6450), _c(0x5a4636))
    ring = [(wx(P[0]), -wz(P[1]), VZ[i]), (wx(P[0]), -wz(P[1]), BAND_Z),
            (wx(P[0] + n[0] * RIM), -wz(P[1] + n[1] * RIM), BAND_Z), (wx(P[0] + n[0] * RIM), -wz(P[1] + n[1] * RIM), SLAB_BOTTOM)]
    fv.append((ring, (top_c, bot_c)))
V_f, F_f, C_f = [], [], []
for k in range(no):
    (ra, ca), (rb, cb) = fv[k], fv[(k + 1) % no]
    for seg, (u, v), col in (('band', (0, 1), None), ('ledge', (1, 2), _c(0xf1ede4)), ('wall', (2, 3), None)):
        q = [ra[u], ra[v], rb[v], rb[u]]
        if seg == 'band': cq = [ca[0], ca[1], cb[1], cb[0]]
        elif seg == 'wall': cq = [_c(0xe9e5dc), _c(0xcfc9bc), _c(0xcfc9bc), _c(0xe9e5dc)]
        else: cq = [col] * 4
        qa = np.array(q); nr = np.cross(qa[1] - qa[0], qa[2] - qa[0])
        want = np.array([0, 0, 1.0]) if seg == 'ledge' else np.array([OBn[k][0], -OBn[k][1], 0])
        if np.dot(nr, want) < 0: q, cq = q[::-1], cq[::-1]
        base_i = len(V_f); V_f += q; F_f.append(tuple(range(base_i, base_i + 4))); C_f += cq
_bot = [len(V_f) + k for k in range(no)]
V_f += [fv[k][0][3] for k in range(no)]
_area = sum(V_f[a][0] * V_f[b][1] - V_f[b][0] * V_f[a][1] for a, b in zip(_bot, _bot[1:] + _bot[:1]))
F_f.append(tuple(_bot if _area < 0 else _bot[::-1])); C_f += [_c(0xcfc9bc)] * no
build_mesh('Frame', V_f, F_f, C_f, ['land'], parent=ROOT_EMPTY)

# the border: a thin white line draped over the land (not along the coast)
bv, bf = [], []
_bp = np.array(BORDER); _bn = loop_normals(_bp)
_coast = dist_open(_bp[:, 0], _bp[:, 1], COAST) < 0.6
prev = None
for k in range(len(_bp) + 1):
    kk = k % len(_bp)
    if _coast[kk]: prev = None; continue
    P = _bp[kk]; n = _bn[kk]; cur = len(bv)
    for s_ in (-0.4, 0.4):
        X3, Z3 = wx(P[0] + n[0] * s_), wz(P[1] + n[1] * s_)
        bv.append((X3, -Z3, ground3(X3, Z3) + 0.0035))
    if prev is not None:
        q = (prev, prev + 1, cur + 1, cur)
        a_, b_, c_ = (np.array(bv[i]) for i in q[:3])
        bf.append(q if np.cross(b_ - a_, c_ - a_)[2] > 0 else q[::-1])
    prev = cur
build_mesh('BorderLine', bv, bf, mats=['borderline'], parent=ROOT_EMPTY)

# ------------------------------------------------------------------------------------------------ the sea
print('building sea...')
sea, s_used = sub_mesh('Sea', *parts['Sea'], ['sea'])
# a slow travelling swell (two shape keys, sin and cos, driven 90 degrees apart); every vertex the land or the frame
# shares stays put, so no gaps open at the shore or along the edge
pinned = {i for f in _solid for i in f} | set(OB)
from mathutils.kdtree import KDTree
kd = KDTree(len(pinned))
for j, i in enumerate(pinned): kd.insert((VX[i], VY[i], 0), j)
kd.balance()
SXs = VX[s_used]; SYs = VY[s_used]
fall = np.array([0.0 if i in pinned else min(1.0, kd.find((VX[i], VY[i], 0))[2] / 12.0) ** 1.5 for i in s_used])
phase = SXs * (2 * PI / 34.0) + SYs * (2 * PI / 61.0)
AMP = 0.0055
sea.shape_key_add(name='Basis', from_mix=False)
for nm, fn in (('SwellA', np.sin), ('SwellB', np.cos)):
    kb = sea.shape_key_add(name=nm, from_mix=False); kb.slider_min = -1.0; kb.slider_max = 1.0
    co = np.empty(len(s_used) * 3, np.float32); kb.data.foreach_get('co', co); co = co.reshape(-1, 3)
    co[:, 2] += AMP * fall * fn(phase)
    kb.data.foreach_set('co', co.ravel())
keys = sea.data.shape_keys.key_blocks
for f in range(0, LOOP + 1, 6):
    w = 2 * PI * 2 * f / LOOP
    keys['SwellA'].value = math.cos(w); keys['SwellA'].keyframe_insert('value', frame=f)
    keys['SwellB'].value = -math.sin(w); keys['SwellB'].keyframe_insert('value', frame=f)

# ------------------------------------------------------------------------------------------------ geometry kit (three.js frame: y up)
class Geo:
    __slots__ = ('V', 'F')
    def __init__(s, V, F): s.V = np.asarray(V, np.float64).reshape(-1, 3); s.F = F

def _rot(rx=0, ry=0, rz=0):
    c, s = math.cos(rx), math.sin(rx); Rx = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    c, s = math.cos(ry), math.sin(ry); Ry = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    c, s = math.cos(rz), math.sin(rz); Rz = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    return Rx @ Ry @ Rz

def mat4(x=0, y=0, z=0, rx=0, ry=0, rz=0, s=1):
    M = np.eye(4); sc = np.array(s if isinstance(s, (list, tuple)) else (s, s, s), float)
    M[:3, :3] = _rot(rx, ry, rz) * sc; M[:3, 3] = (x, y, z); return M

def T(g, x=0, y=0, z=0, rx=0, ry=0, rz=0, s=1):
    M = mat4(x, y, z, rx, ry, rz, s); return Geo(g.V @ M[:3, :3].T + M[:3, 3], g.F)

def TP(parts, **kw): return [(T(g, **kw), m) for g, m in parts]

def box(w, h, d):
    x, z = w / 2, d / 2
    return Geo([(-x, 0, -z), (x, 0, -z), (x, 0, z), (-x, 0, z), (-x, h, -z), (x, h, -z), (x, h, z), (-x, h, z)],
               [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)])

def cyl(rt, h, seg=8, rb=None):
    rb = rt if rb is None else rb
    V = [(rb * math.sin(i / seg * 2 * PI), 0, rb * math.cos(i / seg * 2 * PI)) for i in range(seg)]
    F = [tuple(range(seg))[::-1]]
    if rt > 1e-9:
        V += [(rt * math.sin(i / seg * 2 * PI), h, rt * math.cos(i / seg * 2 * PI)) for i in range(seg)]
        F += [(i, (i + 1) % seg, seg + (i + 1) % seg, seg + i) for i in range(seg)] + [tuple(range(seg, 2 * seg))]
    else:
        V.append((0, h, 0)); F += [(i, (i + 1) % seg, seg) for i in range(seg)]
    return Geo(V, F)

def cone(r, h, seg=8): return cyl(0, h, seg, r)

def ball(r, ws=8, hs=5):
    V = [(0, r, 0)]
    for j in range(1, hs):
        th = j / hs * PI
        V += [(r * math.sin(th) * math.sin(i / ws * 2 * PI), r * math.cos(th), r * math.sin(th) * math.cos(i / ws * 2 * PI)) for i in range(ws)]
    V.append((0, -r, 0)); bot = len(V) - 1
    F = [(0, 1 + i, 1 + (i + 1) % ws) for i in range(ws)]
    for j in range(hs - 2):
        a, b = 1 + j * ws, 1 + (j + 1) * ws
        F += [(a + i, b + i, b + (i + 1) % ws, a + (i + 1) % ws) for i in range(ws)]
    last = 1 + (hs - 2) * ws
    F += [(last + i, bot, last + (i + 1) % ws) for i in range(ws)]
    return Geo(V, F)

def dome(r, ws=10, hs=3):
    V = [(0, r, 0)]
    for j in range(1, hs + 1):
        th = j / hs * PI / 2
        V += [(r * math.sin(th) * math.sin(i / ws * 2 * PI), r * math.cos(th), r * math.sin(th) * math.cos(i / ws * 2 * PI)) for i in range(ws)]
    F = [(0, 1 + i, 1 + (i + 1) % ws) for i in range(ws)]
    for j in range(hs - 1):
        a, b = 1 + j * ws, 1 + (j + 1) * ws
        F += [(a + i, b + i, b + (i + 1) % ws, a + (i + 1) % ws) for i in range(ws)]
    F.append(tuple(range(1 + (hs - 1) * ws, 1 + hs * ws))[::-1])
    return Geo(V, F)

def gable(w, h, d):
    x, z = w / 2, d / 2
    return Geo([(-x, 0, -z), (x, 0, -z), (x, 0, z), (-x, 0, z), (0, h, -z), (0, h, z)],
               [(0, 1, 2, 3), (1, 4, 5, 2), (3, 5, 4, 0), (0, 4, 1), (2, 5, 3)])

def sq(rt, rb, h): return T(cyl(rt * SQ2, h, 4, rb * SQ2), ry=PI / 4)

def lathe(profile, seg=10, phi0=0.0, phil=2 * PI):
    closed = phil >= 2 * PI - 1e-6
    cols = seg if closed else seg + 1
    V, idx = [], []
    for (px, py) in profile:
        if px < 1e-9: idx.append([len(V)] * cols); V.append((0, py, 0)); continue
        row = []
        for i in range(cols):
            a = phi0 + i / seg * phil; row.append(len(V)); V.append((px * math.sin(a), py, px * math.cos(a)))
        idx.append(row)
    F = []
    for j in range(len(profile) - 1):
        for i in range(seg):
            i2 = (i + 1) % cols
            q = [idx[j][i], idx[j][i2], idx[j + 1][i2], idx[j + 1][i]]
            q = [v for k, v in enumerate(q) if v not in q[:k]]
            if len(q) >= 3: F.append(tuple(q))
    return Geo(V, F)

def tube(pts, r, seg=5, caps=True):
    P = np.asarray(pts, float); n = len(P)
    tg = np.gradient(P, axis=0); tg /= np.linalg.norm(tg, axis=1)[:, None]
    up = np.array([0, 1.0, 0]) if abs(tg[0][1]) < 0.9 else np.array([1.0, 0, 0])
    nrm = np.cross(tg[0], up); nrm /= np.linalg.norm(nrm)
    V = []
    for k in range(n):
        if k: nrm = nrm - tg[k] * np.dot(nrm, tg[k]); nrm /= (np.linalg.norm(nrm) or 1)
        bn = np.cross(tg[k], nrm)
        for i in range(seg):
            a = i / seg * 2 * PI; V.append(tuple(P[k] + r * (math.cos(a) * nrm + math.sin(a) * bn)))
    F = [(k * seg + i, k * seg + (i + 1) % seg, (k + 1) * seg + (i + 1) % seg, (k + 1) * seg + i) for k in range(n - 1) for i in range(seg)]
    if caps: F += [tuple(range(seg))[::-1], tuple(range((n - 1) * seg, n * seg))]
    return Geo(V, F)

def torus(R, r, rseg=5, tseg=18, arc=2 * PI):
    closed = arc >= 2 * PI - 1e-6; cols = tseg if closed else tseg + 1
    V = []
    for j in range(cols):
        u = j / tseg * arc
        for i in range(rseg):
            v = i / rseg * 2 * PI
            V.append(((R + r * math.cos(v)) * math.cos(u), (R + r * math.cos(v)) * math.sin(u), r * math.sin(v)))
    F = [(j * rseg + i, j * rseg + (i + 1) % rseg, ((j + 1) % cols) * rseg + (i + 1) % rseg, ((j + 1) % cols) * rseg + i)
         for j in range(tseg) for i in range(rseg)]
    return Geo(V, F)

def _leaf(L, w):
    g = T(cone(w, L, 4), y=-L / 2)
    g = T(g, rz=-PI / 2)
    g = T(g, x=L / 2)
    return Geo(g.V * np.array([1, 0.22, 1]), g.F)

# ------------------------------------------------------------------------------------------------ emitting into region groups
C4 = np.array([[1, 0, 0, 0], [0, 0, -1, 0], [0, 1, 0, 0], [0, 0, 0, 1.0]]); C4i = C4.T
def to_bl(M): return C4 @ M @ C4i
def v_bl(V): return np.column_stack((V[:, 0], -V[:, 2], V[:, 1]))

BUCKET = {}  # group -> list of (Vb, F, mat)
def emit(group, mat, g, M=None):
    V = g.V if M is None else g.V @ M[:3, :3].T + M[:3, 3]
    BUCKET.setdefault(group, []).append((v_bl(V), g.F, mat))

def stop3(name): p = G['places'][name]; return wx(p[0]), wz(p[1])

def placeM(X0, Z0, dx, dz, ry=0, s=1, y=0, sink=0.002, foot=0.01):
    X, Z = X0 + dx * LM, Z0 + dz * LM
    if not inside_map(X / S + cx, Z / S + cy): return None
    f = foot * LM; gy = ground3(X, Z)
    if f > 0: gy = min(gy, ground3(X + f, Z + f), ground3(X - f, Z + f), ground3(X + f, Z - f), ground3(X - f, Z - f))
    return mat4(X, gy + (y - sink) * LM, Z, ry=ry, s=LM * s)

def base_of(group): return group.split(':')[0]

def place(group, parts, X0, Z0, dx, dz, **kw):
    M = placeM(X0, Z0, dx, dz, **kw)
    if M is None: return None
    for g, m in parts: emit(group, m, g, M)
    return M

REGION = {}  # group -> (empty object, world translation 4x4 in Blender)
def region_empty(group, X0, Z0):
    e = bpy.data.objects.new(group, None); COLL.objects.link(e); e.parent = ROOT_EMPTY
    e.location = (X0, -Z0, ground3(X0, Z0)); e.empty_display_size = 0.2
    M = np.eye(4); M[:3, 3] = e.location; REGION[group] = (e, M)
    return e

def mesh_from(name, items, origin=None):
    Vs, Fs, mats, mi, off = [], [], [], [], 0
    for Vb, F, m in items:
        if m not in mats: mats.append(m)
        k = mats.index(m)
        Vs.append(Vb); Fs += [tuple(i + off for i in f) for f in F]; mi += [k] * len(F); off += len(Vb)
    V = np.vstack(Vs)
    if origin is not None: V = V - origin
    me = bpy.data.meshes.new(name); me.from_pydata(V.tolist(), [], Fs)
    for m in mats: me.materials.append(MATS[m])
    me.polygons.foreach_set('material_index', mi)
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    wi = mats.index('water') if 'water' in mats else -1
    for f in bm.faces:  # open ribbons of water must face the sky
        if f.material_index == wi and f.normal.z < 0: f.normal_flip()
    bm.to_mesh(me); bm.free()
    me.update(); return me

def anim_obj(name, parts, M3, group, parent=None):
    """an object of its own (so it can move), modelled in local units, set down at M3"""
    me = mesh_from(name, [(v_bl(g.V), g.F, m) for g, m in parts])
    ob = bpy.data.objects.new(name, me); COLL.objects.link(ob)
    pe, PM = REGION[base_of(group)]
    if parent is None:
        ob.parent = pe; ob.matrix_basis = Matrix((np.linalg.inv(PM) @ to_bl(M3)).tolist())
    else:
        ob.parent = parent; ob.matrix_basis = Matrix(M3.tolist())  # M3 already in the parent's (Blender) frame
    ob.rotation_mode = 'XYZ'
    return ob

def anim_empty(name, Mb, group, parent=None):
    e = bpy.data.objects.new(name, None); COLL.objects.link(e); e.empty_display_size = 0.05
    pe, PM = REGION[base_of(group)]
    if parent is None: e.parent = pe; e.matrix_basis = Matrix((np.linalg.inv(PM) @ Mb).tolist())
    else: e.parent = parent; e.matrix_basis = Matrix(Mb.tolist())
    e.rotation_mode = 'XYZ'; return e

# animation helpers (all loop over LOOP frames)
def k_spin(ob, axis, turns=1.0):
    base = ob.rotation_euler[axis]
    ob.keyframe_insert('rotation_euler', index=axis, frame=0)
    ob.rotation_euler[axis] = base + 2 * PI * turns; ob.keyframe_insert('rotation_euler', index=axis, frame=LOOP)
    ob.rotation_euler[axis] = base

def k_wave(ob, path, axis, amp, cycles=1, phase=0.0, step=8):
    base = getattr(ob, path)[axis]
    for f in range(0, LOOP + 1, step):
        getattr(ob, path)[axis] = base + amp * math.sin(2 * PI * cycles * f / LOOP + phase)
        ob.keyframe_insert(path, index=axis, frame=f)
    getattr(ob, path)[axis] = base

def k_scale(ob, axis, lo, hi, cycles=1, phase=0.0, step=6):
    base = ob.scale[axis]
    for f in range(0, LOOP + 1, step):
        ob.scale[axis] = base * (lo + (hi - lo) * (0.5 + 0.5 * math.sin(2 * PI * cycles * f / LOOP + phase)))
        ob.keyframe_insert('scale', index=axis, frame=f)

def k_path(ob, group, fn, step=6, yaw=True, yaw_off=0.0, ground=True, lift=0.0):
    """fn(u in [0,1]) -> three.js world (X, Z) or (X, Y, Z); the object follows it, facing its direction of travel"""
    pe, PM = REGION[base_of(group)]; o = PM[:3, 3]
    us = [f / LOOP for f in range(0, LOOP + 1, step)]
    pts = [fn(u) for u in us]
    P3 = []
    for p in pts:
        if len(p) == 2: X, Z = p; Y = (ground3(X, Z) if ground else 0) + lift
        else: X, Y, Z = p
        P3.append((X, Y, Z))
    ang = []
    for k in range(len(P3)):
        a, b = P3[max(0, k - 1)], P3[min(len(P3) - 1, k + 1)]
        ang.append(math.atan2(-(b[2] - a[2]), b[0] - a[0]))
    ang = np.unwrap(ang)
    for k, f in enumerate(range(0, LOOP + 1, step)):
        X, Y, Z = P3[k]
        ob.location = (X - o[0], -Z - o[1], Y - o[2]); ob.keyframe_insert('location', frame=f)
        if yaw: ob.rotation_euler[2] = ang[k] + yaw_off; ob.keyframe_insert('rotation_euler', index=2, frame=f)

# ------------------------------------------------------------------------------------------------ the kit
def pick(a): return a[rng.randrange(len(a))]

def house(w=0.022, d=0.017, h=0.015, wall='stone', roof='roof', balcony=False, chimney=False, flat_roof=False):
    P = [(box(w, h, d), wall)]
    if flat_roof: P.append((T(box(w * 1.12, 0.0028, d * 1.14), y=h), 'slate'))
    else: P.append((T(gable(d * 1.16, h * 0.5, w * 1.12), y=h, ry=PI / 2), roof))
    n = max(1, round(w / 0.008))
    for k in range(n):
        x = -w / 2 + (k + 0.5) * w / n
        P.append((T(box(0.003, 0.0045, 0.0008), x, h * 0.58, d / 2 + 0.0003), 'ink'))
        if h > 0.013: P.append((T(box(0.003, 0.0045, 0.0008), x, h * 0.18, d / 2 + 0.0003), 'ink'))
    if balcony:
        P.append((T(box(w * 0.9, 0.0016, 0.006), 0, h * 0.42, d / 2 + 0.003), 'wood'))
        P.append((T(box(w * 0.9, 0.0035, 0.0008), 0, h * 0.42 + 0.0016, d / 2 + 0.0058), 'wood'))
        for b in range(4): P.append((T(box(0.0009, h * 0.5, 0.0009), -w * 0.42 + b * w * 0.28, h * 0.42, d / 2 + 0.0058), 'wood'))
    if chimney: P.append((T(box(0.003, 0.008, 0.003), w * 0.25, h + 0.002, 0), 'stoneG' if roof == 'slate' else 'stoneD'))
    return P

def church(L, B, H, wall, roof, plinth=0, plinthMat='stoneD', drumR=None, drumH=None, domeH=None, domeMat=None):
    P = []
    if plinth: P.append((box(L * 1.35, plinth, L * 1.15), plinthMat))
    y0 = plinth
    P += [(T(box(L, H, B), y=y0), wall), (T(box(B, H, L * 0.78), y=y0), wall)]
    P.append((T(gable(B * 1.08, B * 0.36, L * 1.03), y=y0 + H, ry=PI / 2), roof))
    P.append((T(gable(B * 1.08, B * 0.36, L * 0.8), y=y0 + H), roof))
    P += [(T(cyl(B * 0.36, H * 0.86, 8), L / 2, y0, 0), wall), (T(cone(B * 0.39, B * 0.2, 8), L / 2, y0 + H * 0.86, 0), roof)]
    yb = y0 + H + B * 0.22; dr = drumR or B * 0.3; dh = drumH or H * 0.75; dmh = domeH or dr * 1.9
    P.append((T(box(B * 0.78, B * 0.24, B * 0.78), y=y0 + H), wall))
    P.append((T(cyl(dr, dh, 8), y=yb), wall))  # Georgian drums are polygonal: eight sides suits them
    for k in range(8):
        a = (k + 0.5) / 8 * 2 * PI
        P.append((T(box(0.0022, dh * 0.42, 0.0008), math.sin(a) * dr * 0.93, yb + dh * 0.32, math.cos(a) * dr * 0.93, ry=a), 'ink'))
    P.append((T(cone(dr * 1.18, dmh, 8), y=yb + dh), domeMat or roof))
    top = yb + dh + dmh
    P += [(T(box(0.0016, 0.011, 0.0016), y=top - 0.001), 'gold'), (T(box(0.0065, 0.0016, 0.0016), y=top + 0.006), 'gold')]
    for w in range(4):
        x = -L * 0.38 + w * L * 0.18
        if abs(x) < B * 0.6: continue
        P.append((T(box(0.0026, H * 0.42, 0.0008), x, y0 + H * 0.36, B / 2 + 0.0003), 'ink'))
        P.append((T(box(0.0026, H * 0.42, 0.0008), x, y0 + H * 0.36, -B / 2 - 0.0003), 'ink'))
    P.append((T(box(0.0008, H * 0.5, B * 0.22), -L / 2 - 0.0003, y0, 0), 'ink'))
    return P

def svan_tower(H):
    P = [(sq(0.0062, 0.0074, H - 0.012), 'stoneS')]
    P.append((T(box(0.0142, 0.012, 0.0142), y=H - 0.012), 'stoneS'))
    P.append((T(box(0.0156, 0.0016, 0.0156), y=H - 0.0122), 'stoneD'))
    P.append((T(gable(0.0166, 0.0085, 0.0166), y=H), 'slate'))
    for f in range(4):
        a = f * PI / 2; nx, nz = math.sin(a), math.cos(a)
        P.append((T(box(0.0026, 0.0048, 0.0008), nx * 0.0072, H - 0.008, nz * 0.0072, ry=a), 'ink'))
        P.append((T(box(0.0016, 0.004, 0.0008), nx * 0.0066, H * 0.48, nz * 0.0066, ry=a), 'ink'))
    return P

def tush_tower(H):
    P = [(sq(0.0095, 0.0115, H), 'stoneT')]
    for k in range(6):
        w = 0.0225 * (1 - k / 6.6); P.append((T(box(w, 0.0034, w), y=H + k * 0.0034), 'slate'))
    P.append((T(cone(0.0028, 0.012, 4), y=H + 6 * 0.0034, ry=PI / 4), 'slate'))
    for f in range(4):
        a = f * PI / 2
        for r in range(3): P.append((T(box(0.0028, 0.0045, 0.0008), math.sin(a) * 0.0104, H * (0.3 + r * 0.22), math.cos(a) * 0.0104, ry=a), 'ink'))
    return P

def pine(h=0.04):
    P = [(cyl(0.0014, h * 0.25, 5), 'trunk')]
    col = pick(['pine', 'pine', 'pineL'])
    for k in range(3): P.append((T(cone(0.0105 * (1 - k * 0.24) * h / 0.04, h * 0.42, 6), y=h * (0.18 + k * 0.24), ry=rng.random()), col))
    return P

def cypress(h=0.045): return [(T(ball(0.0058, 6, 4), y=0.006, s=(1, 1.2, 1)), 'pine'), (cone(0.0058, h, 6), 'pine')]

def tree(h=0.03):
    return [(cyl(0.0015, h * 0.5, 5), 'trunk'), (T(ball(h * 0.36, 7, 4), y=h * 0.68, s=(1, 0.86, 1), ry=rng.random()), pick(['leaf', 'leafL']))]

def palm(h, lean, ry=0.0):
    P = []; x = y = 0.0; segs = 6; seg = h / segs
    for k in range(segs):
        a = lean * (k + 1) / segs
        P.append((T(cyl(0.0013 - k * 0.00008, seg * 1.04, 5, 0.0016 - k * 0.00008), x, y, 0, rz=a), 'palmT'))
        x -= math.sin(a) * seg; y += math.cos(a) * seg
    for f in range(8):
        fa = f / 8 * 2 * PI + rng.random() * 0.3; up = 0.15 + rng.random() * 0.25
        l1, l2 = 0.015, 0.014; ex, ey = math.cos(up) * l1, math.sin(up) * l1
        for g in (T(_leaf(l1, 0.0042), rz=up), T(_leaf(l2, 0.0038), ex, ey, 0, rz=-0.55 - rng.random() * 0.3)):
            P.append((T(g, x, y, 0, ry=fa), pick(['leaf', 'leafL'])))
    for c in range(3): P.append((T(ball(0.0018, 5, 4), x + math.cos(c * 2.1) * 0.0022, y - 0.002, math.sin(c * 2.1) * 0.0022), 'trunk'))
    return TP(P, ry=ry)

def qvevri(s=1.0, lying=False):
    prof = [(0, 0), (0.007, 0.002), (0.015, 0.012), (0.018, 0.027), (0.016, 0.041), (0.0105, 0.052), (0.0085, 0.056), (0.0102, 0.0585), (0.0102, 0.061), (0.0, 0.061)]
    egg = lathe([(p[0] * s, p[1] * s) for p in prof], 10)
    mouth = T(cyl(0.0081 * s, 0.0008, 10), y=0.0606 * s)
    if not lying: return [(egg, 'clay'), (mouth, 'ink')]
    return [(T(egg, 0, 0.018 * s, -0.03 * s, rx=PI / 2 - 0.12), 'clay'), (T(mouth, 0, 0.018 * s, -0.03 * s, rx=PI / 2 - 0.12), 'ink')]

def sheep():
    P = [(T(ball(0.005, 7, 4), 0, 0.0065, 0, s=(1.35, 0.95, 1)), 'wool'), (T(box(0.0032, 0.0034, 0.0028), 0.0071, 0.0078, 0), 'ink')]
    for lx, lz in ((0.004, 0.0022), (0.004, -0.0022), (-0.004, 0.0022), (-0.004, -0.0022)): P.append((T(box(0.0011, 0.004, 0.0011), lx, 0, lz), 'ink'))
    return P

def horse(col='horse'):
    P = [(T(box(0.016, 0.0068, 0.0058), 0, 0.0095, 0), col), (T(box(0.0045, 0.011, 0.0042), 0.0075, 0.0128, 0, rz=-0.55), col),
         (T(box(0.0068, 0.0036, 0.0036), 0.0128, 0.0205, 0, rz=-0.35), col), (T(box(0.0015, 0.0085, 0.0013), -0.0086, 0.006, 0, rz=0.35), 'ink'),
         (T(box(0.0035, 0.007, 0.0012), 0.0062, 0.0175, 0, rz=-0.55), 'ink')]
    for lx, lz in ((0.0058, 0.0021), (0.0058, -0.0021), (-0.0058, 0.0021), (-0.0058, -0.0021)): P.append((T(box(0.0017, 0.0098, 0.0017), lx, 0, lz), col))
    return P

def wall_line(group, X0, Z0, pts, h=0.008, th=0.003, mat='stoneD', seg=0.014, closed=False, crenel=False):
    """a wall laid in short courses that each settle onto the ground, so it follows the slope"""
    P = list(pts) + ([pts[0]] if closed else [])
    for a, b in zip(P, P[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1]); n = max(1, round(L / seg)); ang = -math.atan2(b[1] - a[1], b[0] - a[0])
        for k in range(n):
            t = (k + 0.5) / n; parts = [(box(L / n + th, h + 0.006, th), mat)]
            if crenel: parts.append((T(box(0.0028, 0.003, th * 1.05), y=h + 0.006), mat))
            place(group, TP(parts, ry=ang), X0, Z0, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, foot=0, sink=0.006)

_SPOTS = {}
def spot(key, x0, w, z0, d, mind=0.032):
    """a random spot in a box that keeps clear of the earlier spots with the same key (no overlapping houses)"""
    used = _SPOTS.setdefault(key, [])
    best, bd = None, -1
    for _ in range(40):
        p = (x0 + rng.random() * w, z0 + rng.random() * d)
        m = min((math.hypot(p[0] - q[0], p[1] - q[1]) for q in used), default=1)
        if m >= mind: best = p; break
        if m > bd: best, bd = p, m
    used.append(best); return best

def catmull(pts, n):
    P = [np.array(p, float) for p in pts]; P = [P[0]] + P + [P[-1]]
    out = []
    segs = len(P) - 3
    for k in range(n + 1):
        u = k / n * segs; i = min(int(u), segs - 1); t = u - i
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return out

def river(group, X0, Z0, pts, wdt, n=48):
    C = catmull([(X0 + p[0] * LM, Z0 + p[1] * LM) for p in pts], n)
    half = wdt * LM / 2; V, F, prev = [], [], None
    for k, c in enumerate(C):
        a, b = C[max(0, k - 1)], C[min(len(C) - 1, k + 1)]; t = b - a; t /= (np.linalg.norm(t) or 1)
        nx, nz = -t[1], t[0]
        Lp, Rp = (c[0] + nx * half, c[1] + nz * half), (c[0] - nx * half, c[1] - nz * half)
        ok = inside_map(c[0] / S + cx, c[1] / S + cy)
        y = max(ground3(c[0], c[1]), ground3(*Lp), ground3(*Rp)) + 0.0022 * LM
        cur = None
        if ok: cur = (len(V), len(V) + 1); V += [(Lp[0], y, Lp[1]), (Rp[0], y, Rp[1])]
        if cur and prev: F.append((prev[0], prev[1], cur[1], cur[0]))
        prev = cur
    if F:
        g = Geo(V, F); g.F = [f if _up(g.V, f) else f[::-1] for f in F]
        # give it a little thickness so the normal recalculation keeps it facing up
        emit(group, 'water', g)

def _up(V, f):
    a, b, c = V[f[0]], V[f[1]], V[f[2]]
    return ((b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2])) > 0

# ------------------------------------------------------------------------------------------------ animated pieces
def flag(group, X0, Z0, dx=0.0, dz=0.0):
    M = placeM(X0, Z0, dx, dz, foot=0)
    if M is None: return
    emit(group, 'white', cyl(0.0011, 0.05, 5), M)
    pen = anim_obj(group + '_Flag', [(T(box(0.017, 0.011, 0.0012), 0.0085, 0, 0), 'red'), (T(gable(0.004, 0.006, 0.0012), 0.0185, 0.0055, 0, rz=-PI / 2), 'red')],
                   M @ mat4(y=0.039), group)
    k_wave(pen, 'rotation_euler', 2, 0.35, cycles=4, phase=rng.random() * 6)

def cable_car(group, X0, Z0, a, b, n_cab=2, col='red', sag=0.012):
    """two stations, a cable between them and cabins shuttling to and fro"""
    Ma = placeM(X0, Z0, a[0], a[1], foot=0.006); Mb_ = placeM(X0, Z0, b[0], b[1], foot=0.006)
    if Ma is None or Mb_ is None: return
    st = [(box(0.012, 0.012, 0.01), 'stoneD'), (T(box(0.015, 0.002, 0.013), y=0.012), 'slate'), (T(box(0.002, 0.02, 0.002), y=0.012), 'steel')]
    for M in (Ma, Mb_):
        for g, m in st: emit(group, m, g, M)
    A = Ma[:3, 3] + np.array([0, 0.032 * LM, 0]); B = Mb_[:3, 3] + np.array([0, 0.032 * LM, 0])
    def cab_pt(t): p = A + (B - A) * t; p[1] -= sag * LM * 4 * t * (1 - t); return p
    emit(group, 'ink', tube([cab_pt(t / 20) for t in range(21)], 0.0005 * LM, 4, caps=False))
    yaw = math.atan2(-(B[2] - A[2]), B[0] - A[0])
    for c in range(n_cab):
        cab = [(T(box(0.009, 0.0075, 0.0068), y=-0.0105), col), (T(box(0.0092, 0.0028, 0.007), y=-0.0068), 'glassD'),
               (T(box(0.0008, 0.006, 0.0008), y=-0.006), 'ink')]
        ob = anim_obj('%s_Cabin%d' % (group, c + 1), cab, mat4(*cab_pt(0.5), ry=yaw, s=LM), group)
        ph = c / n_cab
        k_path(ob, group, lambda u, ph=ph: tuple(cab_pt(0.06 + 0.88 * (0.5 - 0.5 * math.cos(2 * PI * (u + ph))))), yaw=False)

def bird(group, name, center3, radius, height, col='ink', size=1.0, turns=1, phase=0.0, flap=3):
    pe, PM = REGION[base_of(group)]
    Mb = np.eye(4); Mb[:3, 3] = (center3[0], -center3[2], height)
    piv = anim_empty(name + '_Orbit', Mb, group)
    piv.rotation_euler[2] = phase; k_spin(piv, 2, turns)
    body = [(T(box(0.012, 0.0035, 0.0035), y=-0.0017), col), (T(cone(0.0018, 0.004, 4), 0.006, 0, 0, rz=-PI / 2), 'yellow' if col == 'white' else col)]
    b = anim_obj(name, body, mat4(0, 0, 0, s=LM * size), group, parent=None)
    b.parent = piv; b.matrix_basis = Matrix(to_bl(mat4(0, 0, -radius, ry=PI if turns > 0 else 0, s=LM * size)).tolist())
    for side in (1, -1):
        w = anim_obj(name + ('_WingL' if side > 0 else '_WingR'), [(T(box(0.007, 0.0008, 0.016), z=side * 0.008), col)], np.eye(4), group)
        w.parent = b; w.matrix_basis = Matrix(); w.rotation_mode = 'XYZ'
        k_wave(w, 'rotation_euler', 0, side * 0.45, cycles=flap * turns * 8, phase=phase)

def cloud(name, X, Y, Z, s=1.0, drift=0.12, phase=0.0):
    parts = [(T(ball(0.06, 7, 4), 0, 0, 0, s=(1.3, 0.75, 1)), 'cloud'), (T(ball(0.045, 6, 4), 0.06, -0.005, 0.01, s=(1.2, 0.7, 1)), 'cloud'),
             (T(ball(0.05, 6, 4), -0.065, -0.008, -0.005, s=(1.2, 0.68, 1)), 'cloud'), (T(ball(0.04, 6, 4), 0.01, 0.03, -0.01, s=(1.1, 0.8, 1)), 'cloud')]
    me = mesh_from(name, [(v_bl(g.V), g.F, m) for g, m in parts])
    ob = bpy.data.objects.new(name, me); COLL.objects.link(ob); ob.parent = CLOUDS
    ob.location = (X, -Z, Y); ob.scale = (s * 2.2,) * 3; ob.rotation_euler[2] = rng.random() * PI
    k_wave(ob, 'location', 0, drift, cycles=1, phase=phase)
    k_wave(ob, 'location', 2, 0.015, cycles=2, phase=phase)

# ------------------------------------------------------------------------------------------------ roads, vehicles, sway
def ribbon(group, X0, Z0, pts, wdt, mat, lift, n=64, closed=False, smooth=True):
    """a strip of material draped over the ground along a curve (local LM offsets); returns the world polyline"""
    P = [(X0 + p[0] * LM, Z0 + p[1] * LM) for p in pts]
    if closed: P = P + P[:2]
    C = catmull(P, n) if smooth else [np.array(p, float) for p in P]
    if closed: C = C[:-max(1, n // len(P))]
    half = wdt * LM / 2; V, F, prev = [], [], None
    m = len(C)
    for k in range(m + (1 if closed else 0)):
        c = C[k % m]
        a, b = C[(k - 1) % m if closed else max(0, k - 1)], C[(k + 1) % m if closed else min(m - 1, k + 1)]
        t = b - a; t /= (np.linalg.norm(t) or 1); nx, nz = -t[1], t[0]
        Lp, Rp = (c[0] + nx * half, c[1] + nz * half), (c[0] - nx * half, c[1] - nz * half)
        ok = inside_map(c[0] / S + cx, c[1] / S + cy)
        y = max(ground3(c[0], c[1]), ground3(*Lp), ground3(*Rp)) + lift * LM
        cur = None
        if ok: cur = (len(V), len(V) + 1); V += [(Lp[0], y, Lp[1]), (Rp[0], y, Rp[1])]
        if cur and prev: F.append((prev[0], prev[1], cur[1], cur[0]))
        prev = cur
    if F:
        g = Geo(V, F); g.F = [f if _up(g.V, f) else f[::-1] for f in F]; emit(group, mat, g)
    return [tuple(c) for c in C]

def road(group, X0, Z0, pts, wdt=0.009, mat='road', closed=False, n=80): return ribbon(group, X0, Z0, pts, wdt, mat, 0.0016, n, closed)
def river2(group, X0, Z0, pts, wdt, n=64): return ribbon(group, X0, Z0, pts, wdt, 'water', 0.0022, n)

def along(C, u, closed=True):
    """point at fraction u of a polyline's length"""
    P = np.asarray(C, float)
    if closed: P = np.vstack((P, P[:1]))
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1); cum = np.concatenate(([0], np.cumsum(seg)))
    d = (u % 1.0) * cum[-1] if closed else min(max(u, 0), 1) * cum[-1]
    i = min(int(np.searchsorted(cum, d, side='right') - 1), len(seg) - 1)
    t = (d - cum[i]) / (seg[i] or 1e-9); q = P[i] + (P[i + 1] - P[i]) * t
    return (float(q[0]), float(q[1]))

def van():
    """Rezo's white Sprinter with the red stripe: front towards +x"""
    P = [(T(box(0.026, 0.0085, 0.012), y=0.003), 'white'), (T(box(0.0262, 0.0014, 0.0122), y=0.0062), 'red'),
         (T(box(0.006, 0.0038, 0.0104), x=0.0075, y=0.0082), 'glassD'), (T(box(0.013, 0.0032, 0.0124), x=-0.004, y=0.0082), 'glassD'),
         (T(box(0.0264, 0.0012, 0.0124), y=0.0113), 'white'), (T(box(0.0012, 0.0024, 0.009), x=0.0132, y=0.0036), 'ink'),
         (T(box(0.0009, 0.0018, 0.0032), x=0.0132, y=0.0062, z=0.0035), 'lamp'), (T(box(0.0009, 0.0018, 0.0032), x=0.0132, y=0.0062, z=-0.0035), 'lamp')]
    for x_ in (0.008, -0.008):
        for z_ in (0.0062, -0.0062): P.append((T(cyl(0.0028, 0.0018, 8), x_, 0.0028, z_, rx=PI / 2), 'tyre'))
    return P

def jeep():
    P = [(T(box(0.02, 0.007, 0.011), y=0.0035), 'jeep'), (T(box(0.011, 0.005, 0.0105), x=-0.003, y=0.0105), 'jeep'), (T(box(0.0112, 0.003, 0.0107), x=-0.003, y=0.0112), 'glassD'),
         (T(box(0.012, 0.0014, 0.0112), x=-0.003, y=0.0155), 'ink'), (T(cyl(0.0026, 0.0016, 8), -0.0108, 0.0085, 0, rz=PI / 2), 'tyre'),
         (T(box(0.0012, 0.0024, 0.009), x=0.0102, y=0.0045), 'ink')]
    for x_ in (0.0065, -0.0065):
        for z_ in (0.0058, -0.0058): P.append((T(cyl(0.0034, 0.0022, 8), x_, 0.0034, z_, rx=PI / 2), 'tyre'))
    return P

def drive(group, name, parts, C, laps=1.0, phase=0.0, lift=0.0, s=1.0):
    M0 = mat4(C[0][0], ground3(*C[0]), C[0][1], s=LM * s)
    ob = anim_obj(name, parts, M0, group)
    k_path(ob, group, lambda u: along(C, laps * u + phase), step=3, lift=lift)
    return ob

def sway_tree(group, name, parts, X0, Z0, dx, dz, amp=0.025, phase=0.0):
    """a tree of its own that leans gently in the wind"""
    M = placeM(X0, Z0, dx, dz, foot=0)
    if M is None: return
    ob = anim_obj(name, parts, M, group)
    k_wave(ob, 'rotation_euler', 0, amp, cycles=3, phase=phase, step=10)
    k_wave(ob, 'rotation_euler', 1, amp * 0.6, cycles=2, phase=phase + 1.3, step=10)

def boulder(s=1.0): return [(T(ball(0.006 * s, 5, 3), y=0.003 * s, s=(1.4, 0.7, 1.0), ry=rng.random() * 3), pick(['rockG', 'rockD', 'stoneG']))]

# ------------------------------------------------------------------------------------------------ the website hooks: pick areas, highlight rings, cameras
def dest_hooks(group, X0, Z0, ox, oz, rx, rz, cam):
    key = DEST[group]; pe, PM = REGION[group]
    cxw, czw = X0 + ox * LM, Z0 + oz * LM
    n = 20; rim = []
    for k in range(n):
        a = k / n * 2 * PI; X, Z = cxw + math.cos(a) * rx * LM, czw + math.sin(a) * rz * LM
        rim.append((X, ground3(X, Z) + 0.012, Z))
    cen = (cxw, ground3(cxw, czw) + 0.012, czw)
    g = Geo([cen] + rim, [(0, 1 + k, 1 + (k + 1) % n) for k in range(n)])
    g.F = [f if _up(g.V, f) else f[::-1] for f in g.F]
    me = mesh_from('Pick_' + key, [(v_bl(g.V) - PM[:3, 3], g.F, 'pick')])
    ob = bpy.data.objects.new('Pick_' + key, me); COLL.objects.link(ob); ob.parent = pe; ob.display_type = 'WIRE'
    # the highlight: a soft red glow on the ground around the destination (vertex alpha fades to the rim), for the site to fade in
    n2 = 48; rings = (0.0, 0.35, 0.65, 0.85, 1.0); alphas = (0.38, 0.33, 0.2, 0.07, 0.0)
    V, A = [], []
    hx, hz = rx * 0.75, rz * 0.75
    for ri, rr in enumerate(rings):
        for k in range(1 if rr == 0 else n2):
            a = k / n2 * 2 * PI; X, Z = cxw + math.cos(a) * hx * rr * LM, czw + math.sin(a) * hz * rr * LM
            V.append((X, ground3(X, Z) + 0.008, Z)); A.append(alphas[ri])
    F = [(0, 1 + k, 1 + (k + 1) % n2) for k in range(n2)]
    for ri in range(1, len(rings) - 1):
        a0, b0 = 1 + (ri - 1) * n2, 1 + ri * n2
        F += [(a0 + k, b0 + k, b0 + (k + 1) % n2, a0 + (k + 1) % n2) for k in range(n2)]
    g = Geo(V, F); g.F = [f if _up(g.V, f) else f[::-1] for f in g.F]
    me = bpy.data.meshes.new('Highlight_' + key); me.from_pydata((v_bl(g.V) - PM[:3, 3]).tolist(), [], g.F)
    ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT'); ca.data.foreach_set('color', np.array([[1, 1, 1, a] for a in A], np.float32).ravel())
    me.materials.append(MATS['highlight']); me.update()
    ob = bpy.data.objects.new('Highlight_' + key, me); COLL.objects.link(ob); ob.parent = pe; ob.hide_render = True
    # the camera and what it looks at
    tx, ty, tz, yaw, elev, dist = cam
    make_camera('Cam_' + key, (cxw + tx * LM, -(czw + tz * LM), ground3(cxw + tx * LM, czw + tz * LM) + ty), yaw, elev, dist, 55, 'CamTarget_' + key)

CAMS = {}
def make_camera(name, target, yaw, elev, dist, lens, target_name):
    t = Vector(target); e = math.radians(elev)
    off = Vector((math.sin(yaw) * math.cos(e), -math.cos(yaw) * math.cos(e), math.sin(e))) * dist
    te = bpy.data.objects.new(target_name, None); COLL.objects.link(te); te.parent = ROOT_EMPTY; te.location = t; te.empty_display_size = 0.05
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = 36; cd.clip_start = 0.02; cd.clip_end = 60
    cd.dof.use_dof = True; cd.dof.focus_object = te; cd.dof.aperture_fstop = 4.0 if dist < 5 else 11
    cam = bpy.data.objects.new(name, cd); COLL.objects.link(cam); cam.parent = ROOT_EMPTY
    cam.location = t + off; cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    CAMS[name] = cam; return cam

# ------------------------------------------------------------------------------------------------ 1 · Tbilisi
print('building stops...')
def build_tbilisi():
    g = 'Tbilisi'; X, Z = stop3('Tbilisi'); region_empty(g, X, Z)
    # the Mtkvari, and the lanes of the old town climbing from its bank
    river2(g + ':Mtkvari', X, Z, [[-0.24, 0.13], [-0.12, 0.07], [-0.04, 0.02], [0.03, -0.008], [0.11, -0.004], [0.2, -0.03], [0.27, -0.05]], 0.022)
    road(g + ':Lanes', X, Z, [[-0.02, 0.03], [0.04, 0.02], [0.1, 0.03], [0.16, 0.02]], wdt=0.005, mat='path')
    road(g + ':Lanes', X, Z, [[0.02, 0.025], [0.05, 0.06], [0.06, 0.1]], wdt=0.004, mat='path')
    road(g + ':Lanes', X, Z, [[0.1, 0.03], [0.11, 0.07], [0.13, 0.11]], wdt=0.004, mat='path')
    road(g + ':Lanes', X, Z, [[-0.06, 0.02], [-0.09, 0.06], [-0.13, 0.1]], wdt=0.005, mat='path')
    # Sameba: the cathedral on its podium, with a second tier and the gold dome
    sm = g + ':Sameba'
    place(sm, church(0.064, 0.03, 0.036, 'stone', 'roofGrey', plinth=0.012, drumR=0.0115, drumH=0.034, domeH=0.034, domeMat='gold'), X, Z, -0.075, -0.075, ry=0.1, foot=0.03)
    place(sm, [(T(box(0.034, 0.012, 0.034), y=0.048), 'stone'), (T(gable(0.036, 0.008, 0.036), y=0.06), 'roofGrey')], X, Z, -0.075, -0.075, ry=0.1, foot=0.03)
    for bx_, bz_ in ((-0.115, -0.105), (-0.035, -0.105), (-0.115, -0.045), (-0.035, -0.045)):
        place(sm, [(box(0.008, 0.012, 0.008), 'stone'), (T(cone(0.006, 0.008, 4), y=0.012, ry=PI / 4), 'roofGrey')], X, Z, bx_, bz_, foot=0.006)
    # Narikala: walls and round towers along the ridge, St Nicholas inside
    nk = g + ':Narikala'; wall = [[0.06, -0.06], [0.09, -0.052], [0.12, -0.056], [0.15, -0.07]]
    wall_line(nk, X, Z, wall, h=0.014, th=0.0055, mat='stoneG', seg=0.009, crenel=True)
    wall_line(nk, X, Z, [[0.06, -0.06], [0.075, -0.085], [0.12, -0.09], [0.15, -0.07]], h=0.01, th=0.0045, mat='stoneG', seg=0.009, crenel=True)
    for t in wall + [[0.075, -0.085], [0.12, -0.09]]:
        P = [(cyl(0.0068, 0.026, 8), 'stoneG')] + [(T(box(0.0024, 0.003, 0.0024), math.cos(c / 8 * 2 * PI) * 0.0058, 0.026, math.sin(c / 8 * 2 * PI) * 0.0058), 'stoneG') for c in range(8)]
        place(nk, P, X, Z, t[0], t[1], foot=0.006)
    place(nk, church(0.022, 0.012, 0.014, 'stoneY', 'roof', drumR=0.0045, drumH=0.01, domeH=0.01), X, Z, 0.105, -0.072, foot=0.01)
    # Kartlis Deda, the Mother of Georgia, sword raised
    place(g + ':KartlisDeda', [(box(0.008, 0.006, 0.008), 'stoneD'), (T(cyl(0.0026, 0.04, 6, 0.0046), y=0.006), 'steel'), (T(ball(0.0026, 6, 4), y=0.049), 'steel'),
              (T(box(0.018, 0.0018, 0.0018), y=0.04), 'steel'), (T(box(0.0012, 0.022, 0.0012), 0.0088, 0.04, 0), 'steel'), (T(cyl(0.0034, 0.0016, 6), -0.0088, 0.0395, 0), 'steel')],
          X, Z, 0.175, -0.085, ry=0.3, foot=0.006)
    # Metekhi: the church on its rock above the river, with King Vakhtang on his horse
    mk = g + ':Metekhi'
    place(mk, [(T(box(0.034, 0.02, 0.026), ry=0.3), 'rockG'), (T(box(0.03, 0.022, 0.022), ry=0.3), 'stoneG')], X, Z, 0.012, -0.03, foot=0.012, sink=0.008)
    place(mk, church(0.024, 0.013, 0.015, 'brick', 'roofGrey', drumR=0.005, drumH=0.016, domeH=0.012), X, Z, 0.012, -0.03, ry=0.3, y=0.022, foot=0.012, sink=0.008)
    place(mk, [(T(gm, 0, 0.001, 0), m) for gm, m in horse('ink')] + [(T(box(0.0035, 0.0075, 0.003), 0, 0.014, 0), 'ink'), (T(ball(0.0018, 5, 4), y=0.023), 'ink'), (box(0.014, 0.002, 0.009), 'stoneD')],
          X, Z, 0.024, -0.045, ry=0.9, y=0.022, foot=0.012, sink=0.008)
    # the Bridge of Peace: a deck and a glass canopy in a long wave
    ba = -math.atan2(-0.024, 0.07) + PI / 2
    wave = [((t / 24 - 0.5) * 0.06, 0.009 + math.sin(t / 24 * PI * 3) * 0.0035 + math.sin(t / 24 * PI) * 0.004, 0) for t in range(25)]
    canopy = tube(wave, 0.0022, 5)
    place(g + ':BridgeOfPeace', TP([(T(box(0.06, 0.0018, 0.0075), y=0.0055), 'white'), (T(canopy, z=0.0028), 'glass'), (T(canopy, z=-0.0028), 'glass')], ry=ba), X, Z, -0.012, 0.009, foot=0, sink=0)
    # Rike Park: the two steel tubes of the concert hall
    for k, (tx, tz) in enumerate(((-0.012, -0.03), (0.0, -0.05))):
        arc = [(-0.016 + t / 8 * 0.032, 0.006 + 0.004 * math.sin(t / 8 * PI), 0) for t in range(9)]
        place(g + ':RikePark', [(tube(arc, 0.0055, 6), 'steel'), (T(box(0.03, 0.004, 0.012)), 'stoneD')], X, Z, tx, tz, ry=0.4 + k * 0.5, foot=0.012)
    # Abanotubani: the brick domes of the sulphur baths on a stone terrace, lanterns on top
    ab = g + ':Abanotubani'
    for d in ((-0.062, 0.035), (-0.044, 0.048), (-0.028, 0.06), (-0.052, 0.066), (-0.036, 0.078)):
        place(ab, [(box(0.024, 0.006, 0.024), 'stoneD'), (T(dome(0.0105, 8, 3), y=0.006), 'brick'), (T(cyl(0.0022, 0.004, 6), y=0.0155), 'brick'), (T(cone(0.0028, 0.003, 6), y=0.0195), 'brick')],
              X, Z, d[0], d[1], foot=0.012, sink=0.004)
    place(ab, [(box(0.02, 0.018, 0.016), 'sky'), (T(gable(0.018, 0.006, 0.022), y=0.018, ry=PI / 2), 'blue'), (T(box(0.006, 0.012, 0.006), 0.012, 0, 0.0), 'sky'), (T(cone(0.004, 0.006, 6), 0.012, 0.012, 0), 'blue')],
          X, Z, -0.075, 0.05, ry=0.2, foot=0.01)  # the Orbeliani (blue) bathhouse
    # the old town: balconied houses along the lanes, colourful roofs, plane trees
    for h in range(22):
        place(g, house(w=0.018 + rng.random() * 0.012, d=0.016, h=0.013 + rng.random() * 0.012, wall=pick(['stone', 'ochre', 'rose', 'sky', 'stoneY']), roof=pick(['roof', 'roofD', 'roof']),
                       balcony=rng.random() > 0.3, chimney=rng.random() > 0.6), X, Z, *spot('tb', 0.0, 0.17, 0.035, 0.1), ry=(rng.random() - 0.5) * 0.7)
    for h in range(8):  # the left bank, below Sameba
        place(g, house(w=0.018 + rng.random() * 0.01, d=0.015, h=0.012 + rng.random() * 0.008, wall=pick(['stone', 'ochre', 'stoneY']), roof=pick(['roof', 'roofD']), balcony=rng.random() > 0.5),
              X, Z, *spot('tb2', -0.16, 0.1, -0.03, 0.09), ry=(rng.random() - 0.5) * 0.7)
    for t in range(10): place(g, tree(0.022 + rng.random() * 0.01), X, Z, -0.17 + rng.random() * 0.12, 0.06 + rng.random() * 0.08, foot=0)
    for t in range(6): place(g, tree(0.02 + rng.random() * 0.01), X, Z, 0.0 + rng.random() * 0.1, 0.14 + rng.random() * 0.04, foot=0)
    # Mtatsminda: the TV tower and the big wheel on the ridge above the city
    tv = []
    for lx, lz in ((1, 1), (1, -1), (-1, 1), (-1, -1)): tv.append((T(box(0.0014, 0.075, 0.0014), lx * 0.004, 0, lz * 0.004, rx=-lz * 0.05, rz=lx * 0.05), 'red' if lx > 0 else 'white'))
    for k in range(6): tv.append((T(box(0.0095 - k * 0.001, 0.0012, 0.0095 - k * 0.001), y=0.01 + k * 0.012), 'white'))
    tv += [(T(cyl(0.004, 0.006, 6), y=0.07), 'red'), (T(box(0.0012, 0.03, 0.0012), y=0.076), 'white')]
    place(g + ':TVTower', tv, X, Z, 0.2, 0.015, foot=0.006)
    ferris(g, X, Z, 0.18, 0.04, R=0.02, n=10, ry=0.9, name='Tbilisi_Wheel')
    cable_car(g, X, Z, (0.005, -0.012), (0.09, -0.068), n_cab=3, col='yellow')
    # a van crossing the city on the embankment road
    C = road(g + ':Roads', X, Z, [[-0.2, 0.0], [-0.1, 0.03], [-0.04, 0.012], [0.04, -0.012], [0.12, -0.016], [0.2, -0.045], [0.21, -0.07], [0.12, -0.11], [0.0, -0.1], [-0.1, -0.06], [-0.19, -0.03]], wdt=0.007, mat='asphalt', closed=True)
    drive(g, 'Tbilisi_Van', van(), C, laps=1.0, s=0.9)
    dest_hooks(g, X, Z, 0.03, 0.0, 0.25, 0.19, (0.04, 0.06, 0.0, -0.3, 36, 1.95))

def ferris(g, X0, Z0, dx, dz, R=0.034, n=12, ry=0.55, name='Wheel', cab_mat='red'):
    hub = R + 0.009
    M = placeM(X0, Z0, dx, dz, ry=ry, foot=0.006)
    if M is None: return
    for zo in (-0.004, 0.004):
        emit(g, 'white', T(box(0.0024, hub + 0.002, 0.0024), 0, 0, zo * 3.2, rx=-0.3 if zo > 0 else 0.3), M)
    emit(g, 'stoneD', box(0.02, 0.003, 0.016), M)
    rim = [(T(cyl(0.003, 0.012, 6), z=-0.006, rx=PI / 2), 'steel')]
    for zo in (-0.004, 0.004):
        rim.append((T(torus(R, 0.0013, 4, 24), z=zo), 'white'))
        for sp in range(n): rim.append((T(T(box(0.0009, R, 0.0009), y=-R), 0, 0, zo, rz=sp / n * 2 * PI), 'white'))
    wheel = anim_obj(name, rim, M @ mat4(y=hub), g)
    k_spin(wheel, 1, -1.0)
    for c in range(n):
        an = c / n * 2 * PI
        cab = anim_obj('%s_Cab%d' % (name, c + 1), [(T(box(0.006, 0.0064, 0.006), y=-0.0078), cab_mat), (T(box(0.0007, 0.0016, 0.0007), y=-0.0016), 'ink')], np.eye(4), g, parent=wheel)
        cab.matrix_basis = Matrix(to_bl(mat4(math.cos(an) * R, math.sin(an) * R, 0)).tolist())
        k_spin(cab, 1, 1.0)

# ------------------------------------------------------------------------------------------------ 2 · Kakheti
def build_kakheti():
    g = 'Kakheti'; X, Z = stop3('Telavi'); region_empty(g, X, Z)
    # vineyard rows across the Alazani valley floor, each row settling on the ground
    vy = g + ':Vineyards'
    for r in range(9):
        for k in range(8):
            P = [(T(box(0.0145, 0.0052, 0.0042), y=0.0055), 'vine'), (T(box(0.0009, 0.0062, 0.0009), -0.0065, 0, 0), 'wood')]
            if (r + k) % 2 == 0: P += [(T(ball(0.0016, 5, 3), 0.002, 0.0046, 0.0024), 'grape'), (T(ball(0.0016, 5, 3), -0.003, 0.0046, -0.0024), 'grape')]
            place(vy, P, X, Z, 0.045 + k * 0.0152, 0.03 + r * 0.0125, foot=0, sink=0.0008)
    for r in range(6):  # a second, smaller block by the estate
        for k in range(6):
            P = [(T(box(0.0145, 0.0052, 0.0042), y=0.0055), 'vine'), (T(box(0.0009, 0.0062, 0.0009), -0.0065, 0, 0), 'wood')]
            place(vy, P, X, Z, -0.19 + k * 0.0152, -0.06 + r * 0.0125, foot=0, sink=0.0008)
    # Alaverdi: the tall plain cathedral in its walled close
    al = g + ':Alaverdi'; ax, az = 0.02, -0.12
    place(al, church(0.07, 0.032, 0.05, 'stoneY', 'roofG', drumR=0.012, drumH=0.03, domeH=0.026), X, Z, ax, az, ry=-0.15, foot=0.03)
    wall_line(al, X, Z, [(ax + x_, az + z_) for x_, z_ in ((-0.06, -0.045), (0.06, -0.045), (0.06, 0.045), (-0.06, 0.045))], closed=True)
    place(al, [(box(0.012, 0.03, 0.012), 'stoneY'), (T(cone(0.01, 0.012, 4), y=0.03, ry=PI / 4), 'roofG')], X, Z, ax - 0.045, az + 0.03, foot=0.006)
    # a wine estate: the marani with its qvevri sunk in the yard, a tasting terrace, cypresses
    es = g + ':WineEstate'
    for j in ((0.058, -0.02, 0.42), (0.066, -0.012, 0.36), (0.06, -0.004, 0.4), (0.07, -0.026, 0.34)): place(es, qvevri(j[2]), X, Z, j[0], j[1], foot=0, sink=0.012 * j[2])
    place(es, qvevri(0.4, True), X, Z, 0.078, -0.008, ry=0.6, foot=0)
    marani = house(w=0.05, d=0.03, h=0.022, wall='stoneD', roof='roof', balcony=True)
    marani += [(T(box(0.009, 0.012, 0.0008), -0.012, 0, 0.0153), 'ink')]
    place(es, marani, X, Z, 0.09, -0.06, ry=0.12, foot=0.02)
    place(es, [(box(0.03, 0.003, 0.02), 'stoneD')] + [(T(cyl(0.0035, 0.0008, 8), -0.01 + k * 0.01, 0.006, 0), 'wood') for k in range(3)] + [(T(cyl(0.0006, 0.006, 4), -0.01 + k * 0.01, 0.0, 0), 'wood') for k in range(3)],
          X, Z, 0.125, -0.055, ry=0.12, foot=0.012)
    # a second winery, with the old wooden press house
    place(g + ':Winery', house(w=0.036, d=0.024, h=0.018, wall='stoneY', roof='roofD', balcony=True) + [(T(box(0.02, 0.012, 0.014), 0.03, 0, 0.004), 'wood'), (T(gable(0.016, 0.006, 0.022), 0.03, 0.012, 0.004, ry=PI / 2), 'roof')],
          X, Z, -0.11, -0.085, ry=0.3, foot=0.016)
    for t in ((0.035, -0.06), (0.045, -0.035), (0.13, -0.07), (0.135, -0.04), (-0.03, -0.02), (-0.05, -0.04), (0.03, 0.02), (0.03, 0.15), (-0.14, -0.07), (-0.13, -0.1)): place(g, cypress(), X, Z, t[0], t[1], foot=0)
    for t in range(8): place(g, tree(0.028 + rng.random() * 0.01), X, Z, 0.1 + rng.random() * 0.07, -0.15 + rng.random() * 0.06, foot=0)
    for t in range(6): place(g, tree(0.026 + rng.random() * 0.01), X, Z, -0.06 + rng.random() * 0.1, 0.1 + rng.random() * 0.06, foot=0)
    for h in range(8):  # Telavi
        place(g, house(w=0.02 + rng.random() * 0.01, h=0.013 + rng.random() * 0.006, wall=pick(['stone', 'ochre', 'stoneY']), roof=pick(['roof', 'roofD']), balcony=rng.random() > 0.5),
              X, Z, *spot('ka', -0.085, 0.085, -0.02, 0.08), ry=(rng.random() - 0.5) * 0.6)
    # Sighnaghi: the walled town on its hill at the edge of the valley, red roofs inside the ring of towers
    sg = g + ':Sighnaghi'; sx_, sz_ = 0.215, 0.205
    ring = [(sx_ + math.cos(k / 9 * 2 * PI) * 0.048 * (1 + 0.12 * math.sin(k * 2.1)), sz_ + math.sin(k / 9 * 2 * PI) * 0.04 * (1 + 0.12 * math.cos(k * 1.7))) for k in range(9)]
    wall_line(sg, X, Z, ring, h=0.011, th=0.0045, mat='stoneD', seg=0.01, closed=True, crenel=True)
    for k, (tx, tz) in enumerate(ring):
        if k % 2: place(sg, [(cyl(0.006, 0.022, 8), 'stoneD'), (T(cone(0.0068, 0.007, 8), y=0.022), 'roofD')], X, Z, tx, tz, foot=0.005)
    for h in range(11):
        a = rng.random() * 2 * PI; r = rng.random() ** 0.5 * 0.028
        place(sg, house(w=0.014 + rng.random() * 0.006, d=0.011, h=0.011 + rng.random() * 0.005, wall=pick(['stone', 'stoneY', 'rose']), roof='roof', balcony=rng.random() > 0.4),
              X, Z, sx_ + math.cos(a) * r, sz_ + math.sin(a) * r * 0.8, ry=a, foot=0.006)
    place(sg, church(0.024, 0.012, 0.014, 'stone', 'roofD', drumR=0.0045, drumH=0.012, domeH=0.011), X, Z, sx_ + 0.012, sz_ - 0.01, ry=0.4, foot=0.01)
    place(sg, [(box(0.009, 0.026, 0.009), 'stone'), (T(cone(0.0075, 0.009, 4), y=0.026, ry=PI / 4), 'roofD')], X, Z, sx_ - 0.018, sz_ + 0.012, foot=0.005)
    # Bodbe, the convent below the town, in its cypresses
    place(g + ':Bodbe', church(0.02, 0.011, 0.012, 'stoneY', 'roofG', drumR=0.004, drumH=0.009, domeH=0.009), X, Z, 0.17, 0.26, ry=0.2, foot=0.008)
    for t in ((0.155, 0.25), (0.185, 0.27), (0.16, 0.275), (0.19, 0.245)): place(g, cypress(0.035), X, Z, t[0], t[1], foot=0)
    # the wine road: a loop from Alaverdi through Telavi, past the estate and the vineyards up to Sighnaghi and back
    C = road(g + ':Roads', X, Z, [[0.0, -0.07], [-0.04, -0.02], [-0.07, 0.05], [-0.03, 0.09], [0.02, 0.15], [0.09, 0.17], [0.16, 0.185], [0.2, 0.15], [0.17, 0.1], [0.19, 0.03], [0.14, -0.02], [0.1, -0.09], [0.05, -0.13], [0.0, -0.07]][:-1],
             wdt=0.0085, mat='road', closed=True, n=120)
    road(g + ':Roads', X, Z, [[0.185, 0.17], [0.215, 0.205]], wdt=0.005, mat='path')
    drive(g, 'Kakheti_Van', van(), C, laps=1.0, phase=0.0)
    # a little red tractor doing laps of the vineyard
    tr = [(T(box(0.012, 0.006, 0.008), y=0.004), 'tractor'), (T(box(0.006, 0.007, 0.007), -0.002, 0.01, 0), 'tractor'), (T(box(0.0062, 0.004, 0.0072), -0.002, 0.012, 0), 'glassD'),
          (T(box(0.002, 0.007, 0.002), 0.004, 0.01, 0.002), 'ink')]
    for wx_, r_ in ((-0.003, 0.0045), (0.0045, 0.003)):
        for zz in (-0.0048, 0.0048): tr.append((T(cyl(r_, 0.002, 8), wx_, r_, zz, rx=PI / 2), 'tyre'))
    trailer = [(T(box(0.012, 0.004, 0.009), -0.016, 0.004, 0), 'wood'), (T(ball(0.0028, 5, 3), -0.018, 0.009, 0.002), 'grape'), (T(ball(0.0028, 5, 3), -0.014, 0.009, -0.002), 'grape'),
               (T(cyl(0.003, 0.002, 8), -0.016, 0.003, 0.0055, rx=PI / 2), 'tyre'), (T(cyl(0.003, 0.002, 8), -0.016, 0.003, -0.0055, rx=PI / 2), 'tyre')]
    M0 = placeM(X, Z, 0.1, 0.02)
    trac = anim_obj('Kakheti_Tractor', tr + trailer, M0, g)
    cxv, czv, a_, b_ = X + 0.098 * LM, Z + 0.08 * LM, 0.075 * LM, 0.068 * LM
    def lap(u):
        t = 2 * PI * u; c, s_ = math.cos(t), math.sin(t)
        return (cxv + a_ * np.sign(c) * abs(c) ** 0.35, czv + b_ * np.sign(s_) * abs(s_) ** 0.35)
    k_path(trac, g, lap, step=3, lift=-0.002)
    # a hot-air balloon drifting over the Alazani valley
    prof = [(0.0, 0.0), (0.006, 0.004), (0.016, 0.018), (0.024, 0.036), (0.026, 0.05), (0.022, 0.064), (0.012, 0.074), (0.0, 0.077)]
    bal = []
    for k in range(10): bal.append((lathe(prof, 1, k / 10 * 2 * PI, 2 * PI / 10), ['red', 'white', 'yellow', 'white'][k % 4]))
    bal += [(T(box(0.007, 0.006, 0.007), y=-0.016), 'wood')] + [(T(box(0.0005, 0.017, 0.0005), sx * 0.004, -0.011, sz * 0.004, rz=-sx * 0.15, rx=sz * 0.15), 'ink') for sx in (1, -1) for sz in (1, -1)]
    Mb0 = placeM(X, Z, 0.08, 0.1)
    if Mb0 is not None:
        Mb0 = Mb0.copy(); Mb0[1, 3] += 0.32
        bl = anim_obj('Kakheti_Balloon', bal, Mb0, g)
        k_wave(bl, 'location', 2, 0.035, cycles=1); k_wave(bl, 'location', 0, 0.09, cycles=1, phase=PI / 2); k_wave(bl, 'rotation_euler', 2, 0.6, cycles=1)
    for k in range(3): sway_tree(g, 'Kakheti_Tree%d' % (k + 1), tree(0.03), X, Z, 0.0 + k * 0.03, 0.2 + (k % 2) * 0.02, phase=k)
    dest_hooks(g, X, Z, 0.05, 0.05, 0.28, 0.25, (0.07, 0.05, 0.05, -0.45, 38, 2.4))

# ------------------------------------------------------------------------------------------------ 3 · Tusheti
def build_tusheti():
    g = 'Tusheti'; X, Z = stop3('Omalo'); region_empty(g, X, Z)
    # Keselo: the tower group on its spur above Omalo (the stop sits against the border, so the scene spreads west)
    ks = g + ':Keselo'
    for t in ((-0.03, -0.035, 0.09), (-0.008, -0.048, 0.105), (0.012, -0.034, 0.085), (-0.016, -0.018, 0.075), (-0.05, -0.05, 0.095)): place(ks, tush_tower(t[2]), X, Z, t[0], t[1], foot=0.008)
    wall_line(ks, X, Z, [(-0.06, -0.06), (0.02, -0.06), (0.025, -0.01), (-0.05, -0.008)], h=0.005, th=0.0035, mat='stoneT', closed=True)
    # Omalo: slate-roofed stone houses below the towers
    om = g + ':Omalo'
    for k in range(8):
        P = house(w=0.026, d=0.02, h=0.016, wall=pick(['stoneT', 'stoneG']), roof='slate', chimney=True, flat_roof=True)
        P.append((T(box(0.02, 0.0014, 0.005), 0, 0.009, 0.0125), 'wood'))
        place(om, P, X, Z, *spot('om', -0.12, 0.09, -0.01, 0.045, mind=0.03), ry=(rng.random() - 0.5) * 0.6, foot=0.012)
    # Dartlo: the terraced village over the ridge, houses stepping down the slope, two towers, a stone chapel
    da = g + ':Dartlo'
    for k in range(7):
        P = house(w=0.02, d=0.016, h=0.014, wall='stoneT', roof='slate', flat_roof=True)
        P.append((T(box(0.016, 0.0012, 0.004), 0, 0.008, 0.01), 'wood'))
        place(da, P, X, Z, -0.195 + (k % 4) * 0.022 + (k // 4) * 0.011, -0.055 + (k // 4) * 0.02, ry=0.25, foot=0.01)
    for t in ((-0.215, -0.07, 0.07), (-0.125, -0.068, 0.08)): place(da, tush_tower(t[2]), X, Z, t[0], t[1], foot=0.008)
    place(da, [(box(0.012, 0.009, 0.009), 'stoneT'), (T(gable(0.01, 0.004, 0.014), y=0.009, ry=PI / 2), 'slate'), (T(box(0.0012, 0.006, 0.0012), y=0.013), 'ink')], X, Z, -0.16, -0.085, ry=0.3, foot=0.006)
    # the Pirikita Alazani running below Dartlo, and the one narrow road: up from the Abano pass, through Omalo, over to Dartlo and back round
    river2(g + ':River', X, Z, [[-0.3, -0.12], [-0.22, -0.1], [-0.15, -0.105], [-0.08, -0.115], [-0.02, -0.11]], 0.009)
    C = road(g + ':Roads', X, Z, [[-0.08, 0.2], [-0.13, 0.16], [-0.07, 0.13], [-0.14, 0.09], [-0.09, 0.05], [-0.13, 0.02], [-0.06, 0.0], [-0.02, -0.02], [-0.06, -0.045], [-0.1, -0.05], [-0.16, -0.06], [-0.2, -0.03], [-0.19, 0.03], [-0.22, 0.08], [-0.18, 0.14], [-0.13, 0.2]][:-1],
             wdt=0.0055, mat='path', closed=True, n=140)
    drive(g, 'Tusheti_Jeep', jeep(), C, laps=1.0, s=0.85)
    # sparse high pasture: a few pines, shrubs, exposed rock, a stone sheepfold
    for t in range(9): place(g, pine(0.03 + rng.random() * 0.012), X, Z, -0.26 + rng.random() * 0.1, -0.08 + rng.random() * 0.2, foot=0)
    for t in range(14): place(g, [(T(ball(0.004, 5, 3), y=0.003, s=(1.3, 0.8, 1)), pick(['pine', 'pineL', 'leaf']))], X, Z, -0.2 + rng.random() * 0.2, -0.05 + rng.random() * 0.22, foot=0)
    for t in range(16): place(g, boulder(0.8 + rng.random() * 1.2), X, Z, -0.22 + rng.random() * 0.28, -0.12 + rng.random() * 0.3, foot=0)
    wall_line(g, X, Z, [(-0.07 + math.cos(k / 10 * 2 * PI) * 0.02, 0.09 + math.sin(k / 10 * 2 * PI) * 0.018) for k in range(10)], h=0.005, mat='stoneG', closed=True)
    for s_ in range(14):  # the flock grazing on the summer pasture, each sheep on its own slow wander
        c0 = (-0.12 + rng.random() * 0.1, 0.03 + rng.random() * 0.05); r0 = 0.004 + rng.random() * 0.007; ph = rng.random()
        M = placeM(X, Z, c0[0], c0[1], foot=0)
        if M is None: continue
        sh = anim_obj('Tusheti_Sheep%d' % (s_ + 1), sheep(), M, g)
        d_ = 1 if rng.random() > 0.5 else -1
        k_path(sh, g, lambda u, c0=c0, r0=r0, ph=ph, d_=d_: (X + (c0[0] + r0 * math.cos(d_ * 2 * PI * (u + ph))) * LM, Z + (c0[1] + r0 * 0.7 * math.sin(d_ * 2 * PI * (u + ph))) * LM), step=8, lift=-0.0005)
    for k, (c0, ra, rb, col) in enumerate((((-0.04, 0.06), 0.026, 0.013, 'horse'), ((-0.02, 0.075), 0.02, 0.012, 'horseD'), ((-0.09, 0.07), 0.018, 0.01, 'horse'))):
        M = placeM(X, Z, c0[0], c0[1], foot=0)
        if M is None: continue
        hs = anim_obj('Tusheti_Horse%d' % (k + 1), horse(col), M, g)
        k_path(hs, g, lambda u, c0=c0, ra=ra, rb=rb, k=k: (X + (c0[0] + ra * math.cos(2 * PI * u + k)) * LM, Z + (c0[1] + rb * math.sin(2 * PI * u + k)) * LM), step=6, lift=-0.001)
    for k in range(3): sway_tree(g, 'Tusheti_Tree%d' % (k + 1), pine(0.034), X, Z, -0.24 + k * 0.025, 0.0 + k * 0.03, amp=0.02, phase=k * 1.1)
    bird(g, 'Tusheti_Eagle', (X - 0.08 * LM, 0, Z - 0.02 * LM), 0.1 * LM, REGION[g][1][2, 3] + 0.3, col='horseD', size=1.3, turns=1, phase=1.0, flap=1)
    dest_hooks(g, X, Z, -0.11, 0.0, 0.2, 0.18, (-0.1, 0.05, 0.0, -0.2, 44, 2.1))

# ------------------------------------------------------------------------------------------------ 4 · scenery along the way (not destinations)
def map_pts(X0, Z0, pts):
    """absolute map points -> local LM offsets for a region"""
    return [((wx(p[0]) - X0) / LM, (wz(p[1]) - Z0) / LM) for p in pts]

def build_kutaisi():
    # Kutaisi: Bagrati on its hill over the Rioni, the White Bridge, the Colchis Fountain; Gelati and Motsameta up the valley
    g = 'Scenery_Kutaisi'; X, Z = stop3('Kutaisi'); region_empty(g, X, Z)
    river2(g, X, Z, [[-0.07, -0.18], [-0.04, -0.09], [-0.03, -0.01], [-0.045, 0.06], [-0.035, 0.14], [-0.05, 0.2]], 0.018)
    place(g, church(0.09, 0.044, 0.042, 'stoneY', 'roofG', plinth=0.008, drumR=0.0165, drumH=0.034, domeH=0.03), X, Z, 0.045, -0.07, foot=0.035)
    place(g, [(box(0.016, 0.03, 0.016), 'stoneY'), (T(cone(0.012, 0.012, 4), y=0.03, ry=PI / 4), 'roofG')], X, Z, 0.0, -0.09, foot=0.008)
    wall_line(g, X, Z, [(0.0, -0.11), (0.1, -0.11), (0.1, -0.035), (0.0, -0.035)], h=0.006, th=0.0035, mat='stoneG', closed=True)
    gx, gz = 0.17, -0.14  # Gelati: the big church, two small ones, the academy and the bell tower inside the wall
    place(g, church(0.06, 0.03, 0.034, 'stoneD', 'roofG', drumR=0.011, drumH=0.024, domeH=0.022), X, Z, gx, gz, ry=0.2, foot=0.025)
    place(g, church(0.03, 0.016, 0.02, 'stoneD', 'roofG', drumR=0.006, drumH=0.014, domeH=0.012), X, Z, gx + 0.04, gz + 0.03, ry=0.2, foot=0.014)
    place(g, church(0.024, 0.013, 0.016, 'stoneD', 'roofG', drumR=0.005, drumH=0.011, domeH=0.01), X, Z, gx - 0.035, gz + 0.025, ry=0.6, foot=0.012)
    place(g, [(box(0.03, 0.012, 0.016), 'stoneD'), (T(gable(0.018, 0.005, 0.032), y=0.012, ry=PI / 2), 'roofG')], X, Z, gx - 0.03, gz - 0.025, ry=0.2, foot=0.012)
    place(g, [(box(0.01, 0.024, 0.01), 'stoneD'), (T(cone(0.008, 0.008, 4), y=0.024, ry=PI / 4), 'roofG')], X, Z, gx + 0.035, gz - 0.03, foot=0.006)
    wall_line(g, X, Z, [(gx + math.cos(k / 14 * 2 * PI) * 0.062, gz + math.sin(k / 14 * 2 * PI) * 0.048) for k in range(14)], closed=True)
    # Motsameta: the small monastery on its cliff above the gorge
    place(g, [(T(box(0.03, 0.022, 0.024), ry=0.4), 'rockG')] + [(T(gm, 0, 0.022, 0), m) for gm, m in church(0.02, 0.011, 0.012, 'stoneY', 'roofD', drumR=0.0045, drumH=0.009, domeH=0.009)], X, Z, 0.1, -0.17, ry=0.4, foot=0.012, sink=0.01)
    place(g, TP([(T(torus(0.018, 0.0022, 4, 10, PI), y=-0.006), 'white'), (T(box(0.04, 0.0022, 0.009), y=0.012), 'white')], ry=PI / 2 - 0.15), X, Z, -0.03, -0.01, foot=0, sink=0)
    F = [(cyl(0.024, 0.0035, 16), 'stoneD'), (T(cyl(0.021, 0.0008, 16), y=0.0035), 'water'), (T(cyl(0.0035, 0.016, 6, 0.005), y=0.0035), 'gold'), (T(cone(0.003, 0.03, 6), y=0.019), 'water')]
    for k in range(12):
        a = k / 12 * 2 * PI; F.append((T(cyl(0.0016, 0.009, 5, 0.0024), math.cos(a) * 0.016, 0.0035, math.sin(a) * 0.016), 'gold'))
    place(g, F, X, Z, 0.05, 0.035, foot=0)
    road(g, X, Z, [[-0.02, 0.0], [0.03, 0.03], [0.09, 0.05], [0.15, 0.04], [0.2, 0.0], [0.18, -0.08], [0.15, -0.09]], wdt=0.006, mat='asphalt')
    for h in range(16):
        place(g, house(w=0.018 + rng.random() * 0.012, h=0.012 + rng.random() * 0.008, wall=pick(['stone', 'stoneY', 'ochre', 'rose']), roof=pick(['roof', 'roofD']), balcony=rng.random() > 0.6),
              X, Z, *spot('ku', 0.0, 0.14, 0.055, 0.08), ry=(rng.random() - 0.5) * 0.6)
    for h in range(6):
        place(g, house(w=0.016 + rng.random() * 0.01, h=0.012 + rng.random() * 0.006, wall=pick(['stone', 'stoneY', 'ochre']), roof=pick(['roof', 'roofD'])), X, Z, *spot('ku2', -0.14, 0.08, 0.0, 0.08), ry=(rng.random() - 0.5) * 0.6)
    for t in ((-0.005, -0.12), (0.1, -0.11), (0.11, -0.03), (-0.01, -0.04), (0.23, -0.12), (0.12, -0.2), (0.07, -0.2)): place(g, cypress(), X, Z, t[0], t[1], foot=0)
    for t in range(12): place(g, tree(0.026 + rng.random() * 0.01), X, Z, 0.1 + rng.random() * 0.12, 0.0 + rng.random() * 0.1, foot=0)
    for t in range(8): place(g, tree(0.024 + rng.random() * 0.01), X, Z, -0.13 + rng.random() * 0.1, -0.1 + rng.random() * 0.08, foot=0)

def build_kazbegi():
    # Kazbegi: Gergeti Trinity on its knoll under Mt Kazbek, Stepantsminda below, the Georgian Military Highway winding up the gorge
    g = 'Scenery_Kazbegi'; X, Z = stop3('Stepantsminda'); region_empty(g, X, Z)
    rt = G['routes']['Tbilisi>Stepantsminda']
    road(g, X, Z, map_pts(X, Z, rt[-16:]), wdt=0.007, mat='asphalt', n=90)
    river2(g, X, Z, [[-0.02, 0.2], [0.01, 0.1], [0.0, 0.03], [0.02, -0.05], [0.01, -0.14]], 0.011)
    place(g, church(0.04, 0.02, 0.024, 'stoneG', 'slate', drumR=0.0075, drumH=0.022, domeH=0.016) + [(T(box(0.012, 0.036, 0.012), -0.038, 0, 0.006), 'stoneG'), (T(cone(0.0095, 0.011, 4), -0.038, 0.036, 0.006, ry=PI / 4), 'slate')],
          X, Z, -0.038, -0.01, ry=0.3, foot=0.02)
    wall_line(g, X, Z, [(-0.075, -0.035), (-0.005, -0.035), (-0.005, 0.018), (-0.075, 0.018)], h=0.004, th=0.003, mat='stoneG', closed=True)
    for h in range(12):
        place(g, house(w=0.016 + rng.random() * 0.008, d=0.013, h=0.011 + rng.random() * 0.005, wall=pick(['stoneG', 'stone', 'stoneT']), roof=pick(['slate', 'roofGrey', 'roof']), chimney=True),
              X, Z, *spot('kz', 0.015, 0.09, 0.0, 0.08, mind=0.026), ry=(rng.random() - 0.5) * 0.5)
    place(g, church(0.018, 0.01, 0.012, 'stone', 'roofGrey', drumR=0.004, drumH=0.009, domeH=0.008), X, Z, 0.06, 0.04, ry=0.2, foot=0.008)
    for t in range(14): place(g, pine(0.03 + rng.random() * 0.012), X, Z, -0.12 + rng.random() * 0.08, -0.08 + rng.random() * 0.2, foot=0)
    for t in range(10): place(g, boulder(0.8 + rng.random()), X, Z, -0.1 + rng.random() * 0.2, -0.16 + rng.random() * 0.1, foot=0)
    for t in range(6): place(g, [(T(ball(0.004, 5, 3), y=0.003, s=(1.3, 0.8, 1)), pick(['pine', 'leaf']))], X, Z, 0.0 + rng.random() * 0.1, 0.08 + rng.random() * 0.08, foot=0)

def build_vardzia():
    # Vardzia: the cave monastery cut into the cliff above the upper Mtkvari, terraces of dark openings and the bell cote on its ledge
    g = 'Scenery_Vardzia'; X, Z = stop3('Vardzia'); region_empty(g, X, Z)
    river2(g, X, Z, [[-0.2, 0.08], [-0.1, 0.06], [0.0, 0.05], [0.1, 0.06], [0.2, 0.04]], 0.013)
    cliff = []
    for r, (w, h, d, zb) in enumerate(((0.15, 0.014, 0.034, 0.0), (0.13, 0.013, 0.028, -0.004), (0.11, 0.012, 0.022, -0.008))):
        y0 = sum(t[1] for t in ((0.15, 0.014, 0.034, 0.0), (0.13, 0.013, 0.028, -0.004), (0.11, 0.012, 0.022, -0.008))[:r])
        cliff.append((T(box(w, h, d), 0, y0, zb), 'stoneY' if r < 2 else 'stoneD'))
        n = 9 - r
        for k in range(n):
            x_ = -w / 2 + 0.012 + k * (w - 0.024) / (n - 1)
            cliff.append((T(box(0.0055, 0.0065, 0.0014), x_, y0 + 0.004, zb + d / 2 + 0.0003), 'ink'))
            if (k + r) % 2 == 0: cliff.append((T(box(0.009, 0.0012, 0.0035), x_, y0 + 0.0025, zb + d / 2 + 0.002), 'stoneD'))
    cliff += [(T(box(0.16, 0.006, 0.03), 0, 0.039, -0.012), 'rockG'), (T(box(0.12, 0.008, 0.02), 0, 0.045, -0.018), 'rockD')]
    cliff += [(T(box(0.012, 0.012, 0.009), 0.025, 0.027, 0.004), 'stoneY'), (T(gable(0.009, 0.004, 0.013), 0.025, 0.039, 0.004, ry=PI / 2), 'roofD'), (T(box(0.005, 0.008, 0.005), 0.04, 0.027, 0.004), 'stoneY'),
              (T(cone(0.0045, 0.005, 4), 0.04, 0.035, 0.004, ry=PI / 4), 'roofD'), (T(box(0.0008, 0.005, 0.0008), 0.025, 0.043, 0.004), 'gold')]
    place(g, cliff, X, Z, 0.0, -0.01, ry=0.0, foot=0.02, sink=0.006)
    road(g, X, Z, [[-0.2, 0.1], [-0.08, 0.085], [0.0, 0.075], [0.12, 0.08], [0.22, 0.07]], wdt=0.005, mat='road')
    for t in range(8): place(g, tree(0.022 + rng.random() * 0.008), X, Z, -0.12 + rng.random() * 0.24, 0.02 + rng.random() * 0.03, foot=0)
    for t in range(10): place(g, boulder(0.7 + rng.random()), X, Z, -0.15 + rng.random() * 0.3, -0.08 + rng.random() * 0.06, foot=0)
    for h in range(4): place(g, house(w=0.016, d=0.013, h=0.011, wall='stoneY', roof='roof'), X, Z, 0.12 + h * 0.022, 0.1 + (h % 2) * 0.015, ry=0.2, foot=0.008)

def build_uplistsikhe():
    # Gori and Uplistsikhe: the cave town carved into its rock above the Mtkvari, Gori's fortress on the hill across the plain
    g = 'Scenery_Uplistsikhe'; X, Z = stop3('Uplistsikhe'); region_empty(g, X, Z)
    river2(g, X, Z, [[-0.3, 0.06], [-0.15, 0.05], [0.0, 0.04], [0.12, 0.05], [0.25, 0.03]], 0.014)
    RX, RY, RZ = 0.06, 0.05, 0.042
    rock = [(T(box(0.15, 0.012, 0.11)), 'rockG'), (T(dome(1.0, 12, 4), y=0.012, s=(RX, RY, RZ)), 'ochre'), (T(dome(1.0, 10, 3), 0.058, 0.012, 0.016, s=(0.03, 0.026, 0.024)), 'stoneD'), (T(dome(1.0, 10, 3), -0.062, 0.012, -0.008, s=(0.028, 0.022, 0.024)), 'stoneD')]
    for k in range(16):  # cave mouths in rows around the sunny face
        row = k % 3; a = 0.25 + (k // 3) * 0.42 + row * 0.14; hf = 0.25 + row * 0.22
        rr = math.sqrt(max(0.0, 1 - hf * hf)); px_, pz_ = math.cos(a) * RX * rr, math.sin(a) * RZ * rr
        rock.append((T(box(0.007, 0.0055, 0.004), px_ * 0.98, 0.012 + hf * RY - 0.0025, pz_ * 0.98, ry=-a + PI / 2), 'ink'))
        if row == 0: rock.append((T(box(0.012, 0.0014, 0.006), px_, 0.012 + hf * RY - 0.006, pz_, ry=-a + PI / 2), 'stoneD'))
    rock += [(T(gm, 0.0, 0.012 + RY - 0.003, -0.008), m) for gm, m in church(0.02, 0.011, 0.013, 'brick', 'roofD', drumR=0.0042, drumH=0.009, domeH=0.009)]
    place(g, rock, X, Z, 0.0, -0.02, ry=0.1, foot=0.04, sink=0.004)
    gx, gz = -0.18, -0.03  # Gori fortress: an oval wall on its hill, the town around it
    wall_line(g, X, Z, [(gx + math.cos(k / 12 * 2 * PI) * 0.04, gz + math.sin(k / 12 * 2 * PI) * 0.028) for k in range(12)], h=0.009, th=0.004, mat='stoneG', closed=True, crenel=True)
    for k in range(4): place(g, [(cyl(0.005, 0.016, 8), 'stoneG')], X, Z, gx + math.cos(k / 4 * 2 * PI + 0.4) * 0.04, gz + math.sin(k / 4 * 2 * PI + 0.4) * 0.028, foot=0.004)
    for h in range(12):
        place(g, house(w=0.016 + rng.random() * 0.01, h=0.011 + rng.random() * 0.007, wall=pick(['stone', 'ochre', 'stoneY', 'rose']), roof=pick(['roof', 'roofD']), balcony=rng.random() > 0.6),
              X, Z, *spot('go', -0.26, 0.16, 0.03, 0.08, mind=0.026), ry=(rng.random() - 0.5) * 0.6)
    place(g, church(0.02, 0.011, 0.013, 'stoneY', 'roofG', drumR=0.0042, drumH=0.01, domeH=0.009), X, Z, -0.2, 0.07, ry=0.3, foot=0.008)
    road(g, X, Z, [[-0.32, 0.09], [-0.2, 0.1], [-0.08, 0.09], [0.02, 0.085], [0.14, 0.09], [0.26, 0.08]], wdt=0.0065, mat='asphalt')
    for t in range(10): place(g, tree(0.024 + rng.random() * 0.01), X, Z, -0.3 + rng.random() * 0.2, 0.1 + rng.random() * 0.05, foot=0)
    for t in range(6): place(g, cypress(0.035), X, Z, 0.08 + rng.random() * 0.1, -0.06 + rng.random() * 0.08, foot=0)
    for t in range(6): place(g, boulder(0.8 + rng.random()), X, Z, -0.06 + rng.random() * 0.2, -0.08 + rng.random() * 0.05, foot=0)

# ------------------------------------------------------------------------------------------------ 5 · Svaneti
def build_svaneti():
    g = 'Svaneti'; X, Z = stop3('Mestia'); region_empty(g, X, Z)
    # the Enguri along the valley floor, the road beside it (a loop up to Ushguli and back on the other bank), a hiking path up to the ridge
    river2(g + ':Enguri', X, Z, [[-0.22, 0.09], [-0.12, 0.06], [-0.02, 0.05], [0.07, 0.07], [0.14, 0.11], [0.2, 0.13], [0.28, 0.15]], 0.012)
    C = road(g + ':Roads', X, Z, [[-0.2, 0.03], [-0.1, 0.02], [0.0, 0.03], [0.09, 0.045], [0.15, 0.075], [0.2, 0.105], [0.21, 0.14], [0.14, 0.14], [0.06, 0.11], [-0.03, 0.095], [-0.12, 0.1], [-0.2, 0.08]],
             wdt=0.0065, mat='road', closed=True, n=120)
    road(g + ':Paths', X, Z, [[0.04, 0.03], [0.02, -0.03], [0.05, -0.08], [0.02, -0.13]], wdt=0.0035, mat='path')
    drive(g, 'Svaneti_Jeep', jeep(), C, laps=1.0, phase=0.3, s=0.85)
    # Mestia: towers, each beside its family house (machubi), gathered on the valley floor
    me = g + ':Mestia'
    towers = [(0.02, -0.03, 0.1), (0.04, -0.045, 0.112), (0.062, -0.028, 0.094), (0.078, -0.044, 0.106), (0.05, -0.008, 0.088),
              (0.004, -0.012, 0.096), (0.088, -0.016, 0.1), (0.028, 0.006, 0.09), (0.066, 0.01, 0.084)]
    for k, t in enumerate(towers):
        P = svan_tower(t[2]); hx = (1 if k % 2 else -1) * 0.016
        P += [(T(gm, hx, 0, 0.004), m) for gm, m in house(w=0.028, d=0.02, h=0.015, wall='stoneS', roof='slate', chimney=True)]
        place(me, P, X, Z, t[0], t[1], ry=(rng.random() - 0.5) * 0.4, foot=0.016)
    place(me, church(0.036, 0.018, 0.02, 'stoneS', 'slate', drumR=0.006, drumH=0.012, domeH=0.012), X, Z, 0.1, 0.012, ry=0.2, foot=0.014)
    # Ushguli: the tight cluster of towers up the valley under Shkhara, with the Lamaria church on its knoll
    us = g + ':Ushguli'
    for k, t in enumerate(((0.16, 0.08, 0.085), (0.175, 0.065, 0.092), (0.192, 0.082, 0.08), (0.17, 0.1, 0.088), (0.205, 0.06, 0.078), (0.185, 0.11, 0.082), (0.215, 0.088, 0.086))):
        P = svan_tower(t[2]); P += [(T(gm, 0.012 * (1 if k % 2 else -1), 0, 0.003), m) for gm, m in house(w=0.022, d=0.016, h=0.013, wall='stoneS', roof='slate')]
        place(us, P, X, Z, t[0], t[1], ry=(rng.random() - 0.5) * 0.4, foot=0.012)
    place(us, church(0.026, 0.013, 0.015, 'stoneS', 'slate', drumR=0.0045, drumH=0.009, domeH=0.009), X, Z, 0.235, 0.055, ry=-0.3, foot=0.012)
    wall_line(us, X, Z, [(0.22, 0.04), (0.25, 0.04), (0.25, 0.07), (0.22, 0.07)], h=0.004, th=0.003, mat='stoneS', closed=True)
    # alpine forest on the lower slopes, meadows and hay stacks by the river
    for k in range(40):
        a = rng.random() * 2 * PI; r = 0.09 + rng.random() * 0.1
        place(g, pine(0.034 + rng.random() * 0.02), X, Z, 0.08 + math.cos(a) * r * 1.4, -0.03 + math.sin(a) * r * 0.75, foot=0)
    for k in range(6): place(g, [(cone(0.006, 0.012, 6), 'ochre'), (T(box(0.0008, 0.016, 0.0008)), 'wood')], X, Z, -0.02 + rng.random() * 0.12, 0.06 + rng.random() * 0.03, foot=0)
    for k in range(10): place(g, boulder(1.0 + rng.random()), X, Z, -0.1 + rng.random() * 0.4, -0.16 + rng.random() * 0.08, foot=0)
    for k in range(4): sway_tree(g, 'Svaneti_Tree%d' % (k + 1), pine(0.04), X, Z, -0.08 + k * 0.035, 0.12 + (k % 2) * 0.02, amp=0.02, phase=k * 0.9)
    h0 = REGION[g][1][2, 3]
    bird(g, 'Svaneti_EagleA', (X + 0.08 * LM, 0, Z - 0.03 * LM), 0.14 * LM, h0 + 0.42, col='horseD', size=1.4, turns=1, phase=0.0, flap=1)
    bird(g, 'Svaneti_EagleB', (X + 0.02 * LM, 0, Z - 0.0 * LM), 0.08 * LM, h0 + 0.36, col='horseD', size=1.2, turns=-1, phase=2.0, flap=1)
    dest_hooks(g, X, Z, 0.09, 0.03, 0.26, 0.2, (0.09, 0.1, 0.05, -0.55, 38, 2.4))

# ------------------------------------------------------------------------------------------------ 6 · Batumi
def build_batumi():
    g = 'Batumi'; X, Z = stop3('Batumi'); region_empty(g, X, Z)
    B0 = G['places']['Batumi']; line = []
    for c in range(len(COAST) - 1):
        a, b = COAST[c], COAST[c + 1]; n = math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / 3)
        for s2 in range(n):
            px, py = a[0] + (b[0] - a[0]) * s2 / n, a[1] + (b[1] - a[1]) * s2 / n
            if B0[1] - 46 < py < B0[1] + 16: line.append((px, py))
    bv = g + ':Boulevard'
    for k, pt in enumerate(line):
        nb_, pv = line[min(len(line) - 1, k + 1)], line[max(0, k - 1)]
        tx, ty = nb_[0] - pv[0], nb_[1] - pv[1]; tl = math.hypot(tx, ty) or 1
        nx, ny = -ty / tl, tx / tl
        if not inside_map(pt[0] + nx * 4, pt[1] + ny * 4): nx, ny = -nx, -ny
        ang = -math.atan2(ty, tx)
        off = lambda d: ((pt[0] + nx * d - B0[0]) * S / LM, (pt[1] + ny * d - B0[1]) * S / LM)
        o1, o2, o3, o4, o5 = off(1.6), off(4.2), off(6.4), off(1.2), off(8.6)
        place(bv, [(T(box(3.6 * S / LM, 0.0012, 2.8 * S / LM), ry=ang), 'sand')], X, Z, *o1, foot=0, sink=0.0004)
        place(bv, [(T(box(3.6 * S / LM, 0.0014, 1.1 * S / LM), ry=ang), 'stoneD')], X, Z, *o2, foot=0, sink=0.0004)
        place(bv, [(T(box(3.6 * S / LM, 0.0016, 1.6 * S / LM), ry=ang), 'leafL')], X, Z, *o5, foot=0, sink=0.0004)  # the lawns of the promenade
        if k % 2 == 0: place(bv, palm(0.05 + rng.random() * 0.014, (rng.random() - 0.5) * 0.5, rng.random() * 6.28), X, Z, *o3, foot=0)
        if k % 2 == 1: place(bv, [(T(box(0.012, 0.004, 0.006)), pick(['flower', 'yellow', 'rose'])), (T(box(0.014, 0.0012, 0.008)), 'stoneD')], X, Z, *o5, foot=0)
        if k % 3 == 1: place(bv, [(cyl(0.0007, 0.012, 4), 'white'), (T(cone(0.0085, 0.0035, 8), y=0.011), 'red' if k % 2 else 'white'), (T(box(0.008, 0.0015, 0.0035), 0.006, 0, 0.004), 'white')], X, Z, *o4, foot=0)
        if k % 4 == 2: place(bv, [(T(cyl(0.0007, 0.014, 4), y=0), 'ink'), (T(ball(0.0018, 5, 3), y=0.014), 'lamp')], X, Z, *off(5.4), foot=0)  # lamps along the boulevard
    # the Alphabet Tower: double helix of letters, with the glass globe turning at the top
    TH = 0.17; P = [(cyl(0.013, 0.005, 12), 'white'), (T(cyl(0.0042, TH, 8), y=0.005), 'white')]
    for ph in (0, PI):
        hp = [(math.cos(t / 120 * PI * 7 + ph) * 0.0108, 0.006 + t / 120 * TH * 0.88, math.sin(t / 120 * PI * 7 + ph) * 0.0108) for t in range(121)]
        P.append((tube(hp, 0.0016, 4), 'steel'))
    for k in range(28):
        t = k / 28; ph = (k % 2) * PI; a = t * PI * 7 + ph
        P.append((T(box(0.003, 0.0035, 0.0012), math.cos(a) * 0.0122, 0.008 + t * TH * 0.86, math.sin(a) * 0.0122, ry=-a), 'gold'))
    Ma = place(g + ':AlphabetTower', P, X, Z, 0.05, 0.03, foot=0.01)
    if Ma is not None:
        gl = anim_obj('Batumi_AlphabetGlobe', [(ball(0.0135, 10, 6), 'glass'), (T(torus(0.0138, 0.0012, 4, 20), rx=PI / 2), 'white'), (T(cyl(0.0007, 0.03, 4), y=0.012), 'white'),
                                               (T(box(0.03, 0.0012, 0.0012)), 'gold')], Ma @ mat4(y=TH + 0.008), g)
        k_spin(gl, 2, 1.0)
    ferris(g, X, Z, 0.09, -0.035, R=0.034, n=12, ry=0.55, name='Batumi_Wheel')
    # the lighthouse with its turning beam
    Lh = [(cyl(0.006, 0.003, 10), 'white')]
    for b in range(5): Lh.append((T(cyl(0.0043 - b * 0.0003, 0.0075, 10, 0.0046 - b * 0.0003), y=0.003 + b * 0.0075), 'white' if b % 2 else 'red'))
    Lh += [(T(cyl(0.0032, 0.006, 8), y=0.0405), 'glass'), (T(cone(0.0042, 0.006, 8), y=0.0465), 'red')]
    lh = line[int(len(line) * 0.62)] if line else B0
    Ml = place(g + ':Lighthouse', Lh, X, Z, (lh[0] + 3 - B0[0]) * S / LM, (lh[1] - B0[1]) * S / LM, foot=0)
    if Ml is not None:
        beam = anim_obj('Batumi_LighthouseBeam', [(T(cone(0.006, 0.05, 4), rz=PI / 2, x=0.05), 'lamp'), (T(ball(0.0026, 5, 3)), 'lamp')], Ml @ mat4(y=0.0435), g)
        k_spin(beam, 2, 4.0)
    # the waterfront skyline: glass towers, the Batumi Tower with its little wheel, the Piazza's clock tower
    sk = g + ':Skyline'
    for t in ((0.085, 0.07, 0.07, 'glass'), (0.105, 0.05, 0.1, 'glassD'), (0.125, 0.078, 0.086, 'glass'), (0.135, 0.03, 0.062, 'glassD'), (0.11, 0.1, 0.055, 'glass'), (0.15, 0.06, 0.08, 'glass'), (0.16, 0.095, 0.05, 'glassD')):
        Bd = [(box(0.017, t[2], 0.017), t[3])] + [(T(box(0.0176, 0.0012, 0.0176), y=f * 0.012), 'white') for f in range(1, int(t[2] / 0.012) + 1)]
        Bd.append((T(box(0.012, 0.004, 0.012), y=t[2]), 'white'))
        place(sk, Bd, X, Z, t[0], t[1], ry=0.25, foot=0.008)
    bt = [(box(0.016, 0.13, 0.016), 'glassD')] + [(T(box(0.0166, 0.0012, 0.0166), y=f * 0.012), 'white') for f in range(1, 11)] + [(T(torus(0.011, 0.0012, 4, 16), 0.011, 0.085, 0, ry=PI / 2), 'gold'), (T(cone(0.006, 0.02, 6), y=0.13), 'white')]
    place(sk, bt, X, Z, 0.075, 0.095, ry=0.25, foot=0.008)
    place(g + ':Piazza', [(box(0.04, 0.003, 0.03), 'stoneD'), (T(box(0.008, 0.04, 0.008), 0.014, 0, 0.008), 'stoneY'), (T(cone(0.006, 0.008, 4), 0.014, 0.04, 0.008, ry=PI / 4), 'roofD'),
                           (T(cyl(0.0022, 0.0008, 8), 0.014, 0.034, 0.0122, rx=PI / 2), 'white'), (T(box(0.024, 0.014, 0.01), -0.006, 0, -0.008), 'ochre'), (T(gable(0.011, 0.004, 0.026), -0.006, 0.014, -0.008, ry=PI / 2), 'roof')],
          X, Z, 0.03, 0.075, ry=0.25, foot=0.012)
    for h in range(10):
        place(g, house(w=0.018 + rng.random() * 0.01, h=0.014 + rng.random() * 0.01, wall=pick(['stone', 'sky', 'rose', 'ochre']), roof=pick(['roof', 'roofD']), balcony=rng.random() > 0.5),
              X, Z, *spot('ba', 0.04, 0.1, 0.11, 0.05), ry=0.25 + (rng.random() - 0.5) * 0.3)
    # the subtropical hills behind: tea bushes in rows, citrus, then the forest climbing inland
    for r in range(5):
        for k in range(7): place(g, [(T(ball(0.0045, 5, 3), y=0.003, s=(1.5, 0.7, 1.1)), 'leafL')], X, Z, 0.12 + k * 0.013 + r * 0.004, 0.16 + r * 0.011, foot=0)
    for t in range(14): place(g, tree(0.024 + rng.random() * 0.01), X, Z, 0.17 + rng.random() * 0.12, 0.03 + rng.random() * 0.12, foot=0)
    for t in range(10): place(g, [(T(ball(0.005, 5, 3), y=0.004), 'leaf'), (T(ball(0.0012, 4, 3), 0.003, 0.006, 0.002), 'yellow')], X, Z, 0.19 + rng.random() * 0.06, 0.15 + rng.random() * 0.05, foot=0)
    for k in range(4): sway_tree(g, 'Batumi_Palm%d' % (k + 1), palm(0.056, 0.15, k * 1.5), X, Z, 0.02 + k * 0.018, 0.04 + k * 0.004, amp=0.03, phase=k * 0.7)
    # Ali and Nino: two steel figures gliding towards each other and through each other
    Mn = placeM(X, Z, 0.015, -0.075, ry=0.4, foot=0)
    if Mn is not None:
        emit(g + ':AliAndNino', 'stoneD', box(0.05, 0.002, 0.012), Mn)
        for k, (nm, h_) in enumerate((('Ali', 0.04), ('Nino', 0.036))):
            fig = [(T(box(0.0016, h_, 0.006), y=0.002), 'steel'), (T(ball(0.0035, 6, 4), y=h_ + 0.004), 'steel')]
            fo = anim_obj('Batumi_' + nm, fig, Mn, g)
            k_wave(fo, 'location', 0, 0.018 * LM * (1 if k == 0 else -1), cycles=1, phase=0)
    # boats sailing slow loops off the coast, bobbing on the swell
    SAIL = [(T(gable(0.008, 0.004, 0.022), y=0.004, rz=PI), 'hull'), (T(box(0.007, 0.003, 0.018), y=0.004), 'hull'), (T(box(0.006, 0.0008, 0.016), y=0.007), 'deck'),
            (T(box(0.0008, 0.03, 0.0008), 0, 0.007, 0.002), 'white'), (Geo([(0, 0.01, 0.004), (0, 0.036, 0.0025), (0, 0.01, -0.011)], [(0, 1, 2)]), 'sail'),
            (Geo([(0, 0.01, 0.0045), (0, 0.03, 0.0035), (0, 0.01, 0.014)], [(0, 1, 2)]), 'sail')]
    FERRY = [(T(box(0.012, 0.006, 0.04), y=0.0), 'white'), (T(box(0.0124, 0.0016, 0.0404), y=0.0), 'hull'), (T(box(0.009, 0.005, 0.022), y=0.006), 'white'),
             (T(box(0.0092, 0.0016, 0.0222), y=0.0085), 'glassD'), (T(cyl(0.0018, 0.006, 6), 0, 0.011, -0.006), 'red')]
    for k, (cxm, cym, ra, rb, kind) in enumerate(((256, 392, 7, 13, SAIL), (247, 414, 6, 9, SAIL), (238, 385, 9, 16, FERRY), (262, 372, 5, 9, SAIL))):
        Mb0 = mat4(wx(cxm), SEA_Y, wz(cym), s=LM)
        ob = anim_obj('Batumi_Boat%d' % (k + 1), kind, Mb0, g)
        d_ = 1 if k % 2 else -1
        k_path(ob, g, lambda u, cxm=cxm, cym=cym, ra=ra, rb=rb, d_=d_, k=k: (wx(cxm + ra * math.cos(d_ * 2 * PI * u + k)), SEA_Y + 0.0006 + 0.0025 * math.sin(2 * PI * 6 * u + k), wz(cym + rb * math.sin(d_ * 2 * PI * u + k))),
               step=4, yaw_off=-PI / 2)
        k_wave(ob, 'rotation_euler', 0, 0.08, cycles=5, phase=k)
    for k in range(3):
        bird(g, 'Batumi_Gull%d' % (k + 1), (wx(270 + k * 6), 0, wz(392 + k * 5)), 0.05 + k * 0.03, SEA_Y + 0.2 + k * 0.05, col='white', size=0.9, turns=(1 if k % 2 else -1) * (1 + k % 2), phase=k * 2.0, flap=3)
    dest_hooks(g, X, Z, 0.07, 0.04, 0.2, 0.18, (0.07, 0.06, 0.0, -1.55, 44, 1.75))

for fn in (build_tbilisi, build_kakheti, build_tusheti, build_kutaisi, build_kazbegi, build_vardzia, build_uplistsikhe, build_svaneti, build_batumi):
    fn(); print('  ', fn.__name__, round(time.time() - t_start, 1), 's')

# static pieces: one mesh per region, plus one per named landmark
for group, items in BUCKET.items():
    base, _, sub = group.partition(':'); e, PM = REGION[base]; nm = base + '_' + (sub or 'Static')
    me = mesh_from(nm, items, origin=PM[:3, 3])
    ob = bpy.data.objects.new(nm, me); COLL.objects.link(ob); ob.parent = e
    if not sub: print('  %s: %d verts' % (group, len(me.vertices)))

# the overview camera
make_camera('Cam_overview', (0.0, 0.1, 0.05), -0.2, 50, 17.5, 50, 'CamTarget_overview')
scene.camera = CAMS['Cam_overview']

# clouds drifting along the Caucasus
CLOUDS = bpy.data.objects.new('Clouds', None); COLL.objects.link(CLOUDS); CLOUDS.parent = ROOT_EMPTY
for k, (mx, my, hy, s_) in enumerate(((300, 170, 1.15, 1.1), (395, 120, 1.3, 1.3), (520, 205, 1.05, 0.9), (610, 215, 1.2, 1.2), (705, 240, 1.1, 1.0),
                                       (820, 300, 1.0, 0.8), (470, 160, 1.3, 1.0), (190, 140, 1.0, 0.9))):
    cloud('Cloud%d' % (k + 1), wx(mx), hy, wz(my), s_, drift=0.1 + 0.05 * (k % 3), phase=k * 0.8)

# a soft contact shadow under the floating model
def contact_shadow():
    N = 256; img = bpy.data.images.new('contact_shadow', N, N, alpha=True)
    yy, xx = np.mgrid[0:N, 0:N]; d = np.hypot((xx - N / 2) / (N / 2), (yy - N / 2) / (N / 2))
    a = np.clip(1 - d, 0, 1) ** 1.6
    px = np.zeros((N, N, 4), np.float32); px[..., 3] = a * 0.55; px[..., :3] = 0.08
    img.pixels.foreach_set(px.ravel()); img.pack()
    m = bpy.data.materials.new('contact_shadow'); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
    nt.links.new(tex.outputs['Color'], b.inputs['Base Color']); nt.links.new(tex.outputs['Alpha'], b.inputs['Alpha'])
    b.inputs['Roughness'].default_value = 1.0; m.surface_render_method = 'BLENDED'; MATS['contact_shadow'] = m
    ex, ey = (OUTL.max(0) - OUTL.min(0)) * S * 0.72; cxo, cyo = OUTL.mean(0)
    me = bpy.data.meshes.new('ContactShadow')
    me.from_pydata([(wx(cxo) - ex, -wz(cyo) - ey, SLAB_BOTTOM - 0.1), (wx(cxo) + ex, -wz(cyo) - ey, SLAB_BOTTOM - 0.1), (wx(cxo) + ex, -wz(cyo) + ey, SLAB_BOTTOM - 0.1), (wx(cxo) - ex, -wz(cyo) + ey, SLAB_BOTTOM - 0.1)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name='UVMap'); uv.data.foreach_set('uv', [0, 0, 1, 0, 1, 1, 0, 1])
    me.materials.append(m); me.update()
    ob = bpy.data.objects.new('ContactShadow', me); COLL.objects.link(ob); ob.parent = ROOT_EMPTY
contact_shadow()

_prefs.keyframe_new_interpolation_type = _old_interp
for ob in COLL.objects:  # every face flat: the low-poly look
    if ob.type == 'MESH':
        for p in ob.data.polygons: p.use_smooth = False

scene.frame_set(0)
nverts = sum(len(o.data.vertices) for o in COLL.objects if o.type == 'MESH')
print('objects: %d, mesh verts: %d, built in %.1fs' % (len(COLL.objects), nverts, time.time() - t_start))
