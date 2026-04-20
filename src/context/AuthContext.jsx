import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const INACTIVITY_MS = 5 * 60 * 1000 // 5 minutes

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked,  setLocked]  = useState(false) // biometric lock
  const timerRef   = useRef(null)
  const resetTimer = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setLocked(true) // lock on every app open if session exists
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])


  // Auto-lock after 3 minutes of inactivity
  useEffect(() => {
    if (!user || locked) return

    const lock = () => setLocked(true)

    const reset = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(lock, INACTIVITY_MS)
    }

    resetTimer.current = reset

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [user, locked])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('status, suspended_until')
      .eq('id', data.user.id)
      .single()

    if (profile?.status === 'inactive' || profile?.status === 'deleted') {
      await supabase.auth.signOut()
      throw new Error('This account has been deactivated. Contact your administrator.')
    }

    if (profile?.status === 'suspended') {
      const until = profile.suspended_until ? new Date(profile.suspended_until) : null
      if (!until || until > new Date()) {
        await supabase.auth.signOut()
        const untilStr = until ? ` until ${until.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.` : '.'
        throw new Error(`This account is suspended${untilStr}`)
      }
    }

    // Record login timestamp + history
    const now    = new Date().toISOString()
    const device = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    await supabase.from('profiles').update({ last_login: now }).eq('id', data.user.id)
    await supabase.from('login_history').insert({ user_id: data.user.id, logged_in_at: now, device })

    // Reset demo user data on every login
    if (data.user.email === 'demo@axioss.app') {
      await fetch('/.netlify/functions/reset-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      }).catch(() => {})
    }

    setLocked(false) // freshly signed in — no lock needed
    return data
  }

  // Heartbeat — keeps last_seen fresh every 5 minutes while the app is open
  useEffect(() => {
    if (!user) return
    const bump = () =>
      supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id)
        .then(({ error }) => { if (error) console.warn('last_seen update failed:', error.message) })
    bump()
    const id = setInterval(bump, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [user?.id])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLocked(false)
  }

  const unlock = () => setLocked(false)

  return (
    <AuthContext.Provider value={{ user, loading, locked, signIn, signOut, unlock }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
