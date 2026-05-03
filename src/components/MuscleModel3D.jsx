import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useHaptic } from '../hooks/useHaptic'

const FF   = 'Helvetica Neue,Arial,sans-serif'
const TEAL = '#4fffb0'
const GOLD = '#C9A96E'
const BASE = '#1c1d2e'

const MUSCLE_DATA = {
  Head:       { sub: 'Mind & Recovery · Neck · Sternocleidomastoid',                 pips: 1 },
  Shoulders:  { sub: 'Anterior Deltoid · Lateral Deltoid · Posterior Deltoid',        pips: 3 },
  Chest:      { sub: 'Pectoralis Major · Pectoralis Minor · Serratus Anterior',       pips: 4 },
  Biceps:     { sub: 'Biceps Brachii · Brachialis · Brachioradialis',                pips: 3 },
  Core:       { sub: 'Rectus Abdominis · Obliques · Transverse Abdominis',            pips: 4 },
  Triceps:    { sub: 'Long Head · Lateral Head · Medial Head',                        pips: 3 },
  Quads:      { sub: 'Vastus Lateralis · Medialis · Intermedius · Rectus Femoris',    pips: 4 },
  Calves:     { sub: 'Gastrocnemius · Soleus · Tibialis Anterior',                   pips: 2 },
  Traps:      { sub: 'Upper · Middle · Lower Trapezius',                              pips: 3 },
  Lats:       { sub: 'Latissimus Dorsi · Teres Major',                               pips: 4 },
  Glutes:     { sub: 'Gluteus Maximus · Medius · Minimus',                           pips: 3 },
  Hamstrings: { sub: 'Biceps Femoris · Semitendinosus · Semimembranosus',            pips: 4 },
}

// Geometric body — each segment maps to a muscle group
// pos:[x,y,z]  rot:[rx,ry,rz]  type: sphere|cylinder|capsule
const SEGMENTS = [
  { id:'head',  group:'Head',       type:'sphere',   args:[0.20,14,14],            pos:[0,    1.46,  0     ], rot:[0,0,0    ] },
  { id:'neck',  group:'Traps',      type:'cylinder', args:[0.085,0.085,0.15,10],   pos:[0,    1.26,  0     ], rot:[0,0,0    ] },
  { id:'traps', group:'Traps',      type:'cylinder', args:[0.29, 0.22, 0.17, 10],  pos:[0,    1.11,  0     ], rot:[0,0,0    ] },
  { id:'shlL',  group:'Shoulders',  type:'sphere',   args:[0.12,12,12],            pos:[-0.35,1.09,  0     ], rot:[0,0,0    ] },
  { id:'shlR',  group:'Shoulders',  type:'sphere',   args:[0.12,12,12],            pos:[0.35, 1.09,  0     ], rot:[0,0,0    ] },
  { id:'chest', group:'Chest',      type:'cylinder', args:[0.22,0.19,0.26,12],     pos:[0,    0.80,  0.02  ], rot:[0,0,0    ] },
  { id:'latL',  group:'Lats',       type:'cylinder', args:[0.08,0.12,0.26,8],      pos:[-0.24,0.72, -0.04  ], rot:[0,0, 0.18] },
  { id:'latR',  group:'Lats',       type:'cylinder', args:[0.08,0.12,0.26,8],      pos:[0.24, 0.72, -0.04  ], rot:[0,0,-0.18] },
  { id:'bicL',  group:'Biceps',     type:'capsule',  args:[0.078,0.26,8,12],       pos:[-0.49,0.75,  0.02  ], rot:[0,0, 0.11] },
  { id:'bicR',  group:'Biceps',     type:'capsule',  args:[0.078,0.26,8,12],       pos:[0.49, 0.75,  0.02  ], rot:[0,0,-0.11] },
  { id:'triL',  group:'Triceps',    type:'capsule',  args:[0.068,0.24,8,12],       pos:[-0.49,0.75, -0.05  ], rot:[0,0, 0.11] },
  { id:'triR',  group:'Triceps',    type:'capsule',  args:[0.068,0.24,8,12],       pos:[0.49, 0.75, -0.05  ], rot:[0,0,-0.11] },
  { id:'fgL',   group:'Biceps',     type:'capsule',  args:[0.058,0.20,8,12],       pos:[-0.52,0.40,  0     ], rot:[0,0, 0.13] },
  { id:'fgR',   group:'Biceps',     type:'capsule',  args:[0.058,0.20,8,12],       pos:[0.52, 0.40,  0     ], rot:[0,0,-0.13] },
  { id:'core',  group:'Core',       type:'cylinder', args:[0.19,0.21,0.26,12],     pos:[0,    0.48,  0.01  ], rot:[0,0,0    ] },
  { id:'hips',  group:'Glutes',     type:'cylinder', args:[0.22,0.20,0.22,12],     pos:[0,    0.16, -0.01  ], rot:[0,0,0    ] },
  { id:'qdL',   group:'Quads',      type:'capsule',  args:[0.11, 0.30,8,12],       pos:[-0.15,-0.27,  0.02 ], rot:[0,0,0    ] },
  { id:'qdR',   group:'Quads',      type:'capsule',  args:[0.11, 0.30,8,12],       pos:[0.15, -0.27,  0.02 ], rot:[0,0,0    ] },
  { id:'hamL',  group:'Hamstrings', type:'capsule',  args:[0.10, 0.28,8,12],       pos:[-0.15,-0.27, -0.05 ], rot:[0,0,0    ] },
  { id:'hamR',  group:'Hamstrings', type:'capsule',  args:[0.10, 0.28,8,12],       pos:[0.15, -0.27, -0.05 ], rot:[0,0,0    ] },
  { id:'cvL',   group:'Calves',     type:'capsule',  args:[0.072,0.30,8,12],       pos:[-0.14,-0.82,  0    ], rot:[0,0,0    ] },
  { id:'cvR',   group:'Calves',     type:'capsule',  args:[0.072,0.30,8,12],       pos:[0.14, -0.82,  0    ], rot:[0,0,0    ] },
]

// ── BodyGroup: handles rotation tween + all mesh rendering + emissive pulse ──
function BodyGroup({ onSelect, targetRotY, selectedRef, workoutDataRef }) {
  const groupRef = useRef()
  const matRefs  = useRef({})

  useFrame(({ clock }) => {
    // Smooth rotation tween
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (targetRotY.current - groupRef.current.rotation.y) * 0.09
    }
    // Pulse selected muscle, ambient heat glow on others
    const sel = selectedRef.current
    const wd  = workoutDataRef.current
    const t   = clock.getElapsedTime()
    SEGMENTS.forEach(seg => {
      const mat = matRefs.current[seg.id]
      if (!mat) return
      if (sel === seg.group) {
        mat.emissiveIntensity = 0.38 + 0.28 * Math.sin(t * 2.4)
      } else {
        const days = wd[seg.group]
        mat.emissiveIntensity =
          days === null ? 0 :
          days === 0    ? 0.11 :
          days === 1    ? 0.08 :
          days <= 3     ? 0.05 : 0.03
      }
    })
  })

  return (
    <group ref={groupRef}>
      {SEGMENTS.map(seg => {
        const wd   = workoutDataRef.current
        const days = wd[seg.group]
        const sel  = selectedRef.current
        const isSel = sel === seg.group

        // Heat emissive colour
        const emissiveColor =
          isSel    ? '#3de880' :
          days === 0 ? '#ff2200' :
          days === 1 ? '#ff6600' :
          days <= 3  ? '#aa8800' :
          days !== null ? '#00aa44' : '#000000'

        return (
          <mesh
            key={seg.id}
            position={seg.pos}
            rotation={seg.rot}
            onClick={e => { e.stopPropagation(); onSelect(seg.group) }}
          >
            {seg.type === 'sphere'   && <sphereGeometry   args={seg.args} />}
            {seg.type === 'cylinder' && <cylinderGeometry args={seg.args} />}
            {seg.type === 'capsule'  && <capsuleGeometry  args={seg.args} />}
            <meshStandardMaterial
              ref={mat => { matRefs.current[seg.id] = mat }}
              color={isSel ? TEAL : BASE}
              emissive={emissiveColor}
              metalness={0.08}
              roughness={0.72}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Main component ──
export default function MuscleModel3D({
  workouts = [],
  onLogWorkout,
  onSaveExercise,
  defaultSelected = null,
}) {
  const [selected, setSelected] = useState(defaultSelected)
  const [view,     setView]     = useState('front')
  const targetRotY     = useRef(0)
  const swipe          = useRef({ active: false, x: 0, moved: false })
  const selectedRef    = useRef(selected)
  const workoutDataRef = useRef({})
  const haptic         = useHaptic()

  // Keep refs in sync with state
  useEffect(() => { selectedRef.current = selected }, [selected])

  const todayStr = new Date().toISOString().split('T')[0]

  // Compute days-since-last-workout per muscle group from workouts prop
  const workoutData = useMemo(() => {
    const lw = {}
    workouts.forEach(w => {
      if (!w.workout_date) return
      ;(w.exercises || []).forEach(ex => {
        if (!ex.muscle_group || ex.muscle_group === 'Full Body') return
        if (!lw[ex.muscle_group] || w.workout_date > lw[ex.muscle_group])
          lw[ex.muscle_group] = w.workout_date
      })
    })
    const result = {}
    Object.keys(MUSCLE_DATA).forEach(m => {
      const date = lw[m]
      result[m] = date === undefined
        ? null
        : Math.round((new Date(todayStr + 'T12:00:00') - new Date(date + 'T12:00:00')) / 86400000)
    })
    return result
  }, [workouts, todayStr])

  workoutDataRef.current = workoutData

  const handleSelect = useCallback((group) => {
    if (swipe.current.moved) return
    haptic.tap()
    setSelected(s => s === group ? null : group)
  }, [haptic])

  // Smooth front/back toggle — find shortest rotation path
  const handleToggle = (v) => {
    setView(v)
    const target = v === 'front' ? 0 : Math.PI
    let curr = ((targetRotY.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    let delta = target - curr
    if (delta >  Math.PI) delta -= 2 * Math.PI
    if (delta < -Math.PI) delta += 2 * Math.PI
    targetRotY.current = targetRotY.current + delta
  }

  // Swipe / drag handlers
  const onTouchStart = e => {
    swipe.current = { active: true, x: e.touches[0].clientX, moved: false }
  }
  const onTouchMove = e => {
    if (!swipe.current.active) return
    const dx = e.touches[0].clientX - swipe.current.x
    if (Math.abs(dx) > 5) swipe.current.moved = true
    targetRotY.current += dx * 0.012
    swipe.current.x = e.touches[0].clientX
  }
  const onTouchEnd = () => { swipe.current.active = false }

  const data  = selected ? MUSCLE_DATA[selected] : null
  const days  = selected ? workoutData[selected] : null
  const recLabel = days === null ? null
    : days === 0 ? 'Fatigued'
    : days === 1 ? 'Recovering'
    : days <= 3  ? 'Active'
    : 'Ready'
  const recColor = days === null ? null
    : days === 0 ? '#ef4444'
    : days === 1 ? '#f97316'
    : days <= 3  ? '#eab308'
    : '#22c55e'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        @keyframes mm3dHint { 0%,100%{opacity:0.18} 50%{opacity:0.38} }
      `}</style>

      {/* Front / Back toggle — matches AXIOS pill style */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[['front','Front'],['back','Back']].map(([v, label]) => (
          <button key={v} onClick={() => handleToggle(v)} style={{
            padding: '7px 26px', borderRadius: 99, cursor: 'pointer',
            background: view === v
              ? 'linear-gradient(135deg,rgba(79,255,176,0.15),rgba(79,255,176,0.07))'
              : 'var(--bg-card)',
            border: `1px solid ${view === v ? 'rgba(79,255,176,0.55)' : 'var(--border)'}`,
            color: view === v ? TEAL : 'var(--text-muted)',
            fontSize: 11, fontFamily: FF, fontWeight: view === v ? 700 : 400,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            boxShadow: view === v ? '0 0 14px rgba(79,255,176,0.22),inset 0 1px 0 rgba(79,255,176,0.15)' : 'none',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* 3D Canvas */}
      <div
        style={{
          position: 'relative', height: 360,
          touchAction: 'none', userSelect: 'none',
          cursor: 'grab',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={e => {
          swipe.current = { active: true, x: e.clientX, moved: false }
          e.currentTarget.style.cursor = 'grabbing'
        }}
        onMouseMove={e => {
          if (!swipe.current.active) return
          const dx = e.clientX - swipe.current.x
          if (Math.abs(dx) > 5) swipe.current.moved = true
          targetRotY.current += dx * 0.010
          swipe.current.x = e.clientX
        }}
        onMouseUp={e => { swipe.current.active = false; e.currentTarget.style.cursor = 'grab' }}
        onMouseLeave={() => { swipe.current.active = false }}
      >
        <Canvas
          camera={{ position: [0, 0.12, 3.9], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 4, 3]}    intensity={1.3} />
          <directionalLight position={[-2, 1, -3]}  intensity={0.35} color="#8899cc" />
          <pointLight       position={[0, -1, 2]}   intensity={0.28} color="#aabbff" />
          <BodyGroup
            onSelect={handleSelect}
            targetRotY={targetRotY}
            selectedRef={selectedRef}
            workoutDataRef={workoutDataRef}
          />
        </Canvas>

        {/* Rotate hint */}
        {!selected && (
          <div style={{
            position: 'absolute', bottom: 12, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.28)', fontSize: 9.5,
              fontFamily: FF, letterSpacing: '0.06em',
              animation: 'mm3dHint 3s ease-in-out infinite',
            }}>
              drag to rotate · tap a muscle
            </span>
          </div>
        )}
      </div>

      {/* Slide-up info panel */}
      <div style={{
        transform: data ? 'translateY(0)' : 'translateY(14px)',
        opacity:   data ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: data ? 'auto' : 'none',
        minHeight: 80,
      }}>
        {data && (
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${TEAL}28`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(90deg,${TEAL}12 0%,transparent 100%)`,
              borderBottom: `1px solid ${TEAL}18`,
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: TEAL, boxShadow: `0 0 6px ${TEAL}66`,
              }}/>
              <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: FF, margin: 0, flex: 1,
                textShadow: `0 0 12px ${TEAL}55` }}>
                {selected}
              </p>
              {recLabel && (
                <span style={{
                  fontSize: 9, fontWeight: 700, fontFamily: FF, letterSpacing: '0.06em',
                  color: recColor, padding: '2px 7px', borderRadius: 99,
                  background: `${recColor}14`, border: `1px solid ${recColor}38`,
                }}>
                  {recLabel}
                </span>
              )}
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i <= data.pips ? GOLD : `${GOLD}22`,
                    boxShadow: i <= data.pips ? `0 0 4px ${GOLD}99` : 'none',
                  }}/>
                ))}
              </div>
            </div>

            {/* Sub-muscles + log button */}
            <div style={{ padding: '10px 14px 13px' }}>
              <p style={{
                color: 'rgba(180,188,204,0.52)', fontSize: 11,
                fontFamily: FF, margin: '0 0 11px', lineHeight: 1.55,
              }}>
                {data.sub}
              </p>
              {onLogWorkout && (
                <button onClick={() => onLogWorkout(selected)} style={{
                  width: '100%', padding: '10px',
                  background: `${TEAL}0e`, border: `1px solid ${TEAL}38`,
                  borderRadius: 10, cursor: 'pointer',
                  color: TEAL, fontSize: 11, fontWeight: 700,
                  fontFamily: FF, letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Log {selected} Workout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
