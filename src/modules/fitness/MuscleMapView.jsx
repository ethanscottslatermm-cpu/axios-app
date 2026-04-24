import { useState, useMemo } from 'react'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MUSCLES = ['Chest','Shoulders','Biceps','Triceps','Core','Back','Quads','Hamstrings','Glutes','Calves']

function heatStyle(count, selected) {
  if (selected) return { fill: 'rgba(220,220,250,0.28)', stroke: 'rgba(240,240,255,0.92)', sw: 1.8 }
  if (count === 0) return { fill: 'rgba(220,220,240,0.05)', stroke: 'rgba(220,220,240,0.22)', sw: 0.8 }
  if (count === 1) return { fill: 'rgba(220,79,58,0.22)', stroke: 'rgba(220,79,58,0.58)', sw: 1.0 }
  if (count === 2) return { fill: 'rgba(220,79,58,0.50)', stroke: 'rgba(235,95,70,0.85)', sw: 1.2 }
  return            { fill: 'rgba(220,79,58,0.84)', stroke: 'rgba(255,110,85,1.0)',  sw: 1.5 }
}

function fmtDate(ds, todayStr) {
  if (!ds) return 'Never'
  const diff = Math.round((new Date(todayStr + 'T12:00:00') - new Date(ds + 'T12:00:00')) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  return new Date(ds + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function MuscleMapView({ workouts = [] }) {
  const [selected, setSelected] = useState(null)
  const todayStr   = new Date().toISOString().split('T')[0]
  const sevenAgo   = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const sevenStr   = sevenAgo.toISOString().split('T')[0]

  const counts = useMemo(() => {
    const c = {}; MUSCLES.forEach(m => { c[m] = 0 })
    const seen = new Set()
    workouts.forEach(w => {
      if (!w.workout_date || w.workout_date < sevenStr || w.workout_date > todayStr) return
      ;(w.exercises || []).forEach(ex => {
        const mg = ex.muscle_group
        if (!mg) return
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

  function toggle(m) { setSelected(s => s === m ? null : m) }

  // Renders a group of paths as one clickable muscle region
  function Region({ muscle, paths, title }) {
    const hs  = heatStyle(counts[muscle] || 0, selected === muscle)
    const gid = counts[muscle] >= 3 ? 'url(#hot-glow)' : counts[muscle] >= 2 ? 'url(#warm-glow)' : undefined
    return (
      <g onClick={() => toggle(muscle)} style={{ cursor: 'pointer' }} filter={gid}>
        {paths.map((d, i) => (
          <path key={i} d={d}
            fill={hs.fill} stroke={hs.stroke} strokeWidth={hs.sw}
            strokeLinejoin="round"
            style={{ transition: 'fill 0.25s, stroke 0.25s' }}
          />
        ))}
        {title && selected === muscle && (
          <text x={title.x} y={title.y} textAnchor="middle"
            fontSize="7.5" fontFamily={FF} fontWeight="700" fill="rgba(245,245,255,0.9)"
            style={{ pointerEvents: 'none' }}>{muscle}</text>
        )}
      </g>
    )
  }

  const sel = selected ? { count: counts[selected] || 0, last: lastWorked[selected] } : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Heat legend */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        {[['Cold', 'rgba(220,220,240,0.22)'],['×1','rgba(220,79,58,0.50)'],['×2','rgba(220,79,58,0.75)'],['×3+','rgba(255,100,75,1)']].map(([lbl, clr]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: clr, flexShrink: 0 }}/>
            <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* SVG Body */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 200 372" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', maxWidth: 210, height: 'auto', overflow: 'visible', display: 'block' }}>
          <defs>
            <filter id="hot-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="g"/>
              <feFlood floodColor="rgba(220,79,58,0.7)" result="c"/>
              <feComposite in="c" in2="g" operator="in" result="cg"/>
              <feMerge><feMergeNode in="cg"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="warm-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="g"/>
              <feFlood floodColor="rgba(220,79,58,0.45)" result="c"/>
              <feComposite in="c" in2="g" operator="in" result="cg"/>
              <feMerge><feMergeNode in="cg"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Body silhouette (non-interactive outline) ── */}
          <g fill="none" stroke="rgba(220,220,240,0.12)" strokeWidth="0.8" strokeLinejoin="round">
            {/* Head */}
            <ellipse cx="100" cy="24" rx="17" ry="21" fill="rgba(220,220,240,0.06)" stroke="rgba(220,220,240,0.20)" strokeWidth="0.8"/>
            {/* Neck */}
            <path d="M93,43 Q100,40 107,43 L109,58 Q100,61 91,58 Z" fill="rgba(220,220,240,0.05)"/>
            {/* Forearms (non-interactive) */}
            <path d="M38,144 C33,159 34,179 39,195 C43,201 51,202 57,198 C62,193 63,179 62,163 C61,148 56,140 50,140 Z" fill="rgba(220,220,240,0.04)"/>
            <path d="M162,144 C167,159 166,179 161,195 C157,201 149,202 143,198 C138,193 137,179 138,163 C139,148 144,140 150,140 Z" fill="rgba(220,220,240,0.04)"/>
            {/* Pelvis connector */}
            <path d="M67,165 C62,171 60,180 62,189 L138,189 C140,180 138,171 133,165 Z" fill="rgba(220,220,240,0.04)"/>
            {/* Knees */}
            <ellipse cx="80" cy="270" rx="14" ry="9" fill="rgba(220,220,240,0.04)"/>
            <ellipse cx="120" cy="270" rx="14" ry="9" fill="rgba(220,220,240,0.04)"/>
            {/* Feet */}
            <ellipse cx="77" cy="347" rx="14" ry="7" fill="rgba(220,220,240,0.04)"/>
            <ellipse cx="123" cy="347" rx="14" ry="7" fill="rgba(220,220,240,0.04)"/>
          </g>

          {/* ── SHOULDERS (traps + left/right delts) ── */}
          <Region muscle="Shoulders" title={{ x: 100, y: 70 }} paths={[
            // Trapezius connector
            'M92,44 Q79,51 64,67 L69,72 Q82,59 100,56 Q118,59 131,72 L136,67 Q121,51 108,44 Z',
            // Left deltoid
            'M55,65 C47,70 43,80 46,92 C49,99 57,101 64,97 C69,93 70,84 68,76 C66,69 61,63 55,65 Z',
            // Right deltoid
            'M145,65 C153,70 157,80 154,92 C151,99 143,101 136,97 C131,93 130,84 132,76 C134,69 139,63 145,65 Z',
          ]}/>

          {/* ── CHEST ── */}
          <Region muscle="Chest" title={{ x: 100, y: 92 }} paths={[
            'M68,69 C64,78 63,93 66,104 C73,112 88,115 100,112 L100,67 C88,64 76,65 68,69 Z',
            'M132,69 C136,78 137,93 134,104 C127,112 112,115 100,112 L100,67 C112,64 124,65 132,69 Z',
          ]}/>

          {/* ── BICEPS ── */}
          <Region muscle="Biceps" title={{ x: 46, y: 118 }} paths={[
            'M43,94 C37,106 35,124 38,142 C41,150 50,153 57,149 C63,145 65,133 63,116 C62,102 57,89 51,87 Z',
            'M157,94 C163,106 165,124 162,142 C159,150 150,153 143,149 C137,145 135,133 137,116 C138,102 143,89 149,87 Z',
          ]}/>

          {/* ── TRICEPS (outer strip of upper arm visible from front) ── */}
          <Region muscle="Triceps" title={{ x: 40, y: 115 }} paths={[
            'M41,94 C35,109 34,128 38,144 C36,149 38,154 42,152 C46,150 47,138 46,120 C45,105 43,94 41,94 Z',
            'M159,94 C165,109 166,128 162,144 C164,149 162,154 158,152 C154,150 153,138 154,120 C155,105 157,94 159,94 Z',
          ]}/>

          {/* ── BACK (lats visible as flanks) ── */}
          <Region muscle="Back" title={{ x: 60, y: 138 }} paths={[
            'M63,97 C56,114 55,134 57,157 C58,164 61,172 64,178 L69,114 Z',
            'M137,97 C144,114 145,134 143,157 C142,164 139,172 136,178 L131,114 Z',
          ]}/>

          {/* ── CORE (abs + obliques) ── */}
          <Region muscle="Core" title={{ x: 100, y: 140 }} paths={[
            // Central abs
            'M70,114 C66,130 65,148 67,166 L133,166 C135,148 134,130 130,114 Z',
            // Left oblique
            'M62,112 L70,114 L67,166 L58,170 C54,152 54,130 62,112 Z',
            // Right oblique
            'M138,112 L130,114 L133,166 L142,170 C146,152 146,130 138,112 Z',
          ]}/>

          {/* ── GLUTES (small side hints from front) ── */}
          <Region muscle="Glutes" title={{ x: 68, y: 200 }} paths={[
            'M62,181 C56,189 54,201 57,211 C61,218 70,220 77,217 L79,184 Z',
            'M138,181 C144,189 146,201 143,211 C139,218 130,220 123,217 L121,184 Z',
          ]}/>

          {/* ── QUADS ── */}
          <Region muscle="Quads" title={{ x: 80, y: 228 }} paths={[
            'M62,191 C55,210 54,238 59,263 C63,275 74,279 85,275 C94,271 98,260 98,247 C98,224 96,203 93,191 Z',
            'M138,191 C145,210 146,238 141,263 C137,275 126,279 115,275 C106,271 102,260 102,247 C102,224 104,203 107,191 Z',
          ]}/>

          {/* ── HAMSTRINGS (inner thigh, partially visible from front) ── */}
          <Region muscle="Hamstrings" title={{ x: 64, y: 228 }} paths={[
            'M63,191 C57,212 56,240 60,264 L65,263 C61,240 62,212 68,194 Z',
            'M137,191 C143,212 144,240 140,264 L135,263 C139,240 138,212 132,194 Z',
          ]}/>

          {/* ── CALVES ── */}
          <Region muscle="Calves" title={{ x: 80, y: 305 }} paths={[
            'M64,280 C58,298 60,319 67,333 C71,340 81,341 89,335 C95,330 96,315 95,299 C94,282 88,273 82,272 Z',
            'M136,280 C142,298 140,319 133,333 C129,340 119,341 111,335 C105,330 104,315 105,299 C106,282 112,273 118,272 Z',
          ]}/>

        </svg>
      </div>

      {/* Info panel */}
      <div style={{
        background: 'var(--stat-bg)',
        border: `1px solid ${sel && sel.count > 0 ? 'rgba(220,79,58,0.30)' : 'var(--border)'}`,
        borderRadius: 12, padding: '14px 16px', minHeight: 58,
        transition: 'border-color 0.25s',
      }}>
        {!sel ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 12, fontFamily: FF, fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
            Tap a muscle group to see your stats
          </p>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: FF, margin: 0 }}>{selected}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: FF, margin: '3px 0 0' }}>
                Last trained: <span style={{ color: 'var(--text-secondary)' }}>{fmtDate(lastWorked[selected], todayStr)}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{
                color: sel.count >= 3 ? 'rgba(255,100,75,0.95)' : sel.count > 0 ? 'rgba(220,79,58,0.85)' : 'var(--text-faint)',
                fontSize: 28, fontWeight: 900, fontFamily: FF, margin: 0, lineHeight: 1,
              }}>{sel.count}</p>
              <p style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, margin: '2px 0 0', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                sessions / 7d
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Muscle pill grid */}
      <div>
        <p style={{ color: 'var(--text-faint)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: FF, margin: '0 0 8px' }}>
          7-Day Activity
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MUSCLES.map(m => {
            const c = counts[m] || 0
            const isSel = selected === m
            return (
              <button key={m} onClick={() => toggle(m)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 99, cursor: 'pointer',
                background: isSel ? 'rgba(220,79,58,0.12)' : 'var(--bg-card)',
                border: `1px solid ${c > 0 ? `rgba(220,79,58,${Math.min(0.22 + c * 0.18, 0.72)})` : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: c > 0 ? `rgba(220,79,58,${Math.min(0.45 + c * 0.18, 1)})` : 'rgba(220,220,240,0.15)',
                }}/>
                <span style={{ color: c > 0 ? 'var(--text-secondary)' : 'var(--text-faint)', fontSize: 10, fontFamily: FF }}>{m}</span>
                {c > 0 && (
                  <span style={{ color: 'rgba(220,79,58,0.85)', fontSize: 9, fontFamily: FF, fontWeight: 700 }}>{c}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
