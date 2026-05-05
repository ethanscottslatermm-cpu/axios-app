import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Full Body']

const TYPE_LABELS = {
  gym_machine: 'Machine',
  free_weight: 'Free Weight',
  cardio: 'Cardio',
  home: 'Home',
  improvised: 'Improvised',
}

const CONFIDENCE_COLORS = {
  high:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)'  },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
  low:    { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
}

function matchMuscleGroup(muscle) {
  const lower = (muscle || '').toLowerCase()
  return MUSCLE_GROUPS.find(g => lower.includes(g.toLowerCase())) || 'Full Body'
}

async function compressImage(file, maxPx = 1024, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg', preview: dataUrl })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  camera:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5l-1.5 2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3L14.5 4z"/><circle cx="12" cy="13" r="3"/></svg>,
  close:   (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  muscle:  (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2.5a2 2 0 0 1 0 4L12 8l2.5 7.5a2 2 0 1 1-3.8 1.3L9 12l-2.5 1.5a2 2 0 1 1-2-3.5L7 8.5 5.5 6a2 2 0 1 1 3.5-2L10.5 7l2-2a2 2 0 0 1 2-2.5z"/></svg>,
  steps:   (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M3 12h18M3 19h18"/></svg>,
  star:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  warn:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  play:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  save:    (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  yt:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>,
  scan:    (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  check:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  down:    (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  refresh: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EquipmentScanner({ onClose, onStartWorkout }) {
  const { user } = useAuth()
  const fileRef = useRef(null)

  const [visible,      setVisible]      = useState(false)
  const [phase,        setPhase]        = useState('idle')   // idle|loading|confirm|result
  const [imageBase64,  setImageBase64]  = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [mediaType,    setMediaType]    = useState('image/jpeg')
  const [result,       setResult]       = useState(null)
  const [confirmName,  setConfirmName]  = useState('')
  const [error,        setError]        = useState(null)
  const [tipsOpen,     setTipsOpen]     = useState(false)
  const [mistakesOpen, setMistakesOpen] = useState(false)
  const [logSaved,     setLogSaved]     = useState(false)
  const [logSaving,    setLogSaving]    = useState(false)

  // Animate in
  useState(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t) })

  const handleCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const { base64, mediaType: mt, preview } = await compressImage(file)
      setImageBase64(base64)
      setImagePreview(preview)
      setMediaType(mt)
      setLogSaved(false)
      await scanImage(base64, mt)
    } catch (err) {
      setError('Failed to read image. Please try again.')
      setPhase('idle')
    }
  }

  const scanImage = async (base64, mt, confirmContext = null) => {
    setPhase('loading')
    setError(null)
    try {
      const res = await fetch('/api/scan-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: mt, confirmName: confirmContext }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setResult(data)

      if (!data.identified || data.confidence === 'low') {
        setConfirmName(data.equipment_name || '')
        setPhase('confirm')
      } else {
        setPhase('result')
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
      setPhase('idle')
    }
  }

  const handleConfirmAnalyze = () => {
    if (!confirmName.trim()) return
    scanImage(imageBase64, mediaType, confirmName.trim())
  }

  const handleLogEquipment = async () => {
    if (!result || logSaved || logSaving) return
    setLogSaving(true)
    try {
      await supabase.from('user_equipment').insert({
        user_id:        user.id,
        equipment_name: result.equipment_name,
        equipment_type: result.equipment_type,
        scanned_at:     new Date().toISOString(),
      })
      setLogSaved(true)
    } catch (err) {
      console.error('Failed to log equipment:', err)
    } finally {
      setLogSaving(false)
    }
  }

  const handleStartWorkout = () => {
    if (!result?.suggested_workout) return
    const primaryMuscle = matchMuscleGroup(result.muscles_targeted?.[0])
    const prefillExercises = (result.suggested_workout.exercises || []).map(ex => ({
      name:         ex.name,
      sets:         String(ex.sets || 3),
      reps:         ex.reps || '10',
      weight:       '',
      muscle_group: primaryMuscle,
    }))
    onStartWorkout({
      label:     result.suggested_workout.name || `${result.equipment_name} Workout`,
      type:      'Strength',
      exercises: prefillExercises,
    })
  }

  const handleReset = () => {
    setPhase('idle')
    setImageBase64(null)
    setImagePreview(null)
    setResult(null)
    setConfirmName('')
    setError(null)
    setLogSaved(false)
    setTipsOpen(false)
    setMistakesOpen(false)
  }

  return (
    <>
      <style>{`
        .eq-scan-btn:hover { border-color: var(--btn-bg) !important; box-shadow: 0 0 22px rgba(201,168,76,0.25) !important; }
        .eq-action:hover   { opacity: 0.85 !important; }
        .eq-confirm-btn:hover { background: rgba(201,168,76,0.22) !important; }
        .eq-yt-btn:hover   { background: rgba(255,0,0,0.2) !important; }
        .eq-close:hover    { background: rgba(212,212,232,0.1) !important; }
        .eq-collapse:hover { background: rgba(212,212,232,0.04) !important; }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--overlay-bg)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{
          width: '100%', maxWidth: 520, margin: '0 auto',
          background: 'var(--sheet-bg)',
          borderTop: '1px solid var(--border)',
          borderRadius: '18px 18px 0 0',
          padding: '20px 18px max(28px,env(safe-area-inset-bottom))',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)',
          maxHeight: '92vh', overflowY: 'auto',
        }}>

          {/* Handle */}
          <div style={{ width: 36, height: 4, background: 'rgba(212,212,232,0.13)', borderRadius: 99, margin: '0 auto 20px' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 3 }}>
                {phase === 'idle' ? 'Fitness Tracker' : phase === 'loading' ? 'Analyzing...' : phase === 'confirm' ? 'Confirm Equipment' : 'Scan Result'}
              </p>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em' }}>
                {phase === 'idle'    ? 'Equipment Scanner'  :
                 phase === 'loading' ? 'Reading Equipment'  :
                 phase === 'confirm' ? 'Is This Right?'     :
                 result?.equipment_name || 'Equipment Found'}
              </h2>
            </div>
            <button onClick={onClose} className="eq-close"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)', transition:'background 0.15s', flexShrink:0 }}>
              {Ic.close(16)}
            </button>
          </div>

          {/* ── Idle Phase ─────────────────────────────────────────────── */}
          {phase === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(201,168,76,0.07)',
                border: '1.5px solid rgba(201,168,76,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 0 40px rgba(201,168,76,0.12)',
              }}>
                {Ic.camera(34)}
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8, textAlign: 'center' }}>
                Identify Any Equipment
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: "'EB Garamond',serif", fontStyle: 'italic', textAlign: 'center', lineHeight: 1.6, marginBottom: 32, maxWidth: 260 }}>
                Point your camera at gym machines, free weights, home equipment, or anything you can work out with.
              </p>

              {error && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, width: '100%', textAlign: 'center' }}>
                  <p style={{ color: '#f87171', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>{error}</p>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                onChange={handleCapture} style={{ display: 'none' }} />

              <button onClick={() => fileRef.current?.click()} className="eq-scan-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '15px 36px', borderRadius: 12,
                  background: 'rgba(201,168,76,0.08)',
                  border: '1.5px solid rgba(201,168,76,0.4)',
                  color: 'var(--btn-bg)',
                  cursor: 'pointer', fontSize: 13,
                  fontFamily: 'Helvetica Neue,sans-serif',
                  fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 18px rgba(201,168,76,0.1)',
                }}>
                {Ic.camera(16)} Scan Equipment
              </button>

              <p style={{ color: 'rgba(212,212,232,0.2)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 14, textAlign: 'center' }}>
                Works with gym machines, free weights, bands, and more
              </p>
            </div>
          )}

          {/* ── Loading Phase ───────────────────────────────────────────── */}
          {phase === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingBottom: 12 }}>
              {imagePreview && (
                <div style={{ width: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                  <img src={imagePreview} alt="Captured equipment"
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block', filter: 'brightness(0.6)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <LoadingSpinner />
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>
                      Analyzing equipment...
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: "'EB Garamond',serif", fontStyle: 'italic' }}>
                      Identifying muscles, form cues &amp; workouts
                    </p>
                  </div>
                </div>
              )}
              {!imagePreview && (
                <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <LoadingSpinner />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif' }}>Analyzing equipment...</p>
                </div>
              )}
            </div>
          )}

          {/* ── Confirm Phase ───────────────────────────────────────────── */}
          {phase === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
              {imagePreview && (
                <div style={{ width: '100%', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={imagePreview} alt="Captured equipment"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  {Ic.warn(14)}
                  <p style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '0.08em' }}>
                    LOW CONFIDENCE
                  </p>
                </div>
                <p style={{ color: 'rgba(212,212,232,0.6)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.5 }}>
                  Best guess shown below. Edit if needed, then confirm for a full analysis.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', color: 'rgba(212,212,232,0.32)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8 }}>
                  Equipment Name
                </label>
                <div style={{ background: 'var(--stat-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                  <input
                    type="text"
                    value={confirmName}
                    onChange={e => setConfirmName(e.target.value)}
                    placeholder="e.g. Lat Pulldown Machine"
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 15, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleReset}
                  style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  Try Again
                </button>
                <button onClick={handleConfirmAnalyze} disabled={!confirmName.trim()} className="eq-confirm-btn"
                  style={{
                    flex: 2, padding: '13px',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.4)',
                    borderRadius: 10, color: 'var(--btn-bg)',
                    fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif',
                    fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: confirmName.trim() ? 'pointer' : 'not-allowed',
                    opacity: confirmName.trim() ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}>
                  Confirm &amp; Analyze
                </button>
              </div>
            </div>
          )}

          {/* ── Result Phase ────────────────────────────────────────────── */}
          {phase === 'result' && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>

              {/* Equipment identity card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.1, marginBottom: 8 }}>
                      {result.equipment_name}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.equipment_type && (
                        <span style={{ background: 'rgba(180,188,204,0.1)', border: '1px solid rgba(180,188,204,0.2)', borderRadius: 6, padding: '3px 9px', color: '#b4bccc', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {TYPE_LABELS[result.equipment_type] || result.equipment_type}
                        </span>
                      )}
                      {result.confidence && CONFIDENCE_COLORS[result.confidence] && (
                        <span style={{
                          background: CONFIDENCE_COLORS[result.confidence].bg,
                          border: `1px solid ${CONFIDENCE_COLORS[result.confidence].border}`,
                          borderRadius: 6, padding: '3px 9px',
                          color: CONFIDENCE_COLORS[result.confidence].color,
                          fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif',
                          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                          {result.confidence} confidence
                        </span>
                      )}
                    </div>
                  </div>
                  {imagePreview && (
                    <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                </div>
                {result.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: "'EB Garamond',serif", fontStyle: 'italic', lineHeight: 1.55, marginTop: 10 }}>
                    {result.description}
                  </p>
                )}
              </div>

              {/* Muscles targeted */}
              {result.muscles_targeted?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                  <SectionLabel icon={Ic.muscle(14)} label="Muscles Targeted" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                    {result.muscles_targeted.map((muscle, i) => (
                      <span key={muscle} style={{
                        padding: '5px 12px', borderRadius: 99,
                        background: i === 0 ? 'rgba(248,113,113,0.12)' : 'rgba(212,212,232,0.06)',
                        border: `1px solid ${i === 0 ? 'rgba(248,113,113,0.3)' : 'rgba(212,212,232,0.1)'}`,
                        color: i === 0 ? '#f87171' : 'rgba(212,212,232,0.55)',
                        fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: i === 0 ? 700 : 400,
                      }}>
                        {muscle}{i === 0 ? ' · Primary' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* How to use */}
              {result.how_to_use?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                  <SectionLabel icon={Ic.steps(14)} label="How to Use" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    {result.how_to_use.map((item) => (
                      <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{
                          flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#f87171', fontSize: 10, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif',
                        }}>
                          {item.step}
                        </span>
                        <p style={{ color: 'rgba(212,212,232,0.75)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.55, paddingTop: 2 }}>
                          {item.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro tips + common mistakes (collapsible) */}
              {(result.pro_tips?.length > 0 || result.common_mistakes?.length > 0) && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  <button onClick={() => setTipsOpen(o => !o)} className="eq-collapse"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.15s' }}>
                    <SectionLabel icon={Ic.star(14)} label="Pro Tips & Mistakes" noMargin />
                    <span style={{ color: 'rgba(212,212,232,0.35)', display: 'inline-block', transform: tipsOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s cubic-bezier(.16,1,.3,1)' }}>
                      {Ic.down(13)}
                    </span>
                  </button>
                  <div style={{ overflow: 'hidden', maxHeight: tipsOpen ? 800 : 0, transition: 'max-height 0.35s cubic-bezier(.16,1,.3,1)' }}>
                    <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {result.pro_tips?.length > 0 && (
                        <div>
                          <p style={{ color: '#10b981', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 8 }}>Pro Tips</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {result.pro_tips.map((tip, i) => (
                              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                                <span style={{ color: '#10b981', marginTop: 3, flexShrink: 0 }}>{Ic.check(12)}</span>
                                <p style={{ color: 'rgba(212,212,232,0.65)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.5 }}>{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.common_mistakes?.length > 0 && (
                        <div>
                          <p style={{ color: '#f87171', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 8 }}>Common Mistakes</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {result.common_mistakes.map((m, i) => (
                              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                                <span style={{ color: '#f87171', marginTop: 2, flexShrink: 0 }}>{Ic.warn(12)}</span>
                                <p style={{ color: 'rgba(212,212,232,0.65)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.5 }}>{m}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested workout */}
              {result.suggested_workout && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <SectionLabel icon={Ic.play(14)} label="Suggested Workout" noMargin />
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: "'EB Garamond',serif", fontStyle: 'italic' }}>
                      {result.suggested_workout.name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(result.suggested_workout.exercises || []).map((ex, i) => (
                      <div key={i} style={{ background: 'var(--stat-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 13px' }}>
                        <p style={{ color: 'rgba(212,212,232,0.85)', fontSize: 13, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>{ex.name}</p>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: ex.instructions ? 6 : 0 }}>
                          {[['Sets', ex.sets], ['Reps', ex.reps], ['Rest', ex.rest]].map(([lbl, val]) => val && (
                            <div key={lbl}>
                              <p style={{ color: 'rgba(212,212,232,0.25)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 2 }}>{lbl}</p>
                              <p style={{ color: 'rgba(212,212,232,0.7)', fontSize: 12, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif' }}>{val}</p>
                            </div>
                          ))}
                        </div>
                        {ex.instructions && (
                          <p style={{ color: 'rgba(212,212,232,0.35)', fontSize: 11, fontFamily: "'EB Garamond',serif", fontStyle: 'italic', lineHeight: 1.4 }}>{ex.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube */}
              {result.youtube_search_query && (
                <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(result.youtube_search_query)}`, '_blank')}
                  className="eq-yt-btn"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    padding: '12px', borderRadius: 11,
                    background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)',
                    color: '#ff4444', cursor: 'pointer',
                    fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif',
                    fontWeight: 700, letterSpacing: '0.06em',
                    transition: 'all 0.2s',
                  }}>
                  {Ic.yt(14)} Watch Form Tutorial on YouTube
                </button>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={handleLogEquipment} disabled={logSaved || logSaving} className="eq-action"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '12px 10px', borderRadius: 10,
                    background: logSaved ? 'rgba(16,185,129,0.12)' : 'rgba(212,212,232,0.06)',
                    border: `1px solid ${logSaved ? 'rgba(16,185,129,0.3)' : 'rgba(212,212,232,0.12)'}`,
                    color: logSaved ? '#10b981' : 'rgba(212,212,232,0.55)',
                    cursor: logSaved ? 'default' : 'pointer',
                    fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif',
                    fontWeight: 600, transition: 'all 0.2s',
                    opacity: logSaving ? 0.6 : 1,
                  }}>
                  {logSaved ? <>{Ic.check(13)} Logged</> : <>{Ic.save(13)} {logSaving ? 'Saving...' : 'Log Equipment'}</>}
                </button>

                {result.suggested_workout && (
                  <button onClick={handleStartWorkout} className="eq-action"
                    style={{
                      flex: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      padding: '12px 10px', borderRadius: 10,
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.35)',
                      color: 'var(--btn-bg)',
                      cursor: 'pointer',
                      fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif',
                      fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                      transition: 'all 0.2s',
                    }}>
                    {Ic.play(12)} Start Workout
                  </button>
                )}

                <button onClick={handleReset} className="eq-action"
                  style={{
                    width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 10, background: 'rgba(212,212,232,0.05)',
                    border: '1px solid rgba(212,212,232,0.1)',
                    color: 'rgba(212,212,232,0.4)', cursor: 'pointer',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}>
                  {Ic.refresh(15)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ icon, label, noMargin }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: noMargin ? 0 : 0 }}>
      <span style={{ color: 'var(--btn-bg)', opacity: 0.8 }}>{icon}</span>
      <p style={{ color: 'rgba(212,212,232,0.45)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700 }}>
        {label}
      </p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ position: 'relative', width: 40, height: 40 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation: 'spin 1s linear infinite' }}>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="2.5" />
        <path d="M20 4 A16 16 0 0 1 36 20" fill="none" stroke="var(--btn-bg)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
