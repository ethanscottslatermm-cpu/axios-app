import { useState, useEffect } from 'react'

const DISPLAY_NAMES = {
  '^DJI':    'DOW',
  '^GSPC':   'S&P 500',
  '^IXIC':   'NASDAQ',
  'BTC-USD': 'BTC',
  'GC=F':    'GOLD',
}

const NAME_COLORS = {
  '^DJI':    '#60a5fa', // blue
  '^GSPC':   '#a78bfa', // purple
  '^IXIC':   '#38bdf8', // sky blue
  'BTC-USD': '#fb923c', // orange
  'GC=F':    '#fbbf24', // gold
}

function fmt(price, symbol) {
  if (!price && price !== 0) return '—'
  if (symbol === 'BTC-USD') return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PLACEHOLDER = [
  { symbol: '^DJI',    name: 'DOW' },
  { symbol: '^GSPC',   name: 'S&P 500' },
  { symbol: '^IXIC',   name: 'NASDAQ' },
  { symbol: 'BTC-USD', name: 'BTC' },
  { symbol: 'GC=F',    name: 'GOLD' },
]

export default function StockTicker() {
  const [quotes,  setQuotes]  = useState([])
  const [loading, setLoading] = useState(true)

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

  const display = quotes.length > 0 ? quotes : PLACEHOLDER
  const items   = [...display, ...display]

  return (
    <div style={{
      overflow: 'hidden',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      height: 30,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      zIndex: 49,
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
          animation: ticker-scroll 30s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker-pulse { 0%,100%{opacity:.3} 50%{opacity:.7} }
        .ticker-loading { animation: ticker-pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div className="ticker-track">
        {items.map((q, i) => {
          const hasData = q.price != null
          const up      = hasData && q.change >= 0
          const color   = !hasData ? 'rgba(255,255,255,0.25)' : up ? '#4ade80' : '#f87171'
          const arrow   = up ? '▲' : '▼'
          const name    = DISPLAY_NAMES[q.symbol] || q.name || q.symbol

          return (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '0 18px',
              fontSize: 10,
              fontFamily: 'Helvetica Neue, sans-serif',
              borderRight: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ color: NAME_COLORS[q.symbol] || 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, fontSize: 9 }}>
                {name}
              </span>
              {hasData ? (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                    ${fmt(q.price, q.symbol)}
                  </span>
                  <span style={{ color, fontSize: 9, fontWeight: 700 }}>
                    {arrow} {Math.abs(q.changePercent ?? 0).toFixed(2)}%
                  </span>
                </>
              ) : (
                <span className={loading ? 'ticker-loading' : ''} style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>
                  {loading ? '· · ·' : '—'}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
