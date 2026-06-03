import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Runs once on Login mount. Determines which UI to render before showing anything.
 * Returns { userType: 'session' | 'biometric' | 'password', loading: boolean }
 *
 * Order:
 *  1. Active Supabase session → 'session'  (navigate to /dashboard immediately)
 *  2. All three localStorage keys present  → 'biometric'
 *  3. Fallback                             → 'password'
 */
export function useAuthGate() {
  const [state, setState] = useState({ userType: null, loading: true })

  useEffect(() => {
    let cancelled = false

    const resolve = async () => {
      // 1. Active session
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) {
        setState({ userType: 'session', loading: false })
        return
      }

      // 2. Biometric keys — all three must be present and non-empty
      const enabled = localStorage.getItem('axios_biometric_enabled') === 'true'
      const credId  = localStorage.getItem('axios_credential_id')
      const token   = localStorage.getItem('axios_refresh_token')
      if (cancelled) return
      if (enabled && credId && token) {
        setState({ userType: 'biometric', loading: false })
        return
      }

      // 3. Password fallback
      setState({ userType: 'password', loading: false })
    }

    resolve()
    return () => { cancelled = true }
  }, [])

  return state
}
