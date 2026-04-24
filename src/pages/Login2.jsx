import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

const BG = 'data:image/jpeg;base64,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'


const styles = `
  @font-face {
    font-family: 'The Seasons';
    src: url('/the-seasons-regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @keyframes l2-borderGlow {
    0%,100% { box-shadow: none; border-color: transparent; }
    50%     { box-shadow: none; border-color: transparent; }
  }
  @keyframes l2-placeholderPulse {
    0%,100% { opacity: 0.45; text-shadow: 0 0 8px rgba(212,212,232,0.20); }
    50%     { opacity: 1.0;  text-shadow: 0 0 14px rgba(212,212,232,0.60), 0 0 30px rgba(212,212,232,0.20); }
  }
  @keyframes l2-iconPulse {
    0%,100% { filter: drop-shadow(0 0 3px rgba(200,200,220,0.25)); opacity: 0.50; }
    50%     { filter: drop-shadow(0 0 10px rgba(200,200,220,0.80)); opacity: 1.0; }
  }
  @keyframes l2-btnGlow {
    0%,100% { box-shadow: 0 0 12px rgba(200,200,220,0.22), 0 0 28px rgba(200,200,220,0.09); }
    50%     { box-shadow: 0 0 24px rgba(200,200,220,0.50), 0 0 56px rgba(200,200,220,0.20), 0 0 90px rgba(200,200,220,0.07); }
  }
  @keyframes l2-btnShine {
    0%   { background-position: -300% center; }
    60%,100% { background-position: 300% center; }
  }
  .l2-input {
    width: 100%;
    box-sizing: border-box;
    background: transparent;
    border: none;
    border-bottom: 1px solid transparent;
    border-radius: 0;
    color: rgba(212,212,232,0.9);
    padding: 13px 14px;
    font-size: 1rem;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    outline: none;
    -webkit-appearance: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    caret-color: white;
    box-shadow: none;
  }
  .l2-input:focus {
    background: transparent;
    border-bottom: 1px solid rgba(212,212,232,0.55);
    box-shadow: 0 2px 12px rgba(212,212,232,0.18), 0 1px 4px rgba(212,212,232,0.10);
  }
  .l2-input-icon { padding-left: 36px; }
  .l2-input:-webkit-autofill,
  .l2-input:-webkit-autofill:hover,
  .l2-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px rgba(0,0,0,0.88) inset !important;
    -webkit-text-fill-color: rgba(212,212,232,0.9) !important;
    transition: background-color 5000s ease-in-out 0s;
    caret-color: white;
  }
  .l2-input::placeholder {
    color: rgba(212,212,232,1.0);
    font-family: 'The Seasons', serif;
    letter-spacing: 0.18em;
    font-size: 0.82rem;
    animation: l2-placeholderPulse 3s ease-in-out infinite;
    text-transform: uppercase;
  }
  .l2-lock-icon {
    animation: l2-iconPulse 3s ease-in-out infinite;
  }
  .l2-enter-btn {
    width: auto;
    display: block;
    margin: 0 auto;
    background: transparent;
    color: rgba(212,212,232,0.25);
    border: none;
    border-radius: 2px;
    padding: 14px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'The Seasons', serif;
    letter-spacing: 0.22em;
    transition: color 0.4s, text-shadow 0.4s;
    -webkit-appearance: none;
    text-shadow: none;
  }
  .l2-enter-btn.l2-btn-active {
    color: rgba(212,212,232,0.92);
    text-shadow: 0 0 14px rgba(212,212,232,0.5), 0 0 30px rgba(212,212,232,0.2);
    animation: l2-btnGlow 3s ease-in-out infinite, l2-btnShine 4s ease-in-out infinite;
    background-image: linear-gradient(105deg, transparent 35%, rgba(212,212,232,0.07) 50%, transparent 65%);
    background-size: 300% 100%;
  }
  .l2-enter-btn:active { transform: translateY(0); }

  @keyframes l2-orb-drift {
    0%   { opacity:0; transform:translate(0,0) scale(1); }
    15%  { opacity:1; }
    50%  { transform:translate(16px,20px) scale(1.07); }
    85%  { opacity:1; }
    100% { opacity:0; transform:translate(-6px,38px) scale(0.94); }
  }
  @keyframes l2-scan {
    0%   { top:0%; opacity:0; }
    4%   { opacity:1; }
    96%  { opacity:1; }
    100% { top:100%; opacity:0; }
  }
  @keyframes l2-vline {
    0%, 100% { opacity:0; transform:scaleY(0.35); }
    40%, 60%  { opacity:0.7; transform:scaleY(1); }
  }
  @keyframes l2-corner {
    0%, 100% { opacity:0.18; }
    50%       { opacity:0.55; }
  }
  @keyframes secureGlow {
    0%, 100% {
      text-shadow: 0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.25), 0 0 56px rgba(255,255,255,0.08);
      opacity: 0.72;
    }
    50% {
      text-shadow: 0 0 22px rgba(255,255,255,1), 0 0 50px rgba(255,255,255,0.65), 0 0 100px rgba(255,255,255,0.28);
      opacity: 1;
    }
  }
  @keyframes lineBreath {
    0%, 100% { opacity: 0.3; transform: scaleX(0.7); }
    50%       { opacity: 0.9; transform: scaleX(1); }
  }
  @keyframes formReveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .l2-enter-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes l2-logo-bar {
    0%   { background-position: -300% center; transform: translateX(-200%); }
    60%, 100% { transform: translateX(500%); }
  }
  @keyframes starTwinkle {
    0%, 100% { opacity: 0.08; transform: scale(0.7); }
    50%       { opacity: 0.75; transform: scale(1.15); }
  }
  @keyframes starDrift {
    0%   { transform: translateY(0px) scale(1); }
    50%  { transform: translateY(-3px) scale(1.1); }
    100% { transform: translateY(0px) scale(1); }
  }
`

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
  const [open, setOpen]                           = useState(false)

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
    <>
      <style>{styles}</style>
      <div style={{ position: 'fixed', inset: 0, background: '#000' }}>

        {/* ── Background image ── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${BG})`,
          backgroundSize: 'cover',
          backgroundPosition: '38% top',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.08) brightness(0.9) saturate(0.85)',
        }} />

        {/* ── Cinematic gradient frame (top + bottom) ── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: `linear-gradient(to bottom,
            rgba(0,0,0,0.78) 0%,
            rgba(0,0,0,0.22) 18%,
            rgba(0,0,0,0.0)  36%,
            rgba(0,0,0,0.0)  52%,
            rgba(0,0,0,0.50) 68%,
            rgba(0,0,0,0.92) 100%)`,
        }} />

        {/* ── Radial edge vignette ── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 38% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* ── Starfield ── */}
        <div style={{ position:'fixed', inset:0, zIndex:1, overflow:'hidden', pointerEvents:'none' }}>
          {[
            {x:'8%',  y:'6%',  s:1.5, d:'3.1s', dl:'0s'   },
            {x:'18%', y:'3%',  s:1,   d:'4.2s', dl:'-1.2s'},
            {x:'31%', y:'8%',  s:2,   d:'5.0s', dl:'-0.5s'},
            {x:'47%', y:'2%',  s:1.5, d:'3.7s', dl:'-2.1s'},
            {x:'62%', y:'7%',  s:1,   d:'4.8s', dl:'-0.9s'},
            {x:'74%', y:'4%',  s:2,   d:'3.4s', dl:'-1.8s'},
            {x:'85%', y:'9%',  s:1,   d:'5.2s', dl:'-0.3s'},
            {x:'92%', y:'5%',  s:1.5, d:'4.0s', dl:'-2.7s'},
            {x:'5%',  y:'15%', s:1,   d:'3.9s', dl:'-1.5s'},
            {x:'24%', y:'18%', s:1.5, d:'4.5s', dl:'-0.7s'},
            {x:'38%', y:'13%', s:2,   d:'3.2s', dl:'-3.1s'},
            {x:'55%', y:'17%', s:1,   d:'5.5s', dl:'-1.0s'},
            {x:'70%', y:'12%', s:1.5, d:'4.1s', dl:'-2.4s'},
            {x:'82%', y:'19%', s:1,   d:'3.6s', dl:'-0.6s'},
            {x:'95%', y:'14%', s:2,   d:'4.7s', dl:'-1.9s'},
            {x:'12%', y:'25%', s:1,   d:'5.1s', dl:'-0.4s'},
            {x:'44%', y:'22%', s:1.5, d:'3.3s', dl:'-2.0s'},
            {x:'66%', y:'27%', s:1,   d:'4.4s', dl:'-1.3s'},
            {x:'88%', y:'24%', s:2,   d:'3.8s', dl:'-3.5s'},
            {x:'3%',  y:'32%', s:1,   d:'5.3s', dl:'-0.8s'},
            {x:'27%', y:'35%', s:1.5, d:'4.6s', dl:'-2.6s'},
            {x:'51%', y:'30%', s:1,   d:'3.5s', dl:'-1.1s'},
            {x:'78%', y:'33%', s:2,   d:'4.9s', dl:'-0.2s'},
            {x:'91%', y:'38%', s:1,   d:'3.0s', dl:'-1.7s'},
            {x:'16%', y:'42%', s:1.5, d:'5.4s', dl:'-2.3s'},
            {x:'59%', y:'40%', s:1,   d:'4.3s', dl:'-0.5s'},
            {x:'83%', y:'45%', s:2,   d:'3.7s', dl:'-1.4s'},
            {x:'7%',  y:'52%', s:1,   d:'5.0s', dl:'-2.8s'},
            {x:'34%', y:'55%', s:1.5, d:'3.9s', dl:'-0.1s'},
            {x:'72%', y:'50%', s:1,   d:'4.2s', dl:'-1.6s'},
          ].map((st, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: st.x, top: st.y,
              width: st.s, height: st.s,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: `0 0 ${st.s * 2}px ${st.s}px rgba(200,210,255,0.6)`,
              animation: `starTwinkle ${st.d} ease-in-out infinite, starDrift ${parseFloat(st.d) * 1.4 + 's'} ease-in-out infinite`,
              animationDelay: st.dl,
            }}/>
          ))}
        </div>

        {/* ── Horizontal edge vignette (sides) ── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(0,0,0,0.32) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.32) 100%)',
        }} />

        {/* Floating orbs */}
        <div style={{ position:'fixed', inset:0, zIndex:2, overflow:'hidden', pointerEvents:'none' }}>
          {[
            { w:280, h:280, top:'-10%', left:'-10%', bg:'rgba(180,180,210,0.14)', dur:'9s',  delay:'0s'   },
            { w:200, h:200, bottom:'5%', right:'-6%', bg:'rgba(140,140,175,0.12)', dur:'11s', delay:'-4s'  },
            { w:160, h:160, top:'45%',  left:'55%',  bg:'rgba(200,200,230,0.09)', dur:'13s', delay:'-7s'  },
          ].map((o, i) => (
            <div key={i} style={{
              position:'absolute', borderRadius:'50%',
              width:o.w, height:o.h,
              background:`radial-gradient(circle,${o.bg} 0%,transparent 70%)`,
              filter:'blur(40px)',
              top:o.top, left:o.left, bottom:o.bottom, right:o.right,
              animation:`l2-orb-drift ${o.dur} linear infinite`,
              animationDelay:o.delay,
            }}/>
          ))}
        </div>

        {/* Scanline traveling down */}
        <div style={{
          position:'fixed', width:'100%', height:'1px', top:0, zIndex:3,
          background:'linear-gradient(90deg,transparent 0%,rgba(220,220,255,0.07) 30%,rgba(212,212,232,0.14) 50%,rgba(220,220,255,0.07) 70%,transparent 100%)',
          animation:'l2-scan 8s ease-in-out infinite',
          pointerEvents:'none',
        }}/>

        {/* ── AXIOS logo — anchored in top dark zone ── */}
        <div style={{
          position: 'absolute', zIndex: 10,
          top: '7%', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 380 70" xmlns="http://www.w3.org/2000/svg"
            style={{ width: 230, height: 'auto', overflow: 'visible', filter: 'drop-shadow(0 2px 18px rgba(0,0,0,0.7))' }}>
            <defs>
              <linearGradient id="ax-login-sg" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#3a3a42"/>
                <stop offset="42%"  stopColor="#8a8a96"/>
                <stop offset="50%"  stopColor="#ffffff"/>
                <stop offset="58%"  stopColor="#8a8a96"/>
                <stop offset="100%" stopColor="#3a3a42"/>
                <animate attributeName="x1" from="-380" to="380" dur="2.8s" repeatCount="indefinite"/>
                <animate attributeName="x2" from="0"    to="760" dur="2.8s" repeatCount="indefinite"/>
              </linearGradient>
            </defs>
            <polygon points="10,62 45,4 80,62"   fill="none" stroke="url(#ax-login-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
            <polygon points="22,62 45,20 68,62"  fill="none" stroke="url(#ax-login-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
            <text x="100" y="52" fontFamily="Georgia,'Times New Roman',serif" fontSize="42" fontWeight="700" letterSpacing="5" fill="url(#ax-login-sg)">AXIOS</text>
            <polygon points="300,62 335,4 370,62"  fill="none" stroke="url(#ax-login-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
            <polygon points="312,62 335,20 358,62" fill="none" stroke="url(#ax-login-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
          </svg>

          {/* Shimmer bar */}
          <div style={{ width: 100, height: 1, background: 'rgba(200,200,220,0.06)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: '40%',
              background: 'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)',
              animation: 'l2-logo-bar 2.4s ease-in-out infinite',
            }}/>
          </div>

          {/* Tagline */}
          <p style={{
            color: 'rgba(212,212,232,0.28)',
            fontSize: '0.6rem',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            fontFamily: '"The Seasons", Georgia, serif',
            margin: 0,
          }}>I Am Worthy</p>
        </div>

        {/* Closed — SECURE ACCESS only */}
        {!open && (
          <div
            onClick={() => setOpen(true)}
            style={{
              position: 'absolute', zIndex: 10,
              top: '68%', left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {/* Vertical accent line above text */}
            <div style={{
              width: 1, height: 36,
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.65), transparent)',
              marginBottom: 18,
              animation: 'l2-vline 2.8s ease-in-out infinite',
            }} />

            {/* Corner bracket accents */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* top-left */}
              <div style={{ position:'absolute', top:-8, left:-10, width:8, height:8, borderTop:'1px solid rgba(255,255,255,0.45)', borderLeft:'1px solid rgba(255,255,255,0.45)', animation:'l2-corner 2.8s ease-in-out infinite' }} />
              {/* top-right */}
              <div style={{ position:'absolute', top:-8, right:-10, width:8, height:8, borderTop:'1px solid rgba(255,255,255,0.45)', borderRight:'1px solid rgba(255,255,255,0.45)', animation:'l2-corner 2.8s ease-in-out infinite', animationDelay:'0.2s' }} />
              {/* bottom-left */}
              <div style={{ position:'absolute', bottom:-8, left:-10, width:8, height:8, borderBottom:'1px solid rgba(255,255,255,0.45)', borderLeft:'1px solid rgba(255,255,255,0.45)', animation:'l2-corner 2.8s ease-in-out infinite', animationDelay:'0.4s' }} />
              {/* bottom-right */}
              <div style={{ position:'absolute', bottom:-8, right:-10, width:8, height:8, borderBottom:'1px solid rgba(255,255,255,0.45)', borderRight:'1px solid rgba(255,255,255,0.45)', animation:'l2-corner 2.8s ease-in-out infinite', animationDelay:'0.6s' }} />

              <p style={{
                color: '#fff',
                fontSize: 'clamp(0.62rem, 2.6vw, 0.78rem)',
                letterSpacing: '0.65em',
                textTransform: 'uppercase',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontWeight: 300,
                margin: 0,
                animation: 'secureGlow 2.8s ease-in-out infinite',
              }}>
                Secure Access
              </p>
            </div>

            <div style={{
              width: 28, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              marginTop: 18,
              animation: 'lineBreath 2.8s ease-in-out infinite',
              animationDelay: '0.35s',
            }} />
          </div>
        )}

        {/* Open — form revealed */}
        {open && (
          <div style={{
            position: 'absolute', zIndex: 10,
            top: '62%',
            left: 0, right: 0,
            padding: '0 2rem',
            maxWidth: '420px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            animation: 'formReveal 0.55s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>
            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: '2.2rem' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="l2-lock-icon" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,212,232,0.45)', pointerEvents: 'none' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="EMAIL" autoComplete="off" required className="l2-input l2-input-icon" />
                  {email.includes('@') && email.includes('.') && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,212,232,0.75)', filter: 'drop-shadow(0 0 6px rgba(212,212,232,0.6))', pointerEvents: 'none' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '3.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="l2-lock-icon" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,212,232,0.45)', pointerEvents: 'none' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="PASSWORD" autoComplete="current-password" required className="l2-input l2-input-icon" />
                </div>
              </div>

              {error && (
                <p style={{ color: 'rgba(255,100,100,0.85)', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>{error}</p>
              )}

              {offerFaceId ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(212,212,232,0.7)', fontSize: '0.75rem', fontFamily: '"Helvetica Neue",sans-serif', marginBottom: '1.2rem', lineHeight: 1.5 }}>Enable Face ID for faster sign-in?</p>
                  <button type="button" onClick={handleRegisterFaceId} disabled={registeringFaceId}
                    style={{ width: '100%', padding: '13px', borderRadius: 2, border: 'none', background: '#fff', color: '#000', fontSize: '0.75rem', fontWeight: 700, fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 10 }}>
                    {registeringFaceId ? 'Setting up…' : 'Enable Face ID'}
                  </button>
                  <button type="button" onClick={() => setShowLoader(true)}
                    style={{ width: '100%', padding: '11px', borderRadius: 2, border: '1px solid rgba(212,212,232,0.15)', background: 'transparent', color: 'rgba(212,212,232,0.45)', fontSize: '0.7rem', fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Skip for now
                  </button>
                </div>
              ) : (
                <button type="submit" disabled={loading} className={`l2-enter-btn${password.length > 0 ? ' l2-btn-active' : ''}`}>
                  {loading ? 'Entering...' : 'Enter'}
                </button>
              )}

            </form>
          </div>
        )}


      </div>
    </>
  )
}
