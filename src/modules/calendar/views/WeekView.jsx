import { useState } from 'react'

const FF = 'Helvetica Neue,Arial,sans-serif'
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const TYPE_CFG = {
  general: { color:'var(--btn-bg)' },
  workout: { color:'var(--accent-fitness,#dc4f3a)' },
  prayer:  { color:'var(--accent-prayer,#c8a000)' },
  meal:    { color:'var(--accent-food,#c8853a)' },
  finance: { color:'var(--accent-finance,#4db891)' },
}

export default function WeekView({ events, healthEvents = [], today, weekStart, weekOffset, onChangeWeek, onAddEvent, onDeleteEvent }) {
  const [selectedDay, setSelectedDay] = useState(today)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const allDots = {}
  events.forEach(ev => {
    if (!allDots[ev.date]) allDots[ev.date] = []
    allDots[ev.date].push(ev)
  })
  healthEvents.forEach(h => {
    if (!allDots[h.date]) allDots[h.date] = []
    if (!allDots[h.date].some(e => e.type === h.type)) {
      allDots[h.date].push({ ...h, id:`h-${h.date}-${h.type}` })
    }
  })

  const selectedEvents = [...(allDots[selectedDay] || [])].sort((a, b) => {
    if (!a.time && !b.time) return 0
    if (!a.time) return -1
    if (!b.time) return 1
    return a.time.localeCompare(b.time)
  })

  const workoutsThisWeek = days.filter(d =>
    (allDots[d] || []).some(e => e.type === 'workout')
  ).length

  const weekLabel = (() => {
    const s = new Date(days[0] + 'T12:00:00')
    const e = new Date(days[6] + 'T12:00:00')
    const sf = s.toLocaleDateString([], { month:'short', day:'numeric' })
    const ef = e.toLocaleDateString([], { month:'short', day:'numeric' })
    return `${sf} – ${ef}`
  })()

  return (
    <div style={{ padding:'16px 18px 80px' }}>

      {/* Week navigation */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={() => onChangeWeek(weekOffset - 1)} style={navBtnStyle()}>‹</button>
        <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:FF }}>{weekLabel}</p>
        <button onClick={() => onChangeWeek(weekOffset + 1)} style={navBtnStyle()}>›</button>
      </div>

      {/* Rest day tip */}
      {workoutsThisWeek >= 4 && (
        <div style={{
          background:'rgba(220,79,58,0.07)', border:'1px solid rgba(220,79,58,0.18)',
          borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', gap:10, alignItems:'center',
        }}>
          <span style={{ fontSize:16 }}>💆</span>
          <p style={{ color:'rgba(220,79,58,0.8)', fontSize:12, fontFamily:FF }}>
            {workoutsThisWeek} workouts this week — consider a recovery day.
          </p>
        </div>
      )}

      {/* Day chips */}
      <div style={{ display:'flex', gap:5, overflowX:'auto', marginBottom:20, paddingBottom:2 }}>
        {days.map(dateStr => {
          const isToday   = dateStr === today
          const isSel     = dateStr === selectedDay
          const dots      = allDots[dateStr] || []
          const d         = new Date(dateStr + 'T12:00:00')
          return (
            <button key={dateStr} onClick={() => setSelectedDay(dateStr)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              padding:'10px 10px 8px', borderRadius:12, flexShrink:0, minWidth:46,
              background: isSel ? 'var(--btn-bg)' : isToday ? 'rgba(200,212,200,0.09)' : 'var(--bg-card)',
              border:`1px solid ${isSel ? 'var(--btn-bg)' : isToday ? 'rgba(200,212,200,0.28)' : 'var(--border)'}`,
              cursor:'pointer', transition:'all 0.15s',
            }}>
              <span style={{ color: isSel ? 'var(--btn-text)' : 'var(--text-muted)', fontSize:8, fontFamily:FF, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600 }}>
                {DAY_NAMES[d.getDay()]}
              </span>
              <span style={{ color: isSel ? 'var(--btn-text)' : isToday ? '#c8d4c8' : 'var(--text-primary)', fontSize:17, fontFamily:FF, fontWeight:900 }}>
                {d.getDate()}
              </span>
              <div style={{ display:'flex', gap:2 }}>
                {dots.slice(0,3).map((ev, i) => (
                  <div key={i} style={{ width:4, height:4, borderRadius:'50%', background: isSel ? 'rgba(255,255,255,0.55)' : (TYPE_CFG[ev.type]?.color || 'var(--btn-bg)') }}/>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected day header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.24em', textTransform:'uppercase', fontFamily:FF, margin:0 }}>
          {new Date(selectedDay + 'T12:00:00').toLocaleDateString([], { weekday:'long', month:'long', day:'numeric' })}
        </p>
        <button onClick={() => onAddEvent(selectedDay)} style={{
          background:'none', border:`1px solid var(--btn-bg)44`, borderRadius:7,
          color:'var(--btn-bg)', fontSize:10, fontFamily:FF, fontWeight:700,
          letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 10px', cursor:'pointer',
        }}>+ Add</button>
      </div>

      {/* Event list */}
      {selectedEvents.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0' }}>
          <p style={{ color:'var(--text-faint)', fontSize:12, fontFamily:FF, fontStyle:'italic' }}>
            Nothing scheduled — enjoy the space ✦
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {selectedEvents.map(ev => {
            const color = TYPE_CFG[ev.type]?.color || 'var(--btn-bg)'
            const timeStr = ev.time
              ? new Date(`2000-01-01T${ev.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
              : 'All day'
            const isHealth = ev._health
            return (
              <div key={ev.id} style={{
                display:'flex', gap:12, padding:'12px 14px', alignItems:'flex-start',
                background:'var(--stat-bg)', border:`1px solid ${color}22`,
                borderRadius:10, boxShadow:'var(--card-shadow)',
                opacity: isHealth ? 0.7 : 1,
              }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, minWidth:44, paddingTop:1 }}>
                  <span style={{ color, fontSize:10, fontFamily:FF, fontWeight:700, whiteSpace:'nowrap' }}>{timeStr}</span>
                  <div style={{ width:1, flex:1, background:`${color}33`, margin:'4px 0' }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:FF, margin:0, lineHeight:1.3 }}>{ev.title}</p>
                  {ev.notes && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:FF, margin:'3px 0 0', lineHeight:1.4 }}>{ev.notes}</p>}
                  {isHealth && <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:FF, margin:'2px 0 0' }}>auto-logged</p>}
                </div>
                {!isHealth && (
                  <button onClick={() => onDeleteEvent(ev.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.4)', fontSize:18, flexShrink:0, lineHeight:1 }}>×</button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function navBtnStyle() {
  return {
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8,
    color:'var(--text-secondary)', fontSize:16, width:32, height:32,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700,
  }
}
