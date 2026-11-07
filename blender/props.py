"""
Moving props for the Georgia model's scenery: lifts and the people on them, skiers, paragliders, trains, port cranes,
ships, beach craft, traffic, walkers, riders and flocks. Low-poly, but each modelled on the real thing.

Loaded by build_georgia.py after vehicles.py (exec'd into its namespace, so it uses the kit and vehicles.py's
loft/body_shell/wheel/_hull). Makers return (Geo, material) parts in metres scaled to landmark units (M_), y up,
travel direction +x, standing on y = 0 (hanging things hang from y = 0).

Run on its own (python3 blender/bl.py blender/props.py [names...]) to render a showroom to blender/renders/props/.
"""
import math, random
import numpy as np

if 'Geo' not in globals():   # standalone: borrow the kit and the vehicles, then show the props
    import os
    _here = os.path.dirname(os.path.abspath(__file__))
    PROPS_SHOWROOM = True
    _VEH_NO_SHOW = True
    exec(compile(open(os.path.join(_here, 'vehicles.py')).read(), os.path.join(_here, 'vehicles.py'), 'exec'), globals())
else:
    PROPS_SHOWROOM = False

_pr = random.Random(7)
LS = M_ * 0.5   # the lifts' scale: cabins, chairs, towers and stations read beside the houses
JACKETS = ['jkR', 'jkB', 'jkY', 'jkT', 'jkK', 'jkP', 'jkO']


# ------------------------------------------------------------------------------------------------ people (metres)
def figure(jacket='jkR', pants='jkK', pose='stand', helmet=None, skin='skin'):
    """a person ~1.75 m, facing +x. pose: stand, walk, ski (crouched), sit, climb (arms up), ride (astride)"""
    P = []
    if pose == 'sit':
        P += [(T(box(0.5, 0.16, 0.36), 0.18, 0.42, 0), pants), (T(box(0.14, 0.44, 0.34), 0.42, 0.0, 0), pants),
              (T(box(0.3, 0.6, 0.42), 0.0, 0.5, 0), jacket)]
        hy = 1.2
    elif pose == 'ride':
        for sz in (-1, 1): P.append((T(box(0.16, 0.72, 0.14), 0.05, -0.3, sz * 0.32, rx=-sz * 0.2), pants))
        P.append((T(box(0.3, 0.62, 0.42), 0, 0.48, 0), jacket)); hy = 1.2
    else:
        lean = {'stand': 0.0, 'walk': 0.08, 'ski': 0.35, 'climb': 0.0}[pose]
        knee = 0.55 if pose == 'ski' else 0.0
        for sz in (-1, 1):
            sw = 0.3 * sz if pose == 'walk' else 0.0
            P.append((T(box(0.16, 0.46, 0.15), 0.0, 0.0, sz * 0.1, rz=sw - knee * 0.6), pants))          # shin
            P.append((T(box(0.17, 0.46, 0.16), -0.05 + knee * 0.18, 0.44 - knee * 0.08, sz * 0.1, rz=-sw * 0.5 + knee * 0.7), pants))  # thigh
        y0 = 0.86 - knee * 0.14
        P.append((T(box(0.3, 0.6, 0.42), 0.04 * knee, y0, 0, rz=-lean), jacket))
        hy = y0 + 0.66 * math.cos(lean); hx = 0.66 * math.sin(lean)
        for sz in (-1, 1):
            if pose == 'climb': P.append((T(box(0.12, 0.62, 0.12), 0.06, y0 + 0.5, sz * 0.24), jacket))
            else: P.append((T(box(0.12, 0.58, 0.12), hx * 0.5 + (0.12 if pose == 'ski' else 0), y0 + 0.02, sz * 0.27, rz=0.25 if pose == 'ski' else 0.0), jacket))
        P.append((T(ball(0.12, 6, 4), hx + 0.02, hy + 0.12, 0), skin))
        if helmet: P.append((T(dome(0.135, 6, 2), hx + 0.0, hy + 0.12, 0), helmet))
        return P
    P += [(T(box(0.12, 0.5, 0.12), 0.18, 0.62, sz * 0.25, rz=-0.9), jacket) for sz in (-1, 1)]
    P.append((T(ball(0.12, 6, 4), 0.02, hy + 0.12, 0), skin))
    if helmet: P.append((T(dome(0.135, 6, 2), 0.0, hy + 0.12, 0), helmet))
    return P


def skier(jacket='jkR', s=M_ * 0.62, board=False):
    """a skier in a carving crouch: skis, poles, helmet; or a snowboarder side-on on a board"""
    if board:
        P = [(T(box(1.55, 0.04, 0.3), 0, 0, 0), 'jkK')] + [(T(g, 0, 0.04, 0, ry=PI / 2), m) for g, m in figure(jacket, 'jkK', 'ski', helmet='white')]
    else:
        P = [(T(box(1.75, 0.03, 0.09), 0.05, 0, z), 'jkK') for z in (-0.12, 0.12)] + [(T(g, 0, 0.03, 0), m) for g, m in figure(jacket, 'jkK', 'ski', helmet='white')]
        P += [(tube([np.array((0.32, 0.95, z * 0.36)), np.array((-0.45, 0.1, z * 0.42))], 0.015, 3), 'steel') for z in (-1, 1)]
    return scaled(P, s)


def walker(jacket=None, s=M_ * 0.62):
    return scaled(figure(jacket or _pr.choice(JACKETS), _pr.choice(['jkK', 'jkB', 'wood']), 'walk'), s)


def monk(s=M_ * 0.62):
    """a monk in a black cassock, climbing (Katskhi's ladder)"""
    P = figure('ink', 'ink', 'climb') + [(T(cyl(0.2, 0.9, 6, 0.3), 0, 0.15, 0), 'ink'), (T(box(0.16, 0.2, 0.2), 0.08, 1.5, 0), 'ink')]
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ animals (metres)
def sheep_m(wool='wool'):
    return [(T(ball(0.45, 6, 4), 0, 0.62, 0, s=(1.35, 0.85, 0.95)), wool), (T(ball(0.18, 5, 3), 0.62, 0.78, 0, s=(1.3, 1, 0.85)), 'ink')] + \
           [(T(box(0.08, 0.4, 0.08), x, 0, z), 'ink') for x in (-0.3, 0.3) for z in (-0.18, 0.18)]


def dog_m(col='eagleN'):
    """a Caucasian shepherd dog: big, shaggy, tawny"""
    return [(T(ball(0.36, 6, 4), 0, 0.6, 0, s=(1.6, 0.9, 0.9)), col), (T(ball(0.22, 5, 4), 0.55, 0.85, 0), col), (T(box(0.16, 0.12, 0.14), 0.75, 0.8, 0), 'ink'),
            (T(cone(0.08, 0.4, 4), -0.55, 0.7, 0, rz=1.2), col)] + [(T(box(0.1, 0.42, 0.1), x, 0, z), col) for x in (-0.35, 0.35) for z in (-0.14, 0.14)]


def horse_m(col='horse', mane='horseD'):
    P = [(T(ball(0.55, 7, 4), 0, 1.35, 0, s=(1.75, 0.85, 0.75)), col), (T(box(0.32, 0.8, 0.28), 0.85, 1.45, 0, rz=-0.6), col),
         (T(box(0.62, 0.26, 0.24), 1.25, 1.95, 0, rz=0.35), col), (T(box(0.1, 0.55, 0.06), 0.7, 1.75, 0, rz=-0.6), mane),
         (T(cone(0.1, 0.8, 5), -0.95, 1.4, 0, rz=2.3), mane)]
    for x in (-0.65, 0.6):
        for z in (-0.2, 0.2): P += [(T(box(0.13, 0.95, 0.13), x, 0.0, z), col), (T(box(0.15, 0.1, 0.15), x, 0.0, z), 'ink')]
    return P


def rider(jacket='ink', s=M_ * 0.62, horse_col='horse'):
    """a horseman, as in Khevsureti and Tusheti: the horse, a saddle cloth, the rider astride"""
    P = horse_m(horse_col) + [(T(box(0.7, 0.08, 0.95), 0, 1.8, 0), 'red')] + [(T(g, 0.0, 1.4, 0), m) for g, m in figure(jacket, 'ink', 'ride', helmet=None)]
    P.append((T(cyl(0.2, 0.14, 6), 0.02, 2.82, 0), 'ink'))   # the felt hat
    return scaled(P, s)


def flock(n=9, seed=3, s=M_ * 0.62, shepherd=True):
    """a flock of sheep grazing as it moves, the shepherd in his burka with a crook, his dog at the side"""
    r = random.Random(seed); P = []
    for k in range(n):
        x, z = -r.random() * 5.5, (r.random() - 0.5) * 4.5
        P += [(T(g, x, 0, z, ry=(r.random() - 0.5) * 0.8), m) for g, m in sheep_m('wool' if k % 5 else 'horseD')]
    if shepherd:
        P += [(T(g, -6.6, 0, 0.6), m) for g, m in figure('ink', 'ink', 'walk')] + [(T(cyl(0.36, 1.2, 6, 0.5), -6.6, 0.4, 0.6), 'ink'), (T(cyl(0.2, 0.12, 6), -6.6, 1.78, 0.6), 'wool')]
        P += [(tube([np.array((-6.3, 0.0, 1.0)), np.array((-6.2, 2.0, 1.05)), np.array((-6.0, 2.2, 1.05))], 0.03, 3), 'wood')]
        P += [(T(g, -2.0, 0, 3.0), m) for g, m in dog_m()]
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ lifts (metres)
def gondola_cabin(col='jkR', s=LS):
    """a detachable 8-seat gondola cabin hanging from its grip at y = 0: rounded body, a band of glass, the hanger arm"""
    rings = []
    for y, k in ((-4.6, 0.82), (-4.5, 0.98), (-4.0, 1.0), (-3.25, 1.0), (-2.65, 0.92), (-2.5, 0.7)):
        pts = []
        for i in range(10):
            a = i / 10 * 2 * PI; c, s_ = math.cos(a), math.sin(a)
            pts.append((k * 1.0 * np.sign(c) * min(1, abs(c) * 1.5), y, k * 0.95 * np.sign(s_) * min(1, abs(s_) * 1.5)))
        rings.append(pts)
    P = loft(rings, lambda r, i: 'glassD' if r == 2 else ('white' if r in (0, 4) else col), caps=(col, 'white'))
    P += [(tube([np.array((0, -2.5, 0)), np.array((0.0, -1.2, 0.3)), np.array((0, -0.3, 0.1)), np.array((0, 0, 0))], 0.07, 5), 'steel'),
          (T(box(0.6, 0.3, 0.3), 0, -0.15, 0), 'ink')]
    return scaled(P, s)


def chair(n=4, s=LS, riders=2, seed=0):
    """a fixed-grip chairlift chair hanging at y = 0: hanger, bench, backrest, foot bar, and skiers sitting on it"""
    r = random.Random(seed); w = 0.62 * n
    P = [(tube([np.array((0, 0, 0)), np.array((0, -1.8, 0)), np.array((-0.3, -2.4, 0))], 0.05, 4), 'steel'),
         (T(box(0.55, 0.08, w), -0.1, -2.45, 0), 'ink'), (T(box(0.08, 0.6, w), -0.38, -2.45, 0, rz=0.15), 'ink'),
         (T(box(0.06, 0.06, w), 0.5, -2.85, 0), 'steel'), (tube([np.array((-0.38, -1.7, -w / 2)), np.array((0.5, -1.75, -w / 2)), np.array((0.5, -2.85, -w / 2))], 0.03, 3), 'steel')]
    seats = list(range(n)); r.shuffle(seats)
    for k in seats[:riders]:
        z = -w / 2 + 0.31 + k * 0.62
        P += [(T(g, -0.05, -2.95, z), m) for g, m in figure(r.choice(JACKETS), 'jkK', 'sit', helmet='white')]
        P += [(T(box(1.6, 0.03, 0.08), 0.5, -3.0, z + dz), 'jkK') for dz in (-0.1, 0.1)]
    return scaled(P, s)


def lift_pylon(h, s=LS, col='alu'):
    """a lift tower: a tapered tube, the crossarm, a sheave train each side, the maintenance ladder"""
    P = [(cyl(0.45, h, 8, 0.7), col), (T(box(0.9, 0.5, 6.4), 0, h, 0), col)]
    for z in (-2.9, 2.9): P += [(T(box(2.6, 0.28, 0.3), 0, h - 0.32, z), 'ink'), (T(box(0.12, 0.6, 0.12), 0, h - 0.4, z), col)]
    P.append((T(box(0.06, h, 0.4), 0.48, 0, 0), 'ink'))
    return scaled(P, s)


def lift_station(top=False, s=LS, col='jkR'):
    """a lift terminal: the concrete base, the drive/return house with the bullwheel under its canopy"""
    P = [(box(6.0, 3.5, 7.0), 'concrete'), (T(box(7.0, 2.6, 6.6), 0, 3.5, 0), col), (T(box(8.0, 0.5, 7.4), 0, 6.1, 0), 'white'),
         (T(torus(2.9, 0.25, 4, 16), 0, 5.2, 0, rx=PI / 2), 'ink'), (T(box(3.0, 2.6, 3.4), 4.6 if top else -4.6, 0, 0), 'glassD')]
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ air
def paraglider(cols=('jkR', 'white'), s=M_ * 0.5):
    """a tandem paraglider: the arched canopy of cells, the lines, pilot and passenger in their harnesses"""
    P = []; n = 11; R = 4.6; span = 2.25
    for i in range(n):
        a = -span / 2 + span * (i + 0.5) / n; c, s_ = math.cos(a), math.sin(a)
        P.append((T(box(2.3 - abs(a) * 0.5, 0.32, 2 * R * math.sin(span / n / 2) * 1.04), 0, 6.0 + R * c - R, R * s_, rx=a), cols[i % 2]))
    for a in (-span / 2, -span / 4, span / 4, span / 2):
        P.append((tube([np.array((0.6, 6.0 + R * math.cos(a) - R, R * math.sin(a))), np.array((0.15, 0.3, 0))], 0.02, 3, caps=False), 'ink'))
        P.append((tube([np.array((-0.7, 6.0 + R * math.cos(a) - R, R * math.sin(a))), np.array((-0.15, 0.3, 0))], 0.02, 3, caps=False), 'ink'))
    P += [(T(g, 0.3, -1.0, 0), m) for g, m in figure('jkK', 'jkK', 'sit', helmet='jkY')] + [(T(g, -0.4, -0.75, 0), m) for g, m in figure(cols[0], 'jkK', 'sit', helmet='white')]
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ rail
def _railcar(L, H, body, band, roof, nose=0, deck2=False, pant=False, door=None, W=2.9, wheel_r=0.45, bogies=None):
    """a rail car body: rounded roof, a band of windows (two bands for a double-decker), the ends, bogies"""
    xs = [-L / 2, L / 2]
    rings = []
    def ring(x, k=1.0):
        hw = W / 2 * k
        return [(x, 0.9, -hw * 0.95), (x, 1.0, -hw), (x, H - 0.55, -hw), (x, H - 0.15, -hw * 0.8), (x, H, -hw * 0.4), (x, H, hw * 0.4), (x, H - 0.15, hw * 0.8),
                (x, H - 0.55, hw), (x, 1.0, hw), (x, 0.9, hw * 0.95)]
    xr = [-L / 2, L / 2 - nose] + ([L / 2 - nose * 0.4, L / 2] if nose else [])
    for k, x in enumerate(xr):
        rr = ring(x)
        if nose and k == len(xr) - 2: rr = [(p[0], p[1] if p[1] < H - 0.6 else H - 0.4 - (H - p[1]) * 0.6, p[2] * 0.92) for p in rr]
        if nose and k == len(xr) - 1: rr = [(p[0], min(p[1], 1.0 + (p[1] - 1.0) * 0.45), p[2] * 0.75) for p in rr]
        rings.append(rr)
    P = loft(rings, lambda r, i: roof if i in (3, 4, 5) else (body if i in (0, 8, 9) else body), caps=(body, body))
    bands = [(H * 0.52, H * 0.18)] if not deck2 else [(1.9, 0.75), (H * 0.66, 0.75)]
    for (yb, hb) in bands:
        for sz in (-1, 1):
            P.append((T(box(L - nose - 1.2, hb, 0.05), -nose / 2, yb, sz * (W / 2 + 0.01)), 'glassD'))
    if band: P += [(T(box(L - 0.2, 0.32, W + 0.04), 0, 1.15, 0), band)]
    if door:
        for x in door:
            for sz in (-1, 1): P.append((T(box(1.3, H - 1.6, 0.06), x, 1.0, sz * (W / 2 + 0.02)), 'jkK'))
    if nose: P.append((T(box(0.1, 1.1, W * 0.6), L / 2 - nose * 0.35, H * 0.5, 0, rz=0.75), 'glassD'))
    if pant: P += [(T(box(1.6, 0.1, 0.1), 0, H + 0.45, 0, rz=0.4), 'ink'), (T(box(1.4, 0.1, 0.1), 0.6, H + 0.4, 0, rz=-0.4), 'ink'), (T(box(0.2, 0.06, 1.6), 0.9, H + 0.8, 0), 'ink')]
    for x in (bogies or (-L / 2 + 2.6, L / 2 - 2.6)):
        P.append((T(box(2.6, 0.5, W * 0.7), x, 0.35, 0), 'ink'))
        for dx in (-0.8, 0.8):
            for sz in (-1, 1): P.append((T(cyl(wheel_r, 0.12, 8), x + dx, wheel_r, sz * W * 0.36, rx=PI / 2), 'tyre'))
    return P


def kukushka_loco(s=M_ * 0.7):
    """the little electric engine of the Borjomi-Bakuriani narrow-gauge line: a short boxy cab body, the pantograph"""
    P = _railcar(7.5, 3.4, 'kuk', 'kukY', 'kuk', pant=True, W=2.3, wheel_r=0.4, bogies=(-2.2, 2.2))
    P += [(T(box(0.06, 0.9, 1.6), x, 1.9, 0), 'glassD') for x in (-3.78, 3.78)] + [(T(cyl(0.14, 0.08, 6), 3.8, 1.3, z, rz=PI / 2), 'lamp') for z in (-0.6, 0.6)]
    return scaled(P, s)


def kukushka_car(s=M_ * 0.7):
    return scaled(_railcar(10.0, 3.2, 'kuk', 'kukY', 'kuk', W=2.3, wheel_r=0.38, door=(-4.2, 4.2), bogies=(-3.4, 3.4)), s)


def kiss_car(lead=False, s=M_ * 0.3):
    """a Stadler KISS double-deck train of Georgian Railways (the Tbilisi-Batumi express): white, two decks of glass,
    the red stripe; the leading car has the sloping nose"""
    P = _railcar(26.0, 4.6, 'kiss', 'kissR', 'alu', nose=3.2 if lead else 0, deck2=True, pant=not lead, door=(-7.0, 7.0), W=2.9)
    if lead: P += [(T(cyl(0.16, 0.06, 6), 13.05, 1.35, z, rz=PI / 2), 'lamp') for z in (-0.9, 0.9)]
    return scaled(P, s)


def track(group, X0, Z0, pts_world, gauge=1.0, mat='rail', s=M_ * 0.5, sleepers=True):
    """a railway on the ground along a world polyline: ballast bed, two rails, sleepers"""
    C = [np.array(p, float) for p in pts_world]
    w = 3.2 * s * LM
    V, F, prev = [], [], None
    for k in range(len(C)):
        a, b = C[max(0, k - 1)], C[min(len(C) - 1, k + 1)]; t = b - a; t /= (np.linalg.norm(t) or 1); nx, nz = -t[1], t[0]
        c = C[k]; y = max(ground3(c[0], c[1]), ground3(c[0] + nx * w, c[1] + nz * w), ground3(c[0] - nx * w, c[1] - nz * w)) + 0.0006 * LM
        cur = len(V)
        for o in (-w, -w * 0.3, w * 0.3, w): V.append((c[0] + nx * o, y + (0.0004 * LM if abs(o) < w * 0.5 else 0), c[1] + nz * o))
        if prev is not None:
            F += [(prev + i, prev + i + 1, cur + i + 1, cur + i) for i in range(3)]
        prev = cur
    g = Geo(V, F); g.F = [f if _up(g.V, f) else f[::-1] for f in F]; emit(group, 'pebble', g)
    for o in (-gauge / 2, gauge / 2):
        R = []
        for k in range(len(C)):
            a, b = C[max(0, k - 1)], C[min(len(C) - 1, k + 1)]; t = b - a; t /= (np.linalg.norm(t) or 1); nx, nz = -t[1], t[0]
            c = C[k]; y = V[4 * k][1] + 0.0004 * LM
            R.append((c[0] + nx * o * s * LM, y + 0.0004 * LM, c[1] + nz * o * s * LM))
        emit(group, 'steel', tube(R, 0.00045 * LM, 3, caps=False))


# ------------------------------------------------------------------------------------------------ the port and the sea
def container_ship(s=M_ * 0.12, seed=1):
    """a feeder container ship: dark hull with red boot-top, holds stacked with containers in mixed liveries,
    the white accommodation block and bridge aft, the funnel"""
    r = random.Random(seed)
    P = _hull(130.0, 21.0, 9.0, sheer=1.5, top_mat='hull', keel_mat='red', deck_mat='deck', n=11)
    P.append((T(box(122.0, 0.4, 21.1), 0, 6.0, 0), 'white'))
    cols = ['cnO', 'cnG', 'cnB', 'cnR', 'cnW', 'cnY', 'cnB', 'cnR']
    for bay in range(7):
        x = -36 + bay * 13.5 + 18
        for row in range(6):
            hgt = r.randint(2, 4) if bay not in (0, 6) else r.randint(1, 3)
            for tier in range(hgt):
                P.append((T(box(12.0, 2.5, 3.0), x, 9.0 + tier * 2.55, -7.5 + row * 3.0), r.choice(cols)))
    P += [(T(box(12.0, 14.0, 18.0), -50.0, 9.0, 0), 'white'), (T(box(12.4, 1.6, 18.2), -50.0, 20.0, 0), 'glassD'), (T(box(8.0, 0.5, 23.0), -46.5, 22.5, 0), 'white'),
          (T(box(4.0, 7.0, 4.5), -55.0, 23.0, 0), 'white'), (T(box(4.1, 1.6, 4.6), -55.0, 28.0, 0), 'red'), (T(box(0.4, 6.0, 0.4), -48.0, 23.0, 0), 'white')]
    return scaled(P, s)


def tug(s=M_ * 0.22):
    P = _hull(24.0, 8.5, 3.6, sheer=1.0, top_mat='red', keel_mat='ink', deck_mat='deck', n=9)
    P += [(T(box(6.0, 3.0, 5.0), 1.5, 3.6, 0), 'white'), (T(box(6.2, 0.9, 5.1), 1.5, 5.3, 0), 'glassD'), (T(box(6.6, 0.3, 5.6), 1.5, 6.6, 0), 'red'),
          (T(cyl(0.7, 3.0, 8), -2.5, 3.6, 0), 'ink'), (T(box(24.5, 0.8, 0.8), 0, 2.4, 4.3), 'tyre'), (T(box(24.5, 0.8, 0.8), 0, 2.4, -4.3), 'tyre')]
    return scaled(P, s)


def sts_crane(s=M_ * 0.12, col='cnR'):
    """a ship-to-shore container crane: the portal on its rails, the boom out over the water (+x), the apex and
    backstays, the machinery house. The trolley is separate (sts_trolley) so it can run along the boom."""
    P = []
    for x in (-9.0, 9.0):
        for z in (-9.0, 9.0): P.append((T(box(1.6, 44.0, 1.6), x, 0, z), col))
        P.append((T(box(2.0, 1.8, 20.0), x, 0, 0), 'ink'))
    for y in (14.0, 42.0):
        for z in (-9.0, 9.0): P.append((T(box(20.0, 1.6, 1.6), 0, y, z), col))
        for x in (-9.0, 9.0): P.append((T(box(1.6, 1.6, 19.6), x, y, 0), col))
    for z in (-6.0, 6.0): P.append((T(box(110.0, 3.0, 1.4), 22.0, 44.0, z), 'white'))   # boom (seaward) and back-reach
    for z in (-7.5, 7.5):
        P.append((tube([np.array((-6.0, 45.0, z)), np.array((-2.0, 72.0, z * 0.5))], 0.6, 4), col))
        P.append((tube([np.array((8.0, 45.0, z)), np.array((-2.0, 72.0, z * 0.5))], 0.6, 4), col))
        P.append((tube([np.array((-2.0, 72.0, z * 0.5)), np.array((70.0, 46.5, z * 0.8))], 0.25, 3, caps=False), 'ink'))
        P.append((tube([np.array((-2.0, 72.0, z * 0.5)), np.array((-30.0, 46.5, z * 0.8))], 0.25, 3, caps=False), 'ink'))
    P += [(T(box(14.0, 7.0, 14.0), -22.0, 47.0, 0), 'white'), (T(box(14.5, 1.0, 14.5), -22.0, 54.0, 0), col)]
    return scaled(P, s)


def sts_trolley(s=M_ * 0.12):
    """the trolley with its cab and the spreader hanging below, carrying a container"""
    P = [(T(box(8.0, 2.5, 14.0), 0, 43.0, 0), 'ink'), (T(box(3.0, 3.0, 3.0), 0, 39.6, 4.0), 'glassD')]
    P += [(tube([np.array((0, 43.0, z)), np.array((0, 18.0, z))], 0.12, 3, caps=False), 'ink') for z in (-3.0, 3.0)]
    P += [(T(box(12.5, 1.0, 3.2), 0, 17.0, 0), 'yellow'), (T(box(12.0, 2.5, 3.0), 0, 14.4, 0), 'cnB')]
    return scaled(P, s)


def jetski(col='jkY', s=M_ * 0.5):
    P = [(T(ball(1.0, 7, 4), 0, 0.3, 0, s=(1.6, 0.45, 0.6)), col), (T(box(1.0, 0.25, 0.5), -0.2, 0.5, 0), 'jkK'), (T(box(0.2, 0.4, 0.9), 0.7, 0.55, 0), 'jkK')]
    P += [(T(g, -0.3, 0.55, 0), m) for g, m in figure('jkO', 'jkK', 'sit')]
    return scaled(P, s)


def kitesurfer(kite=('jkR', 'jkY'), s=M_ * 0.5):
    """a kitesurfer on the board, leaning back against the kite, which flies high and downwind (-z side)"""
    P = [(T(box(1.4, 0.06, 0.42), 0, 0.15, 0), 'jkT')] + [(T(g, 0, 0.2, 0, rx=-0.45), m) for g, m in figure('jkK', 'jkK', 'stand')]
    n = 9; R = 5.0; span = 2.4; kx, ky, kz = 3.0, 13.0, -8.0
    for i in range(n):
        a = -span / 2 + span * (i + 0.5) / n
        P.append((T(box(1.8 - abs(a) * 0.4, 0.2, 2 * R * math.sin(span / n / 2) * 1.05), kx, ky + R * math.cos(a) - R, kz + R * math.sin(a), rx=a), kite[i % 2]))
    for a in (-span / 2, span / 2):
        P.append((tube([np.array((kx, ky + R * math.cos(a) - R, kz + R * math.sin(a))), np.array((0.2, 1.3, 0.0))], 0.02, 3, caps=False), 'ink'))
    return scaled(P, s)


def parasail(s=M_ * 0.5, col=('jkR', 'jkY')):
    """a speedboat towing a parasail: the rope rising astern to the round canopy with its passenger"""
    P = _hull(7.0, 2.4, 1.0, sheer=0.3, top_mat='white', keel_mat='blue', deck_mat='white')
    P += [(T(box(1.2, 0.9, 1.6), 0.4, 0.8, 0), 'glassD')]
    P.append((tube([np.array((-3.4, 1.2, 0)), np.array((-26.0, 13.0, 0))], 0.04, 3, caps=False), 'ink'))
    for k in range(10):
        a = k / 10 * 2 * PI
        P.append((T(box(2.1, 0.18, 2.1), -27.0 + math.cos(a) * 2.6, 19.4 - 0.6, math.sin(a) * 2.6, ry=-a, rz=0.5), col[k % 2]))
    P.append((T(dome(2.6, 10, 2), -27.0, 19.3, 0), col[0]))
    P += [(T(g, -26.0, 12.0, 0), m) for g, m in figure('jkO', 'jkK', 'sit')]
    return scaled(P, s)


def raft(n=6, s=M_ * 0.5, col='jkO'):
    """a canyon boat (Martvili): a grey inflatable, the guide at the back, passengers in orange life jackets"""
    P = []
    rings = []
    for x, k in ((-2.4, 0.6), (-2.1, 0.95), (2.0, 0.95), (2.6, 0.45)):
        rings.append([(x, 0.35 + 0.3 * math.sin(a), k * (0.9 + 0.3 * math.cos(a))) for a in np.linspace(0, 2 * PI, 7)[:-1]])
        rings.append([(x, 0.35 + 0.3 * math.sin(a), -k * (0.9 + 0.3 * math.cos(a))) for a in np.linspace(0, 2 * PI, 7)[:-1]])
    for side in (0, 1):
        P += loft([rings[2 * j + side] for j in range(4)], lambda r, i: 'rockD', caps=('rockD', 'rockD'))
    P.append((T(box(4.4, 0.15, 1.8), 0, 0.1, 0), 'rockD'))
    for k in range(n):
        x = -1.4 + (k // 2) * 1.1; z = 0.45 if k % 2 else -0.45
        P += [(T(g, x, 0.15, z, s=0.85), m) for g, m in figure(col, 'jkK', 'sit', helmet='white')]
    P += [(T(g, -2.1, 0.15, 0, s=0.9), m) for g, m in figure('jkR', 'jkK', 'sit')] + [(tube([np.array((-2.0, 1.0, 0.3)), np.array((-3.0, 0.1, 0.8))], 0.03, 3), 'wood')]
    return scaled(P, s)


def rowboat(col='white', s=M_ * 0.5, people=2):
    P = _hull(4.2, 1.5, 0.6, sheer=0.15, top_mat=col, keel_mat='blue', deck_mat='wood', n=7)
    for k in range(people): P += [(T(g, -0.8 + k * 1.2, 0.25, 0, ry=PI), m) for g, m in figure(_pr.choice(JACKETS), 'jkK', 'sit')]
    P += [(tube([np.array((-0.6, 0.7, z * 0.4)), np.array((-0.4, 0.0, z * 1.7))], 0.03, 3), 'wood') for z in (-1, 1)]
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ traffic (metres, nose +x)
def sedan(paint='carS', s=M_):
    """a mid-size saloon (Georgia's roads are full of them): bonnet, glasshouse, boot"""
    ST = [(-2.35, 0.32, 0.92, 0.95, 0.88, 0.8), (-2.2, 0.3, 0.95, 1.02, 0.9, 0.82), (-1.55, 0.3, 0.96, 1.05, 0.9, 0.82), (-1.05, 0.3, 0.97, 1.42, 0.9, 0.72),
          (0.55, 0.3, 0.97, 1.44, 0.9, 0.72), (1.15, 0.3, 0.95, 1.02, 0.9, 0.84), (2.25, 0.32, 0.86, 0.88, 0.86, 0.8), (2.4, 0.38, 0.7, 0.72, 0.8, 0.74)]
    P = body_shell(ST, glass=[(-0.95, -0.05), (0.0, 0.62)], screen=(0.6, 1.12), upper=paint, lower=paint, clad=0.0, rtop=0.06, rside=0.12, under='tyre')
    for sz in (-1, 1):
        P += [(T(box(0.04, 0.12, 0.28), 2.4, 0.66, sz * 0.58), 'lamp'), (T(box(0.04, 0.14, 0.3), -2.36, 0.74, sz * 0.62), 'red'), (T(box(0.1, 0.1, 0.12), 0.75, 0.98, sz * 0.94), paint)]
    for x in (1.45, -1.35):
        for sz in (-1, 1): P += wheel(0.32, 0.2, x, sz * 0.78, rim='steel', spokes=5, seg=10)
    return scaled(P, s)


def marshrutka(paint='jkY', s=M_):
    """a marshrutka, the Ford Transit minibus that runs every route in Georgia: high roof, sliding door, stubby nose"""
    ST = [(-2.9, 0.4, 1.25, 2.5, 1.0, 0.92), (-2.8, 0.38, 1.25, 2.6, 1.0, 0.95), (1.5, 0.38, 1.25, 2.6, 1.0, 0.95), (1.75, 0.38, 1.2, 2.3, 1.0, 0.92),
          (2.35, 0.4, 1.1, 1.32, 0.98, 0.9), (2.85, 0.48, 0.9, 1.0, 0.92, 0.86)]
    P = body_shell(ST, glass=[(1.0, 1.55), (-0.2, 0.9), (-1.4, -0.3), (-2.7, -1.5)], screen=(1.6, 2.36), upper=paint, lower=paint, clad=0.0, rtop=0.1, rside=0.12, under='tyre')
    for sz in (-1, 1): P += [(T(box(0.04, 0.16, 0.3), 2.86, 0.82, sz * 0.62), 'lamp'), (T(box(0.04, 0.4, 0.14), -2.92, 1.0, sz * 0.86), 'red')]
    P += [(T(box(0.05, 0.3, 0.9), 2.87, 0.6, 0), 'ink'), (T(box(0.8, 0.22, 0.05), 0.6, 2.15, 1.0), 'ink')]
    for x in (1.95, -1.6):
        for sz in (-1, 1): P += wheel(0.36, 0.22, x, sz * 0.82, rim='steel', spokes=5, seg=10)
    return scaled(P, s)


def lorry(cab='white', box_col='cnB', s=M_):
    """an articulated lorry, the kind that grinds over the Jvari pass: cab-over tractor unit, a long curtain-sider"""
    P = [(T(box(2.3, 2.6, 2.5), 4.9, 1.0, 0), cab), (T(box(0.05, 1.0, 2.2), 6.06, 2.3, 0), 'glassD'), (T(box(2.0, 0.5, 2.4), 4.8, 3.6, 0), cab),
         (T(box(0.06, 0.6, 2.2), 6.08, 1.2, 0), 'ink'), (T(box(3.0, 0.3, 2.3), 3.0, 0.9, 0), 'ink')]
    P += [(T(box(0.04, 0.16, 0.3), 6.08, 1.0, z), 'lamp') for z in (-0.85, 0.85)]
    P += [(T(box(12.6, 2.9, 2.5), -3.0, 1.25, 0), box_col), (T(box(12.6, 0.3, 2.45), -3.0, 0.95, 0), 'ink')]
    for x in (5.2, 2.6, -6.8, -8.1):
        for sz in (-1, 1): P += wheel(0.5, 0.3, x, sz * 1.0, rim='steel', spokes=5, seg=10)
    return scaled(P, s)


# ------------------------------------------------------------------------------------------------ animation helpers
_MESH_CACHE = {}
def anim_inst(name, key, make, M3, group, parent=None):
    """like anim_obj, but objects with the same key share one mesh (one copy in the glTF)"""
    me = _MESH_CACHE.get(key)
    if me is None:
        me = mesh_from(key, [(v_bl(g.V), g.F, m) for g, m in make()]); _MESH_CACHE[key] = me
    ob = bpy.data.objects.new(name, me); COLL.objects.link(ob)
    pe, PM = REGION[base_of(group)]
    if parent is None: ob.parent = pe; ob.matrix_basis = Matrix((np.linalg.inv(PM) @ to_bl(M3)).tolist())
    else: ob.parent = parent; ob.matrix_basis = Matrix(M3.tolist())
    ob.rotation_mode = 'XYZ'
    return ob


def _simplify(T_, Y, tol, max_step=None):
    """keep the fewest samples so that linear interpolation stays within tol of every sample (greedy); max_step
    caps the change between kept keys (rotations: the glTF's quaternions take the short way round)"""
    keep = list(range(len(T_)))
    changed = True
    while changed and len(keep) > 2:
        changed = False; i = 1
        while i < len(keep) - 1:
            a, b, c = keep[i - 1], keep[i], keep[i + 1]
            ok = max_step is None or np.max(np.abs(Y[c] - Y[a])) <= max_step
            for j in (range(a + 1, c) if ok else ()):
                t = (T_[j] - T_[a]) / (T_[c] - T_[a]); v = Y[a] * (1 - t) + Y[c] * t
                if np.max(np.abs(v - Y[j])) > tol: ok = False; break
            if ok: keep.pop(i); changed = True
            else: i += 1
    return keep


def k_track(ob, group, fn, step=2, yaw=True, yaw_off=0.0, ground=True, lift=0.0, tol=0.0012, vis=None, pitch=False, bank=None, dirfn=None):
    """fn(u) -> (X, Z) or (X, Y, Z) three.js world; samples every `step` frames and keeps only the keys linear
    interpolation needs. vis(u) -> 0/1 hides the object (scale 0) where it jumps back to the start of its run.
    pitch: nose follows the slope (skiers, cars on hills). bank(u) -> roll angle. dirfn(u) -> (dX, dZ): face that way
    instead of the way it is moving (a train that backs down the line)."""
    pe, PM = REGION[base_of(group)]; o = PM[:3, 3]
    fr = list(range(0, LOOP + 1, step)); us = [f / LOOP for f in fr]
    P3 = []
    for u in us:
        p = fn(u)
        if len(p) == 2: X, Z = p; Y = (ground3(X, Z) if ground else 0) + lift
        else: X, Y, Z = p
        P3.append((X, Y, Z))
    P3 = np.array(P3)
    vv = np.array([1.0 if vis is None else float(vis(u)) for u in us])
    ang, pit = [], []
    for k in range(len(P3)):
        a, b = P3[max(0, k - 1)], P3[min(len(P3) - 1, k + 1)]
        if vis is not None and (vv[max(0, k - 1)] == 0 or vv[min(len(P3) - 1, k + 1)] == 0):   # don't turn round at the jump
            a, b = (P3[k], P3[min(len(P3) - 1, k + 1)]) if vv[min(len(P3) - 1, k + 1)] else (P3[max(0, k - 1)], P3[k])
            if np.allclose(a, b): a, b = P3[max(0, k - 2)], P3[k]
        ang.append(math.atan2(-(b[2] - a[2]), b[0] - a[0]))
        pit.append(math.atan2(b[1] - a[1], math.hypot(b[0] - a[0], b[2] - a[2]) or 1e-9))
    if dirfn is not None: ang = [math.atan2(-d[1], d[0]) for d in (dirfn(u) for u in us)]
    ang = np.unwrap(ang) + yaw_off
    loc = np.column_stack((P3[:, 0] - o[0], -P3[:, 2] - o[1], P3[:, 1] - o[2]))
    rot = np.zeros((len(fr), 3))
    if yaw: rot[:, 2] = ang
    if pitch: rot[:, 1] = -np.array(pit)
    if bank is not None: rot[:, 0] = [bank(u) for u in us]
    T_ = np.array(fr, float)
    for k in _simplify(T_, loc, tol):
        ob.location = tuple(loc[k]); ob.keyframe_insert('location', frame=fr[k])
    if yaw or pitch or bank is not None:
        for k in _simplify(T_, rot, 0.01, max_step=1.0):
            ob.rotation_euler = tuple(rot[k]); ob.keyframe_insert('rotation_euler', frame=fr[k])
    if vis is not None:
        base = tuple(ob.scale)
        for k in _simplify(T_, vv[:, None], 0.01):
            ob.scale = tuple(b * max(vv[k], 1e-4) for b in base); ob.keyframe_insert('scale', frame=fr[k])
        ob.scale = base


def lift_line(group, X0, Z0, a, b, kind='gondola', n_cab=6, col='jkR', towers=3, h=0.022, seed=0, prefix=None):
    """a lift from a (bottom, local LM) to b (top): two stations, towers, the haul rope as a loop with its up and down
    lines, and gondola cabins or chairs riding round it (up on one side, down on the other)"""
    prefix = prefix or group.split(':')[0]
    Ma = placeM(X0, Z0, a[0], a[1], foot=0.01, ry=-math.atan2(b[1] - a[1], b[0] - a[0]))
    Mb_ = placeM(X0, Z0, b[0], b[1], foot=0.01, ry=-math.atan2(b[1] - a[1], b[0] - a[0]))
    if Ma is None or Mb_ is None: return
    for M, top in ((Ma, False), (Mb_, True)):
        for g, m in lift_station(top, col='jkR' if kind == 'gondola' else 'jkB'): emit(group, m, g, M)
    A = Ma[:3, 3].copy(); B = Mb_[:3, 3].copy()
    yaw = math.atan2(-(B[2] - A[2]), B[0] - A[0]); d = np.array([B[0] - A[0], 0, B[2] - A[2]]); L = np.linalg.norm(d); d /= L
    nrm = np.array([-d[2], 0, d[0]]); sep = 2.9 * LS * LM   # half the rope gauge (the sheaves on the 6.4 m crossarm)
    hs = 5.2 * LS * LM   # rope height at the stations (the bullwheel)
    # towers between, each tall enough to keep the rope clear of the ground
    tops = [A + np.array([0, hs, 0])]
    for k in range(1, towers + 1):
        t = k / (towers + 1); P = A + (B - A) * t; gy = ground3(P[0], P[2])
        line_y = A[1] + hs + (B[1] - A[1]) * t
        hh = max(h * LM * 0.6, line_y - gy + 0.004 * LM)
        Mt = mat4(P[0], gy, P[2], ry=yaw, s=1.0)
        for g_, m_ in lift_pylon(hh / (LS * LM)): emit(group, m_, g_, Mt @ mat4(s=LM))
        tops.append(np.array([P[0], gy + hh, P[2]]))
    tops.append(B + np.array([0, hs, 0]))
    up = [p + nrm * sep for p in tops]; dn = [p - nrm * sep for p in tops][::-1]
    for line in (up, dn): emit(group, 'ink', tube(line, 0.0003 * LM, 3, caps=False))
    loop = up + dn
    seg = [np.linalg.norm(q - p) for p, q in zip(loop, loop[1:] + loop[:1])]; tot = sum(seg)
    def at(u):
        dd = (u % 1.0) * tot
        for p, q, sl in zip(loop, loop[1:] + loop[:1], seg):
            if dd <= sl: return tuple(p + (q - p) * (dd / (sl or 1)))
            dd -= sl
        return tuple(loop[0])
    for c in range(n_cab):
        nm = '%s_%s%d' % (prefix, 'Gondola' if kind == 'gondola' else 'Chair', c + 1)
        if kind == 'gondola': ob = anim_inst(nm, 'gondola_' + col, lambda: gondola_cabin(col), mat4(*at(0), ry=yaw, s=LM), group)
        else:
            sd = c % 3; ob = anim_inst(nm, 'chair_%d' % sd, lambda sd=sd: chair(4, riders=2 + sd % 2, seed=sd), mat4(*at(0), ry=yaw, s=LM), group)
        k_track(ob, group, lambda u, c=c: at(u + c / n_cab), step=2, yaw=False, tol=0.0008)
    return A, B


def k_orbit_glider(group, name, center, R, Y, make, turns=1, phase=0.0, dy=0.02, ellipse=1.0, key=None):
    """something soaring round a thermal (paragliders): a slow circle, banked into the turn, rising and sinking"""
    def fn(u):
        a = 2 * PI * (turns * u) + phase
        return (center[0] + R * math.cos(a), Y + dy * math.sin(2 * PI * u * 2 + phase), center[1] + R * ellipse * math.sin(a))
    ob = anim_inst(name, key or name, make, mat4(*fn(0), s=LM), group)
    k_track(ob, group, fn, step=4, tol=0.0015, bank=lambda u: -0.28 * (1 if turns > 0 else -1))
    return ob


PROP_MATS = dict(snow=(0xf3f5f8, 0.9), piste=(0xfdfdfe, 0.75), jkR=(0xd8342c, 0.8), jkB=(0x2a62b8, 0.8), jkY=(0xf0c030, 0.8), jkT=(0x23a093, 0.8),
                 jkK=(0x2b2d33, 0.8), jkP=(0xc2457e, 0.8), jkO=(0xf07a24, 0.8), skin=(0xe0b494, 0.9), concrete=(0xbdb8ae, 0.9),
                 cnO=(0xe8752a, 0.6), cnG=(0x3f8f4f, 0.6), cnB=(0x2c5d9e, 0.6), cnR=(0xb8362e, 0.6), cnW=(0xe2e0da, 0.6), cnY=(0xe2b33c, 0.6),
                 kuk=(0x2f6b4f, 0.6), kukY=(0xe9dcaa, 0.6), kiss=(0xf1f1ee, 0.4), kissR=(0xc8202f, 0.5), carS=(0xb9bec4, 0.35),
                 carW=(0xf0f0ee, 0.35), carK=(0x2f3238, 0.35), carR=(0xa8232b, 0.35), carB=(0x2c4d7e, 0.35), sandB=(0x5e5a55, 0.95),
                 umbR=(0xd84a3a, 0.8), umbB=(0x3a7cc0, 0.8), mosB=(0x2f6fb0, 0.7), mosY=(0xe7b93c, 0.7), mosR=(0xc4452f, 0.7), mosG=(0x4f9a5a, 0.7),
                 lakeT=(0x3fa3a8, 0.18), gold2=(0xd6a23a, 0.35), waterF=(0xd8eaf0, 0.3), rust=(0x8a4b2f, 0.8), lime=(0xd2c8b2, 0.9), tent=(0xf2f0ea, 0.6),
                 snowF=(0xffffff, 0.6), glint=(0xfffbe8, 0.2), sunC=(0xffbf2e, 0.4), sunR=(0xff9a1f, 0.4),
                 gareR=(0xb8664a, 0.95), gareY=(0xd9b27a, 0.95), gareP=(0x9c7f92, 0.95), chalet=(0x8a5a36, 0.85), concreteD=(0x9a958c, 0.9))


# ------------------------------------------------------------------------------------------------ showroom
if PROPS_SHOWROOM:
    SHOW = [('gondola', gondola_cabin()), ('chair', chair(4, riders=3)), ('pylon', lift_pylon(12)), ('station', lift_station()),
            ('skier', skier('jkB')), ('boarder', skier('jkO', board=True)), ('paraglider', paraglider()), ('kukushka', kukushka_loco() + [(T(g, -0.05, 0, 0), m) for g, m in kukushka_car()]),
            ('kiss', kiss_car(True)), ('ship', container_ship()), ('tug', tug()), ('crane', sts_crane() + sts_trolley()),
            ('kite', kitesurfer()), ('parasail', parasail()), ('jetski', jetski()), ('raft', raft()), ('rowboat', rowboat()),
            ('sedan', sedan()), ('marshrutka', marshrutka()), ('lorry', lorry()), ('rider', rider()), ('flock', flock()), ('monk', monk()), ('walker', walker('jkT'))]
    allm = dict(PROP_MATS); allm.update({k: v for k, v in VEHICLE_MATS.items()})
    allm.update(dict(alu=(0xd4d8db, 0.4), wool=(0xf3f0e8, 0.9), horse=(0x6b4630, 0.9), horseD=(0x3b2a20, 0.9), pebble=(0xb9b3a9, 0.9), rockD=(0x7c7670, 0.9)))
    showroom(SHOW, allm, 'props')
