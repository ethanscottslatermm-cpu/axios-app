import { useState } from 'react'

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
  paid:       '#4ade80',
  'due-soon': '#facc15',
  overdue:    '#f87171',
  upcoming:   'var(--text-muted)',
}

const STATUS_LABEL = {
  paid:       'Paid',
  'due-soon': 'Due Soon',
  overdue:    'Overdue',
  upcoming:   'Upcoming',
}

const ORDINAL = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th')

const BLANK_FORM = { payee: '', amount: '', due_day: '1', frequency: 'monthly', category: 'other', autopay: false, notes: '' }

function getStatus(bill) {
  const key   = new Date().toISOString().slice(0, 7)
  const today = new Date().getDate()
  if ((bill.paid_months || []).includes(key)) return 'paid'
  const diff = bill.due_day - today
  if (diff < 0)  return 'overdue'
  if (diff <= 5) return 'due-soon'
  return 'upcoming'
}

function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.32)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>{label}</label>
      <div style={{ background: 'var(--stat-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Helvetica Neue,sans-serif' }}
        />
      </div>
    </div>
  )
}

export default function BillsTab({ bills, saveBills }) {
  const [showSheet,  setShowSheet]  = useState(false)
  const [editBill,   setEditBill]   = useState(null)
  const [form,       setForm]       = useState(BLANK_FORM)
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const openAdd = () => {
    setEditBill(null)
    setForm(BLANK_FORM)
    setShowSheet(true)
  }

  const openEdit = (bill) => {
    setEditBill(bill)
    setForm({ payee: bill.payee, amount: String(bill.amount), due_day: String(bill.due_day), frequency: bill.frequency, category: bill.category, autopay: bill.autopay, notes: bill.notes })
    setShowSheet(true)
  }

  const save = () => {
    if (!form.payee.trim() || !form.amount) return
    const bill = {
      id:          editBill?.id || Date.now().toString(),
      payee:       form.payee.trim(),
      amount:      parseFloat(form.amount) || 0,
      due_day:     parseInt(form.due_day) || 1,
      frequency:   form.frequency,
      category:    form.category,
      autopay:     form.autopay,
      notes:       form.notes.trim(),
      paid_months: editBill?.paid_months || [],
    }
    saveBills(editBill ? bills.map(b => b.id === editBill.id ? bill : b) : [...bills, bill])
    setShowSheet(false)
  }

  const deleteBill = (id) => saveBills(bills.filter(b => b.id !== id))

  const togglePaid = (id) => {
    const key = new Date().toISOString().slice(0, 7)
    saveBills(bills.map(b => {
      if (b.id !== id) return b
      const paid = b.paid_months || []
      return { ...b, paid_months: paid.includes(key) ? paid.filter(m => m !== key) : [...paid, key] }
    }))
  }

  // Summary stats
  const monthly = bills.filter(b => b.frequency === 'monthly').reduce((s, b) => s + b.amount, 0)
  const overdue  = bills.filter(b => getStatus(b) === 'overdue').length
  const dueSoon  = bills.filter(b => getStatus(b) === 'due-soon').length

  const fmtUSD = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const canSave = form.payee.trim() && form.amount

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Monthly',   value: fmtUSD(monthly), alert: false },
          { label: 'Due Soon',  value: dueSoon,          alert: dueSoon > 0 },
          { label: 'Overdue',   value: overdue,           alert: overdue > 0 },
        ].map(({ label, value, alert }) => (
          <div key={label} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>{label}</p>
            <p style={{ color: alert ? (label === 'Overdue' ? '#f87171' : '#facc15') : 'var(--text-primary)', fontSize: 18, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Add bill button */}
      <button onClick={openAdd} style={{ width: '100%', padding: '12px', borderRadius: 11, border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add Bill
      </button>

      {/* Bills list */}
      {bills.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', textAlign: 'center', padding: '40px 0' }}>No bills yet. Add one above.</p>
      ) : (
        ['overdue', 'due-soon', 'upcoming', 'paid'].map(status => {
          const group = bills.filter(b => getStatus(b) === status)
          if (group.length === 0) return null
          return (
            <div key={status} style={{ marginBottom: 20 }}>
              <p style={{ color: STATUS_COLOR[status], fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 10 }}>
                {STATUS_LABEL[status]}
              </p>
              {group.map(bill => (
                <div key={bill.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bill.payee}</p>
                      {bill.autopay && (
                        <span style={{ fontSize: 9, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 5, padding: '2px 6px', letterSpacing: '0.08em', fontFamily: 'Helvetica Neue,sans-serif', flexShrink: 0 }}>AUTO</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>
                      {BILL_CATS[bill.category]} · Due the {ORDINAL(bill.due_day)} · {bill.frequency}
                    </p>
                    {bill.notes ? <p style={{ color: 'var(--text-faint)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', marginTop: 2 }}>{bill.notes}</p> : null}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{fmtUSD(bill.amount)}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => togglePaid(bill.id)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid ' + STATUS_COLOR[status], background: 'transparent', color: STATUS_COLOR[status], fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>
                        {status === 'paid' ? 'Undo' : 'Paid'}
                      </button>
                      <button onClick={() => openEdit(bill)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteBill(bill.id)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(248,113,113,0.25)', background: 'transparent', color: 'rgba(248,113,113,0.6)', fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })
      )}

      {/* Add / Edit Sheet */}
      {showSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'var(--overlay-bg)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderRadius: '18px 18px 0 0', padding: '20px 18px max(28px,env(safe-area-inset-bottom))', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99, margin: '0 auto 20px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 900, fontFamily: 'Helvetica Neue,sans-serif' }}>{editBill ? 'Edit Bill' : 'Add Bill'}</h2>
              <button onClick={() => setShowSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>✕</button>
            </div>

            <InputField label="Payee"         value={form.payee}   onChange={e => f('payee', e.target.value)}   placeholder="e.g. Verizon, Netflix, Rent" />
            <InputField label="Amount ($)"    type="number" value={form.amount}  onChange={e => f('amount', e.target.value)}  placeholder="0.00" />
            <InputField label="Due Day (1–31)" type="number" value={form.due_day} onChange={e => f('due_day', e.target.value)} placeholder="1" />

            {/* Frequency */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.32)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>Frequency</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['monthly', 'yearly', 'weekly', 'one-time'].map(freq => (
                  <button key={freq} onClick={() => f('frequency', freq)}
                    style={{ flex: 1, padding: '9px 4px', borderRadius: 9, border: '1px solid ' + (form.frequency === freq ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'), background: form.frequency === freq ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: form.frequency === freq ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: form.frequency === freq ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.04em' }}>
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.32)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Helvetica Neue,sans-serif', marginBottom: 6 }}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(BILL_CATS).map(([k, v]) => (
                  <button key={k} onClick={() => f('category', k)}
                    style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid ' + (form.category === k ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'), background: form.category === k ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: form.category === k ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Helvetica Neue,sans-serif', cursor: 'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-pay toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '12px 14px', background: 'var(--stat-bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Helvetica Neue,sans-serif', fontWeight: 600 }}>Auto-Pay</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Helvetica Neue,sans-serif' }}>Bill is paid automatically each cycle</p>
              </div>
              <div onClick={() => f('autopay', !form.autopay)}
                style={{ width: 40, height: 22, borderRadius: 11, background: form.autopay ? '#4ade80' : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.autopay ? 21 : 3, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </div>

            {/* Notes */}
            <InputField label="Notes (optional)" value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Account #, login info, reminders…" />

            <button onClick={save} disabled={!canSave}
              style={{ width: '100%', padding: '14px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.25)', background: canSave ? 'rgba(255,255,255,0.08)' : 'transparent', color: canSave ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 14, fontWeight: 700, fontFamily: 'Helvetica Neue,sans-serif', cursor: canSave ? 'pointer' : 'default', letterSpacing: '0.04em' }}>
              {editBill ? 'Save Changes' : 'Add Bill'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
