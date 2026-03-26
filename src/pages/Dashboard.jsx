import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { useWaterLog } from '../hooks/useWaterLog'
import { useWeightLog } from '../hooks/useWeightLog'
import { usePrayers } from '../hooks/usePrayers'
import { supabase } from '../lib/supabase'

const today    = new Date()
const todayStr = today.toISOString().split('T')[0]
const dayName  = today.toLocaleDateString('en-US', { weekday: 'long' })
const dateStr  = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const CALORIE_GOAL = 2200
const WATER_GOAL   = 8

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const Ico = {
  food:     (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  water:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  weight:   (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/></svg>,
  prayer:   (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  book:     (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  fitness:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h18M3 14.5h18"/></svg>,
  settings: (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  home:     (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  plus:     (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  chevron:  (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
}

const modules = [
  { key:'food',       label:'Food Journal', path:'/food',       icon: Ico.food },
  { key:'water',      label:'Water',        path:'/water',      icon: Ico.water },
  { key:'weight',     label:'Weight',       path:'/weight',     icon: Ico.weight },
  { key:'prayer',     label:'Prayer',       path:'/prayer',     icon: Ico.prayer },
  { key:'devotional', label:'Devotional',   path:'/devotional', icon: Ico.book },
  { key:'fitness',    label:'Fitness',      path:'/fitness',    icon: Ico.fitness },
]

function GlowBar({ pct, h = 3 }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:'#fff', borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1)', boxShadow:'0 0 8px rgba(255,255,255,0.55)' }} />
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

function SectionHead({ title, action, actionLabel }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:'linear-gradient(to bottom,rgba(255,255,255,0.8),rgba(255,255,255,0.1))', borderRadius:2, boxShadow:'0 0 6px rgba(255,255,255,0.5)' }} />
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {action && <button onClick={action} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.28)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{actionLabel}</button>}
    </div>
  )
}

export function BottomNav() {
  const navigate = useNavigate()
  const loc = useLocation()
  const items = [
    { label:'Home',     path:'/dashboard',  icon: Ico.home },
    { label:'Food',     path:'/food',       icon: Ico.food },
    { label:'Prayer',   path:'/prayer',     icon: Ico.prayer },
    { label:'Fitness',  path:'/fitness',    icon: Ico.fitness },
    { label:'Settings', path:'/settings',   icon: Ico.settings },
  ]
  return (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      background:'rgba(8,8,8,0.96)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderTop:'1px solid rgba(255,255,255,0.08)',
      display:'flex', alignItems:'center', justifyContent:'space-around',
      padding:'10px 0 max(12px,env(safe-area-inset-bottom))',
    }}>
      {items.map(({ label, path, icon }) => {
        const active = loc.pathname === path
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            background:'none', border:'none', cursor:'pointer',
            color: active ? '#fff' : 'rgba(255,255,255,0.28)',
            transition:'color 0.2s', minWidth:52, padding:'2px 0',
          }}>
            <div style={{ filter: active ? 'drop-shadow(0 0 5px rgba(255,255,255,0.7))' : 'none', transition:'filter 0.2s' }}>
              {icon(22)}
            </div>
            <span style={{ fontSize:9, letterSpacing:'0.08em', fontFamily:'Helvetica Neue,sans-serif', fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const [profile, setProfile] = useState(null)
  const [visible, setVisible] = useState(false)

  const { totals, logs: foodLogs } = useFoodLog(todayStr)
  const { count: waterCount }      = useWaterLog(todayStr)
  const { latest, goal: weightGoal } = useWeightLog()
  const { prayers }                = usePrayers()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('name').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [user])

  const displayName   = profile?.name || 'Ethan'
  const calories      = totals?.calories || 0
  const calPct        = Math.min(100, Math.round((calories / CALORIE_GOAL) * 100))
  const waterPct      = Math.min(100, Math.round((waterCount / WATER_GOAL) * 100))
  const calLeft       = Math.max(0, CALORIE_GOAL - calories)
  const todayPrayers  = (prayers || []).filter(p => p.date === todayStr).length
  const answeredCount = (prayers || []).filter(p => p.answered).length

  const loggedModules = {
    food:       calories > 0,
    water:      waterCount > 0,
    weight:     !!latest,
    prayer:     todayPrayers > 0,
    devotional: false,
    fitness:    false,
  }
  const loggedCount = Object.values(loggedModules).filter(Boolean).length
  const recentFood  = (foodLogs || []).slice(-3).reverse()

  const anim = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080808;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        .ax-pill:hover{background:rgba(255,255,255,0.06)!important;border-color:rgba(255,255,255,0.18)!important;}
        .ax-log-row:hover{background:rgba(255,255,255,0.03);border-radius:8px;}
        .ax-btn-white:hover{background:rgba(255,255,255,0.88)!important;box-shadow:0 0 22px rgba(255,255,255,0.22)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#080808', WebkitFontSmoothing:'antialiased', paddingBottom:90 }}>

        {/* Sticky Header */}
        <div style={{
          position:'sticky', top:0, zIndex:50,
          background:'rgba(8,8,8,0.93)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
          borderBottom:'1px solid rgba(255,255,255,0.07)',
          padding:'14px 16px 12px',
        }}>
          <p style={{ color:'rgba(255,255,255,0.22)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>
            {dayName} · {dateStr}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <h1 style={{ color:'#fff', fontWeight:900, fontSize:21, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em', lineHeight:1.15 }}>
              {getGreeting()},{' '}
              <span style={{ fontStyle:'italic', fontFamily:"'EB Garamond',serif", fontWeight:400, fontSize:23 }}>{displayName}.</span>
            </h1>
            <button onClick={() => navigate('/food')} className="ax-btn-white"
              style={{ background:'#fff', color:'#080808', border:'none', borderRadius:9, padding:'9px 14px', fontSize:11, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'background 0.2s,box-shadow 0.2s', display:'flex', alignItems:'center', gap:5 }}>
              {Ico.plus(12)} Log
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto' }}>

          {/* 2×2 Stat Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, ...anim(60) }}>
            {[
              { label:'Calories', value: calories.toLocaleString(), sub:`of ${CALORIE_GOAL.toLocaleString()} goal`, pct: calPct },
              { label:'Water',    value:`${waterCount} / ${WATER_GOAL}`, sub:'glasses today', pct: waterPct },
              { label:'Weight',   value: latest ? `${latest} lb` : '—', sub: latest && weightGoal ? `${Math.max(0,latest-weightGoal).toFixed(1)} lb from goal` : 'not logged', pct: null },
              { label:'Today',    value:`${loggedCount} / 6`, sub:'modules logged', pct: Math.round((loggedCount/6)*100) },
            ].map(({ label, value, sub, pct }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, right:0, width:50, height:50, background:'radial-gradient(circle at top right,rgba(255,255,255,0.05),transparent 70%)', pointerEvents:'none' }} />
                <p style={{ color:'rgba(255,255,255,0.28)', fontSize:9, letterSpacing:'0.24em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</p>
                <p style={{ color:'#fff', fontSize:24, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, marginBottom:4 }}>{value}</p>
                <p style={{ color:'rgba(255,255,255,0.22)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginBottom: pct != null ? 10 : 0 }}>{sub}</p>
                {pct != null && <GlowBar pct={pct} />}
              </div>
            ))}
          </div>

          {/* Modules */}
          <Card style={anim(160)}>
            <SectionHead title="Today's Modules" actionLabel={`${loggedCount} of 6`} />
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {modules.map(({ key, label, path, icon }, i) => {
                const done = loggedModules[key]
                return (
                  <button key={key} onClick={() => navigate(path)} className="ax-pill"
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'13px 14px', borderRadius:11,
                      border:`1px solid ${done ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)'}`,
                      background: done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      cursor:'pointer', textAlign:'left', width:'100%',
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(-8px)',
                      transition: `opacity 0.4s ease ${200 + i*45}ms, transform 0.4s ease ${200 + i*45}ms, background 0.2s, border-color 0.2s`,
                    }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background: done ? '#fff' : 'rgba(255,255,255,0.15)', boxShadow: done ? '0 0 7px rgba(255,255,255,0.7)' : 'none', flexShrink:0 }} />
                      <div style={{ color: done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)' }}>{icon(15)}</div>
                      <div>
                        <p style={{ color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)', fontSize:13, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif', marginBottom:1 }}>{label}</p>
                        <p style={{ color: done ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.18)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{done ? 'Logged' : 'Pending'}</p>
                      </div>
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.2)' }}>{Ico.chevron()}</div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Food */}
          <Card style={anim(280)}>
            <SectionHead title="Recent Food Log" action={() => navigate('/food')} actionLabel="View all →" />
            {recentFood.length === 0
              ? <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontStyle:'italic', fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'14px 0' }}>Nothing logged yet today.</p>
              : recentFood.map((e, i) => (
                <div key={e.id} className="ax-log-row" style={{ display:'flex', justifyContent:'space-between', padding:'10px 6px', borderBottom: i < recentFood.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition:'background 0.15s' }}>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>{e.food_name}</span>
                  <span style={{ color:'rgba(255,255,255,0.35)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif' }}>{e.calories} cal</span>
                </div>
              ))
            }
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:14 }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Remaining</p>
                <p style={{ color:'#fff', fontWeight:900, fontSize:16, fontFamily:'Helvetica Neue,sans-serif' }}>{calLeft.toLocaleString()} cal</p>
              </div>
              <div style={{ flex:1 }}>
                <GlowBar pct={calPct} h={4} />
                <p style={{ color:'rgba(255,255,255,0.22)', fontSize:10, textAlign:'right', marginTop:5, fontFamily:'Helvetica Neue,sans-serif' }}>{calPct}%</p>
              </div>
            </div>
          </Card>

          {/* Water */}
          <Card style={anim(340)}>
            <SectionHead title="Water Intake" action={() => navigate('/water')} actionLabel="Open →" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:12 }}>
              {Array.from({ length: WATER_GOAL }).map((_,i) => (
                <div key={i} style={{ width:30, height:30, borderRadius:'50%', background: i < waterCount ? '#fff' : 'rgba(255,255,255,0.06)', border:`1px solid ${i < waterCount ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, boxShadow: i < waterCount ? '0 0 8px rgba(255,255,255,0.4)' : 'none', transition:'all 0.3s' }} />
              ))}
            </div>
            <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:10 }}>
              {waterCount >= WATER_GOAL ? 'Goal reached — well done.' : `${WATER_GOAL - waterCount} glass${WATER_GOAL - waterCount !== 1 ? 'es' : ''} remaining`}
            </p>
            <GlowBar pct={waterPct} />
          </Card>

          {/* Prayer */}
          <Card style={anim(400)}>
            <SectionHead title="Prayer" action={() => navigate('/prayer')} actionLabel="Open →" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[{ label:'Today', value: todayPrayers, sub:'logged' },{ label:'Answered', value: answeredCount, sub:'total' }].map(({ label, value, sub }) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'13px 14px' }}>
                  <p style={{ color:'rgba(255,255,255,0.28)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</p>
                  <p style={{ color:'#fff', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, marginBottom:4 }}>{value}</p>
                  <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/prayer')}
              style={{ width:'100%', padding:'11px', borderRadius:8, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, cursor:'pointer', transition:'border-color 0.2s,color 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.4)'}}
            >
              + Log a prayer
            </button>
          </Card>

        </div>
      </div>

      <BottomNav />
    </>
  )
}
