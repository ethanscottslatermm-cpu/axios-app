const FF = 'Helvetica Neue,Arial,sans-serif'
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function densityColor(count) {
  if (!count)    return 'rgba(212,212,232,0.06)'
  if (count < 2) return 'rgba(200,212,200,0.22)'
  if (count < 4) return 'rgba(200,212,200,0.45)'
  if (count < 6) return 'rgba(200,212,200,0.68)'
  return 'rgba(200,212,200,0.88)'
}

export default function YearView({ year, yearEvents = [], today, onSelectMonth }) {
  const pad = n => String(n).padStart(2,'0')

  const densityMap = {}
  yearEvents.forEach(ev => {
    densityMap[ev.date] = (densityMap[ev.date] || 0) + 1
  })

  const totalEvents = yearEvents.length
  const busiest = Object.entries(densityMap).sort((a,b) => b[1]-a[1])[0]

  return (
    <div style={{ padding:'16px 18px 80px' }}>

      {/* Year header */}
      <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:20 }}>
        <p style={{ color:'var(--text-primary)', fontSize:28, fontWeight:900, fontFamily:FF, letterSpacing:'-0.03em' }}>{year}</p>
        <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:FF }}>{totalEvents} events total</p>
      </div>

      {/* Density legend */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
        <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:FF }}>Less</span>
        {[0,1,3,5,7].map(n => (
          <div key={n} style={{ width:12, height:12, borderRadius:3, background:densityColor(n) }}/>
        ))}
        <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:FF }}>More</span>
      </div>

      {/* 12-month grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {Array.from({ length: 12 }, (_, m) => {
          const daysInMonth = new Date(year, m + 1, 0).getDate()
          const firstDay    = new Date(year, m, 1).getDay()
          const monthStr    = `${year}-${pad(m + 1)}`
          const monthTotal  = Object.entries(densityMap).filter(([d]) => d.startsWith(monthStr)).reduce((s,[,v]) => s+v, 0)
          const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === m

          return (
            <button
              key={m}
              onClick={() => onSelectMonth(m)}
              style={{
                background:'var(--bg-card)',
                border:`1px solid ${isCurrentMonth ? 'rgba(200,212,200,0.3)' : 'var(--border)'}`,
                borderRadius:12, padding:'12px 10px', cursor:'pointer',
                boxShadow:'var(--card-shadow)', transition:'all 0.18s', textAlign:'left',
              }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ color: isCurrentMonth ? '#c8d4c8' : 'var(--text-secondary)', fontSize:11, fontWeight:700, fontFamily:FF }}>
                  {MONTHS[m]}
                </span>
                {monthTotal > 0 && (
                  <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:FF }}>{monthTotal}</span>
                )}
              </div>

              {/* Mini calendar grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
                {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`}/>)}
                {Array.from({ length: daysInMonth }, (_, d) => {
                  const dateStr  = `${monthStr}-${pad(d + 1)}`
                  const count    = densityMap[dateStr] || 0
                  const isToday  = dateStr === today
                  return (
                    <div key={d} style={{
                      width:'100%', aspectRatio:'1', borderRadius:2,
                      background: isToday ? 'var(--btn-bg)' : densityColor(count),
                      boxShadow: isToday ? '0 0 4px var(--btn-bg)77' : 'none',
                    }}/>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>

      {/* Busiest day callout */}
      {busiest && (
        <div style={{
          marginTop:20, padding:'14px 16px',
          background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12,
          boxShadow:'var(--card-shadow)',
        }}>
          <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:FF, marginBottom:4 }}>Busiest day</p>
          <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:FF }}>
            {new Date(busiest[0] + 'T12:00:00').toLocaleDateString([], { weekday:'long', month:'long', day:'numeric' })}
            <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:12 }}> · {busiest[1]} events</span>
          </p>
        </div>
      )}
    </div>
  )
}
