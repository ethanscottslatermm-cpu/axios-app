import { useState, useMemo, useEffect } from 'react'
import Model from 'react-body-highlighter'
import { DB } from './WorkoutGuide'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MUSCLES = ['Chest','Shoulders','Traps','Biceps','Triceps','Core','Upper Back','Lower Back','Quads','Hamstrings','Glutes','Calves']

const SLUG_MAP = {
  Chest:          ['chest'],
  Shoulders:      ['front-deltoids', 'back-deltoids'],
  Traps:          ['trapezius'],
  Biceps:         ['biceps', 'forearm'],
  Triceps:        ['triceps'],
  Core:           ['abs', 'obliques'],
  'Upper Back':   ['upper-back'],
  'Lower Back':   ['lower-back'],
  Quads:          ['quadriceps'],
  Hamstrings:     ['hamstring'],
  Glutes:         ['gluteal'],
  Calves:         ['calves', 'left-soleus', 'right-soleus'],
}

const GROUP_FROM_SLUG = {
  chest:           'Chest',
  'front-deltoids':'Shoulders',
  'back-deltoids': 'Shoulders',
  biceps:          'Biceps',
  forearm:         'Biceps',
  triceps:         'Triceps',
  abs:             'Core',
  obliques:        'Core',
  trapezius:       'Traps',
  'upper-back':    'Upper Back',
  'lower-back':    'Lower Back',
  quadriceps:      'Quads',
  adductor:        'Quads',
  abductors:       'Quads',
  hamstring:       'Hamstrings',
  gluteal:         'Glutes',
  calves:          'Calves',
  'left-soleus':   'Calves',
  'right-soleus':  'Calves',
}

const GROUP_TO_DB = {
  Chest:          'chest',
  Shoulders:      'shoulders',
  Traps:          'traps',
  Biceps:         'biceps',
  Triceps:        'triceps',
  Core:           'core',
  'Upper Back':   'upper_back',
  'Lower Back':   'lower_back',
  Quads:          'quads',
  Hamstrings:     'hamstrings',
  Glutes:         'glutes',
  Calves:         'calves',
}

const SCI_SHORT = {
  Chest:          'Pectoralis',
  Shoulders:      'Deltoideus',
  Traps:          'Trapezius',
  Biceps:         'Biceps Brachii',
  Triceps:        'Triceps Brachii',
  Core:           'Rectus Abdominis',
  'Upper Back':   'Rhomboids',
  'Lower Back':   'Erector Spinae',
  Quads:          'Quadriceps Femoris',
  Hamstrings:     'Biceps Femoris',
  Glutes:         'Gluteus Maximus',
  Calves:         'Gastrocnemius',
}

// Muscle cuts, bone landmarks, and vein paths — coords in model's 0 0 100 200 space.
// Based on actual polygon data extracted from react-body-highlighter source.
const DEFINITION_LINES = {
  anterior: {
    Chest: [
      { d: 'M 49.5 34 L 49.5 58',             type: 'bone'   }, // sternum
      { d: 'M 49 34 L 22 31',                  type: 'bone'   }, // left clavicle
      { d: 'M 51 34 L 78 31',                  type: 'bone'   }, // right clavicle
      { d: 'M 32 54 Q 41 61 49.5 58',          type: 'muscle' }, // left pec lower arch
      { d: 'M 68 54 Q 59 61 50.5 58',          type: 'muscle' }, // right pec lower arch
      { d: 'M 49.5 41 Q 38 47 30 53',          type: 'muscle' }, // left pec fiber
      { d: 'M 50.5 41 Q 62 47 70 53',          type: 'muscle' }, // right pec fiber
    ],
    Shoulders: [
      { d: 'M 22 32 Q 18.5 38 20 45',          type: 'muscle' }, // left delt groove
      { d: 'M 78 32 Q 81.5 38 80 45',          type: 'muscle' }, // right delt groove
      { d: 'M 20 45 Q 24 51 28 56',            type: 'muscle' }, // left delt/bi junction
      { d: 'M 80 45 Q 76 51 72 56',            type: 'muscle' }, // right delt/bi junction
    ],
    Biceps: [
      { d: 'M 23 52 Q 21 61 19 71',            type: 'muscle' }, // left bicep split
      { d: 'M 77 52 Q 79 61 81 71',            type: 'muscle' }, // right bicep split
      { d: 'M 22 54 Q 19.5 64 17 74',          type: 'vein'   }, // left bicep vein
      { d: 'M 78 54 Q 80.5 64 83 74',          type: 'vein'   }, // right bicep vein
      { d: 'M 16 77 Q 11 88 8 97',             type: 'vein'   }, // left forearm vein 1
      { d: 'M 18 78 Q 14 89 11 98',            type: 'vein'   }, // left forearm vein 2
      { d: 'M 84 77 Q 89 88 92 97',            type: 'vein'   }, // right forearm vein 1
      { d: 'M 82 78 Q 86 89 89 98',            type: 'vein'   }, // right forearm vein 2
    ],
    Triceps: [
      { d: 'M 25 57 Q 23 64 22 72',            type: 'muscle' }, // left tricep line
      { d: 'M 75 57 Q 77 64 78 72',            type: 'muscle' }, // right tricep line
    ],
    Core: [
      { d: 'M 50 58 L 50 95',                  type: 'muscle' }, // ab midline
      { d: 'M 42 65 L 58 65',                  type: 'muscle' }, // cut 1
      { d: 'M 41 72 L 59 72',                  type: 'muscle' }, // cut 2
      { d: 'M 41 79 L 59 79',                  type: 'muscle' }, // cut 3
      { d: 'M 40 86 L 60 86',                  type: 'muscle' }, // cut 4
      { d: 'M 38 64 Q 33 77 35 91',            type: 'muscle' }, // left oblique edge
      { d: 'M 62 64 Q 67 77 65 91',            type: 'muscle' }, // right oblique edge
    ],
    Quads: [
      { d: 'M 40 101 Q 37 123 36 144',         type: 'muscle' }, // left RF/VL cut
      { d: 'M 60 101 Q 63 123 64 144',         type: 'muscle' }, // right RF/VL cut
      { d: 'M 29 112 Q 27 129 27 147',         type: 'muscle' }, // left outer VL
      { d: 'M 71 112 Q 73 129 73 147',         type: 'muscle' }, // right outer VL
      { d: 'M 39 136 Q 37 143 40 151',         type: 'muscle' }, // left VMO bulge
      { d: 'M 61 136 Q 63 143 60 151',         type: 'muscle' }, // right VMO bulge
    ],
    Calves: [
      { d: 'M 30 165 Q 29 176 30 187',         type: 'muscle' }, // left medial/lateral split
      { d: 'M 70 165 Q 71 176 70 187',         type: 'muscle' }, // right medial/lateral split
      { d: 'M 27 168 Q 26 179 28 187',         type: 'muscle' }, // left lateral head line
      { d: 'M 73 168 Q 74 179 72 187',         type: 'muscle' }, // right lateral head line
    ],
  },
  posterior: {
    Traps: [
      { d: 'M 44 22 Q 37 33 32 42',            type: 'muscle' }, // left trap fiber
      { d: 'M 56 22 Q 63 33 68 42',            type: 'muscle' }, // right trap fiber
      { d: 'M 47.5 22 L 47.5 62',              type: 'muscle' }, // left inner trap line
      { d: 'M 52.5 22 L 52.5 62',              type: 'muscle' }, // right inner trap line
    ],
    Shoulders: [
      { d: 'M 24 39 Q 20 48 22 57',            type: 'muscle' }, // left rear delt line
      { d: 'M 76 39 Q 80 48 78 57',            type: 'muscle' }, // right rear delt line
    ],
    'Upper Back': [
      { d: 'M 50 28 L 50 100',                 type: 'bone'   }, // spine
      { d: 'M 47 40 L 35 56 L 37 67',          type: 'muscle' }, // left scapula border
      { d: 'M 53 40 L 65 56 L 63 67',          type: 'muscle' }, // right scapula border
      { d: 'M 47 41 Q 41 55 37 65',            type: 'muscle' }, // left lat sweep
      { d: 'M 53 41 Q 59 55 63 65',            type: 'muscle' }, // right lat sweep
      { d: 'M 41 68 Q 35 77 34 86',            type: 'muscle' }, // left lat lower
      { d: 'M 59 68 Q 65 77 66 86',            type: 'muscle' }, // right lat lower
    ],
    'Lower Back': [
      { d: 'M 46 74 L 44 101',                 type: 'muscle' }, // left erector spinae
      { d: 'M 54 74 L 56 101',                 type: 'muscle' }, // right erector spinae
      { d: 'M 44 80 Q 43 88 44 97',            type: 'vein'   }, // left paraspinal vein
      { d: 'M 56 80 Q 57 88 56 97',            type: 'vein'   }, // right paraspinal vein
    ],
    Triceps: [
      { d: 'M 22 56 Q 19 67 18 77',            type: 'muscle' }, // left long head
      { d: 'M 78 56 Q 81 67 82 77',            type: 'muscle' }, // right long head
      { d: 'M 25 59 Q 22 69 21 79',            type: 'muscle' }, // left lateral head
      { d: 'M 75 59 Q 78 69 79 79',            type: 'muscle' }, // right lateral head
    ],
    Glutes: [
      { d: 'M 50 100 L 50 123',                type: 'muscle' }, // glute cleft
      { d: 'M 32 113 Q 41 120 49.5 117',       type: 'muscle' }, // left glute crease
      { d: 'M 68 113 Q 59 120 50.5 117',       type: 'muscle' }, // right glute crease
    ],
    Hamstrings: [
      { d: 'M 33 128 Q 31 144 29 161',         type: 'muscle' }, // left biceps femoris
      { d: 'M 67 128 Q 69 144 71 161',         type: 'muscle' }, // right biceps femoris
      { d: 'M 38 127 Q 37 146 38 163',         type: 'muscle' }, // left semimembranosus
      { d: 'M 62 127 Q 63 146 62 163',         type: 'muscle' }, // right semimembranosus
    ],
    Calves: [
      { d: 'M 30 168 Q 29 180 30 193',         type: 'muscle' }, // left lateral/medial split
      { d: 'M 70 168 Q 71 180 70 193',         type: 'muscle' }, // right lateral/medial split
      { d: 'M 26 169 Q 25 181 27 193',         type: 'muscle' }, // left lateral head
      { d: 'M 74 169 Q 75 181 73 193',         type: 'muscle' }, // right lateral head
    ],
  },
}

// Labels positioned in the model's 0 0 100 200 coordinate space.
// x < 0 or x > 100 renders outside body (requires overflow:visible on parent).
// ex = x-coordinate of the leader line's body-side endpoint.
const LABELS = {
  anterior: [
    { group: 'Shoulders',   x: 103, y: 42,  anchor: 'start', ex: 79 },
    { group: 'Chest',       x: 103, y: 51,  anchor: 'start', ex: 70 },
    { group: 'Biceps',      x: -3,  y: 61,  anchor: 'end',   ex: 17 },
    { group: 'Core',        x: 103, y: 81,  anchor: 'start', ex: 59 },
    { group: 'Quads',       x: -3,  y: 118, anchor: 'end',   ex: 29 },
    { group: 'Calves',      x: 103, y: 175, anchor: 'start', ex: 74 },
  ],
  posterior: [
    { group: 'Traps',       x: 103, y: 38,  anchor: 'start', ex: 64 },
    { group: 'Shoulders',   x: -3,  y: 46,  anchor: 'end',   ex: 29 },
    { group: 'Upper Back',  x: 103, y: 57,  anchor: 'start', ex: 66 },
    { group: 'Triceps',     x: -3,  y: 65,  anchor: 'end',   ex: 27 },
    { group: 'Lower Back',  x: -3,  y: 82,  anchor: 'end',   ex: 44 },
    { group: 'Glutes',      x: 103, y: 111, anchor: 'start', ex: 69 },
    { group: 'Hamstrings',  x: -3,  y: 140, anchor: 'end',   ex: 29 },
    { group: 'Calves',      x: 103, y: 178, anchor: 'start', ex: 71 },
  ],
}

function getHeat(n) {
  if (n === 0) return { label: 'Cold',  hex: 'rgba(140,155,175,0.4)' }
  if (n === 1) return { label: '×1',    hex: '#7a8fa8' }
  if (n === 2) return { label: '×2',    hex: '#a8b8cc' }
  return             { label: '×3+',   hex: '#d8e0ee' }
}

function getRecovery(n) {
  return [
    { pct: 100, status: 'Ready',    color: '#3cb371' },
    { pct: 84,  status: 'Ready',    color: '#80c060' },
    { pct: 68,  status: 'Active',   color: '#e8a030' },
    { pct: 45,  status: 'Fatigued', color: '#d73a28' },
  ][Math.min(n, 3)]
}

function fmtDate(ds, todayStr) {
  if (!ds) return 'Never'
  const diff = Math.round((new Date(todayStr + 'T12:00:00') - new Date(ds + 'T12:00:00')) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)   return `${diff}d ago`
  return new Date(ds + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function pickFour(pool) {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 4)
}

function ExCard({ ex, accent }) {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '11px 12px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, fontFamily: FF, marginBottom: 3 }}>{ex.name}</p>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, background: 'rgba(212,212,232,0.06)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{ex.eq}</span>
            <span style={{ color: accent, fontSize: 9, fontFamily: FF, fontWeight: 700, background: `${accent}18`, padding: '2px 6px', borderRadius: 4 }}>{ex.sets}</span>
          </div>
        </div>
        <a href={ytUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
            padding: '6px 9px', borderRadius: 7,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
            color: '#ef4444', fontSize: 9, fontWeight: 700,
            fontFamily: FF, letterSpacing: '0.08em', textDecoration: 'none',
          }}
          onClick={e => e.stopPropagation()}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="#ef4444">
            <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/>
            <polygon fill="white" points="10,8.5 16,12 10,15.5"/>
          </svg>
          Watch
        </a>
      </div>
    </div>
  )
}

export default function MuscleMapView({ workouts = [] }) {
  const [selected,  setSelected]  = useState(null)
  const [view,      setView]      = useState('anterior')
  const [exercises, setExercises] = useState([])
  const [spinning,  setSpinning]  = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const sevenStr = sevenAgo.toISOString().split('T')[0]

  const counts = useMemo(() => {
    const c = {}; MUSCLES.forEach(m => { c[m] = 0 })
    const seen = new Set()
    workouts.forEach(w => {
      if (!w.workout_date || w.workout_date < sevenStr || w.workout_date > todayStr) return
      ;(w.exercises || []).forEach(ex => {
        const mg = ex.muscle_group; if (!mg) return
        if (mg === 'Full Body') {
          MUSCLES.forEach(k => { const key = `${w.workout_date}-${k}`; if (!seen.has(key)) { seen.add(key); c[k]++ } })
        } else if (c[mg] !== undefined) {
          const key = `${w.workout_date}-${mg}`; if (!seen.has(key)) { seen.add(key); c[mg]++ }
        }
      })
    })
    return c
  }, [workouts, sevenStr, todayStr])

  const lastWorked = useMemo(() => {
    const lw = {}
    workouts.forEach(w => {
      if (!w.workout_date) return
      ;(w.exercises || []).forEach(ex => {
        if (!ex.muscle_group || ex.muscle_group === 'Full Body') return
        if (!lw[ex.muscle_group] || w.workout_date > lw[ex.muscle_group]) lw[ex.muscle_group] = w.workout_date
      })
    })
    return lw
  }, [workouts])

  useEffect(() => {
    if (selected) {
      const dbKey = GROUP_TO_DB[selected]
      if (dbKey && DB[dbKey]) setExercises(pickFour(DB[dbKey].exercises))
    } else {
      setExercises([])
    }
  }, [selected])

  function handleClick({ muscle }) {
    const group = GROUP_FROM_SLUG[muscle]
    if (group) setSelected(s => s === group ? null : group)
  }

  function handleShuffle() {
    if (!selected) return
    const dbKey = GROUP_TO_DB[selected]
    if (!dbKey || !DB[dbKey]) return
    setSpinning(true)
    setExercises(pickFour(DB[dbKey].exercises))
    setTimeout(() => setSpinning(false), 460)
  }

  const n      = selected ? (counts[selected] || 0) : 0
  const heat   = getHeat(n)
  const rec    = selected ? getRecovery(n) : null
  const dbData = selected ? DB[GROUP_TO_DB[selected]] : null
  const labels = LABELS[view] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        @keyframes mmFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes mmGlow   { 0%,100% { opacity:0.85 } 50% { opacity:1 } }
        @keyframes mmPulse  { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
      `}</style>

      {/* Front / Back toggle */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[['anterior','Front'], ['posterior','Back']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '6px 20px', borderRadius: 99, cursor: 'pointer',
            background: view === v ? 'rgba(180,188,220,0.12)' : 'var(--bg-card)',
            border:    `1px solid ${view === v ? 'rgba(180,188,220,0.45)' : 'var(--border)'}`,
            color:      view === v ? '#d8e0ee' : 'var(--text-muted)',
            fontSize: 11, fontFamily: FF, fontWeight: view === v ? 700 : 400,
            letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Body model + label overlay */}
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 240, overflow: 'visible' }}>

          {/* Background glow — tints to selected muscle DB color */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, borderRadius: 8, pointerEvents: 'none',
            background: dbData
              ? `radial-gradient(ellipse 72% 62% at 50% 45%, ${dbData.color}28 0%, transparent 65%)`
              : 'none',
            transition: 'background 0.6s ease',
          }}/>

          {/* Base body silhouette — handles all click events */}
          <Model
            data={[]}
            type={view}
            bodyColor="#1a1a28"
            onClick={handleClick}
            style={{
              width: '100%', display: 'block', position: 'relative', zIndex: 1,
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.28)) drop-shadow(0 0 1px rgba(255,255,255,0.55))',
            }}
            svgStyle={{ borderRadius: 8 }}
          />

          {/* Per-muscle DB-colored overlays */}
          {MUSCLES.map(m => {
            const dbKey = GROUP_TO_DB[m]
            const color = DB[dbKey]?.color || '#b4bccc'
            const c     = counts[m] || 0
            const isSel = selected === m
            const op    = isSel ? 1.0 : c === 0 ? 0.38 : c === 1 ? 0.60 : c === 2 ? 0.80 : 0.95
            return (
              <div key={m} style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                opacity: op,
                filter: isSel ? `drop-shadow(0 0 9px ${color}) drop-shadow(0 0 4px ${color})` : undefined,
                transition: 'opacity 0.35s ease, filter 0.35s ease',
                animation: isSel ? 'mmPulse 2.4s ease-in-out infinite' : undefined,
              }}>
                <Model
                  data={[{ name: m, muscles: SLUG_MAP[m], frequency: 1 }]}
                  type={view}
                  bodyColor="rgba(0,0,0,0)"
                  highlightedColors={[color, color, color]}
                  style={{ width: '100%', display: 'block' }}
                  svgStyle={{ borderRadius: 8 }}
                />
              </div>
            )
          })}

          {/* Label overlay — viewBox matches model's 0 0 100 200 space */}
          <svg
            viewBox="0 0 100 200"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              overflow: 'visible', pointerEvents: 'none',
            }}
          >
            <defs>
              <filter id="mm-label-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/>
                <feFlood floodColor="#ffffff" floodOpacity="1" result="white"/>
                <feComposite in="white" in2="blur" operator="in" result="wb"/>
                <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Definition lines — bone landmarks, muscle cuts, veins */}
            {Object.entries(DEFINITION_LINES[view] || {}).map(([group, lines]) => {
              const isActive = selected === group
              const dbKey    = GROUP_TO_DB[group]
              const color    = DB[dbKey]?.color || '#b4bccc'
              return lines.map((line, i) => {
                const isVein   = line.type === 'vein'
                const isBone   = line.type === 'bone'
                const baseOp   = isBone ? 0.24 : isVein ? 0.14 : 0.20
                const activeOp = isBone ? 0.88 : isVein ? 0.78 : 0.82
                const stroke   = isVein ? 'rgba(140,195,240,1)' : isBone ? 'rgba(228,234,255,1)' : color
                const sw       = isBone ? 0.5 : isVein ? 0.32 : 0.42
                const glowF    = isActive
                  ? (isVein
                      ? 'drop-shadow(0 0 1.5px rgba(140,195,240,0.9))'
                      : isBone
                      ? 'drop-shadow(0 0 2px rgba(255,255,255,0.75))'
                      : `drop-shadow(0 0 1.5px ${color})`)
                  : undefined
                return (
                  <path
                    key={`def-${group}-${i}`}
                    d={line.d}
                    stroke={stroke}
                    strokeWidth={isActive ? sw * 1.7 : sw}
                    fill="none"
                    strokeLinecap="round"
                    opacity={isActive ? activeOp : baseOp}
                    filter={glowF}
                    style={{ transition: 'opacity 0.3s, stroke-width 0.3s' }}
                  />
                )
              })
            })}

            {labels.map(l => {
              const isActive  = selected === l.group
              const dbKey     = GROUP_TO_DB[l.group]
              const color     = isActive ? (DB[dbKey]?.color || '#d8e0ee') : 'rgba(200,210,230,0.30)'
              const lineX1    = l.anchor === 'start' ? 101 : -1
              const dotX      = l.ex

              return (
                <g key={l.group} style={{ transition: 'opacity 0.2s' }}>
                  {/* Leader line */}
                  <line
                    x1={lineX1} y1={l.y}
                    x2={dotX}   y2={l.y}
                    stroke={color}
                    strokeWidth={isActive ? 0.5 : 0.3}
                    strokeDasharray={isActive ? 'none' : '2 2'}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                  {/* Endpoint dot on muscle */}
                  <circle cx={dotX} cy={l.y} r={isActive ? 1.4 : 0.8}
                    fill={color}
                    style={{ transition: 'fill 0.2s, r 0.2s' }}
                  />
                  {/* Label text — common name */}
                  <text
                    x={l.x} y={l.y}
                    textAnchor={l.anchor}
                    fontSize="4.2"
                    fontFamily={FF}
                    fontWeight={isActive ? '700' : '500'}
                    fill={color}
                    filter={isActive ? 'url(#mm-label-glow)' : undefined}
                    letterSpacing="0.04em"
                    style={{
                      transition: 'fill 0.2s',
                      animation: isActive ? 'mmGlow 2.4s ease-in-out infinite' : undefined,
                    }}
                  >
                    {l.group}
                  </text>
                  {/* Scientific name sub-label */}
                  <text
                    x={l.x} y={l.y + 4.2}
                    textAnchor={l.anchor}
                    fontSize="3.0"
                    fontFamily={FF}
                    fontWeight="400"
                    fontStyle="italic"
                    fill={isActive ? `${color}cc` : 'rgba(200,210,230,0.18)'}
                    letterSpacing="0.02em"
                    style={{ transition: 'fill 0.2s' }}
                  >
                    {SCI_SHORT[l.group] || ''}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Detail panel */}
      {!selected ? (
        <div style={{
          background: 'var(--stat-bg)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 18px',
        }}>
          <p style={{ color: 'var(--text-faint)', fontSize: 13, fontFamily: FF, fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            Tap a muscle group to see your stats
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'mmFadeUp 0.22s ease both' }}>

          {/* Workout stats strip */}
          <div style={{
            background: 'var(--stat-bg)',
            border: `1px solid ${n > 0 && dbData ? dbData.color + '40' : 'var(--border)'}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          }}>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Sessions / 7d</p>
              <p style={{ color: n > 0 && dbData ? dbData.color : 'var(--text-muted)', fontSize: 22, fontWeight: 900, fontFamily: FF, margin: 0, lineHeight: 1 }}>{n}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Last Trained</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, margin: '3px 0 0' }}>{fmtDate(lastWorked[selected], todayStr)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Status</p>
              {rec && <p style={{ color: rec.color, fontSize: 11, fontFamily: FF, margin: '3px 0 0' }}>{rec.status}</p>}
            </div>
          </div>

          {/* Muscle info */}
          {dbData && (
            <div style={{
              background: 'var(--bg-card)', border: `1px solid ${dbData.color}30`,
              borderRadius: 12, padding: '13px 15px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dbData.color, boxShadow: `0 0 8px ${dbData.color}` }}/>
                <p style={{ color: dbData.color, fontSize: 14, fontWeight: 800, fontFamily: FF, margin: 0 }}>{selected}</p>
              </div>
              <p style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, letterSpacing: '0.06em', fontStyle: 'italic', margin: '0 0 8px' }}>
                {dbData.scientific}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                <span style={{ color: 'var(--text-faint)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: FF }}>Intensity</span>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i <= dbData.intensity ? dbData.color : 'rgba(212,212,232,0.08)',
                    boxShadow: i <= dbData.intensity ? `0 0 5px ${dbData.color}88` : 'none',
                  }}/>
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, lineHeight: 1.65, margin: 0 }}>{dbData.desc}</p>
            </div>
          )}

          {/* Exercises */}
          {dbData && exercises.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 3, height: 12, background: dbData.color, borderRadius: 2, boxShadow: `0 0 6px ${dbData.color}` }}/>
                <p style={{ color: dbData.color, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: FF, fontWeight: 700, flex: 1, margin: 0 }}>
                  Exercises
                </p>
                <button onClick={handleShuffle} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px', borderRadius: 7,
                  background: `${dbData.color}18`, border: `1px solid ${dbData.color}44`,
                  color: dbData.color, fontSize: 9, fontWeight: 700,
                  fontFamily: FF, cursor: 'pointer', letterSpacing: '0.08em',
                }}>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.46s ease' }}>
                    <polyline points="1 4 1 10 7 10"/>
                    <polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  Shuffle
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exercises.map((ex, i) => <ExCard key={`${ex.name}-${i}`} ex={ex} accent={dbData.color} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Muscle pill row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {MUSCLES.map(m => {
          const c     = counts[m] || 0
          const isSel = selected === m
          const color = DB[GROUP_TO_DB[m]]?.color || '#b4bccc'
          return (
            <button key={m} onClick={() => setSelected(s => s === m ? null : m)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
              background: isSel ? `${color}22` : 'var(--bg-card)',
              border: `1px solid ${isSel ? color + '66' : c > 0 ? color + '33' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: c > 0 ? color : 'rgba(140,155,175,0.25)',
                boxShadow: isSel ? `0 0 6px ${color}` : 'none',
              }}/>
              <span style={{ color: isSel ? color : c > 0 ? 'var(--text-secondary)' : 'var(--text-faint)', fontSize: 10, fontFamily: FF, fontWeight: isSel ? 700 : 400 }}>{m}</span>
              {c > 0 && <span style={{ color, fontSize: 9, fontFamily: FF, fontWeight: 700 }}>{c}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
