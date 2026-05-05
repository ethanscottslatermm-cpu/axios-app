import { useState, useCallback } from 'react'

const MUSCLE_DATA = {
  Head:         { latin:'Mind & Recovery',   color:'#4FC3F7', desc:'Mental focus, CNS recovery, and sleep quality directly drive physical performance and adaptation.', exercises:['Meditation','Box Breathing','Sleep Optimization'] },
  Chest:        { latin:'Pectoralis',         color:'#C9A96E', desc:'Primary horizontal pushing muscle central to all pressing movements and upper body power development.',   exercises:['Bench Press','Push-Up','Cable Fly'] },
  Shoulders:    { latin:'Deltoideus',         color:'#C9A96E', desc:'Three-headed complex enabling arm elevation and rotation across all planes of motion.',                   exercises:['Overhead Press','Lateral Raise','Face Pull'] },
  Biceps:       { latin:'Biceps Brachii',     color:'#00FF88', desc:'Primary elbow flexor and forearm supinator. Key driver of all pulling and curling movements.',            exercises:['Barbell Curl','Hammer Curl','Chin-Up'] },
  Core:         { latin:'Rectus Abdominis',   color:'#C9A96E', desc:'Central stabilizer connecting upper and lower body. Foundation of every functional movement pattern.',     exercises:['Plank','Cable Crunch','Hanging Leg Raise'] },
  Quads:        { latin:'Quadriceps Femoris', color:'#B87333', desc:'Four-headed anterior thigh muscle powering knee extension and explosive lower body force output.',         exercises:['Back Squat','Leg Press','Leg Extension'] },
  Calves:       { latin:'Gastrocnemius',      color:'#B87333', desc:'Ankle plantarflexor responsible for push-off power in running, jumping, and all dynamic movement.',       exercises:['Standing Calf Raise','Seated Calf Raise','Box Jump'] },
  Traps:        { latin:'Trapezius',          color:'#C9A96E', desc:'Diamond-shaped upper back muscle controlling scapular elevation, retraction, and rotation.',               exercises:['Barbell Shrug','Face Pull','Farmer Carry'] },
  Lats:         { latin:'Latissimus Dorsi',   color:'#00FF88', desc:'Largest back muscle driving shoulder extension and adduction. Core of V-taper and pulling strength.',     exercises:['Pull-Up','Lat Pulldown','Seated Cable Row'] },
  Triceps:      { latin:'Triceps Brachii',    color:'#00FF88', desc:'Three-headed elbow extensor comprising two-thirds of upper arm mass. Powers all pressing movements.',     exercises:['Tricep Dip','Close-Grip Bench','Skull Crusher'] },
  'Lower Back': { latin:'Erector Spinae',     color:'#C9A96E', desc:'Spinal erector column maintaining upright posture and generating powerful spinal extension force.',       exercises:['Deadlift','Good Morning','Back Extension'] },
  Glutes:       { latin:'Gluteus Maximus',    color:'#B87333', desc:'Largest muscle in the body. Primary hip extensor generating the most explosive athletic power.',          exercises:['Hip Thrust','Romanian Deadlift','Bulgarian Split Squat'] },
  Hamstrings:   { latin:'Biceps Femoris',     color:'#B87333', desc:'Posterior thigh muscles driving knee flexion and hip extension synergistically.',                         exercises:['Romanian Deadlift','Leg Curl','Nordic Curl'] },
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getFilter(color) {
  if (color === '#C9A96E') return 'url(#f-gold)'
  if (color === '#00FF88') return 'url(#f-green)'
  if (color === '#B87333') return 'url(#f-copper)'
  if (color === '#4FC3F7') return 'url(#f-blue)'
  return 'none'
}

function PanelPath({ d, muscleId, selected, onSelect, isActive }) {
  const data = MUSCLE_DATA[muscleId]
  const color = data ? data.color : '#C9A96E'
  const active = isActive || selected === muscleId
  return (
    <path
      d={d}
      fill={active ? hexToRgba(color, 0.30) : 'rgba(14,22,36,0.92)'}
      stroke={active ? color : '#1e3555'}
      strokeWidth={active ? 1.2 : 0.8}
      filter={active ? getFilter(color) : 'none'}
      style={{
        animation: active ? 'musclePulse 2s ease-in-out infinite' : 'none',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
      onPointerDown={e => { e.stopPropagation(); onSelect(muscleId) }}
    />
  )
}

function Label({ x, y, anchor, muscleName, latinName, cx, cy, selected }) {
  const data = MUSCLE_DATA[muscleName]
  const color = data ? data.color : '#C9A96E'
  const active = selected === muscleName
  const lineEndX = anchor === 'start' ? x - 8 : x + 8
  return (
    <g style={{ pointerEvents: 'none' }}>
      <line
        x1={cx}
        y1={cy}
        x2={lineEndX}
        y2={y}
        stroke={active ? color : 'rgba(79,195,247,0.4)'}
        strokeWidth="0.7"
        strokeDasharray="3 2"
      />
      <text
        x={x}
        y={y - 6}
        textAnchor={anchor}
        fill="white"
        fontSize="13"
        fontWeight="600"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        style={{ opacity: active ? 1 : 0.85 }}
      >
        {muscleName}
      </text>
      <text
        x={x}
        y={y + 7}
        textAnchor={anchor}
        fill="#7a9bbf"
        fontSize="11"
        fontStyle="italic"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
      >
        {latinName}
      </text>
    </g>
  )
}

function SVGDefs() {
  return (
    <defs>
      <filter id="f-gold" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>
        <feColorMatrix in="b" type="matrix" values="1.5 0.4 0 0 0.05  0.7 0.2 0 0 0  0 0 0 0 0  0 0 0 2.8 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="f-green" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>
        <feColorMatrix in="b" type="matrix" values="0 0.1 0 0 0  0.2 1.5 0.1 0 0  0 0.3 0 0 0  0 0 0 2.8 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="f-copper" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>
        <feColorMatrix in="b" type="matrix" values="1.4 0.2 0 0 0.02  0.4 0.2 0 0 0  0 0 0.1 0 0  0 0 0 2.8 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="f-blue" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>
        <feColorMatrix in="b" type="matrix" values="0 0 0.1 0 0  0 0.2 0.7 0 0  0 0 1.5 0 0  0 0 0 2 0" result="c"/>
        <feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="body-grad" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#1a2535"/>
        <stop offset="100%" stopColor="#060a12"/>
      </radialGradient>
    </defs>
  )
}

function FrontView({ selected, onSelect }) {
  return (
    <g>
      {/* Base body silhouette */}
      <path
        d="M160,18 L185,30 L193,54 L186,76 L178,88 L195,108 L255,128 L265,162 L262,220 L262,268 L252,310 L245,360 L208,360 L208,342 L215,462 L248,462 L248,558 L72,558 L72,462 L105,462 L112,342 L112,360 L75,360 L68,310 L58,268 L58,220 L55,162 L65,128 L125,108 L142,88 L134,76 L127,54 L135,30 Z"
        fill="url(#body-grad)"
        stroke="#1a2e48"
        strokeWidth="1"
      />
      {/* Decorative forearms */}
      <path d="M60,222 L78,226 L72,308 L55,295 L50,265Z" fill="rgba(10,16,26,0.9)" stroke="#182840" strokeWidth="0.8"/>
      <path d="M260,222 L242,226 L248,308 L265,295 L270,265Z" fill="rgba(10,16,26,0.9)" stroke="#182840" strokeWidth="0.8"/>

      {/* Interactive panels */}
      {/* Head */}
      <PanelPath d="M160,18 L186,30 L193,54 L186,76 L160,84 L134,76 L127,54 L134,30Z" muscleId="Head" selected={selected} onSelect={onSelect}/>
      {/* Shoulders Left */}
      <PanelPath d="M93,110 L130,104 L133,136 L118,150 L90,148 L68,135Z" muscleId="Shoulders" selected={selected} onSelect={onSelect}/>
      {/* Shoulders Right */}
      <PanelPath d="M227,110 L190,104 L187,136 L202,150 L230,148 L252,135Z" muscleId="Shoulders" selected={selected} onSelect={onSelect}/>
      {/* Chest */}
      <PanelPath d="M132,108 L188,108 L204,162 L198,220 L160,227 L122,220 L116,162Z" muscleId="Chest" selected={selected} onSelect={onSelect}/>
      {/* Biceps Left */}
      <PanelPath d="M66,138 L88,128 L98,164 L95,220 L76,226 L58,200 L58,162Z" muscleId="Biceps" selected={selected} onSelect={onSelect}/>
      {/* Biceps Right */}
      <PanelPath d="M254,138 L232,128 L222,164 L225,220 L244,226 L262,200 L262,162Z" muscleId="Biceps" selected={selected} onSelect={onSelect}/>
      {/* Core */}
      <PanelPath d="M120,222 L200,222 L196,310 L160,318 L124,310Z" muscleId="Core" selected={selected} onSelect={onSelect}/>
      {/* Quads Left */}
      <PanelPath d="M113,345 L158,342 L155,445 L112,448Z" muscleId="Quads" selected={selected} onSelect={onSelect}/>
      {/* Quads Right */}
      <PanelPath d="M162,342 L207,345 L208,448 L165,445Z" muscleId="Quads" selected={selected} onSelect={onSelect}/>
      {/* Calves Left */}
      <PanelPath d="M113,463 L152,463 L148,548 L115,550Z" muscleId="Calves" selected={selected} onSelect={onSelect}/>
      {/* Calves Right */}
      <PanelPath d="M168,463 L207,463 L205,550 L173,548Z" muscleId="Calves" selected={selected} onSelect={onSelect}/>

      {/* Hip/belt plate */}
      <path d="M118,322 L202,322 L210,340 L200,352 L120,352 L110,340Z" fill="rgba(10,16,28,0.95)" stroke="#1a2e50" strokeWidth="1"/>

      {/* Seam lines painted OVER panels */}
      <line x1="160" y1="110" x2="160" y2="226" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="133" y1="148" x2="197" y2="143" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="122" y1="256" x2="198" y2="256" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="123" y1="286" x2="197" y2="286" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="137" y1="348" x2="134" y2="444" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="183" y1="348" x2="186" y2="444" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="133" y1="468" x2="130" y2="545" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="187" y1="468" x2="190" y2="545" stroke="#0d1828" strokeWidth="1.5"/>

      {/* Knee circles */}
      <circle cx="133" cy="455" r="11" fill="#080e18" stroke="#1e3555" strokeWidth="1.5"/>
      <circle cx="187" cy="455" r="11" fill="#080e18" stroke="#1e3555" strokeWidth="1.5"/>
      {/* Wrist connectors */}
      <circle cx="63" cy="305" r="7" fill="#080e18" stroke="#1e3555" strokeWidth="1.5"/>
      <circle cx="257" cy="305" r="7" fill="#080e18" stroke="#1e3555" strokeWidth="1.5"/>

      {/* Ankle accent bands */}
      <rect x="115" y="548" width="37" height="9" rx="2" fill="rgba(160,128,70,0.35)" stroke="#C9A96E" strokeWidth="0.8"/>
      <rect x="168" y="548" width="37" height="9" rx="2" fill="rgba(160,128,70,0.35)" stroke="#C9A96E" strokeWidth="0.8"/>

      {/* Labels */}
      <Label x={328} y={52}  anchor="start" muscleName="Head"      latinName={MUSCLE_DATA.Head.latin}      cx={193} cy={52}  selected={selected}/>
      <Label x={328} y={130} anchor="start" muscleName="Shoulders"  latinName={MUSCLE_DATA.Shoulders.latin} cx={252} cy={130} selected={selected}/>
      <Label x={328} y={168} anchor="start" muscleName="Chest"      latinName={MUSCLE_DATA.Chest.latin}     cx={204} cy={168} selected={selected}/>
      <Label x={-8}  y={183} anchor="end"   muscleName="Biceps"     latinName={MUSCLE_DATA.Biceps.latin}    cx={58}  cy={183} selected={selected}/>
      <Label x={328} y={265} anchor="start" muscleName="Core"       latinName={MUSCLE_DATA.Core.latin}      cx={196} cy={265} selected={selected}/>
      <Label x={-8}  y={394} anchor="end"   muscleName="Quads"      latinName={MUSCLE_DATA.Quads.latin}     cx={112} cy={394} selected={selected}/>
      <Label x={328} y={505} anchor="start" muscleName="Calves"     latinName={MUSCLE_DATA.Calves.latin}    cx={207} cy={505} selected={selected}/>
    </g>
  )
}

function BackView({ selected, onSelect }) {
  return (
    <g>
      {/* Base body silhouette */}
      <path
        d="M160,18 L185,30 L193,54 L186,76 L178,88 L190,108 L258,128 L268,162 L264,220 L264,268 L254,310 L246,360 L208,360 L208,342 L215,462 L248,462 L248,558 L72,558 L72,462 L105,462 L112,342 L112,360 L74,360 L66,310 L56,268 L56,220 L52,162 L62,128 L130,108 L142,88 L134,76 L127,54 L135,30 Z"
        fill="url(#body-grad)"
        stroke="#1a2e48"
        strokeWidth="1"
      />

      {/* Interactive panels */}
      {/* Head */}
      <PanelPath d="M160,18 L186,30 L193,54 L186,76 L160,84 L134,76 L127,54 L134,30Z" muscleId="Head" selected={selected} onSelect={onSelect}/>
      {/* Traps */}
      <PanelPath d="M130,88 L190,88 L228,112 L235,150 L160,160 L85,150 L92,112Z" muscleId="Traps" selected={selected} onSelect={onSelect}/>
      {/* Lats Left */}
      <PanelPath d="M85,152 L128,160 L125,265 L98,276 L72,248 L68,194Z" muscleId="Lats" selected={selected} onSelect={onSelect}/>
      {/* Lats Right */}
      <PanelPath d="M235,152 L192,160 L195,265 L222,276 L248,248 L252,194Z" muscleId="Lats" selected={selected} onSelect={onSelect}/>
      {/* Triceps Left */}
      <PanelPath d="M67,138 L88,128 L98,164 L92,220 L72,226 L55,200 L56,160Z" muscleId="Triceps" selected={selected} onSelect={onSelect}/>
      {/* Triceps Right */}
      <PanelPath d="M253,138 L232,128 L222,164 L228,220 L248,226 L265,200 L264,160Z" muscleId="Triceps" selected={selected} onSelect={onSelect}/>
      {/* Lower Back */}
      <PanelPath d="M112,272 L208,272 L204,326 L160,332 L116,326Z" muscleId="Lower Back" selected={selected} onSelect={onSelect}/>
      {/* Glutes Left */}
      <PanelPath d="M113,330 L158,330 L155,393 L115,393Z" muscleId="Glutes" selected={selected} onSelect={onSelect}/>
      {/* Glutes Right */}
      <PanelPath d="M162,330 L207,330 L205,393 L165,393Z" muscleId="Glutes" selected={selected} onSelect={onSelect}/>
      {/* Hamstrings Left */}
      <PanelPath d="M113,393 L155,393 L152,448 L112,448Z" muscleId="Hamstrings" selected={selected} onSelect={onSelect}/>
      {/* Hamstrings Right */}
      <PanelPath d="M165,393 L207,393 L208,448 L168,448Z" muscleId="Hamstrings" selected={selected} onSelect={onSelect}/>
      {/* Calves Left */}
      <PanelPath d="M113,463 L152,463 L148,548 L115,550Z" muscleId="Calves" selected={selected} onSelect={onSelect}/>
      {/* Calves Right */}
      <PanelPath d="M168,463 L207,463 L205,550 L173,548Z" muscleId="Calves" selected={selected} onSelect={onSelect}/>

      {/* Seam lines */}
      <line x1="160" y1="90"  x2="160" y2="330" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="130" y1="90"  x2="115" y2="148" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="190" y1="90"  x2="205" y2="148" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="100" y1="175" x2="90"  y2="260" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="220" y1="175" x2="230" y2="260" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="160" y1="274" x2="160" y2="328" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="134" y1="398" x2="132" y2="444" stroke="#0d1828" strokeWidth="1.5"/>
      <line x1="186" y1="398" x2="188" y2="444" stroke="#0d1828" strokeWidth="1.5"/>

      {/* Knee circles */}
      <circle cx="133" cy="455" r="11" fill="#080e18" stroke="#1e3555" strokeWidth="1.5"/>
      <circle cx="187" cy="455" r="11" fill="#080e18" stroke="#1e3555" strokeWidth="1.5"/>

      {/* Ankle accent bands */}
      <rect x="115" y="548" width="37" height="9" rx="2" fill="rgba(160,128,70,0.35)" stroke="#C9A96E" strokeWidth="0.8"/>
      <rect x="168" y="548" width="37" height="9" rx="2" fill="rgba(160,128,70,0.35)" stroke="#C9A96E" strokeWidth="0.8"/>

      {/* Labels */}
      <Label x={328}  y={52}  anchor="start" muscleName="Head"        latinName={MUSCLE_DATA.Head.latin}          cx={193} cy={52}  selected={selected}/>
      <Label x={-8}   y={120} anchor="end"   muscleName="Traps"       latinName={MUSCLE_DATA.Traps.latin}         cx={92}  cy={120} selected={selected}/>
      <Label x={-8}   y={215} anchor="end"   muscleName="Lats"        latinName={MUSCLE_DATA.Lats.latin}          cx={68}  cy={215} selected={selected}/>
      <Label x={328}  y={185} anchor="start" muscleName="Triceps"     latinName={MUSCLE_DATA.Triceps.latin}       cx={265} cy={185} selected={selected}/>
      <Label x={-8}   y={298} anchor="end"   muscleName="Lower Back"  latinName={MUSCLE_DATA['Lower Back'].latin} cx={112} cy={298} selected={selected}/>
      <Label x={-8}   y={360} anchor="end"   muscleName="Glutes"      latinName={MUSCLE_DATA.Glutes.latin}        cx={113} cy={360} selected={selected}/>
      <Label x={328}  y={420} anchor="start" muscleName="Hamstrings"  latinName={MUSCLE_DATA.Hamstrings.latin}    cx={208} cy={420} selected={selected}/>
      <Label x={328}  y={505} anchor="start" muscleName="Calves"      latinName={MUSCLE_DATA.Calves.latin}        cx={207} cy={505} selected={selected}/>
    </g>
  )
}

export default function AnatomyDiagram({ workouts = [], defaultSelected = null, onLogWorkout, onSaveExercise }) {
  const [selected, setSelected] = useState(defaultSelected)
  const [view, setView] = useState('front')
  const [transitioning, setTransitioning] = useState(false)

  const handleSelect = useCallback((id) => {
    setSelected(prev => prev === id ? null : id)
  }, [])

  const handleViewChange = useCallback((v) => {
    if (v === view) return
    setTransitioning(true)
    setTimeout(() => {
      setView(v)
      setSelected(null)
      setTransitioning(false)
    }, 180)
  }, [view])

  const selectedData = selected ? MUSCLE_DATA[selected] : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      <style>{`
        @keyframes musclePulse { 0%,100% { opacity:0.82 } 50% { opacity:1 } }
        @keyframes cardSlideUp { from { transform:translateY(100%);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes adStar { 0%,100%{opacity:0.3} 50%{opacity:0.55} }
      `}</style>

      {/* Front / Back toggle */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'rgba(8,14,24,0.9)',
        border: '1px solid #1e3555',
        borderRadius: '999px',
        padding: '3px',
      }}>
        {['front','back'].map(v => {
          const active = view === v
          return (
            <button
              key={v}
              onPointerDown={() => handleViewChange(v)}
              style={{
                background: active ? 'rgba(0,255,136,0.08)' : 'transparent',
                border: active ? '1px solid #00FF88' : '1px solid transparent',
                borderRadius: '999px',
                color: active ? '#00FF88' : '#5a7a9a',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: '12px',
                fontWeight: active ? 700 : 500,
                padding: '5px 18px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: active ? '0 0 10px rgba(0,255,136,0.25)' : 'none',
                transition: 'all 0.15s ease',
                touchAction: 'manipulation',
              }}
            >
              {v}
            </button>
          )
        })}
      </div>

      {/* SVG diagram */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.18s ease',
        }}
        onPointerDown={() => setSelected(null)}
      >
        <svg
          viewBox="0 0 320 580"
          width="100%"
          overflow="visible"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <SVGDefs/>

          {view === 'front'
            ? <FrontView selected={selected} onSelect={handleSelect}/>
            : <BackView selected={selected} onSelect={handleSelect}/>
          }

          {/* AXIOS brand watermark */}
          <g
            transform="translate(372,562)"
            style={{ animation: 'adStar 3s ease-in-out infinite', pointerEvents: 'none' }}
          >
            <path
              d="M0,-11 L2.5,-2.5 L11,0 L2.5,2.5 L0,11 L-2.5,2.5 L-11,0 L-2.5,-2.5Z"
              fill="white"
              opacity="0.4"
            />
          </g>
        </svg>
      </div>

      {/* Info card */}
      {selected && selectedData && (
        <div
          key={selected}
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(8,14,24,0.97)',
            border: `1px solid ${selectedData.color}44`,
            borderRadius: '14px',
            padding: '16px',
            boxShadow: `0 4px 32px ${selectedData.color}22`,
            animation: 'cardSlideUp 0.22s ease-out both',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onPointerDown={e => { e.stopPropagation(); setSelected(null) }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              color: '#8aaccc',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              cursor: 'pointer',
              lineHeight: 1,
              touchAction: 'manipulation',
            }}
          >
            ×
          </button>

          {/* Muscle name */}
          <div style={{
            color: selectedData.color,
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '2px',
            paddingRight: '32px',
          }}>
            {selected}
          </div>
          {/* Latin name */}
          <div style={{
            color: '#5a7a9a',
            fontSize: '11px',
            fontStyle: 'italic',
            marginBottom: '12px',
          }}>
            {selectedData.latin}
          </div>

          {/* Description */}
          <p style={{
            color: '#8aaccc',
            fontSize: '12.5px',
            lineHeight: 1.55,
            margin: '0 0 14px 0',
          }}>
            {selectedData.desc}
          </p>

          {/* Top Exercises */}
          <div style={{
            color: '#3a5a7a',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Top Exercises
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginBottom: '14px' }}>
            {selectedData.exercises.map(ex => (
              <li key={ex} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#c0d8f0',
                fontSize: '12.5px',
                marginBottom: '5px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: selectedData.color,
                  flexShrink: 0,
                  boxShadow: `0 0 5px ${selectedData.color}88`,
                }}/>
                {ex}
              </li>
            ))}
          </ul>

          {/* View Workouts button */}
          {onLogWorkout && selected !== 'Head' && (
            <button
              onPointerDown={() => onLogWorkout(selected)}
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${selectedData.color}`,
                borderRadius: '8px',
                color: selectedData.color,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                padding: '9px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                boxShadow: `0 0 14px ${selectedData.color}33`,
                touchAction: 'manipulation',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              View Workouts →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
