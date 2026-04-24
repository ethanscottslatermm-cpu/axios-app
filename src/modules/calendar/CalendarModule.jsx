import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCalendarEvents, usePendingReminders } from '../../hooks/useCalendarEvents'
import {
  isGmailConnected, getGmailEmail,
  connectGmail, disconnectGmail, sendReminderEmail,
} from '../../lib/gmail'
import RoutineTracker from './RoutineTracker'

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const TYPE_CFG = {
  general: { label: 'General',  color: 'var(--btn-bg)',              icon: '◆' },
  workout: { label: 'Workout',  color: 'var(--accent-fitness,#dc4f3a)', icon: '◆' },
  prayer:  { label: 'Prayer',   color: 'var(--accent-prayer,#c8a000)',  icon: '◆' },
  meal:    { label: 'Meal',     color: 'var(--accent-food,#c8853a)',    icon: '◆' },
  finance: { label: 'Finance',  color: 'var(--accent-finance,#4db891)', icon: '◆' },
}

const FF = 'Helvetica Neue,Arial,sans-serif'
const toDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

// ─── Reminder email HTML ──────────────────────────────────────────────────────
function buildReminderHtml(event) {
  const typeLabel = TYPE_CFG[event.type]?.label || 'Event'
  const timeStr   = event.time
    ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    : ''
  return `
    <div style="font-family:Helvetica Neue,Arial,sans-serif;max-width:500px;margin:0 auto;background:#0c0b09;color:#ede8e0;border-radius:12px;padding:28px 32px;border:1px solid rgba(200,180,140,0.18)">
      <p style="font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(200,190,175,0.5);margin:0 0 8px">AXIOS REMINDER</p>
      <h2 style="font-size:22px;font-weight:900;margin:0 0 6px;color:#ede8e0">${event.title}</h2>
      <p style="font-size:13px;color:rgba(200,190,175,0.6);margin:0 0 20px">${typeLabel}${timeStr ? ' · ' + timeStr : ''}</p>
      ${event.notes ? `<p style="font-size:13px;color:rgba(200,190,175,0.75);line-height:1.6;margin:0">${event.notes}</p>` : ''}
      <p style="font-size:10px;color:rgba(200,190,175,0.3);margin:20px 0 0">Sent by AXIOS · I Am Worthy</p>
    </div>`
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function EventDot({ type, size = 6 }) {
  const color = TYPE_CFG[type]?.color || 'var(--btn-bg)'
  return (
    <span style={{
      display:'inline-block', width:size, height:size, borderRadius:'50%',
      background:color, boxShadow:`0 0 4px ${color}88`, flexShrink:0,
    }}/>
  )
}

function EventRow({ event, onDelete, deleting }) {
  const cfg    = TYPE_CFG[event.type] || TYPE_CFG.general
  const timeStr = event.time
    ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    : null
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
      background:'var(--stat-bg)', border:`1px solid ${cfg.color}22`,
      borderRadius:10, boxShadow:'var(--card-shadow)',
    }}>
      <EventDot type={event.type} size={8}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:FF, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {event.title}
        </p>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:2 }}>
          <span style={{ color:cfg.color, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, fontWeight:700 }}>{cfg.label}</span>
          {timeStr && <span style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF }}>{timeStr}</span>}
          {event.email_reminder && (
            <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:FF }}>· 📧</span>
          )}
        </div>
        {event.notes && (
          <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:FF, margin:'4px 0 0', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {event.notes}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(event.id)}
        disabled={deleting}
        style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.5)', fontSize:16, padding:'4px 6px', lineHeight:1, flexShrink:0 }}
      >×</button>
    </div>
  )
}

function CreateModal({ defaultDate, onClose, onSave, gmailConnected, saving }) {
  const [form, setForm] = useState({
    title:'', date: defaultDate || '', time:'', type:'general',
    notes:'', recurring:'none', email_reminder: false,
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const valid = form.title.trim() && form.date

  return (
    <div style={{
      position:'fixed', inset:0, background:'var(--overlay-bg)', zIndex:200,
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:500, background:'var(--sheet-bg)',
          borderRadius:'20px 20px 0 0', padding:'24px 20px 36px',
          border:'1px solid var(--border)', borderBottom:'none',
        }}
      >
        {/* Handle */}
        <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)', margin:'0 auto 20px' }}/>

        <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:FF, marginBottom:4 }}>NEW EVENT</p>
        <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:FF, marginBottom:20, letterSpacing:'-0.02em' }}>Schedule</p>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Title */}
          <input
            autoFocus placeholder="Event title"
            value={form.title} onChange={e => set('title', e.target.value)}
            style={inputStyle()}
          />

          {/* Date + Time */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle()} />
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inputStyle()} />
          </div>

          {/* Type */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {Object.entries(TYPE_CFG).map(([k, cfg]) => (
              <button key={k} onClick={() => set('type', k)} style={{
                padding:'5px 12px', borderRadius:99, fontSize:10, fontFamily:FF,
                fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
                cursor:'pointer', border:`1px solid ${cfg.color}${form.type===k?'':'44'}`,
                background: form.type===k ? `${cfg.color}22` : 'transparent',
                color: form.type===k ? cfg.color : 'var(--text-muted)',
                transition:'all 0.15s',
              }}>{cfg.label}</button>
            ))}
          </div>

          {/* Recurring */}
          <div style={{ display:'flex', gap:6 }}>
            {[['none','One-time'],['weekly','Weekly'],['daily','Daily']].map(([v, l]) => (
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

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)" rows={2}
            value={form.notes} onChange={e => set('notes', e.target.value)}
            style={{ ...inputStyle(), resize:'none', lineHeight:1.55 }}
          />

          {/* Email reminder */}
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor: gmailConnected ? 'pointer' : 'default', opacity: gmailConnected ? 1 : 0.4 }}>
            <div
              onClick={() => gmailConnected && set('email_reminder', !form.email_reminder)}
              style={{
                width:38, height:22, borderRadius:11, position:'relative',
                background: form.email_reminder && gmailConnected ? 'var(--btn-bg)' : 'var(--bg-card-hover)',
                border:'1px solid var(--border)', transition:'background 0.2s', cursor: gmailConnected ? 'pointer' : 'default',
              }}
            >
              <div style={{
                position:'absolute', top:2, left: form.email_reminder && gmailConnected ? 18 : 2,
                width:16, height:16, borderRadius:'50%', background:'var(--text-primary)',
                transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.4)',
              }}/>
            </div>
            <div>
              <p style={{ color:'var(--text-secondary)', fontSize:12, fontFamily:FF, margin:0 }}>Email reminder</p>
              {!gmailConnected && <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF, margin:0 }}>Connect Gmail to enable</p>}
            </div>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:10, background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:13, fontFamily:FF, cursor:'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => valid && !saving && onSave(form)}
            disabled={!valid || saving}
            style={{ flex:2, padding:'13px', borderRadius:10, background:'var(--btn-bg)', border:'none', color:'var(--btn-text)', fontSize:13, fontWeight:700, fontFamily:FF, cursor: valid && !saving ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.4 }}
          >
            {saving ? 'Saving…' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

function inputStyle() {
  return {
    width:'100%', padding:'11px 13px', borderRadius:9,
    background:'var(--input-bg)', border:'1px solid var(--border)',
    color:'var(--text-primary)', fontSize:13, fontFamily:FF, outline:'none',
    boxSizing:'border-box',
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CalendarModule() {
  const navigate   = useNavigate()
  const today      = new Date()
  const [activeView, setActiveView] = useState('calendar')
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected,  setSelected]  = useState(null)       // 'YYYY-MM-DD'
  const [showModal, setShowModal] = useState(false)
  const [gmailConn, setGmailConn] = useState(isGmailConnected())
  const [gmailEmail, setGmailEmail] = useState(getGmailEmail())
  const [gmailLoading, setGmailLoading] = useState(false)
  const [gmailError,   setGmailError]   = useState(null)

  const { events, isLoading, addEvent, deleteEvent, markReminderSent } = useCalendarEvents(year, month)
  const { data: pendingReminders = [] } = usePendingReminders()

  // ── Send due email reminders on mount ──────────────────────────────────────
  useEffect(() => {
    if (!gmailConn || !pendingReminders.length) return
    pendingReminders.forEach(async (ev) => {
      try {
        await sendReminderEmail(`AXIOS Reminder: ${ev.title}`, buildReminderHtml(ev))
        markReminderSent.mutate(ev.id)
      } catch (e) {
        console.warn('Reminder send failed:', e.message)
      }
    })
  }, [pendingReminders, gmailConn])

  // ── Calendar grid helpers ──────────────────────────────────────────────────
  const firstDay   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr   = today.toISOString().split('T')[0]

  const eventsByDate = events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = []
    acc[ev.date].push(ev)
    return acc
  }, {})

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const selectedEvents = selected ? (eventsByDate[selected] || []) : []

  // ── Gmail handlers ─────────────────────────────────────────────────────────
  const handleConnectGmail = useCallback(() => {
    setGmailLoading(true)
    setGmailError(null)
    connectGmail(
      (email) => { setGmailConn(true); setGmailEmail(email); setGmailLoading(false) },
      (err)   => { setGmailError(String(err)); setGmailLoading(false) },
    )
  }, [])

  const handleDisconnectGmail = () => {
    disconnectGmail()
    setGmailConn(false)
    setGmailEmail(null)
  }

  // ── Save event ─────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    const payload = {
      title:          form.title.trim(),
      date:           form.date,
      time:           form.time || null,
      type:           form.type,
      notes:          form.notes.trim() || null,
      recurring:      form.recurring,
      email_reminder: form.email_reminder && gmailConn,
      reminder_sent:  false,
    }
    await addEvent.mutateAsync(payload)
    setShowModal(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg-primary)', paddingBottom:40 }}>

      {/* Header */}
      <div style={{
        position:'sticky', top:0, zIndex:10,
        background:'var(--header-bg)', borderBottom:'1px solid var(--border)',
        padding:'16px 18px 12px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'var(--text-muted)', fontSize:20, lineHeight:1, padding:'2px 6px 2px 0',
          }}>‹</button>
          <div style={{ flex:1 }}>
            <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:FF, margin:0 }}>AXIOS</p>
            <h1 style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:FF, margin:0, letterSpacing:'-0.02em' }}>
              {activeView === 'calendar' ? 'Calendar' : 'Routine Tracker'}
            </h1>
          </div>
          {activeView === 'calendar' && (
            <button
              onClick={() => { setSelected(selected || todayStr); setShowModal(true) }}
              style={{
                background:'var(--btn-bg)', border:'none', borderRadius:9,
                color:'var(--btn-text)', fontSize:20, width:36, height:36,
                cursor:'pointer', fontWeight:700, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >+</button>
          )}
        </div>
        {/* View tabs */}
        <div style={{ display:'flex', gap:6 }}>
          {[
            { key:'calendar', label:'Calendar' },
            { key:'routine',  label:'Routines'  },
          ].map(({ key, label }) => {
            const active = activeView === key
            return (
              <button key={key} onClick={() => setActiveView(key)} style={{
                padding:'7px 16px', borderRadius:99,
                background: active ? 'rgba(200,212,200,0.12)' : 'transparent',
                border: `1px solid ${active ? 'rgba(200,212,200,0.35)' : 'rgba(212,212,232,0.1)'}`,
                color: active ? '#c8d4c8' : 'rgba(212,212,232,0.35)',
                fontSize:11, fontFamily:FF, fontWeight: active ? 700 : 400,
                cursor:'pointer', transition:'all 0.18s', letterSpacing:'0.04em',
              }}>{label}</button>
            )
          })}
        </div>
      </div>

      {activeView === 'routine' && <RoutineTracker today={todayStr} />}

      {activeView === 'calendar' && <div style={{ padding:'20px 18px 0' }}>

        {/* Month navigation */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <button onClick={prevMonth} style={navBtn()}>‹</button>
          <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:800, fontFamily:FF, letterSpacing:'-0.01em', margin:0 }}>
            {MONTHS[month]} {year}
          </p>
          <button onClick={nextMonth} style={navBtn()}>›</button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
          {DAYS.map(d => (
            <p key={d} style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:FF, textAlign:'center', margin:0, padding:'4px 0' }}>{d}</p>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:24 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`}/>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day    = i + 1
            const dStr   = toDateStr(year, month, day)
            const isToday = dStr === todayStr
            const isSel   = dStr === selected
            const dayEvs  = eventsByDate[dStr] || []
            return (
              <button key={day} onClick={() => setSelected(isSel ? null : dStr)} style={{
                background: isSel
                  ? 'var(--btn-bg)'
                  : isToday
                    ? 'var(--bg-card-hover)'
                    : 'transparent',
                border: isToday && !isSel
                  ? '1px solid var(--btn-bg)'
                  : isSel
                    ? '1px solid var(--btn-bg)'
                    : '1px solid transparent',
                borderRadius:9, padding:'7px 2px 5px', cursor:'pointer',
                display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                transition:'all 0.15s',
              }}>
                <span style={{
                  color: isSel ? 'var(--btn-text)' : isToday ? 'var(--btn-bg)' : 'var(--text-secondary)',
                  fontSize:12, fontWeight: isToday || isSel ? 800 : 400, fontFamily:FF,
                }}>{day}</span>
                {/* Event dots */}
                {dayEvs.length > 0 && (
                  <div style={{ display:'flex', gap:2, flexWrap:'wrap', justifyContent:'center' }}>
                    {dayEvs.slice(0, 3).map((ev, ei) => (
                      <EventDot key={ei} type={ev.type} size={5}/>
                    ))}
                    {dayEvs.length > 3 && (
                      <span style={{ color:'var(--text-muted)', fontSize:8, fontFamily:FF }}>+{dayEvs.length - 3}</span>
                    )}
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
              <button onClick={() => setShowModal(true)} style={{
                background:'none', border:`1px solid var(--btn-bg)44`, borderRadius:7,
                color:'var(--btn-bg)', fontSize:10, fontFamily:FF, fontWeight:700,
                letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 10px', cursor:'pointer',
              }}>+ Add</button>
            </div>

            {selectedEvents.length === 0 ? (
              <p style={{ color:'var(--text-faint)', fontSize:12, fontFamily:FF, fontStyle:'italic', textAlign:'center', padding:'16px 0' }}>
                No events — tap + Add to schedule something
              </p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {selectedEvents.map(ev => (
                  <EventRow
                    key={ev.id} event={ev}
                    onDelete={(id) => deleteEvent.mutate(id)}
                    deleting={deleteEvent.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gmail connect section */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:14, padding:'16px', boxShadow:'var(--card-shadow)', marginBottom:20,
        }}>
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
              <button onClick={handleDisconnectGmail} style={{
                background:'none', border:'1px solid rgba(200,80,80,0.3)', borderRadius:8,
                color:'rgba(200,100,100,0.8)', fontSize:11, fontFamily:FF, padding:'6px 12px', cursor:'pointer',
              }}>Disconnect</button>
            </div>
          ) : (
            <>
              <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:FF, lineHeight:1.6, marginBottom:12 }}>
                Connect your Gmail account to receive email reminders for events you schedule.
              </p>
              {gmailError && (
                <p style={{ color:'#e57373', fontSize:11, fontFamily:FF, marginBottom:10 }}>
                  {gmailError.includes('VITE_GOOGLE_CLIENT_ID')
                    ? 'Google Client ID not configured — add VITE_GOOGLE_CLIENT_ID to your environment variables.'
                    : gmailError}
                </p>
              )}
              <button
                onClick={handleConnectGmail}
                disabled={gmailLoading}
                style={{
                  width:'100%', padding:'11px', borderRadius:9,
                  background:'var(--btn-bg)', border:'none',
                  color:'var(--btn-text)', fontSize:13, fontWeight:700, fontFamily:FF,
                  cursor: gmailLoading ? 'default' : 'pointer', opacity: gmailLoading ? 0.6 : 1,
                }}
              >{gmailLoading ? 'Connecting…' : 'Connect Gmail'}</button>
            </>
          )}
        </div>

      </div>}

      {/* Create event modal */}
      {showModal && (
        <CreateModal
          defaultDate={selected || todayStr}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          gmailConnected={gmailConn}
          saving={addEvent.isPending}
        />
      )}
    </div>
  )
}

function navBtn() {
  return {
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:9, color:'var(--text-secondary)', fontSize:18,
    width:36, height:36, cursor:'pointer', display:'flex',
    alignItems:'center', justifyContent:'center', fontWeight:700,
  }
}
