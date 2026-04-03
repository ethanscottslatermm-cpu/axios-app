import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const STEPS = [
  {
    id: 'basics',
    title: 'The Basics',
    subtitle: 'Let\'s personalize your experience.',
    fields: [
      { key: 'name',   label: 'What should we call you?', type: 'text',   placeholder: 'Ethan' },
      { key: 'age',    label: 'Age',                       type: 'number', placeholder: '28' },
      { key: 'gender', label: 'Biological sex',            type: 'select', options: ['Male','Female','Prefer not to say'] },
    ],
  },
  {
    id: 'body',
    title: 'Your Body',
    subtitle: 'Used to calculate your targets.',
    fields: [
      { key: 'height_ft',  label: 'Height (ft)',  type: 'number', placeholder: '5' },
      { key: 'height_in',  label: 'Height (in)',  type: 'number', placeholder: '11' },
      { key: 'weight_lbs', label: 'Current weight (lbs)', type: 'number', placeholder: '185' },
    ],
  },
  {
    id: 'goals',
    title: 'Your Goals',
    subtitle: 'What are you working toward?',
    fields: [
      { key: 'goal_weight', label: 'Goal weight (lbs)', type: 'number', placeholder: '175' },
      { key: 'primary_goal', label: 'Primary goal', type: 'select', options: ['Lose weight','Build muscle','Maintain weight','Improve endurance','Overall wellness'] },
      { key: 'activity_level', label: 'Activity level', type: 'select', options: ['Sedentary','Lightly active','Moderately active','Very active','Athlete'] },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    subtitle: 'Help us tailor your spiritual & wellness journey.',
    fields: [
      { key: 'calorie_goal',  label: 'Daily calorie goal',  type: 'number', placeholder: '2200' },
      { key: 'water_goal',    label: 'Daily water goal (glasses)', type: 'number', placeholder: '8' },
      { key: 'faith_focus',   label: 'Faith focus', type: 'select', options: ['Christian','Non-denominational','Spiritual but not religious','Other','Prefer not to say'] },
    ],
  },
]

function SelectField({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', padding:'13px 16px', borderRadius:10, border:'1px solid rgba(212,212,232,0.12)',
          background:'var(--stat-bg)', color: value ? '#fff' : 'rgba(212,212,232,0.3)',
          fontSize:14, fontFamily:'Helvetica Neue,sans-serif', textAlign:'left', cursor:'pointer',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}
      >
        {value || placeholder || 'Select…'}
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:200, background:'var(--bg-secondary)', border:'1px solid rgba(212,212,232,0.12)', borderRadius:10, overflow:'hidden' }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              style={{ width:'100%', padding:'12px 16px', background: value === opt ? 'rgba(212,212,232,0.08)' : 'transparent', border:'none', color: value === opt ? '#fff' : 'rgba(212,212,232,0.6)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', textAlign:'left', cursor:'pointer', borderBottom:'1px solid rgba(212,212,232,0.05)' }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StepDots({ total, current }) {
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:32 }}>
      {Array.from({ length: total }).map((_,i) => (
        <div key={i} style={{
          width: i === current ? 22 : 7, height:7, borderRadius:99,
          background: i === current ? '#fff' : i < current ? 'rgba(212,212,232,0.4)' : 'rgba(212,212,232,0.12)',
          transition:'all 0.3s cubic-bezier(.16,1,.3,1)',
          boxShadow: i === current ? '0 0 8px rgba(212,212,232,0.5)' : 'none',
        }} />
      ))}
    </div>
  )
}

export default function Onboarding() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [step,    setStep]    = useState(0)
  const [data,    setData]    = useState({})
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [entered, setEntered] = useState(true)

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))

  const goNext = async () => {
    setError('')
    // Validate required fields for this step
    const missing = current.fields.filter(f => !data[f.key]?.toString().trim())
    if (missing.length) { setError(`Please fill in: ${missing.map(f=>f.label).join(', ')}`); return }

    if (isLast) {
      setSaving(true)
      try {
        const { error: dbErr } = await supabase.from('profiles').upsert({
          id: user.id,
          name:           data.name,
          age:            parseInt(data.age),
          gender:         data.gender,
          height_ft:      parseInt(data.height_ft),
          height_in:      parseInt(data.height_in),
          weight_lbs:     parseFloat(data.weight_lbs),
          goal_weight:    parseFloat(data.goal_weight),
          primary_goal:   data.primary_goal,
          activity_level: data.activity_level,
          calorie_goal:   parseInt(data.calorie_goal),
          water_goal:     parseInt(data.water_goal),
          faith_focus:    data.faith_focus,
          onboarded:      true,
        }, { onConflict: 'id' })
        if (dbErr) throw dbErr
        navigate('/dashboard')
      } catch (e) {
        setError(e.message || 'Something went wrong. Please try again.')
        setSaving(false)
      }
      return
    }

    // Animate out / in
    setEntered(false)
    setTimeout(() => { setStep(s => s + 1); setEntered(true) }, 220)
  }

  const goBack = () => {
    if (step === 0) return
    setEntered(false)
    setTimeout(() => { setStep(s => s - 1); setEntered(true) }, 220)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg-primary);}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(212,212,232,0.2);}
        input:focus{outline:none;}
        .ax-field:focus-within{border-color:rgba(212,212,232,0.28)!important;box-shadow:0 0 0 1px rgba(212,212,232,0.07),0 0 16px rgba(212,212,232,0.04)!important;}
        .ax-ob-btn:hover:not(:disabled){background:rgba(212,212,232,0.88)!important;box-shadow:0 0 22px rgba(212,212,232,0.2)!important;}
      `}</style>

      <div style={{
        minHeight:'100vh', background:'var(--bg-primary)', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'24px 20px',
        WebkitFontSmoothing:'antialiased',
      }}>

        {/* Logo mark */}
        <div style={{ marginBottom:40, textAlign:'center' }}>
          <p style={{ color:'rgba(212,212,232,0.15)', fontSize:10, letterSpacing:'0.4em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>AXIOS</p>
          <p style={{ color:'rgba(212,212,232,0.08)', fontSize:9, letterSpacing:'0.3em', fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>I AM WORTHY</p>
        </div>

        <div style={{
          width:'100%', maxWidth:420,
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(10px)',
          transition:'opacity 0.25s ease, transform 0.25s ease',
        }}>
          <StepDots total={STEPS.length} current={step} />

          <div style={{ marginBottom:28, textAlign:'center' }}>
            <h2 style={{ color:'var(--text-primary)', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em', marginBottom:8 }}>
              {current.title}
            </h2>
            <p style={{ color:'var(--text-muted)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>
              {current.subtitle}
            </p>
          </div>

          {/* Fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
            {current.fields.map(field => (
              <div key={field.key}>
                <label style={{ display:'block', color:'var(--text-muted)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <SelectField
                    value={data[field.key] || ''}
                    onChange={val => set(field.key, val)}
                    options={field.options}
                  />
                ) : (
                  <div className="ax-field" style={{ display:'flex', alignItems:'center', background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'13px 16px', transition:'border-color 0.2s,box-shadow 0.2s' }}>
                    <input
                      type={field.type}
                      value={data[field.key] || ''}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ flex:1, background:'transparent', border:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:16, textAlign:'center' }}>{error}</p>
          )}

          {/* CTA */}
          <button onClick={goNext} disabled={saving} className="ax-ob-btn"
            style={{ width:'100%', padding:'15px', background:'var(--btn-bg)', color:'var(--bg-primary)', border:'none', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, transition:'background 0.2s,box-shadow 0.2s', marginBottom:14 }}>
            {saving ? 'Saving…' : isLast ? 'Complete Setup' : 'Continue →'}
          </button>

          {step > 0 && (
            <button onClick={goBack}
              style={{ width:'100%', padding:'12px', background:'transparent', border:'none', color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
              ← Back
            </button>
          )}
        </div>

        {/* Step counter */}
        <p style={{ color:'rgba(212,212,232,0.12)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginTop:32 }}>
          {step + 1} of {STEPS.length}
        </p>
      </div>
    </>
  )
}
