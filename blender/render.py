"""
Preview renders of the low-poly Georgia scene (Eevee). Run after build_georgia.py:
  python3 blender/bl.py blender/render.py [overview|tbilisi|kakheti|svaneti|tusheti|batumi|edge|coast|all] [frame=N] [res=60] [hl=1]
Destination shots use the scene's own exported cameras (Cam_<dest>); edge/coast are preview-only.
hl=1 shows each destination's Highlight ring in its own shot. Lights live in a Preview collection that is not exported.
"""
import bpy, math, os
import numpy as np
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'blender', 'renders'); os.makedirs(OUT, exist_ok=True)
args = list(globals().get('ARGS', []))
opts = dict(a.split('=') for a in args if '=' in a)
which = [a for a in args if '=' not in a] or ['overview']
scene = bpy.context.scene
DESTS = ['tbilisi', 'kakheti', 'svaneti', 'tusheti', 'batumi']
if which == ['all']: which = ['overview'] + DESTS + ['edge', 'coast', 'kutaisi', 'kazbegi', 'vardzia', 'uplistsikhe']

prev = bpy.data.collections.get('Preview')
if prev is None:
    prev = bpy.data.collections.new('Preview'); scene.collection.children.link(prev)
for ob in list(prev.objects): bpy.data.objects.remove(ob, do_unlink=True)

# light: the same warm sun as the site (three.js (-4.2, 6.5, 3.4) -> Blender (-4.2, -3.4, 6.5)), plus a cool fill from the sky
sun_d = bpy.data.lights.new('PreviewSun', 'SUN'); sun_d.energy = 4.0; sun_d.angle = math.radians(5); sun_d.color = (1.0, 0.96, 0.9)
sun = bpy.data.objects.new('PreviewSun', sun_d); prev.objects.link(sun)
sun.rotation_euler = (-Vector((-4.2, -3.4, 6.5))).to_track_quat('-Z', 'Y').to_euler()
fill_d = bpy.data.lights.new('PreviewFill', 'SUN'); fill_d.energy = 0.9; fill_d.angle = math.radians(40); fill_d.color = (0.86, 0.92, 1.0); fill_d.use_shadow = False
fill = bpy.data.objects.new('PreviewFill', fill_d); prev.objects.link(fill)
fill.rotation_euler = (-Vector((3.0, 2.0, 4.0))).to_track_quat('-Z', 'Y').to_euler()

world = scene.world or bpy.data.worlds.new('World'); scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
bg.inputs['Color'].default_value = (0.8, 0.84, 0.9, 1); bg.inputs['Strength'].default_value = 0.8

scene.render.engine = 'BLENDER_EEVEE'
scene.view_settings.view_transform = 'Standard'; scene.view_settings.look = 'None'
scene.render.film_transparent = True
scene.render.resolution_percentage = int(opts.get('res', 100))
ee = scene.eevee
for k, v in (('taa_render_samples', 48), ('use_shadows', True), ('shadow_ray_count', 2), ('shadow_step_count', 4), ('use_raytracing', True),
             ('horizon_bias', 0.5), ('fast_gi_distance', 0.6), ('use_fast_gi', True), ('fast_gi_quality', 0.4)):
    try: setattr(ee, k, v)
    except Exception: pass
try:
    ee.ray_tracing_options.resolution_scale = '2'; ee.ray_tracing_options.trace_max_roughness = 0.5
except Exception: pass

def place_cam(name, target, yaw, elev, dist, lens=60, size=(1600, 1000)):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.clip_start = 0.01; cd.clip_end = 100
    cam = bpy.data.objects.new(name, cd); prev.objects.link(cam)
    t = Vector(target); e = math.radians(elev)
    off = Vector((math.sin(yaw) * math.cos(e), -math.cos(yaw) * math.cos(e), math.sin(e))) * dist
    cam.location = t + off
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam; scene.render.resolution_x, scene.render.resolution_y = size
    return cam

def scenery(name, dx=0.1, dy=0.0, yaw=-0.4, elev=38, dist=1.7):
    e = bpy.data.objects['Scenery_' + name]; t = e.matrix_world.translation
    return place_cam('Cam', (t.x + dx, t.y + dy, t.z + 0.05), yaw, elev, dist, lens=55, size=(1400, 1000))
EXTRA = {  # scenery stops have no camera of their own; frame each on its landmark (dx, dy: Blender world offsets from the empty)
    'kutaisi': lambda: scenery('Kutaisi', 0.13, 0.11, -0.45, 38, 1.9),
    'kazbegi': lambda: scenery('Kazbegi', -0.08, 0.04, 0.95, 30, 2.0),
    'vardzia': lambda: scenery('Vardzia', -0.13, 0.06, 1.45, 24, 1.15),
    'uplistsikhe': lambda: scenery('Uplistsikhe', -0.08, 0.13, -0.55, 34, 1.5),
    'edge': lambda: place_cam('Cam', (1.2, -1.5, 0.05), -0.25, 30, 4.8, lens=50),
    'coast': lambda: place_cam('Cam', (-3.2, -1.2, 0.05), -1.0, 32, 4.8, lens=50),
}
scene.frame_set(int(opts.get('frame', 0)))
for w in which:
    for ob in [o for o in prev.objects if o.type == 'CAMERA']: bpy.data.objects.remove(ob, do_unlink=True)
    for d in DESTS:
        h = bpy.data.objects.get('Highlight_' + d)
        if h: h.hide_render = not (opts.get('hl') and d == w)
    if w in EXTRA: EXTRA[w]()
    else:
        scene.camera = bpy.data.objects['Cam_' + w]
        scene.render.resolution_x, scene.render.resolution_y = (1600, 1000) if w == 'overview' else (1400, 1000)
    scene.render.filepath = os.path.join(OUT, '%s.png' % w)
    bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(scene.render.filepath, check_existing=False)  # flatten onto white, like the site's page
    px = np.empty(len(im.pixels), np.float32); im.pixels.foreach_get(px); px = px.reshape(-1, 4)
    a = px[:, 3:4]; px[:, :3] = px[:, :3] * a + (1 - a); px[:, 3] = 1
    im.pixels.foreach_set(px.ravel()); im.save(); bpy.data.images.remove(im)
    print('wrote', scene.render.filepath)
