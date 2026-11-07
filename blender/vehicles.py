"""
Vehicles, boats and birds for the Georgia model, low-poly but true to the real things.

Loaded by build_georgia.py (exec'd into its namespace, so it uses the kit: Geo, T, box, cyl, cone, ball, tube, ...).
Each maker returns a list of (Geo, material) parts in the kit's frame: metres scaled to landmark units, y up,
the vehicle's nose towards +x, centred on the ground under its middle.

Run on its own inside Blender (python3 blender/bl.py blender/vehicles.py, or the Blender MCP execute tool) to build
a showroom scene "Workshop" with every model and render close-ups to blender/renders/vehicles/.
"""
import math
import numpy as np

if 'Geo' not in globals():   # standalone (showroom): borrow the kit from the build script without building Georgia
    import os, re
    _here = os.path.dirname(os.path.abspath(__file__))
    _src = open(os.path.join(_here, 'build_georgia.py')).read()
    _kit = _src[_src.index('# ------------------------------------------------------------------------------------------------ geometry kit'):
                _src.index('# vehicles, boats and birds: blender/vehicles.py')]
    PI, SQ2 = math.pi, math.sqrt(2)
    exec(_kit, globals())
    SHOWROOM = True
else:
    SHOWROOM = False

M_ = 0.0056   # landmark units per metre for the vehicles (a 4.7 m Delica is 0.026 long, as the old van was)


def _ring_faces(n_rings, n_pts, closed=True):
    F = []
    for r in range(n_rings - 1):
        for i in range(n_pts if closed else n_pts - 1):
            a, b = r * n_pts + i, r * n_pts + (i + 1) % n_pts
            F.append((a, b, b + n_pts, a + n_pts))
    return F


def loft(rings, mats, caps=(None, None)):
    """rings: list of equal-length point lists (x, y, z). mats(r, i) -> material of the quad from ring r, edge i.
    Returns parts grouped by material."""
    n = len(rings[0]); V = [p for ring in rings for p in ring]
    groups = {}
    for r in range(len(rings) - 1):
        for i in range(n):
            a, b = r * n + i, r * n + (i + 1) % n
            groups.setdefault(mats(r, i), []).append((a, b, b + n, a + n))
    if caps[0]: groups.setdefault(caps[0], []).append(tuple(range(n))[::-1])
    if caps[1]: groups.setdefault(caps[1], []).append(tuple(range((len(rings) - 1) * n, len(rings) * n)))
    return [(Geo(V, F), m) for m, F in groups.items()]


def scaled(parts, s=M_):
    return [(Geo(g.V * s, g.F), m) for g, m in parts]


def wheel(r, w, x, z, rim='steel', tyre='tyre', spokes=5, seg=12):
    """a tyre with a stepped rim and spokes, its axis along z, standing at (x, z)"""
    side = 1 if z > 0 else -1
    P = [(T(cyl(r, w, seg), x, r, z - w / 2, rx=PI / 2), tyre)]
    o = z + side * (w / 2 + 0.002)
    P.append((T(cyl(r * 0.62, 0.012, seg), x, r, o - side * 0.006 - 0.006, rx=PI / 2), rim))
    P.append((T(cyl(r * 0.2, 0.03, 8), x, r, o - 0.015 + side * 0.012, rx=PI / 2), rim))
    for k in range(spokes):
        a = k / spokes * 2 * PI
        P.append((T(box(r * 0.42, 0.05, 0.016), x + math.cos(a) * r * 0.3, r + math.sin(a) * r * 0.3, o + side * 0.004, rz=a), rim))
    return P


def arch(x, r, z, w, h0=0.0, seg=8, mat='trim', th=0.07):
    """a fender flare: a smooth half-ring band standing proud of the body over a wheel"""
    side = 1 if z > 0 else -1; rings = []
    for k in range(seg + 1):
        a = PI * k / seg; c, s_ = math.cos(a), math.sin(a)
        rings.append([(x + c * r, h0 + s_ * r, z - side * w / 2), (x + c * (r + th), h0 + s_ * (r + th), z - side * w / 2),
                      (x + c * (r + th * 0.6), h0 + s_ * (r + th * 0.6), z + side * w / 2), (x + c * r, h0 + s_ * r, z + side * w / 2)])
    return loft(rings, lambda r_, i: mat, caps=(mat, mat))


def body_shell(ST, glass, screen, upper, lower, clad=0.38, rtop=0.07, rside=0.09, xs=None, under=None):
    """a vehicle body lofted through side-profile stations (x, sill, belt, roof, half-width at belt, at roof).
    Windows are cut into the glasshouse band by x-range (glass), the windscreen by its own range (screen); everything
    between is pillar in body colour. Lower body in the cladding colour up to `clad` of the sill-to-belt height."""
    keys = sorted(set([st[0] for st in ST] + [x for r_ in glass for x in r_] + [x for x in screen] + list(xs or [])))
    X = np.array([st[0] for st in ST]); cols = np.array([st[1:] for st in ST])
    rings, xm = [], []
    for x in keys:
        sill, belt, top, wb, wt = (float(np.interp(x, X, cols[:, k])) for k in range(5))
        belt = min(belt, top - 0.02); mid = sill + (belt - sill) * clad
        ring = [(-wb * 0.9, sill), (-wb, sill + 0.08), (-wb, mid), (-wb, belt), (-wt, top - rtop), (-wt + rside, top),
                (wt - rside, top), (wt, top - rtop), (wb, belt), (wb, mid), (wb, sill + 0.08), (wb * 0.9, sill)]
        rings.append([(x, y, z) for z, y in ring])
    for a, b in zip(keys, keys[1:]): xm.append((a + b) / 2)
    def mats(r, i):
        x = xm[r]
        if i in (0, 1, 9, 10, 11): return lower if i != 11 else (under or lower)
        if i in (3, 7): return 'delG' if any(a < x < b for a, b in glass) or screen[0] < x < screen[1] else upper
        if i in (4, 5, 6): return 'delG' if screen[0] < x < screen[1] else upper
        return upper
    return loft(rings, mats, caps=(upper, upper))


# ------------------------------------------------------------------------------------------------ Mitsubishi Delica
def delica(upper='delW', lower='delD', s=M_):
    """Mitsubishi Delica Space Gear 4WD (L400, 1994-2007), the long-nosed one-box van Georgia's guides love:
    4.7 m long, 1.8 m wide, 2 m tall on its 4WD stance; a short sloping bonnet, a steeply raked windscreen,
    a tall glasshouse, a sliding side door, the spare wheel on the tailgate, roof rails, a bull bar,
    and the two-tone paint: pale upper body over charcoal cladding."""
    # side profile stations along x (metres): (x, sill, belt, top, half-width at belt, half-width at roof)
    ST = [(-2.34, 0.52, 1.13, 1.80, 0.86, 0.72), (-2.30, 0.44, 1.14, 1.90, 0.89, 0.76), (-2.0, 0.42, 1.14, 1.95, 0.895, 0.77),
          (-1.0, 0.42, 1.14, 1.96, 0.895, 0.775), (0.0, 0.42, 1.14, 1.96, 0.895, 0.775), (0.78, 0.42, 1.13, 1.93, 0.895, 0.77),
          (1.05, 0.42, 1.12, 1.80, 0.89, 0.74), (1.42, 0.42, 1.11, 1.43, 0.885, 0.79), (1.70, 0.44, 1.05, 1.12, 0.87, 0.80),
          (2.12, 0.47, 0.96, 1.0, 0.85, 0.78), (2.30, 0.52, 0.80, 0.86, 0.80, 0.74)]
    # windows: front door, sliding door, two rear quarters; the windscreen runs from the bonnet to the roof
    P = body_shell(ST, glass=[(0.84, 1.1), (-0.3, 0.72), (-1.48, -0.42), (-2.2, -1.6)], screen=(1.06, 1.69), upper=upper, lower=lower,
                   xs=[-2.25], under='tyre')
    # door seams, handles, mirrors, running boards, mud flaps
    for sz in (-1, 1):
        P.append((T(box(1.1, 0.012, 0.012), -0.2, 0.86, sz * 0.9), 'ink'))          # sliding-door rail
        P.append((T(box(0.012, 0.66, 0.012), -0.35, 0.48, sz * 0.9), 'ink'))        # door shut lines
        P.append((T(box(0.012, 0.66, 0.012), 0.82, 0.48, sz * 0.9), 'ink'))
        P.append((T(box(0.12, 0.03, 0.02), 0.55, 0.98, sz * 0.9), 'ink'))           # handles
        P.append((T(box(0.12, 0.03, 0.02), -0.5, 0.98, sz * 0.9), 'ink'))
        # door mirror on a stalk
        P += [(T(box(0.06, 0.04, 0.16), 1.32, 1.12, sz * 0.97), lower), (T(box(0.08, 0.15, 0.06), 1.3, 1.16, sz * 1.06), lower)]
        # running board and mud flaps
        P.append((T(box(2.0, 0.04, 0.16), -0.15, 0.36, sz * 0.86), lower))
        for x in (1.05, -2.15): P.append((T(box(0.03, 0.22, 0.2), x, 0.2, sz * 0.78), 'ink'))
    P.append((T(box(0.02, 0.62, 1.36), -2.33, 1.38, 0), 'delG'))                     # the tailgate window
    # windscreen frame and wipers
    P += [(T(box(0.03, 0.02, 0.6), 1.5, 1.14, z), 'ink') for z in (-0.35, 0.3)]
    # front: grille with chrome bars, square headlamps, amber indicators, bumper, the tubular bull bar, fog lamps
    P += [(T(box(0.05, 0.22, 0.86), 2.31, 0.73, 0), 'ink')] + [(T(box(0.06, 0.025, 0.84), 2.32, 0.66 + k * 0.06, 0), 'steel') for k in range(4)]
    for sz in (-1, 1):
        P += [(T(box(0.05, 0.17, 0.3), 2.29, 0.74, sz * 0.6), 'lamp'), (T(box(0.05, 0.08, 0.1), 2.27, 0.62, sz * 0.8), 'amber'),
              (T(box(0.05, 0.08, 0.14), 2.1, 0.62, sz * 0.86), 'amber')]
    P.append((T(box(0.2, 0.2, 1.74), 2.36, 0.42, 0), lower))
    bar = [np.array(p) for p in ((2.52, 0.3, -0.62), (2.55, 0.86, -0.5), (2.55, 0.9, 0.5), (2.52, 0.3, 0.62))]
    P.append((tube(bar, 0.04, 6), 'steel'))
    P += [(tube([np.array((2.44, 0.42, z)), np.array((2.54, 0.42, z))], 0.03, 5), 'steel') for z in (-0.45, 0.45)]
    P += [(tube([np.array((2.55, 0.62, -0.52)), np.array((2.55, 0.62, 0.52))], 0.03, 5), 'steel')]
    P += [(T(cyl(0.07, 0.05, 8), 2.55, 0.5, z, rz=PI / 2), 'lamp') for z in (-0.36, 0.36)]
    # rear: tall tail lamps, the bumper, the spare wheel in its cover on the tailgate, a step
    for sz in (-1, 1): P += [(T(box(0.04, 0.42, 0.13), -2.35, 0.95, sz * 0.78), 'red'), (T(box(0.04, 0.12, 0.13), -2.35, 0.68, sz * 0.78), 'amber')]
    P += [(T(box(0.18, 0.2, 1.74), -2.38, 0.42, 0), lower), (T(cyl(0.36, 0.24, 12), -2.42, 1.0, 0, rz=PI / 2), lower),
          (T(cyl(0.3, 0.02, 12), -2.66, 1.0, 0, rz=PI / 2), 'delW'), (T(box(0.02, 0.06, 0.4), -2.67, 1.0, 0), 'red')]
    # roof rails
    for sz in (-1, 1):
        P.append((tube([np.array((0.6, 2.0, sz * 0.62)), np.array((-2.1, 2.0, sz * 0.62))], 0.03, 5), 'steel'))
        for x in (0.55, -0.75, -2.05): P.append((T(box(0.08, 0.06, 0.05), x, 1.95, sz * 0.62), 'ink'))
    # wheels (215/80 R15 on the 4WD), wheelbase 2.8 m, flares round the arches, the chassis and axles beneath
    for x in (1.45, -1.35):
        for sz in (-1, 1):
            P += wheel(0.37, 0.24, x, sz * 0.76, rim='steel')
            P += arch(x, 0.42, sz * 0.88, 0.12, h0=0.37, mat=lower)
    P += [(T(box(3.6, 0.2, 1.1), 0.0, 0.22, 0), 'tyre'), (T(box(0.12, 0.12, 1.5), 1.45, 0.3, 0), 'tyre'), (T(box(0.12, 0.12, 1.5), -1.35, 0.3, 0), 'tyre')]
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ mountain 4x4s
def land_cruiser(paint='lcW', s=M_):
    """Toyota Land Cruiser 76 (the mountain taxi of Svaneti and Kazbegi): a slab-sided box with a flat bonnet,
    upright windscreen, snorkel, steel bumpers and a roof rack, on big tyres"""
    ST = [(-2.4, 0.5, 1.16, 1.88, 0.87, 0.80), (-2.3, 0.45, 1.16, 1.94, 0.88, 0.82), (0.25, 0.45, 1.16, 1.95, 0.88, 0.82),
          (0.55, 0.45, 1.15, 1.92, 0.88, 0.81), (0.95, 0.45, 1.14, 1.2, 0.88, 0.84), (2.3, 0.5, 1.1, 1.14, 0.86, 0.83), (2.42, 0.56, 1.0, 1.06, 0.84, 0.8)]
    P = body_shell(ST, glass=[(-0.05, 0.5), (-1.0, -0.2), (-2.25, -1.15)], screen=(0.6, 0.92), upper=paint, lower=paint, clad=0.0, rtop=0.04, rside=0.05, under='tyre')
    for sz in (-1, 1):
        P += [(T(box(0.012, 0.6, 0.012), x, 0.52, sz * 0.885), 'ink') for x in (0.95, -0.7)]
        P += [(T(box(0.06, 0.18, 0.14), 0.9, 1.2, sz * 1.0), 'ink')]
        P.append((T(box(1.4, 0.04, 0.16), -0.1, 0.4, sz * 0.88), 'ink'))
        P += arch(1.5, 0.46, sz * 0.9, 0.1, h0=0.4, mat='ink') + arch(-1.35, 0.46, sz * 0.9, 0.1, h0=0.4, mat='ink')
    P += [(T(box(0.04, 0.3, 1.1), 2.43, 0.82, 0), 'ink')] + [(T(cyl(0.11, 0.04, 8), 2.44, 0.82, z, rz=PI / 2), 'lamp') for z in (-0.66, 0.66)]
    P += [(T(box(0.16, 0.18, 1.82), 2.48, 0.5, 0), 'steel'), (T(box(0.14, 0.16, 1.8), -2.44, 0.5, 0), 'steel')]
    P.append((tube([np.array((1.0, 0.85, 0.92)), np.array((1.0, 1.25, 0.95)), np.array((1.1, 1.9, 0.93))], 0.06, 6), 'ink'))  # the snorkel
    for sz in (-1, 1): P.append((T(box(0.04, 0.3, 0.12), -2.42, 1.0, sz * 0.74), 'red'))
    P += [(T(box(2.3, 0.05, 1.5), -0.95, 2.04, 0), 'ink')] + [(T(box(0.05, 0.12, 1.5), -0.95 + x, 2.0, 0), 'ink') for x in (-1.0, 0.0, 1.0)]
    P += [(T(box(0.9, 0.3, 1.1), -1.1, 2.2, 0), 'lcBag')]   # luggage under a tarp
    for x in (1.5, -1.35):
        for sz in (-1, 1): P += wheel(0.4, 0.28, x, sz * 0.78, rim='steel')
    P += [(T(box(3.8, 0.2, 1.1), 0.0, 0.26, 0), 'tyre')]
    return scaled(P, s)


def uaz_bukhanka(paint='uazG', s=M_):
    """UAZ-452 'Bukhanka' (the loaf), still climbing to Tusheti and Svaneti: a rounded box van with a stubby nose,
    two-piece windscreen, small round lamps, all on high-clearance axles"""
    ST = [(-2.18, 0.5, 1.2, 1.9, 0.94, 0.8), (-2.1, 0.45, 1.2, 2.04, 0.97, 0.85), (1.4, 0.45, 1.2, 2.04, 0.97, 0.85), (1.85, 0.45, 1.2, 1.9, 0.96, 0.82),
          (2.05, 0.5, 1.12, 1.45, 0.92, 0.82), (2.18, 0.58, 1.0, 1.12, 0.86, 0.78)]
    P = body_shell(ST, glass=[(1.05, 1.78), (0.15, 0.9), (-0.75, 0.0), (-1.95, -0.9)], screen=(1.87, 2.06), upper=paint, lower=paint, clad=0.0, rtop=0.14, rside=0.16, under='tyre')
    for sz in (-1, 1):
        P += [(T(cyl(0.09, 0.04, 8), 2.19, 0.86, sz * 0.62, rz=PI / 2), 'lamp'), (T(box(0.05, 0.06, 0.1), 2.18, 0.68, sz * 0.7), 'amber')]
        P.append((T(box(0.012, 0.66, 0.012), 1.35, 0.55, sz * 0.975), 'ink'))
        P += arch(1.45, 0.42, sz * 0.95, 0.1, h0=0.36, mat='ink') + arch(-1.15, 0.42, sz * 0.95, 0.1, h0=0.36, mat='ink')
    P += [(T(box(0.04, 0.24, 0.7), 2.2, 0.82, 0), 'ink')] + [(T(box(0.05, 0.02, 0.66), 2.21, 0.74 + k * 0.05, 0), 'uazG') for k in range(4)]
    P += [(T(box(0.12, 0.14, 1.8), 2.26, 0.52, 0), 'ink'), (T(box(0.12, 0.14, 1.8), -2.22, 0.52, 0), 'ink')]
    for x in (1.45, -1.15):
        for sz in (-1, 1): P += wheel(0.38, 0.24, x, sz * 0.8, rim='uazG')
    P += [(T(box(3.4, 0.2, 1.1), 0.1, 0.24, 0), 'tyre')]
    return scaled(P, s)


def mtz_tractor(s=M_):
    """MTZ-80 Belarus: the red tractor of every Kakheti vineyard - big rear wheels, small front ones, the tall cab"""
    P = [(T(box(1.6, 0.6, 0.62), 0.75, 0.75, 0), 'tractor'), (T(box(0.1, 0.5, 0.6), 1.58, 0.75, 0), 'ink'),
         (T(cyl(0.05, 0.6, 6), 1.1, 1.35, 0.15), 'ink'), (T(box(1.0, 0.5, 0.9), -0.45, 0.62, 0), 'tractor')]
    for k in range(5): P.append((T(box(0.11, 0.03, 0.56), 1.6, 0.56 + k * 0.1, 0), 'steel'))
    # the cab: four posts, glass, the white roof
    P += [(T(box(1.0, 0.9, 1.0), -0.45, 1.25, 0), 'glassD'), (T(box(1.1, 0.1, 1.1), -0.45, 2.17, 0), 'white')]
    for sx in (-1, 1):
        for sz in (-1, 1): P.append((T(box(0.06, 0.92, 0.06), -0.45 + sx * 0.49, 1.25, sz * 0.49), 'tractor'))
    P += wheel(0.72, 0.42, -0.6, 0.78, rim='tractor', spokes=6) + wheel(0.72, 0.42, -0.6, -0.78, rim='tractor', spokes=6)
    P += wheel(0.42, 0.24, 1.25, 0.66, rim='tractor') + wheel(0.42, 0.24, 1.25, -0.66, rim='tractor')
    for sz in (-1, 1): P.append((T(box(0.9, 0.05, 0.45), -0.6, 1.45, sz * 0.78), 'tractor'))  # rear mudguards
    # the trailer of grapes behind
    P += [(T(box(1.9, 0.5, 1.3), -2.5, 0.7, 0), 'wood'), (T(box(1.9, 0.08, 1.3), -2.5, 0.62, 0), 'ink'), (T(box(0.8, 0.06, 0.06), -1.45, 0.62, 0), 'ink')]
    for k in range(9): P.append((T(ball(0.22, 6, 4), -3.2 + (k % 3) * 0.6, 1.2 + (k // 3 == 1) * 0.08, -0.4 + (k // 3) * 0.4), 'grape'))
    P += wheel(0.36, 0.22, -2.5, 0.72, rim='steel') + wheel(0.36, 0.22, -2.5, -0.72, rim='steel')
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ boats
def _hull(L, B, D, sheer=0.15, bow=0.35, stern=0.75, n=9, keel_mat='hull', top_mat='hull', deck_mat='deck'):
    """a displacement hull lofted from sections: fine entry at the bow (+x), fuller transom at the stern,
    the sheer rising forward"""
    rings = []
    for k in range(n):
        u = k / (n - 1); x = -L / 2 + L * u
        full = (u / 0.35) ** 0.6 if u < 0.35 else (1.0 if u < 0.62 else max(0.0, (1 - u) / 0.38) ** 0.75)
        full = max(full, stern if u < 0.05 else 0.0) if u < 0.35 else full
        hw = B / 2 * max(0.03, full); top = D + sheer * max(0, u - 0.5) * 2; keel = D * 0.45 * min(1, full * 1.4)
        ring = [(0, -keel * (1 - 0.3 * (u > 0.85))), (hw * 0.55, -keel * 0.7), (hw * 0.95, -keel * 0.1), (hw, top * 0.55), (hw * 1.02, top),
                (-hw * 1.02, top), (-hw, top * 0.55), (-hw * 0.95, -keel * 0.1), (-hw * 0.55, -keel * 0.7)]
        rings.append([(x, y, z) for z, y in ring])
    def mats(r, i):
        if i == 4: return deck_mat
        if i in (3, 5): return top_mat
        return keel_mat
    return loft(rings, mats, caps=(top_mat, None))


def sail_shape(foot, luff, belly, x0, y0, aft=True, n=5, rows=4):
    """a curved triangular sail: the luff on a mast at x0, the foot along the boom, bellied to one side"""
    V, F = [], []
    for j in range(rows + 1):
        v = j / rows
        for i in range(n + 1):
            u = i / n * (1 - v)
            x = x0 + (-u if aft else u) * foot; y = y0 + v * luff + u * 0.05 * luff
            z = belly * math.sin(PI * min(1, u / max(1e-6, 1 - v))) * (1 - v * 0.6) * (1 - v) if v < 1 else 0
            V.append((x, y, z))
    W = n + 1
    for j in range(rows):
        for i in range(n): F.append((j * W + i, j * W + i + 1, (j + 1) * W + i + 1, (j + 1) * W + i))
    return Geo(V, F)


def yacht(s=M_, hull='white', stripe='hull'):
    """a 10 m sloop, the kind moored at Batumi's marina: white hull, low coachroof, mast, boom, mainsail and jib"""
    P = _hull(10.0, 3.3, 1.1, sheer=0.25, top_mat='white', keel_mat=hull, deck_mat='deck')
    P += [(T(box(3.4, 0.45, 2.0), -0.6, 1.1, 0), 'white'), (T(box(3.0, 0.12, 2.04), -0.6, 1.3, 0), 'glassD'), (T(box(9.0, 0.1, 3.36), 0.0, 0.9, 0), stripe)]
    P += [(T(box(0.12, 13.0, 0.12), 0.6, 1.1, 0), 'steel'), (T(box(4.0, 0.1, 0.1), -1.4, 2.4, 0), 'steel'),
          (tube([np.array((0.6, 14.0, 0)), np.array((4.9, 1.2, 0))], 0.02, 3, caps=False), 'ink'), (tube([np.array((0.6, 14.0, 0)), np.array((-4.9, 1.2, 0))], 0.02, 3, caps=False), 'ink')]
    P.append((sail_shape(3.9, 11.0, 0.5, 0.5, 2.5, aft=True), 'sail'))
    P.append((sail_shape(4.1, 11.5, 0.6, 0.7, 1.3, aft=False), 'sail'))
    P += [(T(box(0.5, 1.3, 0.05), -4.0, -0.6, 0), 'ink'), (T(box(0.8, 1.1, 0.07), 0.2, -1.0, 0), 'ink')]   # rudder and keel
    return scaled(P, s * 0.62)


def ferry(s=M_):
    """a passenger ship off Batumi: a flared bow, black hull with a red boot-top, three white decks of windows,
    the bridge forward, lifeboats in their davits, the funnel"""
    P = _hull(46.0, 9.0, 3.2, sheer=0.8, top_mat='hull', keel_mat='red', deck_mat='deck', n=11)
    P += [(T(box(44.0, 0.25, 9.05), 0, 2.2, 0), 'white')]
    decks = [(30.0, 2.4, 8.4, -2.0), (24.0, 2.3, 8.0, -1.5), (14.0, 2.2, 6.8, 1.0)]
    y = 3.2
    for L_, h, w, x in decks:
        P += [(T(box(L_, h, w), x, y, 0), 'white')]
        for sz in (-1, 1): P.append((T(box(L_ * 0.94, h * 0.32, 0.05), x, y + h * 0.42, sz * (w / 2 + 0.02)), 'glassD'))
        y += h
    P += [(T(box(3.0, 1.6, 7.2), 6.5, y - 2.2, 0), 'glassD'), (T(box(3.4, 0.3, 9.4), 6.6, y - 0.55, 0), 'white')]   # the bridge and its wings
    P += [(T(cyl(1.3, 4.0, 10, 1.6), -9.0, y, 0, rz=0.12), 'white'), (T(cyl(1.32, 1.0, 10), -9.45, y + 3.0, 0, rz=0.12), 'red'), (T(cyl(1.1, 0.4, 10), -9.55, y + 4.0, 0, rz=0.12), 'ink')]
    for x in (-8.0, -2.0, 4.0):
        for sz in (-1, 1): P += [(T(box(4.0, 1.2, 1.4), x, 5.6, sz * 4.7), 'tractor'), (T(box(0.15, 1.6, 0.15), x - 1.6, 5.6, sz * 4.2), 'steel'), (T(box(0.15, 1.6, 0.15), x + 1.6, 5.6, sz * 4.2), 'steel')]
    P += [(T(box(0.3, 6.0, 0.3), 3.0, y, 0), 'white'), (T(box(0.2, 0.2, 3.0), 3.0, y + 5.0, 0), 'white')]
    return scaled(P, s * 0.42)


def fishing_boat(s=M_):
    """a small inshore fishing boat: blue wooden hull, a wheelhouse aft, a mast with a lamp, nets on deck"""
    P = _hull(8.0, 2.8, 1.2, sheer=0.35, top_mat='blue', keel_mat='white', deck_mat='deck')
    P += [(T(box(1.8, 1.8, 1.8), -1.8, 1.1, 0), 'white'), (T(box(1.9, 0.6, 1.84), -1.8, 2.1, 0), 'glassD'), (T(box(2.1, 0.12, 2.0), -1.8, 2.9, 0), 'red'),
          (T(box(0.1, 4.0, 0.1), 1.6, 1.1, 0), 'wood'), (T(ball(0.15, 5, 3), 1.6, 5.1, 0), 'lamp'), (T(box(1.6, 0.35, 1.4), 1.0, 1.2, 0), 'tyre')]
    return scaled(P, s * 0.62)


# ------------------------------------------------------------------------------------------------ birds
def _wing_plate(span, chord, fingers, side, tip_mat, base_mat, sweep=0.15, th=0.02):
    """a wing seen from above: a broad arm, a tapering hand and splayed primaries (fingers) at the tip"""
    parts = []
    # the inner wing as a quad strip from the body out to the wrist
    Vb = [(chord * 0.45, 0, 0), (-chord * 0.55, 0, 0), (-chord * 0.5 - sweep * span * 0.3, 0, span * 0.55), (chord * 0.4 - sweep * span * 0.15, 0.02 * span, span * 0.55)]
    Vh = [Vb[3], Vb[2], (-chord * 0.35 - sweep * span * 0.55, 0.0, span * 0.82), (chord * 0.15 - sweep * span * 0.4, 0.01 * span, span * 0.84)]
    for V, m in ((Vb, base_mat), (Vh, base_mat)):
        Vt = [(x, y + th / 2, z * side) for x, y, z in V] + [(x, y - th / 2, z * side) for x, y, z in V]
        parts.append((Geo(Vt, [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]), m))
    x0, x1 = Vh[3][0], Vh[2][0]
    for f in range(fingers):
        t = f / max(1, fingers - 1); xb = x0 + (x1 - x0) * t; L = span * (0.2 - 0.06 * abs(t - 0.35)); a = 0.35 - 0.6 * t
        tipx, tipz = xb - math.sin(a) * L * 0.4 - sweep * L, span * 0.83 + math.cos(abs(a)) * L
        w = chord * 0.09
        V = [(xb + w, 0, span * 0.82), (xb - w, 0, span * 0.82), (tipx, 0.01 * span, tipz)]
        Vt = [(x, y + th / 2, z * side) for x, y, z in V] + [(x, y - th / 2, z * side) for x, y, z in V]
        parts.append((Geo(Vt, [(0, 1, 2), (5, 4, 3), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]), tip_mat))
    return parts


def eagle_body(s=1.0):
    """a golden eagle in flight: heavy dark-brown body, the golden nape, a hooked yellow-and-dark beak, the fanned tail.
    Units: landmark units, body along +x (head forward)."""
    P = [(T(ball(0.0042, 7, 5), 0, 0, 0, s=(1.9, 0.75, 0.85)), 'eagleD'), (T(ball(0.0026, 6, 4), 0.0068, 0.0007, 0, s=(1.15, 0.9, 0.9)), 'eagleN'),
         (T(cone(0.0012, 0.0032, 5), 0.0094, 0.0004, 0, rz=-PI / 2), 'yellow'), (T(cone(0.0007, 0.0014, 5), 0.0108, 0.0002, 0, rz=-PI / 2 - 0.4), 'ink')]
    tail = [(-0.006, 0, -0.0014), (-0.006, 0, 0.0014), (-0.0118, 0, 0.0034), (-0.0128, 0, 0.0), (-0.0118, 0, -0.0034)]
    Vt = [(x, y + 0.0003, z) for x, y, z in tail] + [(x, y - 0.0003, z) for x, y, z in tail]
    P.append((Geo(Vt, [tuple(range(5)), tuple(range(5, 10))[::-1]] + [(i, (i + 1) % 5, 5 + (i + 1) % 5, 5 + i) for i in range(5)]), 'eagleD'))
    P += [(T(box(0.0012, 0.0016, 0.0008), -0.002, -0.003, z), 'yellow') for z in (-0.0012, 0.0012)]   # feet tucked under
    return [(Geo(g.V * s, g.F), m) for g, m in P]


def eagle_wing(side, s=1.0):
    return [(Geo(g.V * s, g.F), m) for g, m in _wing_plate(0.0185, 0.0092, 6, side, 'eagleT', 'eagleD', sweep=0.04, th=0.0006)]


def gull_body(s=1.0):
    """a yellow-legged gull: white head and body, grey mantle, yellow bill with the red spot, short square tail"""
    P = [(T(ball(0.0034, 7, 5), 0, 0, 0, s=(1.9, 0.8, 0.85)), 'white'), (T(ball(0.0022, 6, 4), 0.0056, 0.0012, 0), 'white'),
         (T(cone(0.0008, 0.0034, 5), 0.0084, 0.0009, 0, rz=-PI / 2), 'yellow'), (T(box(0.0006, 0.0006, 0.0005), 0.0088, 0.0006, 0), 'red'),
         (T(box(0.0042, 0.0005, 0.0032), -0.0072, 0.0002, 0), 'white'), (T(box(0.0012, 0.0005, 0.0032), -0.0096, 0.0002, 0), 'ink')]
    return [(Geo(g.V * s, g.F), m) for g, m in P]


def gull_wing(side, s=1.0):
    return [(Geo(g.V * s, g.F), m) for g, m in _wing_plate(0.02, 0.0052, 4, side, 'ink', 'gullG', sweep=0.35, th=0.0005)]


VEHICLE_MATS = dict(delW=(0xf2f1ec, 0.45), delD=(0x3b3f45, 0.7), delG=(0x22303c, 0.15), amber=(0xf0a030, 0.5), lcW=(0xece9e1, 0.5),
                    lcBag=(0x5d5a4c, 0.9), uazG=(0x5e6b4a, 0.75), eagleD=(0x4a3424, 0.9), eagleN=(0xb98a45, 0.9), eagleT=(0x2c211a, 0.9),
                    gullG=(0x9aa3ab, 0.8))


# ------------------------------------------------------------------------------------------------ showroom
def showroom(SHOW, extra_mats=None, sub='vehicles'):
    """build a "Workshop" scene with each (name, parts) 40 m apart and render two close-ups of each to blender/renders/<sub>/
    (only the names given as ARGS, if any)"""
    import bpy, os, bmesh
    from mathutils import Vector
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'blender', 'renders', sub)
    os.makedirs(out_dir, exist_ok=True)
    def _srgb(h): c = [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]; return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    BASE_MATS = dict(white=0xf8f6f1, ink=0x2a2d33, steel=0xc9cdd3, tyre=0x1b1d22, lamp=0xfff1b8, red=0xD62839, tractor=0xD62839, glassD=0x6f9fbe,
                     wood=0x7a5233, grape=0x5a2b5c, hull=0x1f3a5f, deck=0xc89b62, sail=0xfbfaf6, blue=0x2f6db5, yellow=0xf2c14e)
    allm = {k: (v, 0.7) for k, v in BASE_MATS.items()}; allm.update(VEHICLE_MATS); allm.update(extra_mats or {})
    sc = bpy.data.scenes.get('Workshop') or bpy.data.scenes.new('Workshop')
    for o in list(sc.objects): bpy.data.objects.remove(o, do_unlink=True)
    def mat(name):
        m = bpy.data.materials.get('ws_' + name)
        if not m:
            m = bpy.data.materials.new('ws_' + name); m.use_nodes = True
            hexv, rough = allm.get(name, (0xff00ff, 0.5)); b = m.node_tree.nodes['Principled BSDF']
            b.inputs['Base Color'].default_value = (*_srgb(hexv), 1); b.inputs['Roughness'].default_value = rough
        return m
    def make(name, parts, loc):
        Vs, Fs, mi, mats, off = [], [], [], [], 0
        for g, m in parts:
            if m not in mats: mats.append(m)
            Vs.append(np.column_stack((g.V[:, 0], -g.V[:, 2], g.V[:, 1]))); Fs += [tuple(i + off for i in f) for f in g.F]; mi += [mats.index(m)] * len(g.F); off += len(g.V)
        me = bpy.data.meshes.get(name)
        if me: bpy.data.meshes.remove(me)
        me = bpy.data.meshes.new(name); me.from_pydata((np.vstack(Vs) / M_).tolist(), [], Fs)
        for m in mats: me.materials.append(mat(m))
        me.polygons.foreach_set('material_index', mi)
        bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = False
        me.update(); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.location = loc
        return ob, len(me.vertices)
    which = [a for a in globals().get('ARGS', []) if '=' not in a] or [n for n, _ in SHOW]
    stats = {}
    for k, (nm, parts) in enumerate(SHOW):
        if nm in which: ob, nv = make('ws_' + nm, parts, (k * 200.0, 0, 0)); stats[nm] = nv
    sun = bpy.data.objects.new('ws_sun', bpy.data.lights.new('ws_sun', 'SUN')); sun.data.energy = 4; sc.collection.objects.link(sun)
    sun.rotation_euler = (-Vector((-4.2, -3.4, 6.5))).to_track_quat('-Z', 'Y').to_euler()
    sc.world = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
    sc.render.engine = 'BLENDER_EEVEE'; sc.render.film_transparent = False; sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 900, 600, 100
    cd = bpy.data.cameras.new('ws_cam'); cd.lens = 50; cd.clip_end = 2000; cam = bpy.data.objects.new('ws_cam', cd); sc.collection.objects.link(cam); sc.camera = cam
    for nm in stats:
        ob = bpy.data.objects['ws_' + nm]
        bb = [ob.location + Vector(c) for c in ob.bound_box]; c = sum(bb, Vector()) / 8; r = max((p - c).length for p in bb)
        for view, (yaw, el) in (('a', (0.75, 18)), ('b', (-2.4, 22))):
            e = math.radians(el); cam.location = c + Vector((math.sin(yaw) * math.cos(e), -math.cos(yaw) * math.cos(e), math.sin(e))) * r * 2.6
            cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out_dir, '%s_%s.png' % (nm, view))
            bpy.ops.render.render(write_still=True, scene=sc.name)
    print('showroom verts', stats)


if SHOWROOM and not globals().get('_VEH_NO_SHOW'):
    SHOW = [('delica', delica()), ('land_cruiser', land_cruiser()), ('uaz', uaz_bukhanka()), ('tractor', mtz_tractor()),
            ('yacht', yacht()), ('ferry', ferry()), ('fishing', fishing_boat()),
            ('eagle', eagle_body() + eagle_wing(1) + eagle_wing(-1)), ('gull', gull_body() + gull_wing(1) + gull_wing(-1))]
    showroom(SHOW)
