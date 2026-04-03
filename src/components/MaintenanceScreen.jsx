export default function MaintenanceScreen() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      {/* Pulsing glow orb */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(148,163,184,0.2) 0%, transparent 70%)',
        border: '1px solid rgba(148,163,184,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
        animation: 'pulse 2.5s ease-in-out infinite',
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>

      <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: 9, letterSpacing: '0.34em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 14 }}>
        AXIOS
      </p>
      <h1 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 22, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', marginBottom: 12 }}>
        Updating & Optimizing
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, fontFamily: 'Helvetica Neue,sans-serif', lineHeight: 1.6, maxWidth: 280 }}>
        Axios is currently updating and optimizing performance. We'll be back shortly.
      </p>

      <div style={{ marginTop: 48, display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(148,163,184,0.4)',
            animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
