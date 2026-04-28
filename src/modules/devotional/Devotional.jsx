import { useState, useEffect, useRef } from 'react'
import { useToday } from '../../hooks/useToday'
import { useNavigate } from 'react-router-dom'
import prayerIconSrc from '../../prayer-icon.png'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { BottomNav } from '../../pages/Dashboard'


const PRAYER_IMG = 'data:image/jpeg;base64,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'

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
  'john+3:16','psalms+23:1','philippians+4:13','romans+8:28','jeremiah+29:11',
  'proverbs+3:5','isaiah+40:31','matthew+6:33','joshua+1:9','romans+12:2',
  'psalms+46:1','john+14:6','galatians+5:22','ephesians+2:8','hebrews+11:1',
  'matthew+11:28','romans+8:38','psalms+119:105','john+16:33','philippians+4:6',
  '1+corinthians+13:4','james+1:2','romans+5:8','psalms+27:1','isaiah+41:10',
  'john+15:13','matthew+5:16','romans+10:9','1+john+4:19','proverbs+31:25',
]

function getDailyRefFromPool(pool) {
  const now   = new Date()
  const start = Date.UTC(now.getFullYear(), 0, 0)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const day   = Math.round((today - start) / (1000 * 60 * 60 * 24))
  return pool[day % pool.length]
}

// ── Daily Devotional Pool ─────────────────────────────────────────────────────
const DAILY_DEVOTIONALS = [
  { type:'scripture', ref:'Matthew 5:8',         verse:'"Blessed are the pure in heart, for they shall see God."',                                                                            note:'Purity of heart is not about perfection — it is about undivided intention. Ask yourself today: what is my heart actually reaching toward?' },
  { type:'study',     focus:'The Psalms of Ascent', tip:'Read Psalms 120–134 slowly — these were songs sung by pilgrims walking to Jerusalem. Notice how each moves from distress to trust. What is your pilgrimage right now?' },
  { type:'prayer',    theme:'Morning Surrender',  text:'Father, before this day fills my hands, let it first fill my heart. I give You what I am planning, what I am dreading, and what I cannot predict. Let Your will be the axis everything else turns around. Amen.' },
  { type:'scripture', ref:'Lamentations 3:22–23', verse:'"The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning."',                        note:'Today is a new day — not a continuation of your worst one. Mercies that are new every morning are not rationed. They are renewed.' },
  { type:'study',     focus:'Job 38–39',          tip:'Read God\'s answer to Job from the storm. Notice what God asks, not what He explains. Sometimes the answer to suffering is not a reason but a revelation of who is holding the universe.' },
  { type:'prayer',    theme:'Gratitude',          text:'Lord, I name three things I have received that I did not earn: this breath, the people who have stayed, and the certainty that I am not alone. Teach me to hold what You have given with open and grateful hands.' },
  { type:'scripture', ref:'Romans 8:1',           verse:'"There is now no condemnation for those who are in Christ Jesus."',                                                                  note:'That word "now" matters. Not "soon" or "eventually." Condemnation has no legal standing on your life today. You are free to move.' },
  { type:'study',     focus:'The Sermon on the Mount', tip:'Read Matthew 5–7 in one sitting. Identify one teaching you find most difficult. Sit with the discomfort — the parts of Scripture that challenge us reveal where we most need to grow.' },
  { type:'prayer',    theme:'For Others',         text:'God, bring to mind someone who needs more grace than I have been extending. Give me eyes to see past behavior to the person beneath it. Let me be someone worth being trusted.' },
  { type:'scripture', ref:'Isaiah 30:21',         verse:'"Whether you turn to the right or to the left, your ears will hear a voice saying, \'This is the way; walk in it.\'"',              note:'Guidance does not always come as a clear map ahead. Often it comes as a quiet confirmation behind you. Have you been listening?' },
  { type:'study',     focus:'Philippians',        tip:'Read Philippians in one sitting. Paul wrote it from prison, yet "joy" appears 16 times. Ask: what is the source of joy that does not depend on circumstances?' },
  { type:'prayer',    theme:'Confession',         text:'Lord, there are things I have done and left undone that I would undo if I could. I bring them honestly — not to bargain but to release. You know all of it already. Thank You for grace that is not surprised by any of it.' },
  { type:'scripture', ref:'Proverbs 4:23',        verse:'"Above all else, guard your heart, for everything you do flows from it."',                                                           note:'The heart is not just where feelings live — it is the source of direction. What you protect and expose your heart to shapes the entire trajectory of your life.' },
  { type:'study',     focus:'The Gospel of Mark', tip:'Read one chapter of Mark today. Notice how often Jesus heals someone and tells them not to tell anyone. Why was Jesus so deliberate about not letting His identity be reduced to spectacle?' },
  { type:'prayer',    theme:'Wisdom',             text:'Father, I face things today that require more discernment than I naturally carry. Give me wisdom rooted in what is true and good — not just clever reasoning. Slow me down before I speak.' },
  { type:'scripture', ref:'John 10:10',           verse:'"I have come that they may have life, and have it to the full."',                                                                    note:'Full life is not volume of activity — it is depth of meaning. Are you living fully or just living fast? The two are not the same.' },
  { type:'study',     focus:'Genesis 1–2',        tip:'Read the creation account and notice the rhythm: work, rest, order from chaos, things declared "good." Where in your own life might you bring more of that deliberate rhythm?' },
  { type:'prayer',    theme:'Peace',              text:'Lord, I ask for peace that does not depend on every problem being solved before it arrives. The peace You promise passes understanding — I accept that I may not understand it, only receive it.' },
  { type:'scripture', ref:'Micah 6:8',            verse:'"What does the Lord require of you? To act justly and to love mercy and to walk humbly with your God."',                            note:'Three things. Not thirty. Act, love, walk. Pick one to carry intentionally today.' },
  { type:'study',     focus:'The Lord\'s Prayer', tip:'Read Matthew 6:9–13 phrase by phrase. Each line is a complete prayer on its own. Choose one phrase and spend five minutes thinking about what it would mean to actually live it this week.' },
  { type:'prayer',    theme:'Evening',            text:'God, the day is closing. Some of it I\'d keep; some I\'d change. Cover it all in grace. I release tomorrow before it demands anything of me tonight. Let me rest in the knowledge that Your faithfulness does not stop when I do.' },
  { type:'scripture', ref:'1 Kings 19:12',        verse:'"And after the fire the sound of a low whisper."',                                                                                   note:'The most profound things God says often come in the quiet — not in the dramatic. Are you creating any space today for the whisper to reach you?' },
  { type:'study',     focus:'The Book of Ruth',   tip:'Read Ruth in a single sitting — four chapters. Notice how loyalty, loss, and redemption weave together without a single miracle. God\'s faithfulness is often visible only in hindsight.' },
  { type:'prayer',    theme:'Provision',          text:'Father, I name my needs honestly today — not because You have forgotten them, but because I need the act of trusting You with them. Provide in ways that build my faith and not just my comfort.' },
  { type:'scripture', ref:'Psalm 37:4',           verse:'"Delight yourself in the Lord, and he will give you the desires of your heart."',                                                    note:'The key word is "delight" — not demand. As we genuinely delight in who God is, our desires themselves are transformed into alignment with His.' },
  { type:'study',     focus:'The Beatitudes',     tip:'Read Matthew 5:3–12 and flip each quality against the culture you live in. "Blessed are the poor in spirit" inverts "blessed are the confident and self-sufficient." What does that inversion reveal?' },
  { type:'prayer',    theme:'Strength',           text:'Lord, I am worn in places I do not always show. Renew me — not just physically, but in the conviction that what I am doing matters and that You are with me in all of it.' },
  { type:'scripture', ref:'Romans 12:12',         verse:'"Be joyful in hope, patient in affliction, faithful in prayer."',                                                                    note:'Three disciplines for hard seasons — none of which require the hard season to be over first. Joy, patience, and faithfulness are practices. Available now, in this.' },
  { type:'study',     focus:'Ecclesiastes 1–2',  tip:'The Preacher explores meaning through pleasure, work, and wisdom — and finds each hollow alone. What are you building your sense of meaning on, and what happens when that thing is absent?' },
  { type:'prayer',    theme:'Boldness',           text:'God, there is something You\'ve placed in me that I have been small about. Give me the courage to use what You\'ve given without apology — not for recognition, but because holding back what You built for use is its own unfaithfulness.' },
]

function getDailyDevotional() {
  const now   = new Date()
  const start = Date.UTC(now.getFullYear(), 0, 0)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const day   = Math.round((today - start) / (1000 * 60 * 60 * 24))
  return DAILY_DEVOTIONALS[day % DAILY_DEVOTIONALS.length]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function SectionHead({ title, sub, onToggle, collapsed }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:`linear-gradient(to bottom,var(--accent-devotional),transparent)`, borderRadius:2, boxShadow:`0 0 8px var(--accent-devotional)` }} />
        <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {onToggle
        ? <button onClick={onToggle} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', display:'flex', alignItems:'center', gap:5 }}>
            {sub}
            <span style={{ display:'inline-block', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition:'transform 0.2s' }}>›</span>
          </button>
        : sub && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{sub}</p>
      }
    </div>
  )
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:14, padding:'20px 18px', ...style }}>
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
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--overlay-bg)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'var(--sheet-bg)', borderTop:'1px solid var(--border)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(28px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.35s cubic-bezier(.16,1,.3,1)', maxHeight:'90vh', overflowY:'auto' }}>

        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.13)', borderRadius:99, margin:'0 auto 22px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:3 }}>Today's Devotional</p>
            <h2 style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>My Journal</h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {/* Verse reminder */}
        {verseText && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'12px 14px', marginBottom:20 }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{verseRef?.toUpperCase().replace(/\//g,' ')}</p>
            <p style={{ color:'var(--text-secondary)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7 }}>{verseText}</p>
          </div>
        )}

        {/* Reflection */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Reflection</label>
          <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="What does this scripture mean to you today?" rows={5}
            style={{ width:'100%', background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px', color:'var(--text-primary)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, resize:'none', outline:'none', transition:'border-color 0.2s' }}
            onFocus={e=>e.target.style.borderColor='rgba(212,212,232,0.25)'}
            onBlur={e=>e.target.style.borderColor='rgba(212,212,232,0.09)'} />
        </div>

        {/* Application */}
        <div style={{ marginBottom:8 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>
            Application <span style={{ color:'rgba(212,212,232,0.18)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span>
          </label>
          <textarea value={application} onChange={e => setApplication(e.target.value)} placeholder="How will you apply this today?" rows={3}
            style={{ width:'100%', background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px', color:'var(--text-primary)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, resize:'none', outline:'none', transition:'border-color 0.2s' }}
            onFocus={e=>e.target.style.borderColor='rgba(212,212,232,0.25)'}
            onBlur={e=>e.target.style.borderColor='rgba(212,212,232,0.09)'} />
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12, marginTop:8 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', padding:'15px', background:'rgba(168,180,192,0.15)', color:'#a8b4c0', border:'1px solid rgba(168,180,192,0.4)', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving?'not-allowed':'pointer', opacity: saving?0.6:1, marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s', boxShadow:'0 0 14px rgba(168,180,192,0.1)' }}
          onMouseEnter={e=>{if(!saving){e.currentTarget.style.background='rgba(168,180,192,0.25)';e.currentTarget.style.boxShadow='0 0 22px rgba(168,180,192,0.25)'}}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(168,180,192,0.15)';e.currentTarget.style.boxShadow='0 0 14px rgba(168,180,192,0.1)'}}>
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
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:14, overflow:'hidden', opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(12px)', transition:`opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms` }}>
      <button onClick={() => setExpanded(e=>!e)} style={{ width:'100%', padding:'14px 16px', background:'none', border:'none', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ color:'rgba(212,212,232,0.6)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, marginBottom:2 }}>
            {entry.scripture_ref?.toUpperCase().replace(/\//g,' ')}
          </p>
          <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
            {new Date(entry.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
          </p>
        </div>
        <span style={{ color:'rgba(212,212,232,0.2)', transform: expanded?'rotate(90deg)':'none', transition:'transform 0.2s', fontSize:18 }}>›</span>
      </button>
      {expanded && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(212,212,232,0.06)' }}>
          {entry.scripture_text && (
            <p style={{ color:'var(--text-secondary)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, padding:'14px 0', borderBottom:'1px solid rgba(212,212,232,0.05)', marginBottom:14 }}>
              "{entry.scripture_text}"
            </p>
          )}
          {entry.reflection && (
            <div style={{ marginBottom:10 }}>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Reflection</p>
              <p style={{ color:'rgba(212,212,232,0.65)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7 }}>{entry.reflection}</p>
            </div>
          )}
          {entry.application && (
            <div>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Application</p>
              <p style={{ color:'rgba(212,212,232,0.65)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.7 }}>{entry.application}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Bible Reader ──────────────────────────────────────────────────────────────
const BOOKS = [
  // Old Testament
  { name:'Genesis',        slug:'genesis',        chapters:50,  t:'OT' },
  { name:'Exodus',         slug:'exodus',         chapters:40,  t:'OT' },
  { name:'Leviticus',      slug:'leviticus',      chapters:27,  t:'OT' },
  { name:'Numbers',        slug:'numbers',        chapters:36,  t:'OT' },
  { name:'Deuteronomy',    slug:'deuteronomy',    chapters:34,  t:'OT' },
  { name:'Joshua',         slug:'joshua',         chapters:24,  t:'OT' },
  { name:'Judges',         slug:'judges',         chapters:21,  t:'OT' },
  { name:'Ruth',           slug:'ruth',           chapters:4,   t:'OT' },
  { name:'1 Samuel',       slug:'1+samuel',       chapters:31,  t:'OT' },
  { name:'2 Samuel',       slug:'2+samuel',       chapters:24,  t:'OT' },
  { name:'1 Kings',        slug:'1+kings',        chapters:22,  t:'OT' },
  { name:'2 Kings',        slug:'2+kings',        chapters:25,  t:'OT' },
  { name:'1 Chronicles',   slug:'1+chronicles',   chapters:29,  t:'OT' },
  { name:'2 Chronicles',   slug:'2+chronicles',   chapters:36,  t:'OT' },
  { name:'Ezra',           slug:'ezra',           chapters:10,  t:'OT' },
  { name:'Nehemiah',       slug:'nehemiah',       chapters:13,  t:'OT' },
  { name:'Esther',         slug:'esther',         chapters:10,  t:'OT' },
  { name:'Job',            slug:'job',            chapters:42,  t:'OT' },
  { name:'Psalms',         slug:'psalms',         chapters:150, t:'OT' },
  { name:'Proverbs',       slug:'proverbs',       chapters:31,  t:'OT' },
  { name:'Ecclesiastes',   slug:'ecclesiastes',   chapters:12,  t:'OT' },
  { name:'Song of Solomon',slug:'song+of+solomon',chapters:8,   t:'OT' },
  { name:'Isaiah',         slug:'isaiah',         chapters:66,  t:'OT' },
  { name:'Jeremiah',       slug:'jeremiah',       chapters:52,  t:'OT' },
  { name:'Lamentations',   slug:'lamentations',   chapters:5,   t:'OT' },
  { name:'Ezekiel',        slug:'ezekiel',        chapters:48,  t:'OT' },
  { name:'Daniel',         slug:'daniel',         chapters:12,  t:'OT' },
  { name:'Hosea',          slug:'hosea',          chapters:14,  t:'OT' },
  { name:'Joel',           slug:'joel',           chapters:3,   t:'OT' },
  { name:'Amos',           slug:'amos',           chapters:9,   t:'OT' },
  { name:'Obadiah',        slug:'obadiah',        chapters:1,   t:'OT' },
  { name:'Jonah',          slug:'jonah',          chapters:4,   t:'OT' },
  { name:'Micah',          slug:'micah',          chapters:7,   t:'OT' },
  { name:'Nahum',          slug:'nahum',          chapters:3,   t:'OT' },
  { name:'Habakkuk',       slug:'habakkuk',       chapters:3,   t:'OT' },
  { name:'Zephaniah',      slug:'zephaniah',      chapters:3,   t:'OT' },
  { name:'Haggai',         slug:'haggai',         chapters:2,   t:'OT' },
  { name:'Zechariah',      slug:'zechariah',      chapters:14,  t:'OT' },
  { name:'Malachi',        slug:'malachi',        chapters:4,   t:'OT' },
  // New Testament
  { name:'Matthew',        slug:'matthew',        chapters:28,  t:'NT' },
  { name:'Mark',           slug:'mark',           chapters:16,  t:'NT' },
  { name:'Luke',           slug:'luke',           chapters:24,  t:'NT' },
  { name:'John',           slug:'john',           chapters:21,  t:'NT' },
  { name:'Acts',           slug:'acts',           chapters:28,  t:'NT' },
  { name:'Romans',         slug:'romans',         chapters:16,  t:'NT' },
  { name:'1 Corinthians',  slug:'1+corinthians',  chapters:16,  t:'NT' },
  { name:'2 Corinthians',  slug:'2+corinthians',  chapters:13,  t:'NT' },
  { name:'Galatians',      slug:'galatians',      chapters:6,   t:'NT' },
  { name:'Ephesians',      slug:'ephesians',      chapters:6,   t:'NT' },
  { name:'Philippians',    slug:'philippians',    chapters:4,   t:'NT' },
  { name:'Colossians',     slug:'colossians',     chapters:4,   t:'NT' },
  { name:'1 Thessalonians',slug:'1+thessalonians',chapters:5,   t:'NT' },
  { name:'2 Thessalonians',slug:'2+thessalonians',chapters:3,   t:'NT' },
  { name:'1 Timothy',      slug:'1+timothy',      chapters:6,   t:'NT' },
  { name:'2 Timothy',      slug:'2+timothy',      chapters:4,   t:'NT' },
  { name:'Titus',          slug:'titus',          chapters:3,   t:'NT' },
  { name:'Philemon',       slug:'philemon',       chapters:1,   t:'NT' },
  { name:'Hebrews',        slug:'hebrews',        chapters:13,  t:'NT' },
  { name:'James',          slug:'james',          chapters:5,   t:'NT' },
  { name:'1 Peter',        slug:'1+peter',        chapters:5,   t:'NT' },
  { name:'2 Peter',        slug:'2+peter',        chapters:3,   t:'NT' },
  { name:'1 John',         slug:'1+john',         chapters:5,   t:'NT' },
  { name:'2 John',         slug:'2+john',         chapters:1,   t:'NT' },
  { name:'3 John',         slug:'3+john',         chapters:1,   t:'NT' },
  { name:'Jude',           slug:'jude',           chapters:1,   t:'NT' },
  { name:'Revelation',     slug:'revelation',     chapters:22,  t:'NT' },
]

function BibleReader({ onClose }) {
  const [testament,    setTestament]    = useState('NT')
  const [book,         setBook]         = useState(BOOKS.find(b => b.slug === 'john'))
  const [chapter,      setChapter]      = useState(1)
  const [verses,       setVerses]       = useState([])
  const [loading,      setLoading]      = useState(false)
  const [view,         setView]         = useState('read') // 'books' | 'chapters' | 'read'
  const bodyRef = useRef(null)

  const visibleBooks = BOOKS.filter(b => b.t === testament)

  useEffect(() => {
    if (view !== 'read') return
    setLoading(true)
    setVerses([])
    fetch(`https://bible-api.com/${book.slug}+${chapter}?translation=kjv`)
      .then(r => r.json())
      .then(data => {
        setVerses(data.verses || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [book, chapter, view])

  // Reset scroll position whenever the view changes
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [view])

  const goBack = () => {
    if (view === 'read') setView('chapters')
    else if (view === 'chapters') setView('books')
    else onClose()
  }

  const prevChapter = () => { if (chapter > 1) setChapter(c => c - 1) }
  const nextChapter = () => { if (chapter < book.chapters) setChapter(c => c + 1) }

  const headerTitle = view === 'books'
    ? 'Select Book'
    : view === 'chapters'
    ? book.name
    : `${book.name} ${chapter}`

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'var(--bg-primary)', display:'flex', flexDirection:'column', animation:'slideUp 0.28s ease both' }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'var(--header-bg)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--border)', padding:'14px 16px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={goBack} className="ax-back"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', flexShrink:0 }}>
            {Ico.back()}
          </button>
          <div style={{ flex:1 }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>KJV BIBLE</p>
            <h2 style={{ color:'var(--text-primary)', fontWeight:900, fontSize:18, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>{headerTitle}</h2>
          </div>
          {view === 'read' && (
            <button onClick={() => setView('books')}
              style={{ padding:'7px 12px', borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.1em' }}>
              Change
            </button>
          )}
        </div>

        {/* OT / NT toggle — only on book picker */}
        {view === 'books' && (
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {['OT','NT'].map(t => (
              <button key={t} onClick={() => setTestament(t)}
                style={{ flex:1, padding:'9px', borderRadius:9, background: testament===t ? 'rgba(168,180,192,0.15)' : 'var(--stat-bg)', border: testament===t ? '1px solid rgba(168,180,192,0.4)' : '1px solid var(--border)', color: testament===t ? '#a8b4c0' : 'var(--text-muted)', cursor:'pointer', fontSize:11, fontWeight:700, letterSpacing:'0.14em', fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.18s' }}>
                {t === 'OT' ? 'Old Testament' : 'New Testament'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div ref={bodyRef} style={{ flex:1, minHeight:0, overflowY:'scroll', WebkitOverflowScrolling:'touch', padding:'16px', paddingBottom:'max(32px, env(safe-area-inset-bottom))' }}>

        {/* Book list */}
        {view === 'books' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {visibleBooks.map(b => (
              <button key={b.slug} onClick={() => { setBook(b); setChapter(1); setView('chapters') }}
                style={{ padding:'12px 14px', borderRadius:11, background: book.slug===b.slug ? 'rgba(168,180,192,0.12)' : 'var(--bg-card)', border: book.slug===b.slug ? '1px solid rgba(168,180,192,0.35)' : '1px solid var(--border)', color: book.slug===b.slug ? '#a8b4c0' : 'var(--text-secondary)', cursor:'pointer', textAlign:'left', fontFamily:'Helvetica Neue,sans-serif', fontSize:13, fontWeight: book.slug===b.slug ? 700 : 400, transition:'all 0.15s' }}>
                {b.name}
                <span style={{ display:'block', fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{b.chapters} ch</span>
              </button>
            ))}
          </div>
        )}

        {/* Chapter grid */}
        {view === 'chapters' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
              <button key={ch} onClick={() => { setChapter(ch); setView('read') }}
                style={{ padding:'14px 0', borderRadius:10, background: chapter===ch ? 'rgba(168,180,192,0.15)' : 'var(--bg-card)', border: chapter===ch ? '1px solid rgba(168,180,192,0.4)' : '1px solid var(--border)', color: chapter===ch ? '#a8b4c0' : 'var(--text-secondary)', cursor:'pointer', fontSize:14, fontWeight: chapter===ch ? 800 : 400, fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.15s' }}>
                {ch}
              </button>
            ))}
          </div>
        )}

        {/* Verse reading view */}
        {view === 'read' && (
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            {loading ? (
              <div style={{ paddingTop:60, textAlign:'center' }}>
                <p style={{ color:'rgba(212,212,232,0.2)', fontSize:14, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>Loading chapter…</p>
              </div>
            ) : (
              <div style={{ background:'rgba(255,250,240,0.05)', border:'1px solid rgba(255,246,228,0.09)', borderRadius:14, padding:'20px 16px 24px', marginTop:4 }}>
                {verses.map(v => (
                  <div key={v.verse} style={{ display:'flex', gap:10, marginBottom:14 }}>
                    <span style={{ color:'rgba(220,80,80,0.55)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, minWidth:20, paddingTop:3, flexShrink:0 }}>{v.verse}</span>
                    <p style={{ color:'rgba(242,235,218,0.88)', fontSize:17, fontFamily:"'EB Garamond',serif", lineHeight:1.85, letterSpacing:'0.01em' }}>{v.text.trim()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chapter prev/next footer */}
      {view === 'read' && (
        <div style={{ flexShrink:0, borderTop:'1px solid var(--border)', background:'var(--header-bg)', backdropFilter:'blur(18px)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={prevChapter} disabled={chapter <= 1}
            style={{ flex:1, padding:'12px', borderRadius:10, background:'var(--stat-bg)', border:'1px solid var(--border)', color: chapter<=1 ? 'rgba(212,212,232,0.15)' : 'var(--text-secondary)', cursor: chapter<=1 ? 'default' : 'pointer', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.08em', transition:'all 0.15s' }}>
            ← Prev
          </button>
          <span style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', whiteSpace:'nowrap' }}>{chapter} / {book.chapters}</span>
          <button onClick={nextChapter} disabled={chapter >= book.chapters}
            style={{ flex:1, padding:'12px', borderRadius:10, background:'var(--stat-bg)', border:'1px solid var(--border)', color: chapter>=book.chapters ? 'rgba(212,212,232,0.15)' : 'var(--text-secondary)', cursor: chapter>=book.chapters ? 'default' : 'pointer', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.08em', transition:'all 0.15s' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Devotional({ embedded = false }) {
  const todayStr = useToday()
  const todayLabel = new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [visible,     setVisible]     = useState(false)
  const [verse,       setVerse]       = useState(null)   // { text, reference }
  const [verseRef,    setVerseRef]    = useState('')
  const [verseLoading,setVerseLoading]= useState(true)
  const [today,       setToday]       = useState(null)   // today's devotional entry from DB
  const [history,     setHistory]     = useState([])
  const [showJournal,  setShowJournal]  = useState(false)
  const [showBible,    setShowBible]    = useState(false)
  const [loadingDB,    setLoadingDB]    = useState(true)
  const [streak,       setStreak]       = useState(0)
  const [historyOpen,  setHistoryOpen]  = useState(false)

  // Fetch verse — pool comes from DB, falls back to hardcoded VERSE_REFS
  useEffect(() => {
    const load = async () => {
      let pool = VERSE_REFS
      try {
        const { data } = await supabase.from('verse_pool').select('reference').eq('active', true).order('sort_order')
        if (data?.length) pool = data.map(v => v.reference)
      } catch {}
      const ref = getDailyRefFromPool(pool)
      setVerseRef(ref)
      try {
        const r    = await fetch(`https://bible-api.com/${ref}`)
        const data = await r.json()
        setVerse({ text: data.text?.trim(), reference: data.reference })
      } catch {
        setVerse({ text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', reference: 'Jeremiah 29:11' })
      }
      setVerseLoading(false)
    }
    load()
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
        body{background:var(--bg-primary);overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(212,212,232,0.25);border-radius:99px;}
        textarea::placeholder{color:rgba(212,212,232,0.2);}
        textarea:focus{outline:none;}
        .ax-back:hover{background:rgba(212,212,232,0.08)!important;}
        .ax-journal-btn:hover{background:rgba(212,212,232,0.88)!important;box-shadow:0 0 22px rgba(212,212,232,0.2)!important;}
        .ax-edit-btn:hover{border-color:rgba(212,212,232,0.25)!important;color:rgba(212,212,232,0.65)!important;}
        @keyframes fadeVerse {
          from{opacity:0;transform:translateY(6px);}
          to{opacity:1;transform:translateY(0);}
        }
      `}</style>

      <div style={{ ...(!embedded && { minHeight:'100vh', background:'var(--bg-primary)', paddingBottom:90 }), WebkitFontSmoothing:'antialiased', position:'relative' }}>
        {!embedded && <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`url(${PRAYER_IMG})`, backgroundSize:'cover', backgroundPosition:'center 20%', opacity:0.1, filter:'grayscale(100%)', backgroundRepeat:'no-repeat', pointerEvents:'none' }} />}
        {!embedded && <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.45) 0%, rgba(8,8,8,0.15) 35%, rgba(8,8,8,0.9) 100%)', pointerEvents:'none' }} />}

        {/* ── Sticky Header (standalone only) ── */}
        {!embedded && <div style={{ position:'sticky', top:0, zIndex:50, background:'var(--header-bg)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--border)', padding:'14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>AXIOS</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <h1 style={{ color:'#a8b4c0', fontWeight:900, fontSize:20, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Daily Devotional</h1>
                <img src={prayerIconSrc} width={20} height={20} style={{ filter:'brightness(0) invert(1)', objectFit:'contain', opacity:0.72, display:'block' }} alt="" />
              </div>
            </div>
            {today && (
              <button onClick={() => setShowJournal(true)} className="ax-edit-btn"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', borderRadius:9, background:'transparent', border:'1px solid var(--border)', color:'rgba(212,212,232,0.4)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.2s' }}>
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
              <div key={label} style={{ flex:1, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'10px 10px', textAlign:'center' }}>
                <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{label}</p>
                <p style={{ color:'var(--text-primary)', fontSize:20, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>}

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* Date label */}
          <p style={{ color:'rgba(212,212,232,0.2)', fontSize:11, fontFamily:"'EB Garamond',serif", fontStyle:'italic', letterSpacing:'0.06em', ...anim(60) }}>
            {todayLabel}
          </p>

          {/* Scripture card */}
          <div style={{ position:'relative', background:'var(--bg-card)', border:'1px solid var(--border)', borderLeft:'3px solid rgba(185,28,28,0.45)', boxShadow:'var(--card-shadow)', borderRadius:16, padding:'24px 20px', overflow:'hidden', ...anim(100) }}>
            {/* Decorative cross */}
            <div style={{ position:'absolute', top:16, right:16, color:'rgba(212,212,232,0.04)', pointerEvents:'none' }}>{Ico.cross(48)}</div>

            <p style={{ color:'rgba(185,28,28,0.6)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:16, fontWeight:600 }}>
              {verseLoading ? 'Loading…' : verse?.reference}
            </p>

            {verseLoading ? (
              <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <p style={{ color:'rgba(212,212,232,0.2)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>Fetching today's verse…</p>
              </div>
            ) : (
              <p style={{ color:'rgba(212,212,232,0.85)', fontSize:18, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.85, letterSpacing:'0.01em', animation:'fadeVerse 0.7s ease both' }}>
                "{verse?.text}"
              </p>
            )}

            <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid rgba(212,212,232,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ color:'rgba(185,28,28,0.75)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.14em', fontWeight:600 }}>KJV · DAILY VERSE</p>
              <button onClick={() => setShowBible(true)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background:'rgba(244,114,182,0.12)', border:'1px solid rgba(244,114,182,0.4)', color:'#f472b6', cursor:'pointer', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', transition:'all 0.2s', boxShadow:'0 0 14px rgba(244,114,182,0.25)' }}>
                {Ico.book(12)} Read Bible
              </button>
            </div>
          </div>

          {/* Journal section */}
          {!today ? (
            <div style={anim(200)}>
              {(() => {
                const d = getDailyDevotional()
                return (
                  <div style={{ background:'rgba(168,180,192,0.05)', border:'1px solid rgba(168,180,192,0.14)', borderRadius:14, padding:'20px 18px', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:'radial-gradient(circle, var(--accent-devotional, rgba(168,180,192,0.5)), transparent 70%)', opacity:0.08, pointerEvents:'none' }} />
                    {/* Header */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:2, height:12, background:'linear-gradient(to bottom, var(--accent-devotional, rgba(168,180,192,0.6)), transparent)', borderRadius:2 }} />
                        <span style={{ color:'var(--accent-devotional, rgba(168,180,192,0.7))', fontSize:9, fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif' }}>
                          {d.type === 'scripture' ? 'Scripture' : d.type === 'study' ? 'Bible Study' : 'Prayer'}
                        </span>
                      </div>
                      <span style={{ color:'var(--text-faint)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif' }}>
                        {new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                      </span>
                    </div>
                    {/* Scripture type */}
                    {d.type === 'scripture' && (
                      <>
                        <p style={{ color:'var(--accent-devotional, rgba(168,180,192,0.65))', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>{d.ref}</p>
                        <p style={{ color:'var(--text-primary)', fontSize:16, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, marginBottom:14, opacity:0.9 }}>{d.verse}</p>
                        <p style={{ color:'var(--text-secondary)', fontSize:13, fontFamily:"'EB Garamond',serif", lineHeight:1.7 }}>{d.note}</p>
                      </>
                    )}
                    {/* Study type */}
                    {d.type === 'study' && (
                      <>
                        <p style={{ color:'var(--text-primary)', fontSize:15, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:8, letterSpacing:'-0.01em' }}>{d.focus}</p>
                        <p style={{ color:'var(--text-secondary)', fontSize:14, fontFamily:"'EB Garamond',serif", lineHeight:1.75, fontStyle:'italic' }}>{d.tip}</p>
                      </>
                    )}
                    {/* Prayer type */}
                    {d.type === 'prayer' && (
                      <>
                        <p style={{ color:'var(--accent-devotional, rgba(168,180,192,0.65))', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:10 }}>{d.theme}</p>
                        <p style={{ color:'var(--text-primary)', fontSize:16, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.75, opacity:0.9 }}>{d.text}</p>
                      </>
                    )}
                    {/* Write reflection — secondary CTA */}
                    <button onClick={() => setShowJournal(true)} style={{ marginTop:18, width:'100%', padding:'10px', borderRadius:9, background:'transparent', border:'1px solid rgba(168,180,192,0.18)', color:'rgba(168,180,192,0.4)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}>
                      {Ico.edit()} Write Your Reflection
                    </button>
                  </div>
                )
              })()}
            </div>
          ) : (
            <Card style={anim(200)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <SectionHead title="Today's Journal" />
                <span style={{ display:'flex', alignItems:'center', gap:5, color:'var(--text-secondary)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
                  {Ico.check()} Completed
                </span>
              </div>

              {today.reflection && (
                <div style={{ marginBottom:14 }}>
                  <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Reflection</p>
                  <p style={{ color:'rgba(212,212,232,0.75)', fontSize:15, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.8 }}>{today.reflection}</p>
                </div>
              )}

              {today.application && (
                <div style={{ paddingTop:12, borderTop:'1px solid rgba(212,212,232,0.06)' }}>
                  <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Application</p>
                  <p style={{ color:'rgba(212,212,232,0.75)', fontSize:15, fontFamily:"'EB Garamond',serif", fontStyle:'italic', lineHeight:1.8 }}>{today.application}</p>
                </div>
              )}

              <button onClick={() => setShowJournal(true)} className="ax-edit-btn"
                style={{ marginTop:16, width:'100%', padding:'10px', borderRadius:9, background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}>
                {Ico.edit()} Edit Entry
              </button>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={anim(300)}>
              <SectionHead title="Past Devotionals" sub={`${history.length} entries`} onToggle={() => setHistoryOpen(o => !o)} collapsed={!historyOpen} />
              {historyOpen && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {history.map((entry, i) => (
                  <PastEntry key={entry.id} entry={entry} delay={i*40} visible={visible} />
                ))}
              </div>
              )}
            </div>
          )}

          {history.length === 0 && today && (
            <div style={{ textAlign:'center', padding:'20px 0', ...anim(300) }}>
              <p style={{ color:'rgba(212,212,232,0.15)', fontSize:13, fontFamily:"'EB Garamond',serif", fontStyle:'italic' }}>Past entries will appear here.</p>
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

      {showBible && <BibleReader onClose={() => setShowBible(false)} />}

      {!embedded && <BottomNav />}
    </>
  )
}
