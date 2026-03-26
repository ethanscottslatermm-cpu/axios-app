import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { useWaterLog } from '../hooks/useWaterLog'
import { useWeightLog } from '../hooks/useWeightLog'
import { usePrayers } from '../hooks/usePrayers'

// ─── Date helpers ──────────────────────────────────────────────────────────────
const today      = new Date()
const todayStr   = today.toISOString().split('T')[0]
const dayName    = today.toLocaleDateString('en-US', { weekday: 'long' })
const dateStr    = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

// ─── Constants ─────────────────────────────────────────────────────────────────
const CALORIE_GOAL = 2200
const WATER_GOAL   = 8

const modules = [
  { key: 'food',       label: 'Food Journal',    path: '/food',       icon: FoodIcon },
  { key: 'water',      label: 'Water',            path: '/water',      icon: WaterIcon },
  { key: 'weight',     label: 'Weight',           path: '/weight',     icon: WeightIcon },
  { key: 'prayer',     label: 'Prayer',           path: '/prayer',     icon: PrayerIcon },
  { key: 'devotional', label: 'Devotional',       path: '/devotional', icon: BookIcon },
  { key: 'fitness',    label: 'Fitness',          path: '/fitness',    icon: FitnessIcon },
]

// ─── Greeting logic ────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
function FoodIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  )
}
function WaterIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  )
}
function WeightIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>
    </svg>
  )
}
function PrayerIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  )
}
function BookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function FitnessIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h18M3 14.5h18"/>
    </svg>
  )
}
function SettingsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function ChevronRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

// ─── Glow Progress Bar ─────────────────────────────────────────────────────────
function GlowBar({ pct, height = 3 }) {
  return (
    <div style={{
      width: '100%', height, borderRadius: 99,
      background: 'rgba(255,255,255,0.07)',
      overflow: 'hidden', position: 'relative'
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'white',
        borderRadius: 99,
        transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '0 0 8px rgba(255,255,255,0.6)',
      }} />
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, pct, animate, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '16px 18px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 60, height: 60,
        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Helvetica Neue, sans-serif' }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 4, fontFamily: 'Helvetica Neue, sans-serif' }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginBottom: pct != null ? 10 : 0, fontFamily: 'Helvetica Neue, sans-serif' }}>{sub}</p>
      {pct != null && <GlowBar pct={pct} />}
    </div>
  )
}

// ─── Module Pill ───────────────────────────────────────────────────────────────
function ModulePill({ label, path, done, Icon, delay = 0, navigate }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <button
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        background: hovered
          ? 'rgba(255,255,255,0.06)'
          : done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${done ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hovered ? '0 0 16px rgba(255,255,255,0.04)' : 'none',
        textAlign: 'left', width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: done ? '#fff' : 'rgba(255,255,255,0.18)',
          boxShadow: done ? '0 0 6px rgba(255,255,255,0.7)' : 'none',
          flexShrink: 0,
        }} />
        <div style={{ color: done ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)' }}>
          <Icon size={15} />
        </div>
        <div>
          <p style={{ color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 1 }}>{label}</p>
          <p style={{ color: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.18)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }}>{done ? 'Logged' : 'Pending'}</p>
        </div>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.2)' }}>
        <ChevronRight />
      </div>
    </button>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* illuminated edge line */}
        <div style={{ width: 2, height: 16, background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.1))', borderRadius: 2, boxShadow: '0 0 6px rgba(255,255,255,0.5)' }} />
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'Helvetica Neue, sans-serif', textTransform: 'uppercase', fontSize: 11 }}>{title}</p>
      </div>
      {action && (
        <button onClick={action} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '20px',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const { totals, logs: foodLogs } = useFoodLog(todayStr)
  const { count: waterCount }      = useWaterLog(todayStr)
  const { latest, goal: weightGoal } = useWeightLog()
  const { prayers }                = usePrayers()

  // derive name from email or Supabase profile (replace with real useProfile hook if available)
  const displayName = 'Ethan'

  const todayPrayers  = prayers.filter(p => p.date === todayStr).length
  const answeredCount = prayers.filter(p => p.answered).length
  const calories      = totals?.calories || 0
  const calRemaining  = Math.max(0, CALORIE_GOAL - calories)
  const calPct        = Math.min(100, Math.round((calories / CALORIE_GOAL) * 100))
  const waterPct      = Math.min(100, Math.round((waterCount / WATER_GOAL) * 100))

  const loggedModules = {
    food:       calories > 0,
    water:      waterCount > 0,
    weight:     !!latest,
    prayer:     todayPrayers > 0,
    devotional: false,
    fitness:    false,
  }
  const loggedCount = Object.values(loggedModules).filter(Boolean).length
  const recentFood  = (foodLogs || []).slice(-3).reverse()

  const greeting = getGreeting()

  return (
    <>
      {/* Global styles injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.08); }
          50%       { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
        }
        .axios-dash-btn-primary:hover {
          background: rgba(255,255,255,0.9) !important;
          box-shadow: 0 0 20px rgba(255,255,255,0.25) !important;
        }
        .axios-settings-btn:hover {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        .axios-log-row:hover { background: rgba(255,255,255,0.03); }
        .axios-water-dot-filled { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        background: '#080808',
        WebkitFontSmoothing: 'antialiased',
      }}>

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'fadeSlideDown 0.5s ease both',
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          {/* Greeting */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Helvetica Neue, sans-serif' }}>
              {dayName} · {dateStr}
            </p>
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(18px, 4vw, 22px)', letterSpacing: '-0.01em', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1 }}>
              {greeting},{' '}
              <span style={{ fontStyle: 'italic', fontFamily: "'EB Garamond', serif", fontWeight: 400, fontSize: 'clamp(20px, 4.5vw, 24px)' }}>
                {displayName}.
              </span>
            </h1>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/settings')}
              className="axios-settings-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              title="Settings"
            >
              <SettingsIcon size={16} />
            </button>
            <button
              onClick={() => navigate('/food')}
              className="axios-dash-btn-primary"
              style={{
                background: '#fff', color: '#080808',
                fontSize: 11, fontWeight: 800,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '9px 16px', borderRadius: 8, border: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'background 0.2s, box-shadow 0.2s',
                fontFamily: 'Helvetica Neue, sans-serif',
              }}
            >
              + Log entry
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ──────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          padding: '20px 16px 40px',
          maxWidth: 680,
          width: '100%',
          margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>

          {/* ── Stat Cards ────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <StatCard
              label="Calories"
              value={calories.toLocaleString()}
              sub={`of ${CALORIE_GOAL.toLocaleString()} goal`}
              pct={calPct}
              delay={80}
            />
            <StatCard
              label="Water"
              value={`${waterCount} / ${WATER_GOAL}`}
              sub="glasses today"
              pct={waterPct}
              delay={140}
            />
            <StatCard
              label="Weight"
              value={latest ? `${latest} lb` : '—'}
              sub={latest && weightGoal ? `${Math.max(0, latest - weightGoal).toFixed(1)} lb from goal` : 'not logged'}
              delay={200}
            />
            <StatCard
              label="Today"
              value={`${loggedCount} / 6`}
              sub="modules logged"
              pct={Math.round((loggedCount / 6) * 100)}
              delay={260}
            />
          </div>

          {/* ── Module Status ─────────────────────────────────────────────── */}
          <Card>
            <SectionHeader title="Today's Modules" actionLabel={`${loggedCount} of 6`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modules.map(({ key, label, path, icon: Icon }, i) => (
                <ModulePill
                  key={key}
                  label={label}
                  path={path}
                  done={loggedModules[key]}
                  Icon={Icon}
                  delay={300 + i * 55}
                  navigate={navigate}
                />
              ))}
            </div>
          </Card>

          {/* ── Food Log ──────────────────────────────────────────────────── */}
          <Card>
            <SectionHeader title="Recent Food Log" action={() => navigate('/food')} actionLabel="View all →" />
            {recentFood.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontStyle: 'italic', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center', padding: '16px 0' }}>
                Nothing logged yet today.
              </p>
            ) : (
              <div>
                {recentFood.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="axios-log-row"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 6px',
                      borderBottom: i < recentFood.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      borderRadius: 6,
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>{entry.food_name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>{entry.calories} cal</span>
                  </div>
                ))}
              </div>
            )}
            {/* Calorie bar */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Helvetica Neue, sans-serif' }}>Remaining</p>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'Helvetica Neue, sans-serif' }}>{calRemaining.toLocaleString()} cal</p>
              </div>
              <div style={{ flex: 1 }}>
                <GlowBar pct={calPct} height={4} />
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, textAlign: 'right', marginTop: 5, fontFamily: 'Helvetica Neue, sans-serif' }}>{calPct}%</p>
              </div>
            </div>
          </Card>

          {/* ── Water Tracker ─────────────────────────────────────────────── */}
          <Card>
            <SectionHeader title="Water Intake" action={() => navigate('/water')} actionLabel="Open →" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              {Array.from({ length: WATER_GOAL }).map((_, i) => (
                <div
                  key={i}
                  className={i < waterCount ? 'axios-water-dot-filled' : ''}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i < waterCount ? '#fff' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${i < waterCount ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'background 0.3s, border-color 0.3s',
                  }}
                />
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>
              {waterCount >= WATER_GOAL
                ? 'Goal reached — well done.'
                : `${WATER_GOAL - waterCount} glass${WATER_GOAL - waterCount !== 1 ? 'es' : ''} remaining`}
            </p>
            <GlowBar pct={waterPct} height={3} />
          </Card>

          {/* ── Prayer ────────────────────────────────────────────────────── */}
          <Card>
            <SectionHeader title="Prayer" action={() => navigate('/prayer')} actionLabel="Open →" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Today', value: todayPrayers, sub: 'logged' },
                { label: 'Answered', value: answeredCount, sub: 'total' },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Helvetica Neue, sans-serif' }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: 26, fontWeight: 900, fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1, marginBottom: 4 }}>{value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif' }}>{sub}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/prayer')}
              style={{
                width: '100%', padding: '11px', borderRadius: 8,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)',
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 700,
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
            >
              + Log a prayer
            </button>
          </Card>

        </div>
      </div>
    </>
  )
}
