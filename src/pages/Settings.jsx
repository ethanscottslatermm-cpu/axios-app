import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Icons ─────────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function MailIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}
function LogOutIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', icon: Icon, disabled = false }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', color: 'rgba(255,255,255,0.35)',
        fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
        fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8,
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.09)'}`,
        borderRadius: 10, padding: '13px 16px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 1px rgba(255,255,255,0.08), 0 0 16px rgba(255,255,255,0.04)' : 'none',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
          <Icon />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
            fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif',
            WebkitTextFillColor: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
          }}
        />
      </div>
    </div>
  )
}

// ─── Section Divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 8 }}>
      <div style={{ width: 2, height: 14, background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.1))', borderRadius: 2, boxShadow: '0 0 6px rgba(255,255,255,0.5)' }} />
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 700 }}>{children}</p>
    </div>
  )
}

// ─── Main Settings Component ───────────────────────────────────────────────────
export default function Settings() {
  const navigate  = useNavigate()
  const { user, signOut } = useAuth()

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState(user?.email || '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  // Load existing profile from Supabase
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.name) setName(data.name)
      })
  }, [user])

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return }
    setError('')
    setSaving(true)
    try {
      // Upsert profile row
      const { error: dbErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name: name.trim() }, { onConflict: 'id' })
      if (dbErr) throw dbErr
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .axios-save-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.9) !important;
          box-shadow: 0 0 20px rgba(255,255,255,0.2) !important;
        }
        .axios-signout-btn:hover {
          background: rgba(255,50,50,0.06) !important;
          border-color: rgba(255,80,80,0.3) !important;
          color: rgba(255,120,120,0.8) !important;
        }
        .axios-back-btn:hover {
          background: rgba(255,255,255,0.06) !important;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080808', WebkitFontSmoothing: 'antialiased' }}>

        {/* Top Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <button
            onClick={() => navigate(-1)}
            className="axios-back-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 9,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <BackIcon />
          </button>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 2 }}>AXIOS</p>
            <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: '-0.01em' }}>Settings</h1>
          </div>
        </div>

        {/* Body */}
        <div style={{
          maxWidth: 520, width: '100%', margin: '0 auto',
          padding: '28px 20px 60px',
          animation: 'fadeUp 0.4s ease both',
        }}>

          {/* Profile section */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '22px 20px', marginBottom: 16,
          }}>
            <SectionLabel>Profile</SectionLabel>

            <Field label="Display Name" value={name} onChange={setName} icon={UserIcon} />
            <Field label="Email" value={email} onChange={() => {}} icon={MailIcon} disabled />

            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 18, marginTop: -8 }}>
              Email is managed through your Supabase account.
            </p>

            {error && (
              <p style={{ color: 'rgba(255,80,80,0.85)', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 14 }}>{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="axios-save-btn"
              style={{
                width: '100%', padding: '13px',
                background: saved ? 'rgba(255,255,255,0.15)' : '#fff',
                color: saved ? '#fff' : '#080808',
                border: saved ? '1px solid rgba(255,255,255,0.2)' : 'none',
                borderRadius: 9,
                fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
                fontFamily: 'Helvetica Neue, sans-serif',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {saved ? (
                <>
                  <CheckIcon />
                  Saved
                </>
              ) : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Account section */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '22px 20px',
          }}>
            <SectionLabel>Account</SectionLabel>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 14,
            }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>Signed in as</p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', marginTop: 2 }}>{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="axios-signout-btn"
              style={{
                width: '100%', padding: '13px',
                background: 'transparent',
                border: '1px solid rgba(255,80,80,0.18)',
                borderRadius: 9, color: 'rgba(255,80,80,0.5)',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                fontFamily: 'Helvetica Neue, sans-serif',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              }}
            >
              <LogOutIcon />
              Sign Out
            </button>
          </div>

          {/* Version tag */}
          <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center', marginTop: 32 }}>
            AXIOS · I Am Worthy
          </p>
        </div>
      </div>
    </>
  )
}
