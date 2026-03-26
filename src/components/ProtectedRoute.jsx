import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Redirects to login if the user is not authenticated.
 * Shows a blank screen while Supabase is restoring the session
 * (this is what causes the crash on hard refresh — the session
 * isn't loaded yet, so it incorrectly redirects to login).
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Wait for Supabase to restore session before making a decision
  if (loading) {
    return <div style={{ minHeight:'100vh', background:'#080808' }} />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
