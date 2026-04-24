import { useState, useMemo, useEffect } from 'react'
import {
  DB,
  FRONT_ZONES, BACK_ZONES,
  FRONT_ZONE_SHAPES, BACK_ZONE_SHAPES,
  FRONT_LABELS, BACK_LABELS,
  FrontBase, BackBase, BoneOverlay,
} from './WorkoutGuide'

const FF = 'Helvetica Neue,Arial,sans-serif'

// Maps workout muscle_group tags → WorkoutGuide zone IDs
const MG_TO_ZONES = {
  Chest:      ['chest'],
  Shoulders:  ['shoulders'],
  Biceps:     ['biceps', 'forearms'],
  Triceps:    ['triceps'],
  Core:       ['core', 'obliques'],
  Back:       ['traps', 'upper_back', 'lats', 'lower_back'],
  Quads:      ['quads'],
  Hamstrings: ['hamstrings'],
  Glutes:     ['glutes'],
  Calves:     ['calves'],
}

// Zone ID → workout muscle_group (for last-trained lookup)
const ZONE_TO_MG = {
  chest: 'Chest', shoulders: 'Shoulders', biceps: 'Biceps', forearms: 'Biceps',
  core: 'Core', obliques: 'Core', quads: 'Quads', calves: 'Calves',
  traps: 'Back', upper_back: 'Back', lats: 'Back', triceps: 'Triceps',
  lower_back: 'Back', glutes: 'Glutes', hamstrings: 'Hamstrings',
}

const ALL_ZONES = [...new Set([...FRONT_ZONES, ...BACK_ZONES])]

// Chip bar: muscle group → primary zone + all zones in group
const MG_LIST = ['Chest','Shoulders','Biceps','Triceps','Core','Back','Quads','Hamstrings','Glutes','Calves']
const MG_PRIMARY = {
  Chest: 'chest', Shoulders: 'shoulders', Biceps: 'biceps', Triceps: 'triceps',
  Core: 'core', Back: 'lats', Quads: 'quads', Hamstrings: 'hamstrings',
  Glutes: 'glutes', Calves: 'calves',
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

// ─── Zone Overlay ─────────────────────────────────────────────────────────────
// Re-implements WorkoutGuide's ZoneOverlay with activity-count-driven opacity.
// Each zone glows in its DB color; intensity scales with sessions/7d.
function ZoneOverlay({ view, selected, hovered, onSelect, onHover, counts }) {
  const shapes = view === 'front' ? FRONT_ZONE_SHAPES : BACK_ZONE_SHAPES
  const labels = view === 'front' ? FRONT_LABELS      : BACK_LABELS
  const zones  = view === 'front' ? FRONT_ZONES       : BACK_ZONES

  const getOp = (id) => {
    if (id === selected) return 0.88
    if (id === hovered)  return 0.62
    const c = counts[id] || 0
    if (c === 0) return 0.12
    if (c === 1) return 0.40
    if (c === 2) return 0.62
    return 0.80
  }

  const getSW = (id) => {
    if (id === selected) return 2.5
    if (id === hovered)  return 1.5
    return (counts[id] || 0) > 0 ? 1.0 : 0.5
  }

  const renderShape = (s, color, op, sw) => {
    const shared = { fill: color, fillOpacity: op, stroke: color, strokeWidth: sw, style: { transition: 'all 0.3s' } }
    if (s.e) return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...shared}/>
    if (s.r) return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...shared}/>
    return <path d={s.d} {...shared}/>
  }

  return (
    <svg viewBox="0 0 240 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <filter id="mm-zone-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="mm-label-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
          <feFlood floodColor="#ffffff" floodOpacity="1" result="white"/>
          <feComposite in="white" in2="blur" operator="in" result="wb"/>
          <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="mm-heart-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <style>{`
        @keyframes mmMuscleGlow { 0%,100%{opacity:1} 50%{opacity:0.62} }
        @keyframes mmHeartbeat {
          0%,100%{transform:scale(1);opacity:0.68}
          12%{transform:scale(1.28);opacity:1}
          24%{transform:scale(1);opacity:0.68}
          38%{transform:scale(1.16);opacity:0.88}
          60%{transform:scale(1);opacity:0.68}
        }
      `}</style>

      {zones.map(id => {
        const color = DB[id]?.color || '#b4bccc'
        const isSel = id === selected
        return (
          <g key={id}
            onClick={() => onSelect(selected === id ? null : id)}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            style={{
              cursor: 'pointer',
              ...(isSel ? { filter: 'url(#mm-zone-glow)', animation: 'mmMuscleGlow 2.6s ease-in-out infinite' } : {}),
            }}>
            {(shapes[id] || []).map((s, i) => (
              <g key={i}>{renderShape(s, color, getOp(id), getSW(id))}</g>
            ))}
          </g>
        )
      })}

      {/* Labels — scientific names at edges */}
      {labels.map(l => {
        const sel = selected === l.id || hovered === l.id
        return (
          <text key={l.id} x={l.x} y={l.y}
            fill="#ffffff" fontSize="7.5" fontFamily={FF}
            fontWeight={sel ? '700' : '500'} textAnchor={l.a}
            filter="url(#mm-label-glow)"
            style={{ pointerEvents: 'none', transition: 'opacity 0.18s', letterSpacing: '0.04em', opacity: sel ? 1 : 0.55 }}>
            {DB[l.id]?.label || l.id}
            {l.sci && (
              <tspan x={l.x} dy="9" fontSize="5.8" fontWeight="400" letterSpacing="0.06em" fill="#ffffff" style={{ fontStyle: 'italic' }}>
                {l.sci}
              </tspan>
            )}
          </text>
        )
      })}

      {/* Heartbeat — front view */}
      {view === 'front' && (
        <g filter="url(#mm-heart-glow)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'mmHeartbeat 1.5s ease-in-out infinite' }}>
          <path d="M106,126 C106,126 97,119 97,113 C97,108 101,106 104,107 C105,107.5 106,109 106,109 C106,109 107,107.5 108,107 C111,106 115,108 115,113 C115,119 106,126 106,126 Z"
            fill="#e8525a" opacity={0.8}/>
        </g>
      )}
    </svg>
  )
}

// ─── Exercise Card ─────────────────────────────────────────────────────────────
function ExCard({ ex, accent }) {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '13px 14px 11px',
      display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, fontFamily: FF, marginBottom: 3 }}>{ex.name}</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'rgba(212,212,232,0.32)', fontSize: 10, fontFamily: FF, background: 'rgba(212,212,232,0.06)', padding: '2px 7px', borderRadius: 5 }}>{ex.eq}</span>
            <span style={{ color: '#b4bccc', fontSize: 10, fontFamily: FF, fontWeight: 700, background: 'rgba(180,188,204,0.1)', padding: '2px 7px', borderRadius: 5 }}>{ex.sets}</span>
          </div>
        </div>
        <a href={ytUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
            padding: '7px 11px', borderRadius: 8,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontSize: 10, fontWeight: 700,
            fontFamily: FF, letterSpacing: '0.08em', textDecoration: 'none',
          }}
          onClick={e => e.stopPropagation()}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="#ef4444">
            <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/>
            <polygon fill="white" points="10,8.5 16,12 10,15.5"/>
          </svg>
          Watch
        </a>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MuscleMapView({ workouts = [] }) {
  const [selected,  setSelected]  = useState(null)   // zone ID: 'chest', 'biceps', etc.
  const [view,      setView]      = useState('front') // 'front' | 'back'
  const [hovered,   setHovered]   = useState(null)
  const [exercises, setExercises] = useState([])
  const [spinning,  setSpinning]  = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const sevenStr = sevenAgo.toISOString().split('T')[0]

  // Per-zone session counts for the past 7 days
  const counts = useMemo(() => {
    const c = {}; ALL_ZONES.forEach(z => { c[z] = 0 })
    const seen = new Set()
    workouts.forEach(w => {
      if (!w.workout_date || w.workout_date < sevenStr || w.workout_date > todayStr) return
      ;(w.exercises || []).forEach(ex => {
        const mg = ex.muscle_group; if (!mg) return
        const zones = mg === 'Full Body' ? ALL_ZONES : (MG_TO_ZONES[mg] || [])
        zones.forEach(z => {
          const key = `${w.workout_date}-${z}`
          if (!seen.has(key)) { seen.add(key); c[z]++ }
        })
      })
    })
    return c
  }, [workouts, sevenStr, todayStr])

  // Last-worked date per muscle group tag
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
    if (selected && DB[selected]) setExercises(pickFour(DB[selected].exercises))
    else setExercises([])
  }, [selected])

  function handleViewChange(v) { setView(v); setSelected(null); setHovered(null) }
  function handleSelect(id)    { setSelected(id); setHovered(null) }

  function handleShuffle() {
    if (!selected || !DB[selected]) return
    setSpinning(true)
    setExercises(pickFour(DB[selected].exercises))
    setTimeout(() => setSpinning(false), 460)
  }

  const n          = counts[selected] || 0
  const rec        = selected ? getRecovery(n) : null
  const dbData     = selected ? DB[selected]   : null
  const selectedMG = selected ? ZONE_TO_MG[selected] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        @keyframes mmSlideUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mmBgPulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes mmGridFade { 0%,100%{opacity:0.03} 50%{opacity:0.06} }
        @keyframes mmScanCW   { to{transform:rotate(360deg)} }
        @keyframes mmScanCCW  { to{transform:rotate(-360deg)} }
      `}</style>

      {/* Front / Back toggle */}
      <div style={{ display: 'flex', background: 'var(--stat-bg)', borderRadius: 9, border: '1px solid var(--border)', padding: 2, gap: 2 }}>
        {[['front','Front'],['back','Back']].map(([v, lbl]) => (
          <button key={v} onClick={() => handleViewChange(v)} style={{
            flex: 1, padding: '7px', borderRadius: 7,
            background: view === v ? 'rgba(212,212,232,0.10)' : 'transparent',
            color:  view === v ? 'var(--text-primary)' : 'var(--text-muted)',
            border: 'none', cursor: 'pointer', fontSize: 11,
            fontWeight: view === v ? 700 : 400,
            fontFamily: FF, transition: 'all 0.15s',
          }}>{lbl}</button>
        ))}
      </div>

      {/* Anatomy diagram */}
      <div style={{ position: 'relative', width: 240, height: 500, margin: '0 auto' }}>

        {/* Radial glow — tints to selected muscle color */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, borderRadius: 16, pointerEvents: 'none',
          background: dbData
            ? `radial-gradient(ellipse 65% 55% at 50% 44%, ${dbData.color}30 0%, transparent 68%)`
            : 'radial-gradient(ellipse 65% 55% at 50% 44%, rgba(180,188,204,0.12) 0%, transparent 68%)',
          transition: 'background 0.7s ease',
          animation: 'mmBgPulse 3.5s ease-in-out infinite',
        }}/>

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, borderRadius: 16, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(212,212,232,0.18) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          animation: 'mmGridFade 5s ease-in-out infinite',
          maskImage: 'radial-gradient(ellipse 80% 90% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 90% at 50% 50%, black 40%, transparent 100%)',
        }}/>

        {/* Scan rings + corner reticles */}
        <svg style={{ position:'absolute', inset:0, zIndex:0, width:'100%', height:'100%', overflow:'visible', pointerEvents:'none' }} viewBox="0 0 240 500">
          <ellipse cx="120" cy="248" rx="112" ry="242"
            fill="none" stroke="rgba(212,212,232,0.07)" strokeWidth="1" strokeDasharray="14 9"
            style={{ transformOrigin:'120px 248px', animation:'mmScanCW 22s linear infinite' }}/>
          <ellipse cx="120" cy="248" rx="90" ry="198"
            fill="none" stroke="rgba(212,212,232,0.10)" strokeWidth="0.8" strokeDasharray="7 11"
            style={{ transformOrigin:'120px 248px', animation:'mmScanCCW 14s linear infinite' }}/>
          <ellipse cx="120" cy="248" rx="66" ry="148"
            fill="none"
            stroke={dbData ? `${dbData.color}66` : 'rgba(212,212,232,0.08)'}
            strokeWidth="1" strokeDasharray="5 13"
            style={{ transformOrigin:'120px 248px', animation:'mmScanCW 8s linear infinite', transition:'stroke 0.7s ease' }}/>
          <line x1="120" y1="8"   x2="120" y2="492" stroke="rgba(212,212,232,0.04)" strokeWidth="0.5"/>
          <line x1="8"   y1="248" x2="232" y2="248" stroke="rgba(212,212,232,0.04)" strokeWidth="0.5"/>
          <g stroke="rgba(212,212,232,0.35)" strokeWidth="1" opacity="0.5">
            <line x1="18"  y1="30"  x2="34"  y2="30"/> <line x1="18"  y1="30"  x2="18"  y2="46"/>
            <line x1="222" y1="30"  x2="206" y2="30"/> <line x1="222" y1="30"  x2="222" y2="46"/>
            <line x1="18"  y1="470" x2="34"  y2="470"/><line x1="18"  y1="470" x2="18"  y2="454"/>
            <line x1="222" y1="470" x2="206" y2="470"/><line x1="222" y1="470" x2="222" y2="454"/>
          </g>
        </svg>

        {view === 'front' ? <FrontBase/> : <BackBase/>}
        <BoneOverlay view={view}/>
        <ZoneOverlay
          view={view}
          selected={selected}
          hovered={hovered}
          onSelect={handleSelect}
          onHover={setHovered}
          counts={counts}
        />
      </div>

      {!selected && (
        <p style={{
          textAlign: 'center', color: '#ffffff', fontSize: 11, fontFamily: FF,
          fontStyle: 'italic', opacity: 0.55, margin: '-8px 0 0',
          textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.5)',
        }}>
          Tap a muscle group to see exercises
        </p>
      )}

      {/* Muscle group chip bar */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {MG_LIST.map(mg => {
          const primaryZone = MG_PRIMARY[mg]
          const zones = MG_TO_ZONES[mg] || []
          const c     = Math.max(...zones.map(z => counts[z] || 0))
          const isSel = zones.includes(selected)
          const color = DB[primaryZone]?.color || '#b4bccc'
          return (
            <button key={mg}
              onClick={() => handleSelect(isSel ? null : primaryZone)}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 99,
                background: isSel ? `${color}22` : 'var(--stat-bg)',
                border: `1px solid ${isSel ? color+'66' : (c > 0 ? color+'33' : 'var(--border)')}`,
                color:  isSel ? color : (c > 0 ? 'var(--text-secondary)' : 'var(--text-muted)'),
                fontSize: 11, fontWeight: isSel ? 700 : 400,
                fontFamily: FF, cursor: 'pointer',
                letterSpacing: '0.04em', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              {mg}
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {selected && dbData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'mmSlideUp 0.22s ease both' }}>

          {/* Workout stats */}
          <div style={{
            background: 'var(--stat-bg)',
            border: `1px solid ${n > 0 ? dbData.color+'33' : 'var(--border)'}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          }}>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Sessions / 7d</p>
              <p style={{ color: n > 0 ? dbData.color : 'var(--text-muted)', fontSize: 22, fontWeight: 900, fontFamily: FF, margin: 0, lineHeight: 1 }}>{n}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Last Trained</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, margin: '3px 0 0' }}>{fmtDate(lastWorked[selectedMG], todayStr)}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-faint)', fontSize: 8, fontFamily: FF, margin: '0 0 4px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Status</p>
              {rec && <p style={{ color: rec.color, fontSize: 11, fontFamily: FF, margin: '3px 0 0' }}>{rec.status}</p>}
            </div>
          </div>

          {/* Muscle info */}
          <div style={{
            background: 'var(--bg-card)', border: `1px solid ${dbData.color}33`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: dbData.color, boxShadow: `0 0 10px ${dbData.color}` }}/>
              <p style={{ color: dbData.color, fontSize: 15, fontWeight: 800, fontFamily: FF, letterSpacing: '-0.01em', margin: 0 }}>{dbData.label}</p>
            </div>
            <p style={{ color: 'rgba(212,212,232,0.38)', fontSize: 10, fontFamily: FF, letterSpacing: '0.06em', fontStyle: 'italic', marginBottom: 10 }}>
              {dbData.scientific}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ color: 'rgba(212,212,232,0.28)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: FF }}>Intensity</span>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: i <= dbData.intensity ? dbData.color : 'rgba(212,212,232,0.08)',
                  boxShadow: i <= dbData.intensity ? `0 0 6px ${dbData.color}88` : 'none',
                }}/>
              ))}
            </div>
            <p style={{ color: 'rgba(212,212,232,0.52)', fontSize: 12, fontFamily: FF, lineHeight: 1.65, margin: 0 }}>{dbData.desc}</p>
          </div>

          {/* Exercises */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 3, height: 14, background: dbData.color, borderRadius: 2, boxShadow: `0 0 8px ${dbData.color}` }}/>
            <p style={{ color: dbData.color, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: FF, fontWeight: 700, flex: 1, margin: 0 }}>Exercises</p>
            <button onClick={handleShuffle} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8,
              background: `${dbData.color}18`, border: `1px solid ${dbData.color}44`,
              color: dbData.color, fontSize: 10, fontWeight: 700,
              fontFamily: FF, cursor: 'pointer', letterSpacing: '0.08em',
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.46s ease' }}>
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Shuffle
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {exercises.map((ex, i) => <ExCard key={`${ex.name}-${i}`} ex={ex} accent={dbData.color}/>)}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="rgba(212,212,232,0.10)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 10px' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color: 'rgba(212,212,232,0.15)', fontSize: 12, fontFamily: FF, lineHeight: 1.6 }}>
            Select a muscle group<br/>from the diagram or chips above
          </p>
        </div>
      )}

      <div style={{ height: 16 }}/>
    </div>
  )
}
