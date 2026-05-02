import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

const BASE_COLOR     = '#1A1E26'
const SELECTED_COLOR = '#C9A96E'

const MUSCLE_GROUPS = {
  chest:       { names: ['pectoralis major', 'pectoralis minor'] },
  shoulders:   { names: ['deltoid'] },
  biceps:      { names: ['biceps brachii', 'brachialis'] },
  triceps:     { names: ['triceps brachii'] },
  forearms:    { names: ['flexor carpi', 'extensor carpi', 'brachioradialis'] },
  core:        { names: ['rectus abdominis', 'external abdominal oblique', 'internal abdominal oblique', 'transversus abdominis'] },
  back:        { names: ['latissimus dorsi', 'trapezius', 'rhomboid'] },
  glutes:      { names: ['gluteus maximus', 'gluteus medius', 'gluteus minimus'] },
  quads:       { names: ['rectus femoris', 'vastus lateralis', 'vastus medialis', 'vastus intermedius'] },
  hamstrings:  { names: ['biceps femoris', 'semimembranosus', 'semitendinosus'] },
  calves:      { names: ['gastrocnemius', 'soleus'] },
  hip_flexors: { names: ['psoas', 'iliacus', 'sartorius'] },
}

function findGroup(meshName) {
  const lower = meshName.toLowerCase()
  for (const [key, g] of Object.entries(MUSCLE_GROUPS)) {
    if (g.names.some(n => lower.includes(n))) return key
  }
  return null
}

function CameraController({ view }) {
  const { camera, invalidate } = useThree()
  const rafRef = useRef(null)

  useEffect(() => {
    const target = view === 'anterior'
      ? new THREE.Vector3(0, 1, 3)
      : new THREE.Vector3(0, 1, -3)
    const start = camera.position.clone()
    const dur   = 600
    const t0    = performance.now()

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(now) {
      const t = Math.min((now - t0) / dur, 1)
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      camera.position.lerpVectors(start, target, e)
      camera.lookAt(0, 0, 0)
      invalidate()
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [view])

  return null
}

function AnatomyMesh({ selectedGroup, onMuscleSelect }) {
  const { scene }   = useGLTF('/models/muscular-system.glb')
  const { invalidate } = useThree()
  const matsRef     = useRef({})

  const meshes = useMemo(() => {
    const list = []
    scene.traverse(obj => { if (obj.isMesh) list.push(obj) })
    return list
  }, [scene])

  // Assign / update materials on selection change
  useEffect(() => {
    meshes.forEach(mesh => {
      if (!matsRef.current[mesh.uuid]) {
        const mat = new THREE.MeshStandardMaterial({
          color: BASE_COLOR, transparent: true, opacity: 0.85,
          roughness: 0.8, metalness: 0.3,
        })
        mesh.material = mat
        matsRef.current[mesh.uuid] = mat
      }
      const mat      = matsRef.current[mesh.uuid]
      const isSel    = selectedGroup && findGroup(mesh.name) === selectedGroup
      mat.color.set(isSel ? SELECTED_COLOR : BASE_COLOR)
      mat.emissive.set(isSel ? SELECTED_COLOR : '#000000')
      mat.emissiveIntensity = isSel ? 0.4 : 0
      mat.opacity           = isSel ? 1   : 0.85
    })
    invalidate()
  }, [selectedGroup, meshes, invalidate])

  useEffect(() => () => {
    Object.values(matsRef.current).forEach(m => m.dispose())
  }, [])

  function handleClick(e) {
    e.stopPropagation()
    const group = findGroup(e.object.name)
    if (group) onMuscleSelect(group)
  }

  return <primitive object={scene} onClick={handleClick} />
}

function PlatinumLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      minWidth: 160,
    }}>
      <style>{`@keyframes _ax3d_bar{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}`}</style>
      <div style={{ width: 80, height: 1, background: 'rgba(200,200,220,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: '40%',
          background: 'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)',
          animation: '_ax3d_bar 2.4s ease-in-out infinite',
        }}/>
      </div>
      <span style={{
        fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase',
        color: 'rgba(212,212,232,0.6)', fontFamily: 'Helvetica Neue,Arial,sans-serif',
      }}>Loading Model</span>
    </div>
  )
}

export default function AnatomyModel3D({ selectedGroup, onMuscleSelect, view }) {
  return (
    <div style={{ width: '100%', height: 420 }}>
      <Canvas
        camera={{ position: [0, 1, 3], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        frameloop="demand"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <Suspense fallback={<Html center><PlatinumLoader /></Html>}>
          <AnatomyMesh selectedGroup={selectedGroup} onMuscleSelect={onMuscleSelect} />
          <CameraController view={view} />
        </Suspense>
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/muscular-system.glb')
