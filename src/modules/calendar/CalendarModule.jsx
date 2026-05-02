import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CALENDAR_BG from './calendarBg'
import {
  useCalendarEvents, usePendingReminders,
  useUpcomingEventsExtended, usePastEvents,
  useAllEventsForYear, useHealthEventsForMonth, useMonthlyIntention,
} from '../../hooks/useCalendarEvents'
import {
  isGmailConnected, getGmailEmail,
  connectGmail, disconnectGmail, sendReminderEmail,
} from '../../lib/gmail'
import { useRoutineHistory } from '../../hooks/useRoutine'
import RoutineTracker from './RoutineTracker'
import WeekView   from './views/WeekView'
import AgendaView from './views/AgendaView'
import YearView   from './views/YearView'

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const TYPE_CFG = {
  general: { label:'General',  icon:'🗓',  color:'var(--btn-bg)' },
  workout: { label:'Workout',  icon:'💪',  color:'var(--accent-fitness,#dc4f3a)' },
  prayer:  { label:'Devotion', icon:'🙏',  color:'var(--accent-prayer,#c8a000)' },
  meal:    { label:'Meal',     icon:'🥗',  color:'var(--accent-food,#c8853a)' },
  finance: { label:'Finance',  icon:'💰',  color:'var(--accent-finance,#4db891)' },
}

const FF = 'Helvetica Neue,Arial,sans-serif'
const toDateStr = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

const EVENT_TEMPLATES = [
  { emoji:'💪', title:'Workout',       type:'workout', time:'07:00' },
  { emoji:'🙏', title:'Devotion',       type:'prayer',  time:'08:00' },
  { emoji:'🥗', title:'Meal Prep',     type:'meal',    time:'11:00' },
  { emoji:'📖', title:'Bible Study',   type:'prayer',  time:'19:00' },
  { emoji:'💰', title:'Pay Bills',     type:'finance', time:null    },
  { emoji:'🏃', title:'Evening Run',   type:'workout', time:'18:00' },
  { emoji:'🧘', title:'Meditate',      type:'general', time:'06:30' },
  { emoji:'🏥', title:'Doctor Appt',   type:'general', time:'10:00' },
]

// ── Natural language parser ────────────────────────────────────────────────────
function parseNL(text) {
  const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const now = new Date()
  let date  = now.toISOString().split('T')[0]
  let time  = null
  let title = text

  if (/\btomorrow\b/i.test(text)) {
    const d = new Date(); d.setDate(d.getDate() + 1)
    date  = d.toISOString().split('T')[0]
    title = title.replace(/\btomorrow\b/i, '')
  } else if (/\btoday\b/i.test(text)) {
    title = title.replace(/\btoday\b/i, '')
  } else {
    for (let i = 0; i < DAY_NAMES.length; i++) {
      const re = new RegExp(`\\b${DAY_NAMES[i]}\\b`, 'i')
      if (re.test(text)) {
        const d    = new Date()
        let diff   = i - d.getDay()
        if (diff <= 0) diff += 7
        d.setDate(d.getDate() + diff)
        date  = d.toISOString().split('T')[0]
        title = title.replace(re, '')
        break
      }
    }
  }

  // 12-hour time: "3pm", "3:30pm"
  const t12 = title.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  if (t12) {
    let h = parseInt(t12[1]); const m = t12[2] ? parseInt(t12[2]) : 0
    if (t12[3].toLowerCase() === 'pm' && h < 12) h += 12
    if (t12[3].toLowerCase() === 'am' && h === 12) h = 0
    time  = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    title = title.replace(t12[0], '').replace(/\bat\b/i, '')
  } else {
    // 24h: "14:30"
    const t24 = title.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/)
    if (t24) { time = t24[0]; title = title.replace(t24[0], '') }
  }

  title = title.replace(/\s+/g, ' ').trim()
  return { title: title || text, date, time }
}

// ── Push notifications ─────────────────────────────────────────────────────────
function scheduleNotifications(events) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const now      = new Date()
  const todayStr = now.toISOString().split('T')[0]
  events.filter(ev => ev.date === todayStr && ev.time).forEach(ev => {
    const evTime   = new Date(`${ev.date}T${ev.time}`)
    const minsLeft = Math.round((evTime - now) / 60000)
    if (minsLeft > 5 && minsLeft <= 120) {
      setTimeout(() => {
        try { new Notification(`📅 ${ev.title}`, { body:`Starting in 5 minutes` }) } catch (_) {}
      }, (minsLeft - 5) * 60000)
    }
  })
}

// ── Reminder email HTML ────────────────────────────────────────────────────────
function buildReminderHtml(event) {
  const typeLabel = TYPE_CFG[event.type]?.label || 'Event'
  const timeStr   = event.time
    ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    : ''
  return `
    <div style="font-family:Helvetica Neue,Arial,sans-serif;max-width:500px;margin:0 auto;background:#0c0b09;color:#ede8e0;border-radius:12px;padding:28px 32px;border:1px solid rgba(200,180,140,0.18)">
      <p style="font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(200,190,175,0.5);margin:0 0 8px">AXIOS REMINDER</p>
      <h2 style="font-size:22px;font-weight:900;margin:0 0 6px;color:#ede8e0">${event.title}</h2>
      <p style="font-size:13px;color:rgba(200,190,175,0.6);margin:0 0 20px">${typeLabel}${timeStr ? ' · '+timeStr : ''}</p>
      ${event.notes ? `<p style="font-size:13px;color:rgba(200,190,175,0.75);line-height:1.6;margin:0">${event.notes}</p>` : ''}
      <p style="font-size:10px;color:rgba(200,190,175,0.3);margin:20px 0 0">Sent by AXIOS · I Am Worthy</p>
    </div>`
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function EventDot({ type, size = 6 }) {
  const color = TYPE_CFG[type]?.color || 'var(--btn-bg)'
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:'50%', background:color, boxShadow:`0 0 4px ${color}88`, flexShrink:0 }}/>
}

function EventRow({ event, onDelete, deleting }) {
  const cfg     = TYPE_CFG[event.type] || TYPE_CFG.general
  const timeStr = event.time ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'var(--stat-bg)', border:`1px solid ${cfg.color}22`, borderRadius:10, boxShadow:'var(--card-shadow)' }}>
      <div style={{ width:32, height:32, borderRadius:9, background:`${cfg.color}18`, border:`1px solid ${cfg.color}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15 }}>
        {cfg.icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:FF, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.title}</p>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:2 }}>
          <span style={{ color:cfg.color, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, fontWeight:700 }}>{cfg.label}</span>
          {timeStr && <span style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF }}>{timeStr}</span>}
          {event.email_reminder && <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:FF }}>· 📧</span>}
        </div>
        {event.notes && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:FF, margin:'4px 0 0', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.notes}</p>}
      </div>
      <button onClick={() => onDelete(event.id)} disabled={deleting} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.5)', fontSize:16, padding:'4px 6px', lineHeight:1, flexShrink:0 }}>×</button>
    </div>
  )
}

// ── Weekly Review Sheet ────────────────────────────────────────────────────────
function WeeklyReview({ weekDates, events, healthEvents, routineHistory, items, onClose }) {
  const weekEvs     = events.filter(ev => weekDates.includes(ev.date))
  const workouts    = healthEvents.filter(h => h.type === 'workout' && weekDates.includes(h.date))
  const meals       = healthEvents.filter(h => h.type === 'meal'    && weekDates.includes(h.date))
  const prayers     = healthEvents.filter(h => h.type === 'prayer'  && weekDates.includes(h.date))
  const doneLogs    = routineHistory.filter(l => weekDates.includes(l.date))
  const totalSlots  = items.length * 7
  const donePct     = totalSlots > 0 ? Math.round((doneLogs.length / totalSlots) * 100) : 0

  const stats = [
    { emoji:'📅', label:'Events',   value: weekEvs.length },
    { emoji:'💪', label:'Workouts', value: workouts.length },
    { emoji:'🥗', label:'Meals',    value: meals.length    },
    { emoji:'🙏', label:'Prayers',  value: prayers.length  },
    { emoji:'✅', label:'Habits',   value: `${donePct}%`   },
  ]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:520, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'20px 20px 0 0', padding:'22px 20px 36px' }}>
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.15)', borderRadius:99, margin:'0 auto 20px' }}/>
        <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:FF, marginBottom:4 }}>THIS WEEK</p>
        <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:FF, marginBottom:20, letterSpacing:'-0.02em' }}>Weekly Review</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 14px' }}>
              <p style={{ fontSize:20, marginBottom:4 }}>{s.emoji}</p>
              <p style={{ color:'var(--text-primary)', fontSize:20, fontWeight:900, fontFamily:FF }}>{s.value}</p>
              <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF, letterSpacing:'0.1em', textTransform:'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ width:'100%', padding:'13px', borderRadius:10, background:'var(--btn-bg)', border:'none', color:'var(--btn-text)', fontSize:13, fontWeight:700, fontFamily:FF, cursor:'pointer' }}>
          Done
        </button>
      </div>
    </div>
  )
}

// ── Enhanced Create Modal ──────────────────────────────────────────────────────
function CreateModal({ defaultDate, onClose, onSave, gmailConnected, saving }) {
  const [nlMode, setNlMode]   = useState(false)
  const [nlInput, setNlInput] = useState('')
  const [form, setForm] = useState({
    title:'', date: defaultDate || '', time:'', type:'general',
    notes:'', recurring:'none', email_reminder: false,
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const valid = form.title.trim() && form.date

  const handleNL = (text) => {
    setNlInput(text)
    const p = parseNL(text)
    setForm(prev => ({ ...prev, title: p.title, date: p.date || prev.date, time: p.time || prev.time }))
  }

  const applyTemplate = (tpl) => {
    setForm(prev => ({ ...prev, title: tpl.title, type: tpl.type, time: tpl.time || prev.time }))
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--overlay-bg)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:500, background:'var(--sheet-bg)', borderRadius:'20px 20px 0 0', padding:'24px 20px 36px', border:'1px solid var(--border)', borderBottom:'none', maxHeight:'92dvh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)', margin:'0 auto 20px' }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:FF, marginBottom:2 }}>NEW EVENT</p>
            <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:FF, letterSpacing:'-0.02em' }}>Schedule</p>
          </div>
          <button onClick={() => setNlMode(v => !v)} style={{
            padding:'6px 12px', borderRadius:99, border:`1px solid ${nlMode ? 'rgba(200,212,200,0.4)' : 'var(--border)'}`,
            background: nlMode ? 'rgba(200,212,200,0.1)' : 'transparent',
            color: nlMode ? '#c8d4c8' : 'var(--text-muted)', fontSize:10, fontFamily:FF, fontWeight:700, cursor:'pointer',
          }}>✦ Smart</button>
        </div>

        {/* Templates */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:16, paddingBottom:2 }}>
          {EVENT_TEMPLATES.map(tpl => (
            <button key={tpl.title} onClick={() => applyTemplate(tpl)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'6px 11px', borderRadius:99, flexShrink:0,
              background:'rgba(212,212,232,0.04)', border:'1px solid rgba(212,212,232,0.1)',
              color:'var(--text-muted)', fontSize:11, fontFamily:FF, cursor:'pointer', transition:'all 0.15s',
              whiteSpace:'nowrap',
            }}>
              <span>{tpl.emoji}</span>{tpl.title}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {nlMode ? (
            <div>
              <input
                autoFocus value={nlInput}
                onChange={e => handleNL(e.target.value)}
                placeholder='e.g. "dentist tuesday at 2pm" or "workout tomorrow 7am"'
                style={inputStyle()}
              />
              <p style={{ color:'rgba(212,212,232,0.28)', fontSize:10, fontFamily:FF, marginTop:6 }}>
                Parsed: {form.title || '—'}  ·  {form.date || '—'}  {form.time ? `· ${form.time}` : ''}
              </p>
            </div>
          ) : (
            <input autoFocus placeholder="Event title" value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle()} />
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle()} />
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inputStyle()} />
          </div>

          {/* Type */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {Object.entries(TYPE_CFG).map(([k, cfg]) => (
              <button key={k} onClick={() => set('type', k)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 12px', borderRadius:99, fontSize:10, fontFamily:FF, fontWeight:700,
                letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer',
                border:`1px solid ${cfg.color}${form.type===k?'':'44'}`,
                background: form.type===k ? `${cfg.color}22` : 'transparent',
                color: form.type===k ? cfg.color : 'var(--text-muted)',
                transition:'all 0.15s',
              }}><span>{cfg.icon}</span>{cfg.label}</button>
            ))}
          </div>

          {/* Recurring — expanded options */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[['none','One-time'],['weekly','Weekly'],['daily','Daily'],['biweekly','Bi-weekly'],['monthly','Monthly']].map(([v, l]) => (
              <button key={v} onClick={() => set('recurring', v)} style={{
                padding:'5px 12px', borderRadius:99, fontSize:10, fontFamily:FF,
                fontWeight: form.recurring===v ? 700 : 400, cursor:'pointer',
                border:`1px solid var(--border)`,
                background: form.recurring===v ? 'var(--bg-card-hover)' : 'transparent',
                color: form.recurring===v ? 'var(--text-primary)' : 'var(--text-muted)',
                transition:'all 0.15s',
              }}>{l}</button>
            ))}
          </div>

          <textarea placeholder="Notes (optional)" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inputStyle(), resize:'none', lineHeight:1.55 }} />

          {/* Email reminder toggle */}
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor: gmailConnected ? 'pointer' : 'default', opacity: gmailConnected ? 1 : 0.4 }}>
            <div onClick={() => gmailConnected && set('email_reminder', !form.email_reminder)} style={{
              width:38, height:22, borderRadius:11, position:'relative',
              background: form.email_reminder && gmailConnected ? 'var(--btn-bg)' : 'var(--bg-card-hover)',
              border:'1px solid var(--border)', transition:'background 0.2s', cursor: gmailConnected ? 'pointer' : 'default',
            }}>
              <div style={{ position:'absolute', top:2, left: form.email_reminder && gmailConnected ? 18 : 2, width:16, height:16, borderRadius:'50%', background:'var(--text-primary)', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.4)' }}/>
            </div>
            <div>
              <p style={{ color:'var(--text-secondary)', fontSize:12, fontFamily:FF, margin:0 }}>Email reminder</p>
              {!gmailConnected && <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF, margin:0 }}>Connect Gmail to enable</p>}
            </div>
          </label>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:10, background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:13, fontFamily:FF, cursor:'pointer' }}>Cancel</button>
          <button onClick={() => valid && !saving && onSave(form)} disabled={!valid || saving}
            style={{ flex:2, padding:'13px', borderRadius:10, background:'var(--btn-bg)', border:'none', color:'var(--btn-text)', fontSize:13, fontWeight:700, fontFamily:FF, cursor: valid&&!saving ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.4 }}>
            {saving ? 'Saving…' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

function inputStyle() {
  return { width:'100%', padding:'11px 13px', borderRadius:9, background:'var(--input-bg)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:13, fontFamily:FF, outline:'none', boxSizing:'border-box' }
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CalendarModule() {
  const navigate = useNavigate()
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [activeView,      setActiveView]      = useState('month')
  const [year,            setYear]            = useState(today.getFullYear())
  const [month,           setMonth]           = useState(today.getMonth())
  const [selected,        setSelected]        = useState(null)
  const [showModal,       setShowModal]       = useState(false)
  const [showReview,      setShowReview]      = useState(false)
  const [weekOffset,      setWeekOffset]      = useState(0)
  const [intentionDraft,  setIntentionDraft]  = useState('')
  const [intentionEditing,setIntentionEditing]= useState(false)
  const [notifEnabled,    setNotifEnabled]    = useState('Notification' in window && Notification.permission === 'granted')
  const [gmailConn,       setGmailConn]       = useState(isGmailConnected())
  const [gmailEmail,      setGmailEmail]      = useState(getGmailEmail())
  const [gmailLoading,    setGmailLoading]    = useState(false)
  const [gmailError,      setGmailError]      = useState(null)

  // Data
  const { events, isLoading, addEvent, deleteEvent, markReminderSent } = useCalendarEvents(year, month)
  const { data: pendingReminders = [] }  = usePendingReminders()
  const { data: yearEvents       = [] }  = useAllEventsForYear(year)
  const { data: upcomingEvents   = [] }  = useUpcomingEventsExtended(90)
  const { data: pastEvents       = [] }  = usePastEvents(14)
  const { data: healthEvents     = [] }  = useHealthEventsForMonth(year, month)
  const { intention: savedIntent, upsert: upsertIntention } = useMonthlyIntention(year, month)
  const { data: routineHistory   = [] }  = useRoutineHistory(30)

  // Sync intention
  useEffect(() => { setIntentionDraft(savedIntent || '') }, [savedIntent])

  // Send due reminders
  useEffect(() => {
    if (!gmailConn || !pendingReminders.length) return
    pendingReminders.forEach(async ev => {
      try { await sendReminderEmail(`AXIOS Reminder: ${ev.title}`, buildReminderHtml(ev)); markReminderSent.mutate(ev.id) }
      catch (e) { console.warn('Reminder send failed:', e.message) }
    })
  }, [pendingReminders, gmailConn])

  // Schedule push notifications when events load
  useEffect(() => { if (notifEnabled && events.length) scheduleNotifications(events) }, [events, notifEnabled])

  // Calendar grid
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Merge calendar events + health events for dots
  const allDotsByDate = useMemo(() => {
    const map = {}
    events.forEach(ev => { if (!map[ev.date]) map[ev.date] = []; map[ev.date].push(ev) })
    healthEvents.forEach(h => {
      if (!map[h.date]) map[h.date] = []
      if (!map[h.date].some(e => e.type === h.type)) map[h.date].push({ ...h, id:`h-${h.date}-${h.type}`, _health:true })
    })
    return map
  }, [events, healthEvents])

  const selectedEvents = selected ? (allDotsByDate[selected] || []).filter(e => !e._health) : []

  // Week start for WeekView
  const weekStart = useMemo(() => {
    const d = new Date(todayStr + 'T12:00:00')
    d.setDate(d.getDate() - d.getDay() + weekOffset * 7)
    return d
  }, [todayStr, weekOffset])

  const weekDates = useMemo(() => Array.from({ length:7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0]
  }), [weekStart])

  // Nav
  const prevMonth = () => { if (month===0) { setYear(y=>y-1); setMonth(11) } else setMonth(m=>m-1); setSelected(null) }
  const nextMonth = () => { if (month===11) { setYear(y=>y+1); setMonth(0) } else setMonth(m=>m+1); setSelected(null) }

  // Gmail handlers
  const handleConnectGmail = useCallback(() => {
    setGmailLoading(true); setGmailError(null)
    connectGmail(
      email => { setGmailConn(true); setGmailEmail(email); setGmailLoading(false) },
      err   => { setGmailError(String(err)); setGmailLoading(false) }
    )
  }, [])
  const handleDisconnectGmail = () => { disconnectGmail(); setGmailConn(false); setGmailEmail(null) }

  // Save event
  const handleSave = async (form) => {
    await addEvent.mutateAsync({
      title: form.title.trim(), date: form.date, time: form.time||null,
      type: form.type, notes: form.notes.trim()||null,
      recurring: form.recurring, email_reminder: form.email_reminder && gmailConn,
      reminder_sent: false,
    })
    setShowModal(false)
  }

  // Enable push notifications
  const handleEnableNotif = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifEnabled(perm === 'granted')
    if (perm === 'granted') scheduleNotifications(events)
  }

  // Save intention
  const handleSaveIntention = () => {
    if (intentionDraft.trim()) upsertIntention.mutate(intentionDraft.trim())
    setIntentionEditing(false)
  }

  const VIEW_TABS = [
    { key:'month',   label:'Month',    icon:'📅' },
    { key:'week',    label:'Week',     icon:'🗓' },
    { key:'agenda',  label:'Agenda',   icon:'📋' },
    { key:'year',    label:'Year',     icon:'🌿' },
    { key:'routine', label:'Routines', icon:'⚡' },
  ]

  const showsCalendar  = activeView === 'month'
  const showsMonthNav  = activeView === 'month'

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg-primary)', paddingBottom:40, position:'relative' }}>
      {/* Background image */}
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`url(${CALENDAR_BG})`, backgroundSize:'cover', backgroundPosition:'center 30%', backgroundRepeat:'no-repeat', opacity:0.13, filter:'grayscale(100%) contrast(1.2) brightness(0.9)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.15) 35%, rgba(8,8,8,0.85) 100%)', pointerEvents:'none' }}/>

      {/* ── Sticky Header ── */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(8,8,8,0.82)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', borderBottom:'1px solid var(--border)', padding:'14px 18px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:20, lineHeight:1, padding:'2px 6px 2px 0' }}>‹</button>
          <div style={{ flex:1 }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:FF, margin:0 }}>AXIOS</p>
            <h1 style={{ color:'var(--text-primary)', fontSize:17, fontWeight:900, fontFamily:FF, margin:0, letterSpacing:'-0.02em' }}>
              {{ month:'Calendar', week:'Week View', agenda:'Agenda', year:'Year View', routine:'Routine Tracker' }[activeView]}
            </h1>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {/* Weekly review */}
            {activeView !== 'routine' && (
              <button onClick={() => setShowReview(true)} title="Weekly Review" style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:14 }}>
                📊
              </button>
            )}
            {/* Push notifications */}
            {!notifEnabled && 'Notification' in window && activeView !== 'routine' && (
              <button onClick={handleEnableNotif} title="Enable notifications" style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:14 }}>
                🔔
              </button>
            )}
            {/* Add event */}
            {activeView !== 'routine' && (
              <button onClick={() => { setSelected(selected || todayStr); setShowModal(true) }} style={{ background:'var(--btn-bg)', border:'none', borderRadius:8, color:'var(--btn-text)', fontSize:20, width:32, height:32, cursor:'pointer', fontWeight:700, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
            )}
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:2 }}>
          {VIEW_TABS.map(({ key, label, icon }) => {
            const active = activeView === key
            return (
              <button key={key} onClick={() => setActiveView(key)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'6px 13px', borderRadius:99, flexShrink:0,
                background: active ? 'rgba(200,212,200,0.12)' : 'transparent',
                border:`1px solid ${active ? 'rgba(200,212,200,0.35)' : 'rgba(212,212,232,0.1)'}`,
                color: active ? '#c8d4c8' : 'rgba(212,212,232,0.35)',
                fontSize:11, fontFamily:FF, fontWeight: active ? 700 : 400,
                cursor:'pointer', transition:'all 0.15s',
              }}>
                <span style={{ fontSize:12 }}>{icon}</span>{label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Overdue alert (month + agenda views) ── */}
      {(activeView === 'month' || activeView === 'agenda') && pastEvents.length > 0 && (
        <div style={{ margin:'12px 18px 0', padding:'10px 14px', background:'rgba(220,79,58,0.07)', border:'1px solid rgba(220,79,58,0.18)', borderRadius:10, display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:15 }}>⚠️</span>
          <p style={{ color:'rgba(220,79,58,0.8)', fontSize:12, fontFamily:FF }}>
            {pastEvents.length} event{pastEvents.length > 1 ? 's' : ''} from the past {pastEvents.length > 1 ? 'weren\'t completed' : 'wasn\'t completed'}.
          </p>
        </div>
      )}

      {/* ── Route to active view ── */}

      {activeView === 'routine' && <RoutineTracker today={todayStr} />}
      {activeView === 'week'    && (
        <WeekView
          events={events} healthEvents={healthEvents} today={todayStr}
          weekStart={weekStart} weekOffset={weekOffset}
          onChangeWeek={setWeekOffset}
          onAddEvent={date => { setSelected(date); setShowModal(true) }}
          onDeleteEvent={id => deleteEvent.mutate(id)}
        />
      )}
      {activeView === 'agenda' && (
        <AgendaView upcoming={upcomingEvents} past={pastEvents} today={todayStr} onDelete={id => deleteEvent.mutate(id)} />
      )}
      {activeView === 'year' && (
        <YearView year={year} yearEvents={yearEvents} today={todayStr} onSelectMonth={m => { setMonth(m); setActiveView('month') }} />
      )}

      {/* ── Month view ── */}
      {activeView === 'month' && (
        <div style={{ padding:'16px 18px 0' }}>

          {/* Monthly intention */}
          <div style={{ marginBottom:16, padding:'12px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--card-shadow)' }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:FF, marginBottom:6 }}>
              {MONTHS[month]} Intention
            </p>
            {intentionEditing ? (
              <div style={{ display:'flex', gap:8 }}>
                <input
                  autoFocus value={intentionDraft}
                  onChange={e => setIntentionDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveIntention()}
                  placeholder="Set your intention for this month…"
                  style={{ flex:1, background:'transparent', border:'none', color:'var(--text-primary)', fontSize:13, fontFamily:FF, outline:'none' }}
                />
                <button onClick={handleSaveIntention} style={{ background:'var(--btn-bg)', border:'none', borderRadius:7, color:'var(--btn-text)', fontSize:11, fontFamily:FF, fontWeight:700, padding:'5px 12px', cursor:'pointer' }}>Save</button>
                <button onClick={() => setIntentionEditing(false)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:7, color:'var(--text-muted)', fontSize:11, fontFamily:FF, padding:'5px 10px', cursor:'pointer' }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setIntentionEditing(true)} style={{ background:'none', border:'none', padding:0, textAlign:'left', cursor:'pointer', width:'100%' }}>
                <p style={{ color: intentionDraft ? 'var(--text-primary)' : 'rgba(212,212,232,0.2)', fontSize:13, fontFamily:FF, fontStyle: intentionDraft ? 'normal' : 'italic' }}>
                  {intentionDraft || 'Tap to set your intention…'}
                </p>
              </button>
            )}
          </div>

          {/* Month navigation */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <button onClick={prevMonth} style={navBtn()}>‹</button>
            <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:800, fontFamily:FF, letterSpacing:'-0.01em', margin:0 }}>{MONTHS[month]} {year}</p>
            <button onClick={nextMonth} style={navBtn()}>›</button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
            {DAYS.map(d => (
              <p key={d} style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:FF, textAlign:'center', margin:0, padding:'4px 0' }}>{d}</p>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:20 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`}/>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day    = i + 1
              const dStr   = toDateStr(year, month, day)
              const isToday = dStr === todayStr
              const isSel   = dStr === selected
              const dots    = allDotsByDate[dStr] || []
              return (
                <button key={day} onClick={() => setSelected(isSel ? null : dStr)} style={{
                  background: isSel ? 'var(--btn-bg)' : isToday ? 'var(--bg-card-hover)' : 'transparent',
                  border: isToday && !isSel ? '1px solid var(--btn-bg)' : isSel ? '1px solid var(--btn-bg)' : '1px solid transparent',
                  borderRadius:9, padding:'7px 2px 5px', cursor:'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.15s',
                }}>
                  <span style={{ color: isSel ? 'var(--btn-text)' : isToday ? 'var(--btn-bg)' : 'var(--text-secondary)', fontSize:12, fontWeight: isToday||isSel ? 800 : 400, fontFamily:FF }}>
                    {day}
                  </span>
                  {dots.length > 0 && (
                    <div style={{ display:'flex', gap:2, flexWrap:'wrap', justifyContent:'center' }}>
                      {dots.slice(0,4).map((ev, ei) => (
                        <span key={ei} style={{ display:'inline-block', width:4, height:4, borderRadius:'50%', background: isSel ? 'rgba(255,255,255,0.55)' : (TYPE_CFG[ev.type]?.color || 'var(--btn-bg)'), opacity: ev._health ? 0.5 : 1 }}/>
                      ))}
                      {dots.length > 4 && <span style={{ color:'var(--text-muted)', fontSize:7, fontFamily:FF }}>+</span>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day events */}
          {selected && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:FF, margin:0 }}>
                  {new Date(selected + 'T12:00:00').toLocaleDateString([], { weekday:'long', month:'long', day:'numeric' })}
                </p>
                <button onClick={() => setShowModal(true)} style={{ background:'none', border:`1px solid var(--btn-bg)44`, borderRadius:7, color:'var(--btn-bg)', fontSize:10, fontFamily:FF, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 10px', cursor:'pointer' }}>+ Add</button>
              </div>
              {selectedEvents.length === 0 ? (
                <p style={{ color:'var(--text-faint)', fontSize:12, fontFamily:FF, fontStyle:'italic', textAlign:'center', padding:'16px 0' }}>No events — tap + Add to schedule something</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {selectedEvents.map(ev => <EventRow key={ev.id} event={ev} onDelete={id => deleteEvent.mutate(id)} deleting={deleteEvent.isPending}/>)}
                </div>
              )}
            </div>
          )}

          {/* Gmail section */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px', boxShadow:'var(--card-shadow)', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: gmailConn ? 10 : 12 }}>
              <div style={{ width:2, height:14, background:`linear-gradient(to bottom,var(--btn-bg),var(--btn-bg)22)`, borderRadius:2, boxShadow:'0 0 6px var(--btn-bg)88' }}/>
              <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:FF, fontWeight:700, margin:0 }}>Gmail Reminders</p>
            </div>
            {gmailConn ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                <div>
                  <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:FF, fontWeight:600, margin:0 }}>Connected</p>
                  {gmailEmail && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:FF, margin:'2px 0 0' }}>{gmailEmail}</p>}
                </div>
                <button onClick={handleDisconnectGmail} style={{ background:'none', border:'1px solid rgba(200,80,80,0.3)', borderRadius:8, color:'rgba(200,100,100,0.8)', fontSize:11, fontFamily:FF, padding:'6px 12px', cursor:'pointer' }}>Disconnect</button>
              </div>
            ) : (
              <>
                <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:FF, lineHeight:1.6, marginBottom:12 }}>Connect Gmail to receive email reminders for scheduled events.</p>
                {gmailError && <p style={{ color:'#e57373', fontSize:11, fontFamily:FF, marginBottom:10 }}>{gmailError.includes('VITE_GOOGLE_CLIENT_ID') ? 'Google Client ID not configured.' : gmailError}</p>}
                <button onClick={handleConnectGmail} disabled={gmailLoading} style={{ width:'100%', padding:'11px', borderRadius:9, background:'var(--btn-bg)', border:'none', color:'var(--btn-text)', fontSize:13, fontWeight:700, fontFamily:FF, cursor: gmailLoading ? 'default' : 'pointer', opacity: gmailLoading ? 0.6 : 1 }}>
                  {gmailLoading ? 'Connecting…' : 'Connect Gmail'}
                </button>
              </>
            )}
          </div>

        </div>
      )}

      {/* ── Modals ── */}
      {showModal && (
        <CreateModal
          defaultDate={selected || todayStr}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          gmailConnected={gmailConn}
          saving={addEvent.isPending}
        />
      )}

      {showReview && (
        <WeeklyReview
          weekDates={weekDates}
          events={[...events, ...yearEvents]}
          healthEvents={healthEvents}
          routineHistory={routineHistory}
          items={[]}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  )
}

function navBtn() {
  return { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:9, color:'var(--text-secondary)', fontSize:18, width:36, height:36, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }
}
