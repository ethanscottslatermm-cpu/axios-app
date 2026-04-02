import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

const WORDS = ['Accountability.', 'Discipline.', 'Personal ownership.']

const styles = `
  @font-face {
    font-family: 'The Seasons';
    src: url('/the-seasons-regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@0;1&display=swap');

  @keyframes l2-fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes l2-fadeOutUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-12px); }
  }
  @keyframes l2-borderPulse {
    0%,100% { border-color: rgba(255,255,255,0.28); box-shadow: none; }
    50%     { border-color: rgba(255,255,255,0.50); box-shadow: 0 0 10px rgba(255,255,255,0.08); }
  }
  @keyframes l2-btnShine {
    0%   { background-position: -300% center; }
    60%,100% { background-position: 300% center; }
  }
  @keyframes l2-scan {
    0%   { transform: translateY(-100vh); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  .l2-word-in  { animation: l2-fadeInUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
  .l2-word-out { animation: l2-fadeOutUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

  .l2-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.32);
    border-radius: 2px;
    color: rgba(255,255,255,0.88);
    padding: 13px 14px 13px 38px;
    font-size: 0.90rem;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    outline: none;
    -webkit-appearance: none;
    transition: border-color 0.25s, background 0.25s;
    caret-color: white;
    animation: l2-borderPulse 4s ease-in-out infinite;
    backdrop-filter: blur(1px);
    -webkit-backdrop-filter: blur(1px);
  }
  .l2-input:focus {
    border-color: rgba(255,255,255,0.75);
    background: rgba(0,0,0,0.48);
    animation: none;
    box-shadow: 0 0 14px rgba(255,255,255,0.10);
  }
  .l2-input::placeholder {
    color: rgba(255,255,255,0.20);
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
  }

  .l2-btn {
    width: 100%;
    background: #111;
    color: rgba(255,255,255,0.95);
    border: 1px solid rgba(255,255,255,0.28);
    border-radius: 2px;
    padding: 15px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: 'Helvetica Neue', Helvetica, sans-serif;
    -webkit-appearance: none;
    transition: box-shadow 0.25s, transform 0.15s, border-color 0.25s;
    text-shadow: 0 0 12px rgba(255,255,255,0.50), 0 0 28px rgba(255,255,255,0.18);
    background-image: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 65%);
    background-size: 300% 100%;
    animation: l2-btnShine 5s ease-in-out infinite;
  }
  .l2-btn:hover  { transform: translateY(-1px); border-color: rgba(255,255,255,0.55); box-shadow: 0 0 20px rgba(255,255,255,0.14); }
  .l2-btn:active { transform: translateY(0); box-shadow: none; }
  .l2-btn:disabled { opacity: 0.35; cursor: not-allowed; animation: none; }
`

export default function Login2() {
  const { signIn, user: authUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [showLoader, setShowLoader]         = useState(false)
  const [wordIndex, setWordIndex]           = useState(0)
  const [phase, setPhase]                   = useState('in')
  const [offerFaceId, setOfferFaceId]       = useState(false)
  const [registeringFaceId, setRegisteringFaceId] = useState(false)

  useEffect(() => {
    const cycle = () => {
      setPhase('out')
      setTimeout(() => {
        setWordIndex(i => (i + 1) % WORDS.length)
        setPhase('in')
      }, 700)
    }
    const id = setInterval(cycle, 7000)
    return () => clearInterval(id)
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

      <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Aristotle bust — full screen, top-anchored to show face */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url('/aristotle-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: '50% 15%',
          backgroundRepeat: 'no-repeat',
        }} />

        {/* Darkening overlay — bottom heavy so UI area is darker */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.90) 100%)',
        }} />

        {/* Subtle top fade */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '15%', zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)',
        }} />

        {/* Scanline */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '2px', zIndex: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.025), transparent)',
          animation: 'l2-scan 16s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* ── Content ── */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%', maxWidth: '400px',
          padding: '2rem 1.5rem',
          margin: '0 auto',
        }}>

          {/* AXIOS brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '7px' }}>
              <svg width="34" height="28" viewBox="0 0 46 38" fill="none">
                <polygon points="0,36 16,2 22,14 9,36"  fill="rgba(195,195,197,0.58)" />
                <polygon points="13,36 26,8 32,22 20,36" fill="rgba(195,195,197,0.36)" />
                <polygon points="20,36 30,18 34,28 22,36" fill="rgba(195,195,197,0.18)" />
              </svg>
              <div style={{ width: '1px', height: '34px', background: 'linear-gradient(to bottom, transparent, rgba(195,195,197,0.42) 30%, rgba(195,195,197,0.42) 70%, transparent)' }} />
              <span style={{
                color: 'rgba(205,205,207,0.75)',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 8vw, 2.6rem)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                lineHeight: 1,
                fontFamily: '"The Seasons", serif',
                textShadow: '-1px -1px 1px rgba(255,255,255,0.08), 1px 1px 3px rgba(0,0,0,0.95)',
              }}>AXIOS</span>
            </div>

            {/* I AM WORTHY */}
            <p style={{ color: 'rgba(195,195,197,0.45)', fontSize: '0.54rem', letterSpacing: '0.44em', textTransform: 'uppercase', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', margin: '0 0 4px 0' }}>
              I Am Worthy
            </p>

            {/* EST. 1989 */}
            <p style={{ color: 'rgba(195,195,197,0.30)', fontSize: '0.52rem', letterSpacing: '0.32em', textTransform: 'uppercase', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', margin: 0 }}>
              Est. 1989
            </p>
          </div>

          {/* Animated italic word */}
          <div style={{ textAlign: 'center', marginBottom: '0.4rem', height: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <p
              key={wordIndex}
              className={phase === 'in' ? 'l2-word-in' : 'l2-word-out'}
              style={{
                color: 'rgba(190,190,192,0.58)',
                fontSize: 'clamp(1.05rem, 4.2vw, 1.28rem)',
                fontFamily: '"EB Garamond", Georgia, serif',
                fontStyle: 'italic',
                letterSpacing: '0.05em',
                margin: 0,
                textShadow: '0 1px 10px rgba(0,0,0,0.85)',
              }}
            >
              {WORDS[wordIndex]}
            </p>
          </div>

          {/* Ornamental divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.6rem' }}>
            <span style={{ color: 'rgba(170,170,172,0.30)', fontSize: '0.55rem' }}>—</span>
            <div style={{ width: '18px', height: '1px', background: 'rgba(170,170,172,0.28)' }} />
            <span style={{ color: 'rgba(170,170,172,0.30)', fontSize: '0.55rem' }}>—</span>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>

            {/* SECURE ACCESS */}
            <p style={{ fontSize: '0.54rem', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.42em', color: 'rgba(200,200,202,0.60)', fontFamily: '"Helvetica Neue", Helvetica, sans-serif', margin: '0 0 1.4rem 0' }}>
              Secure Access
            </p>

            {/* Email */}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', color: 'rgba(190,190,192,0.35)', fontSize: '0.54rem', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: '5px', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" autoComplete="off" required className="l2-input" />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', color: 'rgba(190,190,192,0.35)', fontSize: '0.54rem', letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: '5px', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" required className="l2-input" />
              </div>
            </div>

            {error && (
              <p style={{ color: 'rgba(255,90,90,0.80)', fontSize: '0.72rem', marginBottom: '1rem', textAlign: 'center', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>{error}</p>
            )}

            {offerFaceId ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(200,200,202,0.68)', fontSize: '0.75rem', fontFamily: '"Helvetica Neue",sans-serif', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  Enable Face ID for faster sign-in?
                </p>
                <button type="button" onClick={handleRegisterFaceId} disabled={registeringFaceId}
                  style={{ width: '100%', padding: '13px', borderRadius: 2, border: 'none', background: 'rgba(215,215,215,0.88)', color: '#000', fontSize: '0.72rem', fontWeight: 700, fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 10 }}>
                  {registeringFaceId ? 'Setting up…' : 'Enable Face ID'}
                </button>
                <button type="button" onClick={() => setShowLoader(true)}
                  style={{ width: '100%', padding: '11px', borderRadius: 2, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: 'rgba(195,195,195,0.40)', fontSize: '0.68rem', fontFamily: '"Helvetica Neue",sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Skip for now
                </button>
              </div>
            ) : (
              <button type="submit" disabled={loading} className="l2-btn">
                {loading ? 'Entering...' : 'Enter'}
              </button>
            )}

            {/* AUTHORIZED PERSONNEL ONLY */}
            <p style={{ fontSize: '0.52rem', textTransform: 'uppercase', textAlign: 'center', marginTop: '1rem', letterSpacing: '0.28em', color: 'rgba(170,170,172,0.38)', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
              Authorized personnel only
            </p>

          </form>

          {/* "AXIOS" — I AM WORTHY footer */}
          <p style={{ color: 'rgba(150,150,152,0.22)', fontSize: '0.50rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '1.8rem', fontFamily: '"Helvetica Neue", Helvetica, sans-serif' }}>
            "Axios" — I am worthy
          </p>

        </div>

        {/* Bottom-left EST 1989 */}
        <p style={{ position: 'fixed', bottom: '1.4rem', left: '1.4rem', color: 'rgba(150,150,152,0.20)', fontSize: '0.50rem', letterSpacing: '0.20em', textTransform: 'uppercase', fontStyle: 'italic', zIndex: 10, fontFamily: '"Helvetica Neue", Helvetica, sans-serif', margin: 0 }}>
          Est 1989
        </p>

        {/* Bottom-right sparkle */}
        <svg style={{ position: 'fixed', bottom: '1.2rem', right: '1.4rem', zIndex: 10, opacity: 0.22 }} width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
        </svg>

      </div>
    </>
  )
}
