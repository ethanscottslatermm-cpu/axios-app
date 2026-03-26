import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { BottomNav } from './Dashboard'

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ico = {
  back:    () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  user:    () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:    () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  check:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  logout:  () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  scale:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/></svg>,
  target:  () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  flame:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  drop:    () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  heart:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  chevron: () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
      <div style={{ width:2, height:14, background:'linear-gradient(to bottom,rgba(255,255,255,0.8),rgba(255,255,255,0.1))', borderRadius:2, boxShadow:'0 0 6px rgba(255,255,255,0.5)' }} />
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{children}</p>
    </div>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 18px', ...style }}>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type='text', icon, disabled=false, placeholder='' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:7 }}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', gap:11, background:'rgba(255,255,255,0.04)', border:`1px solid ${focused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.09)'}`, borderRadius:10, padding:'12px 14px', transition:'border-color 0.2s,box-shadow 0.2s', boxShadow: focused ? '0 0 0 1px rgba(255,255,255,0.07),0 0 14px rgba(255,255,255,0.04)' : 'none' }}>
        {icon && <div style={{ color:'rgba(255,255,255,0.28)', flexShrink:0 }}>{icon()}</div>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex:1, background:'transparent', border:'none', outline:'none', color: disabled ? 'rgba(255,255,255,0.28)' : '#fff', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', WebkitTextFillColor: disabled ? 'rgba(255,255,255,0.28)' : '#fff' }} />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:7 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.09)', background:'rgba(255,255,255,0.04)', color: value ? '#fff' : 'rgba(255,255,255,0.28)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {value || 'Select…'}
          <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.2s', color:'rgba(255,255,255,0.3)' }}>{Ico.chevron()}</span>
        </button>
        {open && (
          <div style={{ position:'absolute', top:'calc(100% + 5px)', left:0, right:0, zIndex:200, background:'#111', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, overflow:'hidden' }}>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
                style={{ width:'100%', padding:'11px 14px', background: value===opt ? 'rgba(255,255,255,0.08)' : 'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.05)', color: value===opt ? '#fff' : 'rgba(255,255,255,0.6)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'left', cursor:'pointer' }}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [profile, setProfile] = useState({
    name:'', age:'', gender:'', height_ft:'', height_in:'',
    weight_lbs:'', goal_weight:'', primary_goal:'', activity_level:'',
    calorie_goal:'', water_goal:'', faith_focus:'',
  })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) setProfile(p => ({ ...p, ...data }))
      })
    setTimeout(() => setVisible(true), 60)
  }, [user])

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))

  const save = async () => {
    if (!profile.name?.trim()) { setError('Name is required.'); return }
    setError(''); setSaving(true)
    try {
      const { error: dbErr } = await supabase.from('profiles').upsert({
        id: user.id, ...profile,
        age:         parseInt(profile.age) || null,
        height_ft:   parseInt(profile.height_ft) || null,
        height_in:   parseInt(profile.height_in) || null,
        weight_lbs:  parseFloat(profile.weight_lbs) || null,
        goal_weight: parseFloat(profile.goal_weight) || null,
        calorie_goal:parseInt(profile.calorie_goal) || null,
        water_goal:  parseInt(profile.water_goal) || null,
      }, { onConflict:'id' })
      if (dbErr) throw dbErr
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch(e) { setError(e.message || 'Something went wrong.') }
    finally { setSaving(false) }
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const anim = (delay=0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080808;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input:focus{outline:none;}
        .ax-save:hover:not(:disabled){background:rgba(255,255,255,0.88)!important;box-shadow:0 0 22px rgba(255,255,255,0.2)!important;}
        .ax-back:hover{background:rgba(255,255,255,0.07)!important;}
        .ax-signout:hover{background:rgba(255,50,50,0.06)!important;border-color:rgba(255,80,80,0.3)!important;color:rgba(255,120,120,0.8)!important;}
        .ax-reob:hover{border-color:rgba(255,255,255,0.25)!important;color:rgba(255,255,255,0.6)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#080808', WebkitFontSmoothing:'antialiased', paddingBottom:90 }}>

        {/* Header */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,8,8,0.93)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => navigate(-1)} className="ax-back"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
            {Ico.back()}
          </button>
          <div>
            <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>AXIOS</p>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:18, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>Settings</h1>
          </div>
        </div>

        <div style={{ maxWidth:520, width:'100%', margin:'0 auto', padding:'20px 16px 0', display:'flex', flexDirection:'column', gap:16 }}>

          {/* Profile */}
          <Card style={anim(60)}>
            <SectionLabel>Profile</SectionLabel>
            <Field label="Display Name" value={profile.name} onChange={v=>set('name',v)} icon={Ico.user} placeholder="Ethan" />
            <Field label="Email" value={user?.email||''} onChange={()=>{}} icon={Ico.mail} disabled />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="Age" value={profile.age} onChange={v=>set('age',v)} type="number" placeholder="28" />
              <SelectField label="Biological Sex" value={profile.gender} onChange={v=>set('gender',v)} options={['Male','Female','Prefer not to say']} />
            </div>
          </Card>

          {/* Body */}
          <Card style={anim(120)}>
            <SectionLabel>Body Stats</SectionLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="Height (ft)" value={profile.height_ft} onChange={v=>set('height_ft',v)} icon={Ico.scale} type="number" placeholder="5" />
              <Field label="Height (in)" value={profile.height_in} onChange={v=>set('height_in',v)} type="number" placeholder="11" />
            </div>
            <Field label="Current Weight (lbs)" value={profile.weight_lbs} onChange={v=>set('weight_lbs',v)} icon={Ico.scale} type="number" placeholder="185" />
            <Field label="Goal Weight (lbs)" value={profile.goal_weight} onChange={v=>set('goal_weight',v)} icon={Ico.target} type="number" placeholder="175" />
          </Card>

          {/* Goals */}
          <Card style={anim(180)}>
            <SectionLabel>Goals & Activity</SectionLabel>
            <SelectField label="Primary Goal" value={profile.primary_goal} onChange={v=>set('primary_goal',v)} options={['Lose weight','Build muscle','Maintain weight','Improve endurance','Overall wellness']} />
            <SelectField label="Activity Level" value={profile.activity_level} onChange={v=>set('activity_level',v)} options={['Sedentary','Lightly active','Moderately active','Very active','Athlete']} />
          </Card>

          {/* Daily Targets */}
          <Card style={anim(240)}>
            <SectionLabel>Daily Targets</SectionLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="Calorie Goal" value={profile.calorie_goal} onChange={v=>set('calorie_goal',v)} icon={Ico.flame} type="number" placeholder="2200" />
              <Field label="Water Goal (glasses)" value={profile.water_goal} onChange={v=>set('water_goal',v)} icon={Ico.drop} type="number" placeholder="8" />
            </div>
          </Card>

          {/* Spiritual */}
          <Card style={anim(300)}>
            <SectionLabel>Spiritual Preferences</SectionLabel>
            <SelectField label="Faith Focus" value={profile.faith_focus} onChange={v=>set('faith_focus',v)} options={['Christian','Non-denominational','Spiritual but not religious','Other','Prefer not to say']} />
          </Card>

          {/* Save */}
          <div style={anim(360)}>
            {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12, textAlign:'center' }}>{error}</p>}
            <button onClick={save} disabled={saving} className="ax-save"
              style={{ width:'100%', padding:'15px', background: saved ? 'rgba(255,255,255,0.12)' : '#fff', color: saved ? '#fff' : '#080808', border: saved ? '1px solid rgba(255,255,255,0.2)' : 'none', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, transition:'background 0.2s,box-shadow 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {saved ? <>{Ico.check()} Saved</> : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          {/* Account */}
          <Card style={anim(420)}>
            <SectionLabel>Account</SectionLabel>
            <div style={{ padding:'8px 0 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:16 }}>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>Signed in as</p>
              <p style={{ color:'rgba(255,255,255,0.22)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif' }}>{user?.email}</p>
            </div>
            {/* Re-run onboarding */}
            <button onClick={() => navigate('/onboarding')} className="ax-reob"
              style={{ width:'100%', padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, color:'rgba(255,255,255,0.35)', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, cursor:'pointer', transition:'border-color 0.2s,color 0.2s', marginBottom:10 }}>
              Re-run Setup Questionnaire
            </button>
            <button onClick={handleSignOut} className="ax-signout"
              style={{ width:'100%', padding:'12px', background:'transparent', border:'1px solid rgba(255,80,80,0.16)', borderRadius:9, color:'rgba(255,80,80,0.45)', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {Ico.logout()} Sign Out
            </button>
          </Card>

          <p style={{ color:'rgba(255,255,255,0.08)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', paddingBottom:8 }}>AXIOS · I AM WORTHY</p>

        </div>
      </div>

      <BottomNav />
    </>
  )
}
