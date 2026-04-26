import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

const HERO = 'data:image/jpeg;base64,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'

const WORDS = ['Discipline.', 'Accountability.', 'Personal ownership.']

const styles = `
  @font-face {
    font-family: 'The Seasons';
    src: url('/the-seasons-regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&display=swap');

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOutUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-14px); }
  }
  @keyframes shimmer {
    0%,100% { opacity: 0.4; }
    50%      { opacity: 0.65; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes borderGlow {
    0%,100% { box-shadow: 0 0 14px rgba(200,200,220,0.18), 0 0 36px rgba(200,200,220,0.07), inset 0 0 16px rgba(200,200,220,0.04); border-color: rgba(200,200,220,0.32); }
    50%     { box-shadow: 0 0 28px rgba(200,200,220,0.42), 0 0 70px rgba(200,200,220,0.14), inset 0 0 28px rgba(200,200,220,0.07); border-color: rgba(200,200,220,0.65); }
  }
  @keyframes inputPulse {
    0%,100% { box-shadow: 0 0 0px rgba(212,212,232,0); }
    50%     { box-shadow: 0 0 16px rgba(212,212,232,0.10), 0 0 32px rgba(212,212,232,0.04); }
  }
  @keyframes scanLine {
    0%   { transform: translateY(-100vh); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes titleShimmer {
    0%,100% { text-shadow: 0 0 30px rgba(212,212,232,0.18), 0 0 60px rgba(212,212,232,0.06); letter-spacing: 0.18em; }
    50%     { text-shadow: 0 0 50px rgba(212,212,232,0.45), 0 0 100px rgba(212,212,232,0.14), 0 0 160px rgba(212,212,232,0.05); letter-spacing: 0.20em; }
  }
  @keyframes btnShine {
    0%   { background-position: -300% center; }
    60%,100% { background-position: 300% center; }
  }
  @keyframes bracketPulse {
    0%,100% { opacity: 0.25; }
    50%     { opacity: 0.65; }
  }
  @keyframes floatUp {
    0%,100% { transform: translateY(0px); opacity: 0.6; }
    50%     { transform: translateY(-6px); opacity: 1; }
  }
  @keyframes breathe {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.04); opacity: 0.9; }
  }
  @keyframes btnGoldGlow {
    0%,100% { box-shadow: 0 0 12px rgba(200,200,220,0.22), 0 0 28px rgba(200,200,220,0.09); }
    50%     { box-shadow: 0 0 24px rgba(200,200,220,0.50), 0 0 56px rgba(200,200,220,0.20), 0 0 90px rgba(200,200,220,0.07); }
  }

  @keyframes loginRipple {
    0%   { transform: translate(-50%, -50%) scale(0.04); opacity: 0.28; }
    60%  { opacity: 0.08; }
    100% { transform: translate(-50%, -50%) scale(1);    opacity: 0;    }
  }
  @keyframes loginParticle {
    0%   { opacity: 0;   transform: translateY(0px) scale(1);   }
    18%  { opacity: 0.9; }
    82%  { opacity: 0.4; }
    100% { opacity: 0;   transform: translateY(-42vh) scale(0.4); }
  }
  @keyframes loginAurora {
    0%,100% { opacity: 0.04; transform: scaleX(1)   skewY(-2deg); }
    50%     { opacity: 0.11; transform: scaleX(1.08) skewY(-4deg); }
  }

  .word-in  { animation: fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
  .word-out { animation: fadeOutUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

  .login-card {
    position: relative;
  }

  .login-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(200,200,220,0.42);
    border-radius: 2px;
    color: rgba(212,212,232,0.9);
    padding: 13px 14px;
    font-size: 1rem;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    outline: none;
    -webkit-appearance: none;
    transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
    caret-color: white;
    box-shadow: 0 0 10px rgba(200,200,220,0.13), inset 0 1px 3px rgba(0,0,0,0.4);
    animation: borderGlow 3.5s ease-in-out infinite;
  }
  .login-input:focus {
    border-color: rgba(200,200,220,0.85);
    box-shadow: 0 0 0 1px rgba(200,200,220,0.13), 0 0 20px rgba(200,200,220,0.22), 0 0 40px rgba(200,200,220,0.09), inset 0 1px 3px rgba(0,0,0,0.4);
    animation: none;
    background: rgba(200,200,220,0.04);
    border-left: 1px solid #d0d0dc;
  }
  .login-input-icon {
    padding-left: 36px;
  }
  .login-input::placeholder {
    color: rgba(200,200,220,0.22);
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    letter-spacing: 0.08em;
    font-size: 0.85rem;
  }

  .enter-btn {
    width: 100%;
    background: rgba(0,0,0,0.6);
    color: rgba(212,212,232,0.92);
    border: 1px solid #d0d0dc;
    border-radius: 2px;
    padding: 14px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    transition: box-shadow 0.3s, transform 0.15s, border-color 0.3s;
    -webkit-appearance: none;
    text-shadow: 0 0 14px rgba(212,212,232,0.5), 0 0 30px rgba(212,212,232,0.2);
    background-image: linear-gradient(105deg, transparent 35%, rgba(212,212,232,0.07) 50%, transparent 65%);
    background-size: 300% 100%;
    animation: btnGoldGlow 3s ease-in-out infinite, btnShine 4s ease-in-out infinite;
  }
  .enter-btn:hover  { transform: translateY(-1px); border-color: #d0d0dc; box-shadow: 0 0 28px rgba(200,200,220,0.42), 0 0 60px rgba(200,200,220,0.18); }
  .enter-btn:active { transform: translateY(0); box-shadow: none; }
  .enter-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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
  @keyframes secureReveal {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lineBreath {
    0%, 100% { opacity: 0.3; transform: scaleX(0.7); }
    50%       { opacity: 0.9; transform: scaleX(1); }
  }
`

export default function Login() {
  const { signIn, user: authUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [wordIndex,    setWordIndex]    = useState(0)
  const [offerFaceId, setOfferFaceId] = useState(false)
  const [registeringFaceId, setRegisteringFaceId] = useState(false)
  const [phase, setPhase] = useState('in')
  const [open,  setOpen]  = useState(false)

  useEffect(() => {
    const cycle = () => {
      setPhase('out')
      setTimeout(() => {
        setWordIndex(i => (i + 1) % WORDS.length)
        setPhase('in')
      }, 700)
    }
    const interval = setInterval(cycle, 7000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await signIn(email, password)
      // Check if Face ID is supported and not yet registered
      if (webAuthnSupported() && data?.user) {
        const already = await hasRegisteredDevice(data.user.id)
        if (!already) { setOfferFaceId(true); setLoading(false); return }
      }
      setShowLoader(true)
    } catch(err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleRegisterFaceId = async () => {
    setRegisteringFaceId(true)
    try {
      if (authUser) await registerBiometric(authUser)
    } catch(e) { console.error('FaceID register:', e.message) }
    finally { setRegisteringFaceId(false); navigate('/dashboard') }
  }

  if (showLoader) return (
    <LoadingScreen onComplete={() => navigate('/dashboard')} />
  )

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>

        {/* Hero — fills screen, anchored to show chest/abs on all devices */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url('${HERO}')`,
          backgroundSize: 'cover',
          backgroundPosition: '50% 30%',
          backgroundRepeat: 'no-repeat',
          animation: 'breathe 9s ease-in-out infinite',
        }} />

        {/* Radial vignette — edges dark, center open so physique shows */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.93) 100%)',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '40%', zIndex: 2,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 100%)',
        }} />

        {/* Top fade */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '25%', zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
        }} />

        {/* Atmospheric shimmer */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,212,232,0.07) 0%, rgba(212,212,232,0.02) 40%, transparent 70%)',
          animation: 'shimmer 7s ease-in-out infinite',
        }} />

        {/* Scanline sweep */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(212,212,232,0.04), transparent)',
          animation: 'scanLine 12s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Ripple rings — emanate from hero centre */}
        <div style={{ position:'fixed', inset:0, zIndex:3, pointerEvents:'none', overflow:'hidden' }}>
          {[0, 1.4, 2.8, 4.2, 5.6].map((delay, i) => (
            <div key={i} style={{
              position:'absolute',
              top:'38%', left:'50%',
              width:'130vw', height:'130vw',
              borderRadius:'50%',
              border:`1px solid rgba(212,212,232,${0.13 - i * 0.015})`,
              animation:`loginRipple 7s ease-out infinite`,
              animationDelay:`-${delay}s`,
            }}/>
          ))}
        </div>

        {/* Floating particles */}
        <div style={{ position:'fixed', inset:0, zIndex:3, pointerEvents:'none', overflow:'hidden' }}>
          {[
            { l:'8%',  bot:'12%', dur:'9s',  delay:'0s',   s:2.5 },
            { l:'18%', bot:'22%', dur:'12s', delay:'-3s',  s:1.5 },
            { l:'32%', bot:'8%',  dur:'10s', delay:'-6s',  s:2   },
            { l:'45%', bot:'18%', dur:'14s', delay:'-1.5s',s:1.5 },
            { l:'58%', bot:'6%',  dur:'11s', delay:'-8s',  s:2   },
            { l:'68%', bot:'25%', dur:'9s',  delay:'-4.5s',s:1.5 },
            { l:'78%', bot:'14%', dur:'13s', delay:'-2s',  s:2.5 },
            { l:'88%', bot:'20%', dur:'10s', delay:'-7s',  s:1.5 },
            { l:'24%', bot:'35%', dur:'16s', delay:'-5s',  s:1   },
            { l:'72%', bot:'38%', dur:'15s', delay:'-9s',  s:1   },
          ].map((p, i) => (
            <div key={i} style={{
              position:'absolute',
              left:p.l, bottom:p.bot,
              width:p.s, height:p.s,
              borderRadius:'50%',
              background:'rgba(212,212,232,0.75)',
              boxShadow:`0 0 ${p.s * 3}px rgba(212,212,232,0.5)`,
              animation:`loginParticle ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
            }}/>
          ))}
        </div>

        {/* Aurora band — slow horizontal light sweep */}
        <div style={{
          position:'fixed', left:'-10%', right:'-10%', top:'25%', height:'18%',
          zIndex:3, pointerEvents:'none',
          background:'linear-gradient(to bottom, transparent 0%, rgba(212,212,232,0.05) 40%, rgba(212,212,232,0.07) 50%, rgba(212,212,232,0.05) 60%, transparent 100%)',
          animation:'loginAurora 8s ease-in-out infinite',
        }}/>

        {/* Closed — SECURE ACCESS only */}
        {!open && (
          <div
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: 'clamp(16vh, 28vh, 32vh)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
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
            <div style={{
              width: 28, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              marginTop: 14,
              animation: 'lineBreath 2.8s ease-in-out infinite',
              animationDelay: '0.35s',
            }} />
          </div>
        )}

        {/* Open — full form */}
        {open && (
          <div style={{
            position: 'relative', zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: '100%', maxWidth: '420px',
            padding: 'clamp(1rem, 4vh, 2rem) 1.25rem clamp(1rem, 4vh, 2rem)',
            margin: '0 auto',
            minHeight: '100dvh',
            justifyContent: 'center',
            animation: 'secureReveal 0.55s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>

            {/* Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'clamp(0.75rem, 2.5vh, 1.5rem)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '130px', background: 'radial-gradient(ellipse at center, rgba(200,200,220,0.14) 0%, rgba(200,200,220,0.06) 50%, transparent 72%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <svg width="38" height="32" viewBox="0 0 46 38" fill="none">
                  <polygon points="0,36 16,2 22,14 9,36" fill="white"/>
                  <polygon points="13,36 26,8 32,22 20,36" fill="white" opacity="0.62"/>
                  <polygon points="20,36 30,18 34,28 22,36" fill="white" opacity="0.32"/>
                </svg>
                <div style={{ width: '1px', height: '38px', background: 'linear-gradient(to bottom, transparent, #d0d0dc 30%, #d0d0dc 70%, transparent)', boxShadow: '0 0 8px rgba(200,200,220,0.55)' }} />
                <span style={{
                  color: 'white', fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 8vw, 2.8rem)',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  lineHeight: 1, fontFamily: '"The Seasons", serif',
                  textShadow: `-1px -1px 1px rgba(212,212,232,0.18), 1px 1px 2px rgba(0,0,0,0.9), 0 0 40px rgba(212,212,232,0.08)`,
                }}>AXIOS</span>
              </div>
              <p style={{ color: 'rgba(200,200,220,0.70)', fontSize: '0.6rem', letterSpacing: '0.42em', textTransform: 'uppercase', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
                The Worthy
              </p>
            </div>

            {/* Animated word */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(1rem, 2.5vh, 2rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <p style={{ color: 'rgba(200,200,220,0.55)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', margin: 0 }}>Est. 1989</p>
              <div style={{ overflow: 'hidden', height: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p key={wordIndex} className={phase === 'in' ? 'word-in' : 'word-out'} style={{ color: 'rgba(212,212,232,0.88)', fontSize: 'clamp(1.1rem, 4.5vw, 1.35rem)', fontFamily: '"EB Garamond", Georgia, serif', fontStyle: 'italic', letterSpacing: '0.09em', margin: 0, textShadow: '0 2px 20px rgba(200,200,220,0.28)' }}>
                  {WORDS[wordIndex]}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                {WORDS.map((_, i) => (
                  <div key={i} style={{ width: i === wordIndex ? '16px' : '4px', height: '2px', borderRadius: '1px', background: i === wordIndex ? 'rgba(212,212,232,0.7)' : 'rgba(212,212,232,0.2)', transition: 'all 0.5s ease' }} />
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-card" style={{ width: '100%', padding: 'clamp(1.25rem, 5vw, 2rem)' }}>
              <p style={{ fontSize: '0.58rem', textTransform: 'uppercase', marginBottom: '1.25rem', textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', letterSpacing: '0.38em', color: 'rgba(212,212,232,0.9)', textShadow: '0 0 12px rgba(212,212,232,0.6), 0 0 30px rgba(212,212,232,0.25)' }}>
                Secure Access
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: 'rgba(212,212,232,0.3)', fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,212,232,0.22)', pointerEvents: 'none' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" autoComplete="off" required className="login-input login-input-icon" />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'rgba(212,212,232,0.3)', fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,212,232,0.22)', pointerEvents: 'none' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" required className="login-input login-input-icon" />
                </div>
              </div>

              {error && <p style={{ color: 'rgba(255,100,100,0.85)', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>{error}</p>}

              {offerFaceId ? (
                <div style={{ textAlign:'center' }}>
                  <p style={{ color:'rgba(212,212,232,0.7)', fontSize:'0.75rem', fontFamily:'"Helvetica Neue",sans-serif', marginBottom:'1.2rem', lineHeight:1.5 }}>Enable Face ID for faster sign-in?</p>
                  <button type="button" onClick={handleRegisterFaceId} disabled={registeringFaceId} style={{ width:'100%', padding:'13px', borderRadius:8, border:'none', background:'#fff', color:'#000', fontSize:'0.75rem', fontWeight:700, fontFamily:'"Helvetica Neue",sans-serif', letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', marginBottom:10 }}>
                    {registeringFaceId ? 'Setting up…' : 'Enable Face ID'}
                  </button>
                  <button type="button" onClick={() => setShowLoader(true)} style={{ width:'100%', padding:'11px', borderRadius:8, border:'1px solid rgba(212,212,232,0.15)', background:'transparent', color:'rgba(212,212,232,0.45)', fontSize:'0.7rem', fontFamily:'"Helvetica Neue",sans-serif', letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }}>
                    Skip for now
                  </button>
                </div>
              ) : (
                <button type="submit" disabled={loading} className="enter-btn">
                  {loading ? 'Entering...' : 'Enter'}
                </button>
              )}

              <p style={{ fontSize: '0.56rem', textTransform: 'uppercase', textAlign: 'center', marginTop: '1rem', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', letterSpacing: '0.22em', color: 'rgba(212,212,232,0.9)', textShadow: '0 0 14px rgba(212,212,232,0.65), 0 0 35px rgba(212,212,232,0.25)' }}>
                Authorized personnel only
              </p>
            </form>

            <p style={{ color: 'rgba(212,212,232,0.15)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1.5rem', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
              "Axios" — The Worthy
            </p>
          </div>
        )}

        <p style={{
          position: 'fixed', bottom: '1.5rem', left: '1.5rem',
          color: 'rgba(200,200,220,0.32)', fontSize: '0.55rem',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          fontStyle: 'italic', zIndex: 10,
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        }}>Est 1989</p>

      </div>
    </>
  )
}
