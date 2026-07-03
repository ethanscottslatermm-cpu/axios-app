import { useState } from 'react'

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Strength', 'Increase Endurance', 'Athletic Performance', 'General Fitness']
const DAYS_OPTIONS = ['2', '3', '4', '5', '6']
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
const EQUIPMENT_OPTIONS = ['Full Gym', 'Dumbbells Only', 'Barbell + Rack', 'Bodyweight Only', 'Kettlebells', 'Resistance Bands']
const DURATION_OPTIONS = ['4', '6', '8']
const MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves']

const RED = '#f87171'
const RED_BG = 'rgba(248,113,113,0.10)'
const RED_BORDER = 'rgba(248,113,113,0.40)'

function Chip({ label, selected, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '7px 14px', borderRadius: 20, fontSize: 12,
        fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
        border: `1px solid ${selected ? RED_BORDER : 'var(--border)'}`,
        background: selected ? RED_BG : 'transparent',
        color: selected ? RED : 'var(--text-muted)',
        fontWeight: selected ? 700 : 400,
        transition: 'all 0.15s', letterSpacing: '0.03em',
      }}
    >
      {label}
    </button>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '11px 14px', color: value ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', width: '100%', cursor: 'pointer',
        appearance: 'none', outline: 'none',
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8 }}>
      {children}
    </p>
  )
}

function ExerciseRow({ ex, index }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: RED_BG, border: `1px solid ${RED_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <span style={{ color: RED, fontSize: 9, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif' }}>{index + 1}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 3 }}>{ex.name}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            `${ex.sets} sets × ${ex.reps}`,
            `Rest ${ex.rest}`,
            ex.tempo && `Tempo ${ex.tempo}`,
          ].filter(Boolean).map(tag => (
            <span key={tag} style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{tag}</span>
          ))}
        </div>
        {ex.cue && (
          <p style={{ color: 'var(--text-faint)', fontSize: 11, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', marginTop: 4 }}>
            "{ex.cue}"
          </p>
        )}
      </div>
    </div>
  )
}

function DayCard({ day }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ textAlign: 'left' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif' }}>{day.day}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 2 }}>{day.focus} · {day.duration}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-faint)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{day.exercises?.length || 0} exercises</span>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 14px 12px' }}>
          {day.exercises?.map((ex, i) => <ExerciseRow key={i} ex={ex} index={i} />)}
        </div>
      )}
    </div>
  )
}

function WeekCard({ week }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '14px 16px', background: 'var(--bg-card)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ textAlign: 'left' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif' }}>Week {week.week}</p>
          <p style={{ color: RED, fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{week.theme}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-faint)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{week.days?.length || 0} days</span>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </button>
      {open && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {week.days?.map((day, i) => <DayCard key={i} day={day} />)}
        </div>
      )}
    </div>
  )
}

function ProgramDisplay({ program }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', border: `1px solid ${RED_BORDER}`, borderRadius: 16, padding: '20px 18px' }}>
        <p style={{ color: RED, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6, fontWeight: 700 }}>AI Program</p>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', marginBottom: 6 }}>{program.name}</h2>
        <p style={{ color: RED, fontSize: 13, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', marginBottom: 10 }}>{program.tagline}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.55 }}>{program.overview}</p>
      </div>

      {/* Weeks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif' }}>Program Schedule</p>
        {program.weeks?.map((week, i) => <WeekCard key={i} week={week} />)}
      </div>

      {/* Footer tips */}
      {(program.progressionNotes || program.nutritionTip || program.recoveryProtocol) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Progression', text: program.progressionNotes },
            { label: 'Nutrition', text: program.nutritionTip },
            { label: 'Recovery', text: program.recoveryProtocol },
          ].filter(t => t.text).map(({ label, text }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ color: RED, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 5 }}>{label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FitPrograms() {
  const [goal,          setGoal]         = useState('')
  const [days,          setDays]         = useState('')
  const [experience,    setExperience]   = useState('')
  const [equipment,     setEquipment]    = useState('')
  const [duration,      setDuration]     = useState('')
  const [focusMuscles,  setFocusMuscles] = useState([])
  const [notes,         setNotes]        = useState('')
  const [loading,       setLoading]      = useState(false)
  const [error,         setError]        = useState(null)
  const [program,       setProgram]      = useState(null)
  const [variants,      setVariants]     = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(0)

  const toggleMuscle = m => setFocusMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const canGenerate = goal && days && experience && equipment && duration

  const generate = async () => {
    setLoading(true)
    setError(null)
    setProgram(null)
    setVariants(null)
    setSelectedVariant(0)
    try {
      const res = await fetch('/.netlify/functions/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, days, experience, equipment, duration, focusMuscles, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setVariants(data.variants || [data])
      setSelectedVariant(0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(2px)' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            border: `3px solid var(--border)`,
            borderTop: `3px solid ${RED}`,
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 8 }}>Generating 3 Program Variants…</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 12 }}>Hold tight! This usually takes 15-30 seconds</p>
            <div style={{ background: 'rgba(248,113,113,0.15)', border: `1px solid rgba(248,113,113,0.3)`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ color: '#f87171', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.4 }}>
                <strong>Don't navigate away or refresh.</strong> This will cancel your generation and you'll lose progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variants && variants.length > 0) {
    const currentProgram = variants[selectedVariant]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          onClick={() => { setVariants(null); setProgram(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '0.04em' }}>New Program</span>
        </button>

        {/* Variant selector */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 6 }}>
          {variants.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVariant(idx)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: selectedVariant === idx ? RED : 'transparent',
                color: selectedVariant === idx ? '#fff' : 'var(--text-muted)',
                fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600,
                transition: 'all 0.2s', letterSpacing: '0.05em'
              }}
            >
              Option {idx + 1}
            </button>
          ))}
        </div>

        <ProgramDisplay program={currentProgram} />

        <button
          onClick={generate}
          style={{
            padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: RED, color: '#fff',
            fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Regenerate All Variants
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Intro */}
      <div style={{ background: 'var(--bg-card)', border: `1px solid ${RED_BORDER}`, borderRadius: 16, padding: '18px 18px 16px' }}>
        <p style={{ color: RED, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 6 }}>AI Coach</p>
        <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 4 }}>Build Your Program</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.5 }}>Tell the AI coach your goals and get a fully periodized training plan — weeks, exercises, sets, reps, tempo, and coaching cues.</p>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <SectionLabel>Training Goal</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GOALS.map(g => <Chip key={g} label={g} selected={goal === g} onToggle={() => setGoal(goal === g ? '' : g)} />)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <SectionLabel>Days / Week</SectionLabel>
            <Select value={days} onChange={setDays} options={DAYS_OPTIONS} placeholder="Select days" />
          </div>
          <div>
            <SectionLabel>Duration (weeks)</SectionLabel>
            <Select value={duration} onChange={setDuration} options={DURATION_OPTIONS} placeholder="Select weeks" />
          </div>
        </div>

        <div>
          <SectionLabel>Experience Level</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXPERIENCE_LEVELS.map(e => <Chip key={e} label={e} selected={experience === e} onToggle={() => setExperience(experience === e ? '' : e)} />)}
          </div>
        </div>

        <div>
          <SectionLabel>Available Equipment</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EQUIPMENT_OPTIONS.map(e => <Chip key={e} label={e} selected={equipment === e} onToggle={() => setEquipment(equipment === e ? '' : e)} />)}
          </div>
        </div>

        <div>
          <SectionLabel>Muscle Focus (optional)</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MUSCLE_OPTIONS.map(m => <Chip key={m} label={m} selected={focusMuscles.includes(m)} onToggle={() => toggleMuscle(m)} />)}
          </div>
        </div>

        <div>
          <SectionLabel>Injuries / Notes (optional)</SectionLabel>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. bad left knee, no overhead pressing…"
            rows={3}
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
              fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', resize: 'none', outline: 'none',
              lineHeight: 1.5,
            }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ color: '#f87171', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>{error}</p>
          </div>
        )}

        <button
          onClick={generate}
          disabled={!canGenerate}
          style={{
            padding: '15px', borderRadius: 12, border: 'none', cursor: canGenerate ? 'pointer' : 'not-allowed',
            background: canGenerate ? RED : 'rgba(248,113,113,0.15)',
            color: canGenerate ? '#fff' : 'rgba(248,113,113,0.4)',
            fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', transition: 'all 0.2s',
          }}
        >
          Generate Program
        </button>
      </div>
    </div>
  )
}
