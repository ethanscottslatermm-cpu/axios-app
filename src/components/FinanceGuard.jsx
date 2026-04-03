import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  webAuthnSupported,
  registerBiometric,
  verifyBiometric,
  hasRegisteredDevice,
} from '../hooks/useWebAuthn'

const LOCK_AFTER_MS  = 30 * 1000
const STORAGE_KEY    = 'finance-unlocked-at'
export const FINANCE_LOCK_KEY = 'axios-finance-lock' // shared with Settings

export default function FinanceGuard({ children }) {
  const { user } = useAuth()
  const [phase, setPhase] = useState('checking') // checking | register | verify | unlocked
  const [error, setError] = useState('')
  const [busy,  setBusy]  = useState(false)

  const doVerify = useCallback(async () => {
    setBusy(true); setError('')
    try {
      await verifyBiometric(user.id)
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
      setPhase('unlocked')
    } catch {
      setError('Face ID failed or was cancelled.')
      setPhase('verify')
    } finally {
      setBusy(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      // Finance lock disabled — skip all checks
      if (localStorage.getItem(FINANCE_LOCK_KEY) !== 'true') {
        setPhase('unlocked')
        return
      }

      // Check if still within the 30-second grace window
      const unlockedAt = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10)
      if (unlockedAt && Date.now() - unlockedAt < LOCK_AFTER_MS) {
        setPhase('unlocked')
        return
      }

      // No WebAuthn support — allow through without biometric
      if (!webAuthnSupported()) {
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
        setPhase('unlocked')
        return
      }

      const registered = await hasRegisteredDevice(user.id)
      if (!registered) {
        setPhase('register')
        return
      }

      setPhase('verify')
      setBusy(true)
      try {
        await verifyBiometric(user.id)
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
        setPhase('unlocked')
      } catch {
        setError('Face ID failed or was cancelled.')
        setPhase('verify')
      } finally {
        setBusy(false)
      }
    })()

    // On unmount — record when user left so re-entry check works
    return () => {
      const unlockedAt = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10)
      if (unlockedAt) {
        sessionStorage.setItem(STORAGE_KEY, String(unlockedAt)) // keep timestamp; re-entry will check elapsed
      }
    }
  }, [user, doVerify])

  const handleRegister = async () => {
    setBusy(true); setError('')
    try {
      await registerBiometric(user)
      await doVerify()
    } catch (e) {
      setError(e.message || 'Registration failed.')
      setPhase('register')
    } finally {
      setBusy(false)
    }
  }

  if (!user)               return null
  if (phase === 'unlocked') return children
  if (phase === 'checking') return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }} />
  )

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
        boxShadow: 'var(--card-shadow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--glow-bar)' }}>
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
          <path d="M22 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 8 }}>
        Finance
      </p>
      <h1 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>
        {phase === 'register' ? 'Register This Device' : 'Verify Identity'}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', maxWidth: 260, lineHeight: 1.55, marginBottom: 10 }}>
        {phase === 'register'
          ? 'Set up Face ID to secure your financial data.'
          : busy ? 'Waiting for Face ID…' : 'Use Face ID to access Finance.'}
      </p>
      <p style={{ color: 'var(--text-faint)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 28 }}>
        Re-locks after 30s away
      </p>

      {error && (
        <p style={{ color: '#c4a0a0', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', marginBottom: 20 }}>
          {error}
        </p>
      )}

      {phase === 'register' && (
        <button onClick={handleRegister} disabled={busy} style={{
          width: '100%', maxWidth: 280, padding: '15px',
          borderRadius: 14, border: '1px solid var(--border)',
          background: busy ? 'rgba(255,255,255,0.06)' : 'var(--btn-bg)',
          color: busy ? 'var(--text-muted)' : 'var(--btn-text)',
          fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif',
          cursor: busy ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--card-shadow)',
        }}>
          {busy ? 'Setting up…' : 'Register Face ID'}
        </button>
      )}

      {phase === 'verify' && !busy && (
        <button onClick={doVerify} style={{
          width: '100%', maxWidth: 280, padding: '15px',
          borderRadius: 14, border: '1px solid var(--border)',
          background: 'var(--btn-bg)', color: 'var(--btn-text)',
          fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif',
          cursor: 'pointer', boxShadow: 'var(--card-shadow)',
        }}>
          Use Face ID
        </button>
      )}
    </div>
  )
}
