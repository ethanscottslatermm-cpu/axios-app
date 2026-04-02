import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

export default function Login2() {
  const { signIn, user: authUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [showLoader, setShowLoader]               = useState(false)
  const [offerFaceId, setOfferFaceId]             = useState(false)
  const [registeringFaceId, setRegisteringFaceId] = useState(false)

  useEffect(() => {
    document.body.style.setProperty('background', '#000000', 'important')
    return () => document.body.style.removeProperty('background')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await signIn(email, password)
      if (webAuthnSupported() && data?.user) {
        const already = await hasRegisteredDevice(data.user.id)
        if (!already) { setOfferFaceId(true); setLoading(false); return }
      }
      setShowLoader(true)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleRegisterFaceId = async () => {
    setRegisteringFaceId(true)
    try {
      if (authUser) await registerBiometric(authUser)
    } catch (e) { console.error('FaceID:', e.message) }
    finally { setRegisteringFaceId(false); navigate('/dashboard') }
  }

  if (showLoader) return <LoadingScreen onComplete={() => navigate('/dashboard')} />

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em' }}>
        CANVAS CLEAR
      </p>
    </div>
  )
}
