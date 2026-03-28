import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  webAuthnSupported,
  registerBiometric,
  verifyBiometric,
  hasRegisteredDevice,
} from '../hooks/useWebAuthn'

export default function AdminGuard({ children }) {
  const { user } = useAuth()
  const [phase,  setPhase]  = useState('checking') // checking | register | verify | approved | denied
  const [error,  setError]  = useState('')
  const [busy,   setBusy]   = useState(false)

  const runVerify = useCallback(async () => {
    setBusy(true); setError('')
    try {
      await verifyBiometric(user.id)
      setPhase('approved')
    } catch {
      setError('Face ID failed or was cancelled. Try again.')
      setPhase('verify')
    } finally {
      setBusy(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      // 1. Check admin role
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role !== 'admin') { setPhase('denied'); return }

      // 2. Check WebAuthn support
      if (!webAuthnSupported()) {
        setError('Biometric auth not supported on this device or browser.')
        setPhase('denied')
        return
      }

      // 3. Check if this device is registered
      const registered = await hasRegisteredDevice(user.id)
      if (!registered) { setPhase('register'); return }

      // 4. Prompt biometric
      setPhase('verify')
      setBusy(true)
      try {
        await verifyBiometric(user.id)
        setPhase('approved')
      } catch {
        setError('Face ID failed or was cancelled. Try again.')
        setPhase('verify')
      } finally {
        setBusy(false)
      }
    })()
  }, [user, runVerify])

  const handleRegister = async () => {
    setBusy(true); setError('')
    try {
      await registerBiometric(user)
      setPhase('verify')
      await runVerify()
    } catch (e) {
      setError(e.message || 'Registration failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!user)                return <Navigate to="/"          replace />
  if (phase === 'denied')   return <Navigate to="/dashboard" replace />
  if (phase === 'approved') return children

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        border: '1.5px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--glow-bar)' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8 }}>
        Admin Access
      </p>
      <h1 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>
        {phase === 'register' ? 'Register This Device' : 'Verify Identity'}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', maxWidth: 260, lineHeight: 1.5, marginBottom: 32 }}>
        {phase === 'register'
          ? 'This device has not been registered. Set up Face ID to enable admin access.'
          : busy ? 'Waiting for Face ID…' : 'Use Face ID to continue.'}
      </p>

      {error && (
        <p style={{ color: '#f87171', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', marginBottom: 20 }}>
          {error}
        </p>
      )}

      {phase === 'register' && (
        <button onClick={handleRegister} disabled={busy} style={{
          width: '100%', maxWidth: 280, padding: '15px',
          borderRadius: 14, border: 'none',
          background: busy ? 'rgba(255,255,255,0.1)' : 'var(--btn-bg)',
          color: busy ? 'var(--text-muted)' : 'var(--btn-text)',
          fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif',
          cursor: busy ? 'not-allowed' : 'pointer',
        }}>
          {busy ? 'Setting up…' : 'Register Face ID'}
        </button>
      )}

      {phase === 'verify' && !busy && (
        <button onClick={runVerify} style={{
          width: '100%', maxWidth: 280, padding: '15px',
          borderRadius: 14, border: 'none',
          background: 'var(--btn-bg)', color: 'var(--btn-text)',
          fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif',
          cursor: 'pointer',
        }}>
          Try Again
        </button>
      )}
    </div>
  )
}
