import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-white/30 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    )
  }

  return user ? children : <Navigate to="/" replace />
}
