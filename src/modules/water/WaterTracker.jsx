import { useState, useEffect } from 'react'
import { useToday } from '../../hooks/useToday'
import LineChart from '../../components/LineChart'
import { useHaptic } from '../../hooks/useHaptic'
import { useWaterHistory } from '../../hooks/useWaterLog'
import { useNavigate } from 'react-router-dom'
import { useWaterLog } from '../../hooks/useWaterLog'
import { BottomNav } from '../../pages/Dashboard'

const WATER_IMG = 'data:image/jpeg;base64,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'

const WATER_GOAL = 8

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ico = {
  back:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  plus:  (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  minus: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14"/></svg>,
  drop:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  check: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  trash: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const WATER_BLUE = '#9ab4cc'

function GlowBar({ pct, h=5 }) {
  const full  = pct >= 100
  const color = full ? WATER_BLUE : 'var(--btn-bg)'
  const glow  = full ? 'rgba(154,180,204,0.55)' : 'rgba(212,212,232,0.5)'
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(212,212,232,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color, borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1), background 0.5s', boxShadow:`0 0 10px ${glow}` }} />
    </div>
  )
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:'linear-gradient(to bottom,rgba(212,212,232,0.8),rgba(212,212,232,0.1))', borderRadius:2, boxShadow:'0 0 6px rgba(212,212,232,0.5)' }} />
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

// ── Water Glass Button ─────────────────────────────────────────────────────────
function GlassButton({ filled, index, onAdd, onRemove, animDelay, visible }) {
  const [pressed, setPressed] = useState(false)

  const handleTap = () => {
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    if (filled) {
      onRemove(index)
    } else {
      onAdd()
    }
  }

  return (
    <button
      onClick={handleTap}
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 12,
        border: `1px solid ${filled ? 'rgba(154,180,204,0.5)' : 'rgba(212,212,232,0.09)'}`,
        background: filled ? 'rgba(154,180,204,0.22)' : 'rgba(212,212,232,0.04)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.25s, border-color 0.25s, transform 0.15s, box-shadow 0.25s',
        transform: pressed ? 'scale(0.92)' : visible ? 'scale(1)' : 'scale(0.85)',
        opacity: visible ? 1 : 0,
        boxShadow: filled ? '0 0 14px rgba(154,180,204,0.3)' : 'none',
        transitionDelay: `${animDelay}ms`,
        color: filled ? WATER_BLUE : 'rgba(212,212,232,0.2)',
      }}
    >
      <svg width={filled ? 22 : 20} height={filled ? 22 : 20} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5 L9 20 C9.2 21.1 10.1 22 11.1 22 L12.9 22 C13.9 22 14.8 21.1 15 20 L18 5 Z" fill={filled ? 'rgba(154,180,204,0.75)' : 'transparent'} stroke="none"/>
        <path d="M5 3 L9 20 C9.2 21.1 10.1 22 11.1 22 L12.9 22 C13.9 22 14.8 21.1 15 20 L19 3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="5" y1="3" x2="19" y2="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M19 8 C21.5 8 21.5 13 19 13" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </button>
  )
}

// ── Custom Oz Sheet ────────────────────────────────────────────────────────────
function CustomOzSheet({ onSave, onClose }) {
  const [oz,      setOz]      = useState('')
  const [visible, setVisible] = useState(false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const handleSave = async () => {
    if (!oz || isNaN(oz) || parseFloat(oz) <= 0) return
    setSaving(true)
    await onSave(parseFloat(oz))
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--overlay-bg)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'var(--sheet-bg)', borderTop:'1px solid var(--border)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(32px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.13)', borderRadius:99, margin:'0 auto 22px' }} />
        <h2 style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', marginBottom:22, letterSpacing:'-0.01em' }}>Custom Amount</h2>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'baseline', gap:8, background:'var(--stat-bg)', border:'1px solid rgba(212,212,232,0.12)', borderRadius:16, padding:'18px 28px' }}>
            <input
              type="number"
              value={oz}
              onChange={e => setOz(e.target.value)}
              placeholder="16"
              autoFocus
              style={{ background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:42, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', width:100, textAlign:'center' }}
            />
            <span style={{ color:'var(--text-muted)', fontSize:16, fontFamily:'Helvetica Neue,sans-serif' }}>oz</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, padding:'13px', background:'transparent', border:'1px solid var(--border)', borderRadius:10, color:'rgba(212,212,232,0.4)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !oz}
            style={{ flex:2, padding:'13px', background:'rgba(154,180,204,0.15)', color:'#9ab4cc', border:'1px solid rgba(154,180,204,0.4)', borderRadius:10, fontSize:12, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving || !oz ? 'not-allowed' : 'pointer', opacity: saving || !oz ? 0.5 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:'0 0 14px rgba(154,180,204,0.12)' }}>
            {Ico.check()} Log It
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function WaterTracker() {
  const todayStr = useToday()
  const haptic = useHaptic()
  const navigate = useNavigate()
  const { logs, count, addGlass, removeGlass, isLoading: loading } = useWaterLog(todayStr)
  const { history: waterHistory } = useWaterHistory()

  const [visible,   setVisible]   = useState(false)
  const [showCustom,setShowCustom]= useState(false)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const pct      = Math.min(100, Math.round((count / WATER_GOAL) * 100))
  const remaining = Math.max(0, WATER_GOAL - count)
  const goalMet  = count >= WATER_GOAL

  const handleAddGlass = async (oz = 8) => {
    haptic.tap()
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 600)
    await addGlass.mutateAsync()
  }

  const handleCustom = async (oz) => {
    await handleAddGlass(oz)
  }

  // Quick-add sizes
  const quickSizes = [
    { label: '8 oz',  sub: 'Glass',  oz: 8,  icon: (
      <svg viewBox="0 0 28 36" width={22} height={28} fill="none">
        <path d="M5 4 L7 32 H21 L23 4 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
        <line x1="5" y1="4" x2="23" y2="4" stroke={WATER_BLUE} strokeWidth="1.4"/>
      </svg>
    )},
    { label: '12 oz', sub: 'Bottle', oz: 12, icon: (
      <svg viewBox="0 0 28 40" width={20} height={30} fill="none">
        <rect x="10" y="2" width="8" height="6" rx="1.5" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.3"/>
        <path d="M6 10 Q4 14 4 18 L4 34 Q4 38 14 38 Q24 38 24 34 L24 18 Q24 14 22 10 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    )},
    { label: '16 oz', sub: 'Large',  oz: 16, icon: (
      <svg viewBox="0 0 32 40" width={24} height={32} fill="none">
        <path d="M4 4 L6 36 H26 L28 4 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
        <line x1="4" y1="4" x2="28" y2="4" stroke={WATER_BLUE} strokeWidth="1.4"/>
        <line x1="6" y1="20" x2="26" y2="20" stroke={WATER_BLUE} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5"/>
      </svg>
    )},
    { label: '24 oz', sub: 'Bottle', oz: 24, icon: (
      <svg viewBox="0 0 28 46" width={20} height={34} fill="none">
        <rect x="10" y="2" width="8" height="5" rx="1.5" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.3"/>
        <path d="M6 9 Q4 13 4 18 L4 38 Q4 44 14 44 Q24 44 24 38 L24 18 Q24 13 22 9 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
        <line x1="5" y1="26" x2="23" y2="26" stroke={WATER_BLUE} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5"/>
      </svg>
    )},
  ]

  const anim = (d=0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
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
        input:focus{outline:none;}
        .ax-back:hover{background:rgba(212,212,232,0.08)!important;}
        .ax-quick:hover{background:rgba(212,212,232,0.08)!important;border-color:rgba(212,212,232,0.2)!important;}
        .ax-custom:hover{border-color:rgba(212,212,232,0.22)!important;color:rgba(212,212,232,0.6)!important;}

        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .ax-ripple { animation: ripple 0.5s ease-out forwards; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom:90, position:'relative' }}>
        <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`url(${WATER_IMG})`, backgroundSize:'cover', backgroundPosition:'center 25%', backgroundRepeat:'no-repeat', opacity:0.17, filter:'grayscale(100%) contrast(1.3) brightness(1.1)', pointerEvents:'none' }} />
        <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.2) 40%, rgba(8,8,8,0.88) 100%)', pointerEvents:'none' }} />

        {/* ── Sticky Header ── */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'var(--header-bg)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--border)', padding:'14px 16px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>Today</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <h1 style={{ color:'#9ab4cc', fontWeight:900, fontSize:20, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Water Intake</h1>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ab4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.8}><path d="M9 2h6"/><path d="M7.5 5h9l.5 2V20a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V7l.5-2z"/><path d="M7.5 11h9"/></svg>
              </div>
            </div>
          </div>

          {/* Progress summary */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>Today</p>
              <p style={{ color:'var(--text-primary)', fontSize:34, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.02em' }}>
                {count} <span style={{ fontSize:14, color:'var(--text-muted)', fontWeight:400 }}>/ {WATER_GOAL} glasses</span>
              </p>
              <p style={{ color: goalMet ? WATER_BLUE : 'rgba(212,212,232,0.3)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:4 }}>
                {goalMet ? '✓ Goal reached — well done.' : `${remaining} glass${remaining !== 1 ? 'es' : ''} remaining`}
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>Progress</p>
              <p style={{ color:'var(--text-primary)', fontSize:30, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{pct}<span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:400 }}>%</span></p>
            </div>
          </div>
          <GlowBar pct={pct} />
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* Glass grid — 4×2 tap targets */}
          <Card style={anim(80)}>
            <SectionHead title="Tap to Log" sub={`${count} of ${WATER_GOAL}`} />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:14 }}>
              {Array.from({ length: WATER_GOAL }).map((_, i) => (
                <GlassButton
                  key={i}
                  index={i}
                  filled={i < count}
                  onAdd={() => handleAddGlass(8)}
                  onRemove={() => removeGlass.mutate(undefined)}
                  animDelay={i * 50}
                  visible={visible}
                />
              ))}
            </div>
            <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center' }}>
              Tap a glass to add · tap a filled glass to remove
            </p>
          </Card>

          {/* Quick add sizes */}
          <div style={anim(200)}>
            <SectionHead title="Quick Add" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {quickSizes.map(({ label, sub, oz, icon }) => (
                <button key={oz} onClick={() => handleAddGlass(oz)} className="ax-quick"
                  style={{ padding:'16px', borderRadius:12, background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', cursor:'pointer', textAlign:'left', transition:'all 0.18s', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{label}</p>
                    <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>
                  </div>
                  <div style={{ opacity:0.85 }}>{icon}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCustom(true)} className="ax-custom"
              style={{ width:'100%', marginTop:10, padding:'13px', borderRadius:12, background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              {Ico.plus(13)} Custom amount
            </button>
          </div>

          {/* Today's log */}
          {(logs || []).length > 0 && (
            <Card style={anim(280)}>
              <SectionHead title="Today's Log" sub={`${logs.length} entries`} />
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[...(logs||[])].reverse().map((log, i) => {
                  const time = log.created_at ? new Date(log.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : ''
                  return (
                    <div key={log.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 12px', background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, opacity: visible?1:0, transform: visible?'translateX(0)':'translateX(-8px)', transition:`opacity 0.4s ease ${i*35}ms, transform 0.4s ease ${i*35}ms` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ color:'var(--text-muted)' }}>{Ico.drop(14)}</div>
                        <div>
                          <p style={{ color:'rgba(212,212,232,0.7)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>
                            1 glass
                          </p>
                          {time && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{time}</p>}
                        </div>
                      </div>
                      <button onClick={() => { haptic.delete(); removeGlass.mutate(log.id) }}
                        style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:7, padding:'6px 8px', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', transition:'all 0.2s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,60,60,0.1)';e.currentTarget.style.borderColor='rgba(255,60,60,0.25)';e.currentTarget.style.color='rgba(255,100,100,0.8)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(212,212,232,0.04)';e.currentTarget.style.borderColor='rgba(212,212,232,0.08)';e.currentTarget.style.color='rgba(212,212,232,0.25)'}}>
                        {Ico.trash()}
                      </button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Empty state */}
          {!loading && (logs||[]).length === 0 && (
            <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:14, padding:'40px 20px', textAlign:'center', ...anim(280) }}>
              <div style={{ color:'rgba(212,212,232,0.15)', marginBottom:12, display:'flex', justifyContent:'center' }}>{Ico.drop(32)}</div>
              <p style={{ color:'var(--text-muted)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7, marginBottom:16 }}>
                No water logged yet today.<br/>Start with your first glass.
              </p>
              <button onClick={() => handleAddGlass(8)}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, background:'rgba(212,212,232,0.07)', border:'1px solid rgba(212,212,232,0.12)', color:'var(--text-secondary)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                {Ico.plus(12)} Log first glass
              </button>
            </div>
          )}

        </div>
      </div>


              {/* Water Trend */}
              {waterHistory.length >= 2 && (
                <div style={{ marginBottom:28 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>14-Day Trend</p>
                    <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>glasses / day</p>
                  </div>
                  <LineChart
                    data={[...waterHistory].reverse().slice(-14).map(d => ({
                      label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month:'numeric', day:'numeric' }),
                      value: d.glasses,
                    }))}
                    height={90}
                  />
                </div>
              )}

                            {/* Past Days */}
              {waterHistory.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                    <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>Past Days</p>
                    <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{waterHistory.length} days logged</p>
                  </div>
                  <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingRight:4, scrollbarWidth:'thin', scrollbarColor:'var(--scrollbar) transparent' }}>
                    {waterHistory.map((day) => (
                      <div key={day.date} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10 }}>
                        <div>
                          <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginBottom:2 }}>
                            {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
                          </p>
                          <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{day.glasses} glasses</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{day.oz} oz</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {showCustom && (
        <CustomOzSheet onSave={handleCustom} onClose={() => setShowCustom(false)} />
      )}

      <BottomNav />
    </>
  )
}
