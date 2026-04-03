import { useEffect, useState } from 'react'

export default function SignOutScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true),    2800)
    const t2 = setTimeout(() => onComplete?.(),      3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#060608',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>
      <style>{`
        @font-face {
          font-family: 'The Seasons';
          src: url('/the-seasons-regular.ttf') format('truetype');
        }
        @keyframes axo-orb-drift {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          15%  { opacity:1; }
          50%  { transform:translate(18px,22px) scale(1.08); }
          85%  { opacity:1; }
          100% { opacity:0; transform:translate(-8px,40px) scale(0.95); }
        }
        @keyframes axo-rise {
          0%   { transform:translateY(0) translateX(0) scale(1); opacity:0; }
          10%  { opacity:1; }
          60%  { transform:translateY(-55vh) translateX(15px) scale(1.6); opacity:0.45; }
          100% { transform:translateY(-110vh) translateX(-10px) scale(2.2); opacity:0; }
        }
        @keyframes axo-scan {
          0%   { top:0%; opacity:0; }
          5%   { opacity:1; }
          95%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }
        @keyframes axo-bar {
          0%   { transform:translateX(-200%); }
          100% { transform:translateX(500%); }
        }
        @keyframes axo-pulse-text {
          0%, 100% { opacity:0.3; }
          50%       { opacity:1; }
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
            animation:`axo-orb-drift ${o.dur} linear infinite`,
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
            animation:`axo-rise ${s.dur} linear infinite`,
            animationDelay: s.delay,
          }}/>
        ))}
      </div>

      {/* ── Scanline ── */}
      <div style={{
        position:'absolute', width:'100%', height:'1px', top:0,
        background:'linear-gradient(90deg,transparent 0%,rgba(220,220,255,0.1) 30%,rgba(212,212,232,0.2) 50%,rgba(220,220,255,0.1) 70%,transparent 100%)',
        animation:'axo-scan 5s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:2,
        display:'flex', flexDirection:'column',
        alignItems:'center', gap:'1.5rem',
      }}>
        {/* Logo */}
        <svg viewBox="0 0 380 70" xmlns="http://www.w3.org/2000/svg"
          style={{ width:260, height:'auto', overflow:'visible' }}>
          <defs>
            <linearGradient id="ax-out-sg" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#3a3a42"/>
              <stop offset="42%"  stopColor="#8a8a96"/>
              <stop offset="50%"  stopColor="#ffffff"/>
              <stop offset="58%"  stopColor="#8a8a96"/>
              <stop offset="100%" stopColor="#3a3a42"/>
              <animate attributeName="x1" from="-380" to="380" dur="2.8s" repeatCount="indefinite"/>
              <animate attributeName="x2" from="0"    to="760" dur="2.8s" repeatCount="indefinite"/>
            </linearGradient>
          </defs>
          <polygon points="10,62 45,4 80,62"   fill="none" stroke="url(#ax-out-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
          <polygon points="22,62 45,20 68,62"  fill="none" stroke="url(#ax-out-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
          <text x="100" y="52" fontFamily="Georgia,'Times New Roman',serif" fontSize="42" fontWeight="700" letterSpacing="5" fill="url(#ax-out-sg)">AXIOS</text>
          <polygon points="300,62 335,4 370,62"  fill="none" stroke="url(#ax-out-sg)" strokeWidth="3.5" strokeLinejoin="round"/>
          <polygon points="312,62 335,20 358,62" fill="none" stroke="url(#ax-out-sg)" strokeWidth="2.5" strokeLinejoin="round"/>
        </svg>

        {/* Shimmer bar */}
        <div style={{ width:100, height:1, background:'rgba(200,200,220,0.08)', borderRadius:1, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:'40%',
            background:'linear-gradient(90deg,transparent,rgba(220,220,240,0.9),transparent)',
            animation:'axo-bar 2.4s ease-in-out infinite',
          }}/>
        </div>

        {/* Pulsing label */}
        <span style={{
          fontFamily:'"The Seasons",Georgia,serif',
          fontSize:13, letterSpacing:'3px',
          textTransform:'uppercase',
          color:'rgba(212,212,232,0.9)',
          animation:'axo-pulse-text 2s ease-in-out infinite',
        }}>
          Later
        </span>
      </div>
    </div>
  )
}
