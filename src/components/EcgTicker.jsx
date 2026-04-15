import { useState, useEffect, useMemo } from 'react'

// ── ECG path builder ──────────────────────────────────────────────────────────
const CYCLE_W = 180   // px per heartbeat cycle
const REPS    = 14    // total repetitions (half used for seamless loop)

function buildPath(reps) {
  let d = `M 0,15`
  for (let i = 0; i < reps; i++) {
    const o = i * CYCLE_W
    d += ` L ${o+28},15`       // flat baseline
    d += ` L ${o+33},13`       // P wave up
    d += ` L ${o+37},10`       // P peak
    d += ` L ${o+41},13`       // P wave down
    d += ` L ${o+48},15`       // PR interval
    d += ` L ${o+52},19`       // Q dip
    d += ` L ${o+56},2`        // R spike
    d += ` L ${o+60},23`       // S dip
    d += ` L ${o+64},15`       // return to baseline
    d += ` L ${o+72},15`       // flat
    d += ` L ${o+77},12`       // T wave up
    d += ` L ${o+84},7`        // T peak
    d += ` L ${o+91},12`       // T wave down
    d += ` L ${o+CYCLE_W},15`  // flat to cycle end
  }
  return d
}

const PATH = buildPath(REPS)
const TOTAL_W = CYCLE_W * REPS
const HALF_W  = CYCLE_W * (REPS / 2)

// Simulated BPM — drifts naturally between 64–80
function nextBpm(prev) {
  const delta = (Math.random() - 0.5) * 4
  return Math.round(Math.min(80, Math.max(64, prev + delta)))
}

export default function EcgTicker() {
  const [bpm, setBpm] = useState(72)

  // Drift BPM every 4 seconds
  useEffect(() => {
    const id = setInterval(() => setBpm(p => nextBpm(p)), 4000)
    return () => clearInterval(id)
  }, [])

  const duration = useMemo(() => {
    // ~12s per cycle — faster BPM = faster scroll
    return Math.round(12 * (72 / bpm) * (REPS / 2))
  }, [bpm])

  return (
    <div style={{
      overflow:             'hidden',
      borderBottom:         '1px solid var(--border)',
      background:           'rgba(0,0,0,0.6)',
      backdropFilter:       'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      height:               30,
      display:              'flex',
      alignItems:           'center',
      position:             'relative',
      zIndex:               49,
    }}>
      <style>{`
        @keyframes ecg-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${HALF_W}px); }
        }
        @keyframes ecg-heart {
          0%,100% { transform: scale(1);   opacity: 0.6; }
          15%     { transform: scale(1.35); opacity: 1;   }
          30%     { transform: scale(1);   opacity: 0.6; }
          45%     { transform: scale(1.15); opacity: 0.85; }
          60%     { transform: scale(1);   opacity: 0.6; }
        }
        @keyframes ecg-bpm-change {
          0%   { opacity: 0; transform: translateY(-3px); }
          20%  { opacity: 1; transform: translateY(0);    }
          80%  { opacity: 1; transform: translateY(0);    }
          100% { opacity: 1; }
        }
        .ecg-bpm-val { animation: ecg-bpm-change 0.4s ease both; }
      `}</style>

      {/* ── Left: heart icon + BPM ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '0 12px',
        borderRight: '1px solid rgba(212,212,232,0.08)',
        height: '100%',
      }}>
        {/* Pulsing heart */}
        <svg width={10} height={10} viewBox="0 0 24 24" fill="#f87171"
          style={{ animation:`ecg-heart ${60/bpm}s ease-in-out infinite`, flexShrink:0 }}>
          <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z"/>
        </svg>
        {/* BPM label */}
        <span key={bpm} className="ecg-bpm-val" style={{
          color: '#f87171',
          fontSize: 9,
          fontFamily: 'Helvetica Neue, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>
          {bpm} <span style={{ opacity: 0.55, fontWeight: 400, letterSpacing: '0.14em' }}>BPM</span>
        </span>
      </div>

      {/* ── Right: scrolling ECG waveform ── */}
      <div style={{ flex: 1, overflow: 'hidden', height: '100%', position: 'relative' }}>
        {/* Fade edges */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 6%, transparent 92%, rgba(0,0,0,0.7) 100%)',
        }} />

        <div style={{
          display: 'flex', alignItems: 'center', height: '100%',
          animation: `ecg-scroll ${duration}s linear infinite`,
          willChange: 'transform',
        }}>
          <svg
            width={TOTAL_W}
            height={30}
            viewBox={`0 0 ${TOTAL_W} 30`}
            style={{ display: 'block', flexShrink: 0 }}
          >
            <defs>
              <filter id="ecg-glow" x="-10%" y="-80%" width="120%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Baseline grid line */}
            <line x1={0} y1={15} x2={TOTAL_W} y2={15}
              stroke="rgba(212,212,232,0.04)" strokeWidth="0.5"/>

            {/* ECG glow (blurred, wider) */}
            <path d={PATH}
              fill="none"
              stroke="rgba(180,188,204,0.25)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ECG main line */}
            <path d={PATH}
              fill="none"
              stroke="rgba(212,212,232,0.82)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ecg-glow)"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
