const FF = 'Helvetica Neue,Arial,sans-serif'
const TYPE_CFG = {
  general: { label:'General',  icon:'🗓',  color:'var(--btn-bg)' },
  workout: { label:'Workout',  icon:'💪',  color:'var(--accent-fitness,#dc4f3a)' },
  prayer:  { label:'Devotion', icon:'🙏',  color:'var(--accent-prayer,#c8a000)' },
  meal:    { label:'Meal',     icon:'🥗',  color:'var(--accent-food,#c8853a)' },
  finance: { label:'Finance',  icon:'💰',  color:'var(--accent-finance,#4db891)' },
}

function getCountdown(dateStr, timeStr) {
  const now    = new Date()
  const evDate = new Date(dateStr + (timeStr ? `T${timeStr}` : 'T00:00:00'))
  const diffMs  = evDate - now
  if (diffMs <= 0) return null
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs  = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60)  return `${diffMins}m`
  if (diffHrs  < 24)  return `${diffHrs}h`
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7)   return `${diffDays}d`
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w`
  return `${Math.floor(diffDays / 30)}mo`
}

function getDateLabel(dateStr, todayStr) {
  const d    = new Date(dateStr + 'T12:00:00')
  const tom  = new Date(todayStr + 'T12:00:00'); tom.setDate(tom.getDate() + 1)
  const tomStr = tom.toISOString().split('T')[0]
  if (dateStr === todayStr) return 'Today'
  if (dateStr === tomStr)   return 'Tomorrow'
  const diffDays = Math.round((d - new Date(todayStr + 'T12:00:00')) / 86400000)
  if (diffDays < 7) return d.toLocaleDateString([], { weekday:'long' })
  return d.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' })
}

export default function AgendaView({ upcoming = [], past = [], today, onDelete }) {
  const overdue = past.filter(ev => ev.date < today)

  const grouped = {}
  upcoming.forEach(ev => {
    if (!grouped[ev.date]) grouped[ev.date] = []
    grouped[ev.date].push(ev)
  })
  const sortedDates = Object.keys(grouped).sort()

  if (sortedDates.length === 0 && overdue.length === 0) {
    return (
      <div style={{ padding:'60px 20px', textAlign:'center' }}>
        <p style={{ fontSize:32, marginBottom:14 }}>📋</p>
        <p style={{ color:'var(--text-muted)', fontSize:14, fontFamily:FF, fontWeight:600, marginBottom:6 }}>Nothing coming up</p>
        <p style={{ color:'var(--text-faint)', fontSize:12, fontFamily:FF }}>Add events from the Month view.</p>
      </div>
    )
  }

  return (
    <div style={{ padding:'16px 18px 80px' }}>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <p style={{ color:'rgba(220,79,58,0.65)', fontSize:9, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:FF, marginBottom:10 }}>
            Missed ({overdue.length})
          </p>
          {overdue.map(ev => {
            const cfg = TYPE_CFG[ev.type] || TYPE_CFG.general
            return (
              <div key={ev.id} style={{
                display:'flex', alignItems:'center', gap:10, padding:'11px 14px', marginBottom:8,
                background:'rgba(220,79,58,0.06)', border:'1px solid rgba(220,79,58,0.15)',
                borderRadius:10,
              }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'rgba(220,79,58,0.12)', border:'1px solid rgba(220,79,58,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15 }}>
                  {cfg.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:FF, margin:0 }}>{ev.title}</p>
                  <p style={{ color:'rgba(212,212,232,0.35)', fontSize:10, fontFamily:FF, margin:'2px 0 0' }}>
                    {new Date(ev.date + 'T12:00:00').toLocaleDateString([], { month:'short', day:'numeric' })}
                    {ev.time ? ' · ' + new Date(`2000-01-01T${ev.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''}
                  </p>
                </div>
                <button onClick={() => onDelete(ev.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.5)', fontSize:18, lineHeight:1, padding:'4px 6px' }}>×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming by date */}
      {sortedDates.map(dateStr => {
        const isToday  = dateStr === today
        const label    = getDateLabel(dateStr, today)
        const evs      = grouped[dateStr]
        return (
          <div key={dateStr} style={{ marginBottom:24 }}>
            <p style={{
              fontFamily:FF, marginBottom:10,
              color: isToday ? '#c8d4c8' : 'var(--text-secondary)',
              fontSize: isToday ? 14 : 10,
              fontWeight: isToday ? 800 : 700,
              letterSpacing: isToday ? '-0.01em' : '0.14em',
              textTransform: isToday ? 'none' : 'uppercase',
            }}>{label}</p>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {evs.map(ev => {
                const timeStr  = ev.time ? new Date(`2000-01-01T${ev.time}`).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : null
                const countdown = getCountdown(dateStr, ev.time)
                const cfg = TYPE_CFG[ev.type] || TYPE_CFG.general
                return (
                  <div key={ev.id} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                    background:'var(--stat-bg)', border:`1px solid ${cfg.color}22`,
                    borderRadius:10, boxShadow:'var(--card-shadow)',
                  }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:`${cfg.color}18`, border:`1px solid ${cfg.color}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:FF, margin:0 }}>{ev.title}</p>
                      <div style={{ display:'flex', gap:8, marginTop:2, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ color:cfg.color, fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:FF, fontWeight:700 }}>{cfg.label}</span>
                        {timeStr && <span style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF }}>{timeStr}</span>}
                        {ev.notes && <span style={{ color:'rgba(212,212,232,0.3)', fontSize:10, fontFamily:FF, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>{ev.notes}</span>}
                      </div>
                    </div>
                    {countdown && (
                      <div style={{
                        padding:'3px 8px', borderRadius:99, flexShrink:0,
                        background: countdown === 'Tomorrow' || (countdown.endsWith('d') && parseInt(countdown) <= 3)
                          ? 'rgba(200,212,200,0.1)' : 'rgba(212,212,232,0.06)',
                        border:'1px solid rgba(212,212,232,0.08)',
                      }}>
                        <span style={{ color:'var(--text-muted)', fontSize:10, fontFamily:FF, fontWeight:700 }}>{countdown}</span>
                      </div>
                    )}
                    <button onClick={() => onDelete(ev.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.45)', fontSize:18, lineHeight:1, flexShrink:0, padding:'4px 6px' }}>×</button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
