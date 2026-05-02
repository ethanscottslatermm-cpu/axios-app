import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'

// ── Colors ────────────────────────────────────────────────────────────────────
const SEL  = '#C9A96E'   // gold selection
const DFLT = '#5A6878'   // neutral steel for unrecognised muscles

const GROUP_COLORS = {
  chest:       '#7AAAD0',  // steel blue
  shoulders:   '#6AB89A',  // teal
  biceps:      '#9A80C8',  // violet
  triceps:     '#C06888',  // rose
  forearms:    '#88A068',  // olive
  core:        '#6898C0',  // sky blue
  back:        '#6888A8',  // slate
  glutes:      '#C07850',  // copper
  quads:       '#68AA78',  // green
  hamstrings:  '#B08858',  // amber
  calves:      '#7888B0',  // periwinkle
  hip_flexors: '#9888A8',  // plum
}

// ── Group → Z-Anatomy mesh name patterns ──────────────────────────────────────
const GROUPS = {
  chest:       ['pectoralis'],
  shoulders:   ['deltoid muscle', 'part of deltoid'],
  biceps:      ['biceps brachii', 'brachialis muscle'],
  triceps:     ['triceps brachii'],
  forearms:    ['brachioradialis', 'flexor carpi', 'extensor carpi',
                'pronator', 'palmaris longus'],
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

// Mesh name substrings → hide entirely (connective tissue, head, deep muscles)
const HIDE = [
  // Connective tissue
  'fascia','bursa','retinaculum','aponeurosis','ligament','septum',
  'tendon sheath','tendinous ring','tarsus','trochlea',
  // Eye muscles
  'superior oblique muscle','inferior oblique muscle',
  'superior rectus muscle','inferior rectus muscle',
  'lateral rectus muscle','medial rectus muscle','levator palpebrae',
  // Face / head muscles
  'temporalis muscle','pterygoid','frontalis muscle','occipitalis muscle',
  'temporoparietalis','mentalis','nasalis','orbicularis','risorius','zygomaticus',
  // Throat / larynx
  'arytenoid','cricothyroid','thyrohyoid','sternohyoid','sternothyroid',
  'omohyoid','digastric','mylohyoid','geniohyoid','stylohyoid',
  'hyoglossus','genioglossus','palatopharyngeus','stylopharyngeus',
  // Deep neck
  'longus capitis','longus colli','scalenus',
  'rectus anterior capitis','rectus lateralis capitis',
  'obliquus capitis','rectus posterior',
  // Deep spine (invisible from outside)
  'interspinales','intertransversarii','multifidus','spinalis',
  'iliocostalis','longissimus','semispinalis',
  // Pelvic floor
  'coccygeus','pubo','iliococcygeus','pubococcygeus',
  // Small intrinsic hand / foot
  'interossei','lumbrical','opponens','adductor pollicis',
  'adductor hallucis','plantar aponeurosis','plantar interossei',
  // Misc small
  'quadratus plantae','coracobrachialis','subclavius',
  'transversus thoracis','innermost intercostal',
]

function shouldHide(name) {
  const l = name.toLowerCase()
  return HIDE.some(w => l.includes(w))
}

function findGroup(name) {
  if (shouldHide(name)) return null
  const l = name.toLowerCase()
  for (const [key, pats] of Object.entries(GROUPS)) {
    if (pats.some(p => l.includes(p))) return key
  }
  return null
}

function baseColor(name) {
  const g = findGroup(name)
  return g ? GROUP_COLORS[g] : DFLT
}

// ── Inner scene component (runs inside Canvas context) ────────────────────────
function Scene3D({ selectedGroup, onMuscleSelect, view }) {
  const { scene }              = useGLTF('/models/muscular-system.glb')
  const { camera }             = useThree()
  const groupRef               = useRef()
  const matsRef                = useRef({})  // uuid → MeshStandardMaterial
  const camRaf                 = useRef(null)

  // ── One-time setup: fit + center model, assign all materials ─────────────
  useEffect(() => {
    // Reset any transform that old code may have mutated on the cached scene
    scene.scale.set(1, 1, 1)
    scene.position.set(0, 0, 0)
    scene.updateMatrixWorld(true)

    // Compute bounding box of the raw (unscaled) scene
    const box    = new THREE.Box3().setFromObject(scene)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s      = 2.5 / Math.max(size.x, size.y, size.z)

    // Apply transform via wrapper group (never mutate the cached scene)
    if (groupRef.current) {
      groupRef.current.scale.setScalar(s)
      groupRef.current.position.set(-center.x * s, -center.y * s, -center.z * s)
    }

    // Create opaque MeshStandardMaterial for every visible muscle mesh
    const mats = {}
    scene.traverse(obj => {
      if (!obj.isMesh) return
      if (shouldHide(obj.name)) { obj.visible = false; return }
      // Dispose any previously assigned material
      if (obj.material?._axiosOwned) obj.material.dispose()
      const mat = new THREE.MeshStandardMaterial({
        color:      baseColor(obj.name),
        roughness:  0.35,
        metalness:  0.60,
        side:       THREE.DoubleSide,   // handles inverted normals in Z-Anatomy
        depthWrite: true,
      })
      mat._axiosOwned = true
      obj.material = mat
      mats[obj.uuid] = mat
    })
    matsRef.current = mats

    return () => { Object.values(mats).forEach(m => m.dispose()) }
  }, [scene])

  // ── Gold highlight on selected group ─────────────────────────────────────
  useEffect(() => {
    scene.traverse(obj => {
      if (!obj.isMesh || shouldHide(obj.name)) return
      const mat = matsRef.current[obj.uuid]
      if (!mat) return
      const isSel = !!selectedGroup && findGroup(obj.name) === selectedGroup
      mat.color.set(isSel ? SEL : baseColor(obj.name))
      mat.emissive.set(isSel ? SEL : '#000000')
      mat.emissiveIntensity = isSel ? 0.5 : 0
    })
  }, [selectedGroup, scene])

  // ── Smooth FRONT / BACK camera animation ─────────────────────────────────
  useEffect(() => {
    const dest = new THREE.Vector3(0, 0, view === 'anterior' ? 3 : -3)
    const src  = camera.position.clone()
    const t0   = performance.now()
    const DUR  = 600
    if (camRaf.current) cancelAnimationFrame(camRaf.current)
    function tick(now) {
      const t = Math.min((now - t0) / DUR, 1)
      const e = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t
      camera.position.lerpVectors(src, dest, e)
      camera.lookAt(0, 0, 0)
      if (t < 1) camRaf.current = requestAnimationFrame(tick)
    }
    camRaf.current = requestAnimationFrame(tick)
    return () => { if (camRaf.current) cancelAnimationFrame(camRaf.current) }
  }, [view, camera])

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        onPointerDown={e => {
          e.stopPropagation()
          const g = findGroup(e.object.name)
          if (g) onMuscleSelect(g)
        }}
      />
    </group>
  )
}

// ── Platinum shimmer ──────────────────────────────────────────────────────────
function PlatinumLoader() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      <style>{`
        @keyframes _axb{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}
        @keyframes _axp{0%,100%{opacity:.3}50%{opacity:1}}
      `}</style>
      <div style={{ width:80, height:1, background:'rgba(200,200,220,0.08)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:'40%', background:'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)', animation:'_axb 2.4s ease-in-out infinite' }}/>
      </div>
      <span style={{ fontSize:10, letterSpacing:'3px', textTransform:'uppercase', color:'rgba(212,212,232,0.6)', fontFamily:'Helvetica Neue,Arial,sans-serif', animation:'_axp 2s ease-in-out infinite' }}>
        Loading Model
      </span>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
export default function AnatomyModel3D({ selectedGroup, onMuscleSelect, view }) {
  return (
    <div style={{ width:'100%', height:520, touchAction:'none' }}>
      <Canvas
        camera={{ position:[0, 0, 3], fov:45 }}
        gl={{ alpha:true, antialias:true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        frameloop="always"          // always render — avoids black-canvas on first load
        style={{ background:'transparent' }}
      >
        {/* Three-point lighting — front key + top fill + rim from behind */}
        <ambientLight   intensity={1.4}  color="#C8D0DC" />
        <pointLight     position={[2, 4, 5]}   intensity={1.6} color="#D8E8F8" />
        <pointLight     position={[-3, 2, 4]}  intensity={0.6} color="#A0B8D0" />
        <pointLight     position={[0, -2, -4]} intensity={0.4} color="#304050" />

        <Suspense fallback={<Html center><PlatinumLoader /></Html>}>
          <Scene3D
            selectedGroup={selectedGroup}
            onMuscleSelect={onMuscleSelect}
            view={view}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/muscular-system.glb')
