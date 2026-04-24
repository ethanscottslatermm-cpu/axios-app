import { useState, useMemo } from 'react'

const FF = 'Helvetica Neue,Arial,sans-serif'
const MUSCLES = ['Chest','Shoulders','Biceps','Triceps','Core','Back','Quads','Hamstrings','Glutes','Calves']

const EXERCISES_MAP = {
  Chest:      'Bench Press, Push-ups, Flyes',
  Shoulders:  'Overhead Press, Lateral Raises',
  Biceps:     'Curls, Hammer Curls, Chin-ups',
  Triceps:    'Dips, Pushdowns, Close-Grip Press',
  Core:       'Planks, Crunches, Leg Raises',
  Back:       'Pull-ups, Rows, Deadlifts',
  Quads:      'Squats, Leg Press, Lunges',
  Hamstrings: 'Romanian DL, Leg Curls',
  Glutes:     'Hip Thrusts, Glute Bridges',
  Calves:     'Calf Raises, Jump Rope',
}

function getHeat(n) {
  if (n === 0) return { fill:'rgba(140,155,175,0.05)', stroke:'rgba(155,168,188,0.38)', label:'Cold',  hex:'#3a3f48' }
  if (n === 1) return { fill:'rgba(160,48,32,0.30)',  stroke:'rgba(195,72,48,0.72)',   label:'×1',    hex:'#a03020' }
  if (n === 2) return { fill:'rgba(215,58,40,0.60)',  stroke:'rgba(235,82,55,0.92)',   label:'×2',    hex:'#d73a28' }
  return             { fill:'rgba(255,100,55,0.86)',  stroke:'rgba(255,135,85,1.00)',  label:'×3+',   hex:'#ff6437' }
}

function getRecovery(n) {
  const data = [
    { pct:100, status:'Ready',    color:'#3cb371' },
    { pct: 84, status:'Ready',    color:'#80c060' },
    { pct: 68, status:'Active',   color:'#e8a030' },
    { pct: 45, status:'Fatigued', color:'#d73a28' },
  ]
  return data[Math.min(n, 3)]
}

function fmtDate(ds, todayStr) {
  if (!ds) return 'Never'
  const diff = Math.round((new Date(todayStr + 'T12:00:00') - new Date(ds + 'T12:00:00')) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  return new Date(ds + 'T12:00:00').toLocaleDateString([], { month:'short', day:'numeric' })
}

export default function MuscleMapView({ workouts = [] }) {
  const [selected, setSelected] = useState(null)
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

  function toggle(m) { setSelected(s => s === m ? null : m) }

  // Returns props for a muscle's fill path
  function fp(muscle) {
    const n   = counts[muscle] || 0
    const sel = selected === muscle
    const h   = getHeat(n)
    return {
      fill:        sel ? 'rgba(255,108,60,0.90)' : h.fill,
      stroke:      sel ? 'rgba(255,150,100,1)'   : h.stroke,
      strokeWidth: sel ? 2.0 : (n > 0 ? 1.3 : 0.9),
      filter:      (sel || n >= 2) ? 'url(#hot)' : n === 1 ? 'url(#warm)' : 'none',
      cursor:      'pointer',
      onClick:     () => toggle(muscle),
      style:       { transition: 'fill 0.25s, stroke 0.25s' },
    }
  }

  // Wireframe overlay props (non-interactive fiber lines)
  const wf = { fill:'none', stroke:'rgba(165,178,198,0.30)', strokeWidth:0.6, strokeLinecap:'round', pointerEvents:'none' }
  const wfBright = { fill:'none', stroke:'rgba(165,178,198,0.55)', strokeWidth:0.7, strokeLinecap:'round', pointerEvents:'none' }

  const sel = selected ? {
    n:    counts[selected] || 0,
    last: lastWorked[selected],
    heat: getHeat(counts[selected] || 0),
    rec:  getRecovery(counts[selected] || 0),
  } : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <style>{`
        .mm-muscle { cursor:pointer; }
        .mm-muscle:hover > path:first-child { filter:brightness(1.3) !important; }
      `}</style>

      {/* Heat legend */}
      <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:'rgba(140,155,175,0.6)', fontSize:10, fontFamily:FF }}>Legend</span>
        {[['Cold','rgba(155,168,188,0.40)'],['×1','rgba(180,55,38,0.85)'],['×2','rgba(215,58,40,1)'],['×3+','rgba(255,100,55,1)']].map(([l,c]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:14, height:10, borderRadius:2, background:c }}/>
            <span style={{ color:'rgba(200,210,228,0.55)', fontSize:9, fontFamily:FF }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Body SVG */}
      <div style={{ display:'flex', justifyContent:'center' }}>
        <svg viewBox="0 0 200 432" xmlns="http://www.w3.org/2000/svg"
          style={{ width:'100%', maxWidth:230, height:'auto', overflow:'visible', display:'block' }}>
          <defs>
            <filter id="hot" x="-55%" y="-55%" width="210%" height="210%">
              <feGaussianBlur stdDeviation="4.5" in="SourceGraphic" result="blur"/>
              <feFlood floodColor="#ff5020" floodOpacity="0.75" result="col"/>
              <feComposite in="col" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="warm" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" in="SourceGraphic" result="blur"/>
              <feFlood floodColor="#c03020" floodOpacity="0.5" result="col"/>
              <feComposite in="col" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Base anatomy lines (non-interactive) ── */}
          <g fill="none" stroke="rgba(155,168,190,0.16)" strokeWidth="0.7" strokeLinecap="round">
            <line x1="100" y1="62" x2="100" y2="212"/>
            <path d="M100,64 Q118,59 134,68"/>
            <path d="M100,64 Q82,59 66,68"/>
            <path d="M82,118 Q74,132 74,148 Q78,160 100,164 Q122,160 126,148 Q126,132 118,118"/>
            <path d="M72,190 Q65,198 66,212 Q80,218 100,218 Q120,218 134,212 Q135,198 128,190"/>
          </g>

          {/* ── HEAD (non-interactive) ── */}
          <ellipse cx="100" cy="22" rx="18" ry="21" fill="rgba(155,165,185,0.08)" stroke="rgba(155,168,190,0.28)" strokeWidth="0.8"/>
          <path d="M88,39 Q94,44 100,45 Q106,44 112,39" {...wf}/>
          <path d="M90,20 Q100,14 110,20" {...wf}/>

          {/* ── NECK (non-interactive) ── */}
          <path d="M92,41 C94,36 106,36 108,41 L110,60 C107,65 100,66 93,64 L90,60 Z"
            fill="rgba(150,160,180,0.07)" stroke="rgba(150,164,184,0.26)" strokeWidth="0.8"/>

          {/* ── TRAPEZIUS – part of Shoulders ── */}
          <g className="mm-muscle" onClick={() => toggle('Shoulders')}>
            <path d="M110,39 Q124,50 138,64 L133,69 Q118,54 108,44 Z" {...fp('Shoulders')}/>
            <path d="M90,39 Q76,50 62,64 L67,69 Q82,54 92,44 Z" {...fp('Shoulders')}/>
            <path d="M110,39 Q122,49 132,62" {...wf}/>
            <path d="M90,39 Q78,49 68,62" {...wf}/>
          </g>

          {/* ── LEFT DELTOID – Shoulders ── */}
          <g className="mm-muscle" onClick={() => toggle('Shoulders')}>
            <path d="M133,65 C146,61 160,68 164,84 C168,99 160,113 149,115 C141,117 134,110 132,98 C130,86 130,70 133,65 Z" {...fp('Shoulders')}/>
            {/* fiber lines */}
            <path d="M148,72 C156,78 160,88 158,100" {...wf}/>
            <path d="M140,68 C148,72 152,83 150,95" {...wf}/>
          </g>

          {/* ── RIGHT DELTOID – Shoulders ── */}
          <g className="mm-muscle" onClick={() => toggle('Shoulders')}>
            <path d="M67,65 C54,61 40,68 36,84 C32,99 40,113 51,115 C59,117 66,110 68,98 C70,86 70,70 67,65 Z" {...fp('Shoulders')}/>
            <path d="M52,72 C44,78 40,88 42,100" {...wf}/>
            <path d="M60,68 C52,72 48,83 50,95" {...wf}/>
          </g>

          {/* ── LEFT PECTORAL – Chest ── */}
          <g className="mm-muscle" onClick={() => toggle('Chest')}>
            <path d="M100,62 L133,70 C141,82 141,105 131,112 C122,118 110,117 103,114 C100,113 100,62 Z" {...fp('Chest')}/>
            {/* muscle striations */}
            <path d="M118,68 C128,76 131,90 128,104" {...wf}/>
            <path d="M108,64 C118,72 122,86 120,102" {...wf}/>
            <path d="M128,104 Q115,114 103,114" {...wf}/>
          </g>

          {/* ── RIGHT PECTORAL – Chest ── */}
          <g className="mm-muscle" onClick={() => toggle('Chest')}>
            <path d="M100,62 L67,70 C59,82 59,105 69,112 C78,118 90,117 97,114 C100,113 100,62 Z" {...fp('Chest')}/>
            <path d="M82,68 C72,76 69,90 72,104" {...wf}/>
            <path d="M92,64 C82,72 78,86 80,102" {...wf}/>
            <path d="M72,104 Q85,114 97,114" {...wf}/>
          </g>

          {/* ── LEFT BICEP ── */}
          <g className="mm-muscle" onClick={() => toggle('Biceps')}>
            <path d="M136,117 C150,119 161,132 162,151 C163,168 156,183 147,186 C139,188 133,182 131,166 C129,149 130,131 136,117 Z" {...fp('Biceps')}/>
            <path d="M148,124 C156,135 157,152 152,164" {...wf}/>
            <path d="M140,119 C148,130 150,147 146,160" {...wf}/>
          </g>

          {/* ── RIGHT BICEP ── */}
          <g className="mm-muscle" onClick={() => toggle('Biceps')}>
            <path d="M64,117 C50,119 39,132 38,151 C37,168 44,183 53,186 C61,188 67,182 69,166 C71,149 70,131 64,117 Z" {...fp('Biceps')}/>
            <path d="M52,124 C44,135 43,152 48,164" {...wf}/>
            <path d="M60,119 C52,130 50,147 54,160" {...wf}/>
          </g>

          {/* ── LEFT TRICEP (outer head visible from front) ── */}
          <g className="mm-muscle" onClick={() => toggle('Triceps')}>
            <path d="M134,118 C149,120 163,136 163,155 C163,170 157,180 151,182 C147,183 144,177 144,166 C144,151 141,130 134,118 Z" {...fp('Triceps')}/>
            <path d="M152,130 C160,142 160,158 156,170" {...wf}/>
          </g>

          {/* ── RIGHT TRICEP ── */}
          <g className="mm-muscle" onClick={() => toggle('Triceps')}>
            <path d="M66,118 C51,120 37,136 37,155 C37,170 43,180 49,182 C53,183 56,177 56,166 C56,151 59,130 66,118 Z" {...fp('Triceps')}/>
            <path d="M48,130 C40,142 40,158 44,170" {...wf}/>
          </g>

          {/* ── LEFT FOREARM ── */}
          <g className="mm-muscle" onClick={() => toggle('Biceps')}>
            <path d="M142,188 C155,192 164,207 164,228 C164,246 155,258 146,260 C138,261 131,255 130,239 C128,222 131,200 142,188 Z"
              fill={counts['Biceps'] > 0 || selected === 'Biceps' ? fp('Biceps').fill : 'rgba(140,155,175,0.04)'}
              stroke="rgba(155,168,190,0.30)" strokeWidth="0.9" cursor="pointer" onClick={() => toggle('Biceps')}
              style={{ transition:'fill 0.25s' }}/>
            <path d="M155,200 C160,212 160,228 155,240" {...wf}/>
            <path d="M148,192 C154,204 154,222 150,234" {...wf}/>
          </g>

          {/* ── RIGHT FOREARM ── */}
          <g className="mm-muscle" onClick={() => toggle('Biceps')}>
            <path d="M58,188 C45,192 36,207 36,228 C36,246 45,258 54,260 C62,261 69,255 70,239 C72,222 69,200 58,188 Z"
              fill={counts['Biceps'] > 0 || selected === 'Biceps' ? fp('Biceps').fill : 'rgba(140,155,175,0.04)'}
              stroke="rgba(155,168,190,0.30)" strokeWidth="0.9" cursor="pointer" onClick={() => toggle('Biceps')}
              style={{ transition:'fill 0.25s' }}/>
            <path d="M45,200 C40,212 40,228 45,240" {...wf}/>
            <path d="M52,192 C46,204 46,222 50,234" {...wf}/>
          </g>

          {/* ── LATS (Back, visible from front on sides) ── */}
          <g className="mm-muscle" onClick={() => toggle('Back')}>
            <path d="M129,114 C140,128 142,152 140,175 C138,186 131,192 127,191 L121,157 L130,118 Z" {...fp('Back')}/>
            <path d="M71,114 C60,128 58,152 60,175 C62,186 69,192 73,191 L79,157 L70,118 Z" {...fp('Back')}/>
            <path d="M136,120 C140,138 140,158 136,174" {...wf}/>
            <path d="M64,120 C60,138 60,158 64,174" {...wf}/>
          </g>

          {/* ── SERRATUS ANTERIOR (Back / Core) ── */}
          <g className="mm-muscle" onClick={() => toggle('Core')}>
            <path d="M124,118 L133,123 C135,132 132,142 128,150 L120,142 C122,134 124,126 124,118 Z" {...fp('Core')}/>
            <path d="M76,118 L67,123 C65,132 68,142 72,150 L80,142 C78,134 76,126 76,118 Z" {...fp('Core')}/>
          </g>

          {/* ── RECTUS ABDOMINIS / CORE ── */}
          <g className="mm-muscle" onClick={() => toggle('Core')}>
            <path d="M80,118 L120,118 C124,130 124,155 120,170 C116,181 84,181 80,170 C76,155 76,130 80,118 Z" {...fp('Core')}/>
            {/* Tendinous intersections (fiber lines) */}
            <line x1="82" y1="135" x2="118" y2="135" {...wfBright}/>
            <line x1="80" y1="152" x2="120" y2="152" {...wfBright}/>
            <line x1="80" y1="167" x2="120" y2="167" {...wfBright}/>
            <line x1="100" y1="118" x2="100" y2="179" {...wfBright}/>
          </g>

          {/* ── OBLIQUES / CORE ── */}
          <g className="mm-muscle" onClick={() => toggle('Core')}>
            <path d="M120,118 L134,125 C137,142 134,163 128,177 L118,183 C122,167 126,150 124,134 Z" {...fp('Core')}/>
            <path d="M80,118 L66,125 C63,142 66,163 72,177 L82,183 C78,167 74,150 76,134 Z" {...fp('Core')}/>
            <path d="M130,128 C133,144 130,162 126,174" {...wf}/>
            <path d="M70,128 C67,144 70,162 74,174" {...wf}/>
          </g>

          {/* ── HIP / PELVIS (non-interactive connector) ── */}
          <path d="M68,190 Q65,200 66,212 L134,212 Q135,200 132,190 C120,186 80,186 68,190 Z"
            fill="rgba(150,160,180,0.05)" stroke="rgba(155,168,190,0.18)" strokeWidth="0.7"/>

          {/* ── GLUTES (small front hint) ── */}
          <g className="mm-muscle" onClick={() => toggle('Glutes')}>
            <path d="M126,192 C140,200 144,218 137,228 C131,234 122,233 118,228 L116,194 Z" {...fp('Glutes')}/>
            <path d="M74,192 C60,200 56,218 63,228 C69,234 78,233 82,228 L84,194 Z" {...fp('Glutes')}/>
          </g>

          {/* ── LEFT QUAD ── */}
          <g className="mm-muscle" onClick={() => toggle('Quads')}>
            <path d="M114,226 C130,244 134,276 131,306 C129,322 120,330 110,328 C100,324 98,312 99,296 C100,270 105,246 108,228 Z" {...fp('Quads')}/>
            {/* Vastus lateralis line */}
            <path d="M128,240 C132,264 130,292 126,308" {...wf}/>
            {/* Rectus femoris center line */}
            <path d="M120,228 C122,252 120,280 116,304" {...wf}/>
            {/* Vastus medialis teardrop */}
            <path d="M108,292 C116,298 118,314 112,322 C106,326 100,322 100,314 C100,305 104,296 108,292 Z" {...fp('Quads')} strokeWidth="0.8"/>
          </g>

          {/* ── RIGHT QUAD ── */}
          <g className="mm-muscle" onClick={() => toggle('Quads')}>
            <path d="M86,226 C70,244 66,276 69,306 C71,322 80,330 90,328 C100,324 102,312 101,296 C100,270 95,246 92,228 Z" {...fp('Quads')}/>
            <path d="M72,240 C68,264 70,292 74,308" {...wf}/>
            <path d="M80,228 C78,252 80,280 84,304" {...wf}/>
            <path d="M92,292 C84,298 82,314 88,322 C94,326 100,322 100,314 C100,305 96,296 92,292 Z" {...fp('Quads')} strokeWidth="0.8"/>
          </g>

          {/* ── LEFT HAMSTRING (inner glimpse from front) ── */}
          <g className="mm-muscle" onClick={() => toggle('Hamstrings')}>
            <path d="M112,226 C124,248 126,276 123,302 L117,300 C120,275 118,248 108,228 Z" {...fp('Hamstrings')}/>
          </g>

          {/* ── RIGHT HAMSTRING ── */}
          <g className="mm-muscle" onClick={() => toggle('Hamstrings')}>
            <path d="M88,226 C76,248 74,276 77,302 L83,300 C80,275 82,248 92,228 Z" {...fp('Hamstrings')}/>
          </g>

          {/* ── KNEES (non-interactive) ── */}
          <ellipse cx="110" cy="330" rx="12" ry="8" fill="rgba(150,160,180,0.05)" stroke="rgba(155,168,190,0.20)" strokeWidth="0.8"/>
          <ellipse cx="90" cy="330" rx="12" ry="8" fill="rgba(150,160,180,0.05)" stroke="rgba(155,168,190,0.20)" strokeWidth="0.8"/>

          {/* ── LEFT CALF ── */}
          <g className="mm-muscle" onClick={() => toggle('Calves')}>
            <path d="M111,338 C125,352 128,376 123,394 C119,406 110,412 102,408 C95,404 93,390 95,370 C97,350 103,339 111,338 Z" {...fp('Calves')}/>
            <path d="M122,352 C126,368 124,386 118,398" {...wf}/>
            <path d="M114,340 C118,356 118,374 114,390" {...wf}/>
          </g>

          {/* ── RIGHT CALF ── */}
          <g className="mm-muscle" onClick={() => toggle('Calves')}>
            <path d="M89,338 C75,352 72,376 77,394 C81,406 90,412 98,408 C105,404 107,390 105,370 C103,350 97,339 89,338 Z" {...fp('Calves')}/>
            <path d="M78,352 C74,368 76,386 82,398" {...wf}/>
            <path d="M86,340 C82,356 82,374 86,390" {...wf}/>
          </g>

          {/* ── TIBIALIS ANTERIOR (front shin, Calves group) ── */}
          <g className="mm-muscle" onClick={() => toggle('Calves')}>
            <path d="M110,338 C118,348 120,370 117,390 L112,388 C115,368 113,344 108,336 Z"
              fill={counts['Calves'] > 0 || selected === 'Calves' ? fp('Calves').fill : 'rgba(140,155,175,0.04)'}
              stroke="rgba(155,168,190,0.22)" strokeWidth="0.8" cursor="pointer" style={{ transition:'fill 0.25s' }}/>
            <path d="M92,338 C84,348 82,370 85,390 L90,388 C87,368 89,344 94,336 Z"
              fill={counts['Calves'] > 0 || selected === 'Calves' ? fp('Calves').fill : 'rgba(140,155,175,0.04)'}
              stroke="rgba(155,168,190,0.22)" strokeWidth="0.8" cursor="pointer" style={{ transition:'fill 0.25s' }}/>
          </g>

          {/* ── FEET (non-interactive) ── */}
          <path d="M102,410 C112,410 122,414 124,420 L104,424 L98,420 Z" fill="rgba(150,160,180,0.06)" stroke="rgba(155,168,190,0.18)" strokeWidth="0.7"/>
          <path d="M98,410 C88,410 78,414 76,420 L96,424 L102,420 Z" fill="rgba(150,160,180,0.06)" stroke="rgba(155,168,190,0.18)" strokeWidth="0.7"/>

          {/* ── Indicator dot on selected muscle ── */}
          {selected && (() => {
            const dotPos = {
              Chest:'102,88', Shoulders:'148,88', Biceps:'148,152', Triceps:'157,150',
              Core:'100,148', Back:'136,152', Quads:'118,270', Hamstrings:'122,264',
              Glutes:'130,212', Calves:'114,372',
            }
            const pos = dotPos[selected]
            if (!pos) return null
            const [cx, cy] = pos.split(',')
            return (
              <g pointerEvents="none">
                <circle cx={cx} cy={cy} r="4" fill="rgba(255,255,255,0.9)" filter="url(#hot)"/>
                <circle cx={cx} cy={cy} r="2" fill="white"/>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Stats card — matches the reference image panel */}
      <div style={{
        background: 'rgba(13,17,23,0.92)',
        border: `1px solid ${sel && sel.n > 0 ? 'rgba(215,58,40,0.45)' : 'rgba(88,130,180,0.18)'}`,
        borderRadius: 12,
        padding: '16px 18px',
        minHeight: 70,
        boxShadow: sel && sel.n > 0 ? '0 0 20px rgba(215,58,40,0.12)' : '0 4px 16px rgba(0,0,0,0.45)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
        {!sel ? (
          <p style={{ color:'rgba(140,155,175,0.55)', fontSize:13, fontFamily:FF, fontStyle:'italic', textAlign:'center', margin:0, letterSpacing:'0.02em' }}>
            Tap a muscle group to see your stats
          </p>
        ) : (
          <div>
            {/* Title row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <p style={{ color:'#e6edf3', fontSize:15, fontWeight:700, fontFamily:FF, margin:'0 0 2px', letterSpacing:'0.02em', textTransform:'uppercase' }}>
                  {selected}
                </p>
                <p style={{ color:sel.heat.hex, fontSize:10, fontFamily:FF, margin:0, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                  Activity {sel.heat.label}
                </p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ color:sel.n > 0 ? sel.heat.hex : 'rgba(140,155,175,0.4)', fontSize:26, fontWeight:900, fontFamily:FF, margin:0, lineHeight:1 }}>
                  {sel.n}
                </p>
                <p style={{ color:'rgba(140,155,175,0.5)', fontSize:8, fontFamily:FF, margin:'2px 0 0', letterSpacing:'0.16em', textTransform:'uppercase' }}>
                  SESSIONS / 7D
                </p>
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 12px' }}>
              {[
                ['Status', <span style={{ color:sel.rec.color }}>{sel.rec.pct}% — {sel.rec.status}</span>],
                ['Last Trained', fmtDate(sel.last, todayStr)],
                ['Primary Exercises', EXERCISES_MAP[selected] || '—', true],
              ].map(([label, val, wide]) => (
                <div key={label} style={wide ? { gridColumn:'1 / -1', marginTop:2 } : {}}>
                  <p style={{ color:'rgba(140,155,175,0.5)', fontSize:9, fontFamily:FF, margin:'0 0 2px', letterSpacing:'0.14em', textTransform:'uppercase' }}>{label}</p>
                  <p style={{ color:'#c9d1d9', fontSize:11, fontFamily:FF, margin:0, lineHeight:1.4 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Muscle pill row */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {MUSCLES.map(m => {
          const n = counts[m] || 0; const isSel = selected === m
          return (
            <button key={m} onClick={() => toggle(m)} style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'4px 10px', borderRadius:99, cursor:'pointer',
              background: isSel ? 'rgba(215,58,40,0.15)' : 'rgba(140,155,175,0.05)',
              border:`1px solid ${n > 0 ? `rgba(215,58,40,${Math.min(0.25 + n * 0.18, 0.70)})` : 'rgba(140,155,175,0.18)'}`,
              transition:'all 0.15s',
            }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background: n > 0 ? getHeat(n).hex : 'rgba(140,155,175,0.25)', flexShrink:0 }}/>
              <span style={{ color: n > 0 ? '#c9d1d9' : 'rgba(140,155,175,0.45)', fontSize:10, fontFamily:FF }}>{m}</span>
              {n > 0 && <span style={{ color:getHeat(n).hex, fontSize:9, fontFamily:FF, fontWeight:700 }}>{n}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
