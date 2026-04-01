import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import MaintenanceScreen from './MaintenanceScreen'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [appOffline,    setAppOffline]    = useState(false)
  const [settingLoaded, setSettingLoaded] = useState(false)
  const [userRole,      setUserRole]      = useState(null)

  useEffect(() => {
    if (!user) { setSettingLoaded(true); return }

    const checkStatus = async () => {
      const [settingRes, profileRes] = await Promise.all([
        supabase.from('app_settings').select('value').eq('key', 'app_offline').single(),
        supabase.from('profiles').select('role').eq('id', user.id).single(),
      ])
      setAppOffline(settingRes.data?.value === 'true')
      setUserRole(profileRes.data?.role || 'user')
      setSettingLoaded(true)
    }

    checkStatus()
  }, [user])

  if (loading || !settingLoaded) {
    return <div style={{ minHeight:'100vh', background:'#080808' }} />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (appOffline && userRole !== 'admin') {
    return <MaintenanceScreen />
  }

  return children
}
