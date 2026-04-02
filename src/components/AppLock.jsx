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

  const handleSignOut = async () => { await signOut() }

  if (showLoader) return <LoadingScreen onComplete={() => { unlock(); setShowLoader(false) }} />
  if (!locked || !user) return children
  if (checking) return <div style={{ minHeight:'100dvh', background:'#060608' }} />

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#060608',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @keyframes axl-orb-drift {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          15%  { opacity:1; }
          50%  { transform:translate(18px,22px) scale(1.08); }
          85%  { opacity:1; }
          100% { opacity:0; transform:translate(-8px,40px) scale(0.95); }
        }
        @keyframes axl-rise {
          0%   { transform:translateY(0) translateX(0) scale(1); opacity:0; }
          10%  { opacity:1; }
          60%  { transform:translateY(-55vh) translateX(15px) scale(1.6); opacity:0.45; }
          100% { transform:translateY(-110vh) translateX(-10px) scale(2.2); opacity:0; }
        }
        @keyframes axl-scan {
          0%   { top:0%; opacity:0; }
          5%   { opacity:1; }
          95%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }
        @keyframes axl-bar {
          0%   { transform:translateX(-200%); }
          100% { transform:translateX(500%); }
        }
        @keyframes axl-pulse {
          0%, 100% { opacity:0.4; transform:scale(1); }
          50%       { opacity:0.9; transform:scale(1.06); }
        }
      `}</style>

      {/* ── Orbs ── */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[
          { w:320, h:320, top:'-12%',  left:'-12%', bg:'rgba(180,180,210,0.18)', dur:'9s',  delay:'0s'  },
          { w:240, h:240, bottom:'3%', right:'-8%', bg:'rgba(140,140,175,0.15)', dur:'11s', delay:'-4s' },
          { w:190, h:190, top:'50%',   left:'58%',  bg:'rgba(200,200,230,0.12)', dur:'13s', delay:'-7s' },
        ].map((o, i) => (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            width:o.w, height:o.h,
            background:`radial-gradient(circle,${o.bg} 0%,transparent 70%)`,
            filter:'blur(38px)',
            top: o.top, left: o.left, bottom: o.bottom, right: o.right,
            animation:`axl-orb-drift ${o.dur} linear infinite`,
            animationDelay: o.delay,
          }}/>
        ))}
      </div>

      {/* ── Smoke ── */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {[
          { w:80,  l:'15%', dur:'7s',  delay:'0s'    },
          { w:60,  l:'45%', dur:'9s',  delay:'-2s'   },
          { w:100, l:'70%', dur:'11s', delay:'-5s'   },
          { w:50,  l:'30%', dur:'8s',  delay:'-3.5s' },
          { w:75,  l:'80%', dur:'10s', delay:'-1s'   },
        ].map((s, i) => (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            width:s.w, height:s.w,
            background:'rgba(200,200,220,0.05)',
            filter:'blur(12px)',
            left:s.l, bottom:'-8%',
            animation:`axl-rise ${s.dur} linear infinite`,
            animationDelay: s.delay,
          }}/>
        ))}
      </div>

      {/* ── Scanline ── */}
      <div style={{
        position:'absolute', width:'100%', height:'1px', top:0,
        background:'linear-gradient(90deg,transparent 0%,rgba(220,220,255,0.1) 30%,rgba(255,255,255,0.2) 50%,rgba(220,220,255,0.1) 70%,transparent 100%)',
        animation:'axl-scan 5s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:2,
        display:'flex', flexDirection:'column',
        alignItems:'center', gap:'2rem',
        width:'100%', maxWidth:320,
        padding:'0 2rem',
      }}>
        {/* Logo */}
        <svg viewBox="0 0 380 70" xmlns="http://www.w3.org/2000/svg"
          style={{ width:240, height:'auto', overflow:'visible' }}>
          <defs>
            <linearGradient id="ax-lock-sg" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#3a3a42"/>
              <stop offset="42%"  stopColor="#8a8a96"/>
              <stop offset="50%"  stopColor="#ffffff"/>
              <stop offset="58%"  stopColor="#8a8a96"/>
              <stop offset="100%" stopColor="#3a3a42"/>
              <animate attributeName="x1" from="-380" to="380" dur="2.8s" repeatCount="indefinite"/>
              <animate attributeName="x2" from="0"    to="760" dur="2.8s" repeatCount="indefinite"/>
            </linearGradient>
          </defs>
          <polygon points="10,62 45,4 80,62"   fill="none" stroke="url(#ax-lock-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
          <polygon points="22,62 45,20 68,62"  fill="none" stroke="url(#ax-lock-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
          <text x="100" y="52" fontFamily="Georgia,'Times New Roman',serif" fontSize="42" fontWeight="700" letterSpacing="5" fill="url(#ax-lock-sg)">AXIOS</text>
          <polygon points="300,62 335,4 370,62"  fill="none" stroke="url(#ax-lock-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
          <polygon points="312,62 335,20 358,62" fill="none" stroke="url(#ax-lock-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
        </svg>

        {/* Shimmer bar */}
        <div style={{ width:100, height:1, background:'rgba(200,200,220,0.08)', borderRadius:1, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:'40%',
            background:'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)',
            animation:'axl-bar 2.4s ease-in-out infinite',
          }}/>
        </div>

        {/* Lock prompt */}
        <div style={{ textAlign:'center' }}>
          {/* Shield icon */}
          <div style={{
            width:56, height:56, borderRadius:'50%',
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.04)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 20px',
            animation: busy ? 'axl-pulse 1.2s ease-in-out infinite' : 'none',
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.55)" strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <p style={{
            color:'rgba(255,255,255,0.28)', fontSize:9,
            letterSpacing:'0.28em', textTransform:'uppercase',
            fontFamily:'"Courier New",monospace', marginBottom:10,
          }}>SESSION LOCKED</p>

          <p style={{
            color:'rgba(255,255,255,0.55)', fontSize:13,
            fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.6,
          }}>
            {busy ? 'Waiting for Face ID…' : hasCred ? 'Use Face ID to unlock.' : 'Sign in again to continue.'}
          </p>

          {error && (
            <p style={{ color:'#f87171', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', marginTop:10 }}>
              {error}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10 }}>
          {hasCred && !busy && (
            <button onClick={triggerFaceId} style={{
              width:'100%', padding:'15px',
              borderRadius:14,
              border:'1px solid rgba(255,255,255,0.12)',
              background:'rgba(255,255,255,0.07)',
              color:'rgba(255,255,255,0.9)',
              fontSize:13, fontWeight:700,
              fontFamily:'Helvetica Neue,sans-serif',
              cursor:'pointer', letterSpacing:'0.04em',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              transition:'background 0.15s',
            }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Use Face ID
            </button>
          )}

          <button onClick={handleSignOut} style={{
            width:'100%', padding:'13px',
            borderRadius:14,
            border:'1px solid rgba(255,255,255,0.07)',
            background:'transparent',
            color:'rgba(255,255,255,0.28)',
            fontSize:11, fontFamily:'"Courier New",monospace',
            cursor:'pointer', letterSpacing:'0.15em',
            textTransform:'uppercase',
            transition:'color 0.15s',
          }}>
            Sign Out
          </button>
        </div>

        <p style={{
          color:'rgba(255,255,255,0.1)', fontSize:8,
          letterSpacing:'0.28em', textTransform:'uppercase',
          fontFamily:'"Courier New",monospace',
        }}>
          AXIOS · I AM WORTHY
        </p>
      </div>
    </div>
  )
}
