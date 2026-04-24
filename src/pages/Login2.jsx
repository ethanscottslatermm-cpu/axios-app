import { useState, useEffect } from 'react'
import { webAuthnSupported, registerBiometric, hasRegisteredDevice } from '../hooks/useWebAuthn'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

const BG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMHBhUREhMTFhIXFyEZFRcYFxUWFhMWGRIXGRcYHRgaKCgiGRolJx8aIzEhJiosLi4uFx8zOjYtNyguLysBCgoKDQ0OFRAPFS0dFx0rLS0tKysrKy0tKysrKysrNzctKysuKzctLSsrKystNy0rNysuKy0rKysrKysrNysrLv/AABEIASwAqAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcDBAUCAQj/xAA6EAACAQMDAgQDBgMHBQAAAAAAAQIDBBEFEiEGMRNBUWEicYEHMkJikaEUFYIWI1KSscHRJDNTcqL/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREx/9oADAMBAAIRAxEAPwCjQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3NJ0+Wq6hCjDClJ928KKSy236JJmmdLRLmNnWlOUYy+FxSay47ljes8ZXv6gXJonQOn6esun/FVIY3JyU9ylNLfsXCws8c/day8ZNvUfs+03UKWxwhRk29sqbcZrEsSi4vdGeHx24K+6d6opWFeGJVKVOG7cobd9xmSlHxHJNZ8m+/D8sG5c9Q3NxQlUhaOvZQm5JVoxqxbbi1LLXxuPxx3LykWiK9a9J1elNRUJtTpz5p1I9pJd0/SS4yvcjpY3XXVMeoen0q0HTrLZKlCKxFLa0+/OGnL9IdvOuSAAAAAAAAAAAAAAAAAAAAB2dF6Xu9bpOVCjKcV3lmMY/rJrP0A4xsWMHWuFBd5cEttvs5uFa+JXlGl+XG+WPfHC/VnLutPho92nGTljPL+TEHf0DoqF7bRnmMnh4W74d8ZZccZ5j5bvZvHrIV0tLTNQoT8atb0Kk0pUXKSgstbqe98c84Xc4PRnUasq0VKrWhztWXmltlF7JtJYzB7vh4TT9iwa9pb6lRhcO6qTrU2quYybjthJ7sU1lRT5WeeeMtd7oorWr6d/qEpTlKWPhg3hNQi3tXBoE8177PqkqUa9m3Vp1KaqqLwpuMsN7ccSSz24fzITdW07Su4VIuM13T4a4yiDCAAAAAAAAAAAAAAAAAAN/RLD+Y6jGD+7n4vl6fMunprUoWlrRhFJU0mmuMbuMFO2FSenWXjJYbqQ2/milUzj2ykblHXa9nGO6D8LfuWU+fk/MuC9tVtoahRio5jLO5Si8OOP8AVPtgiXWHSivbRyjHE8d1xk6PSfUVLVLdOL580+69uOxLVCNSny+CcV+aLat/LbxwqwUkm8wlnbu7bseZYP2bWlXVt3h1J06EFJTUUs1t0UsJyWF657kp1DpC3vtX3Pw5cc8kz0fTael2myEVFew1ER6AvJVNBoQkmnbXUreSffw5boQz8t0V/QaX2q9FUbvS6t9Dcq1Oms4eVNRazleqWefZHU0qUaWpyiuPHqb16ZpX+H9cST/pJZVrJ0pZWYtPPpjakB+Swbmr2L03VatB96c5Rz67ZNJ/U0wAAAAAAAAAAAAAAbFhau8uowim235enma5Zf2PWFOd45zScpZUcrsotZ/XP7Ab+lW9O9p0/EhBOlxFPD247/8AH0I39peuLUbuFGKWKXfHr6GXq9VOn9eq0dsoqU26U/wyhJp9/PGcfQhM03VzPPLy2/nyUdHRNXq6TNunjMsLmLfZ54x2fkWr0d1HfarBbbWc15y4jH3w5YRX+lVKVnVhOdPdHOJZTSlF4w0+2e/b2Jf0VqLdNxnfeF8T2pwUuM8NttCiTa7QutP1aNyrXeti3qkm3Hl88fe93jyNG5+1Chb2zTUlPyi0+Hjs/Q2atxd2uvx/6m3hB0090pOUJtSlzGC5jld0Qv7UlGvW3y8GVVJZnSWFLLws559SCcaDBXui2FxL70G6ja/PSruS+WcP6I71KvKVnJpOW3yWOc1J5/ZLj3I10LceL0bQz+GO1/5tqX/0zq6RrEbHifetJ7P6KVFNfVt/uBSPV8/4zqms4ptymsJLLbcY8Y9TfoaJZaXilqFWrG4mvu0lGStPR1fWb/wRy0u/Pbp6hcUdP1y5r2z8WSm5VKkZJSoQm3F+BnOZJvmfkmkscyIhrFrG2qLE1PclKM08qcX5yXeM/VM0Ojq/RtxYp1KajXt9u+Nak04ygny8d015ry79kRw7XTfUlbQLjMJZpt5lTf3ZevHk8ef65OdqVxG7vp1IU404yeVCOdsfZZ8jI1gAAAAAAAAAALb+zzbBUmsbvCUvpmcX+rTz7xiVIS3ovVHC5p092JQb2P1hPDlH6SSkvnICa/blsen2748Te9vrtcPi/dRKwnOF5d05PjLSmvbK5LP+0jS56/0tSuoLNShndFc5pywpNY7tNJ/LPoV70rocdTqupVbVCH3sNKU3lJRTfblxy/f9LBcXRup2mrac6E4ra1hwnHiUe2Oe556X0a30zUp01bxnHL2TlHxHtz2bfmjraTZb7VOMtkUkko7eFjjmWWz1qEaumU/FcfHpr7zilGtT/NiKSqR9Ullfm7EV0HoFsrxzdGnJNLEXTg1H5cZXyK06+6SoU3Vq001Hyim9sXh54b4+RY1hq8buzU93C4b3Rx2ysS4TTWGn6M0Nbp0NTpxp1lNJvlZa48sy78+SWG/lyBBeldchZdKVKOHvhVk5PjEYbVOPHnnn/Ka/XkrijaQlCn/dOMkqkXum4+I96fnCPbOO6Sy/JWFLpmynGap28FKUds8OUU/NKSTw5efbPPuV/wDaHb3trp8MUnGnSeY1KblJxjhpqTwuOz7eQiK3oV50E5we3MXCWPxRaw+PNPz+RiUGqK4wnnn1xjhfLj9ROrO5qrc228Ln9judS7YW1pCCSSt1J483Ocm383goj0lhnk9yXJ5FHwAEAAAAAAAAAzWctl1Fvhbln5Z5MJ9TwwLp6X111KdGP3YyVenxnirCSnB8cvKbePYgfUmuJXlVUVGMJyUko8J/91uXzbcX9CPS1Os4YVSSSlvSi3FKe3blY7PHBr15+JPPsUWj019o8baat7mClTljbOPGMvCb9Mf7Ex/tFVUvDbjVy5Zj2lGMVl8fi480fnynU2TT74+nnksWnRnqOj3DW5XMKcLq3mm8qEW9yWOc8v8AYgk1lV/l/UjoN/BW+Hb5Sk5Zpy9m2/r8bfcw6Pa29rrTdJVFR3TzKrLijGOXOlTp5ezGPibSaWFzlsjFz1BLXdJo16aX8bbTUpQ7eJGKy5RS74cYtxXKUp447b+rdY0tV6dnPaqVxUi4TW14W9RVScZfizGKSXfL9OSiZ23VdKpqDjReaUXhzfwqUm3lLPd+bfuTO3lG6tstxaaPzdQjWq26nBSjGPFJYbefxSeOZTfnjsn5I2OneoLqzvtspznS53R3cLj1XZ/IYOr9qvSX9ntaVxRglbVe2GsQq4k3HHknjcvr6EX1iSnOliSklQpx45xiPKJH1N1ZX6o0F0qsY7aMoy3fibbcE0/r+5DH8MSxYw1DGe5vJjJUAAQAAAAAAAAAAB6isnw90lnPyPlRbZYA+y+5H9/1LH6Y1BUOsLNJ5jUtvCfvw5LPzcUVqdCw1J2uoUKvOaUov6RnkCSdU6M9KuqkqGYzozUvh4boTeaVRY84SzTf9Jho9WUVZJ1LOlO4WVmUYOlPP4tr5hLzxH4W88LJK+tX4ahdxjuVLMK0PKpb1e6ft/puz5EDuNKdG8/uXvUlvoZSfj03+HHbxI9nH2ePLIeq+r3fUtyqO57XwqdNbYJem2PdGC50h2d2oeJGX+NQllw9m48fuZ7Ccq11sqJUaWPjjCOzxFl4TfeSfPDeCVXKoQjCMUkkuySSXz9WUc7T7fd0tcqTy9rdNPuo03CTf6pENqSJ5YXUby/nQWNrt6qx89i/2ZXrZdV9b5PIBlAAAAAAAAAAAAABmt1lvPb/AJkjzWluqN+7/wBTwnhhvIB8M+Hqf3jyBYnSut/zazdGvOLlt2bcYcqajhf+z7rPfhHHjbqxvJ6fcNqnKW6hV/8AFN/dmvyyWFJfXjuRWE3Tmmm012a4aJZe3T1npunUrJOpGThuSw2ksrPuBnuNQq2FT+HvKKqSg8qWdlVJ8boVMNVIv8yfPmmaGo3a27oOTWOE1iUfmuU/mm/odPQrp63ovh18T8Pcqc3nfHbT3L4v2918kRjVJ8/U0Puj6tLS9SVbCk8NNN44awzQuWncS2/d3Pb8s8GStH+4izXJQABAAAAAAf/Z'


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
          backgroundSize: 'contain',
          backgroundPosition: 'center 5%',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(0.55px) contrast(1.12) brightness(0.82) saturate(0.9)',
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
              top: '19%', left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {/* Vertical accent line above text */}
            <div style={{
              width: 1, height: 16,
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.65), transparent)',
              marginBottom: 8,
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
