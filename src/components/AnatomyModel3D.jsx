import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

// ── Per-group base colors (dark tinted steels — visible on black bg) ──────────
const GROUP_COLORS = {
  chest:       '#6A8FB8',   // bright steel blue
  shoulders:   '#5A9E80',   // teal
  biceps:      '#8A70B8',   // violet
  triceps:     '#A85878',   // rose steel
  forearms:    '#7A8860',   // olive
  core:        '#5A88A8',   // sky steel
  back:        '#5A7898',   // slate blue
  glutes:      '#A86848',   // copper
  quads:       '#5A9060',   // green steel
  hamstrings:  '#9A7048',   // amber
  calves:      '#5A6898',   // periwinkle
  hip_flexors: '#887090',   // plum
}

const SEL_COLOR   = '#C9A96E'   // gold on selection
const FAINT_COLOR = '#0E1018'   // fascia / bursa — near invisible
const DEFAULT_COL = '#4A5868'   // unrecognised muscles — visible neutral steel

// ── Muscle group patterns (actual Z-Anatomy mesh names) ──────────────────────
const GROUPS = {
  chest:       ['pectoralis'],
  shoulders:   ['deltoid muscle', 'part of deltoid'],
  biceps:      ['biceps brachii', 'brachialis muscle'],
  triceps:     ['triceps brachii'],
  forearms:    ['brachioradialis', 'flexor carpi', 'extensor carpi',
                'pronator', 'supinator', 'palmaris longus'],
  core:        ['abdominal oblique', 'rectus abdominis',
                'transversus abdominis', 'pyramidalis'],
  back:        ['latissimus dorsi', 'rhomboid', 'part of trapezius',
                'trapezius muscle', 'serratus anterior'],
  glutes:      ['gluteus'],
  quads:       ['rectus femoris', 'vastus'],
  hamstrings:  ['biceps femoris', 'semimembranosus muscle', 'semitendinosus muscle'],
  calves:      ['gastrocnemius', 'soleus muscle'],
  hip_flexors: ['psoas', 'iliacus muscle', 'sartorius muscle'],
}

// These are connective tissue / non-muscle — render almost invisible
const FILLER_WORDS = [
  'fascia', 'bursa', 'retinaculum', 'aponeurosis', 'ligament',
  'septum', 'tendon sheath', 'arch', 'ring', 'tarsus',
]

function isFiller(name) {
  const l = name.toLowerCase()
  return FILLER_WORDS.some(w => l.includes(w))
}

function findGroup(meshName) {
  if (isFiller(meshName)) return null
  const l = meshName.toLowerCase()
  for (const [key, pats] of Object.entries(GROUPS)) {
    if (pats.some(p => l.includes(p))) return key
  }
  return null
}

function baseColor(meshName) {
  if (isFiller(meshName)) return FAINT_COLOR
  const g = findGroup(meshName)
  return g ? GROUP_COLORS[g] : DEFAULT_COL
}

// ── Normalize scene to ~2.4 units tall, centered at origin ───────────────────
function normalizeScene(scene) {
  const box    = new THREE.Box3().setFromObject(scene)
  const size   = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const scale  = 2.4 / Math.max(size.x, size.y, size.z)
  scene.scale.setScalar(scale)
  const box2   = new THREE.Box3().setFromObject(scene)
  const mid    = box2.getCenter(new THREE.Vector3())
  scene.position.sub(mid)
}

// ── Mesh renderer ─────────────────────────────────────────────────────────────
function AnatomyMesh({ selectedGroup, onMuscleSelect }) {
  const { scene }      = useGLTF('/models/muscular-system.glb')
  const { invalidate } = useThree()
  const matsRef        = useRef({})
  const readyRef       = useRef(false)

  const meshes = useMemo(() => {
    const list = []
    scene.traverse(o => { if (o.isMesh) list.push(o) })
    return list
  }, [scene])

  // First load: normalize model + create all materials
  useEffect(() => {
    if (readyRef.current) return
    readyRef.current = true
    normalizeScene(scene)
    meshes.forEach(m => {
      // Hide connective tissue entirely — don't render or raycast
      if (isFiller(m.name)) {
        m.visible = false
        return
      }
      const mat = new THREE.MeshStandardMaterial({
        color:      baseColor(m.name),
        roughness:  0.45,
        metalness:  0.55,
        side:       THREE.FrontSide,
        depthWrite: true,
      })
      m.material = mat
      matsRef.current[m.uuid] = mat
    })
    invalidate()
  }, [scene, meshes, invalidate])

  // Selection change: gold the picked group, restore others
  useEffect(() => {
    if (!readyRef.current) return
    meshes.forEach(m => {
      if (isFiller(m.name)) return
      const mat = matsRef.current[m.uuid]
      if (!mat) return
      const isSel = selectedGroup && findGroup(m.name) === selectedGroup
      mat.color.set(isSel ? SEL_COLOR : baseColor(m.name))
      mat.emissive.set(isSel ? SEL_COLOR : '#000000')
      mat.emissiveIntensity = isSel ? 0.35 : 0
      mat.opacity           = isSel ? 1    : 0.9
    })
    invalidate()
  }, [selectedGroup, meshes, invalidate])

  // Cleanup
  useEffect(() => () => {
    Object.values(matsRef.current).forEach(m => m.dispose())
  }, [])

  return (
    <primitive
      object={scene}
      onClick={e => {
        e.stopPropagation()
        const g = findGroup(e.object.name)
        if (g) onMuscleSelect(g)
      }}
    />
  )
}

// ── Smooth camera front/back animation ───────────────────────────────────────
function CameraController({ view }) {
  const { camera, invalidate } = useThree()
  const rafRef = useRef(null)

  useEffect(() => {
    const dest = view === 'anterior'
      ? new THREE.Vector3(0, 0, 4)
      : new THREE.Vector3(0, 0, -4)
    const src = camera.position.clone()
    const dur = 600
    const t0  = performance.now()

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(now) {
      const t = Math.min((now - t0) / dur, 1)
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      camera.position.lerpVectors(src, dest, e)
      camera.lookAt(0, 0, 0)
      invalidate()
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [view])

  return null
}

// ── Platinum shimmer loading fallback ────────────────────────────────────────
function PlatinumLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: '20px 0',
    }}>
      <style>{`
        @keyframes _axb{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}
        @keyframes _axp{0%,100%{opacity:.3}50%{opacity:1}}
      `}</style>
      <div style={{ width: 80, height: 1, background: 'rgba(200,200,220,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: '40%',
          background: 'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)',
          animation: '_axb 2.4s ease-in-out infinite',
        }}/>
      </div>
      <span style={{
        fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
        color: 'rgba(212,212,232,0.6)', fontFamily: 'Helvetica Neue,Arial,sans-serif',
        animation: '_axp 2s ease-in-out infinite',
      }}>Loading Model</span>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function AnatomyModel3D({ selectedGroup, onMuscleSelect, view }) {
  return (
    <div style={{ width: '100%', height: 440, touchAction: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        frameloop="demand"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.6} color="#C8D0DC" />
        <pointLight   position={[3, 5, 6]}    intensity={1.4} color="#D8E0F0" />
        <pointLight   position={[-3, 2, -4]}  intensity={0.5} color="#304050" />
        <pointLight   position={[0, -3, 2]}   intensity={0.3} color="#B0B8C8" />

        <Suspense fallback={<Html center><PlatinumLoader /></Html>}>
          <AnatomyMesh selectedGroup={selectedGroup} onMuscleSelect={onMuscleSelect} />
          <CameraController view={view} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/muscular-system.glb')
