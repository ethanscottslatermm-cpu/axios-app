import { useState, useMemo } from 'react'
import Model from 'react-body-highlighter'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MUSCLES = ['Chest','Shoulders','Biceps','Triceps','Core','Back','Quads','Hamstrings','Glutes','Calves']

// App muscle group → package muscle slugs
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

// Package slug → our group name (for onClick)
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

const EXERCISES_MAP = {
  Chest:      'Bench Press, Push-ups, Cable Flyes',
  Shoulders:  'Overhead Press, Lateral Raises, Face Pulls',
  Biceps:     'Barbell Curls, Hammer Curls, Chin-ups',
  Triceps:    'Dips, Pushdowns, Close-Grip Press',
  Core:       'Planks, Crunches, Hanging Leg Raises',
  Back:       'Pull-ups, Barbell Rows, Deadlifts',
  Quads:      'Squats, Leg Press, Walking Lunges',
  Hamstrings: 'Romanian DL, Leg Curls, Good Mornings',
  Glutes:     'Hip Thrusts, Glute Bridges, Bulgarian Split Squat',
  Calves:     'Standing Calf Raises, Seated Calf Raises',
}

function getHeat(n) {
  if (n === 0) return { label: 'Cold',  hex: 'rgba(140,155,175,0.4)' }
  if (n === 1) return { label: '×1',    hex: '#a03020' }
  if (n === 2) return { label: '×2',    hex: '#d73a28' }
  return             { label: '×3+',   hex: '#ff6437' }
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

export default function MuscleMapView({ workouts = [] }) {
  const [selected, setSelected] = useState(null)
  const [view, setView]         = useState('anterior')

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

  // Build data for the model — only include trained muscles (frequency drives color)
  const modelData = useMemo(() =>
    MUSCLES
      .filter(m => (counts[m] || 0) > 0)
      .map(m => ({
        name:      m,
        muscles:   SLUG_MAP[m],
        frequency: Math.min(counts[m], 3),
      }))
  , [counts])

  function handleClick({ muscle }) {
    const group = GROUP_FROM_SLUG[muscle]
    if (group) setSelected(s => s === group ? null : group)
  }

  const sel = selected
    ? { n: counts[selected] || 0, last: lastWorked[selected], heat: getHeat(counts[selected] || 0), rec: getRecovery(counts[selected] || 0) }
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Front / Back toggle */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[['anterior','Front View'], ['posterior','Back View']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '6px 18px', borderRadius: 99, cursor: 'pointer',
            background: view === v ? 'rgba(215,58,40,0.14)' : 'var(--bg-card)',
            border:    `1px solid ${view === v ? 'rgba(215,58,40,0.55)' : 'var(--border)'}`,
            color:      view === v ? '#ff6437' : 'var(--text-muted)',
            fontSize: 11, fontFamily: FF, fontWeight: view === v ? 700 : 400,
            letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Heat legend */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: FF }}>Legend</span>
        {[['Cold','rgba(155,168,188,0.35)'],['×1','#a03020'],['×2','#d73a28'],['×3+','#ff6437']].map(([l, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 12, height: 10, borderRadius: 2, background: c }}/>
            <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Body model */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Model
          data={modelData}
          type={view}
          highlightedColors={['#a03020', '#d73a28', '#ff6437']}
          bodyColor="#111118"
          onClick={handleClick}
          style={{ width: '100%', maxWidth: 240 }}
          svgStyle={{ borderRadius: 8, overflow: 'visible' }}
        />
      </div>

      {/* Stats card */}
      <div style={{
        background: 'var(--stat-bg)',
        border:     `1px solid ${sel && sel.n > 0 ? 'rgba(215,58,40,0.40)' : 'var(--border)'}`,
        borderRadius: 12, padding: '16px 18px', minHeight: 64,
        boxShadow: sel && sel.n > 0 ? '0 0 22px rgba(215,58,40,0.10)' : 'var(--card-shadow)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
        {!sel ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 13, fontFamily: FF, fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            Tap a muscle group to see your stats
          </p>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, fontFamily: FF, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{selected}</p>
                <p style={{ color: sel.heat.hex, fontSize: 10, fontFamily: FF, margin: 0, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Activity {sel.heat.label}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: sel.n > 0 ? sel.heat.hex : 'var(--text-faint)', fontSize: 26, fontWeight: 900, fontFamily: FF, margin: 0, lineHeight: 1 }}>{sel.n}</p>
                <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '2px 0 0', letterSpacing: '0.16em', textTransform: 'uppercase' }}>sessions / 7d</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
              <div>
                <p style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, margin: '0 0 2px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Status</p>
                <p style={{ color: sel.rec.color, fontSize: 11, fontFamily: FF, margin: 0 }}>{sel.rec.pct}% — {sel.rec.status}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, margin: '0 0 2px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Last Trained</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, margin: 0 }}>{fmtDate(sel.last, todayStr)}</p>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: 2 }}>
                <p style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, margin: '0 0 2px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Primary Exercises</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, margin: 0, lineHeight: 1.5 }}>{EXERCISES_MAP[selected] || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Muscle pill row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {MUSCLES.map(m => {
          const n = counts[m] || 0; const isSel = selected === m
          return (
            <button key={m} onClick={() => setSelected(s => s === m ? null : m)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
              background: isSel ? 'rgba(215,58,40,0.14)' : 'var(--bg-card)',
              border: `1px solid ${n > 0 ? `rgba(215,58,40,${Math.min(0.25 + n * 0.18, 0.70)})` : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: n > 0 ? getHeat(n).hex : 'rgba(140,155,175,0.25)' }}/>
              <span style={{ color: n > 0 ? 'var(--text-secondary)' : 'var(--text-faint)', fontSize: 10, fontFamily: FF }}>{m}</span>
              {n > 0 && <span style={{ color: getHeat(n).hex, fontSize: 9, fontFamily: FF, fontWeight: 700 }}>{n}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
