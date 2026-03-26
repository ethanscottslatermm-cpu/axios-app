import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWaterLog } from '../../hooks/useWaterLog'
import { BottomNav } from '../../pages/Dashboard'

const todayStr = new Date().toISOString().split('T')[0]
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
function GlowBar({ pct, h=5 }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:'#fff', borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1)', boxShadow:'0 0 10px rgba(255,255,255,0.5)' }} />
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
        border: `1px solid ${filled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.09)'}`,
        background: filled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.04)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.25s, border-color 0.25s, transform 0.15s, box-shadow 0.25s',
        transform: pressed ? 'scale(0.92)' : visible ? 'scale(1)' : 'scale(0.85)',
        opacity: visible ? 1 : 0,
        boxShadow: filled ? '0 0 14px rgba(255,255,255,0.25)' : 'none',
        transitionDelay: `${animDelay}ms`,
        color: filled ? '#080808' : 'rgba(255,255,255,0.2)',
      }}
    >
      {Ico.drop(filled ? 18 : 16)}
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
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'#0d0d0d', borderTop:'1px solid rgba(255,255,255,0.1)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(32px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ width:36, height:4, background:'rgba(255,255,255,0.13)', borderRadius:99, margin:'0 auto 22px' }} />
        <h2 style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', marginBottom:22, letterSpacing:'-0.01em' }}>Custom Amount</h2>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'baseline', gap:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'18px 28px' }}>
            <input
              type="number"
              value={oz}
              onChange={e => setOz(e.target.value)}
              placeholder="16"
              autoFocus
              style={{ background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:42, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', width:100, textAlign:'center' }}
            />
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:16, fontFamily:'Helvetica Neue,sans-serif' }}>oz</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, padding:'13px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'rgba(255,255,255,0.4)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !oz}
            style={{ flex:2, padding:'13px', background:'#fff', color:'#080808', border:'none', borderRadius:10, fontSize:12, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving || !oz ? 'not-allowed' : 'pointer', opacity: saving || !oz ? 0.5 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
            {Ico.check()} Log It
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function WaterTracker() {
  const navigate = useNavigate()
  const { logs, count, addGlass, removeGlass, loading } = useWaterLog(todayStr)

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
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 600)
    await addGlass()
  }

  const handleCustom = async (oz) => {
    await handleAddGlass(oz)
  }

  // Quick-add sizes
  const quickSizes = [
    { label: '8 oz',  sub: 'Glass',  oz: 8  },
    { label: '12 oz', sub: 'Bottle', oz: 12 },
    { label: '16 oz', sub: 'Large',  oz: 16 },
    { label: '24 oz', sub: 'Bottle', oz: 24 },
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
        body{background:#080808;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input:focus{outline:none;}
        .ax-back:hover{background:rgba(255,255,255,0.08)!important;}
        .ax-quick:hover{background:rgba(255,255,255,0.08)!important;border-color:rgba(255,255,255,0.2)!important;}
        .ax-custom:hover{border-color:rgba(255,255,255,0.22)!important;color:rgba(255,255,255,0.6)!important;}

        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .ax-ripple { animation: ripple 0.5s ease-out forwards; }
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
              <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>Today</p>
              <h1 style={{ color:'#fff', fontWeight:900, fontSize:20, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Water Intake</h1>
            </div>
          </div>

          {/* Progress summary */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>Today</p>
              <p style={{ color:'#fff', fontSize:34, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.02em' }}>
                {count} <span style={{ fontSize:14, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>/ {WATER_GOAL} glasses</span>
              </p>
              <p style={{ color: goalMet ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:4 }}>
                {goalMet ? '✓ Goal reached — well done.' : `${remaining} glass${remaining !== 1 ? 'es' : ''} remaining`}
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>Progress</p>
              <p style={{ color:'#fff', fontSize:30, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{pct}<span style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>%</span></p>
            </div>
          </div>
          <GlowBar pct={pct} />
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto' }}>

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
                  onRemove={() => removeGlass()}
                  animDelay={i * 50}
                  visible={visible}
                />
              ))}
            </div>
            <p style={{ color:'rgba(255,255,255,0.22)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center' }}>
              Tap a glass to add · tap a filled glass to remove
            </p>
          </Card>

          {/* Quick add sizes */}
          <div style={anim(200)}>
            <SectionHead title="Quick Add" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {quickSizes.map(({ label, sub, oz }) => (
                <button key={oz} onClick={() => handleAddGlass(oz)} className="ax-quick"
                  style={{ padding:'16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', textAlign:'left', transition:'all 0.18s' }}>
                  <p style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>{label}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCustom(true)} className="ax-custom"
              style={{ width:'100%', marginTop:10, padding:'13px', borderRadius:12, background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
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
                    <div key={log.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, opacity: visible?1:0, transform: visible?'translateX(0)':'translateX(-8px)', transition:`opacity 0.4s ease ${i*35}ms, transform 0.4s ease ${i*35}ms` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ color:'rgba(255,255,255,0.3)' }}>{Ico.drop(14)}</div>
                        <div>
                          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>
                            1 glass
                          </p>
                          {time && <p style={{ color:'rgba(255,255,255,0.22)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{time}</p>}
                        </div>
                      </div>
                      <button onClick={() => removeGlass(log.id)}
                        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:'6px 8px', cursor:'pointer', color:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', transition:'all 0.2s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,60,60,0.1)';e.currentTarget.style.borderColor='rgba(255,60,60,0.25)';e.currentTarget.style.color='rgba(255,100,100,0.8)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.color='rgba(255,255,255,0.25)'}}>
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
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:14, padding:'40px 20px', textAlign:'center', ...anim(280) }}>
              <div style={{ color:'rgba(255,255,255,0.15)', marginBottom:12, display:'flex', justifyContent:'center' }}>{Ico.drop(32)}</div>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7, marginBottom:16 }}>
                No water logged yet today.<br/>Start with your first glass.
              </p>
              <button onClick={() => handleAddGlass(8)}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                {Ico.plus(12)} Log first glass
              </button>
            </div>
          )}

        </div>
      </div>

      {showCustom && (
        <CustomOzSheet onSave={handleCustom} onClose={() => setShowCustom(false)} />
      )}

      <BottomNav />
    </>
  )
}
