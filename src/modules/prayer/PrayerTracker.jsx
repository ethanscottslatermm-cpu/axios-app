import { useState, useEffect } from 'react'
import prayerIconSrc from '../../prayer-icon.png'
import { useToday } from '../../hooks/useToday'
import { useHaptic } from '../../hooks/useHaptic'
import { useNavigate } from 'react-router-dom'
import { usePrayers } from '../../hooks/usePrayers'
import { BottomNav } from '../../pages/Dashboard'
import Devotional from '../devotional/Devotional'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import DailyPrayer from './DailyPrayer'
import devotionHeroImg from '../fitness/Images/Devotion.png'

// ── Date ───────────────────────────────────────────────────────────────────────

const PRAYER_IMG = devotionHeroImg


// ── Categories ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Gratitude',
  'Intercession',
  'Confession',
  'Petition',
  'Praise',
  'Guidance',
  'Protection',
  'Healing',
]

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ico = {
  back:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  close: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  check: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  plus:  (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  trash: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  dove:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12H3s.55-3.03 2-4c2.18-1.49 6 0 6 0V5a2 2 0 0 1 2-2c1.48 0 2.3.48 3 1.5L19 7c1 1.35 1 2.5.16 4L16 12z"/><path d="m16 12-5 2-2.7 2.7A2 2 0 0 0 8 18a2 2 0 0 0 4 0c0-.7-.5-2-2-3l6-3z"/></svg>,
  filter:(s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:`linear-gradient(to bottom,var(--accent-prayer),transparent)`, borderRadius:2, boxShadow:`0 0 8px var(--accent-prayer)` }} />
        <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {sub && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>}
    </div>
  )
}

// ── Add Prayer Sheet ───────────────────────────────────────────────────────────
function AddPrayerSheet({ onSave, onClose, todayStr }) {
  const [category, setCategory] = useState('Gratitude')
  const [text,     setText]     = useState('')
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [visible,  setVisible]  = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const handleSave = async () => {
    if (!text.trim()) { setError('Please write your prayer.'); return }
    setError(''); setSaving(true)
    try {
      await onSave({ category, prayer_text: text.trim(), note: note.trim(), answered: false, date: todayStr })
      onClose()
    } catch (e) {
      setError(e.message || 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--overlay-bg)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{
        width:'100%', maxWidth:520, margin:'0 auto',
        background:'var(--sheet-bg)', borderTop:'1px solid var(--border)',
        borderRadius:'18px 18px 0 0',
        padding:'20px 18px max(28px,env(safe-area-inset-bottom))',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.35s cubic-bezier(.16,1,.3,1)',
        maxHeight:'88vh', overflowY:'auto',
      }}>
        {/* Handle */}
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.13)', borderRadius:99, margin:'0 auto 22px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>New Entry</p>
            <h2 style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>Log a Prayer</h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {/* Category chips */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:10 }}>Category</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding:'7px 13px', borderRadius:99, border:`1px solid ${category===c ? 'rgba(200,160,0,0.5)' : 'rgba(212,212,232,0.09)'}`, background: category===c ? 'rgba(200,160,0,0.15)' : 'rgba(212,212,232,0.03)', color: category===c ? '#c8a000' : 'rgba(212,212,232,0.38)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight: category===c ? 700 : 400, cursor:'pointer', transition:'all 0.18s', boxShadow: category===c ? '0 0 10px rgba(200,160,0,0.2)' : 'none' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Prayer text */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Prayer</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your prayer here…"
            rows={5}
            style={{ width:'100%', background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px', color:'var(--text-primary)', fontSize:14, fontFamily:"'EB Garamond', serif", fontStyle:'italic', lineHeight:1.7, resize:'none', outline:'none', transition:'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor='rgba(212,212,232,0.25)'}
            onBlur={e => e.target.style.borderColor='rgba(212,212,232,0.09)'}
          />
        </div>

        {/* Note (optional) */}
        <div style={{ marginBottom:8 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Note <span style={{ color:'rgba(212,212,232,0.18)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any context or scripture reference…"
            style={{ width:'100%', background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'12px 14px', color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', outline:'none', transition:'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor='rgba(212,212,232,0.25)'}
            onBlur={e => e.target.style.borderColor='rgba(212,212,232,0.09)'}
          />
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12, marginTop:8 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', padding:'15px', background:'rgba(200,160,0,0.15)', color:'#c8a000', border:'1px solid rgba(200,160,0,0.4)', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s', boxShadow:'0 0 14px rgba(200,160,0,0.1)' }}
          onMouseEnter={e => { if(!saving){ e.currentTarget.style.background='rgba(200,160,0,0.25)'; e.currentTarget.style.boxShadow='0 0 22px rgba(200,160,0,0.25)' }}}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(200,160,0,0.15)'; e.currentTarget.style.boxShadow='0 0 14px rgba(200,160,0,0.1)' }}
        >
          {saving ? 'Saving…' : <>{Ico.check()} Log Prayer</>}
        </button>
      </div>
    </div>
  )
}

// ── Prayer Card ────────────────────────────────────────────────────────────────
function PrayerCard({ prayer, onToggleAnswered, onDelete, delay, visible, todayStr }) {
  const [confirming, setConfirming] = useState(false)
  const [expanded,   setExpanded]   = useState(false)
  const isToday = prayer.date === todayStr

  const handleDelete = () => {
    if (confirming) { onDelete(prayer.id); return }
    setConfirming(true)
    setTimeout(() => setConfirming(false), 2500)
  }

  return (
    <div style={{
      background: prayer.answered ? 'rgba(212,212,232,0.04)' : 'rgba(212,212,232,0.02)',
      border:`1px solid ${prayer.answered ? 'rgba(212,212,232,0.14)' : 'rgba(212,212,232,0.07)'}`,
      borderRadius:14, padding:'16px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      position:'relative', overflow:'hidden',
    }}>
      {/* Answered glow accent */}
      {prayer.answered && (
        <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:'radial-gradient(circle at top right, rgba(212,212,232,0.07), transparent 70%)', pointerEvents:'none' }} />
      )}

      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {/* Category badge */}
          <span style={{ padding:'3px 10px', borderRadius:99, background:'rgba(212,212,232,0.07)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.1em', fontWeight:600 }}>
            {prayer.category}
          </span>
          {isToday && (
            <span style={{ padding:'3px 8px', borderRadius:99, background:'var(--bg-card)', color:'var(--text-muted)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.12em' }}>
              TODAY
            </span>
          )}
          {prayer.answered && (
            <span style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:99, background:'rgba(200,160,0,0.15)', border:'1px solid rgba(200,160,0,0.4)', color:'#c8a000', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, letterSpacing:'0.08em', boxShadow:'0 0 8px rgba(200,160,0,0.15)' }}>
              {Ico.check(11)} Answered
            </span>
          )}
        </div>
        <p style={{ color:'rgba(212,212,232,0.2)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0, marginTop:2 }}>{formatDate(prayer.date)}</p>
      </div>

      {/* Prayer text */}
      <div style={{ marginBottom: prayer.note ? 10 : 14 }}>
        <p style={{
          color:'rgba(212,212,232,0.75)', fontSize:14, fontFamily:"'EB Garamond', serif", fontStyle:'italic', lineHeight:1.75,
          display:'-webkit-box', WebkitBoxOrient:'vertical', overflow:'hidden',
          WebkitLineClamp: expanded ? 'unset' : 3,
        }}>
          {prayer.prayer_text}
        </p>
        {prayer.prayer_text?.length > 160 && (
          <button onClick={() => setExpanded(e => !e)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginTop:4, padding:0 }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Note */}
      {prayer.note && (
        <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.6, marginBottom:14, paddingLeft:10, borderLeft:'2px solid rgba(212,212,232,0.1)' }}>
          {prayer.note}
        </p>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:'1px solid rgba(212,212,232,0.06)' }}>
        <button onClick={() => onToggleAnswered(prayer.id, prayer.answered)}
          style={{ flex:1, padding:'9px 12px', borderRadius:9, background: prayer.answered ? 'rgba(200,160,0,0.15)' : 'rgba(212,212,232,0.04)', border:`1px solid ${prayer.answered ? 'rgba(200,160,0,0.4)' : 'rgba(212,212,232,0.09)'}`, color: prayer.answered ? '#c8a000' : 'rgba(212,212,232,0.35)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          {prayer.answered ? <>{Ico.check(12)} Answered</> : 'Mark Answered'}
        </button>
        <button onClick={handleDelete}
          style={{ padding:'9px 12px', borderRadius:9, background: confirming ? 'rgba(255,60,60,0.1)' : 'rgba(212,212,232,0.03)', border:`1px solid ${confirming ? 'rgba(255,60,60,0.3)' : 'rgba(212,212,232,0.08)'}`, color: confirming ? 'rgba(255,100,100,0.85)' : 'rgba(212,212,232,0.25)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:4, fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
          {confirming ? 'Confirm?' : Ico.trash()}
        </button>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PrayerTracker() {
  const todayStr = useToday()
  const haptic = useHaptic()
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const { prayers, addPrayer, toggleAnswered, isLoading: loading } = usePrayers()

  const [visible,   setVisible]   = useState(false)
  const [showAdd,   setShowAdd]   = useState(false)
  const [filter,    setFilter]    = useState('Today')
  const [catFilter, setCatFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('prayer')

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  // Stats
  const todayPrayers  = (prayers || []).filter(p => p.date === todayStr)
  const answeredTotal = (prayers || []).filter(p => p.answered).length
  const streak        = (() => {
    // Count consecutive days with at least one prayer
    const days = new Set((prayers||[]).map(p=>p.date))
    let count = 0, d = new Date()
    while (days.has(d.toISOString().split('T')[0])) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  // Filtering
  const filtered = (prayers || []).filter(p => {
    if (filter === 'Today')      return p.date === todayStr
    if (filter === 'Answered')   return p.answered
    if (filter === 'Unanswered') return !p.answered
    return true
  }).filter(p => catFilter === 'All' || p.category === catFilter)
  .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))

  // Categories that have entries
  const usedCategories = [...new Set((prayers||[]).map(p => p.category))].filter(Boolean)

  const anim = (d=0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--bg-primary);overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(212,212,232,0.1);border-radius:99px;}
        textarea::placeholder,input::placeholder{color:rgba(212,212,232,0.2);}
        textarea:focus,input:focus{outline:none;}
        .ax-back:hover{background:rgba(212,212,232,0.08)!important;}
        .ax-add-btn:hover{background:rgba(212,212,232,0.88)!important;box-shadow:0 0 22px rgba(212,212,232,0.2)!important;}
        .ax-filter-tab:hover{background:rgba(212,212,232,0.06)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom:90, position:'relative' }}>
        <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`url(${PRAYER_IMG})`, backgroundSize:'cover', backgroundPosition:'center 20%', backgroundRepeat:'no-repeat', opacity:0.11, filter:'grayscale(100%) contrast(1.3) brightness(1.1)', pointerEvents:'none' }} />
        <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, rgba(8,8,8,0.18) 40%, rgba(8,8,8,0.9) 100%)', pointerEvents:'none' }} />

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
                <h1 style={{ color:'#c8a000', fontWeight:400, fontSize:18, fontFamily:"'The Seasons', serif", letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Devotion</h1>
                <img src={prayerIconSrc} width={20} height={20} style={{ filter:'brightness(0) invert(1)', objectFit:'contain', opacity:0.72, display:'block' }} alt="" />
              </div>
            </div>
            <button onClick={() => setShowAdd(true)} className="ax-add-btn"
              style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 16px', borderRadius:9, background:'var(--btn-bg)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.2s', flexShrink:0 }}>
              {Ico.plus(13)} Pray
            </button>
          </div>

          {/* Stat row */}
          {activeTab === 'prayer' && (
          <div style={{ display:'flex', gap:10 }}>
            {[
              { label:'Today',    value: todayPrayers.length },
              { label:'Answered', value: answeredTotal },
              { label:'Streak',   value: `${streak}d` },
              { label:'Total',    value: (prayers||[]).length },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex:1, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'10px 10px', textAlign:'center' }}>
                <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{label}</p>
                <p style={{ color:'var(--text-primary)', fontSize:20, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{value}</p>
              </div>
            ))}
          </div>
          )}

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:8, marginTop: activeTab === 'prayer' ? 12 : 0 }}>
            {[['prayer','Devotion'],['devotional','Scripture']].map(([key, label]) => {
              const isActive = activeTab === key
              return (
                <button key={key} onClick={() => setActiveTab(key)} className="ax-filter-tab"
                  style={{
                    flex:1, padding:'10px', borderRadius:10,
                    border: isActive ? '1px solid rgba(200,160,0,0.55)' : '1px solid rgba(212,212,232,0.06)',
                    background: isActive ? 'rgba(200,160,0,0.12)' : 'rgba(212,212,232,0.03)',
                    color: isActive ? '#c8a000' : 'rgba(212,212,232,0.35)',
                    boxShadow: isActive ? '0 0 12px rgba(200,160,0,0.18)' : 'none',
                    fontSize:12, fontFamily:'Helvetica Neue,sans-serif',
                    fontWeight: isActive ? 700 : 400,
                    cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.04em',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Devotional Tab ── */}
        {activeTab === 'devotional' && <Devotional embedded />}

        {/* ── Prayer Body ── */}
        <div style={{ padding:'16px', display: activeTab === 'prayer' ? 'flex' : 'none', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* ── Daily Prayer ── */}
          <DailyPrayer anim={anim} visible={visible} />

          {/* Status filter tabs */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, ...anim(80) }}>
            {['All','Today','Answered','Unanswered'].map(f => {
              const active = filter === f
              return (
                <button key={f} onClick={() => setFilter(f)} className="ax-filter-tab"
                  style={{ padding:'8px 14px', borderRadius:99, border:`1px solid ${active ? 'rgba(200,160,0,0.5)' : 'rgba(212,212,232,0.08)'}`, background: active ? 'rgba(200,160,0,0.12)' : 'rgba(212,212,232,0.03)', color: active ? '#c8a000' : 'rgba(212,212,232,0.35)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight: active ? 700 : 400, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', flexShrink:0 }}>
                  {f}
                </button>
              )
            })}
          </div>

          {/* Category filter */}
          {usedCategories.length > 0 && (
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, ...anim(130) }}>
              {['All', ...usedCategories].map(c => {
                const active = catFilter === c
                return (
                  <button key={c} onClick={() => setCatFilter(c)} className="ax-filter-tab"
                    style={{ padding:'6px 12px', borderRadius:99, border:`1px solid ${active ? 'rgba(200,160,0,0.4)' : 'rgba(212,212,232,0.06)'}`, background: active ? 'rgba(200,160,0,0.1)' : 'transparent', color: active ? '#c8a000' : 'rgba(212,212,232,0.28)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight: active ? 600 : 400, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', flexShrink:0, letterSpacing:'0.06em' }}>
                    {c}
                  </button>
                )
              })}
            </div>
          )}

          {/* Prayer list */}
          <div style={anim(180)}>
            <SectionHead
              title="Prayers"
              sub={`${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`}
            />

            {loading && (
              <p style={{ color:'rgba(212,212,232,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'24px 0', fontStyle:'italic' }}>Loading…</p>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:14, padding:'40px 20px', textAlign:'center' }}>
                <div style={{ color:'rgba(212,212,232,0.15)', marginBottom:12, display:'flex', justifyContent:'center' }}>{Ico.dove(32)}</div>
                <p style={{ color:'var(--text-muted)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7, marginBottom:16 }}>
                  {filter === 'All' ? 'Your prayer journal is empty.\nBegin with a single word.' : `No ${filter.toLowerCase()} prayers.`}
                </p>
                <button onClick={() => setShowAdd(true)}
                  style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, background:'rgba(212,212,232,0.07)', border:'1px solid rgba(212,212,232,0.12)', color:'var(--text-secondary)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                  {Ico.plus(12)} Log your first prayer
                </button>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {filtered.map((prayer, i) => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  todayStr={todayStr}
                  onToggleAnswered={(id, currentAnswered) => { haptic.success(); toggleAnswered.mutate({ id, answered: !currentAnswered }) }}
                  onDelete={async (id) => { await supabase.from('prayer_logs').delete().eq('id', id); qc.invalidateQueries({ queryKey: ['prayer_logs'] }); }}
                  delay={i * 45}
                  visible={visible}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {showAdd && (
        <AddPrayerSheet
          onSave={async (p) => { haptic.bump(); await addPrayer.mutateAsync({ category: p.category, prayer_text: p.prayer_text, note: p.note }) }}
          onClose={() => setShowAdd(false)}
          todayStr={todayStr}
        />
      )}

      <BottomNav />
    </>
  )
}
