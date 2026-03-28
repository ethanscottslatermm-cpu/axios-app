import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const INACTIVITY_MS = 3 * 60 * 1000 // 3 minutes

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true) // ← key fix for refresh crash
  const timerRef = useRef(null)

  const resetTimer = useRef(null)

  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign out when app is swiped away / closed
  useEffect(() => {
    const handleClose = () => {
      if (user) supabase.auth.signOut()
    }
    window.addEventListener('pagehide', handleClose)
    return () => window.removeEventListener('pagehide', handleClose)
  }, [user])

  // Auto-logout after 3 minutes of inactivity
  useEffect(() => {
    if (!user) return

    const logout = () => supabase.auth.signOut().then(() => setUser(null))

    const reset = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, INACTIVITY_MS)
    }

    resetTimer.current = reset

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset() // start the timer

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [user])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Check account status before allowing in
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

    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
