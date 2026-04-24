import { useState, useMemo, useEffect } from 'react'
import Model from 'react-body-highlighter'
import { DB } from './WorkoutGuide'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MUSCLES = ['Chest','Shoulders','Biceps','Triceps','Core','Back','Quads','Hamstrings','Glutes','Calves']

const SLUG_MAP = {
  Chest:      ['chest'],
  Shoulders:  ['front-deltoids', 'back-deltoids'],
  Biceps:     ['biceps', 'forearm'],
  Triceps:    ['triceps'],
  Core:       ['abs', 'obliques'],
  Back:       ['trapezius', 'upper-back', 'lower-back'],
  Quads:      ['quadriceps'],
  Hamstrings: ['hamstring'],
  Glutes:     ['gluteal'],
  Calves:     ['calves', 'left-soleus', 'right-soleus'],
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
  trapezius:       'Back',
  'upper-back':    'Back',
  'lower-back':    'Back',
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
  Chest:      'chest',
  Shoulders:  'shoulders',
  Biceps:     'biceps',
  Triceps:    'triceps',
  Core:       'core',
  Back:       'lats',
  Quads:      'quads',
  Hamstrings: 'hamstrings',
  Glutes:     'glutes',
  Calves:     'calves',
}

// Labels positioned in the model's 0 0 100 200 coordinate space.
// x < 0 or x > 100 renders outside body (requires overflow:visible on parent).
// ex = x-coordinate of the leader line's body-side endpoint.
const LABELS = {
  anterior: [
    { group: 'Shoulders', x: 103, y: 43,  anchor: 'start', ex: 79 },
    { group: 'Chest',     x: 103, y: 51,  anchor: 'start', ex: 70 },
    { group: 'Biceps',    x: -3,  y: 61,  anchor: 'end',   ex: 17 },
    { group: 'Core',      x: 103, y: 83,  anchor: 'start', ex: 59 },
    { group: 'Quads',     x: -3,  y: 118, anchor: 'end',   ex: 29 },
    { group: 'Calves',    x: 103, y: 175, anchor: 'start', ex: 74 },
  ],
  posterior: [
    { group: 'Shoulders', x: -3,  y: 44,  anchor: 'end',   ex: 29 },
    { group: 'Back',      x: 103, y: 57,  anchor: 'start', ex: 66 },
    { group: 'Triceps',   x: -3,  y: 65,  anchor: 'end',   ex: 27 },
    { group: 'Glutes',    x: 103, y: 111, anchor: 'start', ex: 69 },
    { group: 'Hamstrings',x: -3,  y: 140, anchor: 'end',   ex: 29 },
    { group: 'Calves',    x: 103, y: 178, anchor: 'start', ex: 71 },
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

  // Include selected muscle at full brightness so it always lights up on tap
  const modelData = useMemo(() => {
    const entries = MUSCLES
      .filter(m => (counts[m] || 0) > 0)
      .map(m => ({ name: m, muscles: SLUG_MAP[m], frequency: Math.min(counts[m], 3) }))

    if (selected && !entries.find(e => e.name === selected)) {
      entries.push({ name: selected, muscles: SLUG_MAP[selected], frequency: 3 })
    }
    return entries
  }, [counts, selected])

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
        .mm-label-glow { filter: drop-shadow(0 0 3px currentColor) }
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

      {/* Activity legend */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: FF }}>Activity</span>
        {[['Cold','rgba(155,168,188,0.35)'],['×1','#7a8fa8'],['×2','#a8b8cc'],['×3+','#d8e0ee']].map(([l, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 12, height: 10, borderRadius: 2, background: c }}/>
            <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Body model + label overlay */}
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 240, overflow: 'visible' }}>
          <Model
            data={modelData}
            type={view}
            highlightedColors={['#7a8fa8', '#a8b8cc', '#d8e0ee']}
            bodyColor="#0c0c12"
            onClick={handleClick}
            style={{ width: '100%', display: 'block' }}
            svgStyle={{ borderRadius: 8, overflow: 'visible' }}
          />

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
                  {/* Label text */}
                  <text
                    x={l.x} y={l.y + 1.5}
                    textAnchor={l.anchor}
                    fontSize="4.8"
                    fontFamily={FF}
                    fontWeight={isActive ? '700' : '400'}
                    fill={color}
                    filter={isActive ? 'url(#mm-label-glow)' : undefined}
                    letterSpacing="0.04em"
                    style={{
                      transition: 'fill 0.2s, font-weight 0.2s',
                      animation: isActive ? 'mmGlow 2.4s ease-in-out infinite' : undefined,
                    }}
                  >
                    {l.group}
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
            border: `1px solid ${n > 0 ? 'rgba(180,188,220,0.32)' : 'var(--border)'}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          }}>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Sessions / 7d</p>
              <p style={{ color: n > 0 ? heat.hex : 'var(--text-muted)', fontSize: 22, fontWeight: 900, fontFamily: FF, margin: 0, lineHeight: 1 }}>{n}</p>
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
          const c = counts[m] || 0; const isSel = selected === m
          return (
            <button key={m} onClick={() => setSelected(s => s === m ? null : m)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
              background: isSel ? 'rgba(180,188,220,0.12)' : 'var(--bg-card)',
              border: `1px solid ${c > 0 ? `rgba(180,188,220,${Math.min(0.22 + c * 0.18, 0.65)})` : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: c > 0 ? getHeat(c).hex : 'rgba(140,155,175,0.25)' }}/>
              <span style={{ color: c > 0 ? 'var(--text-secondary)' : 'var(--text-faint)', fontSize: 10, fontFamily: FF }}>{m}</span>
              {c > 0 && <span style={{ color: getHeat(c).hex, fontSize: 9, fontFamily: FF, fontWeight: 700 }}>{c}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
