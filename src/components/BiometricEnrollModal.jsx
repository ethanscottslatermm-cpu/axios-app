import { useState } from 'react'
import { register as registerBiometric } from '../hooks/useBiometric'

export default function BiometricEnrollModal({ user, onDismiss }) {
  const [busy,  setBusy]  = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const handleEnable = async () => {
    setBusy(true)
    try {
      await registerBiometric(user)
      showToast('Face ID enabled')
      setTimeout(onDismiss, 1400)
    } catch {
      showToast('Setup failed — enable anytime in Settings', true)
      setTimeout(onDismiss, 2000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }}>
      <style>{`
        @keyframes bm-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        width: '100%',
        maxWidth: 430,
        margin: '0 auto',
        background: 'rgba(10,10,16,0.97)',
        border: '1px solid rgba(212,212,232,0.10)',
        borderRadius: '18px 18px 0 0',
        padding: '32px 28px 52px',
        animation: 'bm-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

        {/* Shield icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <svg width={38} height={38} viewBox="0 0 24 24" fill="none"
            stroke="rgba(212,212,232,0.6)" strokeWidth="1.3"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <p style={{
          color: 'rgba(212,212,232,0.88)', fontSize: 14,
          fontFamily: '"Helvetica Neue",sans-serif', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          textAlign: 'center', marginBottom: 10,
        }}>
          Enable Face ID
        </p>

        <p style={{
          color: 'rgba(212,212,232,0.40)', fontSize: 12,
          fontFamily: '"Helvetica Neue",sans-serif',
          textAlign: 'center', lineHeight: 1.65, marginBottom: 28,
        }}>
          Sign in instantly with just a touch.{'\n'}
          Your biometric data never leaves this device.
        </p>

        {toast && (
          <div style={{
            padding: '8px 14px', borderRadius: 6, marginBottom: 14, textAlign: 'center',
            background: toast.isError ? 'rgba(255,60,60,0.10)' : 'rgba(60,200,100,0.10)',
            border: `1px solid ${toast.isError ? 'rgba(255,80,80,0.18)' : 'rgba(60,200,100,0.18)'}`,
            color: toast.isError ? 'rgba(255,130,130,0.9)' : 'rgba(100,230,140,0.9)',
            fontSize: 11, fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.07em',
          }}>
            {toast.msg}
          </div>
        )}

        <button
          onClick={handleEnable}
          disabled={busy}
          style={{
            width: '100%', padding: '14px', borderRadius: 2, border: 'none',
            background: busy ? 'rgba(212,212,232,0.55)' : 'rgba(212,212,232,0.9)',
            color: '#080808', fontSize: '0.72rem', fontWeight: 800,
            fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.22em',
            textTransform: 'uppercase', cursor: busy ? 'default' : 'pointer',
            marginBottom: 12, transition: 'background 0.2s',
          }}
        >
          {busy ? 'Setting up…' : 'ENABLE'}
        </button>

        <button
          onClick={onDismiss}
          disabled={busy}
          style={{
            width: '100%', padding: '12px', borderRadius: 2, border: 'none',
            background: 'transparent',
            color: 'rgba(212,212,232,0.28)', fontSize: '0.68rem',
            fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.14em',
            cursor: busy ? 'default' : 'pointer',
          }}
        >
          Maybe later
        </button>

      </div>
    </div>
  )
}
