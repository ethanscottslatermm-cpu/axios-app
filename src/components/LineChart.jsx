// Reusable SVG line chart — theme-aware, no dependencies

export default function LineChart({
  data = [],          // [{ label, value }]
  height = 80,
  color = 'var(--glow-bar)',
  showDots = true,
  showLabels = true,
  fillOpacity = 0.12,
}) {
  if (data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-faint)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', fontStyle: 'italic' }}>
          Not enough data yet
        </p>
      </div>
    )
  }

  const W = 320
  const H = height
  const pad = { top: 8, bottom: showLabels ? 22 : 6, left: 4, right: 4 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const xScale = (i) => pad.left + (i / (data.length - 1)) * innerW
  const yScale = (v) => pad.top + innerH - ((v - min) / range) * innerH

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.value), ...d }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = `${linePath} L ${points[points.length-1].x} ${H - pad.bottom} L ${points[0].x} ${H - pad.bottom} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path d={fillPath} fill="url(#chartFill)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} opacity={0.9} />
      ))}

      {/* X labels — show first, middle, last */}
      {showLabels && [0, Math.floor(data.length / 2), data.length - 1].map(i => (
        <text
          key={i}
          x={points[i].x}
          y={H - 4}
          textAnchor="middle"
          fontSize={9}
          fill="var(--text-muted)"
          fontFamily="Helvetica Neue, sans-serif"
        >
          {data[i].label}
        </text>
      ))}
    </svg>
  )
}
