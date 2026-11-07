"""
The rest of Georgia for the low-poly model: the sights of every region beyond the five stops, each a little diorama
with its own movement (lifts and skiers, paragliders, trains, ships and cranes, boats, traffic, flocks, waterfalls).

Loaded by build_georgia.py twice over, in effect: exec'd once before the land is built (so the anchors, landforms,
roads, snow and town tints below shape the terrain), and its builders run after the stops are built.
Positions are map units (see ll_map); offsets inside a sight are landmark units, like the stop builders.
"""
import math, random
import numpy as np

SITE_R = 30   # map units round each sight where the land gets the finer (MID) triangles

def _ll(lat, lon): return [round(v, 1) for v in ll_map(lat, lon)]

# anchors: real positions, nudged where two dioramas would overlap (the dioramas are drawn far larger than life)
def _rel(base, dx, dz): p = G['places'][base]; return [round(p[0] + dx * LM / S, 1), round(p[1] + dz * LM / S, 1)]
NEW_PLACES = {
    # Adjara and the coast, south to north
    'Gonio': _rel('Batumi', 0.045, 0.078), 'BotanicalGarden': [291.0, 367.0], 'Kobuleti': [298.0, 345.0], 'Ureki': [299.5, 322.0],
    'PotiPort': [285.0, 303.0], 'Anaklia': [273.0, 268.0], 'Makhuntseti': [334.0, 411.0], 'Goderdzi': [385.7, 392.9],
    # Samegrelo, Svaneti, Imereti, Racha, Guria
    'ZugdidiPalace': [312.0, 254.0], 'MartviliCanyon': [362.0, 262.0], 'Enguri': _ll(42.7563, 42.0328), 'Hatsvali': _rel('Mestia', -0.09, 0.08),
    'Tskaltubo': [396.0, 256.0], 'Chiatura': [487.0, 291.0], 'Racha': [466.0, 262.0], 'Bakhmaro': _ll(41.85, 42.32),
    # Samtskhe-Javakheti, Kvemo Kartli
    'BorjomiPark': [506.0, 368.0], 'Rabati': [453.0, 401.0], 'Khertvisi': _rel('Vardzia', 0.0, -0.115), 'Paravani': _ll(41.45, 43.80),
    'Dmanisi': _ll(41.3361, 44.3436),
    # Mtskheta-Mtianeti, Khevsureti
    'MtskhetaSite': [669.0, 331.0], 'AnanuriSite': [668.0, 300.0], 'GudauriSite': [640.0, 271.0], 'Shatili': [709.0, 246.0],
    # Kakheti
    'Lavra': [754.0, 417.0], 'Lagodekhi': [845.6, 377.9],
    # Abkhazia, and Shida Kartli's Tskhinvali region
    'SukhumiBay': [204.3, 170.3], 'NewAthos': [177.7, 155.0], 'Pitsunda': [118.4, 143.1], 'Gagra': [103.0, 114.3], 'Ritsa': [141.0, 108.0],
    'Ikorta': [586.4, 294.7],
}
for _k, _v in NEW_PLACES.items(): G['places'][_k] = _v

SITES = list(NEW_PLACES) if 'nosites' not in _opts else []
SP3 = np.array([G['places'][n] for n in SITES], float).reshape(-1, 2)

# what each sight needs of the land: shelves to build on, hills, lakes, its own roads and rivers, snow, town ground
SHELF.update({'Kobuleti': ((0.03, -0.02), 0.5, 6, 14), 'Ureki': ((0.0, 0.0), 0.5, 8, 18), 'PotiPort': ((0.03, 0.0), 0.7, 9, 18),
              'Anaklia': ((0.02, 0.0), 0.5, 8, 16), 'ZugdidiPalace': ((0.0, 0.0), 0.55, 9, 18), 'Rabati': ((0.0, 0.03), 0.4, 6, 14),
              'MtskhetaSite': ((-0.01, 0.01), 0.45, 7, 15), 'GudauriSite': ((0.03, 0.02), 0.45, 7, 15), 'Shatili': ((0.0, 0.0), 0.5, 5, 11),
              'Goderdzi': ((0.02, 0.02), 0.45, 6, 13), 'Bakhmaro': ((0.0, 0.0), 0.5, 6, 12), 'Lagodekhi': ((0.0, 0.03), 0.5, 7, 15),
              'Tskaltubo': ((0.03, 0.07), 0.5, 6, 13), 'Chiatura': ((0.0, 0.01), 0.35, 5, 12), 'Racha': ((0.0, 0.0), 0.45, 4, 10),
              'Dmanisi': ((0.0, 0.0), 0.4, 5, 11), 'Lavra': ((0.02, 0.03), 0.45, 6, 13)})
SCULPT += [
    ('bump', 'Kobuleti', (0.05, 0.03, 0.02), 70),          # Petra's hill over the sea at Tsikhisdziri
    ('bump', 'Rabati', (0.0, -0.03, 0.03), 70),              # Rabati's castle hill
    ('bump', 'MtskhetaSite', (0.06, -0.02, 0.025), 170),     # Jvari's hill across the river
    ('bump', 'Khertvisi', (0.0, 0.0, 0.022), 140),           # Khertvisi's rock at the confluence
    ('bump', 'MartviliCanyon', (0.07, 0.05, 0.022), 90),     # Chkondidi's hill
    ('bump', 'Chiatura', (-0.1, -0.03, 0.012), -60),         # the clearing round the Katskhi pillar
    ('bump', 'Dmanisi', (0.01, -0.02, 0.03), 60),            # the promontory between the two rivers
    ('lake', 'Paravani', (0.04, -0.01, 0.055, 0.034, 0.03, 0.2), 25),
    ('lake', 'AnanuriSite', (-0.012, 0.04, 0.026, 0.05, 0.025, -0.25), 30),   # the Zhinvali reservoir
    ('lake', 'Racha', (-0.07, 0.0, 0.03, 0.017, 0.02, 0.4), 20),               # Shaori
    ('lake', 'Enguri', (0.0, -0.065, 0.024, 0.058, 0.02, 0.0), 40),             # the Jvari reservoir behind the dam
]
NO_RIVER += [('Anaklia', 0.06, -0.03, 0.08)]
LOCAL_CHANNELS += [
    dict(key='an_enguri', kind='river', place='Anaklia', pts=[(0.2, -0.06), (0.13, -0.045), (0.07, -0.035), (0.02, -0.03), (-0.05, -0.03)], wdt=0.02, mat='waterR', group='Scenery_Anaklia:River'),
    dict(key='mk_road', kind='road', place='Makhuntseti', pts=[(-0.15, 0.0), (-0.08, -0.004), (-0.03, -0.012), (0.01, -0.045), (0.06, -0.052), (0.12, -0.05), (0.16, -0.06)], wdt=0.007, mat='asphalt', group='Scenery_Makhuntseti:Roads'),
    dict(key='an_hwy', kind='road', place='AnanuriSite', pts=[(0.07, 0.12), (0.045, 0.06), (0.04, 0.0), (0.03, -0.05), (0.035, -0.11)], wdt=0.007, mat='asphalt', group='Scenery_AnanuriSite:Roads'),
    dict(key='gu_hwy', kind='road', place='GudauriSite', pts=[(0.09, 0.12), (0.05, 0.09), (0.08, 0.06), (0.04, 0.04), (0.07, 0.0), (0.05, -0.04), (0.08, -0.1)], wdt=0.0065, mat='asphalt', group='Scenery_GudauriSite:Roads'),
    dict(key='mt_road', kind='road', place='MtskhetaSite', pts=[(-0.1, 0.05), (-0.05, 0.035), (0.0, 0.04), (0.02, 0.06), (0.03, 0.1)], wdt=0.006, mat='asphalt', group='Scenery_MtskhetaSite:Roads'),
    dict(key='zu_ave', kind='road', place='ZugdidiPalace', pts=[(-0.02, 0.005), (0.03, 0.03), (0.08, 0.055), (0.13, 0.08)], wdt=0.009, mat='asphalt', group='Scenery_ZugdidiPalace:Roads'),
    dict(key='ch_road', kind='road', place='Chiatura', pts=[(-0.13, 0.08), (-0.06, 0.05), (-0.02, 0.025), (0.03, 0.0), (0.08, -0.025), (0.14, -0.04)], wdt=0.0065, mat='asphalt', group='Scenery_Chiatura:Roads'),
]
SNOWFIELDS += [('GudauriSite', -0.035, -0.02, 0.07, 0.13, 1.0), ('Goderdzi', -0.01, -0.01, 0.05, 0.1, 1.0), ('BorjomiPark', 0.08, 0.08, 0.04, 0.08, 1.0),
               ('Hatsvali', -0.01, 0.01, 0.035, 0.07, 1.0), ('Bakhmaro', 0.0, 0.02, 0.0, 0.05, 0.25)]
URBAN += [('Kobuleti', 0.05, -0.02, 0.015, 0.035, 0.4), ('Ureki', 0.03, -0.01, 0.015, 0.035, 0.3), ('PotiPort', 0.06, 0.0, 0.03, 0.07, 0.5),
          ('Anaklia', 0.04, 0.02, 0.015, 0.035, 0.3), ('ZugdidiPalace', 0.05, 0.04, 0.03, 0.08, 0.45), ('Chiatura', 0.0, 0.01, 0.02, 0.06, 0.4),
          ('BorjomiPark', 0.01, -0.04, 0.02, 0.05, 0.4), ('Rabati', 0.0, 0.03, 0.02, 0.05, 0.4), ('MtskhetaSite', -0.02, 0.0, 0.02, 0.04, 0.4),
          ('Racha', 0.0, -0.07, 0.015, 0.04, 0.3), ('Lagodekhi', 0.0, 0.04, 0.02, 0.05, 0.35), ('GudauriSite', 0.04, 0.03, 0.015, 0.04, 0.3)]
SHELF.update({'SukhumiBay': ((0.03, 0.03), 0.4, 6, 13), 'Pitsunda': ((0.03, -0.02), 0.5, 6, 12), 'Gagra': ((0.0, 0.0), 0.3, 4, 8),
              'Ikorta': ((0.0, 0.03), 0.45, 6, 13)})
SCULPT += [('lake', 'Ritsa', (-0.012, 0.0, 0.018, 0.042, 0.022, 0.35), 25),   # Lake Ritsa in its forested trough
           ('bump', 'NewAthos', (0.0, -0.05, 0.022), 120)]                       # Iverian mountain, Anakopia on top
URBAN += [('SukhumiBay', 0.04, 0.04, 0.02, 0.06, 0.45), ('Gagra', 0.02, 0.0, 0.01, 0.03, 0.3), ('Pitsunda', 0.03, -0.02, 0.015, 0.035, 0.3),
          ('Ikorta', -0.04, 0.035, 0.012, 0.03, 0.3)]
SITE_RIVERS = {'Anaklia': 3000, 'MartviliCanyon': 1500, 'Racha': 1500, 'Chiatura': 1200, 'BorjomiPark': 2500, 'Rabati': 1500, 'Paravani': 1500}
# ground the stops' own trees and houses keep off (place, dx, dz, r in landmark units)
SITE_CLAIMS += [('Gonio', 0.0, 0.0, 0.03), ('Hatsvali', 0.0, 0.0, 0.07), ('Khertvisi', 0.0, 0.0, 0.035), ('BotanicalGarden', 0.0, 0.0, 0.07),
                ('Kobuleti', 0.0, 0.0, 0.08), ('Ureki', 0.0, 0.0, 0.08), ('Tskaltubo', 0.0, 0.0, 0.1), ('GudauriSite', 0.0, 0.0, 0.11),
                ('MtskhetaSite', 0.0, 0.0, 0.06), ('AnanuriSite', 0.0, 0.0, 0.07)]


# ------------------------------------------------------------------------------------------------ helpers
def _site(name):
    g = 'Scenery_' + name; p = G['places'][name]; X, Z = wx(p[0]), wz(p[1]); region_empty(g, X, Z); return g, X, Z

def gm(X, Z, dx, dz):
    """ground height in metres at a local offset"""
    return (ground3(X + dx * LM, Z + dz * LM) - BASE) / MPU

def find_spot(X, Z, ox, oz, r, mode='high', n=9, pad=0.3):
    """the highest / lowest / flattest open ground within r of (ox, oz), off roads and rivers"""
    best, bv = (ox, oz), None
    for i in range(n):
        for j in range(n):
            dx = ox - r + 2 * r * i / (n - 1); dz = oz - r + 2 * r * j / (n - 1)
            if (dx - ox) ** 2 + (dz - oz) ** 2 > r * r * 1.01: continue
            Xw, Zw = X + dx * LM, Z + dz * LM
            if not inside_map(Xw / S + cx, Zw / S + cy) or near_channel(Xw, Zw, pad): continue
            h = ground3(Xw, Zw)
            if mode == 'flat':
                f = 0.012 * LM; v = -max(abs(ground3(Xw + a * f, Zw + b * f) - h) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            else: v = h if mode == 'high' else -h
            if bv is None or v > bv: best, bv = (dx, dz), v
    return best

def sea_M(X, Z, dx, dz, ry=0.0, y=None, s=1.0):
    return mat4(X + dx * LM, SEA_Y if y is None else y, Z + dz * LM, ry=ry, s=LM * s)

def coast_at(name, z0=-0.25, z1=0.25):
    """a sight on the Black Sea (whose shore runs roughly north-south): at(z, inland) -> local (dx, dz), `inland`
    landmark units east of the shore at z"""
    B0 = G['places'][name]; pts = []
    for a, b in zip(COAST, COAST[1:]):
        n = max(1, math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / 0.8))
        for k in range(n): pts.append((a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n))
    y0, y1 = B0[1] + z0 * LM / S, B0[1] + z1 * LM / S
    sel = sorted([p for p in pts if y0 - 4 < p[1] < y1 + 4 and abs(p[0] - B0[0]) < 50], key=lambda p: p[1])
    lz = np.array([(p[1] - B0[1]) * S / LM for p in sel]); lx = np.array([(p[0] - B0[0]) * S / LM for p in sel])
    return lambda z, inland=0.0: (float(np.interp(z, lz, lx)) + inland, z)

def coast_frame(name, win=7):
    """for a shore running any way (the Abkhaz coast runs north-west): at(s, inland) -> local (dx, dz), s landmark units
    along the shore from the point nearest the sight (north-west is +s there), `inland` units in from the water"""
    B0 = np.array(G['places'][name], float); pts = []
    for a, b in zip(COAST, COAST[1:]):
        n = max(1, math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / 0.8))
        for k in range(n): pts.append((a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n))
    P = np.array(pts); i0 = int(np.argmin(np.hypot(P[:, 0] - B0[0], P[:, 1] - B0[1])))
    cum = np.concatenate(([0], np.cumsum(np.hypot(*np.diff(P, axis=0).T))))
    def at(s_, inland=0.0):
        tgt = cum[i0] + s_ * LM / S; j = int(np.clip(np.searchsorted(cum, tgt), 1, len(P) - 1))
        f = (tgt - cum[j - 1]) / ((cum[j] - cum[j - 1]) or 1); p = P[j - 1] + (P[j] - P[j - 1]) * f
        t = P[min(len(P) - 1, j + win)] - P[max(0, j - 1 - win)]; t = t / (np.linalg.norm(t) or 1); nrm = np.array([-t[1], t[0]])
        if not inside_map(*(p + nrm * 3.0)): nrm = -nrm
        q = p + nrm * inland * LM / S
        return (float((q[0] - B0[0]) * S / LM), float((q[1] - B0[1]) * S / LM))
    return at

def shore2(g, X, Z, at, s0, s1, layers, step=0.008):
    """bands along a shore given by coast_frame: layers [(inland_from, inland_to, mat, thickness)]"""
    s_ = s0
    while s_ < s1 - 1e-6:
        sb = min(s1, s_ + step); a, b = np.array(at(s_)), np.array(at(sb))
        L = float(np.linalg.norm(b - a)) or 1e-6; ang = -math.atan2(b[1] - a[1], b[0] - a[0])
        for (i0, i1, mat, h) in layers:
            m = (np.array(at(s_, (i0 + i1) / 2)) + np.array(at(sb, (i0 + i1) / 2))) / 2
            place(g, [(T(box(L * 1.1, h, i1 - i0), ry=ang), mat)], X, Z, m[0], m[1], foot=0, sink=0.0004, occ=False)
        s_ = sb

def onion(r, mat, cross=True):
    """an onion dome on a short drum (New Athos, the Russian-built churches of the coast)"""
    P = [(cyl(r * 0.8, r * 1.2, 10), 'white'), (T(lathe([(0, 0), (r * 0.85, 0), (r * 1.15, r * 0.55), (r * 0.95, r * 1.15), (r * 0.35, r * 1.65), (0, r * 2.0)], 10), y=r * 1.2), mat)]
    if cross: P += gold_cross(r * 3.15, 0.55)
    return P

def shore(g, X, Z, at, z0, z1, layers, step=0.008):
    """bands along the shore: layers [(inland_from, inland_to, mat, thickness)]"""
    z = z0
    while z < z1 - 1e-6:
        za, zb = z, min(z1, z + step); xa, xb = at(za)[0], at(zb)[0]
        L = math.hypot(xb - xa, zb - za) or 1e-6; tx, tz = (xb - xa) / L, (zb - za) / L; nx, nz = tz, -tx
        if nx < 0: nx, nz = -nx, -nz
        ang = -math.atan2(zb - za, xb - xa)
        for (i0, i1, mat, h) in layers:
            mid = (i0 + i1) / 2
            place(g, [(T(box(L * 1.08, h, i1 - i0), ry=ang), mat)], X, Z, (xa + xb) / 2 + nx * mid, (za + zb) / 2 + nz * mid, foot=0, sink=0.0004, occ=False)
        z = zb

def umbrella(col):
    return [(cyl(0.0004, 0.009, 4), 'white'), (T(cone(0.0058, 0.0024, 8), y=0.0084), col), (T(box(0.0034, 0.0008, 0.0014), 0.003, 0.0006, 0.002), 'white'),
            (T(box(0.0034, 0.0008, 0.0014), 0.003, 0.0006, -0.002), 'white')]

def snow_fir(h):
    r = h * 0.2
    return [(cyl(0.001 * h / 0.04, h * 0.18, 4), 'trunk'), (T(cone(r, h * 0.58, 6), y=h * 0.12, ry=rng.random()), 'spruceD'),
            (T(cyl(r * 0.36, h * 0.12, 6, r * 0.6), y=h * 0.12 + h * 0.58 * 0.4), 'snow'), (T(cone(r * 0.7, h * 0.42, 6), y=h * 0.5, ry=rng.random()), 'spruceD'),
            (T(cone(r * 0.4, h * 0.2, 6), y=h * 0.74), 'snow')]

def chalet(w, d, h, wall='chalet', roof='tinR', snow=False, balcony=True):
    P = [(box(w, h * 0.38, d), 'stoneD'), (T(box(w, h * 0.62, d), y=h * 0.38), wall), (T(gable(d * 1.3, h * 0.6, w * 1.14), y=h, ry=PI / 2), 'snow' if snow else roof)]
    if snow: P.append((T(box(w * 1.14, 0.0008, d * 1.3), y=h - 0.0004), roof))
    for k in range(2): P.append((T(rect_win(0.0026, 0.0034), -w * 0.22 + k * w * 0.44, h * 0.5, d / 2 + 0.0003), 'ink'))
    if balcony: P += [(T(box(w * 0.9, 0.0008, 0.004), 0, h * 0.4, d / 2 + 0.002), 'balc'), (T(box(w * 0.9, 0.0022, 0.0006), 0, h * 0.4 + 0.0008, d / 2 + 0.0038), 'balc')]
    return P

def lake_water(g, X, Z, place_, dx, dz, rx, rz, ang=0.0, mat='lakeT', e=1.12, n=30, below=3.0):
    """the water of a 'lake' landform at the level it settled on (the shore round it cuts the outline)"""
    lvl = LAKE_LEVEL.get((place_, dx, dz))
    if lvl is None: return None
    y = BASE + (lvl - below) * MPU; ca, sa = math.cos(ang), math.sin(ang)
    V = [(X + dx * LM, y, Z + dz * LM)]
    for k in range(n):
        t = k / n * 2 * PI; u, v = rx * e * math.cos(t), rz * e * math.sin(t)
        V.append((X + (dx + u * ca - v * sa) * LM, y, Z + (dz + u * sa + v * ca) * LM))
    gg = Geo(V, [(0, 1 + k, 1 + (k + 1) % n) for k in range(n)]); gg.F = [f if _up(gg.V, f) else f[::-1] for f in gg.F]
    emit(g + ':River', mat, gg)
    return y

def piste(g, X, Z, pts, wdt=0.012):
    return ribbon(g + ':Pistes', X, Z, pts, wdt, 'piste', 0.0011, n=40)

def ski_run(g, X, Z, pts, name, n=3, wdt=0.012, runs=2, turns=5, phase=0.0):
    """a piste from pts[0] (top) to pts[-1] (bottom) and skiers carving down it, reappearing at the top"""
    C = piste(g, X, Z, pts, wdt)
    def pos(t, k):
        a, b = along(C, max(0.0, t - 0.01), False), along(C, min(1.0, t + 0.01), False); P = along(C, t, False)
        tx, tz = b[0] - a[0], b[1] - a[1]; L = math.hypot(tx, tz) or 1e-9; nx, nz = -tz / L, tx / L
        off = math.sin(t * 2 * PI * turns + k) * wdt * 0.33 * LM
        return (P[0] + nx * off, P[1] + nz * off)
    for k in range(n):
        board = k % 3 == 2; col = JACKETS[(k * 3 + len(name)) % len(JACKETS)]
        ob = anim_inst('%s_Skier%d' % (name, k + 1), 'skier_%s_%s' % ('b' if board else 's', col), lambda col=col, board=board: skier(col, board=board),
                       mat4(C[0][0], ground3(*C[0]), C[0][1], s=LM), g)
        tt = lambda u, k=k: (u * runs + k / n + phase) % 1.0
        k_track(ob, g, lambda u, k=k, tt=tt: pos(tt(u), k), step=2, pitch=True, lift=0.0016 * LM, tol=0.0005,
                vis=lambda u, tt=tt: 0.0 if tt(u) > 0.975 else 1.0)
    return C

def traffic(g, name, make_key, make, C, n=1, laps=1.0, phase=0.0, lane=0.003, closed=True, reverse=False, scale=0.38):
    """vehicles driving a world polyline (keeping to the right), one way round a loop, or along an open road and
    vanishing at its end to start again"""
    P = np.array(C[::-1] if reverse else C, float)
    t = np.gradient(P, axis=0) if not closed else (np.roll(P, -1, 0) - np.roll(P, 1, 0))
    t /= np.maximum(np.linalg.norm(t, axis=1), 1e-9)[:, None]
    P = P + np.column_stack((-t[:, 1], t[:, 0])) * lane * LM
    C2 = [tuple(p) for p in P]
    for k in range(n):
        ob = anim_inst('%s%d' % (name, k + 1), make_key, make, mat4(C2[0][0], ground3(*C2[0]), C2[0][1], s=LM * scale), g)
        tt = lambda u, k=k: (laps * u + phase + k / n) % 1.0
        k_track(ob, g, lambda u, tt=tt: along(C2, tt(u), closed), step=2, pitch=True, lift=0.0004 * LM, tol=0.0006,
                vis=None if closed else (lambda u, tt=tt: 0.0 if tt(u) > 0.985 else 1.0))

def walkers(g, X, Z, pts, name, n=2, closed=True, laps=1.0, lift=0.0, y=None):
    """people strolling along a path (local points); on an open path they walk to the end and turn back.
    y: walk at that height (a bridge deck, a walkway) instead of on the ground"""
    C = [tuple(c) for c in catmull([(X + p[0] * LM, Z + p[1] * LM) for p in (pts + pts[:1] if closed else pts)], 12 * len(pts))]
    for k in range(n):
        col = JACKETS[(k * 2 + len(name)) % len(JACKETS)]
        ob = anim_inst('%s_Walker%d' % (name, k + 1), 'walker_' + col, lambda col=col: walker(col), mat4(C[0][0], ground3(*C[0]), C[0][1], s=LM), g)
        if closed: fn = lambda u, k=k: along(C, laps * u + k / n, True)
        else: fn = lambda u, k=k: along(C, 1 - abs(1 - 2 * ((laps * u + k / n) % 1.0)), False)
        if y is not None: fn = (lambda f: (lambda u: (f(u)[0], y, f(u)[1])))(fn)
        k_track(ob, g, fn, step=4, lift=lift * LM + 0.0003 * LM, tol=0.0005)

def boat_loop(g, name, key, make, X, Z, dx, dz, rx, rz, y=None, turns=1, phase=0.0, roll=0.03, ang=0.0):
    yy = SEA_Y if y is None else y; ca, sa = math.cos(ang), math.sin(ang)
    def fn(u):
        a = turns * 2 * PI * u + phase; u_, v_ = rx * math.cos(a), rz * math.sin(a)
        return (X + (dx + u_ * ca - v_ * sa) * LM, yy + 0.0003 + 0.0008 * math.sin(2 * PI * 5 * u + phase), Z + (dz + u_ * sa + v_ * ca) * LM)
    ob = anim_inst(name, key, make, mat4(*fn(0), s=LM), g)
    k_track(ob, g, fn, step=4, tol=0.0008, bank=lambda u: roll * math.sin(2 * PI * 6 * u + phase))
    return ob

def waterfall(g, X, Z, dx, dz, h, w, ry, name, cliff=True, drops=3):
    """a fall over a cliff facing +x (turned by ry): the rock, the falling sheet, the pool, the foam; spray that
    pulses and white water that keeps falling"""
    M = placeM(X, Z, dx, dz, ry=ry, foot=0)
    if M is None: return
    P = []
    if cliff: P += [(T(box(0.012, h + 0.004, w * 2.6), -0.007, -0.002, 0), 'rockG'), (T(box(0.008, 0.004, w * 1.6), -0.004, h, 0), 'rockD')]
    P += [(T(box(0.0012, h, w), 0.0006, 0, 0), 'waterF'), (T(cyl(w * 1.1, 0.0012, 10), 0.007, 0, 0, s=(1.0, 1, 1.3)), 'water'),
          (T(ball(w * 0.5, 6, 3), 0.003, 0.001, 0, s=(1.3, 0.4, 1.5)), 'white')]
    for gg, m in P: emit(g, m, gg, M)
    sp = anim_inst(name + '_Spray', 'spray', lambda: [(T(ball(0.0026, 5, 3), 0, 0, 0.0016), 'white'), (T(ball(0.002, 5, 3), 0.002, 0.0006, -0.002), 'white')],
                   M @ mat4(0.004, 0.002, 0), g)
    for ax in (0, 1, 2): k_scale(sp, ax, 0.7, 1.25, cycles=8, phase=ax * 0.3, step=6)
    for k in range(drops):
        dz_ = (k - (drops - 1) / 2) * w * 0.3
        ob = anim_inst('%s_Fall%d' % (name, k + 1), 'falldrop', lambda: [(box(0.0016, 0.006, 0.0022), 'white')], M @ mat4(0.0016, h, dz_), g)
        def fn(u, k=k, dz_=dz_):
            t = (u * 10 + k / drops) % 1.0; Q = M @ np.array([0.0016 + 0.001 * t, h * (1 - t) - 0.002, dz_, 1.0])
            return (Q[0], Q[1], Q[2])
        k_track(ob, g, fn, step=1, yaw=False, tol=0.0003, vis=lambda u, k=k: 0.0 if ((u * 10 + k / drops) % 1.0) > 0.9 else 1.0)

def ropeway(g, X, Z, a, b, name, col='rust', n_cab=2, sag=0.008, h=0.026, cycles=1):
    """an aerial ropeway: two stations, the rope, cabins shuttling to and fro (Chiatura's rope roads, Borjomi's)"""
    Ma = placeM(X, Z, a[0], a[1], foot=0.006); Mb_ = placeM(X, Z, b[0], b[1], foot=0.006)
    if Ma is None or Mb_ is None: return
    st = [(box(0.014, 0.012, 0.012), 'concrete'), (T(box(0.016, 0.0016, 0.014), y=0.012), 'tin'), (T(box(0.002, h - 0.012, 0.002), y=0.012), 'steel')]
    for M in (Ma, Mb_):
        for gg, m in st: emit(g, m, gg, M)
    A = Ma[:3, 3] + np.array([0, h * LM, 0]); B = Mb_[:3, 3] + np.array([0, h * LM, 0])
    def pt(t): q = A + (B - A) * t; q[1] -= sag * LM * 4 * t * (1 - t); return q
    emit(g, 'ink', tube([pt(t / 16) for t in range(17)], 0.0004 * LM, 3, caps=False))
    yaw = math.atan2(-(B[2] - A[2]), B[0] - A[0])
    for c in range(n_cab):
        ob = anim_inst('%s_Cabin%d' % (name, c + 1), 'ropecab_' + col, lambda: [(T(box(0.009, 0.007, 0.007), y=-0.011), col), (T(box(0.0094, 0.0024, 0.0072), y=-0.0068), 'glassD'),
                                                                               (T(box(0.0008, 0.005, 0.0008), y=-0.005), 'ink'), (T(box(0.003, 0.001, 0.002), y=-0.0008), 'ink')],
                       mat4(*pt(0.5), ry=yaw, s=LM), g)
        k_track(ob, g, lambda u, c=c: tuple(pt(0.06 + 0.88 * (0.5 - 0.5 * math.cos(2 * PI * (cycles * u + c / n_cab))))), step=4, yaw=False, tol=0.0006)

def tower_sq(w, H, mat, roof=None, crenel=True, win='ink'):
    """a square fortress tower: batter, small windows, crenellated top or a pyramid roof"""
    P = [(sq(w * 0.46, w * 0.5, H), mat)]
    if crenel:
        P.append((T(box(w * 1.0, 0.0018, w * 1.0), y=H), mat))
        for k in range(4):
            a = k * PI / 2
            for s_ in (-1, 1): P.append((T(box(w * 0.22, 0.0028, 0.0018), math.sin(a) * w * 0.42 + math.cos(a) * s_ * w * 0.25, H + 0.0018, math.cos(a) * w * 0.42 - math.sin(a) * s_ * w * 0.25, ry=a), mat))
    if roof: P.append((T(pyramid(w * 1.06, w * 1.06, w * 0.6), y=H), roof))
    for k in range(4):
        a = k * PI / 2 + PI / 4 * 0
        P.append((T(rect_win(0.0014, 0.0024), math.sin(a) * (w * 0.48 + 0.0003), H * 0.62, math.cos(a) * (w * 0.48 + 0.0003), ry=a), win))
    return P

def tower_round(r, H, mat, roof=None):
    P = [(cyl(r * 0.92, H, 10, r), mat)]
    P.append((T(cone(r * 1.08, r * 1.2, 10), y=H), roof) if roof else (T(cyl(r * 1.05, 0.0024, 10), y=H), mat))
    return P

def fort_wall(g, X, Z, pts, h=0.009, mat='stoneG', closed=True, towers=None, tower_w=0.008, tower_h=0.016, roof=None):
    wall_line(g, X, Z, pts, h=h, th=0.0032, mat=mat, closed=closed, crenel=True)
    for k in (towers if towers is not None else range(len(pts))):
        p = pts[k % len(pts)]; place(g, tower_sq(tower_w, tower_h, mat, roof=roof), X, Z, p[0], p[1], ry=rng.random() * 0.3, foot=0.006)

def flock_walk(g, name, X, Z, pts, laps=1.0, seed=3, n=9):
    C = [tuple(c) for c in catmull([(X + p[0] * LM, Z + p[1] * LM) for p in pts + pts[:1]], 10 * len(pts))]
    ob = anim_inst(name, 'flock_%d' % seed, lambda: flock(n, seed), mat4(C[0][0], ground3(*C[0]), C[0][1], s=LM), g)
    k_track(ob, g, lambda u: along(C, laps * u, True), step=6, tol=0.0006)

def eagles(g, name, X, Z, dx, dz, r=0.08, h=0.35, n=2):
    for k in range(n):
        bird(g, '%s_Eagle%d' % (name, k + 1), (X + dx * LM, 0, Z + dz * LM), r * LM * (1 - 0.3 * k), ground3(X + dx * LM, Z + dz * LM) + h + 0.04 * k,
             col='horseD', size=1.2, turns=1 if k % 2 == 0 else -1, phase=k * 2.1, flap=1)

def gulls(g, name, X, Z, dx, dz, r=0.06, n=2):
    for k in range(n):
        bird(g, '%s_Gull%d' % (name, k + 1), (X + dx * LM, 0, Z + dz * LM), r * LM * (1 + 0.4 * k), SEA_Y + 0.18 + 0.05 * k, col='white', size=0.9,
             turns=(1 if k % 2 else -1) * (1 + k % 2), phase=k * 2.0, flap=3)


# ------------------------------------------------------------------------------------------------ Adjara and the coast
def build_gonio():
    """Gonio (Apsaros): the Roman fort at the mouth of the Chorokhi, a square of curtain walls with eighteen towers,
    the gate on the north side, the grave said to be the Apostle Matthias's inside"""
    g, X, Z = _site('Gonio')
    s_ = 0.017; corners = [(-s_, -s_), (s_, -s_), (s_, s_), (-s_, s_)]
    pts = []
    for a, b in zip(corners, corners[1:] + corners[:1]):
        for k in range(3): pts.append((a[0] + (b[0] - a[0]) * k / 3, a[1] + (b[1] - a[1]) * k / 3))
    fort_wall(g, X, Z, pts, h=0.0085, mat='stoneG', tower_w=0.0075, tower_h=0.0145)
    place(g, tower_sq(0.01, 0.019, 'stoneG') + [(T(arch_win(0.004, 0.007), 0, 0, 0.0052), 'ink')], X, Z, 0.0, -s_, foot=0.006)   # the north gate
    place(g, [(box(0.03, 0.0006, 0.03), 'lawn')], X, Z, 0, 0, foot=0, sink=0.0003, occ=False)
    for (x, z, w, d) in ((-0.007, -0.004, 0.008, 0.006), (0.006, 0.006, 0.01, 0.005), (-0.004, 0.009, 0.006, 0.004)):   # excavated Roman foundations
        place(g, [(T(box(w, 0.0016, 0.0007), 0, 0, -d / 2), 'stoneD'), (T(box(w, 0.0016, 0.0007), 0, 0, d / 2), 'stoneD'), (T(box(0.0007, 0.0016, d), -w / 2, 0, 0), 'stoneD'),
                  (T(box(0.0007, 0.0016, d), w / 2, 0, 0), 'stoneD')], X, Z, x, z, foot=0, occ=False)
    place(g, [(box(0.003, 0.0012, 0.005), 'white'), (T(box(0.0007, 0.005, 0.0007), y=0.0012), 'ink'), (T(box(0.0026, 0.0007, 0.0007), y=0.0045), 'ink')], X, Z, 0.006, -0.007, foot=0)
    for t in ((-0.011, 0.002), (0.011, -0.004), (0.0, 0.012), (-0.01, -0.011)): place(g, cypress(0.03), X, Z, t[0], t[1], foot=0, occ=False)
    flag(g, X, Z, 0.0, -s_ - 0.002)
    walkers(g, X, Z, [(-0.008, -0.01), (0.01, -0.01), (0.01, 0.01), (-0.01, 0.01)], 'Gonio', n=2)


def build_botanical_garden():
    """Batumi Botanical Garden on Mtsvane Kontskhi (the Green Cape): terraces climbing from the sea, bamboo, palms,
    eucalyptus and magnolias, the Japanese garden's pond and red bridge, the glasshouse; the coastal railway below,
    with the Stadler double-deck train running to Kobuleti"""
    g, X, Z = _site('BotanicalGarden'); at = coast_at('BotanicalGarden', -0.2, 0.15)
    shore(g, X, Z, at, -0.025, 0.035, [(0.0, 0.006, 'pebble', 0.0012)])
    # the railway along the shore, round the cape and on north past Kobuleti; the Tbilisi-Batumi train on it
    zz = np.linspace(0.035, -0.14, 40); inl = lambda z: 0.011 + 0.05 * _smooth01((-z - 0.03) / 0.04)
    C = [(X + at(z)[0] * LM + inl(z) * LM, Z + z * LM) for z in zz]
    track(g + ':Rail', X, Z, C, gauge=1.0)
    for c in C[::2]: OCC.append((c[0], c[1], 0.006 * LM))
    for k in range(3):
        ob = anim_inst('Coast_Train%d' % (k + 1), 'kiss_%d' % (k == 0), lambda k=k: kiss_car(lead=(k == 0)), mat4(C[0][0], ground3(*C[0]), C[0][1], s=LM), g)
        off = k * 0.152   # car length + gap, as a fraction of the run
        tt = lambda u, off=off: (u * 2 - off * 0.25) % 1.0
        k_track(ob, g, lambda u, tt=tt: along(C, tt(u), False), step=2, lift=0.0012 * LM, tol=0.0005, vis=lambda u, tt=tt: 0.0 if tt(u) > 0.97 or tt(u) < 0.012 else 1.0)
    # terraces: lawn strips held by stone walls, stepping up the cape
    for i in range(4):
        for z in np.arange(-0.02, 0.036, 0.012):
            x0 = at(z)[0] + 0.024 + i * 0.012
            place(g, [(box(0.012, 0.0008, 0.0125), 'lawn'), (T(box(0.0012, 0.003, 0.0125), -0.006, -0.002, 0), 'stoneD')], X, Z, x0, z, foot=0, sink=0.0004, occ=False)
    # the Japanese garden: a pond, the red arched bridge, a lantern
    pd = (at(0.0)[0] + 0.05, 0.004)
    place(g, [(T(cyl(0.008, 0.0009, 10), s=(1.3, 1, 1)), 'water'), (T(torus(0.005, 0.0007, 4, 10, arc=PI), 0, 0, 0, ry=0), 'red'),
              (T(box(0.0012, 0.004, 0.0012), 0.012, 0, 0.006), 'stoneD'), (T(pyramid(0.003, 0.003, 0.0018), 0.012, 0.004, 0.006), 'ink')], X, Z, *pd, foot=0, sink=0.0004)
    # the glasshouse and the entrance pavilion
    place(g, [(box(0.018, 0.008, 0.01), 'glassB'), (T(gable(0.01, 0.005, 0.018), y=0.008, ry=PI / 2), 'glass'), (T(box(0.0186, 0.0008, 0.0106), y=0.0), 'white')],
          X, Z, at(-0.02)[0] + 0.06, -0.02, ry=0.3, foot=0.01)
    place(g, [(box(0.012, 0.007, 0.008), 'plaster'), (T(hip(0.014, 0.01, 0.004), y=0.007), 'tile')] + [(T(box(0.0012, 0.006, 0.0012), -0.004 + k * 0.004, 0, 0.0046), 'white') for k in range(3)],
          X, Z, at(0.03)[0] + 0.035, 0.03, ry=0.2, foot=0.01)
    # the planting: palms near the sea, bamboo groves, eucalyptus and magnolias above
    for z in np.arange(-0.022, 0.034, 0.011): safe(g, palm(0.038 + rng.random() * 0.012, (rng.random() - 0.5) * 0.4, rng.random() * 6), X, Z, at(z)[0] + 0.02, z, foot=0, occ=False)
    for k in range(6):
        bx, bz = at(-0.02 + k * 0.01)[0] + 0.04 + rng.random() * 0.03, -0.02 + k * 0.01
        safe(g, [(T(cyl(0.0005, 0.03 + rng.random() * 0.012, 4), (rng.random() - 0.5) * 0.004, 0, (rng.random() - 0.5) * 0.004, rz=(rng.random() - 0.5) * 0.2), 'leafL') for _ in range(7)] +
             [(T(ball(0.004, 5, 3), 0, 0.028, 0, s=(1, 1.6, 1)), 'leafL')], X, Z, bx, bz, foot=0, occ=False)
    def bg_trees(hm, dry, n1, h): return t_broad(h * 1.2, pick(['eucal', 'leaf', 'beech', 'leafL'])) if rng.random() < 0.7 else t_clump(h, pick(['oak', 'leaf']))
    forest(g, X, Z, 0.07, dens=1.4, scatter=0.5, ox=0.06, oz=0.01, kinds=bg_trees, avoid=[(pd[0], pd[1], 0.014)])
    walkers(g, X, Z, [(at(-0.02)[0] + 0.035, -0.02), (at(0.0)[0] + 0.04, 0.0), (at(0.02)[0] + 0.05, 0.02), (at(0.0)[0] + 0.06, -0.005)], 'Garden', n=2)
    gulls(g, 'Garden', X, Z, at(0.0)[0] - 0.08, 0.0)


def build_kobuleti():
    """Kobuleti: the long pebble beach, the seafront with its hotels and the pine park behind; Petra fortress
    (Tsikhisdziri) on its headland to the south, walls and towers round the ruins of a Byzantine basilica.
    Off the beach a speedboat tows a parasail and jet skis cut about."""
    g, X, Z = _site('Kobuleti'); at = coast_at('Kobuleti', -0.18, 0.12)
    shore(g, X, Z, at, -0.042, 0.012, [(0.0, 0.007, 'pebble', 0.0012), (0.008, 0.011, 'stoneS', 0.0014), (0.011, 0.016, 'lawn', 0.0016)])
    for z in np.arange(-0.04, 0.01, 0.008):
        place(g, umbrella(pick(['umbR', 'umbB', 'yellow', 'white'])), X, Z, at(z)[0] + 0.003, z, foot=0, occ=False)
        if rng.random() < 0.6: place(g, [(cyl(0.0006, 0.012, 4), 'ink'), (T(ball(0.0016, 5, 3), y=0.012), 'lamp')], X, Z, at(z)[0] + 0.0095, z + 0.004, foot=0, occ=False)
    def mk_hotel(): return batumi_block(0.014 + rng.random() * 0.006, 0.011, 3 + rng.randrange(5), pick(['plaster', 'plasterY', 'plasterB', 'white']), pick(['glassB', 'ink']))
    for z in np.arange(-0.036, 0.008, 0.015): safe(g, mk_hotel(), X, Z, at(z)[0] + 0.026, z + rng.random() * 0.006, foot=0.01)
    houses(g, X, Z, 14, lambda: town_house(0.015 + rng.random() * 0.006, 0.013, 0.012, pick(['plaster', 'plasterY', 'plasterP', 'balc']), pick(['tin', 'tinR', 'tile'])),
           (at(-0.02)[0] + 0.045, 0.06, -0.045, 0.045), 'kob', mind=0.022, pack=0.45)
    def kob_trees(hm, dry, n1, h): return t_pine(h * 1.1, 'pineT') if rng.random() < 0.7 else t_broad(h, 'eucal')
    forest(g, X, Z, 0.07, dens=1.0, scatter=0.25, ox=0.08, oz=-0.02, kinds=kob_trees)
    # Petra: the fortress on the headland
    px, pz = find_spot(X, Z, 0.05, 0.03, 0.012, 'high')
    ring = [(px + math.cos(k / 9 * 2 * PI) * 0.024, pz + math.sin(k / 9 * 2 * PI) * 0.016) for k in range(9)]
    wall_line(g, X, Z, ring, h=0.007, th=0.003, mat='stoneGe', closed=True, crenel=True)
    for k in (0, 3, 6): place(g, tower_round(0.005, 0.014, 'stoneGe'), X, Z, *ring[k], foot=0.005)
    place(g, [(T(box(0.022, 0.006, 0.0018), 0, 0, -0.005), 'stoneD'), (T(box(0.022, 0.004, 0.0018), 0, 0, 0.005), 'stoneD'), (T(box(0.0018, 0.008, 0.011), -0.011, 0, 0), 'stoneD'),
              (T(cyl(0.004, 0.006, 8, 0.004), 0.011, 0, 0, s=(0.6, 1, 1)), 'stoneD')], X, Z, px, pz, ry=0.1, foot=0.008)
    flag(g, X, Z, *ring[3])
    # the sea: a parasail, jet skis, a yacht
    sx = at(-0.02)[0]
    boat_loop(g, 'Kobuleti_Parasail', 'parasail', parasail, X, Z, sx - 0.07, -0.02, 0.03, 0.045, turns=1, phase=0.5)
    for k in range(2): boat_loop(g, 'Kobuleti_JetSki%d' % (k + 1), 'jetski_' + 'jkY jkR'.split()[k], lambda k=k: jetski('jkY jkR'.split()[k]), X, Z, sx - 0.03 - 0.01 * k, -0.03 + 0.025 * k, 0.012, 0.018, turns=3 - k, phase=k * 2.0, roll=0.08)
    walkers(g, X, Z, [(at(-0.04)[0] + 0.0095, -0.04), (at(0.008)[0] + 0.0095, 0.008)], 'Kobuleti', n=3, closed=False)
    gulls(g, 'Kobuleti', X, Z, sx - 0.05, -0.04, n=1)


def build_ureki():
    """Ureki and Shekvetili: Ureki's black magnetic sand beach and its guest houses; Shekvetili's pine park and
    Tsitsinatela, the seaside fun park - its big wheel turning, a carousel, the rollercoaster"""
    g, X, Z = _site('Ureki'); at = coast_at('Ureki', -0.15, 0.15)
    shore(g, X, Z, at, -0.03, 0.035, [(0.0, 0.01, 'sandB', 0.0012)])
    for z in np.arange(-0.028, 0.008, 0.009): place(g, umbrella(pick(['umbR', 'umbB', 'yellow', 'jkT'])), X, Z, at(z)[0] + 0.004, z, foot=0, occ=False)
    houses(g, X, Z, 16, lambda: town_house(0.014 + rng.random() * 0.006, 0.012, 0.011 + rng.random() * 0.004, pick(['plaster', 'plasterY', 'plasterP', 'plasterB', 'balc']), pick(['tin', 'tinR', 'tinG']), balcony=rng.random() > 0.4),
           (at(-0.01)[0] + 0.02, 0.06, -0.03, 0.035), 'ure', mind=0.022, pack=0.45)
    # Tsitsinatela: the wheel, a carousel that spins, the coaster's looping track
    fx = at(0.024)[0] + 0.03
    ferris(g, X, Z, fx, 0.024, R=0.026, n=10, ry=PI / 2 - 0.2, name='Shekvetili_Wheel', cab_mat='jkY')
    Mc = place(g, [(cyl(0.012, 0.002, 12), 'stoneS')], X, Z, fx + 0.03, 0.012, foot=0.004)
    if Mc is not None:
        car = anim_obj('Shekvetili_Carousel', [(T(cyl(0.0012, 0.012, 6), y=0.002), 'gold2'), (T(cone(0.012, 0.006, 12), y=0.012), 'red'), (T(cyl(0.011, 0.0008, 12), y=0.0118), 'white')] +
                       [(T(box(0.0026, 0.0034, 0.0016), math.cos(a) * 0.009, 0.004, math.sin(a) * 0.009, ry=-a), pick(['white', 'horse', 'jkB'])) for a in np.linspace(0, 2 * PI, 9)[:-1]], Mc, g)
        k_spin(car, 2, 6.0)
    loop = [np.array((math.cos(a) * 0.03, 0.012 + 0.01 * math.sin(3 * a) + 0.008 * (a > PI), math.sin(a) * 0.014)) for a in np.linspace(0, 2 * PI, 25)]
    Mr = place(g, [(tube(loop, 0.0008, 4, caps=False), 'red')] + [(T(box(0.0008, max(0.002, p[1]), 0.0008), p[0], 0, p[2]), 'white') for p in loop[::3]], X, Z, fx + 0.045, 0.032, foot=0, occ=True)
    def sh_trees(hm, dry, n1, h): return t_pine(h * 1.15, 'pineT')
    forest(g, X, Z, 0.06, dens=1.2, scatter=0.5, ox=0.08, oz=0.01, kinds=sh_trees, avoid=[(fx, 0.024, 0.03), (fx + 0.045, 0.032, 0.03), (fx + 0.03, 0.012, 0.015)])
    sx = at(0.0)[0]
    boat_loop(g, 'Ureki_JetSki', 'jetski_jkB', lambda: jetski('jkB'), X, Z, sx - 0.03, -0.01, 0.014, 0.022, turns=3, roll=0.08)
    boat_loop(g, 'Ureki_Kite', 'kite_a', kitesurfer, X, Z, sx - 0.055, 0.0, 0.012, 0.035, turns=2, phase=1.0, roll=0.05)
    walkers(g, X, Z, [(at(-0.026)[0] + 0.004, -0.026), (at(0.006)[0] + 0.004, 0.006)], 'Ureki', n=2, closed=False)


def poti_lighthouse():
    """Poti lighthouse (1864): a cast-iron tower brought from England, red, on a stone base; gallery and lantern"""
    return [(cyl(0.006, 0.003, 10), 'stoneS'), (T(cyl(0.0032, 0.034, 10, 0.0046), y=0.003), 'red'), (T(cyl(0.0039, 0.002, 10), y=0.02), 'white'),
            (T(cyl(0.0043, 0.0012, 10), y=0.037), 'ink'), (T(cyl(0.0026, 0.0048, 10), y=0.0382), 'glass'), (T(dome(0.0029, 10, 2), y=0.043), 'red')]

def poti_cathedral():
    """Poti's cathedral (1907), built after Hagia Sophia: the great shallow dome on its ring of windows, half-domes
    east and west, four small corner domes, pale stone"""
    P = [(box(0.044, 0.018, 0.036), 'stoneS'), (T(cyl(0.012, 0.007, 16), y=0.018), 'stoneS'), (T(dome(0.0126, 16, 3), y=0.025, s=(1, 0.7, 1)), 'tinG')]
    P += on_faces(16, 0.012, lambda a, d: [(T(arch_win(0.002, 0.004), math.sin(a) * d, 0.0195, math.cos(a) * d, ry=a), 'ink')], 2)
    for sx in (-1, 1): P += [(T(dome(0.011, 12, 2), sx * 0.016, 0.018, 0, s=(1, 0.65, 1)), 'tinG')]
    for sx in (-1, 1):
        for sz in (-1, 1): P += [(T(cyl(0.0042, 0.006, 8), sx * 0.017, 0.018, sz * 0.013), 'stoneS'), (T(dome(0.0045, 8, 2), sx * 0.017, 0.024, sz * 0.013), 'tinG')]
    P += [(T(arch_win(0.003, 0.009), -0.0223, 0.004, z, ry=PI / 2), 'ink') for z in (-0.008, 0, 0.008)] + gold_cross(0.0335, 1.0)
    return P

def build_poti():
    """Poti: the port at the mouth of the Rioni - quays, breakwaters, ship-to-shore cranes with their trolleys
    running out over the holds, the container yard, a feeder ship alongside and another coming in with a tug;
    the red lighthouse; the cathedral in the town square"""
    g, X, Z = _site('PotiPort'); at = coast_at('PotiPort', -0.15, 0.15)
    # the quay and breakwaters, out over the water
    q0, q1 = -0.04, 0.025; qx = at(-0.01)[0]
    for z in np.arange(q0, q1, 0.01):
        emit(g + ':Port', 'concrete', T(box(0.045, 0.004, 0.0105), -0.0225 + 0.006, -0.0028, 0), sea_M(X, Z, at(z)[0], z + 0.005, y=SEA_Y + 0.0012))
    for (a, b) in (((-0.035, -0.05), (-0.09, -0.03)), ((-0.035, 0.032), (-0.08, 0.024))):
        n = 9
        for k in range(n):
            t = (k + 0.5) / n; px_, pz_ = qx + a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            emit(g + ':Port', pick(['rockG', 'rockD', 'stoneG']), T(box(0.012, 0.004, 0.006), 0, -0.0025, 0, ry=-math.atan2(b[1] - a[1], b[0] - a[0])), sea_M(X, Z, px_, pz_, y=SEA_Y + 0.0006))
    # cranes along the quay edge, boom out over the water (west), each trolley shuttling
    QY = SEA_Y + 0.0012 + 0.0012 * LM   # the quay's deck
    for k, z in enumerate((-0.03, -0.008, 0.014)):
        Mc = sea_M(X, Z, qx - 0.022, z, ry=PI, y=QY)
        for gg, m in sts_crane(col='cnR' if k != 1 else 'jkB'): emit(g + ':Cranes', m, gg, Mc)
        tr = anim_inst('Poti_Trolley%d' % (k + 1), 'trolley', sts_trolley, Mc @ mat4(0.014), g)
        k_wave(tr, 'location', 0, 0.016 * LM, cycles=3 + k, phase=k * 1.3, step=8)
    # the container yard: stacks in blocks
    for i in range(5):
        for j in range(6):
            hgt = 1 + rng.randrange(4); dx, dz = qx + 0.008 + i * 0.009, -0.038 + j * 0.011
            place(g + ':Port', [(T(box(0.0072, 0.0028, 0.0085), 0, k_ * 0.0029, 0), pick(['cnO', 'cnG', 'cnB', 'cnR', 'cnW', 'cnY'])) for k_ in range(hgt)], X, Z, dx, dz, foot=0, occ=True)
    # ships: one alongside, one sailing in and out with a tug
    emit_parts = container_ship(seed=3)
    for gg, m in emit_parts: emit(g + ':Ship', m, gg, sea_M(X, Z, qx - 0.04, -0.008, ry=PI / 2))
    boat_loop(g, 'Poti_Ship', 'cship', lambda: container_ship(seed=5), X, Z, qx - 0.13, -0.01, 0.035, 0.08, turns=1, phase=0.3, roll=0.01)
    boat_loop(g, 'Poti_Tug', 'tug', tug, X, Z, qx - 0.08, -0.01, 0.025, 0.04, turns=2, phase=1.5, roll=0.03)
    # the lighthouse (beam turning), the cathedral, the town
    Ml = place(g, poti_lighthouse(), X, Z, qx + 0.01, -0.055, foot=0)
    if Ml is not None:
        beam = anim_obj('Poti_LighthouseBeam', [(T(cone(0.005, 0.045, 4), rz=PI / 2, x=0.045), 'lamp'), (T(ball(0.002, 5, 3)), 'lamp')], Ml @ mat4(y=0.0405), g)
        k_spin(beam, 2, 4.0)
    place(g + ':Cathedral', poti_cathedral(), X, Z, qx + 0.085, -0.01, ry=0.0, foot=0.02)
    houses(g, X, Z, 26, lambda: town_house(0.015 + rng.random() * 0.007, 0.013, 0.012 + rng.random() * 0.006, pick(['plaster', 'plasterY', 'plasterP', 'plasterB', 'brickR']), pick(['tin', 'tinR', 'tile'])),
           (qx + 0.06, 0.08, -0.06, 0.09), 'poti', mind=0.02, pack=0.42)
    def po_trees(hm, dry, n1, h): return t_broad(h, pick(['eucal', 'leaf', 'oak']))
    forest(g, X, Z, 0.08, dens=0.6, scatter=0.12, ox=0.12, kinds=po_trees, avoid=[(qx + 0.085, -0.01, 0.03)])
    traffic(g, 'Poti_Lorry', 'lorry_b', lambda: lorry('white', 'cnB'), [(X + (qx + 0.055) * LM, Z + 0.03 * LM), (X + (qx + 0.055) * LM, Z - 0.06 * LM)], n=2, closed=False)
    gulls(g, 'Poti', X, Z, qx - 0.05, -0.03, n=2)


def build_anaklia():
    """Anaklia and Ganmukhuri either side of the Enguri's mouth, joined by the long wooden footbridge with its
    lamps; the beach, the hotels, the ruins of Anaklia's fort; kitesurfers on the sea"""
    g, X, Z = _site('Anaklia'); at = coast_at('Anaklia', -0.15, 0.15)
    shore(g, X, Z, at, 0.0, 0.036, [(0.0, 0.009, 'sand', 0.0012)]); shore(g, X, Z, at, -0.1, -0.055, [(0.0, 0.009, 'sand', 0.0012)])
    bx = at(-0.03)[0] + 0.03
    def bridge(L):
        P = [(box(L, 0.0012, 0.0042), 'wood'), (T(box(L, 0.0018, 0.0005), 0, 0.0012, 0.0019), 'balc'), (T(box(L, 0.0018, 0.0005), 0, 0.0012, -0.0019), 'balc')]
        n = max(4, int(L / 0.008))
        for k in range(n + 1):
            x = -L / 2 + k * L / n
            P.append((T(box(0.0009, 0.009, 0.0009), x, -0.008, 0), 'wood'))
            if k % 2 == 0: P += [(T(cyl(0.0003, 0.0075, 4), x, 0.0012, 0.0022), 'ink'), (T(ball(0.0011, 5, 3), x, 0.009, 0.0022), 'lamp')]
        return P
    Mb = place_span(g, bridge, X, Z, (bx, 0.006), (bx, -0.066), lift=0.004)
    walkers(g, X, Z, [(bx - 0.0008, 0.004), (bx - 0.0008, -0.064)], 'AnakliaBridge', n=3, closed=False, y=Mb[1, 3] + 0.0012 * LM)
    # Anaklia: the fort's ruined walls by the river mouth, hotels and guest houses behind the beach
    fx, fz = at(0.012)[0] + 0.028, 0.012
    wall_line(g, X, Z, [(fx - 0.012, fz - 0.009), (fx + 0.012, fz - 0.01), (fx + 0.013, fz + 0.01), (fx - 0.011, fz + 0.011)], h=0.005, th=0.003, mat='brickR', closed=True, crenel=True)
    place(g, tower_round(0.0045, 0.012, 'brickR'), X, Z, fx + 0.012, fz - 0.01, foot=0.004)
    place(g, [(box(0.016, 0.06, 0.014), 'glassB')] + [(T(box(0.0166, 0.0012, 0.0146), y=f * 0.0075), 'white') for f in range(1, 8)] + [(T(box(0.012, 0.004, 0.01), y=0.06), 'white')],
          X, Z, at(0.028)[0] + 0.05, 0.028, foot=0.01)
    houses(g, X, Z, 12, lambda: town_house(0.015, 0.012, 0.011, pick(['plaster', 'plasterB', 'balc', 'plasterY']), pick(['tinR', 'tin', 'tinG']), balcony=True),
           (at(0.02)[0] + 0.045, 0.07, 0.004, 0.032), 'ana', mind=0.022)
    houses(g, X, Z, 6, lambda: town_house(0.014, 0.012, 0.01, pick(['plaster', 'balc']), pick(['tinR', 'tin'])), (at(-0.08)[0] + 0.03, 0.05, -0.1, 0.035), 'gan', mind=0.022)
    def an_trees(hm, dry, n1, h): return t_pine(h, 'pineT') if rng.random() < 0.5 else t_broad(h, pick(['eucal', 'leaf']))
    forest(g, X, Z, 0.12, dens=0.6, scatter=0.15, ox=0.07, kinds=an_trees, avoid=[(bx, -0.03, 0.02)])
    sx = at(0.0)[0]
    for k in range(3):
        boat_loop(g, 'Anaklia_Kite%d' % (k + 1), 'kite_%d' % (k % 2), (lambda: kitesurfer(('jkR', 'jkY'))) if k % 2 == 0 else (lambda: kitesurfer(('jkB', 'white'))),
                  X, Z, sx - 0.035 - 0.02 * k, 0.0 - 0.035 * k, 0.012, 0.035, turns=2 + k % 2, phase=k * 2.1, roll=0.06, ang=0.2)
    boat_loop(g, 'Anaklia_Boat', 'fishing', fishing_boat, X, Z, sx - 0.09, -0.02, 0.03, 0.06, turns=1, phase=2.0)
    gulls(g, 'Anaklia', X, Z, sx - 0.04, -0.03, n=1)


def tamar_bridge(L):
    """Queen Tamar's bridge at Makhuntseti (12th c.): a single steep stone arch, no parapets"""
    P = []; n = 10; R = L / 2; rise = L * 0.42
    for k in range(n):
        a0, a1 = PI * k / n, PI * (k + 1) / n
        x0, y0, x1, y1 = -R * math.cos(a0), rise * math.sin(a0), -R * math.cos(a1), rise * math.sin(a1)
        P.append((Geo([(x0, y0, -0.0018), (x1, y1, -0.0018), (x1, y1, 0.0018), (x0, y0, 0.0018), (x0, y0 + 0.0022, -0.0018), (x1, y1 + 0.0022, -0.0018), (x1, y1 + 0.0022, 0.0018), (x0, y0 + 0.0022, 0.0018)],
                      [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]), 'stoneG'))
    return P

def build_makhuntseti():
    """Upper Adjara: the Adjaristskali in its wooded gorge, Queen Tamar's arched bridge across it, the Makhuntseti
    waterfall dropping beside the road, wooden Adjarian houses; a marshrutka and cars on the mountain road"""
    g, X, Z = _site('Makhuntseti')
    place_span(g, tamar_bridge, X, Z, (0.03, -0.012), (0.03, -0.05), lift=-0.004)
    waterfall(g, X, Z, 0.085, -0.075, 0.034, 0.007, PI / 2 + 0.1, 'Makhuntseti')
    houses(g, X, Z, 9, lambda: town_house(0.014 + rng.random() * 0.006, 0.012, 0.012, pick(['balc', 'balcD', 'plaster']), pick(['tin', 'tinR', 'tinG']), balcony=True, chimney=True),
           (-0.12, 0.12, -0.07, 0.06), 'mak', mind=0.022, pack=0.5)
    forest(g, X, Z, 0.16, dens=1.3, scatter=0.2, avoid=[(0.085, -0.075, 0.02), (0.03, -0.03, 0.02)])
    C, closed = chan_world('mk_road')
    traffic(g, 'Makhuntseti_Bus', 'marsh_y', lambda: marshrutka('jkY'), C, n=1, closed=False, laps=1.0)
    traffic(g, 'Makhuntseti_Car', 'sedan_s', lambda: sedan('carS'), C, n=1, closed=False, laps=1.0, phase=0.5, reverse=True)


def build_goderdzi():
    """Goderdzi, the ski resort on the pass between Adjara and Meskheti: a gondola and a chairlift, pistes through the
    snowy firs, skiers coming down, chalets"""
    g, X, Z = _site('Goderdzi')
    top = find_spot(X, Z, -0.05, -0.05, 0.05, 'high'); top2 = find_spot(X, Z, 0.04, -0.06, 0.04, 'high'); bot = find_spot(X, Z, 0.02, 0.02, 0.025, 'flat')
    lift_line(g, X, Z, bot, top, kind='gondola', n_cab=6, col='jkB', towers=3, prefix='Goderdzi')
    lift_line(g, X, Z, (bot[0] + 0.02, bot[1] - 0.005), top2, kind='chair', n_cab=6, towers=2, prefix='GoderdziChair')
    ski_run(g, X, Z, [top, ((top[0] + bot[0]) / 2 - 0.025, (top[1] + bot[1]) / 2 + 0.01), (bot[0] - 0.01, bot[1] + 0.006)], 'Goderdzi', n=3)
    ski_run(g, X, Z, [top2, ((top2[0] + bot[0]) / 2 + 0.03, (top2[1] + bot[1]) / 2), (bot[0] + 0.025, bot[1] + 0.004)], 'GoderdziB', n=2, phase=0.4)
    houses(g, X, Z, 10, lambda: chalet(0.016, 0.013, 0.014, pick(['chalet', 'balc', 'plaster']), pick(['tinR', 'tinG', 'tin']), snow=rng.random() < 0.6), (bot[0] - 0.03, 0.08, bot[1] + 0.005, 0.05), 'god', mind=0.022)
    forest(g, X, Z, 0.12, dens=1.0, scatter=0.25, kinds=lambda hm, dry, n1, h: snow_fir(h * 1.05), avoid=[(top[0], top[1], 0.02), (bot[0], bot[1], 0.025)])


# ------------------------------------------------------------------------------------------------ Samegrelo, Svaneti, Imereti, Racha, Guria
def build_zugdidi():
    """Zugdidi: the Dadiani palaces - the princes' neo-Gothic palace with its crenellated towers and the smaller
    palace beside it - the Blachernae church, the botanic garden, and the boulevard running into town"""
    g, X, Z = _site('ZugdidiPalace')
    pal = [(box(0.05, 0.016, 0.018), 'stoneS'), (T(box(0.052, 0.0016, 0.02), y=0.016), 'stoneD')]
    for x in np.linspace(-0.024, 0.024, 9): pal.append((T(box(0.0024, 0.0024, 0.0186), x, 0.0176, 0), 'stoneS'))
    for sx in (-1, 1): pal += [(T(box(0.012, 0.026, 0.012), sx * 0.024, 0, 0.004), 'stoneS'), (T(pyramid(0.013, 0.013, 0.012), sx * 0.024, 0.026, 0.004), 'slate')]
    pal += [(T(box(0.012, 0.022, 0.02), 0, 0, 0.002), 'stoneS'), (T(cyl(0.006, 0.034, 8), 0.012, 0, -0.006), 'stoneS'), (T(cone(0.0066, 0.014, 8), 0.012, 0.034, -0.006), 'slate')]
    for f in range(2):
        for x in np.linspace(-0.02, 0.02, 7): pal.append((T(arch_win(0.0026, 0.005), x, 0.003 + f * 0.007, 0.0093), 'ink'))
    place(g + ':Palace', pal, X, Z, -0.03, -0.02, ry=0.3, foot=0.02)
    place(g + ':Palace', town_house(0.026, 0.016, 0.014, 'plasterY', 'tin', balcony=True, hipped=True), X, Z, 0.015, -0.05, ry=0.3, foot=0.012)
    place(g, xchurch(L=0.024, B=0.012, C=0.02, H=0.014, R=0.0046, DH=0.009, CH=0.008, wall='stoneAl', roof='tin', cross_s=0.7), X, Z, -0.06, 0.02, ry=0.3, foot=0.012)
    flag(g, X, Z, -0.018, -0.024)
    for k in range(10): safe(g, palm(0.036, (rng.random() - 0.5) * 0.3, rng.random() * 6), X, Z, -0.07 + k * 0.009, 0.0 + (k % 2) * 0.012, foot=0, occ=False)
    def zu_trees(hm, dry, n1, h): return t_broad(h * 1.15, pick(['leaf', 'oakD', 'eucal', 'walnut'])) if rng.random() < 0.75 else cypress(h * 1.1)
    forest(g, X, Z, 0.11, dens=1.0, scatter=0.45, ox=-0.05, oz=-0.03, kinds=zu_trees, avoid=[(-0.03, -0.02, 0.035), (0.015, -0.05, 0.02)])
    C, _ = chan_world('zu_ave')
    for k, c in enumerate(C[::3]): place(g, t_broad(0.026, 'leaf'), X, Z, (c[0] - X) / LM + 0.009, (c[1] - Z) / LM - 0.006, foot=0, occ=False)
    houses(g, X, Z, 24, lambda: town_house(0.016 + rng.random() * 0.007, 0.013, 0.012 + rng.random() * 0.005, pick(['plaster', 'plasterY', 'plasterP', 'plasterB']), pick(['tin', 'tinR', 'tile']), balcony=rng.random() > 0.5),
           (0.02, 0.12, 0.0, 0.11), 'zug', mind=0.021, pack=0.42)
    traffic(g, 'Zugdidi_Bus', 'marsh_y', lambda: marshrutka('jkY'), C, n=1, closed=False)
    traffic(g, 'Zugdidi_Car', 'sedan_w', lambda: sedan('carW'), C, n=2, closed=False, reverse=True, phase=0.3)


def canyon(g, X, Z, pts, wdt=0.012, hgt=0.03, mat='rockG', water='waterG', seed=1):
    """a narrow canyon carved below the land: two broken rock walls along a winding path, the river between.
    Returns the river's world polyline."""
    r_ = random.Random(seed)
    C = catmull([(X + p[0] * LM, Z + p[1] * LM) for p in pts], 10 * len(pts)); C = [np.array(c) for c in C]
    river = []
    for k in range(len(C) - 1):
        a, b = C[k], C[k + 1]; t = b - a; L = np.linalg.norm(t) or 1e-9; t /= L; nrm = np.array([-t[1], t[0]])
        m = (a + b) / 2; ang = -math.atan2(t[1], t[0]); y0 = min(ground3(*a), ground3(*b))
        for side in (-1, 1):
            q = m + nrm * side * (wdt / 2 + 0.005) * LM; h = hgt * (0.55 + 0.6 * r_.random()); l2 = L / LM * 0.62; d2 = 0.005 + r_.random() * 0.003
            M = mat4(q[0], y0 - 0.004 * LM, q[1], ry=ang, s=LM)
            poly = [(-l2, -d2), (l2, -d2 * (0.6 + 0.6 * r_.random())), (l2 * (0.9 + 0.2 * r_.random()), d2), (-l2 * (0.8 + 0.3 * r_.random()), d2 * 1.2)]
            for gg, mm in rock(poly, h, pick([mat, 'rockD', mat, 'rockG']), 0.35, r_.randrange(999)): emit(g, mm, gg, M)
            if r_.random() < 0.55: emit(g, pick(['leaf', 'oakD', 'leafL']), T(ball(0.004 + r_.random() * 0.003, 5, 3), 0, h * 0.8, side * d2, s=(1.4, 0.7, 1)), M)
        river.append((m[0], m[1]))
        emit(g + ':River', water, T(box(L / LM * 1.15, 0.0008, wdt * 1.1), 0, 0, 0), mat4(m[0], max(ground3(*m), y0) + 0.0008 * LM, m[1], ry=ang, s=LM))
    return river, [ground3(*c) for c in C]

def build_martvili():
    """Martvili canyon (Gachedili): the Abasha cut deep into limestone, waterfalls at its head, inflatable boats
    nosing up and down between the green walls; Chkondidi monastery on its hill above the town"""
    g, X, Z = _site('MartviliCanyon')
    pts = [(-0.08, 0.04), (-0.05, 0.02), (-0.03, -0.01), (-0.005, -0.025), (0.02, -0.05), (0.045, -0.065)]
    river, ys = canyon(g, X, Z, pts, wdt=0.014, hgt=0.028, mat='rockG', seed=4)
    y_r = min(ys) - 0.002 * LM
    waterfall(g, X, Z, pts[-1][0] + 0.006, pts[-1][1] - 0.006, 0.02, 0.008, PI * 0.8, 'Martvili', cliff=True)
    for k in range(2):
        ob = anim_inst('Martvili_Boat%d' % (k + 1), 'raft', raft, mat4(river[0][0], y_r, river[0][1], s=LM), g)
        k_track(ob, g, lambda u, k=k: along(river, 0.05 + 0.9 * (1 - abs(1 - 2 * ((u + k * 0.5) % 1.0))), False), step=4, tol=0.0006, lift=0.0022 * LM)
    walkers(g, X, Z, [(-0.06, 0.012), (-0.03, -0.022), (0.0, -0.04), (0.03, -0.068)], 'MartviliPath', n=2, closed=False)
    mx, mz = find_spot(X, Z, 0.07, 0.05, 0.02, 'high')
    place(g, xchurch(L=0.03, B=0.014, C=0.026, H=0.018, R=0.006, DH=0.012, CH=0.011, n=8, wall='stoneAl', roof='tin', cross_s=0.8), X, Z, mx, mz, ry=0.1, foot=0.016)
    place(g, campanile(0.009, 0.024, 'stoneAl', 'tin'), X, Z, mx - 0.022, mz + 0.008, foot=0.008)
    houses(g, X, Z, 10, lambda: town_house(0.015, 0.012, 0.011, pick(['plaster', 'balc', 'plasterY']), pick(['tin', 'tinR'])), (0.03, 0.08, 0.06, 0.05), 'mrt', mind=0.022)
    forest(g, X, Z, 0.13, dens=1.4, scatter=0.25, avoid=[(mx, mz, 0.025)])
    eagles(g, 'Martvili', X, Z, 0.0, 0.0, r=0.06, h=0.3, n=1)


def enguri_dam(span, H, depth=0.0035, bow=0.006):
    """the Enguri arch dam (1987, 271 m): a thin concrete arch curved upstream (-z), its crest road"""
    P = []; n = 12
    for k in range(n):
        x0, x1 = -span / 2 + span * k / n, -span / 2 + span * (k + 1) / n
        z0, z1 = -bow * (1 - (2 * x0 / span) ** 2), -bow * (1 - (2 * x1 / span) ** 2)
        hh = H * (1 - 0.92 * (abs((x0 + x1) / span)) ** 2.2)
        P.append((Geo([(x0, H - hh, z0), (x1, H - hh, z1), (x1, H - hh, z1 + depth * 1.8), (x0, H - hh, z0 + depth * 1.8), (x0, H, z0), (x1, H, z1), (x1, H, z1 + depth), (x0, H, z0 + depth)],
                      [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]), 'concrete'))
        P.append((Geo([(x0, H, z0 - 0.0002), (x1, H, z1 - 0.0002), (x1, H, z1 + depth), (x0, H, z0 + depth), (x0, H + 0.0008, z0 - 0.0002), (x1, H + 0.0008, z1 - 0.0002), (x1, H + 0.0008, z1 + depth), (x0, H + 0.0008, z0 + depth)],
                      [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]), 'asphalt'))
    return P

def build_enguri():
    """The Enguri dam and the Jvari reservoir behind it, a long turquoise lake in the gorge"""
    g, X, Z = _site('Enguri')
    y = lake_water(g, X, Z, 'Enguri', 0.0, -0.065, 0.024, 0.058, mat='lakeT')
    if y is None: return
    zd = -0.065 + 0.058 * 1.0 + 0.004
    gy0 = min(ground3(X + dxx * LM, Z + zd * LM) for dxx in (-0.004, 0.0, 0.004))
    H = (y - gy0) / LM + 0.004
    M = mat4(X, gy0 - 0.002 * LM, Z + zd * LM, s=LM)
    for gg, m in enguri_dam(0.06, H + 0.002): emit(g + ':Dam', m, gg, M)
    place(g, [(box(0.016, 0.008, 0.01), 'concrete'), (T(box(0.0165, 0.0012, 0.0105), y=0.008), 'tin')], X, Z, 0.035, zd - 0.006, foot=0.008)
    waterfall(g, X, Z, 0.0, zd + 0.004, H * 0.6, 0.006, -PI / 2, 'EnguriSpill', cliff=False, drops=2)
    forest(g, X, Z, 0.13, dens=1.1, scatter=0.15, avoid=[(0.0, zd, 0.03)])
    eagles(g, 'Enguri', X, Z, 0.0, -0.05, r=0.07, h=0.3, n=2)


def build_hatsvali():
    """Hatsvali and the Zuruldi ridge above Mestia: a chairlift and a gondola over the snow, pistes, skiers"""
    g, X, Z = _site('Hatsvali')
    top = find_spot(X, Z, -0.02, 0.03, 0.035, 'high'); bot = find_spot(X, Z, 0.02, -0.025, 0.02, 'low')
    lift_line(g, X, Z, bot, top, kind='chair', n_cab=7, towers=3, prefix='HatsvaliChair')
    ski_run(g, X, Z, [top, ((top[0] + bot[0]) / 2 + 0.02, (top[1] + bot[1]) / 2), (bot[0] + 0.006, bot[1] - 0.004)], 'Hatsvali', n=3)
    place(g, chalet(0.02, 0.014, 0.014, 'chalet', 'slateSv', snow=True), X, Z, top[0] + 0.012, top[1] - 0.008, foot=0.012)
    forest(g, X, Z, 0.07, dens=0.9, scatter=0.2, kinds=lambda hm, dry, n1, h: snow_fir(h * 1.05), avoid=[(top[0], top[1], 0.015), (bot[0], bot[1], 0.012)])


def build_tskaltubo():
    """Imereti's karst: Prometheus Cave's entrance under its limestone hill, Okatse canyon with the walkway hung
    from its cliff and visitors out on it, Kinchkha's falls, and Tskaltubo's old spa with its colonnaded sanatorium"""
    g, X, Z = _site('Tskaltubo')
    cx_, cz_ = find_spot(X, Z, 0.0, -0.01, 0.025, 'flat')
    place(g, rock([(-0.02, -0.01), (0.01, -0.018), (0.024, 0.004), (0.004, 0.016), (-0.018, 0.01)], 0.022, 'lime', 0.2, 3) +
          [(T(arch_win(0.008, 0.009), 0.0, 0.0, 0.0165), 'ink'), (T(box(0.024, 0.008, 0.012), 0.0, 0, 0.026), 'glassB'), (T(box(0.026, 0.0012, 0.014), 0.0, 0.008, 0.026), 'white')],
          X, Z, cx_, cz_, ry=0.2, foot=0.02)
    # Okatse: the canyon and the walkway hanging from its west wall, a platform out over the drop
    river, ys = canyon(g, X, Z, [(-0.06, -0.1), (-0.05, -0.075), (-0.04, -0.05), (-0.035, -0.02)], wdt=0.012, hgt=0.032, mat='lime', water='waterG', seed=8)
    wk = [(-0.06 - 0.013, -0.1), (-0.05 - 0.013, -0.075), (-0.04 - 0.013, -0.05), (-0.035 - 0.013, -0.02)]
    Cw = catmull([(X + p[0] * LM, Z + p[1] * LM) for p in wk], 24)
    ywk = max(ground3(*c) for c in Cw) + 0.004 * LM
    for a, b in zip(Cw, Cw[1:]):
        a, b = np.array(a), np.array(b); m = (a + b) / 2; L = np.linalg.norm(b - a); ang = -math.atan2(b[1] - a[1], b[0] - a[0])
        M = mat4(m[0], ywk, m[1], ry=ang, s=LM)
        for gg, mm in [(box(L / LM * 1.05, 0.0006, 0.004), 'steel'), (T(box(L / LM * 1.05, 0.002, 0.0004), 0, 0.0006, 0.0019), 'steel'), (T(box(L / LM * 1.05, 0.002, 0.0004), 0, 0.0006, -0.0019), 'steel'),
                       (T(box(0.0006, 0.012, 0.0006), 0, -0.012, -0.0018), 'ink')]: emit(g + ':Walkway', mm, gg, M)
    walkers(g, X, Z, [((c[0] - X) / LM, (c[1] - Z) / LM) for c in Cw[::4]], 'Okatse', n=3, closed=False, y=ywk + 0.0006 * LM)
    waterfall(g, X, Z, -0.085, -0.035, 0.04, 0.008, 0.2, 'Kinchkha')
    # Tskaltubo: the sanatorium with its portico, the round bathhouse, the spa park
    sx_, sz_ = 0.035, 0.055
    san = [(box(0.07, 0.016, 0.016), 'plasterY'), (T(hip(0.072, 0.018, 0.005), y=0.016), 'tin'), (T(box(0.024, 0.02, 0.008), 0, 0, 0.011), 'plaster'),
           (T(gable(0.008, 0.005, 0.026), 0, 0.02, 0.011, ry=PI / 2), 'plaster')] + [(T(cyl(0.0011, 0.018, 6), -0.01 + k * 0.004, 0.0, 0.0155), 'white') for k in range(6)]
    for f in range(2): san += [(T(rect_win(0.0024, 0.0042), x, 0.003 + f * 0.007, 0.0083), 'ink') for x in np.linspace(-0.032, 0.032, 12) if abs(x) > 0.013]
    place(g, san, X, Z, sx_, sz_, ry=0.0, foot=0.014)
    place(g, [(cyl(0.012, 0.012, 14), 'plaster'), (T(dome(0.0124, 14, 3), y=0.012, s=(1, 0.6, 1)), 'tinG')] + on_faces(14, 0.012, lambda a, d: [(T(arch_win(0.0026, 0.006), math.sin(a) * d, 0.003, math.cos(a) * d, ry=a), 'ink')], 2),
          X, Z, sx_ - 0.055, sz_ + 0.01, foot=0.012)
    houses(g, X, Z, 10, lambda: town_house(0.015, 0.012, 0.011, pick(['plaster', 'plasterY', 'plasterP']), pick(['tin', 'tinR'])), (0.0, 0.1, 0.075, 0.025), 'tsk', mind=0.022)
    forest(g, X, Z, 0.15, dens=1.2, scatter=0.2, avoid=[(cx_, cz_, 0.03), (sx_, sz_, 0.045), (sx_ - 0.055, sz_ + 0.01, 0.02)])
    traffic(g, 'Tskaltubo_Bus', 'marsh_w', lambda: marshrutka('carW'), [(X + (sx_ + 0.05) * LM, Z + (sz_ + 0.025) * LM), (X + (cx_ + 0.02) * LM, Z + (cz_ + 0.04) * LM)], n=1, closed=False)


def katskhi_pillar(H=0.07):
    """the Katskhi pillar: a 40 m limestone monolith with a tiny church and hermit's cell on its summit, the iron
    ladder up its side"""
    P = rock([(-0.006, -0.005), (0.005, -0.006), (0.007, 0.002), (0.002, 0.007), (-0.006, 0.004)], H, 'lime', 0.04, 5)
    P += [(T(g_, 0.0, H, -0.0005), m_) for g_, m_ in hall_church(0.008, 0.005, 0.0045, 'stoneD', 'tile', belfry=False)]
    P += [(T(box(0.004, 0.003, 0.004), 0.0038, H, 0.003), 'stoneD'), (T(box(0.0012, H, 0.002), 0.0068, 0, 0.0005), 'steel')]
    return P

def build_chiatura():
    """Chiatura, the manganese town in the Kvirila gorge: Soviet blocks on the slopes and its famous rope roads -
    cable cars criss-crossing from the valley to the rims; Mgvimevi's church in a cliff; and nearby the Katskhi
    pillar, a monk climbing its ladder"""
    g, X, Z = _site('Chiatura')
    for k, (a, b) in enumerate((((0.0, 0.005), (0.03, -0.075)), ((0.02, 0.012), (0.07, 0.07)), ((-0.03, 0.03), (-0.075, -0.045)), ((-0.02, 0.04), (-0.05, 0.1)))):
        ropeway(g, X, Z, a, b, 'Chiatura_Rope%d' % (k + 1), col='rust' if k % 2 == 0 else 'jkY', n_cab=1 + k % 2, h=0.024, cycles=1 + k % 2)
    def mk_blk():   # the five-storey khrushchyovka blocks
        w = 0.022 + rng.random() * 0.012; fl = 3 + rng.randrange(3); P = [(box(w, fl * 0.0045, 0.011), pick(['plaster', 'concrete', 'plasterB', 'stoneS'])), (T(box(w * 1.02, 0.0008, 0.0112), y=fl * 0.0045), 'concreteD')]
        for f in range(fl):
            for x in np.linspace(-w / 2 + 0.002, w / 2 - 0.002, int(w / 0.004)): P.append((T(rect_win(0.0018, 0.0022), x, f * 0.0045 + 0.0012, 0.0056), 'ink'))
        return P
    houses(g, X, Z, 14, mk_blk, (-0.06, 0.12, -0.05, 0.1), 'chi', mind=0.024, pack=0.45, ry0=0.4, ryj=0.2)
    houses(g, X, Z, 10, lambda: town_house(0.014, 0.012, 0.011, pick(['plaster', 'balc', 'plasterY']), pick(['tin', 'tinR'])), (-0.1, 0.18, -0.08, 0.16), 'chi2', mind=0.022)
    place(g, [(box(0.04, 0.012, 0.018), 'concreteD'), (T(gable(0.018, 0.006, 0.04), y=0.012, ry=PI / 2), 'tin'), (T(cyl(0.0024, 0.04, 6), 0.015, 0, 0.004), 'brickR')], X, Z, 0.07, -0.02, ry=0.4, foot=0.012)
    mx, mz = find_spot(X, Z, -0.02, -0.08, 0.025, 'high')
    place(g, rock([(-0.014, -0.006), (0.014, -0.008), (0.016, 0.006), (-0.012, 0.008)], 0.03, 'lime', 0.15, 9) + [(T(g_, 0.0, 0.012, 0.0105), m_) for g_, m_ in hall_church(0.014, 0.008, 0.008, 'stoneD', 'tile')],
          X, Z, mx, mz, ry=0.2, foot=0.012)
    # Katskhi
    kx, kz = -0.1, -0.03
    Mk = place(g, katskhi_pillar(), X, Z, kx, kz, foot=0.008)
    if Mk is not None:
        ob = anim_inst('Katskhi_Monk', 'monk', monk, Mk @ mat4(0.0072, 0.002, 0.0005, ry=-PI / 2), g)
        base = Mk @ np.array([0.0076, 0.002, 0.0005, 1.0])
        k_track(ob, g, lambda u: (base[0], base[1] + 0.06 * LM * (0.5 - 0.5 * math.cos(2 * PI * u)), base[2]), step=4, yaw=False, tol=0.0005)
    place(g, xchurch(L=0.02, B=0.012, C=0.02, H=0.011, R=0.0055, DH=0.007, CH=0.007, n=10, wall='stoneAl', roof='stoneD', cross_s=0.6), X, Z, kx + 0.03, kz + 0.02, ry=0.2, foot=0.012)
    forest(g, X, Z, 0.15, dens=1.1, scatter=0.2, avoid=[(kx, kz, 0.018), (0.0, 0.02, 0.06)])
    C, _ = chan_world('ch_road')
    traffic(g, 'Chiatura_Bus', 'marsh_y', lambda: marshrutka('jkY'), C, n=1, closed=False)
    traffic(g, 'Chiatura_Lorry', 'lorry_r', lambda: lorry('cnR', 'concreteD'), C, n=1, closed=False, reverse=True, phase=0.4)


def nikortsminda():
    """Nikortsminda (1010-14): a tall cross-dome church of pale stone, its drum of twelve windows and the facades
    covered in carving (here the relief panels and the blind arcades)"""
    P = xchurch(L=0.044, B=0.02, C=0.038, H=0.024, R=0.0082, DH=0.02, CH=0.014, n=12, wall='stoneAl', roof='tile', rise=0.4, cross_s=0.9)
    for sz in (-1, 1):
        for k in range(5): P.append((T(arch_win(0.0034, 0.012), -0.016 + k * 0.008, 0.004, sz * 0.0102), 'stoneD'))
        P.append((T(plate([(-0.005, 0), (0.005, 0), (0.0, 0.008)]), 0.0, 0.016, sz * 0.0192), 'stoneD'))
    return P

def build_racha():
    """Racha: Nikortsminda cathedral among its walnut trees, Ambrolauri on the Rioni below, the Khvanchkara vineyards
    on the slopes, Shaori lake up in the hills with boats out on it"""
    g, X, Z = _site('Racha')
    place(g, nikortsminda(), X, Z, 0.0, 0.0, ry=0.05, foot=0.03)
    place(g, campanile(0.01, 0.03, 'stoneAl', 'tile'), X, Z, -0.034, 0.012, foot=0.008)
    wall_line(g, X, Z, [(-0.045, -0.025), (0.035, -0.027), (0.037, 0.028), (-0.046, 0.03)], h=0.004, th=0.003, mat='stoneAl', closed=True)
    houses(g, X, Z, 14, lambda: town_house(0.015, 0.012, 0.012, pick(['plaster', 'balc', 'plasterY', 'stoneAl']), pick(['tin', 'tinR', 'tinG']), balcony=rng.random() > 0.4, chimney=True),
           (-0.06, 0.12, -0.11, 0.05), 'amb', mind=0.022, pack=0.45)
    for (cxl, czl, ang) in ((0.06, -0.04, 0.3), (0.08, -0.07, 0.5), (0.04, 0.05, -0.2)): vineyard(g, X, Z, cxl, czl, 0.04, 0.025, ang)
    y = lake_water(g, X, Z, 'Racha', -0.07, 0.0, 0.03, 0.017, ang=0.4, mat='lakeT')
    if y is not None:
        for k in range(2):
            boat_loop(g, 'Shaori_Boat%d' % (k + 1), 'rowboat_%d' % k, lambda k=k: rowboat(['white', 'jkR'][k]), X, Z, -0.07, 0.0, 0.015 - 0.004 * k, 0.007, y=y, turns=1 if k else -1, phase=k * 2.5, roll=0.02, ang=0.4)
    def ra_trees(hm, dry, n1, h): return t_broad(h, pick(['walnut', 'oak', 'beech'])) if hm < 1300 else t_conifer(h * 1.1, 'spruce')
    forest(g, X, Z, 0.14, dens=1.0, scatter=0.15, kinds=ra_trees, avoid=[(0.0, 0.0, 0.05), (-0.07, 0.0, 0.04)])
    eagles(g, 'Racha', X, Z, 0.03, 0.03, r=0.07, h=0.3, n=1)


def build_bakhmaro():
    """Bakhmaro, Guria's summer resort at 2000 m: a meadow ridge of wooden cottages on stilts among the firs, horses
    grazing, walkers"""
    g, X, Z = _site('Bakhmaro')
    def cottage():
        c = pick(['jkB', 'jkR', 'jkT', 'jkY', 'white'])
        return [(T(box(0.0007, 0.005, 0.0007), x, 0, z), 'wood') for x in (-0.006, 0.006) for z in (-0.005, 0.005)] + \
               [(T(box(0.014, 0.008, 0.012), y=0.005), 'balc'), (T(gable(0.014, 0.008, 0.016), y=0.013, ry=PI / 2), c), (T(rect_win(0.003, 0.003), 0, 0.008, 0.0062), 'ink')]
    houses(g, X, Z, 16, cottage, (-0.09, 0.18, -0.05, 0.1), 'bak', mind=0.02, pack=0.5, foot=0.004)
    place(g, hall_church(0.014, 0.008, 0.009, 'balc', 'tinR'), X, Z, 0.02, -0.03, foot=0.008)
    for k in range(3):
        ob = anim_inst('Bakhmaro_Horse%d' % (k + 1), 'horse_%d' % (k % 2), lambda k=k: scaled(horse_m(['horse', 'horseD'][k % 2]), M_ * 0.62), mat4(X, ground3(X, Z), Z, s=LM), g)
        cx0, cz0 = X + (-0.04 + 0.03 * k) * LM, Z + (0.05 - 0.01 * k) * LM
        k_track(ob, g, lambda u, cx0=cx0, cz0=cz0, k=k: (cx0 + 0.012 * LM * math.cos(2 * PI * u + k), cz0 + 0.008 * LM * math.sin(2 * PI * u + k)), step=8, tol=0.0005)
    walkers(g, X, Z, [(-0.08, 0.0), (-0.03, -0.01), (0.03, 0.01), (0.08, 0.02)], 'Bakhmaro', n=2, closed=False)
    forest(g, X, Z, 0.12, dens=1.0, scatter=0.25, kinds=lambda hm, dry, n1, h: t_conifer(h * 1.1, pick(['spruce', 'spruceD'])), avoid=[(0.0, 0.02, 0.05)])


# ------------------------------------------------------------------------------------------------ Samtskhe-Javakheti, Kvemo Kartli
def likani():
    """Likani palace (1892-95), the Romanovs' summer house: grey-green stone, Moorish arches, a corner tower"""
    P = [(box(0.04, 0.016, 0.02), 'stoneG'), (T(box(0.041, 0.0014, 0.021), y=0.016), 'stoneD'), (T(box(0.012, 0.026, 0.012), 0.018, 0, -0.004), 'stoneG'),
         (T(pyramid(0.013, 0.013, 0.008), 0.018, 0.026, -0.004), 'tinG'), (T(hip(0.04, 0.02, 0.005), y=0.0174), 'tinG')]
    for f in range(2): P += [(T(arch_win(0.0028, 0.0056), x, 0.003 + f * 0.0072, 0.0103), 'ink') for x in np.linspace(-0.016, 0.01, 6)]
    return P

def build_borjomi():
    """Borjomi in its gorge: the mineral-water park with the spring pavilion, the park's cable car climbing to the
    plateau where a Ferris wheel turns, Likani palace by the Mtkvari; the Kukushka, the little narrow-gauge train,
    winding up to Bakuriani - the ski resort, with Didveli's gondola, a chairlift, pistes and skiers"""
    g, X, Z = _site('BorjomiPark')
    # the town along the river, the park
    houses(g, X, Z, 18, lambda: town_house(0.015 + rng.random() * 0.006, 0.013, 0.013 + rng.random() * 0.005, pick(['plaster', 'plasterY', 'plasterP', 'plasterB', 'balc']), pick(['tin', 'tinR', 'tinG']), balcony=True),
           (-0.04, 0.1, -0.09, 0.08), 'bor', mind=0.021, pack=0.45)
    px_, pz_ = find_spot(X, Z, -0.03, 0.01, 0.02, 'flat')
    place(g + ':Park', [(cyl(0.008, 0.009, 10), 'white'), (T(dome(0.0086, 10, 3), y=0.009), 'glassB')] + [(T(cyl(0.0008, 0.009, 4), math.cos(a) * 0.0095, 0, math.sin(a) * 0.0095), 'white') for a in np.linspace(0, 2 * PI, 9)[:-1]] +
          [], X, Z, px_, pz_, foot=0.008)
    tp = find_spot(X, Z, -0.09, 0.0, 0.03, 'high')
    ropeway(g, X, Z, (px_ - 0.012, pz_ + 0.004), tp, 'Borjomi_ParkCable', col='jkR', n_cab=2, h=0.022)
    ferris(g, X, Z, tp[0] - 0.012, tp[1] + 0.014, R=0.016, n=8, ry=0.3, name='Borjomi_Wheel', cab_mat='jkB')
    place(g + ':Likani', likani(), X, Z, -0.03, -0.09, ry=0.2, foot=0.016)
    # Bakuriani above, under snow
    bk = (0.07, 0.06)
    houses(g, X, Z, 12, lambda: chalet(0.016, 0.013, 0.014, pick(['chalet', 'balc', 'plaster']), pick(['tinR', 'tinG', 'tin']), snow=rng.random() < 0.6), (bk[0] - 0.03, 0.06, bk[1] - 0.02, 0.04), 'bak', mind=0.021)
    t1 = find_spot(X, Z, 0.12, 0.11, 0.035, 'high'); t2 = find_spot(X, Z, 0.03, 0.12, 0.03, 'high')
    lift_line(g, X, Z, (bk[0] + 0.02, bk[1] + 0.01), t1, kind='gondola', n_cab=6, col='jkR', towers=3, prefix='Didveli')
    lift_line(g, X, Z, (bk[0] - 0.02, bk[1] + 0.02), t2, kind='chair', n_cab=6, towers=2, prefix='Kokhta')
    ski_run(g, X, Z, [t1, ((t1[0] + bk[0]) / 2 + 0.02, (t1[1] + bk[1]) / 2 + 0.02), (bk[0] + 0.03, bk[1] + 0.016)], 'Didveli', n=3)
    ski_run(g, X, Z, [t2, ((t2[0] + bk[0]) / 2 - 0.02, (t2[1] + bk[1]) / 2 + 0.01), (bk[0] - 0.024, bk[1] + 0.024)], 'Kokhta', n=2, phase=0.5)
    # the Kukushka line: Borjomi station up the hillside to Bakuriani
    rail = [(0.02, -0.03), (0.04, -0.01), (0.03, 0.02), (0.05, 0.03), (0.045, 0.05), (0.06, 0.05)]
    Cr = [tuple(c) for c in catmull([(X + p[0] * LM, Z + p[1] * LM) for p in rail], 60)]
    track(g + ':Rail', X, Z, Cr, gauge=0.9)
    for c in Cr[::3]: OCC.append((c[0], c[1], 0.005 * LM))
    for k, (key, make) in enumerate((('kuk_loco', kukushka_loco), ('kuk_car', kukushka_car), ('kuk_car', kukushka_car))):
        ob = anim_inst('Kukushka_%d' % (k + 1), key, make, mat4(Cr[0][0], ground3(*Cr[0]), Cr[0][1], s=LM), g)
        off = k * 0.07
        tt = lambda u, off=off: 0.08 + 0.84 * (0.5 - 0.5 * math.cos(2 * PI * u)) - off
        k_track(ob, g, lambda u, tt=tt: along(Cr, max(0.0, tt(u)), False), step=2, lift=0.0012 * LM, tol=0.0005,
                dirfn=lambda u, tt=tt: (lambda a, b: (b[0] - a[0], b[1] - a[1]))(along(Cr, max(0.0, tt(u) - 0.01), False), along(Cr, min(1.0, tt(u) + 0.01), False)))
    def bo_trees(hm, dry, n1, h): return snow_fir(h * 1.05) if hm > 1500 else t_conifer(h * 1.1, pick(['spruce', 'spruceD', 'pineT']))
    forest(g, X, Z, 0.16, dens=1.2, scatter=0.15, ox=0.02, oz=0.02, kinds=bo_trees, avoid=[(px_, pz_, 0.015), (-0.03, -0.09, 0.03), (bk[0], bk[1], 0.035), (t1[0], t1[1], 0.015), (t2[0], t2[1], 0.015)])


def build_rabati():
    """Rabati castle over Akhaltsikhe: its crenellated walls and towers climbing the hill, the Ahmadiyya mosque with
    its gilded dome and minaret, the Jakeli palace, St Marine's church and the citadel keep"""
    g, X, Z = _site('Rabati')
    cx_, cz_ = 0.0, -0.03
    ring = [(cx_ + math.cos(k / 10 * 2 * PI) * 0.045, cz_ + math.sin(k / 10 * 2 * PI) * 0.032) for k in range(10)]
    fort_wall(g, X, Z, ring, h=0.009, mat='stoneAl', towers=range(0, 10, 2), tower_w=0.0085, tower_h=0.017)
    place(g, [(box(0.016, 0.01, 0.016), 'stoneAl'), (T(cyl(0.0068, 0.003, 12), y=0.01), 'stoneAl'), (T(dome(0.0074, 12, 3), y=0.013), 'gold2'), (T(box(0.0006, 0.004, 0.0006), y=0.0204), 'gold2'),
              (T(cyl(0.0018, 0.032, 8), 0.011, 0, 0.007), 'stoneS'), (T(cyl(0.0026, 0.0012, 8), 0.011, 0.024, 0.007), 'stoneS'), (T(cone(0.002, 0.008, 8), 0.011, 0.032, 0.007), 'gold2')],
          X, Z, cx_ - 0.012, cz_ + 0.008, ry=0.2, foot=0.012)
    place(g, [(box(0.03, 0.014, 0.012), 'stoneAl'), (T(box(0.031, 0.0012, 0.013), y=0.014), 'stoneD')] + [(T(arch_win(0.003, 0.007), x, 0.0, 0.0062), 'ink') for x in np.linspace(-0.012, 0.012, 5)],
          X, Z, cx_ + 0.016, cz_ + 0.014, ry=-0.1, foot=0.012)
    place(g, xchurch(L=0.018, B=0.01, C=0.016, H=0.011, R=0.0042, DH=0.008, CH=0.007, wall='stoneAl', roof='stoneD', cross_s=0.6), X, Z, cx_ + 0.02, cz_ - 0.012, foot=0.01)
    hx, hz = find_spot(X, Z, cx_, cz_ - 0.012, 0.015, 'high')
    place(g, tower_sq(0.012, 0.036, 'stoneAl'), X, Z, hx, hz, foot=0.01)
    flag(g, X, Z, hx + 0.002, hz)
    houses(g, X, Z, 16, lambda: town_house(0.015, 0.013, 0.012, pick(['plaster', 'stoneAl', 'plasterY', 'balc']), pick(['tin', 'tinR']), balcony=rng.random() > 0.5), (-0.08, 0.16, 0.015, 0.07), 'akh', mind=0.021)
    walkers(g, X, Z, [(cx_ - 0.03, cz_), (cx_, cz_ + 0.018), (cx_ + 0.03, cz_), (cx_, cz_ - 0.02)], 'Rabati', n=2)
    forest(g, X, Z, 0.13, dens=0.7, scatter=0.1, avoid=[(cx_, cz_, 0.06)])


def build_khertvisi():
    """Khertvisi fortress on its rock where the Paravani meets the Mtkvari: walls stepping down the ridge, the tall keep"""
    g, X, Z = _site('Khertvisi')
    pts = [(-0.02, -0.006), (-0.006, -0.012), (0.012, -0.008), (0.022, 0.004), (0.006, 0.01), (-0.014, 0.008)]
    fort_wall(g, X, Z, pts, h=0.008, mat='stoneG', towers=(1, 3, 5), tower_w=0.007, tower_h=0.014)
    hx, hz = find_spot(X, Z, 0.0, 0.0, 0.012, 'high')
    place(g, tower_sq(0.011, 0.034, 'stoneG'), X, Z, hx, hz, foot=0.008)
    place(g, hall_church(0.012, 0.007, 0.007, 'stoneG', 'stoneD', belfry=False), X, Z, hx - 0.012, hz + 0.004, foot=0.008)
    flag(g, X, Z, hx, hz - 0.002)


def build_paravani():
    """Lake Paravani on the Javakheti plateau, the largest in Georgia: St Nino's convent at Poka on the shore,
    basalt villages, fishermen's boats out on the water, flocks on the grass, the Abul volcano behind"""
    g, X, Z = _site('Paravani')
    y = lake_water(g, X, Z, 'Paravani', 0.04, -0.01, 0.055, 0.034, ang=0.2, mat='water')
    if y is not None:
        for k in range(3):
            boat_loop(g, 'Paravani_Boat%d' % (k + 1), 'rowboat_p%d' % (k % 2), lambda k=k: rowboat(['white', 'blue'][k % 2], people=1 + k % 2), X, Z, 0.04 + 0.02 * (k - 1), -0.01 + 0.008 * k,
                      0.02 - 0.004 * k, 0.012, y=y, turns=1 if k % 2 else -1, phase=k * 2.0, roll=0.02, ang=0.2)
    nx_, nz_ = find_spot(X, Z, 0.07, 0.04, 0.02, 'flat')
    place(g, hall_church(0.016, 0.009, 0.01, 'stoneGeD', 'stoneGe') + [(T(g_, -0.016, 0, 0.008), m_) for g_, m_ in campanile(0.007, 0.02, 'stoneGeD', 'stoneGe')], X, Z, nx_, nz_, ry=0.3, foot=0.01)
    houses(g, X, Z, 12, lambda: [(box(0.016, 0.008, 0.013), 'stoneGeD'), (T(box(0.017, 0.0014, 0.014), y=0.008), 'stoneGe'), (T(rect_win(0.0026, 0.003), 0.003, 0.003, 0.0066), 'ink'),
                                (T(rect_win(0.003, 0.005), -0.004, 0, 0.0066), 'balcB')], (0.06, 0.09, 0.04, 0.06), 'jav', mind=0.021)
    flock_walk(g, 'Paravani_Flock', X, Z, [(-0.04, 0.05), (-0.01, 0.07), (0.02, 0.06), (-0.02, 0.04)], seed=4)
    gulls(g, 'Paravani', X, Z, 0.03, -0.01, r=0.05, n=2)


def build_dmanisi():
    """Dmanisi on its promontory between two rivers: the citadel walls, the 6th-century Sioni basilica, the medieval
    town's ruined streets, and the shelter over the dig where the oldest Europeans were found; a flock goes by"""
    g, X, Z = _site('Dmanisi')
    px_, pz_ = find_spot(X, Z, 0.01, -0.02, 0.02, 'high')
    ring = [(px_ + math.cos(k / 8 * 2 * PI) * 0.034, pz_ + math.sin(k / 8 * 2 * PI) * 0.024) for k in range(8)]
    fort_wall(g, X, Z, ring, h=0.007, mat='stoneGe', towers=(0, 2, 4, 6), tower_w=0.007, tower_h=0.013)
    place(g, basilica(0.028, 0.012, 0.012, 'stoneGeD', 'stoneGe'), X, Z, px_ - 0.006, pz_ + 0.004, ry=0.0, foot=0.012)
    for k in range(9):   # the ruined town: low walls of houses and lanes
        dx, dz = px_ + 0.03 + (k % 3) * 0.012, pz_ - 0.01 + (k // 3) * 0.012
        safe(g, [(T(box(0.009, 0.0024, 0.0008), 0, 0, -0.004), 'stoneGe'), (T(box(0.009, 0.0018, 0.0008), 0, 0, 0.004), 'stoneGe'), (T(box(0.0008, 0.0022, 0.008), -0.0045, 0, 0), 'stoneGe')],
             X, Z, dx, dz, ry=rng.random() * 0.4, foot=0, occ=False)
    place(g, [(T(box(0.0008, 0.008, 0.0008), x, 0, z), 'steel') for x in (-0.009, 0.009) for z in (-0.007, 0.007)] + [(T(gable(0.024, 0.005, 0.02), y=0.008), 'tent'), (box(0.014, 0.0006, 0.01), 'ink')],
          X, Z, px_ - 0.02, pz_ + 0.03, ry=0.3, foot=0.006)
    walkers(g, X, Z, [(px_ - 0.026, pz_ + 0.026), (px_ - 0.014, pz_ + 0.034)], 'Dmanisi', n=2, closed=False)
    flock_walk(g, 'Dmanisi_Flock', X, Z, [(-0.06, 0.05), (-0.02, 0.07), (0.03, 0.06), (0.0, 0.04)], seed=7)
    eagles(g, 'Dmanisi', X, Z, 0.0, 0.0, r=0.07, h=0.3, n=1)


# ------------------------------------------------------------------------------------------------ Mtskheta-Mtianeti, Khevsureti
def jvari():
    """Jvari (586-605): the tetraconch on the hill over Mtskheta, grey stone, a low octagonal drum and stone cone"""
    P = [(box(0.026, 0.014, 0.014), 'stoneG'), (box(0.014, 0.014, 0.026), 'stoneG')]
    for a in range(4): P.append((T(cyl(0.0068, 0.012, 8), math.sin(a * PI / 2) * 0.012, 0, math.cos(a * PI / 2) * 0.012), 'stoneG'))
    P += [(T(gable(0.015, 0.005, 0.027), y=0.014), 'stoneD'), (T(gable(0.015, 0.005, 0.027), y=0.014, ry=PI / 2), 'stoneD'),
          (T(cyl(0.0068, 0.008, 8), y=0.016), 'stoneG'), (T(cone(0.0074, 0.008, 8), y=0.024), 'stoneD')] + gold_cross(0.0315, 0.7)
    return P

def build_mtskheta():
    """Mtskheta at the meeting of the Aragvi and the Mtkvari: Svetitskhoveli cathedral inside its walls and towers,
    Samtavro, the old town; Jvari on its hill across the river; traffic on the road in"""
    g, X, Z = _site('MtskhetaSite')
    place(g + ':Svetitskhoveli', xchurch(L=0.06, B=0.026, C=0.05, H=0.032, R=0.0105, DH=0.024, CH=0.02, n=12, wall='sandst', roof='tileD', low_annex=0.6, rise=0.38, cross_s=1.0),
          X, Z, -0.02, 0.0, ry=0.0, foot=0.03)
    ring = [(-0.058, -0.032), (-0.02, -0.036), (0.018, -0.032), (0.022, 0.0), (0.018, 0.03), (-0.02, 0.034), (-0.058, 0.03), (-0.062, 0.0)]
    fort_wall(g, X, Z, ring, h=0.008, mat='sandst', towers=(0, 2, 4, 6), tower_w=0.007, tower_h=0.014)
    place(g, tower_sq(0.009, 0.018, 'sandst') + [(T(arch_win(0.004, 0.008), 0, 0, 0.0047), 'ink')], X, Z, -0.062, 0.0, ry=PI / 2, foot=0.006)
    place(g, xchurch(L=0.024, B=0.012, C=0.02, H=0.015, R=0.005, DH=0.01, CH=0.009, wall='stoneAl', roof='tin', cross_s=0.7) + [(T(g_, -0.02, 0, 0.006), m_) for g_, m_ in campanile(0.008, 0.024, 'stoneAl', 'tin')],
          X, Z, -0.05, -0.065, ry=0.1, foot=0.012)
    jx, jz = find_spot(X, Z, 0.06, -0.02, 0.02, 'high')
    place(g + ':Jvari', jvari(), X, Z, jx, jz, ry=0.0, foot=0.016)
    wall_line(g, X, Z, [(jx - 0.022, jz - 0.016), (jx + 0.02, jz - 0.018), (jx + 0.022, jz + 0.016), (jx - 0.02, jz + 0.018)], h=0.004, th=0.003, mat='stoneG', closed=True)
    houses(g, X, Z, 16, lambda: town_house(0.015 + rng.random() * 0.005, 0.012, 0.012, pick(['plaster', 'balc', 'stoneAl', 'plasterY']), pick(['tin', 'tinR', 'tile']), balcony=True),
           (-0.11, 0.1, -0.06, 0.13), 'mts', mind=0.021, pack=0.45)
    for k in range(6): safe(g, cypress(0.036), X, Z, -0.05 + k * 0.012, 0.04 + (k % 2) * 0.008, foot=0, occ=False)
    forest(g, X, Z, 0.12, dens=0.7, scatter=0.1, avoid=[(-0.02, 0.0, 0.06), (jx, jz, 0.03)])
    C, _ = chan_world('mt_road')
    traffic(g, 'Mtskheta_Bus', 'marsh_y', lambda: marshrutka('jkY'), C, n=1, closed=False)
    traffic(g, 'Mtskheta_Car', 'sedan_r', lambda: sedan('carR'), C, n=2, closed=False, reverse=True, phase=0.2)
    walkers(g, X, Z, [(-0.055, 0.02), (-0.02, 0.025), (0.012, 0.02), (0.012, -0.02), (-0.05, -0.025)], 'Mtskheta', n=3)
    flag(g, X, Z, -0.062, -0.006)


def build_ananuri():
    """Ananuri on the Zhinvali reservoir: the fortress with its two churches (the Assumption, richly carved; the
    Saviour), the square Sheupovari tower with its pyramid roof, the round tower, the crenellated walls; the Military
    Highway along the shore with its lorries; boats on the turquoise water"""
    g, X, Z = _site('AnanuriSite')
    y = lake_water(g, X, Z, 'AnanuriSite', -0.012, 0.04, 0.026, 0.05, ang=-0.25, mat='lakeT')
    fx, fz = 0.012, -0.03
    ring = [(fx - 0.03, fz - 0.02), (fx, fz - 0.026), (fx + 0.026, fz - 0.016), (fx + 0.022, fz + 0.016), (fx - 0.004, fz + 0.022), (fx - 0.03, fz + 0.014)]
    fort_wall(g, X, Z, ring, h=0.009, mat='stoneG', towers=(1, 3, 5), tower_w=0.0075, tower_h=0.016, roof='stoneD')
    place(g + ':Fortress', xchurch(L=0.03, B=0.015, C=0.026, H=0.019, R=0.0062, DH=0.013, CH=0.012, n=8, wall='stoneAl', roof='stoneD', cross_s=0.8), X, Z, fx - 0.004, fz - 0.002, ry=0.1, foot=0.016)
    place(g + ':Fortress', xchurch(L=0.018, B=0.01, C=0.016, H=0.012, R=0.0042, DH=0.008, CH=0.008, wall='brickR', roof='stoneD', cross_s=0.6), X, Z, fx + 0.015, fz + 0.006, ry=0.1, foot=0.012)
    place(g + ':Fortress', tower_sq(0.012, 0.036, 'stoneG', roof='stoneD', crenel=False), X, Z, fx - 0.024, fz - 0.014, foot=0.01)
    place(g + ':Fortress', tower_round(0.0055, 0.02, 'stoneG', roof='stoneD'), X, Z, fx + 0.024, fz - 0.014, foot=0.008)
    for k in range(4): safe(g, [(box(0.008, 0.005, 0.006), 'balc'), (T(box(0.01, 0.0008, 0.008), y=0.005), pick(['umbR', 'umbB', 'jkY']))], X, Z, fx + 0.045, fz - 0.02 + k * 0.01, foot=0.004)
    C, _ = chan_world('an_hwy')
    traffic(g, 'Ananuri_Lorry', 'lorry_b', lambda: lorry('white', 'cnB'), C, n=2, closed=False, laps=1.0)
    traffic(g, 'Ananuri_LorryS', 'lorry_r', lambda: lorry('cnR', 'concreteD'), C, n=1, closed=False, reverse=True, phase=0.3)
    traffic(g, 'Ananuri_Bus', 'marsh_w', lambda: marshrutka('carW'), C, n=1, closed=False, reverse=True, phase=0.7)
    if y is not None:
        boat_loop(g, 'Zhinvali_Boat1', 'rowboat_0', lambda: rowboat('white'), X, Z, -0.012, 0.05, 0.012, 0.03, y=y, turns=1, roll=0.02, ang=-0.25)
        boat_loop(g, 'Zhinvali_Boat2', 'parasail_b', lambda: scaled([(g_, m_) for g_, m_ in _hull(7.0, 2.4, 1.0, sheer=0.3, top_mat='white', keel_mat='jkR', deck_mat='white')] + [(T(box(1.2, 0.9, 1.6), 0.4, 0.8, 0), 'glassD')], M_ * 0.5),
                  X, Z, -0.015, 0.03, 0.015, 0.04, y=y, turns=-2, phase=1.0, roll=0.03, ang=-0.25)
    forest(g, X, Z, 0.12, dens=1.0, scatter=0.15, avoid=[(fx, fz, 0.04), (-0.012, 0.04, 0.06)])
    flag(g, X, Z, fx - 0.024, fz - 0.02)


def friendship_monument():
    """the Russia-Georgia Friendship Monument (1983) over the Devil's Valley: a semicircular concrete wall on its
    platform at the cliff edge, the inside covered in a bright tile mosaic"""
    P = [(cyl(0.022, 0.002, 16), 'concrete')]
    n = 12
    for k in range(n):
        a0, a1 = PI * k / n, PI * (k + 1) / n; am = (a0 + a1) / 2
        L = 2 * 0.017 * math.sin(PI / n / 2) * 1.02
        P.append((T(box(L, 0.012, 0.0022), math.cos(am) * 0.017, 0.002, -math.sin(am) * 0.017, ry=am + PI / 2), 'concrete'))
        P.append((T(box(L * 0.96, 0.009, 0.0004), math.cos(am) * 0.0158, 0.0035, -math.sin(am) * 0.0158, ry=am + PI / 2), ['mosB', 'mosY', 'mosR', 'mosG'][k % 4]))
    return P

def build_gudauri():
    """Gudauri: the ski slopes under snow, a gondola and chairlifts, skiers and boarders coming down, tandem
    paragliders circling over the valley; the Friendship Monument on the cliff over the Devil's Valley; the hotels;
    lorries crawling up the hairpins of the Military Highway"""
    g, X, Z = _site('GudauriSite')
    bot = find_spot(X, Z, 0.02, 0.02, 0.02, 'flat')
    t1 = find_spot(X, Z, -0.07, -0.05, 0.03, 'high'); t2 = find_spot(X, Z, -0.06, 0.04, 0.035, 'high'); t3 = find_spot(X, Z, -0.01, -0.08, 0.03, 'high')
    lift_line(g, X, Z, bot, t1, kind='gondola', n_cab=8, col='jkR', towers=4, prefix='Gudauri')
    lift_line(g, X, Z, (bot[0] - 0.01, bot[1] + 0.02), t2, kind='chair', n_cab=7, towers=3, prefix='GudauriChairA')
    lift_line(g, X, Z, (bot[0] + 0.004, bot[1] - 0.025), t3, kind='chair', n_cab=6, towers=3, prefix='GudauriChairB')
    ski_run(g, X, Z, [t1, ((t1[0] + bot[0]) / 2 - 0.02, (t1[1] + bot[1]) / 2 + 0.02), (bot[0] - 0.012, bot[1] + 0.004)], 'GudauriA', n=3)
    ski_run(g, X, Z, [t1, ((t1[0] + bot[0]) / 2 + 0.015, (t1[1] + bot[1]) / 2 - 0.025), (bot[0] - 0.006, bot[1] - 0.012)], 'GudauriB', n=2, phase=0.3)
    ski_run(g, X, Z, [t2, ((t2[0] + bot[0]) / 2 - 0.01, (t2[1] + bot[1]) / 2 + 0.02), (bot[0] - 0.016, bot[1] + 0.024)], 'GudauriC', n=3, phase=0.6)
    ski_run(g, X, Z, [t3, ((t3[0] + bot[0]) / 2 - 0.02, (t3[1] + bot[1]) / 2), (bot[0] - 0.004, bot[1] - 0.03)], 'GudauriD', n=2, phase=0.15)
    houses(g, X, Z, 8, lambda: batumi_block(0.016, 0.013, 4 + rng.randrange(4), pick(['plaster', 'chalet', 'stoneS']), 'ink', crown=lambda w, d, h: [(T(gable(d * 1.2, 0.008, w * 1.1), y=h, ry=PI / 2), 'snow')]),
           (bot[0] + 0.01, 0.05, bot[1] - 0.01, 0.05), 'gud', mind=0.024, pack=0.5)
    houses(g, X, Z, 10, lambda: chalet(0.015, 0.012, 0.013, pick(['chalet', 'balc']), pick(['tinR', 'tinG']), snow=rng.random() < 0.7), (bot[0] + 0.0, 0.07, bot[1] + 0.02, 0.06), 'gud2', mind=0.021)
    mx, mz = find_spot(X, Z, 0.09, -0.02, 0.025, 'high')
    place(g + ':Monument', friendship_monument(), X, Z, mx, mz, ry=PI / 2, foot=0.02)
    C, _ = chan_world('gu_hwy')
    traffic(g, 'Gudauri_Lorry', 'lorry_b', lambda: lorry('white', 'cnB'), C, n=2, closed=False)
    traffic(g, 'Gudauri_LorryS', 'lorry_r', lambda: lorry('cnR', 'concreteD'), C, n=1, closed=False, reverse=True, phase=0.5)
    h0 = ground3(X, Z)
    for k, cols in enumerate((('jkR', 'white'), ('jkY', 'jkB'), ('jkT', 'white'))):
        k_orbit_glider(g, 'Gudauri_Paraglider%d' % (k + 1), (X + (0.04 - 0.03 * k) * LM, Z + (0.0 + 0.03 * k) * LM), (0.03 + 0.01 * k) * LM, h0 + 0.16 + 0.04 * k,
                       lambda cols=cols: paraglider(cols), turns=1 if k % 2 == 0 else -1, phase=k * 2.0, key='glider_%d' % k)
    forest(g, X, Z, 0.14, dens=0.8, scatter=0.1, kinds=lambda hm, dry, n1, h: snow_fir(h * 1.05) if hm > 1600 else t_conifer(h, 'spruce'),
           avoid=[(bot[0], bot[1], 0.04), (t1[0], t1[1], 0.02), (t2[0], t2[1], 0.02), (t3[0], t3[1], 0.02), (mx, mz, 0.025)])


def khevsur_tower(H, w=0.013):
    """a Khevsur tower (Shatili): dry-laid slate, a strong batter, a flat roof of slabs, slit windows, a wooden gallery"""
    top = w * 0.8
    P = [(sq(top / 2, w / 2, H), 'stoneTu'), (T(box(top * 1.14, 0.0016, top * 1.14), y=H), 'slateTu')]
    for f in range(4):
        a = f * PI / 2
        for r in range(3): P.append((T(rect_win(0.0011, 0.0024), math.sin(a) * (w * 0.47), H * (0.3 + r * 0.22), math.cos(a) * (w * 0.47), ry=a), 'ink'))
    P += [(T(box(top * 0.9, 0.0008, 0.0036), 0, H * 0.8, top / 2 + 0.0018), 'balc'), (T(box(top * 0.9, 0.0022, 0.0005), 0, H * 0.8 + 0.0008, top / 2 + 0.0034), 'balc')]
    return P

def build_shatili():
    """Shatili, the fortress-village of Khevsureti: some sixty towers of dark slate stacked into one wall on the
    slope above the Argun; Mutso on its crag downstream; riders on the track; eagles"""
    g, X, Z = _site('Shatili')
    for k in range(16):
        dx, dz = -0.024 + (k % 5) * 0.011 + rng.random() * 0.002, -0.014 + (k // 5) * 0.011
        safe(g, khevsur_tower(0.03 + rng.random() * 0.026 - (k // 5) * 0.004), X, Z, dx, dz, ry=rng.random() * 0.2, foot=0.012, pad=0.0)
    mx, mz = find_spot(X, Z, 0.07, 0.05, 0.03, 'high')
    for k in range(5): safe(g, tush_tower(0.03 + rng.random() * 0.012, w=0.011), X, Z, mx + (k % 3) * 0.01 - 0.01, mz + (k // 3) * 0.01, foot=0.01, pad=0.0)
    for k in range(2):
        ob = anim_inst('Shatili_Rider%d' % (k + 1), 'rider_%d' % k, lambda k=k: rider('ink' if k == 0 else 'balcD', horse_col=['horse', 'horseD'][k]), mat4(X, ground3(X, Z), Z, s=LM), g)
        path = [(X + p[0] * LM, Z + p[1] * LM) for p in ((-0.06, 0.05), (-0.02, 0.04), (0.02, 0.05), (0.05, 0.04), (0.08, 0.05))]
        k_track(ob, g, lambda u, k=k: along(path, 1 - abs(1 - 2 * ((u + k * 0.45) % 1.0)), False), step=4, tol=0.0006, pitch=True)
    flag(g, X, Z, 0.02, -0.022)
    forest(g, X, Z, 0.12, dens=0.6, scatter=0.05, kinds=lambda hm, dry, n1, h: t_birch(h * 0.9) if rng.random() < 0.5 else t_pine(h, 'pineT'), avoid=[(0.0, 0.0, 0.04), (mx, mz, 0.025)])
    eagles(g, 'Shatili', X, Z, 0.0, 0.0, r=0.07, h=0.3, n=2)


# ------------------------------------------------------------------------------------------------ Kakheti
def build_lavra():
    """David Gareja: the Lavra monastery at the foot of its cliff of cave cells, the walls and the tower; Udabno's
    cave chapels along the ridge above; the semi-desert's striped red, ochre and violet hills; shepherds' flocks;
    vultures overhead; a jeep on the dirt road"""
    g, X, Z = _site('Lavra')
    vardzia_cliff(g, X, Z, 0.01, -0.04, 0.02, hgt=0.04)
    place(g, hall_church(0.02, 0.011, 0.012, 'sandst', 'tile') + [(T(g_, -0.02, 0, 0.012), m_) for g_, m_ in campanile(0.008, 0.026, 'sandst', 'tile')], X, Z, 0.04, -0.012, ry=PI / 2, foot=0.012)
    wall_line(g, X, Z, [(0.025, -0.04), (0.065, -0.04), (0.068, 0.02), (0.025, 0.022)], h=0.006, th=0.003, mat='sandst', closed=False)
    place(g, tower_sq(0.009, 0.02, 'sandst'), X, Z, 0.066, -0.04, foot=0.008)
    for k in range(16):   # the striped hills
        dx, dz = -0.1 + rng.random() * 0.2, 0.03 + rng.random() * 0.06
        if abs(dx - 0.04) < 0.03 and dz < 0.03: continue
        R_, el = 0.008 + rng.random() * 0.007, 1.4 + rng.random() * 0.9; n_ = 5
        layers = [(T(cyl(R_ * (1 - (i + 1) / (n_ + 0.4)), 0.0034, 7, R_ * (1 - i / (n_ + 0.4))), y=i * 0.0034, s=(el, 1, 1)), ['gareR', 'gareY', 'gareP', 'gareY', 'gareR'][(i + k) % 5]) for i in range(n_)]
        safe(g, layers, X, Z, dx, dz, ry=rng.random() * 0.6, foot=0.01, occ=False)
    for k in range(10):   # Udabno: cave mouths along the ridge
        safe(g, [(box(0.006, 0.006, 0.004), 'sandst'), (T(arch_win(0.003, 0.004), 0, 0, 0.0021), 'ink')], X, Z, -0.09 + k * 0.01, -0.06 + 0.004 * math.sin(k), ry=PI, foot=0.004)
    flock_walk(g, 'Gareja_Flock1', X, Z, [(-0.08, 0.06), (-0.04, 0.08), (0.0, 0.07), (-0.04, 0.05)], seed=11)
    flock_walk(g, 'Gareja_Flock2', X, Z, [(0.06, 0.05), (0.1, 0.06), (0.09, 0.03)], seed=12, laps=1.0)
    path = [(X + p[0] * LM, Z + p[1] * LM) for p in ((0.12, 0.08), (0.08, 0.04), (0.05, 0.02), (0.035, 0.0))]
    ribbon(g + ':Roads', X, Z, [((p[0] - X) / LM, (p[1] - Z) / LM) for p in path], 0.006, 'path', 0.0012, n=30)
    ob = anim_inst('Gareja_Jeep', 'uaz', uaz_bukhanka, mat4(path[0][0], ground3(*path[0]), path[0][1], s=LM * 0.6), g)
    k_track(ob, g, lambda u: along(path, 0.05 + 0.9 * (1 - abs(1 - 2 * u)), False), step=4, tol=0.0006, pitch=True)
    eagles(g, 'Gareja', X, Z, 0.0, 0.0, r=0.08, h=0.28, n=2)


def build_lagodekhi():
    """Lagodekhi: the town at the foot of the Caucasus, the reserve's old forest climbing behind, the Ninoskhevi
    waterfall at the end of its trail with walkers on the way, and the ruined Machi fortress on its ridge"""
    g, X, Z = _site('Lagodekhi')
    houses(g, X, Z, 16, lambda: town_house(0.015 + rng.random() * 0.005, 0.013, 0.012, pick(['plaster', 'plasterY', 'brickR', 'balc']), pick(['tin', 'tinR', 'tile']), balcony=rng.random() > 0.4),
           (-0.08, 0.12, 0.02, 0.07), 'lag', mind=0.021)
    place(g, [(box(0.02, 0.01, 0.012), 'balc'), (T(gable(0.014, 0.006, 0.022), y=0.01, ry=PI / 2), 'tinG')], X, Z, 0.02, 0.005, foot=0.01)
    wf = find_spot(X, Z, 0.05, -0.05, 0.03, 'high')
    waterfall(g, X, Z, wf[0], wf[1], 0.034, 0.007, -0.6, 'Ninoskhevi')
    walkers(g, X, Z, [(0.02, 0.0), (0.03, -0.02), (wf[0] - 0.01, wf[1] + 0.014)], 'Lagodekhi', n=3, closed=False)
    mx, mz = find_spot(X, Z, -0.04, -0.07, 0.03, 'high')
    place(g, tower_round(0.006, 0.018, 'stoneG') + [(T(box(0.024, 0.006, 0.003), 0.014, 0, 0.004), 'stoneG')], X, Z, mx, mz, foot=0.008)
    forest(g, X, Z, 0.14, dens=1.6, scatter=0.3, kinds=lambda hm, dry, n1, h: t_broad(h * 1.15, pick(['beech', 'oakD', 'walnut', 'oak'])), avoid=[(wf[0], wf[1], 0.016), (0.0, 0.05, 0.05)])
    eagles(g, 'Lagodekhi', X, Z, 0.0, -0.04, r=0.07, h=0.3, n=1)

# ------------------------------------------------------------------------------------------------ Abkhazia, the Tskhinvali region
def build_sukhumi():
    """Sukhumi on its bay: the palm-lined embankment, the old pier with its pavilion, the ruins of the Sukhumi fortress
    (Dioscurias) at the water's edge, the colonnaded hotel and the town climbing the hills behind; boats in the bay"""
    g, X, Z = _site('SukhumiBay'); at = coast_frame('SukhumiBay')
    shore2(g, X, Z, at, -0.06, 0.06, [(0.0, 0.006, 'pebble', 0.0012), (0.007, 0.011, 'stoneS', 0.0014), (0.011, 0.016, 'lawn', 0.0016)])
    for k, s_ in enumerate(np.arange(-0.056, 0.058, 0.009)):
        place(g, palm(0.04 + rng.random() * 0.01, (rng.random() - 0.5) * 0.3, rng.random() * 6), X, Z, *at(s_, 0.0095), foot=0, occ=False)
        if k % 2: place(g, [(cyl(0.0006, 0.012, 4), 'ink'), (T(ball(0.0016, 5, 3), y=0.012), 'lamp')], X, Z, *at(s_ + 0.004, 0.013), foot=0, occ=False)
    # the pier out into the bay and its pavilion
    p0 = np.array(at(0.0)); p1 = np.array(at(0.0, -0.05)); d = p1 - p0; ang = -math.atan2(d[1], d[0])
    for k in range(6):
        q = p0 + d * (k + 0.5) / 6
        emit(g + ':Pier', 'stoneS', T(box(0.0092, 0.004, 0.006), 0, -0.0028, 0, ry=ang), sea_M(X, Z, q[0], q[1], y=SEA_Y + 0.0012))
    emit(g + ':Pier', 'white', T(box(0.012, 0.007, 0.01), 0, 0.0012, 0, ry=ang), sea_M(X, Z, p1[0], p1[1], y=SEA_Y + 0.0012))
    emit(g + ':Pier', 'tinG', T(hip(0.013, 0.011, 0.004), 0, 0.0082, 0, ry=ang), sea_M(X, Z, p1[0], p1[1], y=SEA_Y + 0.0012))
    fx, fz = at(0.035, 0.004)
    wall_line(g, X, Z, [(fx + math.cos(a) * 0.012, fz + math.sin(a) * 0.009) for a in np.linspace(0, 2 * PI, 9)[:-1]], h=0.004, th=0.003, mat='stoneG', closed=True, crenel=True)
    hx, hz = at(-0.02, 0.03)
    place(g, [(box(0.04, 0.016, 0.014), 'plasterY'), (T(hip(0.042, 0.016, 0.005), y=0.016), 'tin')] + [(T(cyl(0.0011, 0.014, 6), x, 0, 0.0085), 'white') for x in np.linspace(-0.016, 0.016, 7)] +
          [(T(box(0.04, 0.0016, 0.004), 0, 0.014, 0.0085), 'white')], X, Z, hx, hz, ry=-math.atan2(*(np.array(at(-0.01)) - np.array(at(-0.03)))[::-1]), foot=0.014)
    cx_, cz_ = at(0.01, 0.06)
    place(g, xchurch(L=0.024, B=0.012, C=0.02, H=0.015, R=0.005, DH=0.01, CH=0.009, wall='stoneAl', roof='tinG', cross_s=0.7), X, Z, cx_, cz_, ry=0.2, foot=0.012)
    houses(g, X, Z, 22, lambda: town_house(0.015 + rng.random() * 0.007, 0.013, 0.012 + rng.random() * 0.006, pick(['plaster', 'plasterY', 'plasterP', 'plasterB', 'stoneS']), pick(['tile', 'tin', 'tinR']), balcony=rng.random() > 0.4, hipped=True),
           (0.0, 0.1, 0.0, 0.08), 'suk', mind=0.021, pack=0.45)
    def su_trees(hm, dry, n1, h): return t_broad(h, pick(['eucal', 'leaf', 'oak', 'beech'])) if hm < 500 else t_conifer(h * 1.1, 'spruce')
    forest(g, X, Z, 0.12, dens=1.0, scatter=0.2, ox=0.02, oz=-0.03, kinds=su_trees, avoid=[(cx_, cz_, 0.02), (hx, hz, 0.025)])
    sx, sz = at(0.0, -0.08)
    for k in range(3):
        boat_loop(g, 'Sukhumi_Boat%d' % (k + 1), ['yacht', 'fishing', 'yacht'][k], [yacht, fishing_boat, yacht][k], X, Z, sx - 0.02 * k, sz + 0.03 * (k - 1), 0.025, 0.014, turns=1 if k % 2 else -1, phase=k * 2.1, roll=0.04, ang=0.5)
    walkers(g, X, Z, [at(-0.05, 0.009), at(0.05, 0.009)], 'Sukhumi', n=3, closed=False)
    gulls(g, 'Sukhumi', X, Z, sx, sz, n=2)


def new_athos_cathedral():
    """St Panteleimon's at New Athos (1888): white walls, five green onion domes, the tall arched windows"""
    P = [(box(0.034, 0.02, 0.026), 'white'), (T(box(0.035, 0.0016, 0.027), y=0.02), 'tinG')]
    P += [(T(arch_win(0.003, 0.009), x, 0.004, 0.0132), 'ink') for x in (-0.011, 0.0, 0.011)] + [(T(arch_win(0.003, 0.009), x, 0.004, -0.0132), 'ink') for x in (-0.011, 0.0, 0.011)]
    P += [(T(g_, 0, 0.0216, 0), m_) for g_, m_ in onion(0.0058, 'tinG')]
    for sx in (-1, 1):
        for sz in (-1, 1): P += [(T(g_, sx * 0.011, 0.0216, sz * 0.0085), m_) for g_, m_ in onion(0.0034, 'tinG')]
    return P

def build_new_athos():
    """New Athos: the monastery of St Simon the Canaanite - its walled courtyard, St Panteleimon's with five green domes,
    the gate bell tower - on the slope above the sea; Anakopia fortress on Iverian mountain; the waterfall and the swan
    pond by the road"""
    g, X, Z = _site('NewAthos'); at = coast_frame('NewAthos')
    shore2(g, X, Z, at, -0.05, 0.05, [(0.0, 0.006, 'pebble', 0.0012)])
    mx, mz = at(0.012, 0.05)
    place(g + ':Monastery', new_athos_cathedral(), X, Z, mx, mz, ry=0.4, foot=0.02)
    ring = [(mx - 0.03, mz - 0.022), (mx + 0.03, mz - 0.026), (mx + 0.032, mz + 0.022), (mx - 0.028, mz + 0.026)]
    for a, b in zip(ring, ring[1:] + ring[:1]):
        L = math.hypot(b[0] - a[0], b[1] - a[1]); ang = -math.atan2(b[1] - a[1], b[0] - a[0])
        place(g + ':Monastery', [(T(box(L, 0.01, 0.006), ry=ang), 'white'), (T(box(L * 1.01, 0.0014, 0.0068), 0, 0.01, 0, ry=ang), 'tinG')], X, Z, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, foot=0.008, occ=False)
    gx_, gz_ = (ring[2][0] + ring[3][0]) / 2, (ring[2][1] + ring[3][1]) / 2
    place(g + ':Monastery', [(box(0.011, 0.034, 0.011), 'white'), (T(arch_win(0.004, 0.008), 0, 0, 0.0056), 'ink'), (T(arch_win(0.003, 0.006), 0, 0.022, 0.0056), 'ink'),
                              (T(cyl(0.004, 0.008, 8), y=0.034), 'white'), (T(cone(0.0046, 0.016, 8), y=0.042), 'tinG')] + gold_cross(0.0575, 0.6), X, Z, gx_, gz_ + 0.004, foot=0.01)
    ax, az = find_spot(X, Z, 0.0, -0.05, 0.02, 'high')
    fort_wall(g, X, Z, [(ax + math.cos(a) * 0.022, az + math.sin(a) * 0.015) for a in np.linspace(0, 2 * PI, 8)[:-1]], h=0.007, mat='stoneG', towers=(0, 2, 4), tower_w=0.007, tower_h=0.014)
    place(g, tower_sq(0.01, 0.026, 'stoneG'), X, Z, ax, az, foot=0.008)
    wx_, wz_ = at(0.025, 0.02)
    waterfall(g, X, Z, wx_ + 0.006, wz_ - 0.006, 0.022, 0.007, 2.4, 'NewAthos')
    px_, pz_ = at(0.0, 0.02)
    place(g, [(T(cyl(0.012, 0.0009, 12), s=(1.4, 1, 1)), 'water')], X, Z, px_, pz_, foot=0, sink=0.0003)
    Mp = placeM(X, Z, px_, pz_, foot=0)
    if Mp is not None:
        for k in range(2):
            ob = anim_inst('NewAthos_Swan%d' % (k + 1), 'swan', lambda: [(T(ball(0.0018, 6, 4), 0, 0.0012, 0, s=(1.6, 0.8, 1)), 'white'), (T(cyl(0.0004, 0.003, 4), 0.0022, 0.0014, 0, rz=-0.3), 'white'),
                                                                  (T(ball(0.0007, 5, 3), 0.003, 0.0042, 0), 'white'), (T(cone(0.0004, 0.0012, 4), 0.0038, 0.0042, 0, rz=-PI / 2), 'jkO')], Mp, g)
            c = Mp[:3, 3]
            k_track(ob, g, lambda u, k=k: (c[0] + 0.008 * LM * math.cos(2 * PI * u * (1 if k else -1) + k * 3), c[1] + 0.0009 * LM, c[2] + 0.005 * LM * math.sin(2 * PI * u * (1 if k else -1) + k * 3)), step=8, tol=0.0004)
    def na_trees(hm, dry, n1, h): return cypress(h * 1.1) if rng.random() < 0.3 else t_broad(h, pick(['leaf', 'oakD', 'eucal']))
    forest(g, X, Z, 0.11, dens=1.2, scatter=0.25, ox=0.01, oz=-0.04, kinds=na_trees, avoid=[(mx, mz, 0.04), (ax, az, 0.03), (px_, pz_, 0.02)])
    walkers(g, X, Z, [(px_ + 0.015, pz_), (mx - 0.01, mz + 0.03), (mx, mz)], 'NewAthos', n=3, closed=False)
    gulls(g, 'NewAthos', X, Z, *at(0.0, -0.05), n=1)


def build_pitsunda():
    """Pitsunda on its cape: the great 10th-century cathedral in its walled close, the relict pine grove along the beach,
    the lighthouse with its turning beam, the resort's white tower blocks; boats offshore"""
    g, X, Z = _site('Pitsunda'); at = coast_frame('Pitsunda')
    shore2(g, X, Z, at, -0.07, 0.05, [(0.0, 0.009, 'sand', 0.0012)])
    cx_, cz_ = at(0.03, 0.045)
    place(g + ':Cathedral', xchurch(L=0.05, B=0.022, C=0.04, H=0.026, R=0.0085, DH=0.02, CH=0.013, n=12, wall='brickR', roof='tin', low_annex=0.6, cross_s=0.9) +
          [(T(g_, -0.034, 0, 0.0), m_) for g_, m_ in campanile(0.009, 0.03, 'stoneAl', 'tin')], X, Z, cx_, cz_, ry=0.3, foot=0.024)
    wall_line(g, X, Z, [(cx_ - 0.045, cz_ - 0.03), (cx_ + 0.035, cz_ - 0.032), (cx_ + 0.036, cz_ + 0.028), (cx_ - 0.044, cz_ + 0.03)], h=0.005, th=0.003, mat='stoneAl', closed=True)
    lx, lz = at(-0.05, 0.006)
    Ml = place(g, [(cyl(0.005, 0.003, 8), 'stoneS'), (T(cyl(0.0026, 0.04, 8, 0.0038), y=0.003), 'white'), (T(cyl(0.0034, 0.0012, 8), y=0.043), 'ink'),
                   (T(cyl(0.0022, 0.004, 8), y=0.0442), 'glass'), (T(cone(0.0026, 0.004, 8), y=0.0482), 'red')], X, Z, lx, lz, foot=0)
    if Ml is not None:
        beam = anim_obj('Pitsunda_LighthouseBeam', [(T(cone(0.005, 0.045, 4), rz=PI / 2, x=0.045), 'lamp'), (T(ball(0.002, 5, 3)), 'lamp')], Ml @ mat4(y=0.046), g)
        k_spin(beam, 2, 4.0)
    for k, s_ in enumerate((-0.045, -0.028, -0.011)):
        bx_, bz_ = at(s_, 0.03)
        place(g, batumi_block(0.014, 0.03, 9, 'white', 'glassB'), X, Z, bx_, bz_, ry=-math.atan2(*(np.array(at(s_ + 0.01)) - np.array(at(s_ - 0.01)))[::-1]), foot=0.01)
    def pi_trees(hm, dry, n1, h): return t_pine(h * 1.25, pick(['pineT', 'pine']))
    forest(g, X, Z, 0.1, dens=1.6, scatter=0.6, ox=0.02, oz=-0.01, kinds=pi_trees, avoid=[(cx_, cz_, 0.045), (lx, lz, 0.01)])
    sx, sz = at(-0.01, -0.06)
    boat_loop(g, 'Pitsunda_Yacht', 'yacht', yacht, X, Z, sx, sz, 0.03, 0.015, turns=1, phase=0.4, roll=0.04, ang=0.6)
    boat_loop(g, 'Pitsunda_JetSki', 'jetski_jkR', lambda: jetski('jkR'), X, Z, sx + 0.02, sz + 0.01, 0.012, 0.008, turns=3, phase=1.2, roll=0.08)
    walkers(g, X, Z, [at(-0.06, 0.004), at(0.04, 0.004)], 'Pitsunda', n=2, closed=False)
    gulls(g, 'Pitsunda', X, Z, sx, sz, n=2)


def build_gagra():
    """Gagra, squeezed between the mountains and the sea: the white Colonnade, Gagripsh restaurant (the wooden house
    brought from Finland, with its tower), the seaside park of palms, the old Abaata fortress walls; yachts offshore"""
    g, X, Z = _site('Gagra'); at = coast_frame('Gagra')
    shore2(g, X, Z, at, -0.05, 0.05, [(0.0, 0.006, 'pebble', 0.0012), (0.007, 0.01, 'stoneS', 0.0014)])
    a0, a1 = np.array(at(-0.012, 0.016)), np.array(at(0.012, 0.016)); m = (a0 + a1) / 2; d = a1 - a0; L = float(np.linalg.norm(d)); ang = -math.atan2(d[1], d[0])
    col = [(box(L, 0.0016, 0.008), 'stoneS'), (T(box(L, 0.002, 0.008), 0, 0.012, 0), 'white')] + [(T(cyl(0.001, 0.012, 6), x, 0.0016, z), 'white') for x in np.linspace(-L / 2 + 0.002, L / 2 - 0.002, 8) for z in (-0.003, 0.003)]
    col += [(T(box(0.008, 0.016, 0.009), sx * L / 2, 0, 0), 'white') for sx in (-1, 1)] + [(T(pyramid(0.009, 0.01, 0.005), sx * L / 2, 0.016, 0), 'tile') for sx in (-1, 1)]
    place(g + ':Colonnade', col, X, Z, m[0], m[1], ry=ang, foot=0.006)
    rx_, rz_ = at(0.03, 0.03)
    place(g, [(box(0.018, 0.012, 0.012), 'balcD'), (T(gable(0.013, 0.006, 0.02), y=0.012, ry=PI / 2), 'tinR'), (T(box(0.006, 0.026, 0.006), 0.006, 0, 0.003), 'balcD'),
              (T(pyramid(0.007, 0.007, 0.008), 0.006, 0.026, 0.003), 'tinR')] + [(T(rect_win(0.0024, 0.004), x, 0.004, 0.0062), 'glass') for x in (-0.005, 0.0)], X, Z, rx_, rz_, ry=ang, foot=0.01)
    for s_ in np.arange(-0.045, 0.048, 0.008): safe(g, palm(0.038 + rng.random() * 0.01, (rng.random() - 0.5) * 0.3, rng.random() * 6), X, Z, *at(s_, 0.024 + 0.006 * math.sin(s_ * 90)), foot=0, occ=False)
    fx, fz = at(-0.035, 0.035)
    wall_line(g, X, Z, [(fx - 0.01, fz - 0.008), (fx + 0.01, fz - 0.009), (fx + 0.011, fz + 0.008), (fx - 0.009, fz + 0.009)], h=0.005, th=0.003, mat='stoneG', closed=True, crenel=True)
    houses(g, X, Z, 12, lambda: town_house(0.014, 0.012, 0.012, pick(['plaster', 'plasterY', 'plasterB']), pick(['tile', 'tin']), balcony=True, hipped=True), (0.0, 0.06, -0.06, 0.12), 'gag', mind=0.021)
    forest(g, X, Z, 0.11, dens=1.3, scatter=0.2, ox=0.04, oz=-0.02, avoid=[(m[0], m[1], 0.025), (rx_, rz_, 0.015)])
    sx, sz = at(0.0, -0.05)
    sx, sz = at(0.0, -0.085)
    for k in range(2): boat_loop(g, 'Gagra_Yacht%d' % (k + 1), 'yacht', yacht, X, Z, sx + 0.02 * k, sz - 0.01 * k, 0.026, 0.01, turns=1 if k else -1, phase=k * 2.5, roll=0.04, ang=0.6)
    walkers(g, X, Z, [at(-0.04, 0.0085), at(0.04, 0.0085)], 'Gagra', n=3, closed=False)
    gulls(g, 'Gagra', X, Z, sx, sz, n=1)


def build_ritsa():
    """Lake Ritsa, high in the Abkhaz mountains: the turquoise water in its trough of fir forest, Stalin's green dacha
    on the shore, boats out on the lake, eagles over the ridges"""
    g, X, Z = _site('Ritsa')
    y = lake_water(g, X, Z, 'Ritsa', -0.012, 0.0, 0.018, 0.042, ang=0.35, mat='lakeT')
    dx_, dz_ = -0.012 + 0.018 * 1.55 * math.cos(0.35), 0.018 * 1.55 * math.sin(0.35)
    place(g, [(box(0.022, 0.012, 0.014), 'tinG'), (T(hip(0.024, 0.016, 0.005), y=0.012), 'tinG'), (T(box(0.008, 0.012, 0.006), 0, 0, 0.009), 'white')] +
          [(T(rect_win(0.0024, 0.004), x, 0.004, 0.0072), 'ink') for x in (-0.007, 0.007)], X, Z, dx_, dz_, ry=-0.4, foot=0.012)
    if y is not None:
        boat_loop(g, 'Ritsa_Boat1', 'rowboat_0', lambda: rowboat('white'), X, Z, -0.012, 0.0, 0.008, 0.028, y=y, turns=1, roll=0.02, ang=0.35)
        boat_loop(g, 'Ritsa_Boat2', 'rowboat_1', lambda: rowboat('jkR'), X, Z, -0.012, 0.01, 0.006, 0.018, y=y, turns=-1, phase=2.0, roll=0.02, ang=0.35)
    forest(g, X, Z, 0.11, dens=1.6, scatter=0.3, kinds=lambda hm, dry, n1, h: t_conifer(h * 1.15, pick(['spruce', 'spruceD'])) if rng.random() < 0.75 else t_broad(h, 'beech'),
           avoid=[(-0.012, 0.0, 0.03), (dx_, dz_, 0.015)])
    eagles(g, 'Ritsa', X, Z, -0.01, 0.0, r=0.06, h=0.3, n=2)


def ikorta():
    """Ikorta's Archangels church (1172): a cross-dome of pale dressed stone with a tall drum, carved window frames"""
    P = xchurch(L=0.036, B=0.016, C=0.03, H=0.02, R=0.0068, DH=0.018, CH=0.012, n=8, wall='stoneAl', roof='stoneD', rise=0.4, cross_s=0.8)
    for sz in (-1, 1): P += [(T(plate([(-0.004, 0), (0.004, 0), (0.004, 0.011), (0, 0.014), (-0.004, 0.011)]), x, 0.004, sz * 0.0084), 'stoneD') for x in (-0.011, 0.011)]
    return P

def build_ikorta():
    """the Tskhinvali region: Ikorta's church above the Liakhvi valley, its bell tower and village, the apple orchards the
    valley is known for (a tractor working the rows), Tskhinvali's streets down the valley, a flock on the slope"""
    g, X, Z = _site('Ikorta')
    cx_, cz_ = find_spot(X, Z, 0.0, 0.0, 0.02, 'flat')
    place(g, ikorta(), X, Z, cx_, cz_, ry=0.05, foot=0.02)
    place(g, campanile(0.008, 0.024, 'stoneAl', 'stoneD'), X, Z, cx_ - 0.028, cz_ + 0.01, foot=0.008)
    wall_line(g, X, Z, [(cx_ - 0.036, cz_ - 0.02), (cx_ + 0.03, cz_ - 0.022), (cx_ + 0.031, cz_ + 0.022), (cx_ - 0.035, cz_ + 0.024)], h=0.004, th=0.003, mat='stoneAl', closed=True)
    houses(g, X, Z, 10, lambda: town_house(0.015, 0.012, 0.011, pick(['plaster', 'stoneAl', 'balc']), pick(['tin', 'tinR']), balcony=True, chimney=True), (0.03, 0.07, -0.02, 0.06), 'iko', mind=0.022)
    houses(g, X, Z, 14, lambda: town_house(0.015 + rng.random() * 0.006, 0.013, 0.012 + rng.random() * 0.005, pick(['plaster', 'plasterY', 'stoneAl', 'brickR']), pick(['tin', 'tinR', 'tile']), balcony=rng.random() > 0.4),
           (-0.08, 0.06, 0.02, 0.05), 'tsk2', mind=0.021)
    rows = []
    for r in range(5):
        for k in range(8):
            dx, dz = 0.02 + k * 0.009, 0.07 + r * 0.01
            if safe(g, [(cyl(0.0007, 0.006, 4), 'trunk'), (T(ball(0.0048, 6, 4), y=0.008, s=(1, 0.85, 1)), 'leaf'), (T(ball(0.0008, 4, 3), 0.003, 0.009, 0.002), 'red'),
                        (T(ball(0.0008, 4, 3), -0.002, 0.007, -0.003), 'red')], X, Z, dx, dz, foot=0, occ=False) is not None: rows.append((dx, dz))
    path = [(X + p[0] * LM, Z + p[1] * LM) for p in ((0.015, 0.075), (0.09, 0.075), (0.09, 0.095), (0.015, 0.095), (0.015, 0.115), (0.09, 0.115))]
    ob = anim_inst('Ikorta_Tractor', 'tractor', mtz_tractor, mat4(path[0][0], ground3(*path[0]), path[0][1], s=LM * 0.6), g)
    k_track(ob, g, lambda u: along(path, 1 - abs(1 - 2 * u), False), step=4, tol=0.0005, pitch=True)
    flock_walk(g, 'Ikorta_Flock', X, Z, [(-0.06, -0.05), (-0.02, -0.07), (0.02, -0.06), (-0.02, -0.04)], seed=9)
    forest(g, X, Z, 0.12, dens=0.8, scatter=0.1, avoid=[(cx_, cz_, 0.035), (0.055, 0.095, 0.05), (-0.05, 0.045, 0.04)])
    eagles(g, 'Ikorta', X, Z, 0.0, -0.03, r=0.06, h=0.3, n=1)


# ------------------------------------------------------------------------------------------------ weather: snow on the snowy places, the sun over the coast
SNOW_R, SNOW_H, SNOW_P = 0.07, 0.045, 3
def _snow_column():
    """the one flake mesh every snowfall shares: 240 flakes in a column of radius SNOW_R, height SNOW_H, stacked
    SNOW_P + 1 times one above another"""
    r_ = random.Random(5); P = []
    base = [(math.cos(a) * rr, r_.random() * SNOW_H, math.sin(a) * rr, r_.random()) for a, rr in ((r_.random() * 2 * PI, SNOW_R * math.sqrt(r_.random())) for _ in range(240))]
    for c in range(SNOW_P + 1):
        for (x, y, z, q) in base: P.append((T(ball(0.0009 + 0.0007 * q, 4, 2), x, y + c * SNOW_H, z, ry=q * 3, rz=q * 2), 'snowF'))
    return P

def snowfall(g, name, X, Z, dx, dz, R=0.06, seed=1):
    """snow falling over a place: the shared column, widened to radius R, sliding down SNOW_P repeats each loop so the
    clip's wrap can't be seen, and drifting in the wind. Named *_Fx: no shadows."""
    Xc, Zc = X + dx * LM, Z + dz * LM; k = R / SNOW_R
    ob = anim_inst(name + '_Snow_Fx', 'snowcolumn', _snow_column, mat4(Xc, ground3(Xc, Zc) - 0.01 * LM, Zc, ry=seed, s=(LM * k, LM, LM * k)), g)
    z0 = ob.location[2]
    ob.keyframe_insert('location', index=2, frame=0); ob.location[2] = z0 - SNOW_P * SNOW_H * LM; ob.keyframe_insert('location', index=2, frame=LOOP); ob.location[2] = z0
    k_wave(ob, 'location', 0, 0.006 * LM, cycles=2, phase=seed, step=10)
    k_wave(ob, 'location', 1, 0.005 * LM, cycles=3, phase=seed + 1, step=10)

def build_snow():
    """snow falling on the ski slopes and the high peaks"""
    for (grp, name, place_, dx, dz, R) in (('Scenery_GudauriSite', 'Gudauri', 'GudauriSite', -0.035, -0.02, 0.09), ('Scenery_Goderdzi', 'Goderdzi', 'Goderdzi', -0.01, -0.01, 0.07),
                                            ('Scenery_BorjomiPark', 'Bakuriani', 'BorjomiPark', 0.08, 0.08, 0.06), ('Scenery_Hatsvali', 'Hatsvali', 'Hatsvali', 0.0, 0.0, 0.05)):
        if grp not in REGION: continue
        p = G['places'][place_]; X, Z = wx(p[0]), wz(p[1]); snowfall(grp, name, X, Z, dx, dz, R=R, seed=len(name))
    for (grp, name, peak, base) in (('Scenery_Kazbegi', 'Kazbek', 'Kazbek', 'Stepantsminda'), ('Svaneti', 'Shkhara', 'Shkhara', 'Mestia'), ('Svaneti', 'Ushba', 'Ushba', 'Mestia')):
        if grp not in REGION: continue
        p = G['places'][peak]; X, Z = wx(p[0]), wz(p[1]); snowfall(grp, name, X, Z, 0.0, 0.0, R=0.05, seed=len(name) * 3)

def build_sun():
    """the summer sun over the Black Sea: a golden disc with a ring of slowly turning, pulsing rays, and
    the sun glittering on the water off each beach. All *_Fx: they cast no shadows."""
    g = 'Scenery_Sun'; X, Z = wx(185.0), wz(330.0); region_empty(g, X, Z)
    Ys = SEA_Y + 1.3
    # a flat sun, like a child's drawing: a faceted disc and a ring of pointed rays, turned to face the overview camera
    # (yaw -0.2, 50 degrees up)
    v = np.array([-math.sin(0.2) * math.cos(math.radians(50)), math.sin(math.radians(50)), math.cos(0.2) * math.cos(math.radians(50))]); v /= np.linalg.norm(v)
    ax_ = np.cross([0, 0, 1.0], v); s_ = np.linalg.norm(ax_); c_ = float(v[2]); ax_ /= s_
    K = np.array([[0, -ax_[2], ax_[1]], [ax_[2], 0, -ax_[0]], [-ax_[1], ax_[0], 0]]); Rm = np.eye(3) + K * s_ + K @ K * (1 - c_)
    Mt = np.eye(4); Mt[:3, :3] = Rm; Mt[:3, 3] = (X, Ys, Z)
    piv = anim_empty('Sun_Fx', to_bl(Mt), g)
    disc = [(T(cyl(0.1, 0.02, 18), 0, 0, -0.01, rx=PI / 2), 'sunC'), (T(dome(0.1, 18, 2), 0, 0, 0.01, rx=PI / 2, s=(1, 0.35, 1)), 'sunC')]
    core = anim_obj('Sun_Disc_Fx', disc, np.eye(4), g, parent=piv)
    rays = []
    for k in range(12):
        a = k / 12 * 2 * PI; L = 0.12 if k % 2 == 0 else 0.075
        g_ = T(plate([(-0.03, 0.0), (0.03, 0.0), (0.0, L)], d=0.014), 0, 0, 0, rz=a - PI / 2)
        rays.append((T(g_, math.cos(a) * 0.12, math.sin(a) * 0.12, 0), 'sunR' if k % 2 == 0 else 'sunC'))
    ro = anim_obj('Sun_Rays_Fx', rays, np.eye(4), g, parent=piv)
    k_spin(ro, 1, 0.25)   # about the disc's own axis (three +z is Blender -y)
    for ax in (0, 2): k_scale(ro, ax, 0.93, 1.07, cycles=4, step=8)
    beaches = [(283, 398), (299, 340), (272, 266), (203, 172), (118, 141), (103, 116)]
    # glitter on the sea off the beaches: little clusters of glints, each twinkling in its own time
    r_ = random.Random(77)
    glint = lambda: [(T(ball(0.0016, 4, 2), x, 0, z, s=(1.6, 0.25, 1.0), ry=r_.random()), 'glint') for x, z in ((0, 0), (0.004, 0.003), (-0.003, 0.004), (0.002, -0.004))]
    k_ = 0
    for (bx, by) in beaches + [(276, 425), (296, 352), (290, 320), (180, 157)]:
        for j in range(3):
            q = (bx - 3 - r_.random() * 12, by + (r_.random() - 0.5) * 20)
            if inside_map(*q): continue
            k_ += 1
            ob = anim_inst('Sun_Glint%d_Fx' % k_, 'glint', glint, mat4(wx(q[0]), SEA_Y + 0.004, wz(q[1]), s=LM), g)
            for ax in (0, 1, 2): k_scale(ob, ax, 0.0, 1.0, cycles=5 + j % 3, phase=r_.random() * 6.28, step=4)


SITE_BUILDERS = [build_gonio, build_botanical_garden, build_kobuleti, build_ureki, build_poti, build_anaklia, build_makhuntseti, build_goderdzi,
                 build_zugdidi, build_martvili, build_enguri, build_hatsvali, build_tskaltubo, build_chiatura, build_racha, build_bakhmaro,
                 build_borjomi, build_rabati, build_khertvisi, build_paravani, build_dmanisi, build_mtskheta, build_ananuri, build_gudauri,
                 build_shatili, build_lavra, build_lagodekhi, build_sukhumi, build_new_athos, build_pitsunda, build_gagra, build_ritsa, build_ikorta, build_snow, build_sun]
if 'only' in _opts: SITE_BUILDERS = [f for f in SITE_BUILDERS if f.__name__ in ['build_' + n for n in _opts['only'].split(',')]]


def probe_sites(names=None):
    """debugging aid (build with probe=1): the ground round each sight as a 9x9 grid of metres every 0.03 landmark
    units (east = right, south = down), and where rivers, roads and the sea are"""
    for name in (names or SITES):
        X0, Z0 = wx(G['places'][name][0]), wz(G['places'][name][1])
        print('== %s  map %s' % (name, G['places'][name]))
        for j in range(-4, 5):
            row = []
            for i in range(-4, 5):
                X, Z = X0 + i * 0.03 * LM, Z0 + j * 0.03 * LM
                mx, my = X / S + cx, Z / S + cy
                if not inside_map(mx, my): row.append('  sea' if float(h_at(mx, my)) < 1 else ' edge'); continue
                h = (ground3(X, Z) - BASE) / MPU
                mark = ' '
                for (_, k, d) in _ckd.find_range((mx, my, 0), 2.5):
                    ch = None
                    for c in CHANNELS:
                        b = c['ids'][0]
                        if b <= k < b + len(c['P']): ch = c; break
                    if ch is not None: mark = 'r' if ch['kind'] == 'river' else '='; break
                row.append('%4d%s' % (round(h / 10) * 10 if h < 9999 else 9999, mark))
            print('  ' + ' '.join(row))
