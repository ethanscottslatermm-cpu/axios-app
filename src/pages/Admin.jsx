import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  active:    { bg: 'rgba(74,222,128,0.12)',  text: '#4ade80',  label: 'Active'    },
  suspended: { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24',  label: 'Suspended' },
  inactive:  { bg: 'rgba(156,163,175,0.12)', text: '#9ca3af',  label: 'Inactive'  },
  deleted:   { bg: 'rgba(248,113,113,0.12)', text: '#f87171',  label: 'Deleted'   },
}

const Ico = {
  back:    () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  users:   () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  shield:  () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  trash:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  pause:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  check:   () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevron: () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.active
  return (
    <span style={{
      background: s.bg, color: s.text,
      fontSize: 10, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 99,
    }}>{s.label}</span>
  )
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700,
      fontFamily: 'Helvetica Neue,sans-serif', flexShrink: 0,
    }}>{initials}</div>
  )
}

function SuspendPicker({ onConfirm, onCancel }) {
  const [days, setDays] = useState('3')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
      <input
        type="number" min="1" max="365" value={days}
        onChange={e => setDays(e.target.value)}
        style={{
          width: 64, padding: '7px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif',
          outline: 'none', textAlign: 'center',
        }}
      />
      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>days</span>
      <button onClick={() => onConfirm(parseInt(days) || 1)} style={{
        padding: '7px 14px', borderRadius: 8, border: 'none',
        background: '#fbbf24', color: '#000',
        fontSize: 12, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
      }}>Confirm</button>
      <button onClick={onCancel} style={{
        padding: '7px 14px', borderRadius: 8,
        border: '1px solid var(--border)', background: 'transparent',
        color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
      }}>Cancel</button>
    </div>
  )
}

function UserCard({ user, isSelf, onAction, expanded, onToggle }) {
  const [showSuspend, setShowSuspend] = useState(false)

  const suspendedUntil = user.suspended_until ? new Date(user.suspended_until) : null
  const stillSuspended = suspendedUntil && suspendedUntil > new Date()

  const handleSuspend = (days) => {
    const until = new Date()
    until.setDate(until.getDate() + days)
    onAction(user.id, 'suspend', until.toISOString())
    setShowSuspend(false)
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Main row */}
      <div
        onClick={isSelf ? undefined : onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', cursor: isSelf ? 'default' : 'pointer',
        }}
      >
        <Avatar name={user.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || 'Unnamed'}
            </p>
            {user.role === 'admin' && (
              <span style={{ color: 'var(--glow-bar)', display: 'flex', alignItems: 'center', gap: 3 }}>
                {Ico.shield()}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={user.status || 'active'} />
            {stillSuspended && (
              <p style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif' }}>
                until {suspendedUntil.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif' }}>
            {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
          </p>
          {!isSelf && (
            <div style={{ color: 'var(--text-faint)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              {Ico.chevron()}
            </div>
          )}
        </div>
      </div>

      {/* Actions panel */}
      {expanded && !isSelf && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', background: 'var(--bg-secondary)' }}>
          {showSuspend ? (
            <SuspendPicker onConfirm={handleSuspend} onCancel={() => setShowSuspend(false)} />
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Reactivate if suspended/inactive */}
              {(user.status === 'suspended' || user.status === 'inactive') && (
                <button onClick={() => onAction(user.id, 'activate')} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9,
                  border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)',
                  color: '#4ade80', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                }}>
                  {Ico.check()} Reactivate
                </button>
              )}

              {/* Suspend */}
              {user.status !== 'suspended' && (
                <button onClick={() => setShowSuspend(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9,
                  border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)',
                  color: '#fbbf24', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                }}>
                  {Ico.pause()} Suspend
                </button>
              )}

              {/* Set Inactive */}
              {user.status === 'active' && (
                <button onClick={() => onAction(user.id, 'inactive')} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                }}>
                  Set Inactive
                </button>
              )}

              {/* Delete */}
              <button onClick={() => onAction(user.id, 'delete')} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9,
                border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)',
                color: '#f87171', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
                marginLeft: 'auto',
              }}>
                {Ico.trash()} Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FILTERS = ['All', 'Active', 'Suspended', 'Inactive']

export default function Admin() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('All')
  const [expanded,  setExpanded]  = useState(null)
  const [visible,   setVisible]   = useState(false)
  const [confirm,   setConfirm]   = useState(null) // { id, action, payload }

  useEffect(() => {
    loadUsers()
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, name, role, status, suspended_until, created_at')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleAction = async (id, action, payload) => {
    if (action === 'delete') {
      if (confirm?.id === id && confirm?.action === 'delete') {
        // Second tap — confirmed
        await supabase.from('profiles').update({ status: 'deleted' }).eq('id', id)
        setConfirm(null)
        setExpanded(null)
        loadUsers()
      } else {
        setConfirm({ id, action: 'delete' })
        return
      }
    }

    if (action === 'suspend') {
      await supabase.from('profiles').update({ status: 'suspended', suspended_until: payload }).eq('id', id)
    }
    if (action === 'inactive') {
      await supabase.from('profiles').update({ status: 'inactive', suspended_until: null }).eq('id', id)
    }
    if (action === 'activate') {
      await supabase.from('profiles').update({ status: 'active', suspended_until: null }).eq('id', id)
    }

    setConfirm(null)
    setExpanded(null)
    loadUsers()
  }

  const filtered = users.filter(u => {
    if (filter === 'All')       return true
    if (filter === 'Active')    return u.status === 'active' || !u.status
    if (filter === 'Suspended') return u.status === 'suspended'
    if (filter === 'Inactive')  return u.status === 'inactive' || u.status === 'deleted'
    return true
  })

  const counts = {
    total:     users.length,
    active:    users.filter(u => !u.status || u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    inactive:  users.filter(u => u.status === 'inactive' || u.status === 'deleted').length,
  }

  const anim = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms`,
  })

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', WebkitFontSmoothing: 'antialiased', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--header-bg)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 9, background: 'var(--stat-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}>
          {Ico.back()}
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 2 }}>AXIOS</p>
          <h1 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: 18, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.01em' }}>Admin</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
          {Ico.users()}
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>{counts.total}</p>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Stat cards */}
        <div style={{ ...anim(0), display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Active',    value: counts.active,    color: '#4ade80' },
            { label: 'Suspended', value: counts.suspended, color: '#fbbf24' },
            { label: 'Inactive',  value: counts.inactive,  color: '#9ca3af' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ ...anim(60), display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: '9px 4px', borderRadius: 9,
              border: '1px solid var(--border)',
              background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 11, fontWeight: filter === f ? 700 : 400,
              fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer',
              letterSpacing: '0.06em',
            }}>{f}</button>
          ))}
        </div>

        {/* Delete confirm banner */}
        {confirm?.action === 'delete' && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#f87171', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif' }}>Tap Delete again to confirm removal.</p>
            <button onClick={() => setConfirm(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* User list */}
        <div style={{ ...anim(100), display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', padding: '32px 0' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', padding: '32px 0' }}>No users in this category.</p>
          ) : (
            filtered.map(u => (
              <UserCard
                key={u.id}
                user={u}
                isSelf={u.id === user?.id}
                expanded={expanded === u.id}
                onToggle={() => { setExpanded(expanded === u.id ? null : u.id); setConfirm(null) }}
                onAction={handleAction}
              />
            ))
          )}
        </div>

        <p style={{ color: 'var(--text-faint)', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', marginTop: 8 }}>
          AXIOS ADMIN · RESTRICTED
        </p>
      </div>
    </div>
  )
}
