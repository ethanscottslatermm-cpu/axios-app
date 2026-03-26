import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Wraps protected routes and redirects to /onboarding
 * if the user has never completed the setup questionnaire.
 * Shows nothing while checking (avoids flash).
 */
export default function OnboardingRoute({ children }) {
  const { user } = useAuth()
  const [status, setStatus] = useState('checking') // 'checking' | 'done' | 'needed'

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data?.onboarded) {
          setStatus('needed')
        } else {
          setStatus('done')
        }
      })
  }, [user])

  if (status === 'checking') {
    // Blank black screen while we check — no flash
    return <div style={{ minHeight:'100vh', background:'#080808' }} />
  }

  if (status === 'needed') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
