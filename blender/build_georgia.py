"""
Voyage Georgia Rezo: low-poly 3D Georgia, built in Blender from the same data as the site's three.js scene.

Run inside Blender (via the MCP-for-Blender socket):  python3 blender/bl.py blender/build_georgia.py
Rebuilds the whole scene from scratch every run, so iterations are reproducible.

Coordinates match src/scripts/vgr3d.js exactly: three.js world (X, Y-up, Z) = Blender (X, -Y, Z-up), so the glTF
export (+Y up) lands where the site's routes, pins and camera already expect. Map units -> world: S = 0.01.
All animation loops over LOOP frames, so the exported clip repeats seamlessly.
"""
import bpy, bmesh, json, re, math, random, os, time, heapq
import numpy as np
from mathutils import Matrix, Vector
from mathutils.geometry import delaunay_2d_cdt
from mathutils.bvhtree import BVHTree

t_start = time.time()
_opts = dict((a.split('=', 1) + [''])[:2] for a in globals().get('ARGS', []))
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

# latitude/longitude -> map units: an affine fit to the site's places (residual 2-5 units, ~2-3 km)
_LLX = (126.06735, -1.17691, -4916.39124); _LLY = (0.17504, -169.25799, 7441.16833)
def ll_map(lat, lon): return (_LLX[0] * lon + _LLX[1] * lat + _LLX[2], _LLY[0] * lon + _LLY[1] * lat + _LLY[2])

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
    road=0xd6cfc0, path=0xc9bfa9, asphalt=0x8e8f93, jeep=0x4f5f42, rockG=0x9a948a, rockD=0x7c7670, flower=0xe25a7a, teal=0x3f8f8a,
    # buildings, from photographs of the real places
    samW=0xeee2c6, samR=0x8e979e, brickR=0xb06a45, brickD=0x8f5338, sandst=0xd9c39a, stoneAl=0xd8c49b, stoneGe=0x8f8576, stoneGeD=0x6f675c,
    stoneSv=0xdcd5c6, stoneUs=0x9a9183, slateSv=0x55595f, stoneTu=0x7b7469, slateTu=0x45474b, tuff=0xcaa985, tuffD=0xa98a66, tuffL=0xdcc3a0,
    tin=0x9ea4a7, tinR=0x9a4e37, tinG=0x5d7d6b, tile=0xb0573a, tileD=0x8f4a33, plaster=0xe8dcc6, plasterY=0xe6cf9c, plasterP=0xe3c1b4,
    plasterB=0xc9d6d6, plasterG=0xc8d2b4, balc=0x8a6243, balcD=0x5e4330, balcB=0x6e98a6, balcG=0x6c8c66, balcW=0xefe9de,
    pebble=0xb9b3a9, lawn=0x79a84a, glassB=0x86aec8, glassT=0x6fa6aa, glassG=0x9bb7a9, alu=0xd4d8db, bronze=0x4f4434,
    oak=0x5c7f37, oakD=0x4a6b2e, beech=0x4d7a33, spruce=0x2f5233, spruceD=0x27442b, pineT=0x3f6a3a, birch=0xeeeae0, birchL=0x8db152,
    poplar=0x5e8a39, olive=0x8a9a55, walnut=0x557d34, autumn=0xb08a3c, eucal=0x6f9468,
)
for k, v in PALETTE.items(): make_mat(k, v)
make_mat('gold', 0xe0ad37, rough=0.3, metal=0.9)
make_mat('steel', 0xc9cdd3, rough=0.3, metal=0.8)
make_mat('glass', 0x9fcfe8, rough=0.15, metal=0.2)
make_mat('glassD', 0x6f9fbe, rough=0.15, metal=0.2)
make_mat('water', 0x4f86b5, rough=0.2)
make_mat('waterR', 0x4d83a6, rough=0.18)   # lowland rivers
make_mat('waterG', 0x7fb2bb, rough=0.25)   # glacial, milky
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
PEAK_FROM, PEAK_K = 2300, 0.3               # the high Caucasus gets a little taller still, for drama

# Each stop sits on a gently levelled shelf, like a diorama base, so its buildings stand on the valley floor
# rather than climbing the peaks. (centre offset in landmark units, levelling strength, inner/outer radius in map units)
SHELF = {'Tbilisi': ((-0.02, -0.02), 0.55, 16, 40), 'Telavi': ((0.06, 0.0), 0.6, 20, 46), 'Omalo': ((-0.05, 0.0), 0.65, 13, 34),
         'Kutaisi': ((0.04, -0.03), 0.5, 18, 42), 'Mestia': ((0.05, 0.0), 0.7, 10, 22), 'Batumi': ((0.04, 0.0), 0.5, 10, 24),
         'Ushguli': ((0.0, 0.01), 0.55, 6, 13),
         (741, 264): ((0, 0), 0.6, 7, 16),   # Dartlo
         'Stepantsminda': ((0.02, 0.02), 0.55, 9, 20), 'Vardzia': ((0.03, 0.0), 0.45, 8, 18), 'Uplistsikhe': ((-0.06, 0.0), 0.5, 12, 28)}
def loc(place, dx, dz):
    """a point given in landmark units from a place -> map units"""
    p = G['places'][place] if isinstance(place, str) else place
    return (p[0] + dx * LM / S, p[1] + dz * LM / S)
# Landforms the stops need that the 650 m terrain grid smooths away: (kind, place, args in landmark units, metres)
#   ('bump', place, (dx, dz, r), dh)            a round hill
#   ('ridge', place, (x0, z0, x1, z1, r), dh)    a long rounded ridge (dh < 0 carves a trough)
#   ('flat', place, (dx, dz, r0, r1), w)        level an area to its 30th percentile height
SCULPT = [
    # Tbilisi: the Sololaki ridge with Narikala, Mtatsminda above it, Elia hill under Sameba, Metekhi's rock over the gorge
    ('ridge', 'Tbilisi', (-0.06, 0.036, -0.12, 0.046, 0.024), 190), ('ridge', 'Tbilisi', (-0.12, 0.046, -0.16, -0.035, 0.034), 300),
    ('bump', 'Tbilisi', (0.088, -0.07, 0.04), 70), ('ridge', 'Tbilisi', (0.016, -0.004, 0.034, -0.022, 0.014), 75),
    # Kakheti: Sighnaghi's ridge, Gremi's knoll, Alaverdi's level valley floor
    ('ridge', 'Telavi', (0.17, 0.16, 0.25, 0.235, 0.035), 230), ('bump', 'Telavi', (0.116, -0.062, 0.022), 90),
    ('flat', 'Telavi', (0.03, -0.04, 0.09, 0.16), 0.6),
    # Tusheti: Keselo's spur above Omalo, Dartlo's slope
    ('bump', 'Omalo', (0.004, -0.04, 0.04), 140),
    # Kazbegi: Gergeti's knoll; Kutaisi: Bagrati's hill (Ukimerioni) and Gelati's
    ('bump', 'Stepantsminda', (-0.036, -0.008, 0.035), 210), ('bump', 'Kutaisi', (-0.045, -0.05, 0.035), 70), ('bump', 'Kutaisi', (0.15, -0.105, 0.04), 120),
    # Vardzia: the Erusheti cliff west of the river; Uplistsikhe: its rock on the left bank; Gori's castle hill
    ('ridge', 'Vardzia', (-0.085, -0.09, -0.085, 0.04, 0.045), 380), ('bump', 'Uplistsikhe', (0.02, -0.04, 0.045), 90),
    ('bump', 'Uplistsikhe', (-0.16, -0.09, 0.03), 70),
    # Batumi: the city on its coastal plain, the hills only behind it
    ('flat', 'Batumi', (0.07, -0.04, 0.08, 0.13), 0.9),
]
# the great peaks, back to their real heights where the 650 m grid has worn them down: (place, real metres, radius in map units)
PEAKS = [('Kazbek', 5047, 4.5), ('Shkhara', 5193, 5.0), ('Ushba', 4710, 3.5)]
# stretches where a stop's own rivers replace the traced ones (place, dx, dz, r in landmark units)
NO_RIVER = [('Batumi', 0.07, 0.02, 0.105), ('Omalo', 0.0, 0.0, 0.12)]
LOCAL_CHANNELS = [   # roads and rivers of the stops, cut into the land too (see add_local_channel); wdt in landmark units
    # Tbilisi: the van's loop - down the right-bank embankment, over the Metekhi bridge, up past Rike and Avlabari, back over the river
    dict(key='tb_loop', kind='road', place='Tbilisi', pts=[(-0.052, -0.03), (-0.047, -0.002), (-0.032, 0.013), (0.03, 0.016), (0.05, -0.008), (0.054, -0.045), (0.032, -0.082), (-0.02, -0.086), (-0.064, -0.06)],
         wdt=0.0075, mat='asphalt', group='Tbilisi:Roads', closed=True),
    # Kakheti: Telavi - Tsinandali - down the valley under the Gombori ridge - Sighnaghi - back along the Alazani - Alaverdi - Telavi
    dict(key='ka_loop', kind='road', place='Telavi', pts=[(-0.005, 0.045), (0.06, 0.05), (0.12, 0.095), (0.168, 0.15), (0.19, 0.19), (0.16, 0.125), (0.12, 0.055), (0.07, 0.0),
                                                         (0.02, -0.028), (-0.05, -0.04), (-0.098, -0.02), (-0.07, 0.025)], wdt=0.0085, mat='road', group='Kakheti:Roads', closed=True),
    # Tusheti: the Pirikiti and Gometsari Alazani either side of Omalo, and the jeep track out to Dartlo and back
    dict(key='tu_pir', kind='river', place='Omalo', pts=[(-0.33, -0.125), (-0.25, -0.095), (-0.17, -0.083), (-0.1, -0.078), (-0.04, -0.075), (0.02, -0.07), (0.07, -0.045)],
         wdt=0.011, mat='waterG', group='Tusheti:River'),
    dict(key='tu_gom', kind='river', place='Omalo', pts=[(-0.3, 0.13), (-0.2, 0.105), (-0.1, 0.09), (-0.04, 0.086), (0.0, 0.082)],
         wdt=0.01, mat='waterG', group='Tusheti:River'),
    dict(key='tu_loop', kind='road', place='Omalo', pts=[(0.0, 0.028), (-0.03, 0.034), (-0.08, 0.028), (-0.12, 0.0), (-0.15, -0.03), (-0.172, -0.05), (-0.205, -0.04), (-0.18, -0.008),
                                                         (-0.135, 0.024), (-0.09, 0.05), (-0.04, 0.058), (-0.008, 0.05)], wdt=0.0055, mat='path', group='Tusheti:Roads', closed=True),
    # Svaneti: the road through Mestia and on up the Enguri to Ushguli, a loop back on the other side of the valley
    dict(key='sv_loop', kind='road', place='Mestia', pts=[(-0.12, -0.02), (-0.06, -0.01), (0.0, 0.0), (0.05, 0.01), (0.085, 0.035), (0.1, 0.07), (0.088, 0.1), (0.055, 0.08), (0.02, 0.055),
                                                         (-0.04, 0.052), (-0.1, 0.036), (-0.14, 0.01)], wdt=0.0065, mat='road', group='Svaneti:Roads', closed=True),
    # Batumi: the Chorokhi to the sea south of the city; the seafront avenue
    dict(key='ba_chor', kind='river', place='Batumi', pts=[(0.18, -0.004), (0.13, 0.024), (0.07, 0.05), (0.01, 0.062), (-0.045, 0.066)], wdt=0.017, mat='waterR', group='Batumi:River'),
    # Kazbegi: the Georgian Military Highway along the Terek, and the track up to Gergeti
    dict(key='kz_hwy', kind='road', place='Stepantsminda', pts=[(0.04, 0.14), (0.03, 0.07), (0.02, 0.02), (0.016, -0.04), (0.012, -0.13)], wdt=0.0065, mat='asphalt', group='Scenery_Kazbegi:Roads'),
    dict(key='kz_ger', kind='road', place='Stepantsminda', pts=[(0.018, 0.006), (-0.012, 0.012), (-0.025, 0.026), (-0.04, 0.016), (-0.032, 0.006)], wdt=0.0045, mat='path', group='Scenery_Kazbegi:Roads'),
]

def catmull(pts, n):
    P = [np.array(p, float) for p in pts]; P = [P[0]] + P + [P[-1]]
    out = []
    segs = len(P) - 3
    for k in range(n + 1):
        u = k / n * segs; i = min(int(u), segs - 1); t = u - i
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return out

def _smooth01(t): t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)
def shelf(X, Y, H):
    H = H.copy()
    for name, ((ox, oz), wmax, r0, r1) in SHELF.items():
        r0, r1 = r0 * LMK, r1 * LMK
        p = G['places'][name] if isinstance(name, str) else name; qx, qy = p[0] + ox * LM / S, p[1] + oz * LM / S
        d = np.hypot(X - qx, Y - qy)
        near = d < r0
        if not near.any(): continue
        target = np.percentile(H[near], 25)
        w = wmax * (1 - _smooth01((d - r0) / (r1 - r0)))
        H = H * (1 - w) + target * w
    for kind, place, a, dh in SCULPT:
        k = LM / S
        if kind == 'bump':
            qx, qy = loc(place, a[0], a[1]); d = np.hypot(X - qx, Y - qy) / (a[2] * k)
        elif kind == 'ridge':
            (x0, y0), (x1, y1) = loc(place, a[0], a[1]), loc(place, a[2], a[3]); ex, ey = x1 - x0, y1 - y0; L2 = ex * ex + ey * ey
            t = np.clip(((X - x0) * ex + (Y - y0) * ey) / L2, 0, 1); d = np.hypot(X - x0 - t * ex, Y - y0 - t * ey) / (a[4] * k)
        elif kind == 'flat':
            qx, qy = loc(place, a[0], a[1]); d0 = np.hypot(X - qx, Y - qy)
            near = d0 < a[2] * k
            if near.any():
                w = dh * (1 - _smooth01((d0 - a[2] * k) / ((a[3] - a[2]) * k)))
                H = H * (1 - w) + np.percentile(H[near], 30) * w
            continue
        H = H + dh * (1 - _smooth01(d))
    for name, real, r in PEAKS:
        p = G['places'][name]; dh = max(0.0, real - float(h_at(p[0], p[1]))) * 0.85
        H = H + dh * (1 - _smooth01(np.hypot(X - p[0], Y - p[1]) / r))
    return H + np.maximum(0, H - PEAK_FROM) * PEAK_K
ROCK, EARTH, PLINTH = np.array(srgb(0x8f897d)), np.array(srgb(0x6e5c49)), np.array(srgb(0xe9e5dc))

# colour: two climates (the humid west, the dry east), banded by height, with noise, fields, forests, rock and snow
def _bands(spec): return [h for h, _ in spec], np.array([srgb(c) for _, c in spec])
WET = _bands([(0, 0x8bab55), (250, 0x76a046), (600, 0x55823a), (1200, 0x4a7339), (1850, 0x6b8a43), (2450, 0x8c9a5a),
              (2950, 0x9a9285), (3300, 0xb2ada6), (3550, 0xeef1f4), (3950, 0xf6f8fa)])
DRY = _bands([(0, 0xc3b47c), (450, 0xb8ab70), (850, 0x9d9b60), (1250, 0x7d8b4b), (1850, 0x8a9358), (2450, 0x969a6c),
              (2950, 0x9a9285), (3300, 0xb2ada6), (3550, 0xeef1f4), (3950, 0xf6f8fa)])
def _band(spec, h):
    hs, cs = spec; h = np.clip(h, hs[0], hs[-1] - 1e-6)
    k = np.clip(np.searchsorted(hs, h, side='right'), 1, len(hs) - 1)
    t = _smooth01((h - np.take(hs, k - 1)) / (np.take(hs, k) - np.take(hs, k - 1)))[:, None]
    return cs[k - 1] * (1 - t) + cs[k] * t
def vnoise(x, y, scale, seed=0):
    gx, gy = np.asarray(x) / scale, np.asarray(y) / scale; i, j = np.floor(gx).astype(np.int64), np.floor(gy).astype(np.int64)
    fx, fy = _smooth01(gx - i), _smooth01(gy - j)
    def hh(a, b): return (((a * 73856093) ^ (b * 19349663) ^ (seed * 83492791)) % 1000003) / 1000003.0
    return (hh(i, j) * (1 - fx) + hh(i + 1, j) * fx) * (1 - fy) + (hh(i, j + 1) * (1 - fx) + hh(i + 1, j + 1) * fx) * fy
_fr = random.Random(5)
FIELD_SEEDS = np.array([(_fr.uniform(-80, 1080), _fr.uniform(-210, 790)) for _ in range(26000)])
FIELD_COLS = np.array([srgb(c) for c in (0xcdbf7e, 0x9db55c, 0xb3b96b, 0x86a04c, 0xd8c98c, 0xa58e64, 0x7c9a47, 0xc2a868)])
from mathutils.kdtree import KDTree as _KD
_fkd = _KD(len(FIELD_SEEDS))
for _k, (_x, _y) in enumerate(FIELD_SEEDS): _fkd.insert((_x, _y, 0), _k)
_fkd.balance()
URBAN_C = np.array(srgb(0xc9bfab))
URBAN = [('Tbilisi', -0.02, -0.03, 0.12, 0.24, 0.55), ('Telavi', -0.01, 0.03, 0.03, 0.07, 0.35), ('Telavi', 0.208, 0.198, 0.03, 0.06, 0.35),
         ('Kutaisi', 0.05, 0.0, 0.06, 0.14, 0.45), ('Batumi', 0.05, 0.0, 0.06, 0.12, 0.55), ('Mestia', 0.0, -0.03, 0.04, 0.09, 0.25),
         ('Stepantsminda', 0.05, 0.0, 0.03, 0.07, 0.3), ('Uplistsikhe', -0.2, -0.06, 0.04, 0.1, 0.35)]
RIPARIAN, FOREST, FORESTD = np.array(srgb(0x5f8f3d)), np.array(srgb(0x43703a)), np.array(srgb(0x35592f))

def veg_fields(x, y, h):
    """climate and vegetation at map points: dryness 0..1, two noise fields, a ragged height, and the forest mask 0..1"""
    x, y, h = (np.atleast_1d(np.asarray(v, float)) for v in (x, y, h))
    west = _smooth01((640 - x) / 200)                       # Imereti, Samegrelo, Guria, Adjara: wet
    dry = (1 - west) * _smooth01((y - 300) / 70) * _smooth01((1300 - h) / 500)
    dry *= 1 - 0.55 * _smooth01((x - 730) / 30) * _smooth01((405 - y) / 25) * _smooth01((620 - h) / 200)  # the Alazani valley is irrigated green
    n1, n2 = vnoise(x, y, 22, 1), vnoise(x, y, 7, 2)
    hj = h + (n1 - 0.5) * 260 + (n2 - 0.5) * 120                # bands with ragged edges
    belt = _smooth01((hj - (450 + 500 * dry)) / 150) * _smooth01((1950 - hj) / 150) * (1 - 0.7 * dry)
    fm = _smooth01((vnoise(x, y, 9, 3) * 0.7 + n2 * 0.3 - 0.38) / 0.12) * belt
    return dry, n1, n2, hj, fm

def land_colors(h, slope, x, y, drv=None):
    """vectorised: metres, 1 - |normal.z|, map x/y, distance to the nearest river bank -> linear RGB (n, 3)"""
    h, slope, x, y = (np.asarray(v, float) for v in (h, slope, x, y))
    dry, n1, n2, hj, fm = veg_fields(x, y, h)
    c = _band(WET, hj) * (1 - dry[:, None]) + _band(DRY, hj) * dry[:, None]
    c = c * (1 - 0.6 * fm[:, None]) + np.where((n1 > 0.5)[:, None], FOREST, FORESTD) * 0.6 * fm[:, None]
    # fields on the flat lowlands: irregular patches (Voronoi cells)
    flat = (slope < 0.1) & (h < 900)
    if flat.any():
        ids = np.array([_fkd.find((a, b, 0))[1] for a, b in zip(x[flat], y[flat])])
        fc = FIELD_COLS[ids % len(FIELD_COLS)] * (1 - 0.35 * dry[flat])[:, None] + np.array(srgb(0xc9b77c)) * 0.35 * dry[flat][:, None]
        c[flat] = c[flat] * 0.45 + fc * 0.55
    for (pl, ux, uz, r0, r1, k) in URBAN:   # towns: worn ground, gardens and paving between the houses
        qx, qy = loc(pl, ux, uz); u = (1 - _smooth01((np.hypot(x - qx, y - qy) - r0 * LM / S) / ((r1 - r0) * LM / S))) * k
        u = u * (0.75 + 0.5 * n2)
        c = c * (1 - u[:, None]) + URBAN_C * u[:, None]
    if drv is not None:  # riverbanks: willows and poplars, greener
        r = (1 - _smooth01((np.asarray(drv) - 0.5) / 2.5)) * _smooth01((1600 - h) / 300) * 0.45
        c = c * (1 - r[:, None]) + RIPARIAN * r[:, None]
    # bare rock on the steep high slopes, snow lying only where it can
    rk = _smooth01((slope - 0.5) / 0.25) * _smooth01((h - 1900) / 600) * 0.9
    c = c * (1 - rk[:, None]) + (ROCK * (0.9 + 0.2 * n2[:, None])) * rk[:, None]
    snow = h > 3450
    c[snow] = c[snow] * (_smooth01((slope[snow] - 0.55) / 0.2))[:, None] * 0.8 + np.array(srgb(0xf2f4f7)) * (1 - 0.8 * _smooth01((slope[snow] - 0.55) / 0.2))[:, None]
    return c * (0.95 + 0.1 * n2[:, None])

def land_color(h, slope, x=0.0, y=0.0): return land_colors(np.array([h]), np.array([slope]), np.array([x]), np.array([y]))[0]

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

# ---- rivers, traced from the terrain itself (priority-flood fill, D8 flow, accumulation), and the main roads.
# Both are cut into the land: each gets a centre line and two bank lines as constraint edges, levelled across, so a
# river lies in a flat bed that only ever runs downhill and a road sits on its own bench along the hillside.
print('rivers and roads...')
def flow_network():
    Hs = _raw.astype(np.float64); filled = Hs.copy(); done = np.zeros(Hs.shape, bool)
    edge = np.zeros(Hs.shape, bool); edge[0, :] = edge[-1, :] = edge[:, 0] = edge[:, -1] = True; edge |= Hs < 1
    pq = [(Hs[j, i], int(j), int(i)) for j, i in zip(*np.nonzero(edge))]; done |= edge; heapq.heapify(pq)
    rec = np.full(Hs.size, -1, np.int64); order = []
    NB8 = ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1))
    while pq:
        h, j, i = heapq.heappop(pq); order.append(j * HW + i)
        for dj, di in NB8:
            y, x = j + dj, i + di
            if 0 <= y < HH and 0 <= x < HW and not done[y, x]:
                done[y, x] = True; nh = filled[y, x] if filled[y, x] > h + 1e-3 else h + 1e-3
                filled[y, x] = nh; rec[y * HW + x] = j * HW + i; heapq.heappush(pq, (nh, y, x))
    acc = np.ones(Hs.size)
    for k in reversed(order):
        r = rec[k]
        if r >= 0: acc[r] += acc[k]
    return rec, acc
REC, ACC = flow_network()
_PXX = TR['minx'] + np.arange(HW) / (HW - 1) * (TR['maxx'] - TR['minx'])
_PYY = TR['miny'] + np.arange(HH) / (HH - 1) * (TR['maxy'] - TR['miny'])
def _cell_xy(c): return _PXX[c % HW], _PYY[c // HW]
_ALLC = np.vstack((SP, SP2))
def near_stop(x, y, r):
    """0..1, 1 at a stop or scenery centre, 0 beyond r map units"""
    x = np.atleast_1d(x); y = np.atleast_1d(y)
    d = np.min(np.hypot(x[:, None] - _ALLC[None, :, 0], y[:, None] - _ALLC[None, :, 1]), axis=1)
    return 1 - _smooth01(d / r)

_cand = np.nonzero(ACC >= 90)[0]
_cx, _cy = _cell_xy(_cand)
# which streams to draw: 420+ cells (~320 km2) in general; inside a stop, what that stop needs (towns want only their
# main river, mountain stops want their torrents)
STOP_RIVERS = {'Tbilisi': 6000, 'Telavi': 2500, 'Omalo': 140, 'Mestia': 140, 'Batumi': 1500, 'Kutaisi': 4000,
               'Stepantsminda': 250, 'Vardzia': 4000, 'Uplistsikhe': 4000}
_thr = np.full(len(_cand), 420.0)
for _nm, _t in STOP_RIVERS.items():
    _p = G['places'][_nm]; _d = np.hypot(_cx - _p[0], _cy - _p[1])
    _thr = np.where(_d < 40 * LMK, _t, np.where(_d < 55 * LMK, np.minimum(_thr, max(_t, 420)), _thr))
_m = ACC[_cand] >= _thr
_cand, _cx, _cy = _cand[_m], _cx[_m], _cy[_m]
_m = pip(_cx, _cy, BORDER); _cand, _cx, _cy = _cand[_m], _cx[_m], _cy[_m]
CH = np.zeros(ACC.size, bool); CH[_cand] = True
_best = {}
for c in _cand[np.argsort(ACC[_cand])]:
    r = REC[c]
    if r >= 0 and CH[r]: _best[r] = c
streams = []
for c in _cand:
    if c in _best: continue
    path = [c]
    while True:
        r = REC[path[-1]]
        if r < 0 or not CH[r]: break
        path.append(r)
        if _best.get(r) != path[-2]: break
    if len(path) >= 5: streams.append(path)
streams.sort(key=lambda p: -ACC[p[-1]])

def chaikin(P, it=2):
    P = np.asarray(P, float)
    for _ in range(it):
        if len(P) < 3: break
        Q = np.empty((2 * (len(P) - 1), 2)); Q[0::2] = 0.75 * P[:-1] + 0.25 * P[1:]; Q[1::2] = 0.25 * P[:-1] + 0.75 * P[1:]
        P = np.vstack((P[:1], Q, P[-1:]))
    return P

def resample_var(P, spacing_fn, extra=None):
    """walk along P, one sample every spacing_fn(x, y) map units; extra: per-vertex values to interpolate"""
    P = np.asarray(P, float); seg = np.diff(P, axis=0); L = np.hypot(seg[:, 0], seg[:, 1]); cum = np.concatenate(([0], np.cumsum(L)))
    out, ex, d = [], [], 0.0
    while True:
        i = min(int(np.searchsorted(cum, d, side='right') - 1), len(L) - 1); t = (d - cum[i]) / (L[i] or 1e-9)
        q = P[i] + seg[i] * t; out.append(q)
        if extra is not None: ex.append(extra[i] * (1 - t) + extra[i + 1] * t)
        if d >= cum[-1] - 1e-9: break
        d = min(cum[-1], d + float(spacing_fn(q[0], q[1])))
    return np.array(out), (np.array(ex) if extra is not None else None)

def chan_step(x, y): return {FINE: 1.1, MID: 1.9, COARSE: 3.0}[float(step_of(x, y)[0])]
CHANNELS = []   # dicts: kind, P (n,2 map), hw (n,), bank (offset of the levelled edge), group, mat, ...
_riv_pts = []   # (x, y, channel index) of every river centre sample so far, for snapping confluences
for path in streams:
    xs, ys = _cell_xy(np.array(path)); P = np.column_stack((xs, ys)); A = ACC[np.array(path)]
    P = chaikin(P, 3); A = np.interp(np.linspace(0, 1, len(P)), np.linspace(0, 1, len(A)), A)
    P, A = resample_var(P, chan_step, A)
    inside = pip(P[:, 0], P[:, 1], BORDER) & (dist_poly(P[:, 0], P[:, 1], BORDER) > 1.2)
    for _pl, _dx, _dz, _r in NO_RIVER:
        _q = loc(_pl, _dx, _dz); inside &= np.hypot(P[:, 0] - _q[0], P[:, 1] - _q[1]) > _r * LM / S
    runs, cur = [], []
    for k in range(len(P)):
        if inside[k]: cur.append(k)
        elif cur: runs.append(cur); cur = []
    if cur: runs.append(cur)
    for run in runs:
        if len(run) < 4: continue
        Q, Aq = P[run].copy(), A[run]
        joined = None
        if run[-1] == len(P) - 1 and _riv_pts:   # ends on a bigger river: snap onto its centre line
            arr = np.array([(p[0], p[1]) for p in _riv_pts]); dd = np.hypot(arr[:, 0] - Q[-1, 0], arr[:, 1] - Q[-1, 1]); j = int(np.argmin(dd))
            if dd[j] < 3.5: Q[-1] = arr[j]; joined = _riv_pts[j][2:]
        nr = near_stop(Q[:, 0], Q[:, 1], 50 * LMK)[:, None]
        for _it in range(30):   # near a stop the river is drawn wider, so its bends must be gentler too
            Q[1:-1] = Q[1:-1] * (1 - 0.5 * nr[1:-1]) + 0.25 * nr[1:-1] * (Q[:-2] + Q[2:])
        hw = np.minimum(2.1, 0.32 + 0.2 * np.sqrt(Aq / 300.0)) * (1 + np.where(Aq > 2000, 0.65, 0.4) * nr[:, 0])
        ci = len(CHANNELS)
        CHANNELS.append(dict(kind='river', P=Q, hw=hw, bank=hw + 0.12, joined=joined, group='Georgia:River', mat='waterR', closed=False,
                             glacial=float(np.mean(h_at(Q[:, 0], Q[:, 1]))) > 1500))
        _riv_pts += [(q[0], q[1], ci, k) for k, q in enumerate(Q)]
print('  %d river reaches, %d samples' % (sum(c['kind'] == 'river' for c in CHANNELS), sum(len(c['P']) for c in CHANNELS)))

# the main roads, from the site's route lines, each segment once; inside a stop the stop's own roads take over
_segs, _road_runs = set(), []
for name, pts in G['routes'].items():
    run = []
    for a, b in zip(pts, pts[1:]):
        key = (tuple(a), tuple(b)) if tuple(a) < tuple(b) else (tuple(b), tuple(a))
        if key in _segs or a == b:
            if len(run) > 1: _road_runs.append(run)
            run = []; continue
        _segs.add(key)
        if not run: run = [a]
        run.append(b)
    if len(run) > 1: _road_runs.append(run)
for run in _road_runs:
    P = np.array(catmull(run, max(4, len(run) * 6)))
    P, _ = resample_var(P, chan_step)
    ok = pip(P[:, 0], P[:, 1], BORDER) & (dist_poly(P[:, 0], P[:, 1], BORDER) > 1.0) & (near_stop(P[:, 0], P[:, 1], 30 * LMK) < 0.05)
    cur = []
    for k in range(len(P) + 1):
        if k < len(P) and ok[k]: cur.append(k); continue
        if len(cur) >= 3:
            Q = P[cur]; hw = np.full(len(Q), 0.42)
            CHANNELS.append(dict(kind='road', P=Q, hw=hw, bank=hw + 0.3, group='Georgia:Roads', mat='asphalt', closed=False))
        cur = []

def catmull_closed(pts, per):
    P = [np.array(p, float) for p in pts]; n = len(P); out = []
    for i in range(n):
        p0, p1, p2, p3 = P[i - 1], P[i], P[(i + 1) % n], P[(i + 2) % n]
        for k in range(per):
            t = k / per
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    return np.array(out)

def add_local_channel(kind, place, pts, wdt, mat, group, closed=False):
    """a road/river/path given in landmark units around a place (like the stop builders use), cut into the land too.
    wdt is the full width in landmark units. Returns the channel index."""
    Pm = np.array([loc(place, p[0], p[1]) for p in pts])
    if closed:
        C = catmull_closed(Pm, 12); C, _ = resample_var(np.vstack((C, C[:1])), lambda x, y: 0.9); C = C[:-1]
    else:
        C = np.array(catmull(Pm, len(Pm) * 12)); C, _ = resample_var(C, lambda x, y: 0.9)
    keep = pip(C[:, 0], C[:, 1], BORDER) & (dist_poly(C[:, 0], C[:, 1], BORDER) > 0.6)
    if not keep.all():
        if closed: print('  ! local channel at %s leaves the map; opened' % place)
        closed = False; C = C[keep]
    hw = np.full(len(C), wdt * LM / S / 2)
    CHANNELS.append(dict(kind=kind, P=C, hw=hw, bank=hw + (0.12 if kind == 'river' else 0.25), group=group, mat=mat, closed=closed,
                         joined=None, glacial=mat == 'waterG'))
    return len(CHANNELS) - 1
CHAN = {}
for _a in LOCAL_CHANNELS: CHAN[_a['key']] = add_local_channel(**{k: v for k, v in _a.items() if k != 'key'})

# feature points: centre + two banks per sample; hex points too close to a channel make way
_feat, _fedges, _fid = [], [], []
def _normals(P, closed):
    t = (np.roll(P, -1, 0) - np.roll(P, 1, 0)) if closed else np.gradient(P, axis=0)
    t /= np.maximum(np.linalg.norm(t, axis=1), 1e-9)[:, None]; return np.column_stack((-t[:, 1], t[:, 0]))
for ci, ch in enumerate(CHANNELS):
    P = ch['P']; N = _normals(P, ch['closed']); ch['N'] = N
    base = len(_feat); n = len(P)
    _feat += [tuple(p) for p in P] + [tuple(p) for p in P + N * ch['bank'][:, None]] + [tuple(p) for p in P - N * ch['bank'][:, None]]
    ch['ids'] = (base, base + n, base + 2 * n)
    for off in (0, n, 2 * n):
        _fedges += [(base + off + k, base + off + k + 1) for k in range(n - 1)]
        if ch['closed']: _fedges.append((base + off + n - 1, base + off))
_FP = np.array(_feat)
_ckd = _KD(len(_FP))
_rad = np.concatenate([np.concatenate((ch['bank'], ch['bank'] * 0, ch['bank'] * 0)) for ch in CHANNELS])  # centre points carry the band's half-width
for k, p in enumerate(_FP): _ckd.insert((p[0], p[1], 0), k)
_ckd.balance()
def _clear_of_channels(pts):
    keep = []
    for p in pts:
        st = float(step_of(p[0], p[1])[0]); ok = True
        for (_, k, d) in _ckd.find_range((p[0], p[1], 0), 6.0):
            if d < _rad[k] * 0.35 + 0.5 * st: ok = False; break
        keep.append(ok)
    return [p for p, k in zip(pts, keep) if k]
interior = _clear_of_channels(interior)
surround = _clear_of_channels(surround)
print('  %d channels, %d feature points' % (len(CHANNELS), len(_FP)))

nb, no = len(BORDER), len(OUTL_L)
nfix = nb + no + len(interior) + len(surround)
coords = [Vector(p) for p in BORDER + OUTL_L + interior + surround + _feat]
_vs, _, _fs, _ov, _, _ = delaunay_2d_cdt(coords, [(k, (k + 1) % nb) for k in range(nb)] + [(a + nfix, b + nfix) for a, b in _fedges],
                                        [list(range(nb, nb + no))], 1, 1e-7, True)
VX = np.array([v.x for v in _vs]); VY = np.array([v.y for v in _vs]); NV = len(_vs)
orig = [min(o) if o else -1 for o in _ov]
OUT_OF = np.full(len(coords), -1, np.int64)
for i, o in enumerate(_ov):
    for k in o: OUT_OF[k] = i
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

# level the channels: roads follow a smoothed profile; rivers only ever run downhill, and a tributary meets its river
def _vid(ch, row): b = ch['ids'][row]; return OUT_OF[nfix + b: nfix + b + len(ch['P'])]
_chan_v = np.zeros(NV, bool)
for ch in CHANNELS:
    if ch['kind'] == 'river': continue
    c = _vid(ch, 0); h = VH[c].copy(); w = 6
    hp = np.concatenate((h[-w:], h, h[:w])) if ch['closed'] else np.pad(h, w, mode='edge')
    prof = np.convolve(hp, np.ones(2 * w + 1) / (2 * w + 1), mode='valid')
    ch['h'] = prof
    for row in range(3): VH[_vid(ch, row)] = prof; _chan_v[_vid(ch, row)] = True
_rkd_pts = []
for ci, ch in enumerate(CHANNELS):
    if ch['kind'] != 'river': continue
    c = _vid(ch, 0); h = np.minimum.accumulate(VH[c].copy())
    if ch.get('joined'):
        cj, kj = ch['joined']; hb = CHANNELS[cj]['h'][kj]; h = np.maximum(h, hb); h[-1] = hb
    if ch['closed'] is False and ch['group'] != 'Georgia:River':  # a local river may not have been levelled downhill-first
        pass
    ch['h'] = h
    for row in range(3): VH[_vid(ch, row)] = h; _chan_v[_vid(ch, row)] = True
    _rkd_pts += [(p[0], p[1], hw, hh) for p, hw, hh in zip(ch['P'], ch['hw'], h)]
# the banks: nothing dips below the water beside a river, and the first few metres rise gently from it
DRV = np.full(NV, 99.0)
if _rkd_pts:
    _rk = _KD(len(_rkd_pts))
    for k, p in enumerate(_rkd_pts): _rk.insert((p[0], p[1], 0), k)
    _rk.balance()
    for i in np.nonzero(in_g)[0]:
        co, k, d = _rk.find((VX[i], VY[i], 0))
        hw, hb = _rkd_pts[k][2], _rkd_pts[k][3]; DRV[i] = max(0.0, d - hw)
        if _chan_v[i] or d > hw + 4: continue
        v = max(VH[i], hb + 3)
        if d < hw + 1.8: v = min(v, hb + 6 + (d - hw) * 70)
        VH[i] = v
VZ = np.where(is_sea, SEA_Y, BASE + VH * MPU)
VB = np.column_stack((wx(VX), -wz(VY), VZ))
ALLF = orient_up(VB, [tuple(f) for f in _fs])

NAVY = [np.array(srgb(c)) for c in (0x34587e, 0x2f5278, 0x3a6087, 0x31557b)]
SHALLOW = np.array(srgb(0x5b8fb8))
parts = {'Land': ([], []), 'Surround': ([], []), 'Sea': ([], [])}
_FA = np.array(ALLF)
_cin = pip(VX[_FA].mean(1), VY[_FA].mean(1), BORDER) & in_g[_FA].all(1)
_A, _B, _C = VB[_FA[:, 0]], VB[_FA[:, 1]], VB[_FA[:, 2]]
_N = np.cross(_B - _A, _C - _A); _N /= np.maximum(np.linalg.norm(_N, axis=1), 1e-12)[:, None]
_SLOPE = 1 - np.abs(_N[:, 2])
_MX, _MY = VX[_FA].mean(1), VY[_FA].mean(1)
_COL_L = land_colors(VH[_FA].mean(1), _SLOPE, _MX, _MY, DRV[_FA].min(1))
_COL_S = land_colors(H_raw[_FA].mean(1), _SLOPE, _MX, _MY)
for fi, f in enumerate(ALLF):
    mx, my = _MX[fi], _MY[fi]
    if _cin[fi]:
        key = 'Land'; col = _COL_L[fi] * (1 + rng.uniform(-0.03, 0.03))
    elif is_sea[list(f)].any() and mx < 340:
        key = 'Sea'; dsh = float(dist_open(np.array([mx]), np.array([my]), COAST)[0])
        ksh = min(1.0, dsh / 11.0) ** 0.8; col = SHALLOW * (1 - ksh) + NAVY[rng.randrange(4)] * ksh
    else:
        key = 'Surround'
        col = _COL_S[fi]
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

# vehicles, boats and birds: blender/vehicles.py (also a showroom of its own; see that file)
_VP = os.path.join(ROOT, 'blender', 'vehicles.py')
exec(compile(open(_VP).read(), _VP, 'exec'), globals())
for _k, (_h, _r) in VEHICLE_MATS.items(): make_mat(_k, _h, rough=_r, metal=0.2 if _k == 'delG' else 0.0)

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
    global _DROP
    f = foot * LM; gc = gy = ground3(X, Z); _DROP = 0.0
    if f > 0:   # between the centre and the lowest corner: hilltop buildings no longer sink; a foundation skirt fills the rest
        gmin = min(gc, ground3(X + f, Z + f), ground3(X - f, Z + f), ground3(X + f, Z - f), ground3(X - f, Z - f), ground3(X + f, Z), ground3(X - f, Z), ground3(X, Z + f), ground3(X, Z - f))
        gy = gc * 0.5 + gmin * 0.5; _DROP = gy - gmin
    return mat4(X, gy + (y - sink) * LM, Z, ry=ry, s=LM * s)
_DROP = 0.0

def base_of(group): return group.split(':')[0]

def place(group, parts, X0, Z0, dx, dz, occ=True, **kw):
    M = placeM(X0, Z0, dx, dz, **kw)
    if M is None: return None
    for g, m in parts: emit(group, m, g, M)
    if _DROP > 0.0012 and kw.get('y', 0) == 0:   # the foundation: the footprint's base carried down to the lowest ground
        base = [(g, m) for g, m in parts if g.V[:, 1].min() < 0.0025]
        if base:
            V = np.vstack([g.V[g.V[:, 1] < 0.0025] for g, _ in base]); d = _DROP / (LM * kw.get('s', 1)) + 0.003
            x0, x1, z0, z1 = V[:, 0].min(), V[:, 0].max(), V[:, 2].min(), V[:, 2].max()
            emit(group, min(base, key=lambda gm: gm[0].V[:, 1].min())[1], T(box((x1 - x0) * 0.98, d, (z1 - z0) * 0.98), (x0 + x1) / 2, -d + 0.001, (z0 + z1) / 2), M)
    if occ: OCC.append((M[0, 3], M[2, 3], footprint(parts) * LM * kw.get('s', 1) * 0.7))
    return M

REGION = {'Georgia': (ROOT_EMPTY, np.eye(4))}  # group -> (empty object, world translation 4x4 in Blender)
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
    wis = {k for k, m in enumerate(mats) if m.startswith('water') or m in ('asphalt', 'road', 'path', 'sand')}
    for f in bm.faces:  # open ribbons of water and roads must face the sky
        if f.material_index in wis and f.normal.z < 0: f.normal_flip()
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
# Landmark units, three.js frame (y up). East = +x, south = +z. Everything is low-poly and flat-shaded, but proportions,
# materials and the telling details (drums, gables, balconies, slate, corbels) follow photographs of the real buildings.
def pick(a): return a[rng.randrange(len(a))]

def prism(poly, h, y0=0.0):
    """extrude an (x, z) polygon up by h"""
    n = len(poly)
    V = [(x, y0, z) for x, z in poly] + [(x, y0 + h, z) for x, z in poly]
    F = [tuple(range(n))[::-1], tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    return Geo(V, F)

def plate(poly_xy, d=0.0008):
    """a thin plate in the x-y plane (a window, a door, a niche), centred on z = 0"""
    n = len(poly_xy)
    V = [(x, y, d / 2) for x, y in poly_xy] + [(x, y, -d / 2) for x, y in poly_xy]
    F = [tuple(range(n)), tuple(range(n, 2 * n))[::-1]] + [(i, n + i, n + (i + 1) % n, (i + 1) % n) for i in range(n)]
    return Geo(V, F)

def arch_win(w, h):
    """a round-headed window, bottom at y = 0"""
    r = w / 2; c = h - r
    return plate([(-r, 0), (r, 0), (r, c), (r * 0.7, c + r * 0.7), (0, h), (-r * 0.7, c + r * 0.7), (-r, c)])

def rect_win(w, h): return plate([(-w / 2, 0), (w / 2, 0), (w / 2, h), (-w / 2, h)])

def hip(w, d, h):
    """a hipped roof over w (x) by d (z); the ridge runs along the longer side"""
    x, z = w / 2, d / 2
    if w >= d: r = (w - d) / 2; V = [(-x, 0, -z), (x, 0, -z), (x, 0, z), (-x, 0, z), (-r, h, 0), (r, h, 0)]; F = [(0, 1, 5, 4), (1, 2, 5), (2, 3, 4, 5), (3, 0, 4)]
    else: r = (d - w) / 2; V = [(-x, 0, -z), (x, 0, -z), (x, 0, z), (-x, 0, z), (0, h, -r), (0, h, r)]; F = [(0, 1, 4), (1, 2, 5, 4), (2, 3, 5), (3, 0, 4, 5)]
    F.append((3, 2, 1, 0)); return Geo(V, F)

def pyramid(w, d, h):
    x, z = w / 2, d / 2
    return Geo([(-x, 0, -z), (x, 0, -z), (x, 0, z), (-x, 0, z), (0, h, 0)], [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4), (3, 2, 1, 0)])

def gold_cross(y, s=1.0, mat='gold'):
    return [(T(box(0.0011 * s, 0.009 * s, 0.0011 * s), y=y), mat), (T(box(0.0055 * s, 0.0011 * s, 0.0011 * s), y=y + 0.0058 * s), mat)]

def on_faces(n, R, fn, every=1):
    """call fn(angle, distance to face) for each face of an n-gon prism (cyl puts vertices at i/n * 2pi)"""
    out = []
    for k in range(n):
        if k % every: continue
        a = (k + 0.5) / n * 2 * PI; out += fn(a, R * math.cos(PI / n) + 0.0003)
    return out

def drum_dome(yb, R, DH, CH, n, wall, roof, win='ink', wins=None, cornice=True, cross=True, cross_s=1.0, dome_prof=None):
    """the polygonal drum with tall arched windows and its conical (or lathe-profiled) dome, from height yb"""
    P = [(T(cyl(R, DH, n), y=yb), wall)]
    if cornice: P.append((T(cyl(R * 1.07, 0.0014, n), y=yb + DH - 0.0014), wall))
    ww = min(0.0034, 2 * PI * R / n * 0.45)
    P += on_faces(n, R, lambda a, d: [(T(arch_win(ww, DH * 0.52), math.sin(a) * d, yb + DH * 0.22, math.cos(a) * d, ry=a), win)], wins or (2 if n > 10 else 1))
    if dome_prof: P.append((T(lathe([(R * 1.1 * u, CH * v) for u, v in dome_prof], n), y=yb + DH), roof))
    else: P.append((T(cone(R * 1.12, CH, n), y=yb + DH), roof))
    if cross: P += gold_cross(yb + DH + CH - 0.0005, cross_s)
    return P

def xchurch(L=0.05, B=0.022, C=0.04, H=0.026, R=0.0085, DH=0.022, CH=0.016, n=8, wall='stoneY', roof='samR', drum=None, dome=None,
            rise=0.34, win='ink', plinth=0.0, plinth_mat='stoneD', apse=False, cross_s=1.0, dome_prof=None, low_annex=0.0):
    """a Georgian cross-dome church: nave west-east along x (east = +x), transept north-south, steep gabled arms,
    a polygonal drum rising from the crossing with tall arched windows, a conical dome. Optional lower annexes along the nave."""
    P = []; y0 = plinth
    if plinth: P.append((box(L * 1.3, plinth, C * 1.16), plinth_mat))
    rh = B * rise
    P += [(T(box(L, H, B), y=y0), wall), (T(box(B, H, C), y=y0), wall)]
    P += [(T(gable(B * 1.07, rh, L * 1.02), y=y0 + H, ry=PI / 2), roof), (T(gable(B * 1.07, rh, C * 1.02), y=y0 + H), roof)]
    if low_annex:  # side aisles / galleries along the nave, lower, with lean-to roofs
        ah = H * low_annex
        for sz in (-1, 1):
            P.append((T(box(L * 0.92, ah, B * 0.42), 0, y0, sz * B * 0.68), wall))
            P.append((T(Geo([(-L * 0.46, 0, sz * B * 0.47), (L * 0.46, 0, sz * B * 0.47), (L * 0.46, 0, sz * B * 0.92), (-L * 0.46, 0, sz * B * 0.92),
                             (-L * 0.46, ah * 0.22, sz * B * 0.47), (L * 0.46, ah * 0.22, sz * B * 0.47)], [(0, 1, 2, 3), (0, 4, 5, 1), (3, 2, 5, 4), (0, 3, 4), (1, 5, 2)]), y=y0 + ah), roof))
    if apse:
        P += [(T(cyl(B * 0.36, H * 0.86, 8), L / 2, y0, 0), wall), (T(cone(B * 0.4, B * 0.2, 8), L / 2, y0 + H * 0.86, 0), roof)]
    yb = y0 + H + rh * 0.55
    P.append((T(box(R * 2.15, rh * 0.62, R * 2.15), y=y0 + H + rh * 0.1), wall))      # the square base the drum stands on
    P += drum_dome(yb, R, DH, CH, n, drum or wall, dome or roof, win, cross_s=cross_s, dome_prof=dome_prof)
    ww = min(0.0028, B * 0.13)
    for sx in (-1, 1):   # the gable ends: a tall window in each, the west door, the east facade's two triangular niches
        P.append((T(arch_win(ww, H * 0.4), sx * (L / 2 + 0.0003), y0 + H * 0.42, 0, ry=PI / 2), win))
    for sz in (-1, 1):
        P.append((T(arch_win(ww, H * 0.4), 0, y0 + H * 0.42, sz * (C / 2 + 0.0003)), win))
        for x in (-L * 0.34, L * 0.34):
            if abs(x) > B * 0.6 and not low_annex: P.append((T(arch_win(ww * 0.85, H * 0.32), x, y0 + H * 0.46, sz * (B / 2 + 0.0003)), win))
    P.append((T(arch_win(B * 0.2, H * 0.34), -(L / 2 + 0.0004), y0, 0, ry=PI / 2), 'ink'))
    for zz in (-B * 0.27, B * 0.27): P.append((T(plate([(-B * 0.07, 0), (B * 0.07, 0), (0, H * 0.5)]), L / 2 + 0.0003, y0 + H * 0.3, zz, ry=PI / 2), win))
    return P

def hall_church(L, B, H, wall, roof, belfry=True, win='ink'):
    """the small single-nave hall church of the mountains (Svaneti, Tusheti, Kazbegi villages)"""
    P = [(box(L, H, B), wall), (T(gable(B * 1.12, B * 0.42, L * 1.06), y=H, ry=PI / 2), roof),
         (T(cyl(B * 0.34, H * 0.8, 6), L / 2, 0, 0), wall), (T(cone(B * 0.37, B * 0.26, 6), L / 2, H * 0.8, 0), roof),
         (T(arch_win(B * 0.22, H * 0.55), -(L / 2 + 0.0003), 0, 0, ry=PI / 2), 'ink')]
    for x in (-L * 0.2, L * 0.15): P.append((T(arch_win(0.0016, H * 0.3), x, H * 0.45, B / 2 + 0.0003), win))
    if belfry: P += [(T(box(B * 0.36, B * 0.36, B * 0.24), -L * 0.45, H + B * 0.18, 0), wall), (T(box(B * 0.18, B * 0.2, B * 0.26), -L * 0.45, H + B * 0.2, 0), 'ink'),
                     (T(gable(B * 0.4, B * 0.16, B * 0.3), -L * 0.45, H + B * 0.54, 0), roof)]
    return P

def campanile(w, H, wall, roof, open_h=None, pyr=True, win='ink'):
    """a free-standing bell tower: a square shaft and an open belfry storey of arches"""
    oh = open_h or w * 1.1
    P = [(box(w, H - oh, w), wall), (T(box(w * 1.08, 0.0014, w * 1.08), y=H - oh), wall)]
    for k in range(4):  # four corner piers and the arches between
        P.append((T(box(w * 0.22, oh, w * 0.22), (k % 2 - 0.5) * w * 0.78, H - oh, (k // 2 - 0.5) * w * 0.78), wall))
    for a in range(4):
        ang = a * PI / 2
        P.append((T(box(w, oh * 0.25, w * 0.2), math.sin(ang) * w * 0.4, H - oh * 0.25, math.cos(ang) * w * 0.4, ry=ang), wall))
    P.append((T(box(w * 0.5, oh * 0.6, w * 0.5), y=H - oh), 'ink'))
    P.append((T(pyramid(w * 1.12, w * 1.12, w * 0.7) if pyr else cone(w * 0.62, w * 0.9, 8), y=H), roof))
    return P

# --- houses
def tb_house(w, d, floors, wall, roof, balc, rng_):
    """Old Tbilisi: two or three storeys of brick and plaster, a low tin roof, and the carved wooden balcony running along the front"""
    fh = 0.0074; h = floors * fh + 0.0016
    P = [(box(w, h, d), wall), (T(hip(w * 1.08, d * 1.1, 0.0042), y=h), roof)]
    nb = max(2, round(w / 0.0068))
    for f in range(floors):
        for b in range(nb):
            x = -w / 2 + (b + 0.5) * w / nb
            P.append((T(rect_win(0.0024, 0.0036), x, f * fh + 0.0022, d / 2 + 0.0003), 'ink'))
            if b % 2 == 0: P.append((T(rect_win(0.0024, 0.0036), x, f * fh + 0.0022, -d / 2 - 0.0003), 'ink'))
    for f in range(1, floors):   # the balcony galleries: deck, carved rail (dark lattice under a light top rail), posts, a deep eave
        y = f * fh; z = d / 2 + 0.0026
        P += [(T(box(w * 0.94, 0.0008, 0.0052), 0, y, d / 2 + 0.0026), balc), (T(box(w * 0.94, 0.0026, 0.0007), 0, y + 0.0008, z + 0.0023), balc),
              (T(box(w * 0.9, 0.0014, 0.0005), 0, y + 0.001, z + 0.0027), 'balcD')]
        for b in range(nb + 1): P.append((T(box(0.0007, fh - 0.0008, 0.0007), -w * 0.46 + b * w * 0.92 / nb, y + 0.0008, z + 0.0022), balc))
    P.append((T(box(w * 0.98, 0.0008, 0.0062), 0, h - 0.0004, d / 2 + 0.003), roof))
    return P

def svan_house(w, d, h, stone='stoneSv', roof='slateSv', balcony=False):
    """the machubi: a long two-storey stone house with a low slate gable"""
    P = [(box(w, h, d), stone), (T(gable(d * 1.12, h * 0.32, w * 1.06), y=h, ry=PI / 2), roof)]
    for k in range(max(1, round(w / 0.012))):
        x = -w / 2 + (k + 0.5) * w / max(1, round(w / 0.012))
        P.append((T(rect_win(0.002, 0.003), x, h * 0.55, d / 2 + 0.0003), 'ink'))
    P.append((T(rect_win(0.0034, 0.0055), -w * 0.3, 0, d / 2 + 0.0003), 'balcD'))
    if balcony: P += [(T(box(w * 0.7, 0.0008, 0.004), w * 0.1, h * 0.5, d / 2 + 0.002), 'balc'), (T(box(w * 0.7, 0.0022, 0.0006), w * 0.1, h * 0.5 + 0.0008, d / 2 + 0.0038), 'balc')]
    return P

def tush_house(w, d, floors, stone='stoneTu', balcony=True):
    """Tusheti: dry-laid dark slate stone, flat slab roofs, a wooden balcony on the sunny side"""
    fh = 0.0078; h = floors * fh
    P = [(box(w, h, d), stone), (T(box(w * 1.06, 0.0016, d * 1.08), y=h), 'slateTu'), (T(box(w * 0.9, 0.0012, d * 0.9), y=h + 0.0016), 'stoneTu')]
    for f in range(floors):
        for k in range(2): P.append((T(rect_win(0.002, 0.0028), -w * 0.25 + k * w * 0.5, f * fh + 0.003, d / 2 + 0.0003), 'ink'))
    if balcony and floors > 1:
        y = fh * (floors - 1)
        P += [(T(box(w * 0.86, 0.0008, 0.0045), 0, y, d / 2 + 0.0022), 'balc'), (T(box(w * 0.86, 0.0024, 0.0006), 0, y + 0.0008, d / 2 + 0.0042), 'balc')]
        for b in range(4): P.append((T(box(0.0007, fh, 0.0007), -w * 0.4 + b * w * 0.8 / 3, y, d / 2 + 0.004), 'balc'))
    return P

def town_house(w, d, h, wall, roof, balcony=False, chimney=False, hipped=False):
    """a two-storey village/town house with a tiled roof (Kakheti, Imereti, Kazbegi)"""
    P = [(box(w, h, d), wall)]
    P.append((T(hip(w * 1.1, d * 1.14, h * 0.42), y=h) if hipped else T(gable(d * 1.14, h * 0.42, w * 1.1), y=h, ry=PI / 2), roof))
    n = max(1, round(w / 0.0075))
    for k in range(n):
        x = -w / 2 + (k + 0.5) * w / n
        P.append((T(rect_win(0.0024, 0.0036), x, h * 0.58, d / 2 + 0.0003), 'ink'))
        if h > 0.012: P.append((T(rect_win(0.0024, 0.0036), x, h * 0.16, d / 2 + 0.0003), 'ink'))
    if balcony:
        P += [(T(box(w * 0.88, 0.0012, 0.0055), 0, h * 0.48, d / 2 + 0.0028), 'balc'), (T(box(w * 0.88, 0.0028, 0.0007), 0, h * 0.48 + 0.0012, d / 2 + 0.0052), 'balc')]
        for b in range(4): P.append((T(box(0.0008, h * 0.52, 0.0008), -w * 0.42 + b * w * 0.28, h * 0.48, d / 2 + 0.005), 'balc'))
    if chimney: P.append((T(box(0.0028, 0.007, 0.0028), w * 0.25, h + 0.002, 0), 'stoneD'))
    return P

# --- towers
def svan_tower(H, w=0.0175, stone='stoneSv', roof='slateSv', dark=False):
    """the Svan defensive tower: a square shaft that narrows a little as it rises, a corbelled top storey with
    small arched openings, a low-pitched slate gable. About five times as tall as it is wide."""
    top = w * 0.84; hs = H - 0.0115
    P = [(sq(top / 2, w / 2, hs), stone),
         (T(box(top + 0.0018, 0.0011, top + 0.0018), y=hs - 0.0011), 'stoneD' if not dark else 'stoneGeD'),
         (T(box(top + 0.0012, 0.0115, top + 0.0012), y=hs), stone),
         (T(gable(top + 0.0034, 0.0046, top + 0.0034), y=H, ry=PI / 2 * rng.randrange(2)), roof)]
    for f in range(4):
        a = f * PI / 2; nx, nz = math.sin(a), math.cos(a); o = top / 2 + 0.0009
        for s_ in (-1, 1): P.append((T(arch_win(0.0018, 0.0042), nx * o + nz * s_ * top * 0.22, hs + 0.0035, nz * o - nx * s_ * top * 0.22, ry=a), 'ink'))
        if f % 2 == 0: P.append((T(rect_win(0.0013, 0.0026), nx * (w * 0.46 + 0.0004), H * 0.45, nz * (w * 0.46 + 0.0004), ry=a), 'ink'))
    P.append((T(rect_win(0.0022, 0.0034), 0, H * 0.18, w / 2 + 0.0002), 'balcD'))   # the door, high up, reached by a ladder
    return P

def tush_tower(H, w=0.016, stone='stoneTu'):
    """the Tush tower (Keselo, Dartlo): dark slate stone, a strong batter, and the stepped slate pyramid roof
    with a pointed capstone"""
    top = w * 0.74
    P = [(sq(top / 2, w / 2, H), stone)]
    k_n = 6
    for k in range(k_n):
        ww = (top + 0.0024) * (1 - k / (k_n + 0.6)); P.append((T(box(ww, 0.0024, ww), y=H + k * 0.0024), 'slateTu'))
    P.append((T(pyramid(0.0034, 0.0034, 0.005), y=H + k_n * 0.0024), 'slateTu'))
    for f in range(4):
        a = f * PI / 2
        for r in range(3):
            fr = 0.35 + r * 0.2; wd = w - (w - top) * fr
            P.append((T(rect_win(0.0016, 0.0026), math.sin(a) * (wd / 2 + 0.0003), H * fr, math.cos(a) * (wd / 2 + 0.0003), ry=a), 'ink'))
    return P

# --- trees: a few forms, coloured by species
def t_broad(h, col):      # oak, beech, hornbeam, walnut
    return [(cyl(0.0011 * h / 0.03, h * 0.42, 4), 'trunk'), (T(ball(h * 0.34, 6, 4), y=h * 0.62, s=(1, 0.85, 1), ry=rng.random() * 3), col)]
def t_clump(h, col):      # two overlapping crowns
    return [(cyl(0.0011 * h / 0.03, h * 0.4, 4), 'trunk'), (T(ball(h * 0.3, 6, 4), -h * 0.12, h * 0.6, 0, s=(1, 0.85, 1)), col), (T(ball(h * 0.26, 5, 4), h * 0.14, h * 0.7, h * 0.06), col)]
def t_conifer(h, col):    # spruce, fir
    return [(cyl(0.001 * h / 0.04, h * 0.18, 4), 'trunk'), (T(cone(h * 0.2, h * 0.58, 6), y=h * 0.12, ry=rng.random()), col), (T(cone(h * 0.14, h * 0.42, 6), y=h * 0.5, ry=rng.random()), col)]
def t_pine(h, col='pineT'):  # Scots pine: a bare trunk and an irregular crown
    return [(cyl(0.0011 * h / 0.04, h * 0.6, 4), 'trunk'), (T(ball(h * 0.24, 6, 3), y=h * 0.72, s=(1, 0.7, 1)), col), (T(ball(h * 0.16, 5, 3), h * 0.08, h * 0.9, 0, s=(1, 0.7, 1)), col)]
def t_poplar(h, col='poplar'):  # the Lombardy poplars that line Georgian roads
    return [(cyl(0.0009, h * 0.2, 4), 'trunk'), (T(ball(h * 0.11, 5, 4), y=h * 0.56, s=(1, 4.2, 1)), col)]
def t_birch(h, col='birchL'):
    return [(cyl(0.0008, h * 0.6, 4), 'birch'), (T(ball(h * 0.22, 5, 4), y=h * 0.7, s=(1, 1.25, 1)), col)]
def t_cypress(h=0.045): return [(T(ball(0.0055, 6, 4), y=0.006, s=(1, 1.2, 1)), 'pine'), (cone(0.0055, h, 6), 'pine')]
def pine(h=0.04): return t_conifer(h, pick(['spruce', 'spruceD', 'pineT']))
def cypress(h=0.045): return t_cypress(h)
def tree(h=0.03): return t_broad(h, pick(['oak', 'beech', 'leaf']))

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
            if crenel:
                for c in (-0.25, 0.25): parts.append((T(box(min(0.0026, L / n * 0.3), 0.0028, th * 1.05), c * L / n, h + 0.006, 0), mat))
            place(group, TP(parts, ry=ang), X0, Z0, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, foot=0, sink=0.006, occ=False)

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

def _up(V, f):
    a, b, c = V[f[0]], V[f[1]], V[f[2]]
    return ((b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2])) > 0

# --- where things stand: buildings claim ground; trees and houses keep off roads, rivers and each other
OCC = []   # (X, Z, r) three.js world
def occupied(X, Z, r):
    for (x, z, rr) in OCC[-4000:]:
        if (X - x) ** 2 + (Z - z) ** 2 < (r + rr) ** 2: return True
    return False
def near_channel(X, Z, pad=0.25):
    """within a road's or river's levelled band (+pad map units)?"""
    mx, my = X / S + cx, Z / S + cy
    for (_, k, d) in _ckd.find_range((mx, my, 0), 8.0):
        if d < _rad[k] + pad: return True
    return False
def footprint(parts):
    V = np.vstack([g.V for g, _ in parts]); return float(np.max(np.hypot(V[:, 0], V[:, 2])))

def houses(group, X0, Z0, n, make, area, key, mind=0.03, ry0=0.0, ryj=0.6, foot=0.012, face=None, pack=0.5):
    """scatter n houses from make() in area (x0, w, z0, d), packed by rejection against everything already standing,
    off the roads and rivers; facing face(dx, dz) -> angle if given"""
    done = 0; _why = {}; x0, w, z0, d = area
    P = make()
    for _ in range(n * 30):
        if done >= n: break
        dx, dz = x0 + rng.random() * w, z0 + rng.random() * d
        X, Z = X0 + dx * LM, Z0 + dz * LM
        r = footprint(P) * LM
        if near_channel(X, Z, r / S * 0.45): _why['chan'] = _why.get('chan', 0) + 1; continue
        f_ = r * 0.7; gs = [ground3(X + a * f_, Z + b * f_) for a, b in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1))]
        if max(gs) - min(gs) > 0.034: _why['steep'] = _why.get('steep', 0) + 1; continue
        if occupied(X, Z, r * pack): _why['occ'] = _why.get('occ', 0) + 1; continue
        ry = (face(dx, dz) if face else ry0) + (rng.random() - 0.5) * ryj
        if place(group, P, X0, Z0, dx, dz, ry=ry, foot=foot) is not None: done += 1; P = make()
    if done < n * 0.5 and 'verbose' in _opts: print('    houses %s/%s: %d of %d' % (group, key, done, n), _why)

def forest(group, X0, Z0, rad, dens=1.0, sp=0.0125, ox=0.0, oz=0.0, scatter=0.06, kinds=None, min_h=0.024, max_h=0.04, avoid=None):
    """trees where the land's colour says forest (the same mask), a few scattered elsewhere; species by height and climate"""
    n = int(2 * rad / sp)
    own = int(np.argmin(np.hypot(_ALLC[:, 0] - (X0 / S + cx), _ALLC[:, 1] - (Z0 / S + cy))))
    for i in range(n):
        for j in range(n):
            dx = ox - rad + (i + 0.5 + (rng.random() - 0.5) * 0.9) * sp; dz = oz - rad + (j + 0.5 + (rng.random() - 0.5) * 0.9) * sp
            if dx * dx + dz * dz > rad * rad * (0.85 + 0.3 * rng.random()): continue
            X, Z = X0 + dx * LM, Z0 + dz * LM; mx, my = X / S + cx, Z / S + cy
            if not inside_map(mx, my): continue
            if int(np.argmin(np.hypot(_ALLC[:, 0] - mx, _ALLC[:, 1] - my))) != own: continue   # another stop's ground
            gy = ground3(X, Z); hm = (gy - BASE) / MPU
            dry, n1, n2, hj, fm = (float(v[0]) for v in veg_fields(mx, my, hm))
            p = fm * dens + scatter * (1 - dry * 0.6)
            if hm > 2250 + 150 * n1 or rng.random() > p: continue
            if avoid and any((dx - a) ** 2 + (dz - b) ** 2 < r * r for a, b, r in avoid): continue
            if near_channel(X, Z, 0.4) or occupied(X, Z, 0.006 * LM): continue
            h = min_h + rng.random() * (max_h - min_h)
            if kinds: P = kinds(hm, dry, n1, h)
            else:
                if hm > 1700: P = t_conifer(h * 1.1, pick(['spruce', 'spruceD'])) if rng.random() < 0.8 else t_birch(h * 0.8)
                elif hm > 1000: P = t_conifer(h * 1.1, pick(['spruce', 'spruceD'])) if rng.random() < 0.45 else t_broad(h, pick(['beech', 'oakD']))
                elif dry > 0.5: P = t_broad(h * 0.85, pick(['olive', 'oak', 'oakD']))
                else: P = (t_clump if rng.random() < 0.4 else t_broad)(h, pick(['oak', 'beech', 'walnut', 'oakD']))
            place(group, P, X0, Z0, dx, dz, ry=rng.random() * 6.28, foot=0, occ=False)

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
    gull = col == 'white'
    body = gull_body() if gull else eagle_body()
    b = anim_obj(name, body, mat4(0, 0, 0, s=LM * size), group, parent=None)
    b.parent = piv; b.matrix_basis = Matrix(to_bl(mat4(0, 0, -radius, ry=PI if turns > 0 else 0, s=LM * size)).tolist())
    b.rotation_mode = 'XYZ'
    k_wave(b, 'rotation_euler', 0, 0.18 * (1 if turns > 0 else -1), cycles=2, phase=phase)   # banking into the turn, easing in and out
    for side in (1, -1):
        w = anim_obj(name + ('_WingL' if side > 0 else '_WingR'), gull_wing(side) if gull else eagle_wing(side), np.eye(4), group)
        w.parent = b; w.matrix_basis = Matrix(); w.rotation_mode = 'XYZ'
        # gulls beat their wings; eagles soar on a shallow dihedral with a slow, occasional flex
        k_wave(w, 'rotation_euler', 0, side * (0.42 if gull else 0.12), cycles=flap * abs(turns) * (8 if gull else 3), phase=phase, step=4 if gull else 8)

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
def river2(group, X0, Z0, pts, wdt, n=64): return None  # rivers now come from the terrain (CHANNELS)

def along(C, u, closed=True):
    """point at fraction u of a polyline's length"""
    P = np.asarray(C, float)
    if closed: P = np.vstack((P, P[:1]))
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1); cum = np.concatenate(([0], np.cumsum(seg)))
    d = (u % 1.0) * cum[-1] if closed else min(max(u, 0), 1) * cum[-1]
    i = min(int(np.searchsorted(cum, d, side='right') - 1), len(seg) - 1)
    t = (d - cum[i]) / (seg[i] or 1e-9); q = P[i] + (P[i + 1] - P[i]) * t
    return (float(q[0]), float(q[1]))

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

# ------------------------------------------------------------------------------------------------ stop helpers
def chan_world(key):
    ch = CHANNELS[CHAN[key]]; return [(wx(p[0]), wz(p[1])) for p in ch['P']], ch['closed']

def span_ends(X0, Z0, a, b):
    """world ends, length (landmark units), heading and deck height of something spanning from a to b (local units)"""
    A = (X0 + a[0] * LM, Z0 + a[1] * LM); B = (X0 + b[0] * LM, Z0 + b[1] * LM)
    L = math.hypot(b[0] - a[0], b[1] - a[1]); ang = -math.atan2(b[1] - a[1], b[0] - a[0])
    return A, B, L, ang, max(ground3(*A), ground3(*B))

def place_span(group, make, X0, Z0, a, b, lift=0.0):
    """make(L) builds along +x centred on 0; set down between a and b with its deck at the higher bank"""
    A, B, L, ang, top = span_ends(X0, Z0, a, b)
    mx, mz = (A[0] + B[0]) / 2, (A[1] + B[1]) / 2
    M = mat4(mx, top + lift * LM, mz, ry=ang, s=LM)
    for g, m in make(L): emit(group, m, g, M)
    return M

def safe(group, parts, X0, Z0, dx, dz, pad=0.2, **kw):
    """place unless it would sit on a road or river"""
    X, Z = X0 + dx * LM, Z0 + dz * LM
    if near_channel(X, Z, footprint(parts) * LM * 0.7 / S + pad): return None
    return place(group, parts, X0, Z0, dx, dz, **kw)

def rock(poly, h, mat='rockG', jag=0.25, seed=0):
    """a rough rock outcrop: the polygon extruded, its top tilted and broken up"""
    r_ = random.Random(seed); n = len(poly)
    V = [(x, 0, z) for x, z in poly] + [(x, h * (1 - jag + jag * 2 * r_.random()), z) for x, z in poly]
    F = [tuple(range(n))[::-1], tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    return [(Geo(V, F), mat)]

def basilica(L, B, H, wall, roof, aisles=True, win='ink'):
    """a three-nave basilica: a tall nave and two lower aisles under lean-to roofs, a projecting east apse"""
    P = [(box(L, H, B), wall), (T(gable(B * 1.08, B * 0.36, L * 1.04), y=H, ry=PI / 2), roof),
         (T(cyl(B * 0.34, H * 0.8, 8), L / 2, 0, 0), wall), (T(cone(B * 0.37, B * 0.22, 8), L / 2, H * 0.8, 0), roof),
         (T(arch_win(B * 0.24, H * 0.5), -(L / 2 + 0.0003), 0, 0, ry=PI / 2), 'ink')]
    if aisles:
        for sz in (-1, 1):
            P += [(T(box(L * 0.94, H * 0.62, B * 0.4), 0, 0, sz * B * 0.66), wall),
                  (T(Geo([(-L * 0.47, 0, sz * B * 0.46), (L * 0.47, 0, sz * B * 0.46), (L * 0.47, 0, sz * B * 0.9), (-L * 0.47, 0, sz * B * 0.9),
                          (-L * 0.47, H * 0.2, sz * B * 0.46), (L * 0.47, H * 0.2, sz * B * 0.46)], [(0, 1, 2, 3), (0, 4, 5, 1), (3, 2, 5, 4), (0, 3, 4), (1, 5, 2)]), y=H * 0.62), roof)]
            for x in (-L * 0.25, L * 0.1, L * 0.35): P.append((T(arch_win(0.0018, H * 0.25), x, H * 0.66, sz * (B / 2 + 0.0003)), win))
    return P

# ------------------------------------------------------------------------------------------------ 1 · Tbilisi
def sameba():
    """Tsminda Sameba (consecrated 2004): cream stone on a stepped platform; broad lower tiers of gabled arms, the taller
    cross arms, a raised square base with a gable on each face, a tall twelve-sided drum ringed with arched windows and the
    gilded dome. 87 m to the top of the cross, about 77 m long."""
    W, R = 'samW', 'samR'
    P = [(box(0.12, 0.004, 0.1), 'stoneD'), (T(box(0.1, 0.004, 0.086), y=0.004), 'stoneS')]
    for k in range(4): P.append((T(box(0.012, 0.002 * (k + 1), 0.04), -0.066 + k * 0.004, 0, 0), 'stoneS'))   # the west stair
    y1 = 0.008
    P += [(T(box(0.078, 0.014, 0.052), y=y1), W), (T(box(0.052, 0.014, 0.07), y=y1), W)]
    P += [(T(gable(0.054, 0.006, 0.08), y=y1 + 0.014, ry=PI / 2), R), (T(gable(0.054, 0.006, 0.072), y=y1 + 0.014), R)]
    for sx in (-1, 1):
        for sz in (-1, 1): P += [(T(box(0.012, 0.016, 0.012), sx * 0.032, y1, sz * 0.03), W), (T(pyramid(0.013, 0.013, 0.006), sx * 0.032, y1 + 0.016, sz * 0.03), R)]
    y2 = y1 + 0.014
    P += [(T(box(0.062, 0.017, 0.03), y=y2), W), (T(box(0.03, 0.017, 0.058), y=y2), W)]
    P += [(T(gable(0.032, 0.0105, 0.064), y=y2 + 0.017, ry=PI / 2), R), (T(gable(0.032, 0.0105, 0.06), y=y2 + 0.017), R)]
    y3 = y2 + 0.017 + 0.005
    P += [(T(box(0.026, 0.012, 0.026), y=y3), W), (T(gable(0.0272, 0.0065, 0.0285), y=y3 + 0.012), R), (T(gable(0.0272, 0.0065, 0.0285), y=y3 + 0.012, ry=PI / 2), R)]
    P += drum_dome(y3 + 0.0155, 0.0098, 0.016, 0.017, 12, W, 'gold', dome_prof=[(1, 0), (1.03, 0.22), (0.92, 0.5), (0.58, 0.82), (0.0, 1.0)], cross_s=1.35)
    for sx in (-1, 1):
        P += [(T(arch_win(0.0034, 0.011), sx * 0.0313, y2 + 0.003, 0, ry=PI / 2), 'ink'), (T(arch_win(0.0034, 0.011), 0, y2 + 0.003, sx * 0.0293), 'ink'),
              (T(arch_win(0.0028, 0.007), sx * 0.0133, y3 + 0.002, 0.0133 * 0 + 0, ry=PI / 2), 'ink'), (T(arch_win(0.0028, 0.007), 0, y3 + 0.002, sx * 0.0133), 'ink')]
        for k in (-1, 1):
            P += [(T(arch_win(0.0026, 0.0075), sx * 0.0393, y1 + 0.0035, k * 0.013, ry=PI / 2), 'ink'), (T(arch_win(0.0026, 0.0075), k * 0.013, y1 + 0.0035, sx * 0.0353), 'ink')]
    P.append((T(arch_win(0.008, 0.011), -0.0395, y1, 0, ry=PI / 2), 'ink'))
    return P

def kartlis_deda():
    """Kartlis Deda (1958): the 20 m aluminium Mother of Georgia on the Sololaki ridge, a bowl of wine in her left hand
    for friends and a sword in her right for enemies. Modelled facing +z."""
    m = 'alu'
    return [(box(0.008, 0.004, 0.008), 'stoneD'), (T(cyl(0.0021, 0.021, 7, 0.0041), y=0.004), m), (T(cyl(0.0017, 0.0075, 6, 0.0021), y=0.025), m),
            (T(box(0.0056, 0.0016, 0.0026), y=0.031), m), (T(cyl(0.0007, 0.002, 5), y=0.0325), m), (T(ball(0.0017, 6, 4), y=0.0358), m),
            (T(box(0.0012, 0.0082, 0.0012), 0.0034, 0.0265, 0.0008, rz=0.25), m), (T(box(0.0006, 0.019, 0.0004), 0.0052, 0.012, 0.0022, rz=0.12), 'steel'),
            (T(box(0.0034, 0.0007, 0.0007), 0.0052, 0.0222, 0.0022), 'steel'),
            (T(box(0.0012, 0.0012, 0.0075), -0.0032, 0.0305, 0.0034), m), (T(cyl(0.0024, 0.0013, 7, 0.0012), -0.0032, 0.0302, 0.0075), m)]

def tv_tower():
    """the Mtatsminda TV tower (1972, 274.5 m): four splayed lattice legs that draw together, platforms, the mast"""
    P = []; H1 = 0.1; b0, b1 = 0.013, 0.0035
    for sx in (-1, 1):
        for sz in (-1, 1):
            a = np.array([sx * b0, 0, sz * b0]); b = np.array([sx * b1, H1, sz * b1])
            P.append((tube([a, b], 0.0009, 4), 'steel'))
    for k in range(1, 8):  # horizontal rings and cross bracing
        t = k / 8; w = b0 + (b1 - b0) * t; y = H1 * t
        for f in range(4):
            ang = f * PI / 2; P.append((T(box(2 * w, 0.0006, 0.0006), math.sin(ang) * w, y, math.cos(ang) * w, ry=ang + PI / 2), 'steel'))
    for k in range(7):
        t0, t1 = k / 7, (k + 1) / 7; w0, w1 = b0 + (b1 - b0) * t0, b0 + (b1 - b0) * t1
        for f in range(4):
            ang = f * PI / 2; c, s_ = math.cos(ang), math.sin(ang)
            p0 = np.array([s_ * w0 - c * w0, H1 * t0, c * w0 + s_ * w0]); p1 = np.array([s_ * w1 + c * w1, H1 * t1, c * w1 - s_ * w1])
            P.append((tube([p0, p1], 0.00035, 3, caps=False), 'steel'))
    P += [(T(cyl(0.0068, 0.004, 8), y=0.052), 'steel'), (T(cyl(0.0058, 0.0035, 8), y=0.074), 'white'), (T(box(0.0026, 0.04, 0.0026), y=H1), 'steel'),
          (T(cyl(0.0022, 0.004, 6), y=H1 + 0.012), 'red'), (T(box(0.0012, 0.022, 0.0012), y=H1 + 0.04), 'white'), (T(ball(0.0011, 4, 3), y=H1 + 0.062), 'red')]
    return P

def bridge_of_peace(L):
    """the Bridge of Peace (2010): a 150 m steel bow under an undulating glass-and-steel canopy, lit at night"""
    P = []; n = 22; w = 0.0042
    deck = []
    for k in range(n + 1):
        t = k / n; x = (t - 0.5) * L; y = 0.0022 * math.sin(PI * t)
        deck.append((x, y))
    V, F = [], []
    for k, (x, y) in enumerate(deck): V += [(x, y, -w), (x, y, w), (x, y - 0.0016, -w), (x, y - 0.0016, w)]
    for k in range(n):
        a, b = 4 * k, 4 * (k + 1)
        F += [(a, b, b + 1, a + 1), (a + 2, a + 3, b + 3, b + 2), (a, a + 2, b + 2, b), (a + 1, b + 1, b + 3, a + 3)]
    P.append((Geo(V, F), 'stoneS'))
    # the canopy: a shell over the deck whose height rises and falls along the bridge like a wave
    V, F = [], []; m = 6
    for k in range(n + 1):
        t = k / n; x, y0 = deck[k]
        hc = 0.0042 + 0.0024 * math.sin(2 * PI * 1.25 * t + 0.4) * math.sin(PI * t) + 0.001 * math.sin(PI * t)
        wc = w * (1.05 + 0.25 * math.sin(2 * PI * t + 1.0))
        for i in range(m + 1):
            th = i / m * PI; V.append((x, y0 + hc * math.sin(th), wc * math.cos(th)))
    for k in range(n):
        for i in range(m): a = k * (m + 1) + i; b = a + m + 1; F.append((a, b, b + 1, a + 1))
    P.append((Geo(V, F), 'glass'))
    for k in range(0, n + 1, 3):
        pts = [V[k * (m + 1) + i] for i in range(m + 1)]; P.append((tube(pts, 0.00035, 3, caps=False), 'steel'))
    P.append((tube([V[k * (m + 1) + m // 2] for k in range(n + 1)], 0.0004, 3, caps=False), 'white'))
    return P

def bath_dome(r=0.0078):
    """Abanotubani: a sulphur bath's brick dome rising out of the paved square, with its little octagonal skylight"""
    return [(cyl(r * 1.08, 0.0018, 8), 'stoneD'), (T(dome(r, 8, 3), y=0.0012), 'brickR'), (T(cyl(r * 0.24, r * 0.32, 8), y=r + 0.0008), 'brickR'),
            (T(cone(r * 0.3, r * 0.3, 8), y=r * 1.32 + 0.0008), 'brickR'), (T(rect_win(r * 0.2, r * 0.14), 0, r + 0.001, r * 0.24 + 0.0002), 'ink')]

def chreli_abano():
    """the Orbeliani bath (Chreli Abano): a facade of blue glazed tiles round a tall pointed portal, two slim towers"""
    P = [(box(0.022, 0.016, 0.012), 'plasterB'), (T(box(0.023, 0.0016, 0.013), y=0.016), 'stoneD'),
         (T(plate([(-0.0045, 0), (0.0045, 0), (0.0045, 0.009), (0, 0.0135), (-0.0045, 0.009)]), 0, 0, 0.0063), 'blue'),
         (T(plate([(-0.003, 0), (0.003, 0), (0.003, 0.007), (0, 0.0105), (-0.003, 0.007)]), 0, 0, 0.0068), 'ink')]
    for sx in (-1, 1): P += [(T(cyl(0.0018, 0.022, 8), sx * 0.0115, 0, 0.0055), 'plasterB'), (T(cone(0.0022, 0.004, 8), sx * 0.0115, 0.022, 0.0055), 'blue')]
    return P

def metekhi():
    """Metekhi (13th c.) on its cliff: a compact cross-dome of warm stone, a brick drum and a grey cone"""
    return xchurch(L=0.032, B=0.016, C=0.028, H=0.022, R=0.0066, DH=0.015, CH=0.011, n=8, wall='stoneAl', drum='brickR', roof='samR', rise=0.36, apse=True)

def vakhtang():
    """Vakhtang Gorgasali, founder of Tbilisi, on horseback at the cliff edge, his hand raised"""
    P = [(box(0.012, 0.007, 0.007), 'stoneD')] + [(T(g_, 0, 0.007, 0), 'bronze') for g_, _ in horse('bronze')]
    P += [(T(box(0.0034, 0.0075, 0.003), 0, 0.022, 0), 'bronze'), (T(ball(0.0017, 5, 4), y=0.031), 'bronze'), (T(box(0.0009, 0.007, 0.0009), 0.002, 0.03, 0, rz=-0.3), 'bronze')]
    return P

def build_tbilisi():
    g = 'Tbilisi'; X, Z = stop3('Tbilisi'); region_empty(g, X, Z)
    # Sameba on Elia hill, its bell tower to the west
    place(g + ':Sameba', sameba(), X, Z, 0.102, -0.074, foot=0.04)
    place(g + ':Sameba', campanile(0.011, 0.046, 'samW', 'samR'), X, Z, 0.066, -0.102, foot=0.008)
    # the State Guest House (former presidential palace) with its glass egg dome, above Rike Park
    place(g + ':Sameba', [(box(0.04, 0.016, 0.022), 'white'), (T(box(0.012, 0.016, 0.028), y=0), 'white'), (T(box(0.042, 0.0012, 0.024), y=0.016), 'stoneS'),
                          (T(dome(0.0085, 10, 3), y=0.0172, s=(1, 1.25, 1)), 'glass'), (T(cyl(0.0088, 0.0012, 10), y=0.0166), 'steel')] +
          [(T(rect_win(0.0022, 0.009), -0.017 + k * 0.0068, 0.003, 0.0113), 'ink') for k in range(6)], X, Z, 0.07, -0.026, ry=0.25, foot=0.02)
    # Narikala: the citadel walls along the crest of the Sololaki ridge and down towards the baths, towers square and round,
    # St Nicholas inside
    nk = g + ':Narikala'
    crest = [(-0.052, 0.03), (-0.064, 0.034), (-0.078, 0.038), (-0.092, 0.041), (-0.104, 0.043)]
    wall_line(nk, X, Z, crest, h=0.013, th=0.005, mat='stoneGe', seg=0.008, crenel=True)
    wall_line(nk, X, Z, [(-0.064, 0.034), (-0.06, 0.05), (-0.075, 0.056), (-0.092, 0.052), (-0.104, 0.043)], h=0.01, th=0.0045, mat='stoneGe', seg=0.008, crenel=True)
    wall_line(nk, X, Z, [(-0.052, 0.03), (-0.047, 0.022)], h=0.009, th=0.004, mat='stoneGe', seg=0.006, crenel=True)
    for k, (tx, tz) in enumerate(crest + [(-0.06, 0.05), (-0.092, 0.052), (-0.047, 0.022)]):
        if k % 2: P = [(cyl(0.0058, 0.024, 8), 'stoneGe')] + [(T(box(0.0022, 0.0028, 0.0022), math.cos(c / 8 * 2 * PI) * 0.005, 0.024, math.sin(c / 8 * 2 * PI) * 0.005), 'stoneGe') for c in range(0, 8, 2)]
        else: P = [(box(0.011, 0.026, 0.011), 'stoneGe'), (T(box(0.0118, 0.0014, 0.0118), y=0.016), 'brickD')] + [(T(box(0.0026, 0.003, 0.0026), sx * 0.0045, 0.026, sz * 0.0045), 'stoneGe') for sx in (-1, 1) for sz in (-1, 1)]
        place(nk, P, X, Z, tx, tz, foot=0.006)
    place(nk, xchurch(L=0.022, B=0.011, C=0.018, H=0.013, R=0.0043, DH=0.009, CH=0.008, wall='stoneAl', drum='brickR', roof='tile', cross_s=0.7), X, Z, -0.079, 0.046, ry=0.1, foot=0.012)
    place(g + ':KartlisDeda', kartlis_deda(), X, Z, -0.117, 0.047, ry=PI + 0.15, foot=0.006)
    # the Mtkvari gorge: Metekhi's rock on the left bank, King Vakhtang at its edge; bare rock under Narikala opposite
    mk = g + ':Metekhi'
    place(mk, rock([(-0.012, -0.022), (0.006, -0.026), (0.024, -0.02), (0.026, 0.004), (0.014, 0.014), (-0.004, 0.012), (-0.012, 0.0)], 0.04, 'rockG', 0.12, 3), X, Z, 0.03, -0.008, y=-0.026, foot=0.016)
    place(mk, metekhi(), X, Z, 0.032, -0.01, ry=0.25, y=0.011, foot=0.016)
    place(mk, vakhtang(), X, Z, 0.02, 0.0, ry=PI * 0.9, y=0.011, foot=0.016)
    # the Bridge of Peace from the old town over to Rike Park; Rike's two steel tubes (the unfinished concert hall)
    place_span(g + ':BridgeOfPeace', bridge_of_peace, X, Z, (-0.04, -0.036), (0.016, -0.04), lift=0.001)
    for k, (tx, tz, a) in enumerate(((0.03, -0.056, 0.3), (0.042, -0.046, 0.65))):
        arc = [(-0.018 + t / 8 * 0.036, 0.007 + 0.005 * math.sin(t / 8 * PI), 0) for t in range(9)]
        place(g + ':RikePark', [(tube(arc, 0.0058, 8), 'steel'), (T(box(0.03, 0.004, 0.011)), 'stoneD')] + [(T(ball(0.0024, 6, 4), -0.0182, 0.007, 0), 'glassD')], X, Z, tx, tz, ry=a, foot=0.014)
    for k in range(5): safe(g + ':RikePark', t_broad(0.022, 'leafL'), X, Z, 0.01 + k * 0.006, -0.03 - (k % 2) * 0.008, foot=0)
    # Abanotubani: the brick domes of the sulphur baths under Narikala, the blue Orbeliani bath, the Jumah mosque's minaret
    ab = g + ':Abanotubani'
    place(ab, [(box(0.03, 0.0018, 0.024), 'stoneS')], X, Z, -0.034, 0.024, ry=0.3, foot=0.016, sink=0.001)
    for d in ((-0.042, 0.02), (-0.03, 0.017), (-0.022, 0.026), (-0.034, 0.031), (-0.046, 0.032)):
        place(ab, bath_dome(0.0072 + rng.random() * 0.0015), X, Z, d[0], d[1], foot=0.008, sink=0.003)
    place(ab, chreli_abano(), X, Z, -0.053, 0.026, ry=-0.9, foot=0.01)
    place(ab, [(box(0.012, 0.01, 0.01), 'brickR'), (T(cyl(0.0016, 0.026, 8), 0.004, 0.0, 0.003), 'brickR'), (T(cyl(0.0021, 0.0012, 8), 0.004, 0.02, 0.003), 'brickR'),
               (T(cone(0.0017, 0.004, 8), 0.004, 0.026, 0.003), 'samR')], X, Z, -0.056, 0.038, foot=0.008)
    # the old town (Kala, Sololaki) on the right bank: balconied houses packed along the lanes, Sioni's grey cone, the
    # leaning clock tower of the puppet theatre
    LANES = [[(-0.052, -0.03), (-0.07, -0.026), (-0.09, -0.018), (-0.11, -0.012)], [(-0.05, -0.01), (-0.065, 0.004), (-0.085, 0.012), (-0.105, 0.016)],
             [(-0.07, -0.026), (-0.075, -0.045), (-0.085, -0.062)], [(-0.09, -0.018), (-0.096, 0.0), (-0.1, 0.016)]]
    for ln in LANES: road(g + ':Lanes', X, Z, ln, wdt=0.004, mat='path', n=24)
    place(g, xchurch(L=0.026, B=0.012, C=0.02, H=0.016, R=0.0048, DH=0.01, CH=0.009, wall='stoneAl', roof='samR'), X, Z, -0.06, -0.012, ry=0.05, foot=0.012)  # Sioni
    tower = [(T(box(0.004, 0.026, 0.004), rz=0.06), 'brickR'), (T(box(0.005, 0.006, 0.005), 0.0016, 0.026, 0, rz=0.06), 'plasterB'), (T(pyramid(0.0056, 0.0056, 0.005), 0.0019, 0.032, 0, rz=0.06), 'tinG')]
    place(g, tower, X, Z, -0.064, -0.034, foot=0.004)
    walls = ['plaster', 'plasterY', 'plasterP', 'plasterB', 'plasterG', 'brickR', 'plaster']
    roofs = ['tin', 'tinR', 'tin', 'tinG', 'tinR']
    balcs = ['balc', 'balc', 'balcB', 'balcG', 'balcW', 'balcD']
    def mk_house(): return tb_house(0.012 + rng.random() * 0.008, 0.011 + rng.random() * 0.004, 2 + (rng.random() > 0.55), pick(walls), pick(roofs), pick(balcs), rng)
    houses(g, X, Z, 40, mk_house, (-0.118, 0.068, -0.08, 0.098), 'tb', ryj=0.4, face=lambda dx, dz: -0.3 + 0.6 * (dz > -0.02), foot=0.012, pack=0.36)
    houses(g, X, Z, 12, mk_house, (-0.14, 0.035, -0.07, 0.06), 'tb2', ryj=0.5, foot=0.012, pack=0.42)                  # Sololaki, under Mtatsminda
    houses(g, X, Z, 22, mk_house, (0.04, 0.09, -0.016, 0.07), 'tb3', ryj=0.5, foot=0.012, pack=0.42)                 # Avlabari, the left bank
    houses(g, X, Z, 16, mk_house, (-0.06, 0.11, -0.15, 0.06), 'tb4', ryj=0.5, foot=0.012, pack=0.42)                  # up the river, north
    # the rest of the city: Soviet-era and newer apartment blocks spreading out along the valley (Vake, Saburtalo, Vera,
    # Isani, Ortachala), greyer and taller than the old town
    def mk_blk(): return batumi_block(0.012 + rng.random() * 0.01, 0.01 + rng.random() * 0.004, 3 + rng.randrange(4), pick(['plaster', 'stoneS', 'plasterY', 'stoneD', 'plasterB', 'plasterP']), 'ink')
    for area, n_ in (((-0.17, 0.1, -0.15, 0.07), 14), ((0.1, 0.07, 0.03, 0.1), 12), ((0.06, 0.07, 0.07, 0.07), 8)):
        houses(g, X, Z, n_, mk_blk, area, 'tbb', ryj=0.3, ry0=0.35, foot=0.01, pack=0.45)
    # Mtatsminda: the TV tower and the big wheel on the ridge, the funicular's upper station, St David's church and the pantheon
    place(g + ':TVTower', tv_tower(), X, Z, -0.158, -0.036, foot=0.012)
    ferris(g, X, Z, -0.14, -0.012, R=0.02, n=10, ry=0.9, name='Tbilisi_Wheel')
    place(g, [(box(0.026, 0.012, 0.014), 'white'), (T(box(0.028, 0.0012, 0.016), y=0.012), 'stoneS')] + [(T(arch_win(0.003, 0.007), -0.009 + k * 0.006, 0.002, 0.0073), 'ink') for k in range(4)],
          X, Z, -0.152, -0.058, ry=0.6, foot=0.012)
    ftrack = [(-0.11, -0.056), (-0.128, -0.057), (-0.146, -0.058)]
    road(g + ':Lanes', X, Z, ftrack, wdt=0.0025, mat='ink', n=12)
    place(g, xchurch(L=0.018, B=0.009, C=0.015, H=0.011, R=0.0036, DH=0.007, CH=0.007, wall='stoneAl', roof='samR', cross_s=0.6) + [(T(g_, -0.014, 0, 0.006), m_) for g_, m_ in campanile(0.006, 0.022, 'stoneAl', 'samR')],
          X, Z, -0.126, -0.046, ry=0.5, foot=0.01)
    cable_car(g, X, Z, (0.026, -0.046), (-0.07, 0.03), n_cab=3, col='glassD')
    # trees: plane trees along the embankments, pines planted over Mtatsminda, gardens
    for k in range(26):
        a = rng.random() * 2 * PI; r = rng.random() ** 0.6 * 0.045
        dx, dz = -0.135 + math.cos(a) * r * 1.1, 0.012 + math.sin(a) * r
        if not occupied(X + dx * LM, Z + dz * LM, 0.006 * LM): safe(g, t_pine(0.022 + rng.random() * 0.008), X, Z, dx, dz, foot=0, occ=False)
    for k in range(30):
        dx, dz = -0.13 + rng.random() * 0.25, -0.13 + rng.random() * 0.22
        if not occupied(X + dx * LM, Z + dz * LM, 0.012 * LM): safe(g, t_broad(0.02 + rng.random() * 0.008, pick(['leaf', 'oak', 'leafL'])), X, Z, dx, dz, foot=0, occ=False)
    C, closed = chan_world('tb_loop')
    drive(g, 'Tbilisi_Van', delica(), C, laps=1.0, s=0.9)
    dest_hooks(g, X, Z, -0.03, -0.02, 0.22, 0.17, (-0.005, 0.06, 0.005, 0.45, 34, 2.0))

def ferris(g, X0, Z0, dx, dz, R=0.034, n=12, ry=0.55, name='Wheel', cab_mat='red'):
    hub = R + 0.009
    M = placeM(X0, Z0, dx, dz, ry=ry, foot=0.006)
    if M is None: return
    OCC.append((M[0, 3], M[2, 3], R * LM))
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
def vineyard(group, X0, Z0, cxl, czl, w, d, ang, sp=0.0056, seg=0.0085):
    """a plot of trellised vines in proper rows, every short run settling on the ground; rows skip roads and rivers"""
    ca, sa = math.cos(ang), math.sin(ang)
    nr, ns = max(1, int(d / sp)), max(1, int(w / seg))
    for r in range(nr):
        for k in range(ns):
            u = -w / 2 + (k + 0.5) * seg; v = -d / 2 + (r + 0.5) * sp
            dx, dz = cxl + u * ca - v * sa, czl + u * sa + v * ca
            Xw, Zw = X0 + dx * LM, Z0 + dz * LM
            if near_channel(Xw, Zw, 0.3) or occupied(Xw, Zw, 0.002 * LM): continue
            P = [(T(box(seg * 0.96, 0.0036, 0.0022), y=0.0012), pick(['vine', 'vine', 'leafL'])), (T(box(0.0007, 0.005, 0.0007), -seg * 0.48, 0, 0), 'wood')]
            place(group, P, X0, Z0, dx, dz, ry=-ang, foot=0, sink=0.0006, occ=False)

def alaverdi():
    """Alaverdi (early 11th c.), 55 m: long held the tallest church in Georgia. Very plain yellowish stone, a long nave
    with lower side galleries, steep gables, a high drum and its grey cone."""
    return xchurch(L=0.064, B=0.026, C=0.046, H=0.038, R=0.0102, DH=0.026, CH=0.018, n=12, wall='stoneAl', roof='samR', rise=0.4, low_annex=0.5, cross_s=1.1)

def build_kakheti():
    g = 'Kakheti'; X, Z = stop3('Telavi'); region_empty(g, X, Z)
    # Alaverdi in its fortified close on the valley floor: the cathedral, the gate tower, the bishop's palace, the marani
    al = g + ':Alaverdi'; ax, az = -0.085, -0.052
    place(al, alaverdi(), X, Z, ax, az, ry=0.08, foot=0.03)
    wall_line(al, X, Z, [(ax - 0.062, az - 0.042), (ax + 0.06, az - 0.046), (ax + 0.064, az + 0.042), (ax - 0.058, az + 0.046)], h=0.008, th=0.0035, mat='stoneAl', seg=0.012, closed=True)
    for cxx, czz in ((ax - 0.062, az - 0.042), (ax + 0.06, az - 0.046), (ax + 0.064, az + 0.042), (ax - 0.058, az + 0.046)):
        place(al, [(box(0.009, 0.017, 0.009), 'stoneAl'), (T(pyramid(0.01, 0.01, 0.005), y=0.017), 'tile')], X, Z, cxx, czz, foot=0.005)
    place(al, campanile(0.012, 0.03, 'stoneAl', 'tile'), X, Z, ax - 0.06, az + 0.0, foot=0.008)
    place(al, [(box(0.03, 0.014, 0.012), 'brickR'), (T(gable(0.013, 0.004, 0.031), y=0.014, ry=PI / 2), 'tile')] + [(T(arch_win(0.0036, 0.0075), -0.012 + k * 0.006, 0.0, 0.0063), 'ink') for k in range(5)],
          X, Z, ax + 0.03, az + 0.03, ry=0.08, foot=0.014)
    for k in range(5): place(al, qvevri(0.32, True), X, Z, ax - 0.03 + k * 0.007, az + 0.035, ry=0.1, foot=0)
    # Telavi on its slope: Batonistsikhe (Erekle II's walls, palace and churches), the 900-year-old plane tree, the town
    tl = g + ':Telavi'
    bx, bz = 0.0, 0.012
    wall_line(tl, X, Z, [(bx - 0.03, bz - 0.022), (bx + 0.03, bz - 0.022), (bx + 0.03, bz + 0.022), (bx - 0.03, bz + 0.022)], h=0.01, th=0.004, mat='brickR', seg=0.01, closed=True, crenel=True)
    for cxx, czz in ((bx - 0.03, bz - 0.022), (bx + 0.03, bz - 0.022), (bx + 0.03, bz + 0.022), (bx - 0.03, bz + 0.022)):
        place(tl, [(cyl(0.0055, 0.018, 8), 'brickR'), (T(cone(0.006, 0.006, 8), y=0.018), 'tileD')], X, Z, cxx, czz, foot=0.005)
    place(tl, [(box(0.024, 0.014, 0.012), 'plasterY'), (T(hip(0.026, 0.014, 0.005), y=0.014), 'tile')] + [(T(arch_win(0.0032, 0.007), -0.009 + k * 0.006, 0.004, 0.0063), 'ink') for k in range(4)],
          X, Z, bx - 0.006, bz - 0.006, foot=0.012)
    place(tl, xchurch(L=0.02, B=0.01, C=0.016, H=0.012, R=0.004, DH=0.008, CH=0.007, wall='brickR', roof='tile', cross_s=0.6), X, Z, bx + 0.016, bz + 0.008, foot=0.01)
    place(tl, [(cyl(0.0035, 0.018, 6, 0.0045), 'trunk'), (T(ball(0.022, 8, 5), y=0.03, s=(1.15, 0.75, 1.1)), 'oak'), (T(ball(0.014, 7, 4), 0.012, 0.038, 0.006), 'oakD')], X, Z, -0.034, 0.034, foot=0)
    def mk_kh(): return town_house(0.016 + rng.random() * 0.008, 0.013, 0.012 + rng.random() * 0.005, pick(['plaster', 'plasterY', 'brickR', 'stoneAl']), pick(['tile', 'tileD', 'tin']), balcony=rng.random() > 0.35, hipped=rng.random() > 0.5)
    houses(g, X, Z, 16, mk_kh, (-0.07, 0.11, 0.032, 0.06), 'te', mind=0.021, ryj=0.5)
    # Tsinandali: the Chavchavadze house - arched loggia below, wooden balcony above - in its English garden, the winery
    ts = g + ':WineEstate'; tx_, tz_ = 0.056, 0.02
    P = [(box(0.03, 0.017, 0.016), 'plasterY'), (T(hip(0.032, 0.018, 0.006), y=0.017), 'tin')]
    P += [(T(arch_win(0.004, 0.0068), -0.011 + k * 0.0055, 0.0, 0.0083), 'ink') for k in range(5)]
    P += [(T(box(0.028, 0.0008, 0.005), 0, 0.0085, 0.0105), 'balc'), (T(box(0.028, 0.0028, 0.0006), 0, 0.0093, 0.0128), 'balc')] + [(T(box(0.0008, 0.0085, 0.0008), -0.013 + k * 0.0052, 0.0085, 0.0126), 'balc') for k in range(6)]
    place(ts, P, X, Z, tx_, tz_, ry=-0.05, foot=0.016)
    place(ts, [(box(0.028, 0.012, 0.012), 'stoneAl'), (T(gable(0.013, 0.004, 0.03), y=0.012, ry=PI / 2), 'tile'), (T(rect_win(0.006, 0.008), 0, 0, 0.0063), 'balcD')], X, Z, tx_ + 0.04, tz_ - 0.006, ry=0.2, foot=0.014)
    for j in ((tx_ + 0.03, tz_ + 0.012, 0.42), (tx_ + 0.037, tz_ + 0.017, 0.36), (tx_ + 0.044, tz_ + 0.011, 0.4)): place(ts, qvevri(j[2]), X, Z, j[0], j[1], foot=0, sink=0.012 * j[2])
    place(ts, qvevri(0.4, True), X, Z, tx_ + 0.05, tz_ + 0.018, ry=0.6, foot=0)
    for k in range(14):
        a = rng.random() * 2 * PI; r = 0.018 + rng.random() * 0.016
        safe(ts, t_clump(0.026 + rng.random() * 0.01, pick(['oak', 'walnut', 'beech'])), X, Z, tx_ + math.cos(a) * r, tz_ + math.sin(a) * r * 0.8 + 0.01, foot=0, occ=False)
    # Gremi: the brick citadel church of the Archangels and its tower on a knoll across the valley
    gr = g + ':Gremi'
    place(gr, xchurch(L=0.026, B=0.012, C=0.022, H=0.017, R=0.0052, DH=0.011, CH=0.009, wall='brickR', roof='tile', cross_s=0.7) + [(T(g_, -0.022, 0, 0.01), m_) for g_, m_ in campanile(0.01, 0.034, 'brickR', 'tile')],
          X, Z, 0.116, -0.064, ry=0.2, foot=0.014)
    wall_line(gr, X, Z, [(0.094, -0.08), (0.138, -0.084), (0.14, -0.048), (0.096, -0.044)], h=0.006, th=0.003, mat='brickR', closed=True, crenel=True)
    # Sighnaghi along its ridge: the long town wall with its towers, red roofs and balconies inside, St George's
    sg = g + ':Sighnaghi'; sx_, sz_ = 0.208, 0.198
    ring = []
    for k in range(14):
        a = k / 14 * 2 * PI; rr = 1 + 0.12 * math.sin(k * 2.3)
        ring.append((sx_ + math.cos(a) * 0.056 * rr * 0.92 + math.sin(a) * 0.012, sz_ + math.sin(a) * 0.034 * rr + math.cos(a) * 0.028))
    wall_line(sg, X, Z, ring, h=0.01, th=0.0045, mat='stoneAl', seg=0.009, closed=True, crenel=True)
    for k, (tx, tz) in enumerate(ring):
        if k % 2 == 0: place(sg, [(cyl(0.0058, 0.02, 8), 'stoneAl'), (T(cone(0.0066, 0.0075, 8), y=0.02), 'tile')], X, Z, tx, tz, foot=0.005)
        elif k % 4 == 1: place(sg, [(box(0.01, 0.019, 0.01), 'stoneAl')] + [(T(box(0.0024, 0.0028, 0.0024), sx * 0.0038, 0.019, sz * 0.0038), 'stoneAl') for sx in (-1, 1) for sz in (-1, 1)], X, Z, tx, tz, foot=0.005)
    for h in range(16):
        a = rng.random() * 2 * PI; r = rng.random() ** 0.5 * 0.85
        dx, dz = sx_ + math.cos(a) * 0.048 * r * 0.92 + math.sin(a) * 0.012 * r, sz_ + math.sin(a) * 0.028 * r + math.cos(a) * 0.024 * r
        place(sg, town_house(0.013 + rng.random() * 0.005, 0.011, 0.011 + rng.random() * 0.004, pick(['plaster', 'plasterY', 'stoneAl', 'plasterP']), 'tile', balcony=rng.random() > 0.3, hipped=rng.random() > 0.6),
              X, Z, dx, dz, ry=0.75 + (rng.random() - 0.5) * 0.4, foot=0.006)
    place(sg, xchurch(L=0.02, B=0.01, C=0.017, H=0.013, R=0.004, DH=0.009, CH=0.008, wall='stoneAl', roof='tile', cross_s=0.6), X, Z, sx_ - 0.012, sz_ - 0.004, ry=0.7, foot=0.01)
    # Bodbe: St Nino's convent below the town, the basilica and the three-tiered bell tower among cypresses
    bd = g + ':Bodbe'; bdx, bdz = 0.19, 0.25
    place(bd, basilica(0.028, 0.012, 0.014, 'stoneAl', 'tinG'), X, Z, bdx, bdz, ry=0.3, foot=0.012)
    bt = [(box(0.011, 0.012, 0.011), 'plaster'), (T(box(0.009, 0.01, 0.009), y=0.012), 'plaster'), (T(box(0.007, 0.008, 0.007), y=0.022), 'plaster'), (T(pyramid(0.008, 0.008, 0.006), y=0.03), 'tinG')]
    bt += [(T(arch_win(0.0034, 0.006), 0, 0.013, 0.0046), 'ink'), (T(arch_win(0.0028, 0.005), 0, 0.023, 0.0036), 'ink')]
    place(bd, bt + gold_cross(0.036, 0.5), X, Z, bdx - 0.024, bdz + 0.004, foot=0.006)
    for t in ((-0.014, 0.012), (0.012, 0.014), (-0.03, -0.006), (0.024, -0.004), (-0.036, 0.012), (0.03, 0.016), (0.0, 0.022)): place(bd, cypress(0.034), X, Z, bdx + t[0], bdz + t[1], foot=0)
    # the vineyards of the Alazani valley floor, in rows; poplars along the road
    vy = g + ':Vineyards'
    for (cx_, cz_, w, d, a) in ((0.03, 0.002, 0.05, 0.026, 0.62), (0.095, 0.042, 0.05, 0.03, 0.66), (0.14, 0.095, 0.046, 0.03, 0.7), (-0.045, -0.012, 0.04, 0.022, 0.18),
                                (0.0, -0.07, 0.05, 0.026, 0.55), (0.065, -0.045, 0.05, 0.03, 0.6), (0.155, 0.02, 0.05, 0.03, 0.62), (0.2, 0.07, 0.05, 0.03, 0.65),
                                (-0.15, -0.0, 0.04, 0.03, 0.2), (0.11, 0.12, 0.03, 0.02, 0.7), (0.21, 0.02, 0.05, 0.03, 0.62), (0.25, 0.1, 0.05, 0.03, 0.66),
                                (0.05, 0.075, 0.04, 0.02, 0.6), (0.17, -0.04, 0.05, 0.03, 0.6), (-0.05, -0.09, 0.04, 0.025, 0.5)):
        vineyard(vy, X, Z, cx_, cz_, w, d, a)
    C, closed = chan_world('ka_loop')
    for k in range(0, len(C), 4):
        Xc, Zc = C[k]; a = C[(k + 1) % len(C)]; t = np.array([a[0] - Xc, a[1] - Zc]); t /= (np.linalg.norm(t) or 1)
        for side in (1, -1):
            px, pz = Xc + (-t[1]) * side * 0.012 * LM, Zc + t[0] * side * 0.012 * LM
            if rng.random() < 0.22 and not near_channel(px, pz, 0.3) and not occupied(px, pz, 0.004 * LM):
                place(g, t_poplar(0.04 + rng.random() * 0.012), X, Z, (px - X) / LM, (pz - Z) / LM, foot=0, occ=False)
    drive(g, 'Kakheti_Van', delica(), C, laps=1.0, phase=0.0)
    # a little red tractor doing laps of the vineyard
    tr = [(T(box(0.012, 0.006, 0.008), y=0.004), 'tractor'), (T(box(0.006, 0.007, 0.007), -0.002, 0.01, 0), 'tractor'), (T(box(0.0062, 0.004, 0.0072), -0.002, 0.012, 0), 'glassD'),
          (T(box(0.002, 0.007, 0.002), 0.004, 0.01, 0.002), 'ink')]
    for wx_, r_ in ((-0.003, 0.0045), (0.0045, 0.003)):
        for zz in (-0.0048, 0.0048): tr.append((T(cyl(r_, 0.002, 8), wx_, r_, zz, rx=PI / 2), 'tyre'))
    trailer = [(T(box(0.012, 0.004, 0.009), -0.016, 0.004, 0), 'wood'), (T(ball(0.0028, 5, 3), -0.018, 0.009, 0.002), 'grape'), (T(ball(0.0028, 5, 3), -0.014, 0.009, -0.002), 'grape'),
               (T(cyl(0.003, 0.002, 8), -0.016, 0.003, 0.0055, rx=PI / 2), 'tyre'), (T(cyl(0.003, 0.002, 8), -0.016, 0.003, -0.0055, rx=PI / 2), 'tyre')]
    M0 = placeM(X, Z, 0.095, 0.042)
    trac = anim_obj('Kakheti_Tractor', mtz_tractor(), M0, g)
    cxv, czv, a_, b_ = X + 0.095 * LM, Z + 0.042 * LM, 0.032 * LM, 0.022 * LM
    ca, sa = math.cos(0.66), math.sin(0.66)
    def lap(u):
        t = 2 * PI * u; c, s_ = math.cos(t), math.sin(t)
        px, pz = a_ * np.sign(c) * abs(c) ** 0.35, b_ * np.sign(s_) * abs(s_) ** 0.35
        return (cxv + px * ca - pz * sa, czv + px * sa + pz * ca)
    k_path(trac, g, lap, step=3, lift=-0.002)
    # a hot-air balloon drifting over the Alazani valley
    prof = [(0.0, 0.0), (0.006, 0.004), (0.016, 0.018), (0.024, 0.036), (0.026, 0.05), (0.022, 0.064), (0.012, 0.074), (0.0, 0.077)]
    bal = []
    for k in range(10): bal.append((lathe(prof, 1, k / 10 * 2 * PI, 2 * PI / 10), ['red', 'white', 'yellow', 'white'][k % 4]))
    bal += [(T(box(0.007, 0.006, 0.007), y=-0.016), 'wood')] + [(T(box(0.0005, 0.017, 0.0005), sx * 0.004, -0.011, sz * 0.004, rz=-sx * 0.15, rx=sz * 0.15), 'ink') for sx in (1, -1) for sz in (1, -1)]
    Mb0 = placeM(X, Z, 0.06, 0.08)
    if Mb0 is not None:
        Mb0 = Mb0.copy(); Mb0[1, 3] += 0.32
        bl = anim_obj('Kakheti_Balloon', bal, Mb0, g)
        k_wave(bl, 'location', 2, 0.035, cycles=1); k_wave(bl, 'location', 0, 0.09, cycles=1, phase=PI / 2); k_wave(bl, 'rotation_euler', 2, 0.6, cycles=1)
    for k in range(3): sway_tree(g, 'Kakheti_Tree%d' % (k + 1), t_broad(0.03, 'walnut'), X, Z, -0.04 + k * 0.03, 0.1 + (k % 2) * 0.02, phase=k)
    dest_hooks(g, X, Z, 0.05, 0.06, 0.28, 0.25, (0.06, 0.05, -0.01, -0.05, 40, 2.2))

# ------------------------------------------------------------------------------------------------ 3 · Tusheti
def build_tusheti():
    g = 'Tusheti'; X, Z = stop3('Omalo'); region_empty(g, X, Z)
    # Keselo: the restored tower group on its spur above Lower Omalo, the ruined walls between
    ks = g + ':Keselo'
    TW = ((-0.006, -0.03, 0.084), (0.02, -0.05, 0.096), (0.034, -0.022, 0.078), (-0.03, -0.016, 0.068), (-0.026, -0.052, 0.08), (0.008, -0.07, 0.074))
    for t in TW: place(ks, tush_tower(t[2], w=0.0155 + rng.random() * 0.002), X, Z, t[0], t[1], ry=(rng.random() - 0.5) * 0.3, foot=0.008)
    wall_line(ks, X, Z, [(-0.04, -0.06), (0.03, -0.074), (0.046, -0.014), (-0.04, -0.006)], h=0.005, th=0.0035, mat='stoneTu', closed=True)
    # Omalo: Lower Omalo under the towers, Upper Omalo's guesthouses on the meadow, slate and stone, wooden balconies
    om = g + ':Omalo'
    houses(om, X, Z, 7, lambda: tush_house(0.02 + rng.random() * 0.006, 0.016, 2 + (rng.random() > 0.6)), (-0.035, 0.04, -0.006, 0.03), 'om', ryj=0.4, ry0=0.2, pack=0.45)
    houses(om, X, Z, 8, lambda: tush_house(0.022 + rng.random() * 0.008, 0.016, 2), (-0.085, 0.05, 0.0, 0.035), 'om2', ryj=0.5, ry0=-0.1, pack=0.45)
    place(om, hall_church(0.018, 0.01, 0.01, 'stoneTu', 'slateTu'), X, Z, -0.03, -0.012, ry=0.2, foot=0.01)
    # Dartlo: slate houses stepping down the slope above the Pirikiti Alazani, its towers above, the small stone church
    da = g + ':Dartlo'; dx0, dz0 = -0.168, -0.058
    for k in range(11):
        row = k // 4; col = k % 4
        dx = dx0 - 0.034 + col * 0.019 + row * 0.009 + (rng.random() - 0.5) * 0.006; dz = dz0 + 0.014 - row * 0.014 + (rng.random() - 0.5) * 0.004
        place(da, tush_house(0.014 + rng.random() * 0.007, 0.012 + rng.random() * 0.004, 2 + (row == 0) + (rng.random() > 0.7)), X, Z, dx, dz, ry=0.15 + (rng.random() - 0.5) * 0.35, foot=0.01)
    for t in ((dx0 - 0.02, dz0 - 0.032, 0.07), (dx0 + 0.016, dz0 - 0.036, 0.08)): place(da, tush_tower(t[2], w=0.015), X, Z, t[0], t[1], foot=0.008)
    place(da, hall_church(0.014, 0.008, 0.008, 'stoneTu', 'slateTu', belfry=False), X, Z, dx0 + 0.04, dz0 + 0.006, ry=0.3, foot=0.006)
    C, closed = chan_world('tu_loop')
    drive(g, 'Tusheti_Jeep', uaz_bukhanka(), C, laps=1.0, s=0.8)
    # the high pastures: pine and birch on the shaded slopes, juniper scrub, rock, a stone sheepfold, the flock, the horses
    def tu_trees(hm, dry, n1, h):
        return t_pine(h * 1.1, pick(['pineT', 'spruce'])) if rng.random() < 0.7 else t_birch(h * 0.9)
    forest(g, X, Z, 0.3, dens=0.9, ox=-0.09, scatter=0.02, kinds=tu_trees, sp=0.013,
           avoid=[(0.01, -0.03, 0.05), (-0.04, 0.015, 0.05), (dx0, dz0, 0.05)])
    for t in range(18): safe(g, [(T(ball(0.0035, 5, 3), y=0.0022, s=(1.4, 0.7, 1)), pick(['pineT', 'oakD', 'olive']))], X, Z, -0.22 + rng.random() * 0.24, -0.04 + rng.random() * 0.16, foot=0, occ=False)
    for t in range(16): safe(g, boulder(0.8 + rng.random() * 1.2), X, Z, -0.24 + rng.random() * 0.26, -0.1 + rng.random() * 0.18, foot=0, occ=False)
    wall_line(g, X, Z, [(-0.07 + math.cos(k / 10 * 2 * PI) * 0.018, 0.075 + math.sin(k / 10 * 2 * PI) * 0.014) for k in range(10)], h=0.005, mat='stoneTu', closed=True)
    for s_ in range(14):
        c0 = (-0.115 + rng.random() * 0.09, 0.062 + rng.random() * 0.012); r0 = 0.004 + rng.random() * 0.006; ph = rng.random()
        M = placeM(X, Z, c0[0], c0[1], foot=0)
        if M is None: continue
        sh = anim_obj('Tusheti_Sheep%d' % (s_ + 1), sheep(), M, g)
        d_ = 1 if rng.random() > 0.5 else -1
        k_path(sh, g, lambda u, c0=c0, r0=r0, ph=ph, d_=d_: (X + (c0[0] + r0 * math.cos(d_ * 2 * PI * (u + ph))) * LM, Z + (c0[1] + r0 * 0.6 * math.sin(d_ * 2 * PI * (u + ph))) * LM), step=8, lift=-0.0005)
    for k, (c0, ra, rb, col) in enumerate((((-0.045, 0.07), 0.02, 0.008, 'horse'), ((-0.02, 0.074), 0.016, 0.007, 'horseD'), ((-0.13, 0.068), 0.016, 0.007, 'horse'))):
        M = placeM(X, Z, c0[0], c0[1], foot=0)
        if M is None: continue
        hs = anim_obj('Tusheti_Horse%d' % (k + 1), horse(col), M, g)
        k_path(hs, g, lambda u, c0=c0, ra=ra, rb=rb, k=k: (X + (c0[0] + ra * math.cos(2 * PI * u + k)) * LM, Z + (c0[1] + rb * math.sin(2 * PI * u + k)) * LM), step=6, lift=-0.001)
    for k in range(3): sway_tree(g, 'Tusheti_Tree%d' % (k + 1), t_pine(0.036), X, Z, -0.235 + k * 0.022, 0.0 + k * 0.02, amp=0.02, phase=k * 1.1)
    bird(g, 'Tusheti_Eagle', (X - 0.08 * LM, 0, Z - 0.02 * LM), 0.1 * LM, REGION[g][1][2, 3] + 0.3, col='horseD', size=1.3, turns=1, phase=1.0, flap=1)
    dest_hooks(g, X, Z, -0.08, -0.01, 0.2, 0.17, (0.0, 0.06, 0.0, -0.22, 42, 2.15))

# ------------------------------------------------------------------------------------------------ 4 · scenery along the way (not destinations)
def map_pts(X0, Z0, pts):
    """absolute map points -> local LM offsets for a region"""
    return [((wx(p[0]) - X0) / LM, (wz(p[1]) - Z0) / LM) for p in pts]

def colchis_fountain():
    F = [(cyl(0.024, 0.0035, 16), 'stoneD'), (T(cyl(0.021, 0.0008, 16), y=0.0035), 'water'), (T(cyl(0.0035, 0.016, 6, 0.005), y=0.0035), 'gold'), (T(cone(0.003, 0.03, 6), y=0.019), 'water')]
    for k in range(12):
        a = k / 12 * 2 * PI; F.append((T(cyl(0.0016, 0.009, 5, 0.0024), math.cos(a) * 0.016, 0.0035, math.sin(a) * 0.016), 'gold'))
    return F

def build_kutaisi():
    # Kutaisi: Bagrati on Ukimerioni hill on the right bank of the Rioni, the old centre on the left bank round the Colchis
    # Fountain, the White Bridge between; Gelati and Motsameta in the wooded hills to the north-east
    g = 'Scenery_Kutaisi'; X, Z = stop3('Kutaisi'); region_empty(g, X, Z)
    place(g, xchurch(L=0.076, B=0.03, C=0.062, H=0.036, R=0.0118, DH=0.026, CH=0.02, n=12, wall='stoneAl', roof='samR', low_annex=0.55, plinth=0.004, rise=0.36, cross_s=1.1),
          X, Z, -0.048, -0.052, ry=0.05, foot=0.04)
    place(g, campanile(0.011, 0.028, 'stoneAl', 'samR'), X, Z, -0.088, -0.04, foot=0.008)
    wall_line(g, X, Z, [(-0.1, -0.09), (-0.005, -0.094), (-0.002, -0.02), (-0.096, -0.016)], h=0.005, th=0.0035, mat='stoneGe', closed=True)
    place_span(g, lambda L: [(box(L, 0.0018, 0.008), 'white')] + [(T(box(L, 0.004, 0.0008), 0, 0.0018, s_ * 0.0038), 'white') for s_ in (-1, 1)] +
               [(T(box(0.0008, 0.004, 0.008), x, 0.0018, 0), 'white') for x in np.linspace(-L / 2, L / 2, 7)], X, Z, (-0.03, -0.034), (0.024, -0.03), lift=0.002)
    place(g, colchis_fountain(), X, Z, 0.045, -0.006, foot=0)
    P = [(box(0.034, 0.018, 0.02), 'plasterY'), (T(hip(0.036, 0.022, 0.006), y=0.018), 'tin')] + [(T(box(0.0026, 0.012, 0.0026), -0.012 + k * 0.006, 0, 0.011), 'white') for k in range(5)] + [(T(box(0.034, 0.003, 0.004), 0, 0.012, 0.0115), 'plaster')]
    place(g, P, X, Z, 0.052, -0.04, ry=0.0, foot=0.016)   # the Meskhishvili theatre facing the square
    def mk_ku(): return town_house(0.016 + rng.random() * 0.01, 0.014, 0.012 + rng.random() * 0.007, pick(['plaster', 'plasterY', 'plasterP', 'stoneAl', 'plasterB']), pick(['tile', 'tileD', 'tin', 'tinR']), balcony=rng.random() > 0.45, hipped=rng.random() > 0.5)
    houses(g, X, Z, 22, mk_ku, (0.015, 0.13, -0.075, 0.13), 'ku', mind=0.022)
    houses(g, X, Z, 8, mk_ku, (-0.13, 0.1, -0.005, 0.07), 'ku2', mind=0.022)
    # Gelati (1106): the Church of the Virgin, St George and St Nicholas, the Academy's roofless hall, the bell tower, the wall
    gx, gz = 0.15, -0.106
    place(g, xchurch(L=0.06, B=0.026, C=0.05, H=0.032, R=0.0104, DH=0.022, CH=0.018, n=12, wall='stoneAl', roof='tile', low_annex=0.5, rise=0.36), X, Z, gx, gz, ry=0.05, foot=0.03)
    place(g, xchurch(L=0.028, B=0.013, C=0.024, H=0.018, R=0.0055, DH=0.012, CH=0.01, wall='stoneAl', roof='tile', cross_s=0.7), X, Z, gx + 0.048, gz + 0.018, ry=0.05, foot=0.014)
    place(g, [(box(0.014, 0.014, 0.014), 'stoneAl'), (T(box(0.014, 0.0014, 0.014), y=0.007), 'stoneD')] + [(T(arch_win(0.004, 0.006), 0, 0.0, s_ * 0.0073), 'ink') for s_ in (-1, 1)] +
          [(T(gable(0.015, 0.004, 0.015), y=0.014), 'tile')], X, Z, gx - 0.042, gz + 0.02, foot=0.01)
    for sx, sz, L_, D_ in ((0, 0.009, 0.034, 0.0025), (0, -0.009, 0.034, 0.0025), (0.016, 0, 0.0025, 0.02), (-0.016, 0, 0.0025, 0.02)):
        place(g, [(box(L_, 0.012, D_), 'stoneAl')], X, Z, gx - 0.03 + sx, gz - 0.034 + sz, foot=0.006)
    place(g, campanile(0.011, 0.03, 'stoneAl', 'tile'), X, Z, gx + 0.036, gz - 0.03, foot=0.008)
    wall_line(g, X, Z, [(gx + math.cos(k / 16 * 2 * PI) * 0.072, gz + math.sin(k / 16 * 2 * PI) * 0.055) for k in range(16)], h=0.006, th=0.0035, mat='stoneAl', closed=True)
    # Motsameta on its cliff over the Tskaltsitela gorge
    place(g, rock([(-0.016, -0.012), (0.014, -0.016), (0.018, 0.01), (-0.004, 0.016), (-0.018, 0.004)], 0.03, 'rockG', 0.15, 7) +
          [(T(g_, 0, 0.026, 0), m_) for g_, m_ in xchurch(L=0.02, B=0.01, C=0.016, H=0.012, R=0.0042, DH=0.008, CH=0.008, wall='stoneAl', roof='tile', cross_s=0.6)] +
          [(T(g_, -0.012, 0.026, 0.008), m_) for g_, m_ in campanile(0.006, 0.02, 'stoneAl', 'tile')],
          X, Z, 0.205, -0.035, ry=0.4, y=-0.02, foot=0.012)
    road(g, X, Z, [[0.05, -0.02], [0.09, -0.05], [0.12, -0.075], [0.135, -0.09]], wdt=0.005, mat='asphalt', n=30)
    for t in ((-0.07, -0.08), (-0.02, -0.085), (-0.09, -0.03), (0.0, -0.07), (gx - 0.06, gz + 0.04), (gx + 0.065, gz + 0.03), (gx + 0.02, gz + 0.05)): safe(g, cypress(), X, Z, t[0], t[1], foot=0, occ=False)
    forest(g, X, Z, 0.3, dens=1.0, scatter=0.08, avoid=[(0.06, 0.0, 0.08), (-0.05, -0.05, 0.05), (gx, gz, 0.07), (-0.08, 0.03, 0.05)])

def gergeti():
    """Gergeti Trinity (Tsminda Sameba, 14th c.) at 2170 m: a small cross-dome of grey-brown andesite with a tall drum
    and a stone cone, and the separate two-storey bell tower"""
    return xchurch(L=0.036, B=0.016, C=0.03, H=0.021, R=0.0068, DH=0.019, CH=0.013, n=8, wall='stoneGe', roof='stoneGeD', rise=0.42, cross_s=0.9)

def build_kazbegi():
    g = 'Scenery_Kazbegi'; X, Z = stop3('Stepantsminda'); region_empty(g, X, Z)
    gx, gz = -0.038, -0.01
    place(g, gergeti(), X, Z, gx, gz, ry=0.0, foot=0.022)
    place(g, campanile(0.01, 0.026, 'stoneGe', 'stoneGeD'), X, Z, gx - 0.008, gz + 0.026, ry=0.1, foot=0.008)
    wall_line(g, X, Z, [(gx - 0.03, gz - 0.022), (gx + 0.028, gz - 0.024), (gx + 0.03, gz + 0.034), (gx - 0.028, gz + 0.036)], h=0.004, th=0.003, mat='stoneGe', closed=True)
    def mk_kz(): return town_house(0.014 + rng.random() * 0.008, 0.012, 0.011 + rng.random() * 0.004, pick(['stoneGe', 'plaster', 'stoneAl', 'plasterB']), pick(['tinR', 'tinG', 'tin', 'tinR']), chimney=True, balcony=rng.random() > 0.6)
    houses(g, X, Z, 16, mk_kz, (0.026, 0.06, -0.05, 0.1), 'kz', mind=0.02)     # Stepantsminda, right bank
    houses(g, X, Z, 7, mk_kz, (-0.03, 0.025, 0.012, 0.05), 'kz2', mind=0.019)   # Gergeti village below the church
    place(g, hall_church(0.016, 0.009, 0.01, 'stoneGe', 'tin'), X, Z, 0.05, 0.03, ry=0.2, foot=0.008)
    def kz_trees(hm, dry, n1, h): return t_birch(h * 0.85) if rng.random() < 0.6 else t_pine(h, 'pineT')
    forest(g, X, Z, 0.25, dens=0.5, scatter=0.01, kinds=kz_trees, avoid=[(gx, gz, 0.04), (0.05, 0.0, 0.05)])
    for t in range(14): safe(g, boulder(0.8 + rng.random()), X, Z, -0.12 + rng.random() * 0.24, -0.12 + rng.random() * 0.24, foot=0, occ=False)

def vardzia_cliff(group, X0, Z0, xf, z0, z1, hgt=0.064):
    """the cave city cut into the Erusheti cliff: a broken, banded tuff face with tiers of cave mouths, the Dormition
    church's arched porch and the little bell tower"""
    nz, rows = 26, (0.0, 0.01, 0.021, 0.032, 0.043, 0.054, hgt)
    mats = ['tuffD', 'tuff', 'tuffL', 'tuff', 'tuffL', 'tuffD']
    r_ = random.Random(21)
    V, F, MI = [], [], []
    xs = {}
    for j in range(nz + 1):
        zf = z0 + (z1 - z0) * j / nz
        Xc, Zc = X0 + xf * LM, Z0 + zf * LM; gy = ground3(Xc + 0.006 * LM, Zc)
        u = j / nz; tall = 0.62 + 0.38 * math.sin(PI * u) ** 0.6 + (r_.random() - 0.5) * 0.08
        for i, hr in enumerate(rows):
            off = (r_.random() - 0.5) * 0.004 - hr * 0.1 + 0.0015 * math.sin(j * 0.9)
            if i == len(rows) - 1: hr = hgt * tall + (r_.random() - 0.5) * 0.008
            elif hr > hgt * tall - 0.006: hr = hgt * tall - 0.006 - (len(rows) - 2 - i) * 0.002
            xs[(j, i)] = xf + off
            V.append((X0 + (xf + off) * LM, gy - 0.004 * LM + hr * LM, Zc))
        back = X0 + (xf - 0.022 - 0.012 * r_.random()) * LM; V.append((back, max(gy + (hgt * tall + 0.004) * LM, ground3(back, Zc) + 0.002), Zc))
    stride = len(rows) + 1
    for j in range(nz):
        for i in range(len(rows)):
            a, b = j * stride + i, (j + 1) * stride + i
            F.append((a, b, b + 1, a + 1)); MI.append(mats[min(i, len(mats) - 1)] if i < len(rows) - 1 else 'rockG')
    for m in set(MI):
        emit(group, m, Geo(V, [f for f, mm in zip(F, MI) if mm == m]))
    # cave mouths, in tiers, thickest in the middle of the face
    for tier in range(7):
        y = 0.008 + tier * 0.0068
        for c in range(22):
            u = r_.random()
            if r_.random() > 0.85 - abs(u - 0.5) * 0.9 or y > (0.62 + 0.38 * math.sin(PI * u) ** 0.6) * hgt - 0.014: continue
            zf = z0 + (z1 - z0) * (0.08 + 0.84 * u); j = int((zf - z0) / (z1 - z0) * nz); i = min(len(rows) - 2, int(y / 0.011))
            xx = xs[(j, i)] + 0.0006
            Xc, Zc = X0 + xx * LM, Z0 + zf * LM; gy = ground3(X0 + (xf + 0.006) * LM, Zc)
            w = 0.0024 + r_.random() * 0.0024; h = 0.003 + r_.random() * 0.0022
            M = mat4(Xc, gy + (y - 0.004) * LM, Zc, ry=PI / 2, s=LM)
            emit(group, 'ink', arch_win(w, h) if r_.random() < 0.6 else rect_win(w, h), M)
            if r_.random() < 0.25: emit(group, 'tuffD', T(box(w * 1.8, 0.0007, 0.003), 0, -0.0004, 0.0012), M)
    zc = (z0 + z1) / 2 - 0.006; j = int((zc - z0) / (z1 - z0) * nz)
    Xc, Zc = X0 + (xs[(j, 2)] + 0.001) * LM, Z0 + zc * LM; gy = ground3(X0 + (xf + 0.006) * LM, Zc)
    M = mat4(Xc, gy + 0.018 * LM, Zc, ry=PI / 2, s=LM)
    for g_, m_ in [(box(0.02, 0.012, 0.004), 'tuffL'), (T(arch_win(0.0065, 0.0095), -0.0045, 0.0, 0.0022), 'ink'), (T(arch_win(0.0065, 0.0095), 0.0045, 0.0, 0.0022), 'ink'),
                   (T(box(0.008, 0.008, 0.004), 0.016, 0.006, 0.0), 'tuffL'), (T(arch_win(0.003, 0.0045), 0.016, 0.0085, 0.0022), 'ink'), (T(gable(0.005, 0.003, 0.009), 0.016, 0.014, 0, ry=PI / 2), 'tileD')]:
        emit(group, m_, g_, M)

def build_vardzia():
    g = 'Scenery_Vardzia'; X, Z = stop3('Vardzia'); region_empty(g, X, Z)
    vardzia_cliff(g, X, Z, -0.05, -0.075, 0.035)
    for t in range(16): safe(g, boulder(0.7 + rng.random()), X, Z, -0.045 + rng.random() * 0.025, -0.07 + rng.random() * 0.1, foot=0, occ=False)
    for t in range(10): safe(g, t_broad(0.018 + rng.random() * 0.008, pick(['olive', 'oak'])), X, Z, 0.01 + rng.random() * 0.05, -0.1 + rng.random() * 0.2, foot=0, occ=False)
    def mk_v(): return town_house(0.015, 0.012, 0.011, pick(['stoneAl', 'plaster']), pick(['tin', 'tinR']), chimney=True)
    houses(g, X, Z, 5, mk_v, (0.04, 0.05, 0.03, 0.06), 'va', mind=0.022)

def build_uplistsikhe():
    # Uplistsikhe, the rock-cut town on the left bank of the Mtkvari: sandstone terraces with halls, cave mouths and
    # stairs, the brick basilica on top; Gori's castle on its hill across the plain
    g = 'Scenery_Uplistsikhe'; X, Z = stop3('Uplistsikhe'); region_empty(g, X, Z)
    ux, uz = 0.02, -0.045
    r_ = random.Random(44)
    def blob(cx_, cz_, rx, rz, n=9, jit=0.25):
        return [(cx_ + math.cos(k / n * 2 * PI) * rx * (1 + (r_.random() - 0.5) * jit), cz_ + math.sin(k / n * 2 * PI) * rz * (1 + (r_.random() - 0.5) * jit)) for k in range(n)]
    P = []
    # the plateau: a broad sandstone whaleback, highest at the back (north), falling in ledges towards the river
    base = blob(0.0, 0.0, 0.07, 0.045, 12, 0.2)
    V = [(x, -0.012, z) for x, z in base] + [(x, 0.012 - 0.008 * (z / 0.045) + (r_.random() - 0.5) * 0.003, z) for x, z in base]
    n = len(base); P.append((Geo(V, [tuple(range(n))[::-1], tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]), 'sandst'))
    # outcrops on top, each cut with halls and cave mouths on its sunny side
    for (ox_, oz_, rx, rz, h, mat) in ((-0.03, -0.014, 0.018, 0.012, 0.01, 'tuffL'), (0.0, -0.022, 0.022, 0.012, 0.014, 'sandst'), (0.03, -0.01, 0.016, 0.012, 0.009, 'tuffL'),
                                       (-0.012, 0.008, 0.014, 0.01, 0.006, 'sandst'), (0.024, 0.014, 0.012, 0.009, 0.005, 'tuffL')):
        poly = blob(ox_, oz_, rx, rz, 7, 0.3); y0 = 0.012 - 0.008 * (oz_ / 0.045) - 0.002
        P += [(T(g_, y=y0), m_) for g_, m_ in rock(poly, h, mat, 0.2, int(r_.random() * 99))]
        for k in range(len(poly)):
            a, b = poly[k], poly[(k + 1) % len(poly)]
            nx_, nz_ = (b[1] - a[1]), -(b[0] - a[0]); L_ = math.hypot(nx_, nz_) or 1
            if nz_ / L_ < 0.35: continue
            mx_, mz_ = (a[0] + b[0]) / 2 + nx_ / L_ * 0.0005, (a[1] + b[1]) / 2 + nz_ / L_ * 0.0005
            P.append((T(arch_win(min(0.006, L_ * 0.5), h * 0.62), mx_, y0 + h * 0.08, mz_, ry=math.atan2(nx_ / L_, nz_ / L_)), 'ink'))
    for (hx, hz, w, d) in ((-0.045, 0.02, 0.012, 0.008), (0.05, 0.016, 0.01, 0.007), (-0.02, 0.028, 0.009, 0.006), (0.012, 0.03, 0.012, 0.006)):   # roofless rock-cut halls
        P.append((T(box(w, 0.0008, d), hx, 0.012 - 0.008 * (hz / 0.045) + 0.0004, hz), 'ink'))
    P += [(T(g_, 0.0, 0.012 + 0.008 * (0.022 / 0.045) + 0.011, -0.022), m_) for g_, m_ in basilica(0.02, 0.009, 0.01, 'brickR', 'tile')]
    for k in range(7): P.append((T(box(0.006, 0.0014 * (k + 1), 0.004), 0.06 - k * 0.004, -0.012, 0.03 - k * 0.002), 'sandst'))
    place(g, P, X, Z, ux, uz, ry=0.1, foot=0.03, sink=0.004)
    # Gori castle (Goris Tsikhe): an oval wall round its hilltop, the town below
    gx, gz = -0.16, -0.09
    wall_line(g, X, Z, [(gx + math.cos(k / 12 * 2 * PI) * 0.036, gz + math.sin(k / 12 * 2 * PI) * 0.024) for k in range(12)], h=0.009, th=0.004, mat='stoneGe', closed=True, crenel=True)
    for k in range(5): place(g, [(cyl(0.0048, 0.017, 8), 'stoneGe')], X, Z, gx + math.cos(k / 5 * 2 * PI + 0.4) * 0.036, gz + math.sin(k / 5 * 2 * PI + 0.4) * 0.024, foot=0.004)
    def mk_go(): return town_house(0.016 + rng.random() * 0.008, 0.013, 0.012 + rng.random() * 0.005, pick(['plaster', 'plasterY', 'stoneAl', 'plasterP']), pick(['tile', 'tileD', 'tin']), balcony=rng.random() > 0.5)
    houses(g, X, Z, 14, mk_go, (-0.27, 0.13, -0.06, 0.06), 'go', mind=0.022)
    place(g, xchurch(L=0.02, B=0.01, C=0.016, H=0.012, R=0.004, DH=0.008, CH=0.008, wall='stoneAl', roof='tile', cross_s=0.6), X, Z, -0.22, -0.04, ry=0.3, foot=0.01)
    for t in range(8): safe(g, cypress(0.034), X, Z, 0.06 + rng.random() * 0.08, -0.09 + rng.random() * 0.06, foot=0, occ=False)
    for t in range(14): safe(g, t_poplar(0.04 + rng.random() * 0.01), X, Z, -0.3 + rng.random() * 0.5, 0.01 + rng.random() * 0.04, foot=0, occ=False)
    forest(g, X, Z, 0.28, dens=0.5, scatter=0.04, avoid=[(ux, uz, 0.07), (gx, gz, 0.06), (-0.2, -0.04, 0.08)])

# ------------------------------------------------------------------------------------------------ 5 · Svaneti
def build_svaneti():
    g = 'Svaneti'; X, Z = stop3('Mestia'); region_empty(g, X, Z)
    C, closed = chan_world('sv_loop')
    drive(g, 'Svaneti_Jeep', land_cruiser(), C, laps=1.0, phase=0.3, s=0.8)
    # Mestia: towers in its neighbourhoods (Lanchvali, Seti, Lagami), each beside its family's machubi
    me = g + ':Mestia'
    TW = [(-0.066, -0.032, 0.088), (-0.05, -0.044, 0.096), (-0.078, -0.05, 0.082),            # Lanchvali
          (-0.006, -0.03, 0.094), (0.012, -0.042, 0.1), (-0.02, -0.05, 0.086), (0.02, -0.022, 0.08),  # Seti
          (0.052, -0.026, 0.09), (0.068, -0.04, 0.096), (0.05, -0.054, 0.084),             # Lagami
          (-0.02, 0.07, 0.084), (0.006, 0.078, 0.09)]                                        # across the river
    for k, t in enumerate(TW):
        P = svan_tower(t[2]); hx = (1 if k % 2 else -1) * 0.02
        P += [(T(g_, hx, 0, 0.006), m_) for g_, m_ in svan_house(0.03, 0.02, 0.016, balcony=rng.random() > 0.5)]
        safe(me, P, X, Z, t[0], t[1], ry=(rng.random() - 0.5) * 0.5, foot=0.016, pad=0.0)
    houses(me, X, Z, 10, lambda: svan_house(0.026 + rng.random() * 0.008, 0.018, 0.014, balcony=rng.random() > 0.4) if rng.random() < 0.6 else
           town_house(0.02, 0.014, 0.014, pick(['plaster', 'balc', 'stoneSv']), pick(['tinR', 'tin', 'slateSv']), balcony=True), (-0.1, 0.19, -0.07, 0.06), 'me', mind=0.026)
    place(me, hall_church(0.022, 0.012, 0.012, 'stoneSv', 'slateSv'), X, Z, 0.032, -0.064, ry=0.2, foot=0.012)
    # Ushguli at 2100 m, the highest village in Europe: a tight cluster of darker towers, Lamaria on its knoll, Shkhara behind
    us = g + ':Ushguli'; ux, uz = 0.13, 0.076
    UT = ((-0.012, -0.008, 0.082), (0.004, -0.016, 0.09), (0.018, -0.004, 0.078), (-0.004, 0.008, 0.086), (0.022, 0.014, 0.08), (-0.02, 0.012, 0.074),
          (0.01, 0.022, 0.084), (0.034, 0.0, 0.07), (-0.026, -0.018, 0.076))
    for k, t in enumerate(UT):
        P = svan_tower(t[2], w=0.016, stone='stoneUs', dark=True) + [(T(g_, (1 if k % 2 else -1) * 0.016, 0, 0.004), m_) for g_, m_ in svan_house(0.024, 0.016, 0.013, stone='stoneUs')]
        safe(us, P, X, Z, ux + t[0], uz + t[1], ry=(rng.random() - 0.5) * 0.5, foot=0.012, pad=0.0)
    lx, lz = ux + 0.036, uz - 0.03
    place(us, hall_church(0.022, 0.012, 0.012, 'stoneUs', 'slateSv', belfry=False) + [(T(g_, -0.018, 0, 0.006), m_) for g_, m_ in svan_tower(0.066, w=0.014, stone='stoneUs', dark=True)],
          X, Z, lx, lz, ry=-0.3, foot=0.012)
    wall_line(us, X, Z, [(lx - 0.032, lz - 0.016), (lx + 0.018, lz - 0.02), (lx + 0.02, lz + 0.016), (lx - 0.03, lz + 0.018)], h=0.004, th=0.003, mat='stoneUs', closed=True)
    # spruce and fir on the valley sides, birch higher up; hay stacks on poles in the meadows; rock
    forest(g, X, Z, 0.32, dens=1.1, scatter=0.04, ox=0.04, oz=0.02, avoid=[(0.0, -0.04, 0.09), (ux, uz, 0.06), (0.0, 0.075, 0.03)])
    for k in range(10): safe(g, [(cone(0.0055, 0.011, 6), 'autumn'), (T(box(0.0008, 0.015, 0.0008)), 'wood')], X, Z, -0.08 + rng.random() * 0.2, 0.03 + rng.random() * 0.03, foot=0, occ=False)
    for k in range(12): safe(g, boulder(1.0 + rng.random()), X, Z, -0.1 + rng.random() * 0.3, -0.16 + rng.random() * 0.1, foot=0, occ=False)
    for k in range(4): sway_tree(g, 'Svaneti_Tree%d' % (k + 1), t_conifer(0.042, 'spruce'), X, Z, -0.11 + k * 0.03, 0.1 + (k % 2) * 0.02, amp=0.02, phase=k * 0.9)
    h0 = REGION[g][1][2, 3]
    bird(g, 'Svaneti_EagleA', (X + 0.08 * LM, 0, Z - 0.03 * LM), 0.14 * LM, h0 + 0.42, col='horseD', size=1.4, turns=1, phase=0.0, flap=1)
    bird(g, 'Svaneti_EagleB', (X + 0.02 * LM, 0, Z - 0.0 * LM), 0.08 * LM, h0 + 0.36, col='horseD', size=1.2, turns=-1, phase=2.0, flap=1)
    dest_hooks(g, X, Z, 0.06, 0.02, 0.24, 0.18, (0.0, 0.09, 0.01, -0.3, 38, 1.95))

# ------------------------------------------------------------------------------------------------ 6 · Batumi
def alphabet_tower():
    """the Alphabet Tower (2012, 130 m): two white bands of the 33 Georgian letters wound round a core in a double helix,
    a silver globe at the top (the globe itself turns, as Batumi_AlphabetGlobe)"""
    TH = 0.15; P = [(cyl(0.012, 0.004, 12), 'stoneS'), (T(cyl(0.0034, TH, 8), y=0.004), 'alu')]
    for ph in (0, PI):
        V, F = [], []; n = 140; turns = 4.0
        for t in range(n + 1):
            a = t / n * 2 * PI * turns + ph; y = 0.006 + t / n * TH * 0.9; r0, r1 = 0.0058, 0.0108
            V += [(math.cos(a) * r0, y, math.sin(a) * r0), (math.cos(a) * r1, y, math.sin(a) * r1), (math.cos(a) * r0, y + 0.0045, math.sin(a) * r0), (math.cos(a) * r1, y + 0.0045, math.sin(a) * r1)]
        for t in range(n):
            a, b = 4 * t, 4 * (t + 1)
            F += [(a + 1, b + 1, b + 3, a + 3), (a, a + 2, b + 2, b), (a, b, b + 1, a + 1), (a + 2, a + 3, b + 3, b + 2)]
        P.append((Geo(V, F), 'white'))
        for k in range(16):  # the letters, dark on the white bands
            t = (k + 0.5) / 16; a = t * 2 * PI * turns + ph; y = 0.006 + t * TH * 0.9 + 0.0012
            P.append((T(box(0.0026, 0.0024, 0.0006), math.cos(a) * 0.011, y, math.sin(a) * 0.011, ry=-a + PI / 2), 'ink'))
    return P, TH

def batumi_block(w, d, floors, wall, glass=None, crown=None):
    fh = 0.0062; h = floors * fh
    P = [(box(w, h, d), wall)]
    for f in range(1, floors): P.append((T(box(w * 1.01, 0.0009, d * 1.01), y=f * fh), glass or 'ink'))
    if crown: P += crown(w, d, h)
    else: P.append((T(box(w * 0.6, 0.004, d * 0.6), y=h), wall))
    return P

def build_batumi():
    g = 'Batumi'; X, Z = stop3('Batumi'); region_empty(g, X, Z)
    B0 = G['places']['Batumi']; line = []
    for c in range(len(COAST) - 1):
        a, b = COAST[c], COAST[c + 1]; n = math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / 2.4)
        for s2 in range(n):
            px, py = a[0] + (b[0] - a[0]) * s2 / n, a[1] + (b[1] - a[1]) * s2 / n
            if B0[1] - 30 < py < B0[1] + 17: line.append((px, py))
    line.sort(key=lambda p: p[1])
    _lz = np.array([(p[1] - B0[1]) * S / LM for p in line]); _lx = np.array([(p[0] - B0[0]) * S / LM for p in line])
    def at(z, inland):   # a point `inland` landmark units east of the shore, at z
        return (float(np.interp(z, _lz, _lx)) + inland, z)
    bv = g + ':Boulevard'
    for k, pt in enumerate(line):
        nb_, pv = line[min(len(line) - 1, k + 1)], line[max(0, k - 1)]
        tx, ty = nb_[0] - pv[0], nb_[1] - pv[1]; tl = math.hypot(tx, ty) or 1
        nx, ny = -ty / tl, tx / tl
        if not inside_map(pt[0] + nx * 4, pt[1] + ny * 4): nx, ny = -nx, -ny
        ang = -math.atan2(ty, tx); seg = 2.6 * S / LM
        off = lambda d: ((pt[0] + nx * d - B0[0]) * S / LM, (pt[1] + ny * d - B0[1]) * S / LM)
        place(bv, [(T(box(seg, 0.0012, 2.4 * S / LM), ry=ang), 'pebble')], X, Z, *off(1.3), foot=0, sink=0.0004, occ=False)       # grey pebble beach
        place(bv, [(T(box(seg, 0.0014, 1.0 * S / LM), ry=ang), 'stoneS')], X, Z, *off(3.0), foot=0, sink=0.0004, occ=False)        # the promenade
        place(bv, [(T(box(seg, 0.0015, 0.35 * S / LM), ry=ang), 'red')], X, Z, *off(3.7), foot=0, sink=0.0004, occ=False)          # the cycle lane
        place(bv, [(T(box(seg, 0.0016, 2.2 * S / LM), ry=ang), 'lawn')], X, Z, *off(5.1), foot=0, sink=0.0004, occ=False)          # the park
        if k % 2 == 0: place(bv, palm(0.046 + rng.random() * 0.014, (rng.random() - 0.5) * 0.4, rng.random() * 6.28), X, Z, *off(3.45), foot=0, occ=False)
        if k % 2 == 1: place(bv, t_broad(0.022 + rng.random() * 0.006, pick(['leaf', 'eucal', 'oak'])), X, Z, *off(5.4), foot=0, occ=False)
        if k % 3 == 1: place(bv, [(cyl(0.0007, 0.011, 4), 'white'), (T(cone(0.0075, 0.003, 8), y=0.0105), 'white' if k % 2 else 'yellow')], X, Z, *off(1.6), foot=0, occ=False)
        if k % 2 == 0: place(bv, [(T(cyl(0.0006, 0.012, 4), y=0), 'ink'), (T(ball(0.0016, 5, 3), y=0.012), 'lamp')], X, Z, *off(4.1), foot=0, occ=False)
        OCC.append((X + off(4.0)[0] * LM, Z + off(4.0)[1] * LM, 0.012 * LM))
    # the north end by the port: the lighthouse (1882), the Alphabet Tower, the wheel, Ali and Nino at the water's edge
    lh = [(cyl(0.0058, 0.003, 8), 'stoneS'), (T(cyl(0.0034, 0.03, 8, 0.0046), y=0.003), 'white'), (T(cyl(0.0042, 0.0012, 8), y=0.033), 'white'),
          (T(cyl(0.0026, 0.005, 8), y=0.0342), 'glass'), (T(cone(0.0032, 0.004, 8), y=0.0392), 'red'), (T(box(0.0009, 0.0016, 0.0009), y=0.0432), 'red')]
    Ml = place(g + ':Lighthouse', lh, X, Z, *at(-0.084, 0.005), foot=0)
    if Ml is not None:
        beam = anim_obj('Batumi_LighthouseBeam', [(T(cone(0.006, 0.05, 4), rz=PI / 2, x=0.05), 'lamp'), (T(ball(0.0024, 5, 3)), 'lamp')], Ml @ mat4(y=0.0367), g)
        k_spin(beam, 2, 4.0)
    AP, TH = alphabet_tower()
    Ma = place(g + ':AlphabetTower', AP, X, Z, *at(-0.074, 0.02), foot=0.01)
    if Ma is not None:
        gl = anim_obj('Batumi_AlphabetGlobe', [(ball(0.0118, 10, 6), 'alu'), (T(torus(0.0122, 0.001, 4, 20), rx=PI / 2), 'glassD'), (T(torus(0.0122, 0.001, 4, 20)), 'glassD'),
                                               (T(cyl(0.0007, 0.024, 4), y=0.01), 'alu')], Ma @ mat4(y=TH + 0.012), g)
        k_spin(gl, 2, 1.0)
    ferris(g, X, Z, *at(-0.058, 0.03), R=0.026, n=12, ry=1.15, name='Batumi_Wheel')
    Mn = placeM(X, Z, *at(-0.066, 0.008), ry=1.15, foot=0)
    if Mn is not None:
        emit(g + ':AliAndNino', 'stoneD', box(0.04, 0.002, 0.012), Mn); OCC.append((Mn[0, 3], Mn[2, 3], 0.02 * LM))
        for k, (nm, h_) in enumerate((('Ali', 0.036), ('Nino', 0.032))):
            fig = [(T(box(0.0016, h_, 0.006), y=0.002), 'steel'), (T(ball(0.0032, 6, 4), y=h_ + 0.004), 'steel')]
            fo = anim_obj('Batumi_' + nm, fig, Mn, g)
            k_wave(fo, 'location', 0, 0.014 * LM * (1 if k == 0 else -1), cycles=1, phase=0)
    # the old town behind the port: Piazza with its bell tower, Europe Square with Medea, the 19th-century streets
    place(g + ':Piazza', [(box(0.034, 0.003, 0.026), 'stoneS'), (T(box(0.008, 0.036, 0.008), 0.012, 0, 0.008), 'plasterY'), (T(pyramid(0.009, 0.009, 0.008), 0.012, 0.036, 0.008), 'tileD'),
                           (T(cyl(0.0022, 0.0008, 8), 0.012, 0.03, 0.0122, rx=PI / 2), 'white'), (T(box(0.026, 0.014, 0.009), -0.004, 0, -0.01), 'plasterP'),
                           (T(hip(0.028, 0.011, 0.004), -0.004, 0.014, -0.01), 'tile'), (T(box(0.009, 0.014, 0.022), -0.016, 0, 0.002), 'plasterY'), (T(hip(0.011, 0.024, 0.004), -0.016, 0.014, 0.002), 'tile')],
          X, Z, *at(-0.07, 0.058), ry=0.3, foot=0.012)
    place(g + ':Piazza', [(cyl(0.004, 0.006, 8), 'stoneS'), (T(cyl(0.0012, 0.018, 6), y=0.006), 'stoneS'), (T(box(0.0016, 0.006, 0.0016), y=0.024), 'gold'), (T(box(0.006, 0.0012, 0.0012), y=0.03), 'gold')],
          X, Z, *at(-0.048, 0.062), foot=0)
    def mk_old(): return town_house(0.014 + rng.random() * 0.008, 0.013, 0.016 + rng.random() * 0.006, pick(['plasterY', 'plasterP', 'plasterB', 'plaster', 'brickR']), pick(['tile', 'tin', 'tinR']), balcony=rng.random() > 0.3, hipped=True)
    x0_ = at(-0.06, 0)[0]
    houses(g, X, Z, 18, mk_old, (x0_ + 0.035, 0.065, -0.1, 0.06), 'bo', ry0=0.3, ryj=0.15, pack=0.42)
    # the seafront towers along the new boulevard: Batumi Tower with its wheel, the twisting Radisson, Sheraton's glass drum, Orbi
    sk = g + ':Skyline'
    bt = [(box(0.016, 0.14, 0.016), 'glassB')] + [(T(box(0.0166, 0.0012, 0.0166), y=f * 0.012), 'white') for f in range(1, 12)] + \
         [(T(torus(0.0105, 0.0011, 4, 18), 0.0, 0.09, 0.0088), 'white')] + [(T(box(0.0007, 0.021, 0.0007), 0, 0.09, 0.0088, rz=k * PI / 4), 'white') for k in range(4)] + [(T(cone(0.006, 0.026, 4), y=0.14, ry=PI / 4), 'white')]
    place(sk, bt, X, Z, *at(-0.018, 0.032), ry=0.8, foot=0.008)
    rad = []
    for f in range(16): rad.append((T(box(0.014, 0.0062, 0.014), y=f * 0.0062, ry=f * 0.05), 'glassT' if f % 2 else 'glassB'))
    place(sk, rad, X, Z, *at(-0.04, 0.03), foot=0.008)
    place(sk, [(cyl(0.009, 0.086, 12), 'glassB')] + [(T(cyl(0.0094, 0.0012, 12), y=f * 0.0105), 'white') for f in range(1, 9)] + [(T(cyl(0.006, 0.006, 12), y=0.086), 'white')], X, Z, *at(-0.03, 0.05), foot=0.008)
    for k, (zz, inl, fl, wall, gl) in enumerate(((0.0, 0.026, 16, 'plaster', 'glassB'), (0.014, 0.024, 20, 'plasterB', 'glassT'), (0.006, 0.046, 13, 'white', 'glassB'),
                                                 (0.028, 0.026, 18, 'plaster', 'glassG'), (0.024, 0.046, 11, 'plasterY', 'glassB'), (0.04, 0.03, 15, 'plasterP', 'glassB'))):
        place(sk, batumi_block(0.014, 0.012 + (k % 2) * 0.004, fl, wall, gl), X, Z, *at(zz, inl), ry=1.0, foot=0.008)
    def mk_bb(): return batumi_block(0.013 + rng.random() * 0.006, 0.011 + rng.random() * 0.004, 4 + rng.randrange(7), pick(['plaster', 'plasterY', 'plasterP', 'plasterB', 'stoneS']), pick(['ink', 'glassB']))
    for (z0_, z1_, i0, i1) in ((-0.1, -0.02, 0.1, 0.15), (-0.03, 0.03, 0.06, 0.13), (0.0, 0.04, 0.04, 0.1)):
        xa = at((z0_ + z1_) / 2, 0)[0]
        houses(g, X, Z, 14, mk_bb, (xa + i0, i1 - i0, z0_, z1_ - z0_), 'bb', ry0=1.0, ryj=0.15, foot=0.01, pack=0.42)
    # the subtropical hills behind: tea in rows, citrus groves, eucalyptus and forest climbing inland
    for r in range(6):
        for k in range(8): safe(g, [(T(ball(0.0042, 5, 3), y=0.003, s=(1.6, 0.7, 1.1)), 'leafL')], X, Z, 0.2 + k * 0.012 + r * 0.004, -0.06 + r * 0.01, foot=0, occ=False)
    for t in range(12): safe(g, [(T(ball(0.005, 5, 3), y=0.004), 'leaf'), (T(ball(0.0012, 4, 3), 0.003, 0.006, 0.002), 'yellow')], X, Z, 0.18 + rng.random() * 0.05, -0.13 + rng.random() * 0.05, foot=0, occ=False)
    def ba_trees(hm, dry, n1, h): return t_broad(h, pick(['eucal', 'leaf', 'beech'])) if rng.random() < 0.7 else t_clump(h, pick(['leaf', 'oak']))
    forest(g, X, Z, 0.26, dens=1.0, scatter=0.12, ox=0.06, kinds=ba_trees, avoid=[(0.08, -0.04, 0.11)])
    for k in range(4): sway_tree(g, 'Batumi_Palm%d' % (k + 1), palm(0.05, 0.15, k * 1.5), X, Z, *at(-0.05 + k * 0.012, 0.014), amp=0.03, phase=k * 0.7)
    # boats sailing slow loops off the coast, bobbing on the swell
    BOATS = ((268, 392, 6, 10, yacht()), (262, 410, 5, 8, fishing_boat()), (244, 386, 5, 26, ferry(M_ * 0.6)), (272, 378, 4, 8, yacht()))
    for k, (cxm, cym, ra, rb, kind) in enumerate(BOATS):
        Mb0 = mat4(wx(cxm), SEA_Y, wz(cym), s=LM)
        ob = anim_obj('Batumi_Boat%d' % (k + 1), kind, Mb0, g)
        d_ = 1 if k % 2 else -1
        k_path(ob, g, lambda u, cxm=cxm, cym=cym, ra=ra, rb=rb, d_=d_, k=k: (wx(cxm + ra * math.cos(d_ * 2 * PI * u + k)), SEA_Y + 0.0003 + 0.0012 * math.sin(2 * PI * 6 * u + k), wz(cym + rb * math.sin(d_ * 2 * PI * u + k))),
               step=4, yaw_off=0.0)
        k_wave(ob, 'rotation_euler', 0, 0.05 if k != 2 else 0.015, cycles=5, phase=k)
    for k in range(3):
        bird(g, 'Batumi_Gull%d' % (k + 1), (wx(276 + k * 5), 0, wz(392 + k * 5)), 0.05 + k * 0.03, SEA_Y + 0.2 + k * 0.05, col='white', size=0.9, turns=(1 if k % 2 else -1) * (1 + k % 2), phase=k * 2.0, flap=3)
    dest_hooks(g, X, Z, 0.06, -0.03, 0.17, 0.16, (-0.01, 0.06, 0.0, -1.3, 38, 1.9))

for fn in (build_tbilisi, build_kakheti, build_tusheti, build_kutaisi, build_kazbegi, build_vardzia, build_uplistsikhe, build_svaneti, build_batumi):
    fn(); print('  ', fn.__name__, round(time.time() - t_start, 1), 's')

# the rivers and roads that were cut into the land: ribbons on their levelled beds
def emit_channels():
    for ch in CHANNELS:
        P, N, hw, h = ch['P'], ch['N'], ch['hw'], ch['h']
        lift = 0.0012 if ch['kind'] == 'river' else 0.0009
        y = BASE + h * MPU + lift
        L, R = P + N * hw[:, None], P - N * hw[:, None]
        n = len(P); V = []
        for k in range(n): V += [(wx(L[k, 0]), y[k], wz(L[k, 1])), (wx(R[k, 0]), y[k], wz(R[k, 1]))]
        F = [(2 * k, 2 * k + 1, 2 * k + 3, 2 * k + 2) for k in range(n - 1)]
        if ch['closed']: F.append((2 * n - 2, 2 * n - 1, 1, 0))
        g = Geo(V, F); g.F = [f if _up(g.V, f) else f[::-1] for f in F]
        mat = ch['mat']
        if mat == 'waterR' and ch.get('glacial'): mat = 'waterG'
        emit(ch['group'], mat, g)
        ch['world'] = [(wx(p[0]), wz(p[1])) for p in P]
emit_channels()
if 'dump' in _opts:  # debugging aid: the channels as JSON, map units
    json.dump([dict(kind=c['kind'], group=c['group'], hw=float(c['hw'].max()), P=c['P'][::2].round(1).tolist()) for c in CHANNELS], open(_opts['dump'], 'w'))

# static pieces: one mesh per region, plus one per named landmark
for group, items in BUCKET.items():
    base, _, sub = group.partition(':'); e, PM = REGION[base]; nm = base + '_' + (sub or 'Static')
    me = mesh_from(nm, items, origin=PM[:3, 3])
    ob = bpy.data.objects.new(nm, me); COLL.objects.link(ob); ob.parent = e
    if not sub: print('  %s: %d verts' % (group, len(me.vertices)))

# Rezo's Delica for the site's own van, the one that drives the red route between stops: three.js world units,
# nose along +z (Blender -y), wheels on y = 0, 0.036 long like the van it replaces. The site hides this and clones it.
_dp = delica(); _k = 0.036 / (4.7 * M_)
_items = [(np.column_stack((-v_bl(g.V)[:, 1], -v_bl(g.V)[:, 0], v_bl(g.V)[:, 2])) * _k, g.F, m) for g, m in _dp]
_me = mesh_from('Vehicle_Delica', _items)
_ob = bpy.data.objects.new('Vehicle_Delica', _me); COLL.objects.link(_ob); _ob.parent = ROOT_EMPTY; _ob.location = (0, 0, -1.0); _ob.hide_render = True

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
