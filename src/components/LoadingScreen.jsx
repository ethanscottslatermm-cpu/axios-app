import { useEffect, useState } from 'react'
import knightSrc from '../knight-loading.jpg'

export default function LoadingScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const TOTAL = 4800
    const t1 = setTimeout(() => setFadeOut(true), TOTAL)
    const t2 = setTimeout(() => onComplete?.(), TOTAL + 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#030c1c',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-end',
      overflow: 'hidden',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.7s ease',
    }}>
      <style>{`
        @font-face {
          font-family: 'The Seasons';
          src: url('/the-seasons-regular.ttf') format('truetype');
        }
        @keyframes ax-scan {
          0%   { top:0%; opacity:0; }
          5%   { opacity:1; }
          95%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }
        @keyframes ax-bar {
          0%   { transform:translateX(-260%); }
          100% { transform:translateX(620%); }
        }
        @keyframes ax-pulse-text {
          0%, 100% { opacity:0.28; }
          50%       { opacity:0.82; }
        }
        @keyframes ax-panel-rise {
          0%   { opacity:0; transform:translateY(22px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes ax-logo-in {
          0%   { opacity:0; filter:blur(6px); transform:translateY(6px); }
          100% { opacity:1; filter:blur(0);  transform:translateY(0); }
        }
        @keyframes ax-img-in {
          0%   { opacity:0; transform:scale(1.04); }
          100% { opacity:1; transform:scale(1.0); }
        }
        @keyframes ax-orb {
          0%,100% { opacity:0.6; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.12); }
        }
      `}</style>

      {/* ── Knight hero image ── */}
      <div style={{
        position: 'absolute', inset: 0,
        animation: 'ax-img-in 1.4s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <img
          src={knightSrc}
          alt=""
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: 'contrast(1.22) brightness(0.58) saturate(0.18)',
            display: 'block',
          }}
        />
      </div>

      {/* ── Blue tint + depth grade ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 90% 55% at 50% 0%,  rgba(30,70,180,0.28) 0%, transparent 65%)',
          'radial-gradient(ellipse 60% 70% at 10% 60%, rgba(10,40,120,0.20) 0%, transparent 60%)',
          'linear-gradient(to bottom, rgba(3,12,28,0.10) 0%, rgba(3,12,28,0.15) 55%, rgba(3,12,28,0.0) 100%)',
        ].join(','),
      }}/>

      {/* ── Vignette — dark edges, focus center ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 78% 88% at 50% 44%, transparent 30%, rgba(2,8,20,0.78) 100%)',
      }}/>

      {/* ── Ambient blue corona (top) ── */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '80%', height: 260,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(50,110,230,0.14) 0%, transparent 70%)',
        filter: 'blur(18px)',
        pointerEvents: 'none',
        animation: 'ax-orb 6s ease-in-out infinite',
      }}/>

      {/* ── Scanline sweep ── */}
      <div style={{
        position: 'absolute', width: '100%', height: '1px', top: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(120,170,255,0.10) 30%, rgba(180,210,255,0.22) 50%, rgba(120,170,255,0.10) 70%, transparent 100%)',
        animation: 'ax-scan 5.5s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>

      {/* ── Bottom glass panel ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '44%',
        background: 'linear-gradient(to bottom, rgba(3,12,28,0) 0%, rgba(3,12,28,0.72) 28%, rgba(3,12,28,0.97) 100%)',
        pointerEvents: 'none',
      }}/>

      {/* ── Glass card ── */}
      <div style={{
        position: 'relative', zIndex: 4,
        width: 'calc(100% - 40px)', maxWidth: 340,
        marginBottom: 48,
        padding: '32px 36px 28px',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.038)',
        backdropFilter: 'blur(36px)',
        WebkitBackdropFilter: 'blur(36px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: [
          'inset 0 1.5px 0 rgba(255,255,255,0.20)',
          'inset 0 -1px 0 rgba(255,255,255,0.04)',
          'inset 1px 0 rgba(255,255,255,0.06)',
          'inset -1px 0 rgba(255,255,255,0.06)',
          '0 12px 56px rgba(0,0,0,0.72)',
          '0 0 0 0.5px rgba(255,255,255,0.05)',
          '0 0 60px rgba(40,90,220,0.10)',
        ].join(','),
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem',
        animation: 'ax-panel-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both',
      }}>

        {/* Corner brackets */}
        {[
          { top:11, left:11,   borderTop:'1px solid rgba(255,255,255,0.30)', borderLeft:'1px solid rgba(255,255,255,0.30)'   },
          { top:11, right:11,  borderTop:'1px solid rgba(255,255,255,0.30)', borderRight:'1px solid rgba(255,255,255,0.30)'  },
          { bottom:11, left:11,  borderBottom:'1px solid rgba(255,255,255,0.30)', borderLeft:'1px solid rgba(255,255,255,0.30)'  },
          { bottom:11, right:11, borderBottom:'1px solid rgba(255,255,255,0.30)', borderRight:'1px solid rgba(255,255,255,0.30)' },
        ].map((c, i) => (
          <div key={i} style={{ position:'absolute', width:13, height:13, ...c }}/>
        ))}

        {/* AXIOS logo */}
        <div style={{
          animation: 'ax-logo-in 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s both',
          filter: 'drop-shadow(0 0 18px rgba(160,200,255,0.14)) drop-shadow(0 3px 10px rgba(0,0,0,0.70))',
        }}>
          <svg viewBox="0 0 380 70" xmlns="http://www.w3.org/2000/svg"
            style={{ width: 240, height: 'auto', overflow: 'visible' }}>
            <defs>
              <linearGradient id="ax-sg" x1="0" y1="0" x2="380" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#1e1e2e"/>
                <stop offset="33%"  stopColor="#7a7a90"/>
                <stop offset="45%"  stopColor="#c8c8e0"/>
                <stop offset="50%"  stopColor="#ffffff"/>
                <stop offset="55%"  stopColor="#c8c8e0"/>
                <stop offset="67%"  stopColor="#7a7a90"/>
                <stop offset="100%" stopColor="#1e1e2e"/>
                <animate attributeName="x1" from="-380" to="380" dur="2.4s" repeatCount="indefinite"/>
                <animate attributeName="x2" from="0"    to="760" dur="2.4s" repeatCount="indefinite"/>
              </linearGradient>
              <filter id="ax-glow" x="-30%" y="-80%" width="160%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <polygon points="10,62 45,4 80,62"   fill="none" stroke="url(#ax-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
            <polygon points="22,62 45,20 68,62"  fill="none" stroke="url(#ax-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
            <text x="100" y="52" fontFamily="Georgia,'Times New Roman',serif" fontSize="42" fontWeight="700"
              letterSpacing="5" fill="url(#ax-sg)" filter="url(#ax-glow)">AXIOS</text>
            <polygon points="300,62 335,4 370,62"  fill="none" stroke="url(#ax-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
            <polygon points="312,62 335,20 358,62" fill="none" stroke="url(#ax-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Divider */}
        <div style={{
          width: '100%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
        }}/>

        {/* Shimmer bar */}
        <div style={{ width: 110, height: 1, background: 'rgba(200,220,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '32%',
            background: 'linear-gradient(90deg, transparent, rgba(160,200,255,0.95), transparent)',
            animation: 'ax-bar 2.2s ease-in-out infinite',
          }}/>
        </div>

        {/* Label */}
        <span style={{
          fontFamily: '"The Seasons",Georgia,serif',
          fontSize: 11, letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(180,210,255,0.52)',
          animation: 'ax-pulse-text 2.2s ease-in-out infinite',
          WebkitFontSmoothing: 'antialiased',
        }}>
          Initializing
        </span>
      </div>
    </div>
  )
}
