import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import axLogoSrc from '../assets/ax-logo.png'
import warriorSrc from '../assets/axios-warrior.png'



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
  @keyframes iamworthy {
    0%, 100% {
      opacity: 0.65;
      text-shadow: 0 0 6px rgba(212,212,232,0.5), 0 0 16px rgba(212,212,232,0.25), 0 0 32px rgba(200,210,255,0.12);
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 12px rgba(212,212,232,0.95), 0 0 28px rgba(212,212,232,0.6), 0 0 55px rgba(200,210,255,0.35), 0 0 90px rgba(200,210,255,0.15);
    }
  }
  @keyframes enterPulse {
    0%, 100% {
      color: rgba(212,212,232,0.45);
      text-shadow: none;
      box-shadow: none;
      border-color: rgba(212,212,232,0.15);
    }
    50% {
      color: rgba(212,212,232,0.95);
      text-shadow: 0 0 10px rgba(212,212,232,0.6), 0 0 28px rgba(200,210,255,0.25);
      box-shadow: 0 0 18px rgba(212,212,232,0.18), 0 0 40px rgba(200,210,255,0.1);
      border-color: rgba(212,212,232,0.45);
    }
  }
  @keyframes saGlow {
    0%, 100% { color: rgba(255,255,255,0.18); text-shadow: none; }
    50%       { color: rgba(255,255,255,0.55); text-shadow: 0 0 8px rgba(255,255,255,0.35), 0 0 20px rgba(200,210,255,0.2); }
  }
  @keyframes l2-shimmer {
    0%   { background-position: -250% center; }
    100% { background-position: 250% center; }
  }
  @keyframes l2-placeholderPulse {
    0%,100% { opacity: 0.45; }
    50%     { opacity: 1.0;  }
  }
  @keyframes l2-iconPulse {
    0%,100% { filter: invert(1) drop-shadow(0 0 3px rgba(200,200,220,0.25)); opacity: 0.50; }
    50%     { filter: invert(1) drop-shadow(0 0 10px rgba(200,200,220,0.80)); opacity: 1.0; }
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
    font-family: 'The Seasons', serif;
    letter-spacing: 0.22em;
    font-size: 0.78rem;
    text-transform: uppercase;
    background: linear-gradient(90deg, #3a3a48 0%, #8c8c9e 38%, rgba(212,212,232,0.96) 50%, #8c8c9e 62%, #3a3a48 100%);
    background-size: 250% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: l2-shimmer 2.8s linear infinite;
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
  @keyframes l2-logo-shimmer {
    0%, 8%    { left: -50%; opacity: 0; }
    13%       { opacity: 1; }
    34%       { opacity: 1; }
    40%, 100% { left: 155%; opacity: 0; }
  }
  @keyframes l2-body-wash {
    0%, 36%   { opacity: 0; }
    43%       { opacity: 1; }
    73%       { opacity: 0.5; }
    87%, 100% { opacity: 0; }
  }  @keyframes l2-px-a {
    0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
    18%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { transform: translateY(-54px) translateX(9px);   opacity: 0; }
  }
  @keyframes l2-px-b {
    0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
    18%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { transform: translateY(-44px) translateX(-12px); opacity: 0; }
  }
  @keyframes l2-px-c {
    0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
    18%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { transform: translateY(-70px) translateX(4px);   opacity: 0; }
  }
  @keyframes l2-px-d {
    0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
    18%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { transform: translateY(-38px) translateX(15px);  opacity: 0; }
  }
  @keyframes l2-px-e {
    0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
    18%  { opacity: 1; }
    82%  { opacity: 1; }
    100% { transform: translateY(-78px) translateX(-7px);  opacity: 0; }
  }
  @keyframes l2-smoke-a {
    0%   { transform: translateY(0%)    translateX(-4%) skewX(-1.5deg) scale(1.05); opacity: 0;    }
    20%  { opacity: 0.82; }
    50%  { transform: translateY(-100%) translateX(0%)  skewX(0deg)    scale(1);    opacity: 0.88; }
    80%  { opacity: 0.72; }
    100% { transform: translateY(-200%) translateX(5%)  skewX(2deg)    scale(0.95); opacity: 0;    }
  }
  @keyframes l2-smoke-b {
    0%   { transform: translateY(0%)    translateX(6%)  skewX(2deg)    scale(1);    opacity: 0;    }
    20%  { opacity: 0.62; }
    50%  { transform: translateY(-100%) translateX(-2%) skewX(-1deg)   scale(1.04); opacity: 0.68; }
    80%  { opacity: 0.52; }
    100% { transform: translateY(-200%) translateX(-5%) skewX(-2deg)   scale(0.92); opacity: 0;    }
  }
  @keyframes l2-smoke-c {
    0%   { transform: translateY(0%)    translateX(2%)  skewX(-1deg)   scale(1.02); opacity: 0;    }
    20%  { opacity: 0.48; }
    50%  { transform: translateY(-100%) translateX(-3%) skewX(1.5deg)  scale(1);    opacity: 0.55; }
    80%  { opacity: 0.42; }
    100% { transform: translateY(-200%) translateX(-6%) skewX(1deg)    scale(0.9);  opacity: 0;    }
  }
`

const VARIANTS = ['l2-px-a','l2-px-b','l2-px-c','l2-px-d','l2-px-e']
const COLORS   = ['rgba(212,212,232,', 'rgba(200,200,220,', 'rgba(220,220,240,']
const PARTICLES = Array.from({ length: 140 }, (_, i) => {
  const small   = i >= 100
  const opacity = small ? 0.08 + (i % 5) * 0.05 : 0.13 + (i % 5) * 0.07
  return {
    x:       (i * 37 + 13) % 100,
    y:       (i * 53 +  7) % 100,
    size:    small ? 0.5 + (i % 3) * 0.35 : 0.9 + (i % 3) * 0.55,
    color:   COLORS[i % 3] + opacity + ')',
    variant: VARIANTS[i % 5],
    dur:     2.2 + (i % 5) * 0.9,
    delay:  -((i * 0.31) % 7),
  }
})

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
  const [showLogin, setShowLogin]                 = useState(false)
  const [authenticated, setAuthenticated]         = useState(false)

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
      setAuthenticated(true)
      setLoading(false)
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
    finally { setRegisteringFaceId(false); setOfferFaceId(false); setAuthenticated(true) }
  }

  if (showLoader) return <LoadingScreen onComplete={() => navigate('/dashboard')} />

  return (
    <>
      <style>{styles}</style>
      <div style={{ position: 'fixed', top: 0, bottom: 0, left: 'max(0px, calc(50vw - 215px))', right: 'max(0px, calc(50vw - 215px))', background: '#000', overflow: 'hidden' }}>

        {/* ── Background image ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${warriorSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: '38% top',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.08) brightness(0.9) saturate(0.85)',
        }} />

        {/* ── Cinematic gradient frame (top + bottom) ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
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
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 38% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />

        {/* ── Smoke A — rises from below, primary layer ── */}
        <div style={{
          position: 'absolute', left: '-10%', right: '-10%',
          top: '100%', height: '100%',
          zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 55% at 50% 60%, rgba(200,200,220,0.13) 0%, rgba(185,190,215,0.06) 45%, transparent 72%)',
          filter: 'blur(40px)',
          animation: 'l2-smoke-a 20s linear infinite',
        }} />

        {/* ── Smoke B — slower, offset left ── */}
        <div style={{
          position: 'absolute', left: '-15%', right: '5%',
          top: '100%', height: '100%',
          zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 65% 50% at 40% 65%, rgba(190,190,215,0.11) 0%, rgba(175,180,208,0.05) 50%, transparent 70%)',
          filter: 'blur(52px)',
          animation: 'l2-smoke-b 28s linear infinite',
          animationDelay: '-11s',
        }} />

        {/* ── Smoke C — fastest, offset right ── */}
        <div style={{
          position: 'absolute', left: '5%', right: '-10%',
          top: '100%', height: '100%',
          zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 48% at 55% 65%, rgba(195,200,218,0.10) 0%, rgba(185,190,215,0.04) 52%, transparent 70%)',
          filter: 'blur(44px)',
          animation: 'l2-smoke-c 16s linear infinite',
          animationDelay: '-6s',
        }} />

        {/* ── Particles ── */}
        <div style={{ position:'fixed', inset:0, zIndex:2, overflow:'hidden', pointerEvents:'none' }}>
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              background: p.color,
              animation: `${p.variant} ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}/>
          ))}
        </div>

        {/* ── Horizontal edge vignette (sides) ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
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
          position:'absolute', width:'100%', height:'1px', top:0, zIndex:3,
          background:'linear-gradient(90deg,transparent 0%,rgba(220,220,255,0.07) 30%,rgba(212,212,232,0.14) 50%,rgba(220,220,255,0.07) 70%,transparent 100%)',
          animation:'l2-scan 8s ease-in-out infinite',
          pointerEvents:'none',
        }}/>


        {/* ── AX Logo ── */}
        <div style={{ position:'absolute', top:0, left:0, right:0, paddingTop:'max(env(safe-area-inset-top), 36px)', display:'flex', justifyContent:'center', alignItems:'flex-start', zIndex:5, pointerEvents:'none' }}>
          <img src={axLogoSrc} alt="AX" style={{ width:185, height:'auto', display:'block', transform:'scaleX(1.08)', mixBlendMode:'screen', filter:'drop-shadow(0 2px 22px rgba(180,185,210,0.5))' }} />
        </div>
        {/* Closed — full-screen tap zone */}
        {!showLogin && (
          <div
            onClick={() => setShowLogin(true)}
            style={{
              position: 'fixed', inset: 0, zIndex: 10,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          />
        )}

        {/* Open — form revealed */}
        {showLogin && (
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

              {!authenticated && (
                <>
                  <div style={{ marginBottom: '2.2rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img src="/pegasus.png" width="15" height="15" className="l2-lock-icon" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
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
                      <img src="/pegasus.png" width="15" height="15" className="l2-lock-icon" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit(e)} onBlur={() => { if (email && password) handleSubmit({ preventDefault: () => {} }) }} placeholder="PASSWORD" autoComplete="current-password" required className="l2-input l2-input-icon" />
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: 'rgba(255,100,100,0.85)', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>{error}</p>
                  )}

                  {offerFaceId && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'rgba(212,212,232,0.7)', fontSize: '0.75rem', fontFamily: '"Helvetica Neue",sans-serif', marginBottom: '1.2rem', lineHeight: 1.5 }}>Enable Face ID for faster sign-in?</p>
                      <button type="button" onClick={handleRegisterFaceId} disabled={registeringFaceId}
                        style={{ width: '100%', padding: '13px', borderRadius: 2, border: 'none', background: '#fff', color: '#000', fontSize: '0.75rem', fontWeight: 700, fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 10 }}>
                        {registeringFaceId ? 'Setting up…' : 'Enable Face ID'}
                      </button>
                      <button type="button" onClick={() => { setOfferFaceId(false); setAuthenticated(true) }}
                        style={{ width: '100%', padding: '11px', borderRadius: 2, border: '1px solid rgba(212,212,232,0.15)', background: 'transparent', color: 'rgba(212,212,232,0.45)', fontSize: '0.7rem', fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Skip for now
                      </button>
                    </div>
                  )}
                </>
              )}

              {authenticated && (
                <div style={{ display: 'flex', justifyContent: 'center', animation: 'formReveal 0.55s cubic-bezier(0.16,1,0.3,1) forwards' }}>
                  <button type="button" onClick={() => setShowLoader(true)}
                    style={{ padding: '14px 48px', borderRadius: 2, border: '1px solid rgba(212,212,232,0.15)', background: 'transparent', color: 'rgba(212,212,232,0.45)', fontSize: '1.1rem', fontWeight: 400, fontFamily: '"The Seasons", Georgia, serif', letterSpacing: '0.2em', cursor: 'pointer', animation: 'enterPulse 3s ease-in-out infinite' }}>
                    Enter
                  </button>
                </div>
              )}

            </form>
          </div>
        )}


      </div>
    </>
  )
}
