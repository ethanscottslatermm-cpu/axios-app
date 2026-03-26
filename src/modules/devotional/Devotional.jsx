import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { BottomNav } from '../../pages/Dashboard'

const todayStr = new Date().toISOString().split('T')[0]
const todayLabel = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ico = {
  back:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  book:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  close:   (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  check:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  refresh: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  edit:    (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  cross:   (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg>,
}

// ── Daily verse references (cycles deterministically by day of year) ───────────
const VERSE_REFS = [
  'john/3/16','psalms/23/1','philippians/4/13','romans/8/28','jeremiah/29/11',
  'proverbs/3/5','isaiah/40/31','matthew/6/33','joshua/1/9','romans/12/2',
  'psalms/46/1','john/14/6','galatians/5/22','ephesians/2/8','hebrews/11/1',
  'matthew/11/28','romans/8/38','psalms/119/105','john/16/33','philippians/4/6',
  '1corinthians/13/4','james/1/2','romans/5/8','psalms/27/1','isaiah/41/10',
  'john/15/13','matthew/5/16','romans/10/9','1john/4/19','proverbs/31/25',
]

function getDailyRef() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff  = new Date() - start
  const day   = Math.floor(diff / (1000 * 60 * 60 * 24))
  return VERSE_REFS[day % VERSE_REFS.length]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'20px 18px', ...style }}>
      {children}
    </div>
  )
}

// ── Journal Sheet ──────────────────────────────────────────────────────────────
function JournalSheet({ existing, verseRef, verseText, onSave, onClose }) {
  const [reflection,   setReflection]   = useState(existing?.reflection   || '')
  const [application,  setApplication]  = useState(existing?.application  || '')
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [visible,      setVisible]      = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const handleSave = async () => {
    if (!reflection.trim()) { setError('Please write your reflection.'); return }
    setError(''); setSaving(true)
    try {
      await onSave({ reflection: reflection.trim(), application: application.trim() })
      onClose()
    } catch(e) {
      setError(e.message || 'Failed to save.')
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'#0d0d0d', borderTop:'1px solid rgba(255,255,255,0.1)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(28px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)', maxHeight:'90vh', overflowY:'auto' }}>

        <div style={{ width:36, height:4, background:'rgba(255,255,255,0.13)', borderRadius:99, margin:'0 auto 22px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>Today's Devotional</p>
            <h2 style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>My Journal</h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {/* Verse reminder */}
        {verseText && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 14px', marginBottom:20 }}>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{verseRef?.toUpperCase().replace(/\//g,' ')}</p>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7 }}>{verseText}</p>
          </div>
        )}

        {/* Reflection */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Reflection</label>
          <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="What does this scripture mean to you today?" rows={5}
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:'14px', color:'#fff', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, resize:'none', outline:'none', transition:'border-color 0.2s' }}
            onFocus={e=>e.target.style.borderColor='rgba(255,255,255,0.25)'}
            onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.09)'} />
        </div>

        {/* Application */}
        <div style={{ marginBottom:8 }}>
          <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>
            Application <span style={{ color:'rgba(255,255,255,0.18)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span>
          </label>
          <textarea value={application} onChange={e => setApplication(e.target.value)} placeholder="How will you apply this today?" rows={3}
            style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:'14px', color:'#fff', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, resize:'none', outline:'none', transition:'border-color 0.2s' }}
            onFocus={e=>e.target.style.borderColor='rgba(255,255,255,0.25)'}
            onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.09)'} />
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12, marginTop:8 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', padding:'15px', background:'#fff', color:'#080808', border:'none', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving?'not-allowed':'pointer', opacity: saving?0.6:1, marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s' }}
          onMouseEnter={e=>{if(!saving){e.currentTarget.style.background='rgba(255,255,255,0.88)'}}}
          onMouseLeave={e=>{e.currentTarget.style.background='#fff'}}>
          {saving ? 'Saving…' : <>{Ico.check()} Save Journal</>}
        </button>
      </div>
    </div>
  )
}

// ── Past Entry Card ────────────────────────────────────────────────────────────
function PastEntry({ entry, delay, visible }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden', opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(12px)', transition:`opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms` }}>
      <button onClick={() => setExpanded(e=>!e)} style={{ width:'100%', padding:'14px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginBottom:2 }}>
            {entry.scripture_ref?.toUpperCase().replace(/\//g,' ')}
          </p>
          <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
            {new Date(entry.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
          </p>
        </div>
        <span style={{ color:'rgba(255,255,255,0.2)', transform: expanded?'rotate(90deg)':'none', transition:'transform 0.2s', fontSize:18 }}>›</span>
      </button>
      {expanded && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {entry.scripture_text && (
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:14 }}>
              "{entry.scripture_text}"
            </p>
          )}
          {entry.reflection && (
            <div style={{ marginBottom:10 }}>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Reflection</p>
              <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7 }}>{entry.reflection}</p>
            </div>
          )}
          {entry.application && (
            <div>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Application</p>
              <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7 }}>{entry.application}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Devotional() {
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [visible,     setVisible]     = useState(false)
  const [verse,       setVerse]       = useState(null)   // { text, reference }
  const [verseRef,    setVerseRef]    = useState('')
  const [verseLoading,setVerseLoading]= useState(true)
  const [today,       setToday]       = useState(null)   // today's devotional entry from DB
  const [history,     setHistory]     = useState([])
  const [showJournal, setShowJournal] = useState(false)
  const [loadingDB,   setLoadingDB]   = useState(true)
  const [streak,      setStreak]      = useState(0)

  // Fetch verse from bible-api.com
  useEffect(() => {
    const ref = getDailyRef()
    setVerseRef(ref)
    fetch(`https://bible-api.com/${ref}`)
      .then(r => r.json())
      .then(data => {
        setVerse({ text: data.text?.trim(), reference: data.reference })
        setVerseLoading(false)
      })
      .catch(() => {
        setVerse({ text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', reference: 'Jeremiah 29:11' })
        setVerseLoading(false)
      })
  }, [])

  // Load today's entry + history from Supabase
  useEffect(() => {
    if (!user) return
    loadDevotionals()
    setTimeout(() => setVisible(true), 60)
  }, [user])

  const loadDevotionals = async () => {
    setLoadingDB(true)
    try {
      const { data } = await supabase
        .from('devotionals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      const entries = data || []
      const todayEntry = entries.find(e => e.date === todayStr)
      setToday(todayEntry || null)
      setHistory(entries.filter(e => e.date !== todayStr))

      // Calculate streak
      let s = 0, d = new Date()
      const days = new Set(entries.map(e => e.date))
      while (days.has(d.toISOString().split('T')[0])) {
        s++; d.setDate(d.getDate() - 1)
      }
      setStreak(s)
    } catch(e) {
      console.error(e)
    } finally {
      setLoadingDB(false)
    }
  }

  const handleSaveJournal = async ({ reflection, application }) => {
    const payload = {
      user_id:        user.id,
      date:           todayStr,
      scripture_ref:  verseRef,
      scripture_text: verse?.text || '',
      reflection,
      application,
    }
    if (today?.id) {
      await supabase.from('devotionals').update(payload).eq('id', today.id)
    } else {
      await supabase.from('devotionals').insert(payload)
    }
    await loadDevotionals()
  }

  const anim = (d=0) => ({
    opacity: visible?1:0,
    transform: visible?'translateY(0)':'translateY(14px)',
    transition:`opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080808;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        textarea::placeholder{color:rgba(255,255,255,0.2);}
        textarea:focus{outline:none;}
        .ax-back:hover{background:rgba(255,255,255,0.08)!important;}
        .ax-journal-btn:hover{background:rgba(255,255,255,0.88)!important;box-shadow:0 0 22px rgba(255,255,255,0.2)!important;}
        .ax-edit-btn:hover{border-color:rgba(255,255,255,0.25)!important;color:rgba(255,255,255,0.65)!important;}
        @keyframes fadeVerse {
          from{opacity:0;transform:translateY(6px);}
          to{opacity:1;transform:translateY(0);}
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#080808', WebkitFontSmoothing:'antialiased', paddingBottom:90 }}>

        {/* ── Sticky Header ── */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,8,8,0.93)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>AXIOS</p>
              <h1 style={{ color:'#fff', fontWeight:900, fontSize:20, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Daily Devotional</h1>
            </div>
            {today && (
              <button onClick={() => setShowJournal(true)} className="ax-edit-btn"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', borderRadius:9, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.2s' }}>
                {Ico.edit()} Edit
              </button>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:10 }}>
            {[
              { label:'Streak',   value:`${streak}d` },
              { label:'Total',    value: history.length + (today ? 1 : 0) },
              { label:'Today',    value: today ? '✓' : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 10px', textAlign:'center' }}>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{label}</p>
                <p style={{ color:'#fff', fontSize:20, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto' }}>

          {/* Date label */}
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:11, fontFamily:"'EB Garamond',serif", fontStyle:'italic', letterSpacing:'0.06em', ...anim(60) }}>
            {todayLabel}
          </p>

          {/* Scripture card */}
          <div style={{ position:'relative', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'24px 20px', overflow:'hidden', ...anim(100) }}>
            {/* Decorative cross */}
            <div style={{ position:'absolute', top:16, right:16, color:'rgba(255,255,255,0.04)', pointerEvents:'none' }}>{Ico.cross(48)}</div>

            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:16 }}>
              {verseLoading ? 'Loading…' : verse?.reference}
            </p>

            {verseLoading ? (
              <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>Fetching today's verse…</p>
              </div>
            ) : (
              <p style={{ color:'rgba(255,255,255,0.85)', fontSize:18, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.85, letterSpacing:'0.01em', animation:'fadeVerse 0.7s ease both' }}>
                "{verse?.text}"
              </p>
            )}

            <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ color:'rgba(255,255,255,0.2)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.12em' }}>KJV · DAILY VERSE</p>
            </div>
          </div>

          {/* Journal section */}
          {!today ? (
            <div style={anim(200)}>
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.1)', borderRadius:14, padding:'32px 20px', textAlign:'center', marginBottom:0 }}>
                <div style={{ color:'rgba(255,255,255,0.15)', marginBottom:14, display:'flex', justifyContent:'center' }}>{Ico.book(30)}</div>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:15, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7, marginBottom:20 }}>
                  Reflect on today's scripture.<br/>Write what it means to you.
                </p>
                <button onClick={() => setShowJournal(true)} className="ax-journal-btn"
                  style={{ padding:'13px 28px', background:'#fff', color:'#080808', border:'none', borderRadius:10, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', transition:'all 0.2s', display:'inline-flex', alignItems:'center', gap:7 }}>
                  {Ico.edit()} Write Reflection
                </button>
              </div>
            </div>
          ) : (
            <Card style={anim(200)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <SectionHead title="Today's Journal" />
                <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.5)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
                  {Ico.check()} Completed
                </span>
              </div>

              {today.reflection && (
                <div style={{ marginBottom:14 }}>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Reflection</p>
                  <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.8 }}>{today.reflection}</p>
                </div>
              )}

              {today.application && (
                <div style={{ paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Application</p>
                  <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.8 }}>{today.application}</p>
                </div>
              )}

              <button onClick={() => setShowJournal(true)} className="ax-edit-btn"
                style={{ marginTop:16, width:'100%', padding:'10px', borderRadius:9, background:'transparent', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.35)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}>
                {Ico.edit()} Edit Entry
              </button>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={anim(300)}>
              <SectionHead title="Past Devotionals" sub={`${history.length} entries`} />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {history.map((entry, i) => (
                  <PastEntry key={entry.id} entry={entry} delay={i*40} visible={visible} />
                ))}
              </div>
            </div>
          )}

          {history.length === 0 && today && (
            <div style={{ textAlign:'center', padding:'20px 0', ...anim(300) }}>
              <p style={{ color:'rgba(255,255,255,0.15)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>Past entries will appear here.</p>
            </div>
          )}

        </div>
      </div>

      {showJournal && (
        <JournalSheet
          existing={today}
          verseRef={verse?.reference}
          verseText={verse?.text}
          onSave={handleSaveJournal}
          onClose={() => setShowJournal(false)}
        />
      )}

      <BottomNav />
    </>
  )
}
