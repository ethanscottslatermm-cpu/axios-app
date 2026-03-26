import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeightLog } from '../../hooks/useWeightLog'
import { BottomNav } from '../../pages/Dashboard'
import { supabase } from '../../lib/supabase'

// ── Date ───────────────────────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0]

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
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(ds) {
  if (!ds) return ''
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function GlowBar({ pct, h=3 }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:'#fff', borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1)', boxShadow:'0 0 8px rgba(255,255,255,0.5)' }} />
    </div>
  )
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:'linear-gradient(to bottom,rgba(255,255,255,0.8),rgba(255,255,255,0.1))', borderRadius:2, boxShadow:'0 0 6px rgba(255,255,255,0.5)' }} />
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {sub && <p style={{ color:'rgba(255,255,255,0.22)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>}
    </div>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'18px 16px', ...style }}>
      {children}
    </div>
  )
}

// ── Reusable Input Field (must be top-level to avoid focus-reset bug) ─────────
function InputField({ label, value, onChange, type='text', placeholder='' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:7 }}>{label}</label>}
      <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${focused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.09)'}`, borderRadius:10, padding:'12px 14px', transition:'border-color 0.2s' }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }} />
      </div>
    </div>
  )
}

// ── Log Workout Sheet ──────────────────────────────────────────────────────────
function LogWorkoutSheet({ onSave, onClose }) {
  const [visible,  setVisible]  = useState(false)
  const [step,     setStep]     = useState('workout') // 'workout' | 'exercises'
  const [workout,  setWorkout]  = useState({ label:'', type:'Strength', duration:'' })
  const [exercises,setExercises]= useState([])
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
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'#0d0d0d', borderTop:'1px solid rgba(255,255,255,0.1)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(28px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)', maxHeight:'92vh', overflowY:'auto' }}>

        {/* Handle */}
        <div style={{ width:36, height:4, background:'rgba(255,255,255,0.13)', borderRadius:99, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{step === 'workout' ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
            <h2 style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>{step === 'workout' ? 'Workout Details' : 'Add Exercises'}</h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {step === 'workout' && (
          <>
            <InputField label="Workout Name" value={workout.label} onChange={v => setWorkout(w=>({...w,label:v}))} placeholder="e.g. Push Day, Morning Run" />

            {/* Type selector */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Type</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {WORKOUT_TYPES.map(t => (
                  <button key={t} onClick={() => setWorkout(w=>({...w,type:t}))}
                    style={{ padding:'7px 14px', borderRadius:99, border:`1px solid ${workout.type===t ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.09)'}`, background: workout.type===t ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)', color: workout.type===t ? '#fff' : 'rgba(255,255,255,0.38)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight: workout.type===t ? 700 : 400, cursor:'pointer', transition:'all 0.18s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <InputField label="Duration (minutes)" value={workout.duration} onChange={v => setWorkout(w=>({...w,duration:v}))} type="number" placeholder="45" />

            <button onClick={() => setStep('exercises')}
              style={{ width:'100%', padding:'14px', background:'#fff', color:'#080808', border:'none', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', marginTop:8, transition:'background 0.2s' }}>
              Next → Add Exercises
            </button>
          </>
        )}

        {step === 'exercises' && (
          <>
            {exercises.length === 0 && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:12, padding:'24px', textAlign:'center', marginBottom:16 }}>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic', marginBottom:12 }}>No exercises added yet.</p>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:14 }}>
              {exercises.map((ex, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>Exercise {i+1}</p>
                    <button onClick={() => removeEx(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.25)' }}>{Ico.trash()}</button>
                  </div>
                  {/* Name */}
                  <div style={{ marginBottom:10 }}>
                    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:9, padding:'11px 13px' }}>
                      <input value={ex.name} onChange={e => setEx(i,'name',e.target.value)} placeholder="Exercise name" style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }} />
                    </div>
                  </div>
                  {/* Sets / Reps / Weight */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                    {[['Sets','sets'],['Reps','reps'],['Weight (lbs)','weight']].map(([lbl,key]) => (
                      <div key={key}>
                        <p style={{ color:'rgba(255,255,255,0.28)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{lbl}</p>
                        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:9, padding:'10px 11px' }}>
                          <input type="number" value={ex[key]} onChange={e => setEx(i,key,e.target.value)} placeholder="0" style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Muscle group */}
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {MUSCLE_GROUPS.map(m => (
                      <button key={m} onClick={() => setEx(i,'muscle_group',m)}
                        style={{ padding:'4px 10px', borderRadius:99, border:`1px solid ${ex.muscle_group===m ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`, background: ex.muscle_group===m ? 'rgba(255,255,255,0.1)' : 'transparent', color: ex.muscle_group===m ? '#fff' : 'rgba(255,255,255,0.28)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', transition:'all 0.15s' }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addExercise}
              style={{ width:'100%', padding:'12px', background:'transparent', border:'1px dashed rgba(255,255,255,0.15)', borderRadius:10, color:'rgba(255,255,255,0.4)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:14, letterSpacing:'0.08em' }}>
              {Ico.plus(13)} Add Exercise
            </button>

            {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12 }}>{error}</p>}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setStep('workout')}
                style={{ flex:1, padding:'13px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'rgba(255,255,255,0.4)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                ← Back
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:2, padding:'13px', background:'#fff', color:'#080808', border:'none', borderRadius:10, fontSize:12, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'background 0.2s' }}>
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
function LogWeightSheet({ onSave, onClose, current }) {
  const [weight,  setWeight]  = useState('')
  const [note,    setNote]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const handleSave = async () => {
    if (!weight || isNaN(weight)) { setError('Please enter a valid weight.'); return }
    setError(''); setSaving(true)
    try {
      await onSave({ weight_lbs: parseFloat(weight), note: note.trim(), date: todayStr })
      onClose()
    } catch(e) {
      setError(e.message || 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'#0d0d0d', borderTop:'1px solid rgba(255,255,255,0.1)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(28px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ width:36, height:4, background:'rgba(255,255,255,0.13)', borderRadius:99, margin:'0 auto 20px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <h2 style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>Log Weight</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {current && <p style={{ color:'rgba(255,255,255,0.28)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', marginBottom:18 }}>Last logged: <span style={{ color:'rgba(255,255,255,0.6)' }}>{current} lbs</span></p>}

        {/* Big weight input */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ display:'inline-flex', alignItems:'baseline', gap:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'18px 28px' }}>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="185"
              style={{ background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:42, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', width:120, textAlign:'center' }} />
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:16, fontFamily:'Helvetica Neue,sans-serif' }}>lbs</span>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:7 }}>Note <span style={{ color:'rgba(255,255,255,0.18)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Morning weigh-in, post-workout…"
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', outline:'none' }}
            onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
            onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.09)'} />
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', padding:'15px', background:'#fff', color:'#080808', border:'none', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'background 0.2s' }}>
          {saving ? 'Saving…' : <>{Ico.check()} Log Weight</>}
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
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, overflow:'hidden', opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(12px)', transition:`opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms` }}>
      {/* Header row */}
      <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <p style={{ color:'#fff', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{workout.label}</p>
            <span style={{ padding:'2px 8px', borderRadius:99, background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.45)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>{workout.type}</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{formatDate(workout.created_at?.split('T')[0])}</p>
            {workout.duration && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', display:'flex', alignItems:'center', gap:4 }}>{Ico.timer(11)} {workout.duration} min</p>}
            {workout.exercises?.length > 0 && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{workout.exercises.length} exercises</p>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {workout.exercises?.length > 0 && (
            <button onClick={() => setExpanded(e=>!e)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', display:'flex', transform: expanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>
              {Ico.down()}
            </button>
          )}
          <button onClick={handleDelete}
            style={{ background: confirming?'rgba(255,60,60,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${confirming?'rgba(255,60,60,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:8, padding:'6px 9px', cursor:'pointer', color: confirming?'rgba(255,100,100,0.9)':'rgba(255,255,255,0.25)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.2s', display:'flex', alignItems:'center', gap:3 }}>
            {confirming ? 'Del?' : Ico.trash()}
          </button>
        </div>
      </div>

      {/* Exercises expand */}
      {expanded && workout.exercises?.length > 0 && (
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          {workout.exercises.map((ex, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'rgba(255,255,255,0.02)', borderRadius:9 }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{ex.name}</p>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{ex.muscle_group}</p>
              </div>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', textAlign:'right' }}>
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

// ── Mini Sparkline ─────────────────────────────────────────────────────────────
function WeightSparkline({ logs }) {
  if (!logs || logs.length < 2) return null
  const sorted = [...logs].sort((a,b) => new Date(a.date)-new Date(b.date)).slice(-10)
  const vals   = sorted.map(l => parseFloat(l.weight_lbs || l.weight))
  const min    = Math.min(...vals) - 1
  const max    = Math.max(...vals) + 1
  const W = 200, H = 48
  const pts = vals.map((v,i) => `${(i/(vals.length-1))*W},${H - ((v-min)/(max-min))*H}`)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
      <polyline points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((pt,i) => {
        const [x,y] = pt.split(',')
        return <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(255,255,255,0.8)" />
      })}
    </svg>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function FitnessTracker() {
  const navigate = useNavigate()
  const { logs: weightLogs, latest, goal: weightGoal, addLog: addWeight } = useWeightLog()

  const [visible,      setVisible]      = useState(false)
  const [workouts,     setWorkouts]     = useState([])
  const [showWorkout,  setShowWorkout]  = useState(false)
  const [showWeight,   setShowWeight]   = useState(false)
  const [activeTab,    setActiveTab]    = useState('workouts') // 'workouts' | 'weight'
  const [loadingW,     setLoadingW]     = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  // Load workouts from Supabase
  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    setLoadingW(true)
    try {
      const { data } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .order('created_at', { ascending: false })
        .limit(30)
      setWorkouts(data || [])
    } catch(e) {
      console.error(e)
    } finally {
      setLoadingW(false)
    }
  }

  const handleSaveWorkout = async ({ workout, exercises }) => {
    const { data: wData, error: wErr } = await supabase
      .from('workouts')
      .insert({ label: workout.label, type: workout.type, duration: parseInt(workout.duration)||null })
      .select().single()
    if (wErr) throw wErr
    if (exercises.length > 0) {
      const exRows = exercises.filter(e=>e.name.trim()).map(e => ({
        workout_id:   wData.id,
        name:         e.name,
        sets:         parseInt(e.sets)||null,
        reps:         parseInt(e.reps)||null,
        weight:       parseFloat(e.weight)||null,
        muscle_group: e.muscle_group,
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

  const handleSaveWeight = async ({ weight_lbs, note, date }) => {
    await addWeight({ weight: weight_lbs, note, date })
  }

  // Weight stats
  const sortedWeight = [...(weightLogs||[])].sort((a,b)=>new Date(a.date)-new Date(b.date))
  const prevWeight   = sortedWeight.length >= 2 ? sortedWeight[sortedWeight.length-2]?.weight : null
  const diff         = latest && prevWeight ? (parseFloat(latest) - parseFloat(prevWeight)).toFixed(1) : null
  const toGoal       = latest && weightGoal ? (parseFloat(latest) - parseFloat(weightGoal)).toFixed(1) : null

  // Weekly workout count
  const weekAgo      = new Date(); weekAgo.setDate(weekAgo.getDate()-7)
  const weeklyCount  = workouts.filter(w => new Date(w.created_at) >= weekAgo).length

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
        body{background:#080808;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input:focus,textarea:focus{outline:none;}
        .ax-back:hover{background:rgba(255,255,255,0.08)!important;}
        .ax-add-btn:hover{background:rgba(255,255,255,0.88)!important;box-shadow:0 0 22px rgba(255,255,255,0.2)!important;}
        .ax-tab:hover{background:rgba(255,255,255,0.05)!important;}
        .ax-wt-btn:hover{border-color:rgba(255,255,255,0.25)!important;color:rgba(255,255,255,0.7)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#080808', WebkitFontSmoothing:'antialiased', paddingBottom:90 }}>

        {/* ── Sticky Header ── */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,8,8,0.93)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 16px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>AXIOS</p>
              <h1 style={{ color:'#fff', fontWeight:900, fontSize:20, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Fitness</h1>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowWeight(true)} className="ax-wt-btn"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, transition:'all 0.2s' }}>
                {Ico.scale(14)} Weight
              </button>
              <button onClick={() => setShowWorkout(true)} className="ax-add-btn"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 14px', borderRadius:9, background:'#fff', color:'#080808', border:'none', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.2s' }}>
                {Ico.plus(13)} Log
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display:'flex', gap:10 }}>
            {[
              { label:'This Week', value: weeklyCount, sub:'workouts' },
              { label:'Total',     value: workouts.length, sub:'logged' },
              { label:'Weight',    value: latest ? `${latest}` : '—', sub:'lbs current' },
              { label:'To Goal',   value: toGoal ? `${toGoal > 0 ? '+' : ''}${toGoal}` : '—', sub:'lbs' },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>{label}</p>
                <p style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, marginBottom:2 }}>{value}</p>
                <p style={{ color:'rgba(255,255,255,0.2)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto' }}>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:8, ...anim(80) }}>
            {[['workouts','Workouts'],['weight','Weight Log']].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className="ax-tab"
                style={{ flex:1, padding:'10px', borderRadius:10, border:`1px solid ${activeTab===key ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, background: activeTab===key ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: activeTab===key ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight: activeTab===key ? 700 : 400, cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.04em' }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Workouts Tab ── */}
          {activeTab === 'workouts' && (
            <div style={anim(140)}>
              <SectionHead title="Workout History" sub={`${workouts.length} logged`} />

              {loadingW && <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'24px 0', fontStyle:'italic' }}>Loading…</p>}

              {!loadingW && workouts.length === 0 && (
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:14, padding:'40px 20px', textAlign:'center' }}>
                  <div style={{ color:'rgba(255,255,255,0.15)', marginBottom:12, display:'flex', justifyContent:'center' }}>{Ico.dumbbell(32)}</div>
                  <p style={{ color:'rgba(255,255,255,0.25)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7, marginBottom:16 }}>No workouts logged yet.<br/>Start with today's session.</p>
                  <button onClick={() => setShowWorkout(true)}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                    {Ico.plus(12)} Log first workout
                  </button>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {workouts.map((w, i) => (
                  <WorkoutCard key={w.id} workout={w} delay={i*40} visible={visible} onDelete={handleDeleteWorkout} />
                ))}
              </div>
            </div>
          )}

          {/* ── Weight Tab ── */}
          {activeTab === 'weight' && (
            <div style={anim(140)}>

              {/* Weight summary card */}
              <Card style={{ marginBottom:14 }}>
                <SectionHead title="Body Weight" />
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Current</p>
                    <p style={{ color:'#fff', fontSize:38, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.02em' }}>
                      {latest || '—'}<span style={{ fontSize:14, color:'rgba(255,255,255,0.35)', fontWeight:400, marginLeft:4 }}>lbs</span>
                    </p>
                    {diff && (
                      <p style={{ color: parseFloat(diff) < 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:4 }}>
                        {parseFloat(diff) < 0 ? '▼' : '▲'} {Math.abs(diff)} lbs from last entry
                      </p>
                    )}
                  </div>
                  <WeightSparkline logs={weightLogs} />
                </div>

                {weightGoal && latest && (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>Goal: {weightGoal} lbs</p>
                      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{toGoal > 0 ? `${toGoal} lbs to go` : 'Goal reached!'}</p>
                    </div>
                    <GlowBar pct={Math.min(100, (1 - Math.max(0,parseFloat(latest)-parseFloat(weightGoal)) / (parseFloat(latest)-parseFloat(weightGoal)+1))*100)} />
                  </>
                )}

                <button onClick={() => setShowWeight(true)}
                  style={{ width:'100%', marginTop:14, padding:'11px', borderRadius:9, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.4)'}}>
                  + Log Today's Weight
                </button>
              </Card>

              {/* Weight history */}
              <SectionHead title="Weight History" sub={`${(weightLogs||[]).length} entries`} />
              {(weightLogs||[]).length === 0 && (
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:14, padding:'32px 20px', textAlign:'center' }}>
                  <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>No weight entries yet.</p>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[...(weightLogs||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((log, i) => (
                  <div key={log.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:11, opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(8px)', transition:`opacity 0.4s ease ${i*35}ms, transform 0.4s ease ${i*35}ms` }}>
                    <div>
                      <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{formatDate(log.date)}</p>
                      {log.note && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{log.note}</p>}
                    </div>
                    <p style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif' }}>{log.weight_lbs || log.weight} <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>lbs</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {showWorkout && <LogWorkoutSheet onSave={handleSaveWorkout} onClose={() => setShowWorkout(false)} />}
      {showWeight  && <LogWeightSheet  onSave={handleSaveWeight}  onClose={() => setShowWeight(false)} current={latest} />}

      <BottomNav />
    </>
  )
}

