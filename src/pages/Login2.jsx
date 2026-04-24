import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

const BG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QBWRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAAEsAAAAAQAAASwAAAAB/+0ALFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAPHAFaAAMbJUccAQAAAgAEAP/hDW5odHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nIHg6eG1wdGs9J0ltYWdlOjpFeGlmVG9vbCAxMS44OCc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp0aWZmPSdodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyc+CiAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICA8dGlmZjpYUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpYUmVzb2x1dGlvbj4KICA8dGlmZjpZUmVzb2x1dGlvbj4zMDAvMTwvdGlmZjpZUmVzb2x1dGlvbj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIFN0b2NrIFBsYXRmb3JtPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcE1NPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vJz4KICA8eG1wTU06RG9jdW1lbnRJRD54bXAuaWlkOjJkODVhMjA0LTg4M2QtNGIzNi1iMmUyLTRlODk3ODIwNTVmMzwveG1wTU06RG9jdW1lbnRJRD4KICA8eG1wTU06SW5zdGFuY2VJRD5hZG9iZTpkb2NpZDpzdG9jazo0MTYyY2E4NC1jYjhmLTRkYjYtYTE4Ni1iNDBkZmVhMTdhNDc8L3htcE1NOkluc3RhbmNlSUQ+CiAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpzdG9jazo3Nzc1NDA4NTg8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSd3Jz8+/9sAQwAF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'


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

        {/* Embedded background — full image */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${BG})`,
          backgroundSize: 'auto 58%',
          backgroundPosition: '18% 4%',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.14) brightness(0.8) saturate(0.88)',
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

        {/* Bottom fade — starts higher to frame the full form zone */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '65%', zIndex: 1,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0) 100%)',
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
