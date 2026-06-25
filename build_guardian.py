"""
AXIOS Guardian — Blender 5.1 bpy build script
Spartan warrior: Corinthian helmet + pteruges skirt, all else exposed.
Run: blender --background --python build_guardian.py
"""

import bpy
import math

EXPORT_PATH = r"C:\Users\Ethan Scott\OneDrive\Documentos\axios-app-github\public\axios_guardian.glb"

# ─── CLEAR SCENE ──────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.meshes):    bpy.data.meshes.remove(m)
for m in list(bpy.data.materials): bpy.data.materials.remove(m)

ctx = bpy.context

# ─── MATERIALS ────────────────────────────────────────────────────────────────
def make_mat(name, color, metallic=0.0, roughness=0.6):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value  = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value    = metallic
    bsdf.inputs['Roughness'].default_value   = roughness
    return mat

M_SKIN    = make_mat('Skin',    (0.28, 0.20, 0.14), metallic=0.0,  roughness=0.72)
M_BRONZE  = make_mat('Bronze',  (0.16, 0.14, 0.11), metallic=0.90, roughness=0.25)
M_LEATHER = make_mat('Leather', (0.09, 0.07, 0.05), metallic=0.0,  roughness=0.88)
M_PLUME   = make_mat('Plume',   (0.08, 0.08, 0.10), metallic=0.0,  roughness=0.95)

# ─── PRIMITIVE HELPERS ────────────────────────────────────────────────────────
def desel():
    bpy.ops.object.select_all(action='DESELECT')

def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)

def smooth(obj):
    ctx.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()

def apply_tf(obj):
    ctx.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    desel()

def sphere(name, loc, sx, sy, sz, mat, segs=18, rings=14):
    desel()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, location=loc)
    o = ctx.active_object
    o.name = name
    o.scale = (sx, sy, sz)
    assign(o, mat)
    apply_tf(o)
    smooth(o)
    return o

def cylinder(name, loc, sx, sy, sz, mat, verts=16):
    """depth=2 by default; total baked height = sz*2"""
    desel()
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, depth=2.0, location=loc)
    o = ctx.active_object
    o.name = name
    o.scale = (sx, sy, sz)
    assign(o, mat)
    apply_tf(o)
    smooth(o)
    return o

def cube(name, loc, sx, sy, sz, mat):
    desel()
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = ctx.active_object
    o.name = name
    o.scale = (sx, sy, sz)
    assign(o, mat)
    apply_tf(o)
    return o

def join_into(result_name, names):
    """Select all named objects, join → rename result."""
    desel()
    active_obj = None
    for n in names:
        if n in bpy.data.objects:
            obj = bpy.data.objects[n]
            obj.select_set(True)
            if active_obj is None:
                active_obj = obj
    ctx.view_layer.objects.active = active_obj
    bpy.ops.object.join()
    ctx.active_object.name = result_name

# ─── HEIGHT MAP (Z = up) ──────────────────────────────────────────────────────
# Heroic 8.5-head figure — total ~1.88m
Z_HEAD      = 1.72
Z_NECK      = 1.58
Z_CHEST     = 1.38
Z_SHOULDER  = 1.40
Z_ELBOW     = 1.12
Z_WRIST     = 0.84
Z_WAIST     = 1.06
Z_HIP       = 0.90
Z_SKIRT_TOP = 0.93
Z_THIGH_MID = 0.70   # (hip + knee) / 2
Z_KNEE      = 0.50
Z_CALF_MID  = 0.29   # (knee + ankle) / 2
Z_ANKLE     = 0.08

X_SHOULDER  = 0.21
X_ARM       = 0.25
X_FOREARM   = 0.27
X_LEG       = 0.098

# ─── HEAD ─────────────────────────────────────────────────────────────────────
sphere('Head',       (0,0,Z_HEAD),  0.096, 0.092, 0.110, M_SKIN,  segs=20, rings=16)
# Neck joins into head later
sphere('_Neck',      (0,0,Z_NECK),  0.041, 0.038, 0.075, M_SKIN,  segs=14, rings=10)
join_into('Head', ['Head', '_Neck'])

# ─── HELMET ───────────────────────────────────────────────────────────────────
# 1 — Main egg-shaped dome (sits slightly over head)
sphere('_H_Dome',    (0, 0, Z_HEAD+0.010), 0.110, 0.108, 0.150, M_BRONZE, segs=28, rings=20)

# 2 — Rear neck guard (curved plate at back-bottom)
sphere('_H_NeckGd',  (0, 0.052, Z_HEAD-0.090), 0.094, 0.040, 0.048, M_BRONZE, segs=14, rings=10)

# 3 — Left cheek guard
sphere('_H_CheekL',  (-0.090, -0.008, Z_HEAD-0.052), 0.026, 0.050, 0.062, M_BRONZE, segs=14, rings=10)

# 4 — Right cheek guard (mirror)
sphere('_H_CheekR',  ( 0.090, -0.008, Z_HEAD-0.052), 0.026, 0.050, 0.062, M_BRONZE, segs=14, rings=10)

# 5 — Nasal bar (thin vertical bar at front-center)
cube('_H_Nasal',     (0, -0.106, Z_HEAD-0.006), 0.013, 0.014, 0.060, M_BRONZE)

# 6 — Brow ridge (horizontal bar framing the eye openings)
cube('_H_BrowL',     (-0.042, -0.096, Z_HEAD+0.026), 0.036, 0.018, 0.010, M_BRONZE)
cube('_H_BrowR',     ( 0.042, -0.096, Z_HEAD+0.026), 0.036, 0.018, 0.010, M_BRONZE)

# 7 — Plume mount ridge (front-to-back spine on dome top)
cube('_H_PlumeMount',(0, 0, Z_HEAD+0.162),  0.014, 0.108, 0.015, M_BRONZE)

# 8 — Horsehair plume — main body (thick oval, front-to-back)
sphere('_H_Plume',   (0, 0, Z_HEAD+0.224),  0.030, 0.120, 0.052, M_PLUME, segs=16, rings=12)

# 9 — Plume rear drape (falls toward back)
sphere('_H_PlumeD',  (0, 0.055, Z_HEAD+0.172), 0.026, 0.082, 0.040, M_PLUME, segs=12, rings=10)

join_into('Helmet', [
    '_H_Dome', '_H_NeckGd',
    '_H_CheekL', '_H_CheekR',
    '_H_Nasal',
    '_H_BrowL', '_H_BrowR',
    '_H_PlumeMount', '_H_Plume', '_H_PlumeD',
])

# ─── CHEST & TORSO ────────────────────────────────────────────────────────────
sphere('Chest', (0, 0, Z_CHEST),  0.178, 0.116, 0.165, M_SKIN, segs=22, rings=16)
sphere('Core',  (0, 0, Z_WAIST),  0.138, 0.102, 0.108, M_SKIN, segs=20, rings=14)

# ─── SHOULDERS ────────────────────────────────────────────────────────────────
sphere('Left_Shoulder',  (-X_SHOULDER, 0, Z_SHOULDER), 0.066, 0.063, 0.066, M_SKIN, segs=16, rings=12)
sphere('Right_Shoulder', ( X_SHOULDER, 0, Z_SHOULDER), 0.066, 0.063, 0.066, M_SKIN, segs=16, rings=12)

# ─── ARMS ─────────────────────────────────────────────────────────────────────
# Upper arms  (length = shoulder→elbow = 0.28m, so sz = 0.14)
cylinder('Left_Arm',  (-X_ARM, 0, (Z_SHOULDER+Z_ELBOW)/2),  0.048, 0.048, 0.140, M_SKIN, verts=16)
cylinder('Right_Arm', ( X_ARM, 0, (Z_SHOULDER+Z_ELBOW)/2),  0.048, 0.048, 0.140, M_SKIN, verts=16)

# Elbow balls — join into arm
sphere('_EL',  (-X_ARM, 0, Z_ELBOW), 0.036, 0.036, 0.036, M_SKIN, segs=12, rings=10)
sphere('_ER',  ( X_ARM, 0, Z_ELBOW), 0.036, 0.036, 0.036, M_SKIN, segs=12, rings=10)
join_into('Left_Arm',  ['Left_Arm',  '_EL'])
join_into('Right_Arm', ['Right_Arm', '_ER'])

# Forearms  (elbow→wrist = 0.28m, sz = 0.14)
cylinder('Left_Forearm',  (-X_FOREARM, 0, (Z_ELBOW+Z_WRIST)/2),  0.038, 0.038, 0.140, M_SKIN, verts=14)
cylinder('Right_Forearm', ( X_FOREARM, 0, (Z_ELBOW+Z_WRIST)/2),  0.038, 0.038, 0.140, M_SKIN, verts=14)

# Hands (closed fist)
sphere('Left_Hand',  (-X_FOREARM, 0, Z_WRIST), 0.032, 0.042, 0.034, M_SKIN, segs=12, rings=10)
sphere('Right_Hand', ( X_FOREARM, 0, Z_WRIST), 0.032, 0.042, 0.034, M_SKIN, segs=12, rings=10)

# ─── PTERUGES SKIRT ──────────────────────────────────────────────────────────
STRIP_COUNT  = 14
STRIP_RADIUS = 0.114
strip_names  = []

for i in range(STRIP_COUNT):
    angle = (i / STRIP_COUNT) * 2 * math.pi
    rx = math.sin(angle) * STRIP_RADIUS
    ry = math.cos(angle) * STRIP_RADIUS * 0.72   # slightly oval, flatter front-back
    name = f'_SS{i}'
    desel()
    bpy.ops.mesh.primitive_cube_add(location=(rx, ry, Z_SKIRT_TOP - 0.042))
    o = ctx.active_object
    o.name = name
    o.scale = (0.016, 0.010, 0.068)
    o.rotation_euler.z = -angle
    # Slight outward lean at bottom
    lean = 0.10
    o.rotation_euler.x =  math.sin(angle) * lean
    o.rotation_euler.y = -math.cos(angle) * lean
    assign(o, M_LEATHER)
    apply_tf(o)
    strip_names.append(name)

# Waistband ring
cylinder('_SB', (0, 0, Z_SKIRT_TOP), 0.148, 0.112, 0.020, M_LEATHER, verts=32)

join_into('Skirt', ['_SB'] + strip_names)

# ─── LEGS ─────────────────────────────────────────────────────────────────────
# Hip balls
sphere('_HL',  (-X_LEG, 0, Z_HIP), 0.063, 0.060, 0.063, M_SKIN, segs=14, rings=12)
sphere('_HR',  ( X_LEG, 0, Z_HIP), 0.063, 0.060, 0.063, M_SKIN, segs=14, rings=12)

# Thighs  (hip→knee = 0.40m, sz = 0.20)
cylinder('Left_Thigh',  (-X_LEG, 0, Z_THIGH_MID), 0.066, 0.066, 0.200, M_SKIN, verts=18)
cylinder('Right_Thigh', ( X_LEG, 0, Z_THIGH_MID), 0.066, 0.066, 0.200, M_SKIN, verts=18)

# Join hips into thighs
join_into('Left_Thigh',  ['Left_Thigh',  '_HL'])
join_into('Right_Thigh', ['Right_Thigh', '_HR'])

# Knee balls
sphere('_KL',  (-X_LEG, 0, Z_KNEE), 0.048, 0.048, 0.048, M_SKIN, segs=12, rings=10)
sphere('_KR',  ( X_LEG, 0, Z_KNEE), 0.048, 0.048, 0.048, M_SKIN, segs=12, rings=10)

# Calves  (knee→ankle = 0.42m, sz = 0.21)
cylinder('Left_Calf',  (-X_LEG, 0, Z_CALF_MID), 0.050, 0.050, 0.210, M_SKIN, verts=16)
cylinder('Right_Calf', ( X_LEG, 0, Z_CALF_MID), 0.050, 0.050, 0.210, M_SKIN, verts=16)

# Join knees into calves
join_into('Left_Calf',  ['Left_Calf',  '_KL'])
join_into('Right_Calf', ['Right_Calf', '_KR'])

# Feet
sphere('Left_Foot',  (-X_LEG,  0.026, Z_ANKLE), 0.040, 0.066, 0.020, M_SKIN, segs=12, rings=8)
sphere('Right_Foot', ( X_LEG,  0.026, Z_ANKLE), 0.040, 0.066, 0.020, M_SKIN, segs=12, rings=8)

# ─── FINAL SMOOTH PASS ───────────────────────────────────────────────────────
FINAL_PARTS = [
    'Head', 'Helmet', 'Chest', 'Core', 'Skirt',
    'Left_Shoulder', 'Right_Shoulder',
    'Left_Arm', 'Right_Arm',
    'Left_Forearm', 'Right_Forearm',
    'Left_Hand', 'Right_Hand',
    'Left_Thigh', 'Right_Thigh',
    'Left_Calf', 'Right_Calf',
    'Left_Foot', 'Right_Foot',
]

for name in FINAL_PARTS:
    if name in bpy.data.objects:
        desel()
        obj = bpy.data.objects[name]
        ctx.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.shade_smooth()
        obj.data.use_auto_smooth = False

# ─── EXPORT ──────────────────────────────────────────────────────────────────
print("\n── Exporting AXIOS Guardian ──")
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=EXPORT_PATH,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_normals=True,
    export_texcoords=True,
    export_cameras=False,
    export_lights=False,
)
print(f"✅  axios_guardian.glb → {EXPORT_PATH}")
