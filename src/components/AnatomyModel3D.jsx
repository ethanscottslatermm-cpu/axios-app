import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// ── Hardcoded exercise data ───────────────────────────────────────────────────
const MUSCLE_EXERCISES = {
  chest:       ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly'],
  shoulders:   ['Overhead Press', 'Lateral Raise', 'Front Raise'],
  biceps:      ['Barbell Curl', 'Hammer Curl', 'Preacher Curl'],
  triceps:     ['Tricep Pushdown', 'Skull Crusher', 'Diamond Push-Up'],
  forearms:    ['Wrist Curl', 'Reverse Curl', "Farmer's Carry"],
  core:        ['Plank', 'Cable Crunch', 'Hanging Leg Raise'],
  back:        ['Pull-Up', 'Bent-Over Row', 'Lat Pulldown'],
  glutes:      ['Hip Thrust', 'Romanian Deadlift', 'Glute Bridge'],
  quads:       ['Squat', 'Leg Press', 'Leg Extension'],
  hamstrings:  ['Romanian Deadlift', 'Leg Curl', 'Good Morning'],
  calves:      ['Standing Calf Raise', 'Seated Calf Raise', 'Jump Rope'],
  hip_flexors: ['Hip Flexor Stretch', 'Mountain Climber', 'Leg Raise'],
}

const MUSCLE_LABELS = {
  chest:       { label: 'Chest',       latin: 'Pectoralis Major'    },
  shoulders:   { label: 'Shoulders',   latin: 'Deltoid'             },
  biceps:      { label: 'Biceps',      latin: 'Biceps Brachii'      },
  triceps:     { label: 'Triceps',     latin: 'Triceps Brachii'     },
  forearms:    { label: 'Forearms',    latin: 'Brachioradialis'     },
  core:        { label: 'Core',        latin: 'Rectus Abdominis'    },
  back:        { label: 'Back',        latin: 'Latissimus Dorsi'    },
  glutes:      { label: 'Glutes',      latin: 'Gluteus Maximus'     },
  quads:       { label: 'Quads',       latin: 'Quadriceps Femoris'  },
  hamstrings:  { label: 'Hamstrings',  latin: 'Biceps Femoris'      },
  calves:      { label: 'Calves',      latin: 'Gastrocnemius'       },
  hip_flexors: { label: 'Hip Flexors', latin: 'Iliopsoas'           },
}

// ── Mesh name → muscle group ──────────────────────────────────────────────────
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

// Substrings → hide (connective tissue, head, deep/invisible muscles)
const HIDE = [
  'fascia','bursa','retinaculum','aponeurosis','ligament','septum',
  'tendon sheath','tendinous ring','tarsus','trochlea',
  'superior oblique muscle','inferior oblique muscle',
  'superior rectus muscle','inferior rectus muscle',
  'lateral rectus muscle','medial rectus muscle','levator palpebrae',
  'temporalis muscle','pterygoid','frontalis muscle','occipitalis muscle',
  'temporoparietalis','mentalis','nasalis','orbicularis','risorius','zygomaticus',
  'arytenoid','cricothyroid','thyrohyoid','sternohyoid','sternothyroid',
  'omohyoid','digastric','mylohyoid','geniohyoid','stylohyoid',
  'hyoglossus','genioglossus','palatopharyngeus','stylopharyngeus',
  'longus capitis','longus colli','scalenus',
  'rectus anterior capitis','rectus lateralis capitis',
  'obliquus capitis','rectus posterior',
  'interspinales','intertransversarii','multifidus','spinalis',
  'iliocostalis','longissimus','semispinalis',
  'coccygeus','pubo','iliococcygeus','pubococcygeus',
  'interossei','lumbrical','opponens','adductor pollicis',
  'adductor hallucis','plantar aponeurosis','plantar interossei',
  'quadratus plantae','coracobrachialis','subclavius',
  'transversus thoracis','innermost intercostal',
]

const SEL_COLOR  = new THREE.Color('#C9A96E')
const BASE_COLOR = new THREE.Color('#C0C8D8')

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

// ── Inner 3D scene (runs inside Canvas) ──────────────────────────────────────
function Scene3D({ selectedGroup, onMuscleSelect, view, controlsRef }) {
  const { scene }   = useGLTF('/models/muscular-system.glb')
  const { camera }  = useThree()
  const groupRef    = useRef()
  const matsRef     = useRef({})
  const camRaf      = useRef(null)

  // One-time model setup: normalize, assign silver materials
  useEffect(() => {
    scene.scale.set(1, 1, 1)
    scene.position.set(0, 0, 0)
    scene.updateMatrixWorld(true)

    const box    = new THREE.Box3().setFromObject(scene)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s      = 2.5 / Math.max(size.x, size.y, size.z)

    if (groupRef.current) {
      groupRef.current.scale.setScalar(s)
      groupRef.current.position.set(-center.x * s, -center.y * s, -center.z * s)
    }

    const mats = {}
    scene.traverse(child => {
      if (!child.isMesh) return
      if (shouldHide(child.name)) { child.visible = false; return }

      // Explicit raycast assignment — required for reliable tap detection
      child.raycast = THREE.Mesh.prototype.raycast

      child.userData.muscleGroup = findGroup(child.name)

      if (child.material?._axiosOwned) child.material.dispose()
      const mat = new THREE.MeshStandardMaterial({
        color:      BASE_COLOR.clone(),
        roughness:  0.4,
        metalness:  0.7,
        transparent: false,
        opacity:    1,
        side:       THREE.DoubleSide,
        depthWrite: true,
      })
      mat._axiosOwned = true
      child.material = mat
      mats[child.uuid] = mat
    })
    matsRef.current = mats

    return () => { Object.values(matsRef.current).forEach(m => m.dispose()) }
  }, [scene])

  // Gold highlight on selected group
  useEffect(() => {
    scene.traverse(obj => {
      if (!obj.isMesh || !matsRef.current[obj.uuid]) return
      const mat   = matsRef.current[obj.uuid]
      const isSel = !!selectedGroup && obj.userData.muscleGroup === selectedGroup
      mat.color.set(isSel ? SEL_COLOR : BASE_COLOR)
      mat.emissive.set(isSel ? SEL_COLOR : '#000000')
      mat.emissiveIntensity = isSel ? 0.6 : 0
    })
  }, [selectedGroup, scene])

  // Smooth FRONT / BACK camera animation
  useEffect(() => {
    const dest = new THREE.Vector3(0, 0, view === 'anterior' ? 4 : -4)
    const src  = camera.position.clone()
    const t0   = performance.now()
    const DUR  = 600
    if (camRaf.current) cancelAnimationFrame(camRaf.current)

    function tick(now) {
      const t = Math.min((now - t0) / DUR, 1)
      const e = t < 0.5 ? 2*t*t : -1 + (4-2*t)*t
      camera.position.lerpVectors(src, dest, e)
      camera.lookAt(0, 0, 0)
      if (controlsRef?.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
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
          const g = e.object.userData.muscleGroup ?? findGroup(e.object.name)
          if (g) onMuscleSelect(g)
        }}
      />
    </group>
  )
}

// ── Workout panel ─────────────────────────────────────────────────────────────
function WorkoutPanel({ group, onClose }) {
  const info      = MUSCLE_LABELS[group] || { label: group, latin: '' }
  const exercises = MUSCLE_EXERCISES[group] || []
  const [up, setUp] = useState(false)

  useEffect(() => { const t = setTimeout(() => setUp(true), 10); return () => clearTimeout(t) }, [])

  function close() { setUp(false); setTimeout(onClose, 300) }

  const Bracket = ({ flip }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ transform: flip ? 'scale(-1,1)' : 'none' }}>
      <path d="M5 1H1V15H5" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="square"/>
    </svg>
  )

  return (
    <div
      onClick={close}
      style={{ position:'absolute', inset:0, zIndex:10, display:'flex', alignItems:'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          background: '#0D0F14',
          borderTop: '1.5px solid #C9A96E',
          padding: '18px 20px 28px',
          transform: up ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{ position:'absolute', top:12, left:12  }}><Bracket flip={false} /></div>
        <div style={{ position:'absolute', top:12, right:12 }}><Bracket flip={true}  /></div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <div style={{ color:'#C9A96E', fontSize:13, letterSpacing:'2px', textTransform:'uppercase', fontWeight:600 }}>
              {info.label}
            </div>
            {info.latin && (
              <div style={{ color:'rgba(200,200,220,0.4)', fontSize:10, letterSpacing:'1px', marginTop:2 }}>
                {info.latin}
              </div>
            )}
          </div>
          <button onClick={close} style={{
            background:'none', border:'none', color:'rgba(200,200,220,0.5)',
            fontSize:20, cursor:'pointer', padding:'0 4px', lineHeight:1,
          }}>×</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 12px',
              background:'rgba(201,169,110,0.06)',
              border:'1px solid rgba(201,169,110,0.15)',
              borderRadius:4,
            }}>
              <span style={{ color:'#C9A96E', fontSize:11, fontWeight:700, minWidth:18 }}>
                {String(i+1).padStart(2,'0')}
              </span>
              <span style={{ color:'rgba(220,220,235,0.85)', fontSize:13, letterSpacing:'0.5px' }}>
                {ex}
              </span>
            </div>
          ))}
        </div>

        <button style={{
          width:'100%', padding:'12px 0',
          background:'linear-gradient(135deg,#C9A96E,#A88850)',
          border:'none', borderRadius:4,
          color:'#0D0F14', fontSize:12, fontWeight:700,
          letterSpacing:'2px', textTransform:'uppercase',
          cursor:'pointer',
        }}>
          Log Workout
        </button>
      </div>
    </div>
  )
}

// ── Loading indicator ─────────────────────────────────────────────────────────
function PlatinumLoader() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      <style>{`
        @keyframes _axb{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}
        @keyframes _axp{0%,100%{opacity:.3}50%{opacity:1}}
      `}</style>
      <div style={{ width:80, height:1, background:'rgba(200,200,220,0.08)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:'40%',
          background:'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)',
          animation:'_axb 2.4s ease-in-out infinite' }}/>
      </div>
      <span style={{ fontSize:10, letterSpacing:'3px', textTransform:'uppercase',
        color:'rgba(212,212,232,0.6)', fontFamily:'Helvetica Neue,Arial,sans-serif',
        animation:'_axp 2s ease-in-out infinite' }}>
        Loading Model
      </span>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
export default function AnatomyModel3D({ selectedGroup, onMuscleSelect, view }) {
  const controlsRef = useRef()
  const [panelGroup, setPanelGroup] = useState(null)

  function handleSelect(g) {
    onMuscleSelect(g)
    setPanelGroup(g)
  }

  return (
    <div style={{ position:'relative', width:'100%', height:'60vh', minHeight:400, touchAction:'none' }}>
      <Canvas
        camera={{ position:[0, 0, 4], fov:40 }}
        gl={{ alpha:true, antialias:true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        frameloop="always"
        style={{ background:'transparent', width:'100%', height:'100%' }}
      >
        {/* Three-point lighting: directional key + fill + rim */}
        <ambientLight     intensity={0.5}  color="#C8D0DC" />
        <directionalLight position={[5, 5, 5]}   intensity={1.8} color="#FFFFFF" castShadow={false} />
        <directionalLight position={[-5, 3, -5]}  intensity={0.8} color="#A0B8D0" />
        <pointLight       position={[0, -3, -4]}  intensity={0.4} color="#304050" />

        <Suspense fallback={<Html center><PlatinumLoader /></Html>}>
          <Scene3D
            selectedGroup={selectedGroup}
            onMuscleSelect={handleSelect}
            view={view}
            controlsRef={controlsRef}
          />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {panelGroup && (
        <WorkoutPanel
          group={panelGroup}
          onClose={() => setPanelGroup(null)}
        />
      )}
    </div>
  )
}

useGLTF.preload('/models/muscular-system.glb')
