import { useState, useEffect } from 'react'
import { useHaptic } from '../../hooks/useHaptic'

const WATER_GOAL = 8
const WATER_BLUE = '#9ab4cc'

function GlassButtonLarge({ filled, index, onAdd, onRemove, animDelay, visible }) {
  const [pressed, setPressed] = useState(false)

  const handleTap = () => {
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    if (filled) onRemove(index)
    else onAdd()
  }

  return (
    <button onClick={handleTap} style={{
      width: '100%', aspectRatio: '1', borderRadius: 14,
      border: `1px solid ${filled ? 'rgba(154,180,204,0.5)' : 'rgba(212,212,232,0.09)'}`,
      background: filled ? 'rgba(154,180,204,0.22)' : 'rgba(212,212,232,0.04)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.25s, border-color 0.25s, transform 0.15s, box-shadow 0.25s',
      transform: pressed ? 'scale(0.92)' : visible ? 'scale(1)' : 'scale(0.85)',
      opacity: visible ? 1 : 0,
      boxShadow: filled ? '0 0 14px rgba(154,180,204,0.3)' : 'none',
      transitionDelay: `${animDelay}ms`,
      color: filled ? WATER_BLUE : 'rgba(212,212,232,0.2)',
    }}>
      <svg width={filled ? 28 : 24} height={filled ? 28 : 24} viewBox="0 0 441.224 441.224" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M282.847,152.109c-5.216-2.914-8.456-8.426-8.456-14.385s3.24-11.472,8.456-14.385c6.948-3.882,11.265-11.222,11.265-19.155c0-4.444-2.546-8.296-6.252-10.198v-5.3c3.503-0.344,6.25-3.305,6.25-6.897V67.2c0-9.994-6.044-18.827-15.397-22.503c-7.663-3.01-15.659-5.393-23.771-7.083c-5.32-1.104-9.182-5.9-9.182-11.403V14.22c0-7.841-6.415-14.22-14.3-14.22h-21.7c-7.885,0-14.3,6.379-14.3,14.22v11.99c0,5.503-3.857,10.299-9.175,11.404c-8.089,1.684-16.089,4.066-23.776,7.083c-4.559,1.791-8.425,4.862-11.178,8.88c-2.761,4.026-4.221,8.736-4.221,13.623v14.589c0,3.592,2.747,6.553,6.25,6.897v5.302c-3.703,1.902-6.248,5.754-6.248,10.196c0,7.934,4.316,15.274,11.264,19.155c5.216,2.914,8.456,8.425,8.456,14.385s-3.24,11.472-8.455,14.385c-6.948,3.881-11.265,11.22-11.265,19.155v225.94c0,24.272,19.747,44.02,44.02,44.02h58.96c24.273,0,44.021-19.748,44.021-44.02v-225.94C294.112,163.33,289.797,155.99,282.847,152.109z" fill={filled ? 'rgba(154,180,204,0.75)' : 'transparent'} stroke="none" opacity="0.9"/>
        <path d="M282.847,152.109c-5.216-2.914-8.456-8.426-8.456-14.385s3.24-11.472,8.456-14.385c6.948-3.882,11.265-11.222,11.265-19.155c0-4.444-2.546-8.296-6.252-10.198v-5.3c3.503-0.344,6.25-3.305,6.25-6.897V67.2c0-9.994-6.044-18.827-15.397-22.503c-7.663-3.01-15.659-5.393-23.771-7.083c-5.32-1.104-9.182-5.9-9.182-11.403V14.22c0-7.841-6.415-14.22-14.3-14.22h-21.7c-7.885,0-14.3,6.379-14.3,14.22v11.99c0,5.503-3.857,10.299-9.175,11.404c-8.089,1.684-16.089,4.066-23.776,7.083c-4.559,1.791-8.425,4.862-11.178,8.88c-2.761,4.026-4.221,8.736-4.221,13.623v14.589c0,3.592,2.747,6.553,6.25,6.897v5.302c-3.703,1.902-6.248,5.754-6.248,10.196c0,7.934,4.316,15.274,11.264,19.155c5.216,2.914,8.456,8.425,8.456,14.385s-3.24,11.472-8.455,14.385c-6.948,3.881-11.265,11.22-11.265,19.155v225.94c0,24.272,19.747,44.02,44.02,44.02h58.96c24.273,0,44.021-19.748,44.021-44.02v-225.94C294.112,163.33,289.797,155.99,282.847,152.109z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

function GlowBar({ pct, h = 6 }) {
  const full = pct >= 100
  return (
    <div style={{ width: '100%', height: h, borderRadius: 99, background: 'rgba(212,212,232,0.07)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(100, pct)}%`,
        background: full ? `linear-gradient(to right, ${WATER_BLUE}, #38bdf8)` : `linear-gradient(to right, ${WATER_BLUE}, #38bdf8)`,
        borderRadius: 99,
        transition: 'width 0.9s cubic-bezier(.16,1,.3,1)',
        boxShadow: `0 0 14px rgba(154,180,204,${full ? 0.55 : 0.3})`,
      }} />
    </div>
  )
}

export default function WaterRitualView({ logs, count, addGlass, removeGlass, onClose, customContainers = [], onCustomAdd }) {
  const haptic = useHaptic()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 30)
  }, [])

  const pct = Math.min(100, Math.round((count / WATER_GOAL) * 100))
  const remaining = Math.max(0, WATER_GOAL - count)

  const handleAddGlass = async (oz = 8) => {
    haptic.tap()
    await addGlass.mutateAsync(oz)
  }

  const handleRemoveGlass = (logId) => {
    haptic.delete?.()
    removeGlass.mutate(logId)
  }

  const quickSizes = [
    { label: '8 oz', sub: 'Glass', oz: 8 },
    { label: '12 oz', sub: 'Bottle', oz: 12 },
    { label: '16 oz', sub: 'Large', oz: 16 },
    { label: '24 oz', sub: 'Bottle', oz: 24 },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: '#080808 url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1h2v2H1z\' fill=\'rgba(212,212,232,0.02)\'/%3E%3C/svg%3E")',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      overflow: 'hidden',
      animation: visible ? 'fadeIn 0.4s ease-out' : 'none',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '20px 20px env(safe-area-inset-top) 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ width: 40 }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Today's Progress</p>
          <p style={{ color: 'var(--text-primary)', fontSize: 24, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em' }}>
            {count} of {WATER_GOAL}
          </p>
          <p style={{ color: WATER_BLUE, fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 4 }}>{pct}% complete</p>
        </div>
        <button onClick={onClose}
          style={{
            width: 40, height: 40, borderRadius: 10, background: 'rgba(212,212,232,0.08)', border: '1px solid rgba(212,212,232,0.12)',
            color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 300, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,212,232,0.12)'; e.currentTarget.style.borderColor = 'rgba(212,212,232,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,212,232,0.08)'; e.currentTarget.style.borderColor = 'rgba(212,212,232,0.12)' }}>
          ✕
        </button>
      </div>

      {/* Main content */}
      <div style={{
        width: '100%', maxWidth: 600, padding: '20px', marginTop: 100, marginBottom: 120,
        display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center',
      }}>
        {/* Glass grid — 4×2 enlarged */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <GlassButtonLarge
                key={i}
                index={i}
                filled={i < count}
                onAdd={handleAddGlass}
                onRemove={(idx) => handleRemoveGlass(logs[idx]?.id)}
                animDelay={i * 50}
                visible={visible}
              />
            ))}
          </div>
          <GlowBar pct={pct} h={7} />
        </div>

        {/* Quick Add section */}
        <div style={{ width: '100%' }}>
          <div style={{ color: WATER_BLUE, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700, marginBottom: 12 }}>Quick Add</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: customContainers.length > 0 ? 10 : 0 }}>
            {quickSizes.map(({ label, sub, oz }) => (
              <button key={oz} onClick={() => handleAddGlass(oz)}
                style={{
                  padding: '14px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid rgba(154,180,204,0.18)',
                  boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif' }}>{sub}</p>
              </button>
            ))}
          </div>

          {/* Custom containers */}
          {customContainers.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {customContainers.map(container => (
                <button key={container.id} onClick={() => handleAddGlass(container.amount_oz)}
                  style={{
                    padding: '14px', borderRadius: 12, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
                    boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}>
                  <p style={{ color: '#d4af37', fontSize: 16, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{container.amount_oz} oz</p>
                  <p style={{ color: 'rgba(212,212,232,0.6)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif' }}>{container.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div style={{
        position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center',
        color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif',
      }}>
        Tap a glass to add · tap a filled glass to remove
      </div>
    </div>
  )
}
