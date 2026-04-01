import { useState, useEffect, useRef } from 'react'

const DISPLAY_NAMES = {
  '^DJI':    'DOW',
  '^GSPC':   'S&P 500',
  '^IXIC':   'NASDAQ',
  'BTC-USD': 'BTC',
  'GC=F':    'GOLD',
}

function fmt(price, symbol) {
  if (symbol === 'BTC-USD') return price?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (symbol === 'GC=F')   return price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function StockTicker() {
  const [quotes, setQuotes] = useState([])
  const [error,  setError]  = useState(false)
  const trackRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stocks')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (data.error) throw new Error()
        setQuotes(data)
        setError(false)
      } catch {
        setError(true)
      }
    }
    load()
    const id = setInterval(load, 2 * 60 * 1000) // refresh every 2 min
    return () => clearInterval(id)
  }, [])

  if (error || quotes.length === 0) return null

  // Duplicate items so the loop is seamless
  const items = [...quotes, ...quotes]

  return (
    <div style={{
      overflow: 'hidden',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      height: 32,
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
          animation: ticker-scroll 28s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="ticker-track" ref={trackRef}>
        {items.map((q, i) => {
          const up = q.change >= 0
          const color = up ? '#4ade80' : '#f87171'
          const arrow = up ? '▲' : '▼'
          const name  = DISPLAY_NAMES[q.symbol] || q.symbol

          return (
            <span key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '0 20px',
              fontSize: 10,
              fontFamily: 'Helvetica Neue, sans-serif',
              letterSpacing: '0.05em',
              borderRight: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, fontSize: 9 }}>
                {name}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                ${fmt(q.price, q.symbol)}
              </span>
              <span style={{ color, fontSize: 9, fontWeight: 700 }}>
                {arrow} {Math.abs(q.changePercent).toFixed(2)}%
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
