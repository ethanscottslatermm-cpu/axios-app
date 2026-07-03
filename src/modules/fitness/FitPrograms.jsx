import { useState } from 'react'

const GOALS = ['Build Muscle', 'Lose Fat', 'Improve Strength', 'Increase Endurance', 'Athletic Performance', 'General Fitness']
const DAYS_OPTIONS = ['2', '3', '4', '5', '6']
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']
const EQUIPMENT_OPTIONS = ['Full Gym', 'Dumbbells Only', 'Barbell + Rack', 'Bodyweight Only', 'Kettlebells', 'Resistance Bands']
const DURATION_OPTIONS = ['4', '6', '8']
const MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves']

const ACCENT = '#e2e2f0'

function ExerciseRow({ ex, index }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: `rgba(226,226,240,0.1)`, border: `1px solid rgba(226,226,240,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <span style={{ color: ACCENT, fontSize: 9, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif' }}>{index + 1}</span>
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
          <p style={{ color: ACCENT, fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{week.theme}</p>
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
      <div style={{ background: 'var(--bg-card)', border: `1px solid rgba(226,226,240,0.3)`, borderRadius: 16, padding: '20px 18px' }}>
        <p style={{ color: ACCENT, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6, fontWeight: 700 }}>AI Program</p>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', marginBottom: 6 }}>{program.name}</h2>
        <p style={{ color: ACCENT, fontSize: 13, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', marginBottom: 10 }}>{program.tagline}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.55 }}>{program.overview}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif' }}>Program Schedule</p>
        {program.weeks?.map((week, i) => <WeekCard key={i} week={week} />)}
      </div>

      {(program.progressionNotes || program.nutritionTip || program.recoveryProtocol) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Progression', text: program.progressionNotes },
            { label: 'Nutrition', text: program.nutritionTip },
            { label: 'Recovery', text: program.recoveryProtocol },
          ].filter(t => t.text).map(({ label, text }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ color: ACCENT, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 5 }}>{label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
      <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1 }}>
        <div style={{ height: '100%', background: ACCENT, width: `${(current / total) * 100}%`, borderRadius: 1, transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600, minWidth: 40 }}>
        {current}/{total}
      </span>
    </div>
  )
}

function StepPage({ step, totalSteps, children, onNext, onBack, canProceed, nextLabel = 'Next' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StepIndicator current={step} total={totalSteps} />
      <div>{children}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        {step > 1 && (
          <button
            onClick={onBack}
            style={{
              flex: 1, padding: '13px', borderRadius: 10, background: 'rgba(226,226,240,0.08)',
              border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12,
              fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,226,240,0.15)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,226,240,0.08)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            flex: step === 1 ? undefined : 1, padding: '13px 16px', borderRadius: 10,
            background: canProceed ? ACCENT : 'rgba(226,226,240,0.1)',
            border: `1px solid ${canProceed ? ACCENT : 'var(--border)'}`,
            color: canProceed ? '#000' : 'rgba(226,226,240,0.3)',
            fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: canProceed ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => canProceed && (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => canProceed && (e.currentTarget.style.opacity = '1')}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

export default function FitPrograms() {
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('')
  const [days, setDays] = useState('')
  const [experience, setExperience] = useState('')
  const [equipment, setEquipment] = useState('')
  const [duration, setDuration] = useState('')
  const [focusMuscles, setFocusMuscles] = useState([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [variants, setVariants] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(0)

  const toggleMuscle = m => setFocusMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const generate = async () => {
    setLoading(true)
    setError(null)
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
            borderTop: `3px solid ${ACCENT}`,
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 8 }}>Generating 3 Program Variants…</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 12 }}>Hold tight! This usually takes 15-30 seconds</p>
            <div style={{ background: 'rgba(226,226,240,0.1)', border: `1px solid rgba(226,226,240,0.25)`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ color: 'rgba(226,226,240,0.6)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.4 }}>
                <strong>Don't navigate away or refresh.</strong> This will cancel your generation.
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
          onClick={() => { setVariants(null); setStep(1); setGoal(''); setDays(''); setExperience(''); setEquipment(''); setDuration(''); setFocusMuscles([]); setNotes('') }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '0.04em' }}>New Program</span>
        </button>

        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 6 }}>
          {variants.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVariant(idx)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: selectedVariant === idx ? ACCENT : 'transparent',
                color: selectedVariant === idx ? '#000' : 'var(--text-muted)',
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
            background: ACCENT, color: '#000',
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
      {step === 1 && (
        <StepPage step={1} totalSteps={6} canProceed={!!goal} onNext={() => setStep(2)}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 6 }}>What's Your Goal?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 16, lineHeight: 1.5 }}>Choose your primary fitness objective for this program.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(goal === g ? '' : g)}
                  style={{
                    padding: '10px 16px', borderRadius: 20, fontSize: 12,
                    fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                    border: `1px solid ${goal === g ? ACCENT : 'var(--border)'}`,
                    background: goal === g ? `rgba(226,226,240,0.15)` : 'transparent',
                    color: goal === g ? ACCENT : 'var(--text-muted)',
                    fontWeight: goal === g ? 700 : 400,
                    transition: 'all 0.15s', letterSpacing: '0.03em',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </StepPage>
      )}

      {step === 2 && (
        <StepPage step={2} totalSteps={6} canProceed={!!days && !!duration} onNext={() => setStep(3)} onBack={() => setStep(1)}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 16 }}>Duration & Frequency</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8, display: 'block', fontWeight: 700 }}>Days Per Week</label>
                <select
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '11px 14px', color: days ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Select</option>
                  {DAYS_OPTIONS.map(o => <option key={o} value={o}>{o} days</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8, display: 'block', fontWeight: 700 }}>Program Length</label>
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '11px 14px', color: duration ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Select</option>
                  {DURATION_OPTIONS.map(o => <option key={o} value={o}>{o} weeks</option>)}
                </select>
              </div>
            </div>
          </div>
        </StepPage>
      )}

      {step === 3 && (
        <StepPage step={3} totalSteps={6} canProceed={!!experience} onNext={() => setStep(4)} onBack={() => setStep(2)}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 6 }}>Experience Level</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 16, lineHeight: 1.5 }}>This helps tailor exercise selection and progression pace.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXPERIENCE_LEVELS.map(e => (
                <button
                  key={e}
                  onClick={() => setExperience(experience === e ? '' : e)}
                  style={{
                    padding: '10px 16px', borderRadius: 20, fontSize: 12,
                    fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                    border: `1px solid ${experience === e ? ACCENT : 'var(--border)'}`,
                    background: experience === e ? `rgba(226,226,240,0.15)` : 'transparent',
                    color: experience === e ? ACCENT : 'var(--text-muted)',
                    fontWeight: experience === e ? 700 : 400,
                    transition: 'all 0.15s', letterSpacing: '0.03em',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </StepPage>
      )}

      {step === 4 && (
        <StepPage step={4} totalSteps={6} canProceed={!!equipment} onNext={() => setStep(5)} onBack={() => setStep(3)}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 6 }}>Available Equipment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 16, lineHeight: 1.5 }}>Select what you have access to.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EQUIPMENT_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEquipment(equipment === e ? '' : e)}
                  style={{
                    padding: '10px 16px', borderRadius: 20, fontSize: 12,
                    fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                    border: `1px solid ${equipment === e ? ACCENT : 'var(--border)'}`,
                    background: equipment === e ? `rgba(226,226,240,0.15)` : 'transparent',
                    color: equipment === e ? ACCENT : 'var(--text-muted)',
                    fontWeight: equipment === e ? 700 : 400,
                    transition: 'all 0.15s', letterSpacing: '0.03em',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </StepPage>
      )}

      {step === 5 && (
        <StepPage step={5} totalSteps={6} canProceed={true} onNext={() => setStep(6)} onBack={() => setStep(4)} nextLabel="Continue">
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 6 }}>Muscle Focus (Optional)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 16, lineHeight: 1.5 }}>Emphasize specific muscle groups. Leave blank for full-body balance.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MUSCLE_OPTIONS.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  style={{
                    padding: '10px 16px', borderRadius: 20, fontSize: 12,
                    fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                    border: `1px solid ${focusMuscles.includes(m) ? ACCENT : 'var(--border)'}`,
                    background: focusMuscles.includes(m) ? `rgba(226,226,240,0.15)` : 'transparent',
                    color: focusMuscles.includes(m) ? ACCENT : 'var(--text-muted)',
                    fontWeight: focusMuscles.includes(m) ? 700 : 400,
                    transition: 'all 0.15s', letterSpacing: '0.03em',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </StepPage>
      )}

      {step === 6 && (
        <StepPage step={6} totalSteps={6} canProceed={true} onNext={generate} onBack={() => setStep(5)} nextLabel="Generate Program">
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em', marginBottom: 6 }}>Notes & Injuries</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 16, lineHeight: 1.5 }}>Any limitations we should know about?</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="E.g. bad left knee, no overhead pressing, lower back issues..."
              rows={4}
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
                fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', resize: 'none', outline: 'none',
                lineHeight: 1.5,
              }}
            />

            {error && (
              <div style={{ background: 'rgba(226,226,240,0.08)', border: '1px solid rgba(226,226,240,0.25)', borderRadius: 10, padding: '12px 14px', marginTop: 16 }}>
                <p style={{ color: 'rgba(226,226,240,0.6)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>{error}</p>
              </div>
            )}

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 16 }}>
              <p style={{ color: ACCENT, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 8 }}>Summary</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', color: 'var(--text-muted)' }}>
                <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{goal}</span><br/>Goal</div>
                <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{days} days</span><br/>Frequency</div>
                <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{experience}</span><br/>Experience</div>
                <div><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{duration} weeks</span><br/>Duration</div>
              </div>
            </div>
          </div>
        </StepPage>
      )}
    </div>
  )
}
