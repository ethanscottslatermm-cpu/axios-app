import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

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
  @keyframes marbleScanLine {
    0%   { transform: translateY(-100vh); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes btnShine2 {
    0%   { background-position: -300% center; }
    60%,100% { background-position: 300% center; }
  }
  @keyframes borderSharp {
    0%,100% { box-shadow: 0 0 6px rgba(255,255,255,0.08), inset 0 0 8px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.28); }
    50%     { box-shadow: 0 0 14px rgba(255,255,255,0.18), inset 0 0 12px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.52); }
  }

  .word-in  { animation: fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
  .word-out { animation: fadeOutUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

  .marble-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(0,0,0,0.38);
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 1px;
    color: rgba(255,255,255,0.88);
    padding: 13px 14px;
    font-size: 0.95rem;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    outline: none;
    -webkit-appearance: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    caret-color: white;
    animation: borderSharp 4s ease-in-out infinite;
    backdrop-filter: blur(2px);
  }
  .marble-input:focus {
    border-color: rgba(255,255,255,0.80);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.10), 0 0 16px rgba(255,255,255,0.12);
    animation: none;
    background: rgba(0,0,0,0.45);
  }
  .marble-input-icon {
    padding-left: 36px;
  }
  .marble-input::placeholder {
    color: rgba(255,255,255,0.22);
    font-family: "Helvetica Neue", Helvetica, sans-serif;
    letter-spacing: 0.06em;
    font-size: 0.82rem;
  }

  .enter-btn-marble {
    width: 100%;
    background: #111111;
    color: rgba(255,255,255,0.94);
    border: 1px solid rgba(255,255,255,0.30);
    border-radius: 1px;
    padding: 15px;
    font-size: 0.70rem;
    font-weight: 800;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    transition: box-shadow 0.25s, transform 0.15s;
    -webkit-appearance: none;
    text-shadow: 0 0 12px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.20);
    background-image: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 65%);
    background-size: 300% 100%;
    animation: btnShine2 5s ease-in-out infinite;
  }
  .enter-btn-marble:hover  { transform: translateY(-1px); box-shadow: 0 0 22px rgba(255,255,255,0.18), 0 2px 20px rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.55); }
  .enter-btn-marble:active { transform: translateY(0); box-shadow: none; }
  .enter-btn-marble:disabled { opacity: 0.35; cursor: not-allowed; }
`

export default function Login2() {
  const { signIn, user: authUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [offerFaceId, setOfferFaceId] = useState(false)
  const [registeringFaceId, setRegisteringFaceId] = useState(false)
  const [phase, setPhase] = useState('in')

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
    } catch (e) { console.error('FaceID register:', e.message) }
    finally { setRegisteringFaceId(false); navigate('/dashboard') }
  }

  if (showLoader) return (
    <LoadingScreen onComplete={() => navigate('/dashboard')} />
  )

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100dvh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Marble background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url('/marble-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: '50% 20%',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.62) contrast(1.1) grayscale(1)',
        }} />

        {/* Dark vignette — heavier than original to push UI into shadow */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.92) 100%)',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '45%', zIndex: 2,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0) 100%)',
        }} />

        {/* Top fade */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '20%', zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0) 100%)',
        }} />

        {/* Scanline sweep */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '2px', zIndex: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.03), transparent)',
          animation: 'marbleScanLine 14s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%', maxWidth: '420px',
          padding: '2rem 1.25rem',
          margin: '0 auto',
        }}>

          {/* Brand — dimmed metal-like */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {/* Triangle logo — dimmed grey */}
              <svg width="36" height="30" viewBox="0 0 46 38" fill="none">
                <polygon points="0,36 16,2 22,14 9,36" fill="rgba(200,200,200,0.55)"/>
                <polygon points="13,36 26,8 32,22 20,36" fill="rgba(200,200,200,0.35)" />
                <polygon points="20,36 30,18 34,28 22,36" fill="rgba(200,200,200,0.18)" />
              </svg>
              <div style={{
                width: '1px', height: '36px',
                background: 'linear-gradient(to bottom, transparent, rgba(200,200,200,0.40) 30%, rgba(200,200,200,0.40) 70%, transparent)',
              }} />
              <span style={{
                color: 'rgba(210,210,212,0.72)',
                fontWeight: 900,
                fontSize: 'clamp(1.8rem, 8vw, 2.7rem)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                lineHeight: 1,
                fontFamily: '"The Seasons", serif',
                textShadow: `
                  -1px -1px 1px rgba(255,255,255,0.08),
                   1px  1px 2px rgba(0,0,0,0.95),
                   0 0 20px rgba(200,200,200,0.05)
                `,
              }}>AXIOS</span>
            </div>

            {/* I AM WORTHY */}
            <p style={{
              color: 'rgba(200,200,200,0.42)',
              fontSize: '0.56rem',
              letterSpacing: '0.44em',
              textTransform: 'uppercase',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              margin: 0,
            }}>
              I Am Worthy
            </p>
          </div>

          {/* Ornamental divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
            <span style={{ color: 'rgba(180,180,180,0.28)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>—</span>
            <div style={{ width: '20px', height: '1px', background: 'rgba(180,180,180,0.28)' }} />
            <span style={{ color: 'rgba(180,180,180,0.28)', fontSize: '0.6rem', letterSpacing: '0.2em' }}>—</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%', padding: 'clamp(1.25rem, 5vw, 1.75rem) clamp(1rem, 4vw, 1.5rem)', boxSizing: 'border-box' }}>

            {/* SECURE ACCESS label */}
            <p style={{
              fontSize: '0.56rem',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              letterSpacing: '0.40em',
              color: 'rgba(210,210,212,0.65)',
              margin: '0 0 1.5rem 0',
            }}>
              Secure Access
            </p>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(200,200,200,0.32)',
                fontSize: '0.56rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              }}>Email</label>
              <div style={{ position: 'relative' }}>
                {/* Lock icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email"
                  autoComplete="off"
                  required
                  className="marble-input marble-input-icon"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: 'rgba(200,200,200,0.32)',
                fontSize: '0.56rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="password"
                  autoComplete="current-password"
                  required
                  className="marble-input marble-input-icon"
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'rgba(255,100,100,0.80)', fontSize: '0.73rem', marginBottom: '1rem', textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>{error}</p>
            )}

            {offerFaceId ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(210,210,212,0.68)', fontSize: '0.75rem', fontFamily: '"Helvetica Neue",sans-serif', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  Enable Face ID for faster sign-in?
                </p>
                <button type="button" onClick={handleRegisterFaceId} disabled={registeringFaceId}
                  style={{ width: '100%', padding: '13px', borderRadius: 1, border: 'none', background: 'rgba(220,220,220,0.88)', color: '#000', fontSize: '0.73rem', fontWeight: 700, fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 10 }}>
                  {registeringFaceId ? 'Setting up…' : 'Enable Face ID'}
                </button>
                <button type="button" onClick={() => setShowLoader(true)}
                  style={{ width: '100%', padding: '11px', borderRadius: 1, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(200,200,200,0.40)', fontSize: '0.68rem', fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Skip for now
                </button>
              </div>
            ) : (
              <button type="submit" disabled={loading} className="enter-btn-marble">
                {loading ? 'Entering...' : 'Enter'}
              </button>
            )}

            {/* Authorized Personnel Only */}
            <p style={{
              fontSize: '0.54rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginTop: '1.1rem',
              marginBottom: '1.4rem',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              letterSpacing: '0.30em',
              color: 'rgba(180,180,180,0.38)',
            }}>
              Authorized personnel only
            </p>

            {/* Animated word — below Authorized Personnel */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ overflow: 'hidden', height: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p
                  key={`footer-${wordIndex}`}
                  className={phase === 'in' ? 'word-in' : 'word-out'}
                  style={{
                    color: 'rgba(160,160,160,0.30)',
                    fontSize: 'clamp(0.72rem, 3vw, 0.82rem)',
                    fontFamily: '"EB Garamond", Georgia, serif',
                    fontStyle: 'italic',
                    letterSpacing: '0.08em',
                    margin: 0,
                  }}
                >
                  {WORDS[wordIndex]}
                </p>
              </div>
            </div>

          </form>

          {/* Footer */}
          <p style={{
            color: 'rgba(160,160,160,0.18)',
            fontSize: '0.52rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: '0.5rem',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          }}>
            "Axios" — I am worthy
          </p>
        </div>

        {/* Bottom-left EST 1989 — near imperceptible */}
        <p style={{
          position: 'fixed', bottom: '1.4rem', left: '1.4rem',
          color: 'rgba(160,160,160,0.14)',
          fontSize: '0.52rem',
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          fontStyle: 'italic',
          zIndex: 10,
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        }}>Est 1989</p>

      </div>
    </>
  )
}
