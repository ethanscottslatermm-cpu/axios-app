import { useState, useEffect } from 'react'
import { useHaptic } from '../../hooks/useHaptic'
import { useWaterLog, useWaterHistory } from '../../hooks/useWaterLog'
import LineChart from '../../components/LineChart'

const WATER_GOAL = 8
const WATER_BLUE = '#9ab4cc'

const Ico = {
  plus:  (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  drop:  (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  check: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  trash: (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
}

function GlowBar({ pct, h = 5 }) {
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

function SectionHead({ title, sub, onToggle, collapsed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 2, height: 14, background: `linear-gradient(to bottom,${WATER_BLUE},${WATER_BLUE}22)`, borderRadius: 2, boxShadow: `0 0 6px ${WATER_BLUE}88` }} />
        <p style={{ color: WATER_BLUE, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700 }}>{title}</p>
      </div>
      {onToggle
        ? <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
            {sub}
            <span style={{ display: 'inline-block', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }}>›</span>
          </button>
        : sub && <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{sub}</p>
      }
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 14, padding: '18px 16px', ...style }}>
      {children}
    </div>
  )
}

function GlassButton({ filled, index, onAdd, onRemove, animDelay, visible }) {
  const [pressed, setPressed] = useState(false)

  const handleTap = () => {
    setPressed(true)
    setTimeout(() => setPressed(false), 200)
    if (filled) onRemove(index)
    else onAdd()
  }

  return (
    <button onClick={handleTap} style={{
      width: '100%', aspectRatio: '1', borderRadius: 12,
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
      <svg width={filled ? 22 : 20} height={filled ? 22 : 20} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5 L9 20 C9.2 21.1 10.1 22 11.1 22 L12.9 22 C13.9 22 14.8 21.1 15 20 L18 5 Z" fill={filled ? 'rgba(154,180,204,0.75)' : 'transparent'} stroke="none"/>
        <path d="M5 3 L9 20 C9.2 21.1 10.1 22 11.1 22 L12.9 22 C13.9 22 14.8 21.1 15 20 L19 3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="5" y1="3" x2="19" y2="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M19 8 C21.5 8 21.5 13 19 13" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </button>
  )
}

function CustomOzSheet({ onSave, onClose }) {
  const [oz,      setOz]      = useState('')
  const [visible, setVisible] = useState(false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const handleSave = async () => {
    if (!oz || isNaN(oz) || parseFloat(oz) <= 0) return
    setSaving(true)
    await onSave(parseFloat(oz))
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', background: 'var(--sheet-bg)', borderTop: '1px solid var(--border)', borderRadius: '18px 18px 0 0', padding: '20px 18px max(32px,env(safe-area-inset-bottom))', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ width: 36, height: 4, background: 'rgba(212,212,232,0.13)', borderRadius: 99, margin: '0 auto 22px' }} />
        <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 22, letterSpacing: '-0.01em' }}>Custom Amount</h2>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, background: 'var(--stat-bg)', border: '1px solid rgba(212,212,232,0.12)', borderRadius: 16, padding: '18px 28px' }}>
            <input type="number" value={oz} onChange={e => setOz(e.target.value)} placeholder="16" autoFocus
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 42, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', width: 100, textAlign: 'center' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 16, fontFamily: 'Helvetica Neue,sans-serif' }}>oz</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'rgba(212,212,232,0.4)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !oz}
            style={{ flex: 2, padding: '13px', background: 'rgba(154,180,204,0.15)', color: WATER_BLUE, border: '1px solid rgba(154,180,204,0.4)', borderRadius: 10, fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', cursor: saving || !oz ? 'not-allowed' : 'pointer', opacity: saving || !oz ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 0 14px rgba(154,180,204,0.12)' }}>
            {Ico.check()} Log It
          </button>
        </div>
      </div>
    </div>
  )
}

const quickSizes = [
  { label: '8 oz',  sub: 'Glass',  oz: 8,  icon: (
    <svg viewBox="0 0 28 36" width={22} height={28} fill="none">
      <path d="M5 4 L7 32 H21 L23 4 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="5" y1="4" x2="23" y2="4" stroke={WATER_BLUE} strokeWidth="1.4"/>
    </svg>
  )},
  { label: '12 oz', sub: 'Bottle', oz: 12, icon: (
    <svg viewBox="0 0 28 40" width={20} height={30} fill="none">
      <rect x="10" y="2" width="8" height="6" rx="1.5" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.3"/>
      <path d="M6 10 Q4 14 4 18 L4 34 Q4 38 14 38 Q24 38 24 34 L24 18 Q24 14 22 10 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  )},
  { label: '16 oz', sub: 'Large',  oz: 16, icon: (
    <svg viewBox="0 0 32 40" width={24} height={32} fill="none">
      <path d="M4 4 L6 36 H26 L28 4 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="4" y1="4" x2="28" y2="4" stroke={WATER_BLUE} strokeWidth="1.4"/>
      <line x1="6" y1="20" x2="26" y2="20" stroke={WATER_BLUE} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  )},
  { label: '24 oz', sub: 'Bottle', oz: 24, icon: (
    <svg viewBox="0 0 28 46" width={20} height={34} fill="none">
      <rect x="10" y="2" width="8" height="5" rx="1.5" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.3"/>
      <path d="M6 9 Q4 13 4 18 L4 38 Q4 44 14 44 Q24 44 24 38 L24 18 Q24 13 22 9 Z" fill="rgba(154,180,204,0.18)" stroke={WATER_BLUE} strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="5" y1="26" x2="23" y2="26" stroke={WATER_BLUE} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  )},
]

export default function WaterPanel({ todayStr, visible }) {
  const haptic = useHaptic()
  const { logs, count, addGlass, removeGlass, isLoading: loading } = useWaterLog(todayStr)
  const { history: waterHistory } = useWaterHistory()

  const [showCustom,   setShowCustom]   = useState(false)
  const [trendOpen,    setTrendOpen]    = useState(false)
  const [pastDaysOpen, setPastDaysOpen] = useState(false)
  const [logOpen,      setLogOpen]      = useState(false)

  const pct       = Math.min(100, Math.round((count / WATER_GOAL) * 100))
  const remaining = Math.max(0, WATER_GOAL - count)
  const goalMet   = count >= WATER_GOAL

  const handleAddGlass = async (oz = 8) => {
    haptic.tap()
    await addGlass.mutateAsync(oz)
  }

  const anim = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <>
      <style>{`
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        .ax-quick:hover{background:rgba(154,180,204,0.12)!important;border-color:rgba(154,180,204,0.38)!important;box-shadow:0 0 12px rgba(154,180,204,0.12)!important;}
        .ax-custom:hover{border-color:rgba(154,180,204,0.38)!important;color:rgba(154,180,204,0.75)!important;}
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Glass grid — 4×2 */}
        <Card style={anim(80)}>
          <SectionHead title="Tap to Log" sub={`${count} of ${WATER_GOAL}`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <GlassButton
                key={i}
                index={i}
                filled={i < count}
                onAdd={handleAddGlass}
                onRemove={(idx) => removeGlass.mutate(logs[idx]?.id)}
                animDelay={i * 50}
                visible={visible}
              />
            ))}
          </div>
          <GlowBar pct={pct} />
          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', marginTop: 10 }}>
            Tap a glass to add · tap a filled glass to remove
          </p>
        </Card>

        {/* Quick add sizes */}
        <div style={anim(160)}>
          <SectionHead title="Quick Add" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {quickSizes.map(({ label, sub, oz, icon }) => (
              <button key={oz} onClick={() => handleAddGlass(oz)} className="ax-quick"
                style={{ padding: '16px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid rgba(154,180,204,0.18)', boxShadow: 'var(--card-shadow)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 3 }}>{label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{sub}</p>
                </div>
                <div style={{ opacity: 0.85 }}>{icon}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowCustom(true)} className="ax-custom"
            style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {Ico.plus(13)} Custom amount
          </button>
        </div>

        {/* Today's log */}
        {(logs || []).length > 0 && (
          <Card style={anim(240)}>
            <SectionHead title="Today's Log" sub={`${logs.length} entries`} onToggle={() => setLogOpen(o => !o)} collapsed={!logOpen} />
            {logOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...(logs || [])].reverse().map((log, i) => {
                  const time = log.logged_at
                    ? new Date(log.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    : log.created_at
                    ? new Date(log.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                    : ''
                  return (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `2px solid rgba(154,180,204,0.4)`, boxShadow: 'var(--card-shadow)', borderRadius: 10, opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-8px)', transition: `opacity 0.4s ease ${i * 35}ms, transform 0.4s ease ${i * 35}ms` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ color: WATER_BLUE }}>{Ico.drop(14)}</div>
                        <div>
                          <p style={{ color: 'rgba(212,212,232,0.7)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif' }}>1 glass</p>
                          {time && <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{time}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => { haptic.delete?.(); removeGlass.mutate(log.id) }}
                        style={{ background: 'var(--stat-bg)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,60,60,0.25)'; e.currentTarget.style.color = 'rgba(255,100,100,0.8)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,212,232,0.04)'; e.currentTarget.style.borderColor = 'rgba(212,212,232,0.08)'; e.currentTarget.style.color = 'rgba(212,212,232,0.25)' }}>
                        {Ico.trash()}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )}

        {/* Empty state */}
        {!loading && (logs || []).length === 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px dashed rgba(212,212,232,0.08)', borderRadius: 14, padding: '40px 20px', textAlign: 'center', ...anim(240) }}>
            <div style={{ color: 'rgba(212,212,232,0.15)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{Ico.drop(32)}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: "'EB Garamond',serif", fontStyle: 'italic', lineHeight: 1.7, marginBottom: 16 }}>
              No water logged yet today.<br />Start with your first glass.
            </p>
            <button onClick={handleAddGlass}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 9, background: 'rgba(212,212,232,0.07)', border: '1px solid rgba(212,212,232,0.12)', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>
              {Ico.plus(12)} Log first glass
            </button>
          </div>
        )}

        {/* 14-Day Trend */}
        {waterHistory.length >= 2 && (
          <Card style={anim(300)}>
            <SectionHead title="14-Day Trend" sub="glasses / day" onToggle={() => setTrendOpen(o => !o)} collapsed={!trendOpen} />
            {trendOpen && (
              <LineChart
                data={[...waterHistory].reverse().slice(-14).map(d => ({
                  label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
                  value: d.glasses,
                }))}
                height={90}
              />
            )}
          </Card>
        )}

        {/* Past Days */}
        {waterHistory.length > 0 && (
          <Card style={anim(340)}>
            <SectionHead title="Past Days" sub={`${waterHistory.length} days`} onToggle={() => setPastDaysOpen(o => !o)} collapsed={!pastDaysOpen} />
            {pastDaysOpen && (
              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                {waterHistory.map(day => (
                  <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 10 }}>
                    <div>
                      <p style={{ color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600, marginBottom: 2 }}>
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{day.glasses} glasses</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 700 }}>{day.oz} oz</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

      </div>

      {showCustom && <CustomOzSheet onSave={handleAddGlass} onClose={() => setShowCustom(false)} />}
    </>
  )
}
