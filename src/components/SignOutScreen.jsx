import { useEffect, useRef, useState } from 'react'

const MESSAGES = [
  'Saving your settings...',
  'Closing your session...',
  'Securing your data...',
  'Securely logging you out...',
  'See you soon.',
]

const CODE_CHARS = [
  '0x4F', '0xFF', '0x2A', '0x91', '0xB3', '0x7E',
  'null', 'void', 'sync', 'exit', 'term', 'kill',
  'const', '=>', '{}', '[]', '&&', '||',
  '1010', '0011', '1101', '0110', '1001', '0101',
  'SHA', 'AES', 'JWT', 'RSA', 'SSL', 'TLS',
  '...', ':::', '===', '!==', '>>>', '<<<',
]

export default function SignOutScreen({ onComplete }) {
  const canvasRef   = useRef(null)
  const [msgIndex,  setMsgIndex]  = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [progress,  setProgress]  = useState(0)
  const [fadeOut,   setFadeOut]   = useState(false)

  // — Code rain canvas —
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const cols   = Math.floor(window.innerWidth / 20)
    const drops  = Array(cols).fill(1)
    const speeds = Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.7)

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drops.forEach((y, i) => {
        const char  = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
        const alpha = 0.06 + Math.random() * 0.10
        ctx.fillStyle = `rgba(226,226,228,${alpha})`
        ctx.font = `${10 + Math.floor(Math.random() * 4)}px 'Courier New', monospace`
        ctx.fillText(char, i * 20, drops[i] * 20)

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += speeds[i]
      })

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // — Typewriter for current message —
  useEffect(() => {
    setDisplayed('')
    const msg = MESSAGES[msgIndex]
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(msg.slice(0, i + 1))
      i++
      if (i >= msg.length) clearInterval(interval)
    }, 38)
    return () => clearInterval(interval)
  }, [msgIndex])

  // — Message cycling + progress + completion —
  useEffect(() => {
    const totalDuration = 4500
    const msgInterval   = totalDuration / MESSAGES.length

    const progInterval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (totalDuration / 40))
        return next >= 100 ? 100 : next
      })
    }, 40)

    const timers = MESSAGES.map((_, i) =>
      setTimeout(() => setMsgIndex(i), i * msgInterval)
    )

    const fadeTimer = setTimeout(() => setFadeOut(true), totalDuration)
    const doneTimer = setTimeout(() => onComplete?.(), totalDuration + 600)

    return () => {
      clearInterval(progInterval)
      timers.forEach(clearTimeout)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>

      {/* Code rain */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Center vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at center, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.4) 55%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '2rem',
        width: '100%', maxWidth: '420px',
        padding: '0 2rem',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="32" height="27" viewBox="0 0 46 38" fill="none">
            <polygon points="0,36 16,2 22,14 9,36"  fill="white"/>
            <polygon points="13,36 26,8 32,22 20,36" fill="white" opacity="0.62"/>
            <polygon points="20,36 30,18 34,28 22,36" fill="white" opacity="0.32"/>
          </svg>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, transparent, #E2E2E4 30%, #E2E2E4 70%, transparent)', boxShadow: '0 0 8px rgba(226,226,228,0.5)' }} />
          <span style={{
            color: 'white', fontWeight: 900,
            fontSize: '1.8rem', letterSpacing: '0.22em',
            fontFamily: '"The Seasons", serif', lineHeight: 1,
            textShadow: '0 0 30px rgba(226,226,228,0.25)',
          }}>AXIOS</span>
        </div>

        {/* Terminal box */}
        <div style={{
          width: '100%',
          background: 'rgba(226,226,228,0.03)',
          border: '1px solid rgba(226,226,228,0.12)',
          borderRadius: '3px',
          padding: '1rem 1.25rem',
        }}>
          {/* Terminal header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '10px', paddingBottom: '8px',
            borderBottom: '1px solid rgba(226,226,228,0.08)',
          }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: `rgba(226,226,228,${0.1 + i * 0.07})`,
              }} />
            ))}
            <span style={{
              marginLeft: '6px', color: 'rgba(226,226,228,0.3)',
              fontSize: '0.55rem', letterSpacing: '0.2em',
              fontFamily: '"Courier New", monospace', textTransform: 'uppercase',
            }}>AXIOS.SYS — TERMINATING</span>
          </div>

          {/* Message line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              color: 'rgba(226,226,228,0.4)',
              fontSize: '0.65rem', fontFamily: '"Courier New", monospace',
            }}>{'>'}</span>
            <span style={{
              color: 'rgba(226,226,228,0.85)',
              fontSize: '0.72rem', fontFamily: '"Courier New", monospace',
              letterSpacing: '0.04em', minHeight: '1.1rem',
            }}>
              {displayed}
              <span style={{
                display: 'inline-block', width: '7px', height: '13px',
                background: 'rgba(226,226,228,0.7)',
                marginLeft: '2px', verticalAlign: 'middle',
                animation: 'blink 0.8s step-end infinite',
              }} />
            </span>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} style={{
                height: '1px',
                background: `rgba(226,226,228,${0.04 - i * 0.01})`,
                width: `${85 - i * 15}%`,
              }} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            width: '100%', height: '1px',
            background: 'rgba(226,226,228,0.08)',
            borderRadius: '1px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(to right, rgba(226,226,228,0.4), rgba(226,226,228,0.9))',
              boxShadow: '0 0 8px rgba(226,226,228,0.6)',
              transition: 'width 0.04s linear',
              borderRadius: '1px',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            color: 'rgba(226,226,228,0.25)', fontSize: '0.52rem',
            fontFamily: '"Courier New", monospace', letterSpacing: '0.1em',
          }}>
            <span>SECURE SHUTDOWN</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

      </div>

      <style>{`
        @font-face {
          font-family: 'The Seasons';
          src: url('/the-seasons-regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
