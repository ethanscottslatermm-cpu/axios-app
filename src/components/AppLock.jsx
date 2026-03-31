import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { webAuthnSupported, verifyBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import LoadingScreen from './LoadingScreen'

export default function AppLock({ children }) {
  const { user, locked, unlock, signOut } = useAuth()
  const [hasCred,    setHasCred]    = useState(false)
  const [checking,   setChecking]   = useState(true)
  const [busy,       setBusy]       = useState(false)
  const [error,      setError]      = useState('')
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    if (!user || !locked) { setChecking(false); return }
    hasRegisteredDevice(user.id).then(has => {
      setHasCred(has)
      setChecking(false)
      if (has) triggerFaceId()
    })
  }, [user, locked])

  const triggerFaceId = async () => {
    if (!webAuthnSupported()) return
    setBusy(true); setError('')
    try {
      await verifyBiometric(user.id)
      setShowLoader(true)
    } catch {
      setError('Face ID failed or was cancelled.')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Show loader after successful biometric — then unlock into the app
  if (showLoader) return <LoadingScreen onComplete={unlock} />

  // Not locked — render app normally
  if (!locked || !user) return children

  if (checking) return (
    <div style={{ minHeight:'100dvh', background:'#000' }} />
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Shield icon */}
      <div style={{
        width: 76, height: 76, borderRadius: '50%',
        border: '1.5px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        boxShadow: '0 0 40px rgba(255,255,255,0.04)',
      }}>
        <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--glow-bar)' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <p style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>
        AXIOS
      </p>
      <h1 style={{ color:'var(--text-primary)', fontSize:22, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em', marginBottom:10, textAlign:'center' }}>
        App Locked
      </h1>
      <p style={{ color:'var(--text-muted)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', maxWidth:240, lineHeight:1.55, marginBottom:36 }}>
        {busy ? 'Waiting for Face ID…' : hasCred ? 'Use Face ID to unlock.' : 'Sign in again to continue.'}
      </p>

      {error && (
        <p style={{ color:'#f87171', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', marginBottom:20 }}>
          {error}
        </p>
      )}

      {hasCred && !busy && (
        <button onClick={triggerFaceId} style={{
          width:'100%', maxWidth:280, padding:'15px',
          borderRadius:14, border:'none',
          background:'var(--btn-bg)', color:'var(--btn-text)',
          fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif',
          cursor:'pointer', marginBottom:14,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Use Face ID
        </button>
      )}

      <button onClick={handleSignOut} style={{
        width:'100%', maxWidth:280, padding:'13px',
        borderRadius:14, border:'1px solid var(--border)',
        background:'transparent', color:'var(--text-muted)',
        fontSize:12, fontFamily:'Helvetica Neue,sans-serif',
        cursor:'pointer', letterSpacing:'0.08em',
      }}>
        Sign Out
      </button>

      <p style={{ color:'var(--text-faint)', fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginTop:40 }}>
        AXIOS · I AM WORTHY
      </p>
    </div>
  )
}
