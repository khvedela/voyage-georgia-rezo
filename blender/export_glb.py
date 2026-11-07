"""
Export the Georgia scene to the site:  python3 blender/bl.py blender/export_glb.py [out=public/models/georgia.glb]

Everything in the Georgia collection (not the Preview lights), Draco-compressed, with every object's animation merged
into one 20 s clip named "Scene" so the site plays a single looping action. Cameras are exported; the site reads
Cam_<dest> / CamTarget_<dest> by name. Prints a breakdown of what the bytes went on.
"""
import bpy, os, json, struct, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = list(globals().get('ARGS', []))
opts = dict(a.split('=') for a in args if '=' in a)
out = os.path.join(ROOT, opts.get('out', 'public/models/georgia.glb'))
os.makedirs(os.path.dirname(out), exist_ok=True)

scene = bpy.context.scene
scene.frame_set(0)
prev = bpy.data.collections.get('Preview')
skip = {o.name for o in prev.objects} if prev else set()
for o in bpy.data.objects: o.select_set(o.name not in skip and o.name in bpy.data.collections['Georgia'].all_objects)
for d in ('tbilisi', 'kakheti', 'svaneti', 'tusheti', 'batumi'):  # exported visible; the site hides them until a stop is active
    h = bpy.data.objects.get('Highlight_' + d)
    if h: h.hide_render = False

kw = dict(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
          export_cameras=True, export_lights=False, export_materials='EXPORT', export_vertex_color='MATERIAL',
          export_animations=True, export_animation_mode=opts.get('mode', 'ACTIONS'), export_force_sampling=opts.get('sample', '0') == '1', export_optimize_animation_size=True,
          export_frame_range=True, export_morph=True, export_morph_normal=False, export_skins=False,
          export_image_format='AUTO', export_texcoords=True, export_normals=False)  # the site shades every face flat, so normals are not needed
try:
    bpy.ops.export_scene.gltf(**kw, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
                              export_draco_position_quantization=12, export_draco_normal_quantization=8, export_draco_color_quantization=8,
                              export_draco_generic_quantization=10)
except Exception as e:
    print('draco export failed, exporting uncompressed:', e)
    bpy.ops.export_scene.gltf(**kw)

# ---- what did the bytes go on?
with open(out, 'rb') as f: data = f.read()
jlen = struct.unpack_from('<I', data, 12)[0]
j = json.loads(data[20:20 + jlen].decode())
bv = j.get('bufferViews', [])
use = collections.Counter()
for a in j.get('accessors', []):
    if 'bufferView' in a: use[('accessor', a['bufferView'])] += 0
anim_bv = set()
for an in j.get('animations', []):
    for smp in an['samplers']:
        for key in ('input', 'output'):
            acc = j['accessors'][smp[key]]
            if 'bufferView' in acc: anim_bv.add(acc['bufferView'])
img_bv = {im['bufferView'] for im in j.get('images', []) if 'bufferView' in im}
draco_bv = set()
for m in j.get('meshes', []):
    for p in m['primitives']:
        d = p.get('extensions', {}).get('KHR_draco_mesh_compression')
        if d: draco_bv.add(d['bufferView'])
tot = collections.Counter()
for i, b in enumerate(bv):
    k = 'animation' if i in anim_bv else 'images' if i in img_bv else 'mesh (draco)' if i in draco_bv else 'other'
    tot[k] += b['byteLength']
print('wrote %s: %.2f MB' % (out, len(data) / 1e6))
print('  json %.2f MB, ' % (jlen / 1e6) + ', '.join('%s %.2f MB' % (k, v / 1e6) for k, v in tot.most_common()))
print('  nodes %d, meshes %d, materials %d, animations %d (%s), cameras %d' % (len(j.get('nodes', [])), len(j.get('meshes', [])), len(j.get('materials', [])),
      len(j.get('animations', [])), ', '.join(a.get('name', '?') + ':%d ch' % len(a['channels']) for a in j.get('animations', [])), len(j.get('cameras', []))))
