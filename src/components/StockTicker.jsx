import { useState, useEffect, useRef } from 'react'

// ── Stock config ──────────────────────────────────────────────────────────────
const DISPLAY_NAMES = {
  '^DJI':    'DOW',
  '^GSPC':   'S&P 500',
  '^IXIC':   'NASDAQ',
  'BTC-USD': 'BTC',
  'GC=F':    'GOLD',
}
const NAME_COLORS = {
  '^DJI':    '#60a5fa',
  '^GSPC':   '#a78bfa',
  '^IXIC':   '#38bdf8',
  'BTC-USD': '#fb923c',
  'GC=F':    '#fbbf24',
}
const PLACEHOLDER = [
  { symbol: '^DJI'    },
  { symbol: '^GSPC'   },
  { symbol: '^IXIC'   },
  { symbol: 'BTC-USD' },
  { symbol: 'GC=F'    },
]

function fmt(price, symbol) {
  if (!price && price !== 0) return '—'
  if (symbol === 'BTC-USD') return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── News config ───────────────────────────────────────────────────────────────
// Fetched via Netlify function (server-side RSS parse, no CORS / no API key)
async function fetchAllNews() {
  try {
    const res = await fetch('/api/news')
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function truncate(str, max = 90) {
  return str.length <= max ? str : str.slice(0, max - 1) + '…'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StockTicker() {
  const [quotes,  setQuotes]  = useState([])
  const [loading, setLoading] = useState(true)
  const [news,    setNews]    = useState([])
  const [newIds,  setNewIds]  = useState(new Set())
  const seenRef = useRef(new Set())

  // Stocks — refresh every 2 min
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stocks')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) throw new Error()
        setQuotes(data)
      } catch {
        setQuotes([])
      } finally {
        setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // News — refresh every 10 min
  useEffect(() => {
    const load = async () => {
      const items = await fetchAllNews()
      if (items.length === 0) return
      const fresh = new Set()
      items.forEach(item => {
        if (seenRef.current.size > 0 && !seenRef.current.has(item.id)) fresh.add(item.id)
        seenRef.current.add(item.id)
      })
      setNews(items)
      if (fresh.size > 0) {
        setNewIds(fresh)
        // Clear UPDATE badge after 60 s
        setTimeout(() => setNewIds(new Set()), 60_000)
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // Build interleaved track: 2 stocks → 1 news headline → repeat
  const stockDisplay = quotes.length > 0 ? quotes : PLACEHOLDER
  const combined = []
  const maxCycles = Math.max(stockDisplay.length, news.length)
  for (let i = 0; i < maxCycles; i++) {
    if (i < stockDisplay.length) combined.push({ type: 'stock', data: stockDisplay[i] })
    if (i + 1 < stockDisplay.length) combined.push({ type: 'stock', data: stockDisplay[i + 1] })
    if (i < news.length)   combined.push({ type: 'news',  data: news[i]  })
    // skip stock index we already added
    if (i + 1 < stockDisplay.length) i++
  }
  // De-dup stocks that might appear twice from the loop above
  const seen = new Set()
  const deduped = combined.filter(item => {
    if (item.type === 'news') return true
    const k = item.data.symbol
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  // Remaining stocks not yet added (in case news is empty)
  stockDisplay.forEach(s => {
    if (!seen.has(s.symbol)) deduped.push({ type: 'stock', data: s })
  })

  const items = deduped.length > 0 ? [...deduped, ...deduped] : []

  // Scale speed: ~4 s per item, but news items are wider — estimate
  const approxDuration = Math.max(30, deduped.length * 5)

  return (
    <div style={{
      overflow:         'hidden',
      borderBottom:     '1px solid var(--border)',
      background:       'rgba(0,0,0,0.6)',
      backdropFilter:   'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      height:           30,
      display:          'flex',
      alignItems:       'center',
      position:         'relative',
      zIndex:           49,
    }}>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: ticker-scroll ${approxDuration}s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker-pulse   { 0%,100%{opacity:.3} 50%{opacity:.7} }
        @keyframes update-flash   { 0%,100%{opacity:0.7} 50%{opacity:1} }
        .ticker-loading { animation: ticker-pulse 1.5s ease-in-out infinite; }
        .update-badge   { animation: update-flash 1.1s ease-in-out infinite; }
      `}</style>

      <div className="ticker-track">
        {items.map((item, i) => {

          // ── Stock item ──────────────────────────────────────────────────────
          if (item.type === 'stock') {
            const q       = item.data
            const hasData = q.price != null
            const up      = hasData && q.change >= 0
            const color   = !hasData ? 'rgba(212,212,232,0.25)' : up ? '#4ade80' : '#f87171'
            const arrow   = up ? '▲' : '▼'
            const name    = DISPLAY_NAMES[q.symbol] || q.name || q.symbol
            return (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '0 18px', fontSize: 10,
                fontFamily: 'Helvetica Neue, sans-serif',
                borderRight: '1px solid rgba(212,212,232,0.07)',
              }}>
                <span style={{ color: NAME_COLORS[q.symbol] || 'rgba(212,212,232,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, fontSize: 9 }}>
                  {name}
                </span>
                {hasData ? (
                  <>
                    <span style={{ color: 'rgba(212,212,232,0.85)', fontWeight: 600 }}>
                      ${fmt(q.price, q.symbol)}
                    </span>
                    <span style={{ color, fontSize: 9, fontWeight: 700 }}>
                      {arrow} {Math.abs(q.changePercent ?? 0).toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className={loading ? 'ticker-loading' : ''} style={{ color: 'rgba(212,212,232,0.2)', fontSize: 9 }}>
                    {loading ? '· · ·' : '—'}
                  </span>
                )}
              </span>
            )
          }

          // ── News item ───────────────────────────────────────────────────────
          const n     = item.data
          const isNew = newIds.has(n.id)
          return (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '0 22px', fontSize: 9,
              fontFamily: 'Helvetica Neue, sans-serif',
              borderRight: '1px solid rgba(212,212,232,0.07)',
            }}>
              {isNew && (
                <span className="update-badge" style={{
                  background:   'rgba(239,68,68,0.12)',
                  border:       '1px solid rgba(239,68,68,0.45)',
                  color:        '#ef4444',
                  fontSize:     7,
                  fontWeight:   800,
                  letterSpacing:'0.22em',
                  padding:      '1px 5px',
                  borderRadius:  3,
                  textTransform:'uppercase',
                  flexShrink:   0,
                }}>UPDATE</span>
              )}
              <span style={{ color: n.color || 'rgba(212,212,232,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, fontSize: 8, flexShrink: 0 }}>
                {n.source}
              </span>
              <span style={{ color: 'rgba(212,212,232,0.7)', fontSize: 9, fontWeight: 400 }}>
                {truncate(n.title)}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
