import { useState, useEffect, useMemo } from 'react'
import { useToday } from '../../hooks/useToday'
import { useHaptic } from '../../hooks/useHaptic'
import fitnessIconSrc from '../../fitness-icon.png'
import { useNavigate } from 'react-router-dom'
import { useWeightLog } from '../../hooks/useWeightLog'
import { useProfile } from '../../hooks/useProfile'
import { BottomNav } from '../../pages/Dashboard'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import MuscleMapView from './MuscleMapView'
import EquipmentScanner from './EquipmentScanner'
import imgChest     from './Images/Chest.png'
import imgBack      from './Images/Back.png'
import imgShoulders from './Images/Shoulders.png'
import imgArms      from './Images/Arms.png'
import imgCore      from './Images/Core.png'
import imgQuads     from './Images/Quads.png'
import imgGlutes    from './Images/Glutes.png'
import imgCalves    from './Images/Calves.png'
import trainingHeroImg from './Images/Training.png'

const MUSCLE_IMAGES = {
  'Chest':      imgChest,
  'Back':       imgBack,
  'Shoulders':  imgShoulders,
  'Biceps':     imgArms,
  'Triceps':    imgArms,
  'Core':       imgCore,
  'Quads':      imgQuads,
  'Hamstrings': imgQuads,
  'Glutes':     imgGlutes,
  'Calves':     imgCalves,
}


const GYM_IMG = trainingHeroImg

// ── Date ───────────────────────────────────────────────────────────────────────
// ── Constants ──────────────────────────────────────────────────────────────────
const WORKOUT_TYPES  = ['Strength', 'Cardio', 'HIIT', 'Mobility', 'Sport', 'Other']
const MUSCLE_GROUPS  = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Full Body']

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ico = {
  back:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  close:   (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  plus:    (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  trash:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  check:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  dumbbell:(s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829 2 2 0 1 1 2.828 2.829l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>,
  scale:   (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/></svg>,
  chevron: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  down:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  timer:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  trend:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  scan:    (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(ds) {
  if (!ds) return ''
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function GlowBar({ pct, h=3 }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(212,212,232,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:'#b4bccc', borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1)', boxShadow:'0 0 8px rgba(180,188,204,0.5)' }} />
    </div>
  )
}

// ── Weight Chart ───────────────────────────────────────────────────────────────
function WeightChart({ logs, goal, range, onRange }) {
  const RANGES = [['1M',30],['3M',90],['ALL',Infinity]]
  const days   = RANGES.find(r => r[0] === range)?.[1] ?? 30
  const cutoff = days === Infinity ? null : new Date(Date.now() - days * 864e5)
  const filtered = [...(logs||[])]
    .sort((a,b) => new Date(a.logged_date) - new Date(b.logged_date))
    .filter(l => !cutoff || new Date(l.logged_date) >= cutoff)

  if (!filtered.length) return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'32px 16px', textAlign:'center', marginBottom:12 }}>
      <p style={{ color:'rgba(212,212,232,0.18)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic' }}>Log weight to see your chart</p>
    </div>
  )

  const W=300, H=120, PL=30, PR=32, PT=8, PB=20
  const pw = W-PL-PR, ph = H-PT-PB
  const vals  = filtered.map(l => parseFloat(l.weight_lbs))
  const times = filtered.map(l => new Date(l.logged_date).getTime())
  const numG  = parseFloat(goal) || 0
  const allVs = numG ? [...vals, numG] : vals
  const yMin  = Math.floor(Math.min(...allVs) - 2)
  const yMax  = Math.ceil(Math.max(...allVs) + 2)
  const xMin  = times[0], xMax = times[times.length-1]
  const spanX = Math.max(xMax - xMin, 864e5)
  const toX = ms => PL + ((ms - xMin) / spanX) * pw
  const toY = v  => PT + ph - ((v - yMin) / (yMax - yMin)) * ph
  const pts = filtered.map(l =>
    `${toX(new Date(l.logged_date).getTime()).toFixed(1)},${toY(parseFloat(l.weight_lbs)).toFixed(1)}`
  ).join(' ')
  const yStep = Math.ceil((yMax - yMin) / 3)
  const yLabels = []
  for (let v = Math.ceil(yMin/yStep)*yStep; v <= yMax; v += yStep) yLabels.push(v)
  const xSamples = filtered.length >= 3
    ? [filtered[0], filtered[Math.floor(filtered.length/2)], filtered[filtered.length-1]]
    : filtered
  const fmtD = s => { const d = new Date(s+'T12:00:00'); return `${d.getMonth()+1}/${d.getDate()}` }

  let trend = null
  if (filtered.length >= 4) {
    const n  = filtered.length
    const xs = filtered.map(l => (new Date(l.logged_date) - new Date(filtered[0].logged_date)) / 864e5)
    const sx = xs.reduce((a,b)=>a+b,0), sy = vals.reduce((a,b)=>a+b,0)
    const sxy = xs.reduce((a,x,i)=>a+x*vals[i],0), sx2 = xs.reduce((a,x)=>a+x*x,0)
    const den = n*sx2 - sx*sx
    if (den) {
      const m = (n*sxy-sx*sy)/den, b0 = (sy-m*sx)/n
      trend = { x1:toX(times[0]), y1:toY(b0), x2:toX(times[n-1]), y2:toY(b0+m*xs[n-1]) }
    }
  }

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 14px 8px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>WEIGHT CHART</p>
        <div style={{ display:'flex', gap:4 }}>
          {RANGES.map(([lbl]) => (
            <button key={lbl} onClick={() => onRange(lbl)} style={{
              padding:'3px 8px', borderRadius:6, cursor:'pointer', fontSize:10,
              fontFamily:'Helvetica Neue,sans-serif', fontWeight: range===lbl ? 700 : 400,
              transition:'all 0.15s',
              border:`1px solid ${range===lbl ? 'rgba(180,188,204,0.45)' : 'rgba(212,212,232,0.09)'}`,
              background: range===lbl ? 'rgba(180,188,204,0.15)' : 'transparent',
              color: range===lbl ? '#b4bccc' : 'rgba(212,212,232,0.28)',
            }}>{lbl}</button>
          ))}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
        <defs>
          <linearGradient id="wc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(180,188,204,0.14)"/>
            <stop offset="100%" stopColor="rgba(180,188,204,0)"/>
          </linearGradient>
        </defs>
        {yLabels.map(v => (
          <g key={v}>
            <line x1={PL} y1={toY(v)} x2={W-PR} y2={toY(v)} stroke="rgba(212,212,232,0.05)" strokeWidth="1"/>
            <text x={PL-4} y={toY(v)+3.5} textAnchor="end" fill="rgba(212,212,232,0.2)" fontSize="7" fontFamily="Helvetica Neue,sans-serif">{v}</text>
          </g>
        ))}
        {numG > 0 && toY(numG) > PT-6 && toY(numG) < PT+ph+6 && (
          <g>
            <line x1={PL} y1={toY(numG)} x2={W-PR} y2={toY(numG)} stroke="rgba(16,185,129,0.45)" strokeWidth="1" strokeDasharray="5 3"/>
            <text x={W-PR+3} y={toY(numG)+3.5} fill="rgba(16,185,129,0.6)" fontSize="7" fontFamily="Helvetica Neue,sans-serif">Goal</text>
          </g>
        )}
        {trend && (
          <line x1={trend.x1} y1={trend.y1} x2={trend.x2} y2={trend.y2}
            stroke="rgba(245,158,11,0.35)" strokeWidth="1" strokeDasharray="4 3"/>
        )}
        {filtered.length >= 2 && (
          <polygon
            points={`${toX(times[0]).toFixed(1)},${(PT+ph).toFixed(1)} ${pts} ${toX(times[times.length-1]).toFixed(1)},${(PT+ph).toFixed(1)}`}
            fill="url(#wc-area)"/>
        )}
        <polyline points={pts} fill="none" stroke="rgba(180,188,204,0.72)" strokeWidth="1.8"
          strokeLinejoin="round" strokeLinecap="round"/>
        {filtered.slice(-12).map((l, i) => (
          <circle key={i}
            cx={toX(new Date(l.logged_date).getTime())}
            cy={toY(parseFloat(l.weight_lbs))}
            r="2.5" fill="rgba(212,212,232,0.85)" stroke="var(--bg-card)" strokeWidth="1.2"/>
        ))}
        {xSamples.map((l, i) => (
          <text key={i} x={toX(new Date(l.logged_date).getTime())} y={H-3}
            textAnchor="middle" fill="rgba(212,212,232,0.2)" fontSize="7" fontFamily="Helvetica Neue,sans-serif">
            {fmtD(l.logged_date)}
          </text>
        ))}
      </svg>
      <div style={{ display:'flex', gap:16, marginTop:6 }}>
        <span style={{ color:'rgba(16,185,129,0.55)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
          <svg width="16" height="1" style={{ display:'inline-block' }}><line x1="0" y1="0.5" x2="16" y2="0.5" stroke="rgba(16,185,129,0.5)" strokeWidth="1" strokeDasharray="5 3"/></svg>
          goal
        </span>
        {trend && (
          <span style={{ color:'rgba(245,158,11,0.5)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
            <svg width="16" height="1" style={{ display:'inline-block' }}><line x1="0" y1="0.5" x2="16" y2="0.5" stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="4 3"/></svg>
            trend
          </span>
        )}
      </div>
    </div>
  )
}

// ── Goal Progress Bar ──────────────────────────────────────────────────────────
function GoalBar({ current, goal, start }) {
  const c = parseFloat(current)||0, g = parseFloat(goal)||0, s = parseFloat(start)||c
  if (!c || !g || Math.abs(g - s) < 0.1) return null
  const losing = g < s
  const pct    = losing
    ? Math.max(0, Math.min(1, (s - c) / (s - g)))
    : Math.max(0, Math.min(1, (c - s) / (g - s)))
  const done   = pct >= 0.99
  const left   = Math.abs(c - g).toFixed(1)
  const barW   = Math.round(pct * 100)
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
        <p style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>GOAL PROGRESS</p>
        <div style={{ display:'flex', gap:10, alignItems:'baseline' }}>
          <span style={{ color:'rgba(212,212,232,0.3)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>{s} start</span>
          <span style={{ color:'var(--text-primary)', fontSize:14, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>{g} lbs goal</span>
        </div>
      </div>
      <div style={{ background:'rgba(212,212,232,0.07)', borderRadius:99, height:8, overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:99, width:`${barW}%`,
          background: done ? 'linear-gradient(90deg,#10b981,#34d399)' : barW > 65 ? 'linear-gradient(90deg,#f59e0b,#fcd34d)' : 'linear-gradient(90deg,rgba(140,148,164,0.55),rgba(180,188,204,0.85))',
          transition:'width 1.2s cubic-bezier(0.34,1.15,0.64,1)',
          boxShadow: done ? '0 0 10px rgba(16,185,129,0.5)' : undefined,
        }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
        <span style={{ color:'rgba(212,212,232,0.3)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>
          {done ? '✓ Goal reached!' : `${left} lbs to go`}
        </span>
        <span style={{ color: done ? '#10b981' : 'rgba(212,212,232,0.4)', fontSize:10, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{Math.round(pct*100)}%</span>
      </div>
    </div>
  )
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:`linear-gradient(to bottom,var(--accent-fitness),transparent)`, borderRadius:2, boxShadow:`0 0 8px var(--accent-fitness)` }} />
        <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {sub && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>}
    </div>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:14, padding:'18px 16px', ...style }}>
      {children}
    </div>
  )
}

// ── Reusable Input Field (must be top-level to avoid focus-reset bug) ─────────
function InputField({ label, value, onChange, type='text', placeholder='' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:7 }}>{label}</label>}
      <div style={{ background:'var(--stat-bg)', border:`1px solid ${focused ? 'rgba(212,212,232,0.25)' : 'rgba(212,212,232,0.09)'}`, borderRadius:10, padding:'12px 14px', transition:'border-color 0.2s' }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }} />
      </div>
    </div>
  )
}

// ── Log Workout Sheet ──────────────────────────────────────────────────────────
function LogWorkoutSheet({ onSave, onClose, prefillMuscle, prefillWorkout }) {
  const [visible,  setVisible]  = useState(false)
  const [step,     setStep]     = useState(prefillMuscle || prefillWorkout ? 'exercises' : 'workout')
  const [workout,  setWorkout]  = useState({ label: prefillWorkout?.label || (prefillMuscle ? `${prefillMuscle} Session` : ''), type: prefillWorkout?.type || 'Strength', duration:'' })
  const [exercises,setExercises]= useState(prefillWorkout?.exercises || (prefillMuscle ? [{ name:'', sets:'', reps:'', weight:'', muscle_group: prefillMuscle }] : []))
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const addExercise = () => setExercises(ex => [...ex, { name:'', sets:'', reps:'', weight:'', muscle_group:'Chest' }])
  const setEx = (i, k, v) => setExercises(ex => ex.map((e, idx) => idx===i ? {...e, [k]:v} : e))
  const removeEx = i => setExercises(ex => ex.filter((_,idx) => idx!==i))

  const handleSave = async () => {
    if (!workout.label.trim()) { setError('Workout name is required.'); return }
    setError(''); setSaving(true)
    try {
      await onSave({ workout, exercises })
      onClose()
    } catch(e) {
      setError(e.message || 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--overlay-bg)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'var(--sheet-bg)', borderTop:'1px solid var(--border)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(28px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)', maxHeight:'92vh', overflowY:'auto' }}>

        {/* Handle */}
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.13)', borderRadius:99, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{step === 'workout' ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
            <h2 style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>{step === 'workout' ? 'Workout Details' : 'Add Exercises'}</h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {step === 'workout' && (
          <>
            <InputField label="Workout Name" value={workout.label} onChange={v => setWorkout(w=>({...w,label:v}))} placeholder="e.g. Push Day, Morning Run" />

            {/* Type selector */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Type</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {WORKOUT_TYPES.map(t => (
                  <button key={t} onClick={() => setWorkout(w=>({...w,type:t}))}
                    style={{ padding:'7px 14px', borderRadius:99, border:`1px solid ${workout.type===t ? 'rgba(180,188,204,0.5)' : 'rgba(212,212,232,0.09)'}`, background: workout.type===t ? 'rgba(180,188,204,0.15)' : 'rgba(212,212,232,0.03)', color: workout.type===t ? '#b4bccc' : 'rgba(212,212,232,0.38)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight: workout.type===t ? 700 : 400, cursor:'pointer', transition:'all 0.18s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <InputField label="Duration (minutes)" value={workout.duration} onChange={v => setWorkout(w=>({...w,duration:v}))} type="number" placeholder="45" />

            <button onClick={() => setStep('exercises')}
              style={{ width:'100%', padding:'14px', background:'rgba(180,188,204,0.15)', color:'#b4bccc', border:'1px solid rgba(180,188,204,0.4)', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', marginTop:8, transition:'all 0.2s', boxShadow:'0 0 14px rgba(180,188,204,0.1)' }}>
              Next → Add Exercises
            </button>
          </>
        )}

        {step === 'exercises' && (
          <>
            {exercises.length === 0 && (
              <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:12, padding:'24px', textAlign:'center', marginBottom:16 }}>
                <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic', marginBottom:12 }}>No exercises added yet.</p>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:14 }}>
              {exercises.map((ex, i) => (
                <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <p style={{ color:'rgba(212,212,232,0.45)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>Exercise {i+1}</p>
                    <button onClick={() => removeEx(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>{Ico.trash()}</button>
                  </div>
                  {/* Name */}
                  <div style={{ marginBottom:10 }}>
                    <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:9, padding:'11px 13px' }}>
                      <input value={ex.name} onChange={e => setEx(i,'name',e.target.value)} placeholder="Exercise name" style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }} />
                    </div>
                  </div>
                  {/* Sets / Reps / Weight */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                    {[['Sets','sets'],['Reps','reps'],['Weight (lbs)','weight']].map(([lbl,key]) => (
                      <div key={key}>
                        <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{lbl}</p>
                        <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:9, padding:'10px 11px' }}>
                          <input type="number" value={ex[key]} onChange={e => setEx(i,key,e.target.value)} placeholder="0" style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Muscle group */}
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {MUSCLE_GROUPS.map(m => (
                      <button key={m} onClick={() => setEx(i,'muscle_group',m)}
                        style={{ padding:'4px 10px', borderRadius:99, border:`1px solid ${ex.muscle_group===m ? 'rgba(212,212,232,0.3)' : 'rgba(212,212,232,0.07)'}`, background: ex.muscle_group===m ? 'rgba(212,212,232,0.1)' : 'transparent', color: ex.muscle_group===m ? '#fff' : 'rgba(212,212,232,0.28)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', transition:'all 0.15s' }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addExercise}
              style={{ width:'100%', padding:'12px', background:'transparent', border:'1px dashed rgba(212,212,232,0.15)', borderRadius:10, color:'rgba(212,212,232,0.4)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:14, letterSpacing:'0.08em' }}>
              {Ico.plus(13)} Add Exercise
            </button>

            {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12 }}>{error}</p>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep('workout')}
                style={{ flex:1, padding:'13px', background:'transparent', border:'1px solid var(--border)', borderRadius:10, color:'rgba(212,212,232,0.4)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                ← Back
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:2, padding:'13px', background:'rgba(180,188,204,0.15)', color:'#b4bccc', border:'1px solid rgba(180,188,204,0.4)', borderRadius:10, fontSize:12, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.2s', boxShadow:'0 0 14px rgba(180,188,204,0.1)' }}>
                {saving ? 'Saving…' : <>{Ico.check()} Save Workout</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Log Weight Sheet ───────────────────────────────────────────────────────────
function LogWeightSheet({ onSave, onClose, current, todayStr }) {
  const [weight,  setWeight]  = useState('')
  const [note,    setNote]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t) }, [])

  const numVal   = parseFloat(weight)
  const numCur   = parseFloat(current)
  const delta    = weight && !isNaN(numVal) && current ? (numVal - numCur).toFixed(1) : null
  const deltaPos = delta !== null ? parseFloat(delta) > 0 : null
  const hasVal   = weight && !isNaN(numVal)

  const handleSave = async () => {
    if (!hasVal) { setError('Please enter a valid weight.'); return }
    setError(''); setSaving(true)
    try {
      await onSave({ weight_lbs: numVal, note: note.trim(), date: todayStr })
      setSaved(true)
      setTimeout(onClose, 520)
    } catch(e) {
      setError(e.message || 'Failed to save.')
      setSaving(false)
    }
  }

  const ringColor = !hasVal ? 'rgba(212,212,232,0.12)'
    : delta === null       ? 'rgba(180,188,204,0.45)'
    : deltaPos             ? 'rgba(245,158,11,0.55)'
    :                        'rgba(16,185,129,0.55)'
  const ringGlow = !hasVal ? 'none'
    : delta === null       ? '0 0 22px rgba(180,188,204,0.18)'
    : deltaPos             ? '0 0 22px rgba(245,158,11,0.22)'
    :                        '0 0 22px rgba(16,185,129,0.22)'

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--overlay-bg)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <style>{`
        @keyframes lwSheetPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes lwSavedScale { 0%{transform:scale(0.88);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        @keyframes lwTickIn { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
      `}</style>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'var(--sheet-bg)', borderTop:'1px solid var(--border)', borderRadius:'20px 20px 0 0', padding:'20px 20px max(32px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.38s cubic-bezier(.16,1,.3,1)' }}>

        {/* Handle bar */}
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.13)', borderRadius:99, margin:'0 auto 22px' }} />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h2 style={{ color:'var(--text-primary)', fontSize:19, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Log Weight</h2>
            {current && <p style={{ color:'rgba(212,212,232,0.32)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>Last: <span style={{ color:'rgba(212,212,232,0.55)' }}>{current} lbs</span></p>}
          </div>
          <button onClick={onClose} style={{ background:'rgba(212,212,232,0.05)', border:'1px solid rgba(212,212,232,0.09)', borderRadius:99, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(212,212,232,0.4)' }}>{Ico.close(14)}</button>
        </div>

        {/* Big weight input */}
        <div style={{ textAlign:'center', marginBottom: delta !== null ? 10 : 24 }}>
          <div style={{
            display:'inline-flex', alignItems:'baseline', gap:10,
            background: hasVal ? 'rgba(10,8,22,0.9)' : 'var(--stat-bg)',
            border:`1.5px solid ${focused ? ringColor : hasVal ? ringColor : 'rgba(212,212,232,0.1)'}`,
            borderRadius:18, padding:'20px 32px',
            boxShadow: focused || hasVal ? ringGlow : 'none',
            transition:'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
          }}>
            <input
              type="number"
              value={weight}
              onChange={e => { setWeight(e.target.value); setError('') }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="185"
              autoFocus
              style={{ background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:52, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', width:130, textAlign:'center', letterSpacing:'-0.03em' }}
            />
            <span style={{ color: hasVal ? 'rgba(212,212,232,0.5)' : 'var(--text-muted)', fontSize:17, fontFamily:'Helvetica Neue,sans-serif', transition:'color 0.3s' }}>lbs</span>
          </div>
        </div>

        {/* Live delta */}
        <div style={{ textAlign:'center', height:28, marginBottom:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {delta !== null && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background: deltaPos ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', border:`1px solid ${deltaPos ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`, borderRadius:99, padding:'4px 12px', animation:'lwSavedScale 0.3s ease' }}>
              <span style={{ color: deltaPos ? '#f59e0b' : '#10b981', fontSize:12, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif' }}>
                {deltaPos ? '▲' : '▼'} {Math.abs(delta)} lbs {deltaPos ? 'gain' : 'lost'} vs last
              </span>
            </div>
          )}
        </div>

        {/* Note */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.28)', fontSize:9, letterSpacing:'0.24em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Note <span style={{ color:'rgba(212,212,232,0.14)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Morning weigh-in, post-workout…"
            style={{ width:'100%', background:'var(--stat-bg)', border:'1px solid rgba(212,212,232,0.09)', borderRadius:11, padding:'13px 15px', color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' }}
            onFocus={e => e.target.style.borderColor='rgba(212,212,232,0.22)'}
            onBlur={e => e.target.style.borderColor='rgba(212,212,232,0.09)'} />
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving || saved}
          style={{
            width:'100%', padding:'16px',
            background: saved ? 'rgba(16,185,129,0.18)' : hasVal ? 'rgba(180,188,204,0.18)' : 'rgba(180,188,204,0.07)',
            color: saved ? '#10b981' : hasVal ? '#d4d4e8' : 'rgba(212,212,232,0.28)',
            border:`1px solid ${saved ? 'rgba(16,185,129,0.45)' : hasVal ? 'rgba(180,188,204,0.38)' : 'rgba(212,212,232,0.09)'}`,
            borderRadius:12, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase',
            fontFamily:'Helvetica Neue,sans-serif', cursor: saving || saved || !hasVal ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all 0.3s cubic-bezier(.16,1,.3,1)',
            boxShadow: saved ? '0 0 20px rgba(16,185,129,0.2)' : hasVal ? '0 0 18px rgba(180,188,204,0.12)' : 'none',
          }}>
          {saved ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:'lwSavedScale 0.35s ease' }}>
              <polyline points="3,8 7,12 13,4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" style={{ animation:'lwTickIn 0.35s ease forwards' }}/>
            </svg>
          ) : saving ? 'Saving…' : <>{Ico.check()} Log Weight</>}
        </button>
      </div>
    </div>
  )
}

// ── Workout Card ───────────────────────────────────────────────────────────────
function WorkoutCard({ workout, delay, visible, onDelete }) {
  const [expanded,   setExpanded]   = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) { onDelete(workout.id); return }
    setConfirming(true); setTimeout(() => setConfirming(false), 2500)
  }

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:14, overflow:'hidden', opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(12px)', transition:`opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms` }}>
      {/* Header row */}
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{workout.label}</p>
            <span style={{ padding:'2px 8px', borderRadius:99, background:'rgba(212,212,232,0.07)', color:'rgba(212,212,232,0.45)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>{workout.type}</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{formatDate(workout.created_at?.split('T')[0])}</p>
            {workout.duration && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', display:'flex', alignItems:'center', gap:4 }}>{Ico.timer(11)} {workout.duration} min</p>}
            {workout.exercises?.length > 0 && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{workout.exercises.length} exercises</p>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {workout.exercises?.length > 0 && (
            <button onClick={() => setExpanded(e=>!e)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', transform: expanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
              {Ico.down()}
            </button>
          )}
          <button onClick={handleDelete}
            style={{ background: confirming?'rgba(255,60,60,0.1)':'rgba(212,212,232,0.04)', border:`1px solid ${confirming?'rgba(255,60,60,0.3)':'rgba(212,212,232,0.08)'}`, borderRadius:8, padding:'6px 9px', cursor:'pointer', color: confirming?'rgba(255,100,100,0.9)':'rgba(212,212,232,0.25)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.2s', display:'flex', alignItems:'center', gap:3 }}>
            {confirming ? 'Del?' : Ico.trash()}
          </button>
        </div>
      </div>

      {/* Exercises expand */}
      {expanded && workout.exercises?.length > 0 && (
        <div style={{ borderTop:'1px solid rgba(212,212,232,0.06)', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          {workout.exercises.map((ex, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'var(--bg-card)', borderRadius:9 }}>
              <div>
                <p style={{ color:'rgba(212,212,232,0.75)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{ex.name}</p>
                <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{ex.muscle_group}</p>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', textAlign:'right' }}>
                {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ''}
                {ex.weight ? ` @ ${ex.weight}lb` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Recovery Muscle Sheet ──────────────────────────────────────────────────────
function RecoveryMuscleSheet({ group, status, days, label, workouts, onClose, onLogWorkout, onSaveExercise }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])
  const close = () => { setVisible(false); setTimeout(onClose, 280) }

  const clr = status === 'fatigued' ? '#f87171' : status === 'recovering' ? '#f59e0b' : status === 'ready' ? '#10b981' : '#60a5fa'
  const bg  = status === 'fatigued' ? 'rgba(248,113,113,0.1)' : status === 'recovering' ? 'rgba(245,158,11,0.1)' : status === 'ready' ? 'rgba(16,185,129,0.1)' : 'rgba(96,165,250,0.08)'
  const br  = status === 'fatigued' ? 'rgba(248,113,113,0.25)' : status === 'recovering' ? 'rgba(245,158,11,0.25)' : status === 'ready' ? 'rgba(16,185,129,0.25)' : 'rgba(96,165,250,0.18)'
  const sub = days === null ? 'Not trained' : days === 0 ? 'Trained today' : days === 1 ? 'Yesterday' : `${days}d ago`

  const GROUP_EXERCISES_MAP = {
    'Chest':      ['Chest'],
    'Back':       ['Lats','Upper Back','Lower Back','Traps','Back'],
    'Shoulders':  ['Shoulders'],
    'Biceps':     ['Biceps','Forearms'],
    'Triceps':    ['Triceps'],
    'Core':       ['Core','Obliques'],
    'Quads':      ['Quads'],
    'Hamstrings': ['Hamstrings'],
    'Glutes':     ['Glutes'],
    'Calves':     ['Calves'],
  }
  const labels = GROUP_EXERCISES_MAP[group] || [group]
  const recentExercises = []
  ;(workouts||[]).forEach(w => {
    ;(w.exercises||[]).forEach(e => {
      if (labels.includes(e.muscle_group)) {
        recentExercises.push({ ...e, workoutDate: w.workout_date || w.created_at?.split('T')[0] })
      }
    })
  })
  const latest = recentExercises.slice(0, 8)

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', opacity:visible?1:0, transition:'opacity 0.28s ease' }} />
      <div style={{ position:'relative', background:'#16152a', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', transform: visible?'translateY(0)':'translateY(100%)', transition:'transform 0.32s cubic-bezier(.16,1,.3,1)', paddingBottom:32 }}>
        {/* Drag handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'rgba(212,212,232,0.18)' }} />
        </div>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px 16px' }}>
          <div>
            <p style={{ color:'rgba(212,212,232,0.9)', fontSize:17, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{group}</p>
            <p style={{ color:'rgba(212,212,232,0.4)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginTop:2 }}>{sub}</p>
          </div>
          <span style={{ color:clr, fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', background:bg, border:`1px solid ${br}`, borderRadius:7, padding:'4px 9px' }}>{label}</span>
        </div>
        {/* Recent exercises */}
        {latest.length > 0 && (
          <div style={{ padding:'0 20px 16px' }}>
            <p style={{ color:'rgba(212,212,232,0.38)', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:10 }}>Recent Exercises</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {latest.map((e, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,212,232,0.07)', borderRadius:10, padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ color:'rgba(212,212,232,0.82)', fontSize:13, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif' }}>{e.name || e.exercise_name}</p>
                    <p style={{ color:'rgba(212,212,232,0.3)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', marginTop:2 }}>
                      {e.sets && e.reps ? `${e.sets}×${e.reps}` : e.reps ? `${e.reps} reps` : ''}
                      {(e.weight || e.weight_lbs) ? ` · ${e.weight || e.weight_lbs} lbs` : ''}
                      {e.workoutDate ? ` · ${e.workoutDate}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Muscle map */}
        <div style={{ padding:'0 4px' }}>
          <MuscleMapView
            workouts={workouts}
            defaultSelected={group}
            onLogWorkout={onLogWorkout}
            onSaveExercise={onSaveExercise}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function FitnessTracker() {
  const todayStr = useToday()
  const haptic = useHaptic()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { logs: weightLogs, latest, addEntry: addWeightEntry } = useWeightLog()
  const { profile } = useProfile()
  const weightGoal = profile?.goal_weight || null

  const [visible,      setVisible]      = useState(false)
  const [workouts,     setWorkouts]     = useState([])
  const [showWorkout,   setShowWorkout]   = useState(false)
  const [showWeight,    setShowWeight]    = useState(false)
  const [activeTab,     setActiveTab]     = useState('recovery')
  const [quickLogMuscle,setQuickLogMuscle]= useState(null)
  const [recoveryMuscle,setRecoveryMuscle]= useState(null)
  const [loadingW,     setLoadingW]     = useState(false)
  const [chartRange,   setChartRange]   = useState('1M')
  const [historyOpen,     setHistoryOpen]     = useState(false)
const [prsOpen,         setPrsOpen]         = useState(true)
  const [showScanner,     setShowScanner]     = useState(false)
  const [prefillWorkout,  setPrefillWorkout]  = useState(null)
  const [sleepHrs,        setSleepHrs]        = useState(() => { try { return localStorage.getItem(`ax-sleep-${new Date().toISOString().split('T')[0]}`) || '' } catch { return '' } })
  const [soreness,        setSoreness]        = useState(() => { try { return parseInt(localStorage.getItem(`ax-soreness-${new Date().toISOString().split('T')[0]}`)) || 0 } catch { return 0 } })
  const todayWorkouts = (workouts || []).filter(w => (w.workout_date || w.created_at?.split('T')[0]) === todayStr)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  // Load workouts from Supabase
  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    setLoadingW(true)
    try {
      const { data: wData } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
      if (!wData?.length) { setWorkouts([]); return }

      const { data: exData } = await supabase
        .from('exercises')
        .select('*')
        .in('workout_id', wData.map(w => w.id))

      const byWorkout = {}
      ;(exData || []).forEach(e => {
        // normalise column names — schema uses exercise_name/weight_lbs, older rows may use name/weight
        const norm = {
          ...e,
          name:   e.name   ?? e.exercise_name ?? '',
          weight: e.weight ?? e.weight_lbs    ?? null,
        }
        if (!byWorkout[e.workout_id]) byWorkout[e.workout_id] = []
        byWorkout[e.workout_id].push(norm)
      })

      setWorkouts(wData.map(w => ({ ...w, exercises: byWorkout[w.id] || [] })))
    } catch(e) {
      console.error(e)
    } finally {
      setLoadingW(false)
    }
  }

  const handleSaveWorkout = async ({ workout, exercises }) => {
    haptic.success()
    const { data: wData, error: wErr } = await supabase
      .from('workouts')
      .insert({ label: workout.label, type: workout.type, duration_min: parseInt(workout.duration)||null, user_id: user.id, workout_date: todayStr })
      .select().single()
    if (wErr) throw wErr
    if (exercises.length > 0) {
      const exRows = exercises.filter(e=>e.name.trim()).map(e => ({
        workout_id:    wData.id,
        user_id:       user.id,
        exercise_name: e.name,
        sets:          parseInt(e.sets)||null,
        reps:          parseInt(e.reps)||null,
        weight_lbs:    parseFloat(e.weight)||null,
        muscle_group:  e.muscle_group,
      }))
      if (exRows.length > 0) {
        await supabase.from('exercises').insert(exRows)
      }
    }
    await loadWorkouts()
  }

  const handleDeleteWorkout = async (id) => {
    await supabase.from('workouts').delete().eq('id', id)
    setWorkouts(w => w.filter(x => x.id !== id))
  }

  const handleQuickLogExercise = async ({ name, sets, reps, weight, muscleLabel }) => {
    const { data: existing } = await supabase
      .from('workouts')
      .select('id')
      .eq('user_id', user.id)
      .eq('workout_date', todayStr)
      .order('created_at', { ascending: false })
      .limit(1)
    let workoutId = existing?.[0]?.id
    if (!workoutId) {
      const { data: newW } = await supabase
        .from('workouts')
        .insert({ label: 'Today\'s Session', type: 'Strength', user_id: user.id, workout_date: todayStr })
        .select().single()
      workoutId = newW.id
    }
    await supabase.from('exercises').insert({
      workout_id:    workoutId,
      user_id:       user.id,
      exercise_name: name,
      sets:          parseInt(sets) || null,
      reps:          parseInt(reps) || null,
      weight_lbs:    parseFloat(weight) || null,
      muscle_group:  muscleLabel || null,
    })
    await loadWorkouts()
  }

  const handleSaveWeight = async ({ weight_lbs, note, date }) => {
    haptic.bump()
    await addWeightEntry.mutateAsync({ weight_lbs, logged_date: date, note })
  }

  // Weight stats
  const sortedWeight = [...(weightLogs||[])].sort((a,b)=>new Date(a.logged_date||a.date)-new Date(b.logged_date||b.date))
  const prevWeight   = sortedWeight.length >= 2 ? sortedWeight[sortedWeight.length-2]?.weight_lbs : null
  const diff         = latest && prevWeight ? (parseFloat(latest) - parseFloat(prevWeight)).toFixed(1) : null
  const toGoal       = latest && weightGoal ? (parseFloat(latest) - parseFloat(weightGoal)).toFixed(1) : null

  const lowestEntry  = sortedWeight.length ? sortedWeight.reduce((mn,l) => parseFloat(l.weight_lbs) < parseFloat(mn.weight_lbs) ? l : mn) : null
  const lowestW      = lowestEntry ? parseFloat(lowestEntry.weight_lbs).toFixed(1) : null
  const lowestDate   = lowestEntry ? formatDate(lowestEntry.logged_date) : null
  const avg30        = (() => {
    const cut = new Date(Date.now() - 30*864e5)
    const recent = (weightLogs||[]).filter(l => new Date(l.logged_date) >= cut)
    if (!recent.length) return null
    return (recent.reduce((s,l) => s + parseFloat(l.weight_lbs), 0) / recent.length).toFixed(1)
  })()
  const netChange    = sortedWeight.length >= 2
    ? (parseFloat(sortedWeight[sortedWeight.length-1].weight_lbs) - parseFloat(sortedWeight[0].weight_lbs)).toFixed(1)
    : null
  const streak       = (() => {
    if (!(weightLogs||[]).length) return 0
    const dateSet = new Set(weightLogs.map(l => l.logged_date))
    let count = 0
    const d = new Date()
    if (!dateSet.has(d.toISOString().split('T')[0])) d.setDate(d.getDate()-1)
    while (dateSet.has(d.toISOString().split('T')[0])) { count++; d.setDate(d.getDate()-1) }
    return count
  })()
  const trendLbsWk   = (() => {
    const sl = [...sortedWeight].slice(-14)
    if (sl.length < 4) return null
    const n  = sl.length
    const xs = sl.map(l => (new Date(l.logged_date) - new Date(sl[0].logged_date)) / 864e5)
    const ys = sl.map(l => parseFloat(l.weight_lbs))
    const sx = xs.reduce((a,b)=>a+b,0), sy = ys.reduce((a,b)=>a+b,0)
    const sxy = xs.reduce((a,x,i)=>a+x*ys[i],0), sx2 = xs.reduce((a,x)=>a+x*x,0)
    const den = n*sx2 - sx*sx
    if (!den) return null
    return ((n*sxy-sx*sy)/den * 7).toFixed(1)
  })()
  const heightIn     = (profile?.height_ft||0)*12 + (profile?.height_in||0)
  const bmi          = heightIn > 0 && latest ? ((parseFloat(latest)*703)/(heightIn*heightIn)).toFixed(1) : null
  const bmiLabel     = !bmi ? '' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
  const bmiColor     = !bmi ? '' : bmi < 18.5 ? '#60a5fa' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444'

  // Weekly workout count
  const weekAgo      = new Date(); weekAgo.setDate(weekAgo.getDate()-7)
  const weeklyCount  = workouts.filter(w => new Date(w.created_at) >= weekAgo).length

  // ── Personal Records ──────────────────────────────────────────────────────
  const prs = useMemo(() => {
    const map = {}
    ;(workouts||[]).forEach(w => {
      const wDate = w.workout_date || w.created_at?.split('T')[0]
      ;(w.exercises||[]).forEach(e => {
        if (!e.name?.trim() || !e.weight) return
        const key = e.name.toLowerCase().trim()
        const wt  = parseFloat(e.weight)
        if (!map[key] || wt > map[key].weight) {
          map[key] = { name: e.name, weight: wt, reps: e.reps, sets: e.sets, muscle_group: e.muscle_group, date: wDate }
        }
      })
    })
    return Object.values(map).sort((a,b) => b.weight - a.weight)
  }, [workouts])

  // ── Muscle Readiness ──────────────────────────────────────────────────────
  const muscleReadiness = useMemo(() => {
    // Map display groups → all DB muscle_group labels that roll up to them
    const GROUP_MAP = {
      'Chest':      ['Chest'],
      'Back':       ['Lats','Upper Back','Lower Back','Traps'],
      'Shoulders':  ['Shoulders'],
      'Biceps':     ['Biceps','Forearms'],
      'Triceps':    ['Triceps'],
      'Core':       ['Core','Obliques'],
      'Quads':      ['Quads'],
      'Hamstrings': ['Hamstrings'],
      'Glutes':     ['Glutes'],
      'Calves':     ['Calves'],
    }
    // Use calendar-date strings to avoid UTC-midnight timezone drift
    const lastTrainedDate = {}
    ;(workouts||[]).forEach(w => {
      const wDateStr = w.workout_date || w.created_at?.split('T')[0]
      if (!wDateStr) return
      ;(w.exercises||[]).forEach(e => {
        if (!e.muscle_group) return
        if (!lastTrainedDate[e.muscle_group] || wDateStr > lastTrainedDate[e.muscle_group])
          lastTrainedDate[e.muscle_group] = wDateStr
      })
    })
    const msPerDay = 86_400_000
    const todayMs  = new Date(todayStr).getTime()
    return Object.entries(GROUP_MAP).map(([group, labels]) => {
      const best = labels.reduce((acc, lbl) => {
        const d = lastTrainedDate[lbl]; return d && (!acc || d > acc) ? d : acc
      }, null)
      if (!best) return { group, status: 'fresh', days: null, label: 'Fresh' }
      const days = Math.round((todayMs - new Date(best).getTime()) / msPerDay)
      const status = days === 0 ? 'fatigued' : days === 1 ? 'recovering' : days <= 3 ? 'ready' : 'fresh'
      const label  = days === 0 ? 'Fatigued'  : days === 1 ? 'Recovering'  : days <= 3 ? 'Ready'  : 'Fresh'
      return { group, status, days, label }
    })
  }, [workouts, todayStr])

  const anim = (d=0) => ({
    opacity: visible?1:0,
    transform: visible?'translateY(0)':'translateY(14px)',
    transition:`opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg-primary);overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(212,212,232,0.1);border-radius:99px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(212,212,232,0.2);}
        input:focus,textarea:focus{outline:none;}
        .ax-back:hover{background:rgba(212,212,232,0.08)!important;}
        .ax-add-btn:hover{background:rgba(212,212,232,0.88)!important;box-shadow:0 0 22px rgba(212,212,232,0.2)!important;}
        .ax-tab:hover{background:rgba(212,212,232,0.05)!important;}
        .ax-wt-btn:hover{border-color:rgba(212,212,232,0.25)!important;color:rgba(212,212,232,0.7)!important;} .ax-scan-btn:hover{border-color:rgba(201,168,76,0.7)!important;box-shadow:0 0 22px rgba(201,168,76,0.22)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom:90, position:'relative' }}>
        {/* Hero background image */}
        <div style={{
          position:'fixed', inset:0, zIndex:0,
          backgroundImage:`url(${GYM_IMG})`,
          backgroundSize:'cover', backgroundPosition:'center 25%',
          backgroundRepeat:'no-repeat',
          opacity:0.2,
          pointerEvents:'none',
          filter:'grayscale(100%) contrast(1.3) brightness(1.1)',
        }} />
        {/* Dark gradient overlay so content stays readable */}
        <div style={{
          position:'fixed', inset:0, zIndex:0,
          background:'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.3) 40%, rgba(8,8,8,0.75) 100%)',
          pointerEvents:'none',
        }} />

        {/* ── Sticky Header ── */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'var(--header-bg)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--border)', padding:'14px 16px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>AXIOS</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <h1 style={{ color:'#b4bccc', fontWeight:400, fontSize:18, fontFamily:"'The Seasons', serif", letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Training</h1>
                <img src={fitnessIconSrc} width={20} height={20} style={{ filter:'brightness(0) invert(1)', objectFit:'contain', opacity:0.72, display:'block' }} alt="" />
              </div>
            </div>
            <button onClick={() => setShowScanner(true)} className="ax-wt-btn"
              style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, transition:'all 0.2s' }}>
              {Ico.scan(14)} Scan Equipment
              <span style={{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:4, padding:'1px 6px', color:'var(--btn-bg)', fontSize:8, fontFamily:'Helvetica Neue,sans-serif', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase' }}>AI</span>
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ display:'flex', gap:10 }}>
            {[
              { label:'This Week', value: weeklyCount, sub:'workouts' },
              { label:'Total',     value: workouts.length, sub:'logged' },
              { label:'Weight',    value: latest ? `${latest}` : '—', sub:'lbs current' },
              { label:'To Goal',   value: toGoal ? `${toGoal > 0 ? '+' : ''}${toGoal}` : '—', sub:'lbs' },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ flex:1, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>{label}</p>
                <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, marginBottom:2 }}>{value}</p>
                <p style={{ color:'rgba(212,212,232,0.2)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:8, ...anim(80) }}>
            {[['recovery','Recovery'],['body','Fit Guide'],['weight','Weight Log']].map(([key,label]) => {
              const isActive = activeTab === key
              const isFitGuide = key === 'body'
              return (
                <button key={key} onClick={() => setActiveTab(key)} className="ax-tab"
                  style={{
                    flex: isFitGuide ? 1.15 : 1,
                    padding:'10px',
                    borderRadius:10,
                    border: isActive
                      ? '1px solid rgba(248,113,113,0.55)'
                      : isFitGuide
                      ? '1px solid rgba(212,212,232,0.14)'
                      : '1px solid rgba(212,212,232,0.06)',
                    background: isActive
                      ? 'rgba(248,113,113,0.12)'
                      : isFitGuide
                      ? 'rgba(212,212,232,0.05)'
                      : 'rgba(212,212,232,0.03)',
                    color: isActive ? '#f87171' : isFitGuide ? 'rgba(212,212,232,0.6)' : 'rgba(212,212,232,0.35)',
                    boxShadow: isActive ? '0 0 12px rgba(248,113,113,0.18)' : 'none',
                    fontSize:12, fontFamily:'Helvetica Neue,sans-serif',
                    fontWeight: isActive ? 700 : isFitGuide ? 600 : 400,
                    cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.04em',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          {/* ── Recovery Tab ── */}
          {activeTab === 'recovery' && (
            <div style={anim(140)}>


              {/* ── Muscle Readiness ── */}
              <SectionHead title="Muscle Readiness" sub="Based on recent sessions" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:18 }}>
                {muscleReadiness.map(({ group, status, days, label }) => {
                  const clr = status === 'fatigued' ? '#f87171' : status === 'recovering' ? '#f59e0b' : status === 'ready' ? '#10b981' : '#60a5fa'
                  const bg  = status === 'fatigued' ? 'rgba(248,113,113,0.07)' : status === 'recovering' ? 'rgba(245,158,11,0.07)' : status === 'ready' ? 'rgba(16,185,129,0.07)' : 'rgba(96,165,250,0.05)'
                  const br  = status === 'fatigued' ? 'rgba(248,113,113,0.22)' : status === 'recovering' ? 'rgba(245,158,11,0.22)' : status === 'ready' ? 'rgba(16,185,129,0.22)' : 'rgba(96,165,250,0.15)'
                  const sub = days === null ? 'Not trained' : days === 0 ? 'Trained today' : days === 1 ? 'Yesterday' : `${days}d ago`
                  return (
                    <div key={group} onClick={() => setRecoveryMuscle({ group, status, days, label })} style={{ background:bg, border:`1px solid ${br}`, borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', transition:'opacity 0.15s', overflow:'hidden' }}>
                      <img
                        src={MUSCLE_IMAGES[group]}
                        alt={group}
                        style={{ width:52, height:52, objectFit:'contain', objectPosition:'center', flexShrink:0, opacity:0.72, filter:'brightness(0.88) saturate(0.8)' }}
                      />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:'rgba(212,212,232,0.82)', fontSize:12, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{group}</p>
                        <p style={{ color:'rgba(212,212,232,0.28)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{sub}</p>
                        <span style={{ color:clr, fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', background:`${bg}`, border:`1px solid ${br}`, borderRadius:6, padding:'3px 7px' }}>{label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Daily Check-in ── */}
              <SectionHead title="Today's Check-in" sub={todayStr} />
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px', marginBottom:18 }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'rgba(212,212,232,0.32)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Sleep last night</p>
                    <div style={{ display:'flex', alignItems:'baseline', gap:6, background:'var(--stat-bg)', border:'1px solid rgba(212,212,232,0.09)', borderRadius:10, padding:'10px 12px' }}>
                      <input type="number" min="0" max="12" step="0.5" value={sleepHrs} placeholder="7"
                        onChange={e => { setSleepHrs(e.target.value); try { localStorage.setItem(`ax-sleep-${todayStr}`, e.target.value) } catch {} }}
                        style={{ background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', width:56, textAlign:'center' }} />
                      <span style={{ color:'var(--text-muted)', fontSize:12 }}>hrs</span>
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'rgba(212,212,232,0.32)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Soreness</p>
                    <div style={{ display:'flex', gap:6 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => { setSoreness(n); try { localStorage.setItem(`ax-soreness-${todayStr}`, n) } catch {} }}
                          style={{ flex:1, padding:'10px 0', borderRadius:9, border:`1px solid ${soreness >= n ? 'rgba(248,113,113,0.45)' : 'rgba(212,212,232,0.09)'}`, background: soreness >= n ? 'rgba(248,113,113,0.14)' : 'transparent', color: soreness >= n ? '#f87171' : 'rgba(212,212,232,0.25)', fontSize:13, cursor:'pointer', transition:'all 0.15s' }}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <p style={{ color:'rgba(212,212,232,0.2)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', marginTop:5, textAlign:'center' }}>
                      {soreness === 0 ? 'Rate 1–5' : soreness <= 2 ? 'Feeling good' : soreness === 3 ? 'Moderate' : soreness === 4 ? 'Pretty sore' : 'Very sore'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Personal Records (collapsible) ── */}
              <button onClick={() => setPrsOpen(o => !o)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom: prsOpen ? 12 : 18 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:2, height:14, background:'linear-gradient(to bottom,var(--accent-fitness),transparent)', borderRadius:2, boxShadow:'0 0 8px var(--accent-fitness)' }} />
                    <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>Fitness Logs</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{prs.length} lifts tracked</p>
                    <span style={{ color:'rgba(212,212,232,0.35)', fontSize:12, display:'inline-block', transform: prsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.25s cubic-bezier(.16,1,.3,1)' }}>▾</span>
                  </div>
                </div>
              </button>
              {prsOpen && (
                <div style={{ marginBottom:18 }}>
                  {prs.length === 0 ? (
                    <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:14, padding:'28px 20px', textAlign:'center' }}>
                      <p style={{ color:'rgba(212,212,232,0.35)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>Log workouts with weights to track PRs.</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {prs.map((pr) => (
                        <div key={pr.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'13px 15px' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ color:'rgba(212,212,232,0.82)', fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pr.name}</p>
                            <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', marginTop:2 }}>
                              {pr.muscle_group && <span>{pr.muscle_group} · </span>}
                              {pr.sets && pr.reps ? `${pr.sets}×${pr.reps}` : pr.reps ? `${pr.reps} reps` : ''}
                              {pr.date ? ` · ${formatDate(pr.date)}` : ''}
                            </p>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <p style={{ color:'#f87171', fontSize:20, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>
                              {pr.weight}<span style={{ fontSize:10, color:'rgba(212,212,232,0.35)', fontWeight:400, marginLeft:3 }}>lbs</span>
                            </p>
                            <p style={{ color:'rgba(248,113,113,0.45)', fontSize:9, letterSpacing:'0.12em', fontFamily:'Helvetica Neue,sans-serif', textTransform:'uppercase', marginTop:2 }}>PR</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ── Weight Tab ── */}
          {activeTab === 'weight' && (
            <div style={anim(140)}>

              {/* Headline: current weight + trend + streak */}
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ color:'rgba(212,212,232,0.32)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>CURRENT WEIGHT</p>
                    <p style={{ color:'var(--text-primary)', fontSize:42, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.03em' }}>
                      {latest || '—'}<span style={{ fontSize:14, fontWeight:400, color:'var(--text-muted)', marginLeft:5 }}>lbs</span>
                    </p>
                    {diff && (
                      <p style={{ color: parseFloat(diff) < 0 ? '#10b981' : '#f59e0b', fontSize:12, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginTop:6 }}>
                        {parseFloat(diff) < 0 ? '▼' : '▲'} {Math.abs(diff)} lbs since last log
                      </p>
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:7 }}>
                    {trendLbsWk !== null && (
                      <div style={{ background: parseFloat(trendLbsWk) <= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border:`1px solid ${parseFloat(trendLbsWk) <= 0 ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}`, borderRadius:8, padding:'5px 10px' }}>
                        <p style={{ color: parseFloat(trendLbsWk) <= 0 ? '#10b981' : '#f59e0b', fontSize:11, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', whiteSpace:'nowrap' }}>
                          {parseFloat(trendLbsWk) <= 0 ? '▼' : '▲'} {Math.abs(trendLbsWk)} lbs/wk
                        </p>
                      </div>
                    )}
                    {streak > 0 && (
                      <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.22)', borderRadius:8, padding:'5px 10px' }}>
                        <p style={{ color:'#f59e0b', fontSize:11, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>🔥 {streak}d streak</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Goal progress bar */}
              <GoalBar current={latest} goal={weightGoal} start={sortedWeight[0]?.weight_lbs} />

              {/* Chart */}
              <WeightChart logs={weightLogs} goal={weightGoal} range={chartRange} onRange={setChartRange} />

              {/* Stats grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
                  <p style={{ color:'rgba(212,212,232,0.28)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>BMI</p>
                  {bmi ? (
                    <>
                      <p style={{ color:'var(--text-primary)', fontSize:22, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, marginBottom:3 }}>{bmi}</p>
                      <p style={{ color:bmiColor, fontSize:10, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{bmiLabel}</p>
                    </>
                  ) : (
                    <p style={{ color:'rgba(212,212,232,0.2)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', marginTop:4 }}>Add height in profile</p>
                  )}
                </div>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
                  <p style={{ color:'rgba(212,212,232,0.28)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>LOWEST</p>
                  <p style={{ color:'#10b981', fontSize:22, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, marginBottom:3 }}>
                    {lowestW || '—'}<span style={{ fontSize:11, fontWeight:400, color:'rgba(212,212,232,0.35)', marginLeft:3 }}>lbs</span>
                  </p>
                  {lowestDate && <p style={{ color:'rgba(212,212,232,0.28)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>{lowestDate}</p>}
                </div>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
                  <p style={{ color:'rgba(212,212,232,0.28)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>30-DAY AVG</p>
                  <p style={{ color:'var(--text-secondary)', fontSize:22, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>
                    {avg30 || '—'}<span style={{ fontSize:11, fontWeight:400, color:'rgba(212,212,232,0.35)', marginLeft:3 }}>lbs</span>
                  </p>
                </div>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
                  <p style={{ color:'rgba(212,212,232,0.28)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>NET CHANGE</p>
                  {netChange !== null ? (
                    <>
                      <p style={{ color: parseFloat(netChange) < 0 ? '#10b981' : '#f59e0b', fontSize:22, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>
                        {parseFloat(netChange) > 0 ? '+' : ''}{netChange}<span style={{ fontSize:11, fontWeight:400, color:'rgba(212,212,232,0.35)', marginLeft:3 }}>lbs</span>
                      </p>
                      <p style={{ color:'rgba(212,212,232,0.28)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>since first log</p>
                    </>
                  ) : (
                    <p style={{ color:'rgba(212,212,232,0.2)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginTop:4 }}>—</p>
                  )}
                </div>
              </div>

              {/* Log button */}
              <button onClick={() => setShowWeight(true)}
                style={{ width:'100%', marginBottom:16, padding:'13px', borderRadius:10, background:'rgba(180,188,204,0.1)', border:'1px solid rgba(180,188,204,0.22)', color:'rgba(212,212,232,0.6)', fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(180,188,204,0.18)';e.currentTarget.style.color='rgba(212,212,232,0.85)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(180,188,204,0.1)';e.currentTarget.style.color='rgba(212,212,232,0.6)'}}>
                {Ico.plus(12)} Log Today's Weight
              </button>

              {/* Weight history — collapsible */}
              <button onClick={() => setHistoryOpen(o => !o)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', padding:0, marginBottom: historyOpen ? 12 : 0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:2, height:14, background:'linear-gradient(to bottom,var(--accent-fitness),transparent)', borderRadius:2, boxShadow:'0 0 8px var(--accent-fitness)' }} />
                    <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>Weight History</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{(weightLogs||[]).length} entries</p>
                    <span style={{ color:'rgba(212,212,232,0.35)', fontSize:12, display:'inline-block', transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.25s cubic-bezier(.16,1,.3,1)' }}>▾</span>
                  </div>
                </div>
              </button>
              <div style={{ overflow:'hidden', maxHeight: historyOpen ? 2000 : 0, transition:'max-height 0.4s cubic-bezier(.16,1,.3,1)', display:'flex', flexDirection:'column', gap:8 }}>
                {(weightLogs||[]).length === 0 ? (
                  <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:14, padding:'32px 20px', textAlign:'center' }}>
                    <p style={{ color:'rgba(212,212,232,0.2)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>No weight entries yet.</p>
                  </div>
                ) : (
                  [...(weightLogs||[])].sort((a,b)=>new Date(b.logged_date||b.date)-new Date(a.logged_date||a.date)).map((log, i, arr) => {
                    const prev = arr[i+1]
                    const delta = prev ? (parseFloat(log.weight_lbs) - parseFloat(prev.weight_lbs)).toFixed(1) : null
                    return (
                      <div key={log.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:11 }}>
                        <div>
                          <p style={{ color:'rgba(212,212,232,0.7)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{formatDate(log.logged_date||log.date)}</p>
                          {log.note && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{log.note}</p>}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif' }}>{log.weight_lbs}<span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:400, marginLeft:3 }}>lbs</span></p>
                          {delta && <p style={{ color: parseFloat(delta) < 0 ? '#10b981' : '#f59e0b', fontSize:10, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{parseFloat(delta) > 0 ? '+' : ''}{delta}</p>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'body' && (
            <div style={anim(80)}>
              <MuscleMapView
                workouts={workouts}
                onLogWorkout={muscle => setQuickLogMuscle(muscle)}
                onSaveExercise={handleQuickLogExercise}
              />
            </div>
          )}

        </div>
      </div>

      {showWorkout && <LogWorkoutSheet onSave={handleSaveWorkout} onClose={() => { setShowWorkout(false); setPrefillWorkout(null) }} prefillWorkout={prefillWorkout} />}
      {quickLogMuscle && <LogWorkoutSheet onSave={handleSaveWorkout} onClose={() => setQuickLogMuscle(null)} prefillMuscle={quickLogMuscle} />}
      {showScanner && <EquipmentScanner onClose={() => setShowScanner(false)} onStartWorkout={({ label, type, exercises }) => { setPrefillWorkout({ label, type, exercises }); setShowScanner(false); setShowWorkout(true) }} />}
      {showWeight  && <LogWeightSheet  onSave={handleSaveWeight}  onClose={() => setShowWeight(false)} current={latest} todayStr={todayStr} />}
      {recoveryMuscle && (
        <RecoveryMuscleSheet
          group={recoveryMuscle.group}
          status={recoveryMuscle.status}
          days={recoveryMuscle.days}
          label={recoveryMuscle.label}
          workouts={workouts}
          onClose={() => setRecoveryMuscle(null)}
          onLogWorkout={muscle => { setRecoveryMuscle(null); setQuickLogMuscle(muscle) }}
          onSaveExercise={handleQuickLogExercise}
        />
      )}

      <BottomNav />
    </>
  )
}

