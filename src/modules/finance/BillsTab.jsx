import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const BILL_CATS = {
  rent:          'Rent / Mortgage',
  utilities:     'Utilities',
  insurance:     'Insurance',
  subscriptions: 'Subscriptions',
  loans:         'Loans',
  phone:         'Phone',
  internet:      'Internet',
  other:         'Other',
}

const STATUS_COLOR = {
  paid:       '#9ab89a',
  'due-soon': '#c4b490',
  overdue:    '#c4a0a0',
  upcoming:   'rgba(212,212,232,0.4)',
}

const STATUS_LABEL = {
  paid:       'Paid This Month',
  'due-soon': 'Due Soon',
  overdue:    'Overdue',
  upcoming:   'Upcoming',
}

const ORDINAL = n => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th')
const fmtUSD  = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const BLANK   = { payee: '', amount: '', due_day: '1', frequency: 'monthly', category: 'other', autopay: false, notes: '' }

function getStatus(bill) {
  const key   = new Date().toISOString().slice(0, 7)
  const today = new Date().getDate()
  if ((bill.paid_months || []).includes(key)) return 'paid'
  const diff = bill.due_day - today
  if (diff < 0)  return 'overdue'
  if (diff <= 5) return 'due-soon'
  return 'upcoming'
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', color: 'rgba(212,212,232,0.32)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
)

const InputBox = ({ type = 'text', value, onChange, placeholder, min, max }) => (
  <div style={{ background: 'var(--stat-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px' }}>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max}
      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Helvetica Neue,sans-serif' }} />
  </div>
)

export default function BillsTab({ userId }) {
  const [bills,     setBills]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [editBill,  setEditBill]  = useState(null)
  const [form,      setForm]      = useState(BLANK)
  const [error,     setError]     = useState('')

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_day', { ascending: true })
      .then(({ data, error: err }) => {
        if (!err) setBills(data || [])
        setLoading(false)
      })
  }, [userId])

  const openAdd = () => {
    setEditBill(null); setForm(BLANK); setError(''); setShowSheet(true)
  }

  const openEdit = (bill) => {
    setEditBill(bill)
    setForm({ payee: bill.payee, amount: String(bill.amount), due_day: String(bill.due_day), frequency: bill.frequency, category: bill.category, autopay: bill.autopay, notes: bill.notes || '' })
    setError(''); setShowSheet(true)
  }

  const handleSave = async () => {
    if (!form.payee.trim()) { setError('Payee is required.'); return }
    if (!form.amount)       { setError('Amount is required.'); return }
    setSaving(true); setError('')

    const payload = {
      user_id:     userId,
      payee:       form.payee.trim(),
      amount:      parseFloat(form.amount) || 0,
      due_day:     parseInt(form.due_day)  || 1,
      frequency:   form.frequency,
      category:    form.category,
      autopay:     form.autopay,
      notes:       form.notes.trim(),
      paid_months: editBill?.paid_months || [],
    }

    const result = editBill
      ? await supabase.from('bills').update(payload).eq('id', editBill.id).select().single()
      : await supabase.from('bills').insert(payload).select().single()

    if (result.error) { setError('Save failed: ' + result.error.message); setSaving(false); return }

    setBills(prev => editBill
      ? prev.map(b => b.id === editBill.id ? result.data : b)
      : [...prev, result.data]
    )
    setSaving(false); setShowSheet(false)
  }

  const deleteBill = async (id) => {
    await supabase.from('bills').delete().eq('id', id)
    setBills(prev => prev.filter(b => b.id !== id))
  }

  const togglePaid = async (id) => {
    const key  = new Date().toISOString().slice(0, 7)
    const bill = bills.find(b => b.id === id)
    if (!bill) return
    const paid    = bill.paid_months || []
    const updated = paid.includes(key) ? paid.filter(m => m !== key) : [...paid, key]
    const { data } = await supabase.from('bills').update({ paid_months: updated }).eq('id', id).select().single()
    if (data) setBills(prev => prev.map(b => b.id === id ? data : b))
  }

  const monthly  = bills.filter(b => b.frequency === 'monthly').reduce((s, b) => s + Number(b.amount), 0)
  const overdueN = bills.filter(b => getStatus(b) === 'overdue').length
  const dueSoonN = bills.filter(b => getStatus(b) === 'due-soon').length

  return (
    <>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Monthly',  val: fmtUSD(monthly), hi: false,          color: '' },
          { label: 'Due Soon', val: String(dueSoonN), hi: dueSoonN > 0,  color: '#c4b490' },
          { label: 'Overdue',  val: String(overdueN), hi: overdueN > 0,  color: '#c4a0a0' },
        ].map(({ label, val, hi, color }) => (
          <div key={label} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>{label}</p>
            <p style={{ color: hi ? color : 'var(--text-primary)', fontSize: 18, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Add Bill button */}
      <button onClick={openAdd} style={{ width: '100%', padding: '12px', borderRadius: 11, border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', background: 'rgba(212,212,232,0.05)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add Bill
      </button>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', padding: '32px 0' }}>Loading…</p>}

      {!loading && bills.length === 0 && (
        <p style={{ color: 'rgba(212,212,232,0.12)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', padding: '40px 0' }}>No bills yet. Tap Add Bill to get started.</p>
      )}

      {/* Bill groups */}
      {!loading && ['overdue', 'due-soon', 'upcoming', 'paid'].map(status => {
        const group = bills.filter(b => getStatus(b) === status)
        if (!group.length) return null
        return (
          <div key={status} style={{ marginBottom: 20 }}>
            <p style={{ color: STATUS_COLOR[status], fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 10 }}>{STATUS_LABEL[status]}</p>
            {group.map(bill => (
              <div key={bill.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bill.payee}</p>
                    {bill.autopay && <span style={{ fontSize: 9, background: 'rgba(154,184,154,0.12)', color: '#9ab89a', border: '1px solid rgba(154,184,154,0.25)', borderRadius: 5, padding: '2px 6px', letterSpacing: '0.08em', fontFamily: 'Helvetica Neue,sans-serif', flexShrink: 0 }}>AUTO</span>}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>{BILL_CATS[bill.category]} · Due the {ORDINAL(bill.due_day)} · {bill.frequency}</p>
                  {bill.notes ? <p style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 2 }}>{bill.notes}</p> : null}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>{fmtUSD(bill.amount)}</p>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => togglePaid(bill.id)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid ' + STATUS_COLOR[status], background: 'transparent', color: STATUS_COLOR[status], fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>{status === 'paid' ? 'Undo' : 'Paid'}</button>
                    <button onClick={() => openEdit(bill)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteBill(bill.id)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(196,160,160,0.25)', background: 'transparent', color: 'rgba(196,160,160,0.6)', fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {/* Add / Edit Sheet */}
      {showSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowSheet(false) }}>
          {/* Sheet panel — anchored to bottom, scrollable inside */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: 520, margin: '0 auto', maxHeight: 'calc(88vh - env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderRadius: '18px 18px 0 0' }}>

            {/* Drag handle + header */}
            <div style={{ flexShrink: 0, padding: '16px 18px 0' }}>
              <div style={{ width: 36, height: 4, background: 'rgba(212,212,232,0.15)', borderRadius: 99, margin: '0 auto 18px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{editBill ? 'Edit Bill' : 'Add Bill'}</h2>
                <button onClick={() => setShowSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(212,212,232,0.45)', fontSize: 22, lineHeight: 1 }}>✕</button>
              </div>
            </div>

            {/* Scrollable fields */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 18px' }}>

              <Field label="Payee">
                <InputBox value={form.payee} onChange={e => f('payee', e.target.value)} placeholder="e.g. Verizon, Netflix, Rent" />
              </Field>

              <Field label="Amount ($)">
                <InputBox type="number" value={form.amount} onChange={e => f('amount', e.target.value)} placeholder="0.00" />
              </Field>

              <Field label="Due Day of Month (1–31)">
                <InputBox type="number" value={form.due_day} onChange={e => f('due_day', e.target.value)} placeholder="1" min="1" max="31" />
              </Field>

              <Field label="Frequency">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['monthly', 'yearly', 'weekly', 'one-time'].map(freq => (
                    <button key={freq} onClick={() => f('frequency', freq)}
                      style={{ flex: 1, padding: '9px 4px', borderRadius: 9, border: '1px solid ' + (form.frequency === freq ? 'rgba(212,212,232,0.35)' : 'rgba(212,212,232,0.08)'), background: form.frequency === freq ? 'rgba(212,212,232,0.1)' : 'transparent', color: form.frequency === freq ? '#fff' : 'rgba(212,212,232,0.35)', fontSize: 9, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: form.frequency === freq ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.04em' }}>
                      {freq}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Category">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.entries(BILL_CATS).map(([k, v]) => (
                    <button key={k} onClick={() => f('category', k)}
                      style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid ' + (form.category === k ? 'rgba(212,212,232,0.35)' : 'rgba(212,212,232,0.08)'), background: form.category === k ? 'rgba(212,212,232,0.1)' : 'transparent', color: form.category === k ? '#fff' : 'rgba(212,212,232,0.35)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Auto-Pay">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--stat-bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif' }}>Bill is paid automatically</p>
                  <div onClick={() => f('autopay', !form.autopay)}
                    style={{ width: 40, height: 22, borderRadius: 11, background: form.autopay ? '#9ab89a' : 'rgba(212,212,232,0.12)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: form.autopay ? 21 : 3, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left 0.2s' }} />
                  </div>
                </div>
              </Field>

              <Field label="Notes (optional)">
                <InputBox value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Account #, website, reminders…" />
              </Field>

              {/* Bottom padding so last field clears footer */}
              <div style={{ height: 16 }} />
            </div>

            {/* Save footer — always pinned at bottom */}
            <div style={{ flexShrink: 0, padding: '14px 18px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)', borderTop: '1px solid rgba(212,212,232,0.08)' }}>
              {error && <p style={{ color: '#c4a0a0', fontSize: 12, fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 10, textAlign: 'center' }}>{error}</p>}
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: saving ? 'rgba(212,212,232,0.06)' : 'rgba(212,212,232,0.14)', color: saving ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 15, fontWeight: 800, fontFamily: 'Helvetica Neue,sans-serif', cursor: saving ? 'default' : 'pointer', letterSpacing: '0.02em' }}>
                {saving ? 'Saving…' : editBill ? 'Save Changes' : 'Save Bill'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
