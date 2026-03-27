import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFoodLog } from '../hooks/useFoodLog'
import { useWaterLog } from '../hooks/useWaterLog'
import { useToday } from '../hooks/useToday'
import { supabase } from '../lib/supabase'

const WATER_GOAL = 8

export default function Widget() {
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const todayStr        = useToday()
  const { totals }      = useFoodLog(todayStr)
  const { count: water }= useWaterLog(todayStr)
  const [profile,       setProfile]  = useState(null)
  const [visible,       setVisible]  = useState(false)

  const dayLabel = new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('name, calorie_goal, water_goal').eq('id', user.id).single()
      .then(({ data }) => setProfile(data))
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [user])

  const calorieGoal = profile?.calorie_goal || 2200
  const waterGoal   = profile?.water_goal   || WATER_GOAL
  const caloriePct  = Math.min((totals.calories / calorieGoal) * 100, 100)
  const waterPct    = Math.min((water / waterGoal) * 100, 100)

  const anim = (delay = 0) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-primary); }
      `}</style>

      <div style={{
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        display: 'flex', flexDirection: 'column',
        padding: '48px 24px 32px',
        WebkitFontSmoothing: 'antialiased',
      }}>

        {/* Header */}
        <div style={{ ...anim(0), marginBottom: 36 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>
            {dayLabel}
          </p>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em' }}>
            Today
          </h1>
          {profile?.name && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: "'EB Garamond',serif", fontStyle: 'italic', marginTop: 4 }}>
              {profile.name}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, ...anim(80) }}>

          {/* Calories */}
          <div onClick={() => navigate('/food')} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '20px 20px 16px', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 4 }}>Calories</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 32, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {Math.round(totals.calories).toLocaleString()}
                </p>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>/ {calorieGoal.toLocaleString()}</p>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${caloriePct}%`, background: 'var(--glow-bar)', borderRadius: 99, transition: 'width 0.8s cubic-bezier(.16,1,.3,1)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 8 }}>
              P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
            </p>
          </div>

          {/* Water */}
          <div onClick={() => navigate('/water')} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '20px 20px 16px', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 4 }}>Water</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 32, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {water}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>glasses</span>
                </p>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>/ {waterGoal}</p>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${waterPct}%`, background: 'var(--glow-bar)', borderRadius: 99, transition: 'width 0.8s cubic-bezier(.16,1,.3,1)' }} />
            </div>
            {waterPct >= 100 && (
              <p style={{ color: 'var(--glow-bar)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 8, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Goal reached
              </p>
            )}
          </div>

          {/* Quick nav */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, ...anim(160) }}>
            {[
              { label: 'Fitness',    path: '/fitness'    },
              { label: 'Prayer',     path: '/prayer'     },
              { label: 'Devotional', path: '/devotional' },
              { label: 'Dashboard',  path: '/dashboard'  },
            ].map(({ label, path }) => (
              <div key={path} onClick={() => navigate(path)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '16px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, fontFamily: 'Helvetica Neue,sans-serif' }}>{label}</p>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ color: 'var(--text-faint)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', marginTop: 'auto', paddingTop: 32 }}>
          AXIOS · I AM WORTHY
        </p>
      </div>
    </>
  )
}
