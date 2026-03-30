const fs   = require('fs')
const path = require('path')
const file = path.join(__dirname, 'src/modules/finance/FinanceTracker.jsx')
let src = fs.readFileSync(file, 'utf8')

// 1. Add bills tab to tab bar
src = src.replace(
  `[['markets','Markets'],['bank','Bank'],['news','News']]`,
  `[['markets','Markets'],['bank','Bank'],['bills','Bills'],['news','News']]`
)

// 2. Add bills state after activeTab state
const STATE_ANCHOR = `  const [activeTab,   setActiveTab]   = useState('markets') // markets | bank | news`
const STATE_NEW    = `  const [activeTab,   setActiveTab]   = useState('markets') // markets | bank | news | bills
  // Bills state
  const [bills,       setBills]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('axios-bills') || '[]') } catch { return [] }
  })
  const [showAddBill, setShowAddBill] = useState(false)
  const [editBill,    setEditBill]    = useState(null)
  const [billForm,    setBillForm]    = useState({ payee:'', amount:'', due_day:'1', frequency:'monthly', category:'other', autopay:false, notes:'' })`

src = src.replace(STATE_ANCHOR, STATE_NEW)

// 3. Add saveBills helper + computed bills after loadBankData function
const SAVE_ANCHOR = `  const loadBankData = async () => {`
const SAVE_NEW = `  const saveBills = (updated) => {
    setBills(updated)
    localStorage.setItem('axios-bills', JSON.stringify(updated))
  }

  const addOrUpdateBill = () => {
    const b = {
      id:        editBill?.id || Date.now().toString(),
      payee:     billForm.payee.trim(),
      amount:    parseFloat(billForm.amount) || 0,
      due_day:   parseInt(billForm.due_day) || 1,
      frequency: billForm.frequency,
      category:  billForm.category,
      autopay:   billForm.autopay,
      notes:     billForm.notes.trim(),
      paid_months: editBill?.paid_months || [],
    }
    if (!b.payee) return
    const updated = editBill
      ? bills.map(x => x.id === editBill.id ? b : x)
      : [...bills, b]
    saveBills(updated)
    setShowAddBill(false); setEditBill(null)
    setBillForm({ payee:'', amount:'', due_day:'1', frequency:'monthly', category:'other', autopay:false, notes:'' })
  }

  const deleteBill = (id) => saveBills(bills.filter(b => b.id !== id))

  const togglePaid = (id) => {
    const key = new Date().toISOString().slice(0,7)
    saveBills(bills.map(b => {
      if (b.id !== id) return b
      const paid = b.paid_months || []
      return { ...b, paid_months: paid.includes(key) ? paid.filter(m => m !== key) : [...paid, key] }
    }))
  }

  const getBillStatus = (bill) => {
    const key = new Date().toISOString().slice(0,7)
    if ((bill.paid_months || []).includes(key)) return 'paid'
    const today = new Date().getDate()
    const diff  = bill.due_day - today
    if (diff < 0)  return 'overdue'
    if (diff <= 5) return 'due-soon'
    return 'upcoming'
  }

  const openEditBill = (bill) => {
    setEditBill(bill)
    setBillForm({ payee:bill.payee, amount:String(bill.amount), due_day:String(bill.due_day), frequency:bill.frequency, category:bill.category, autopay:bill.autopay, notes:bill.notes })
    setShowAddBill(true)
  }

  const BILL_CATS = { rent:'Rent/Mortgage', utilities:'Utilities', insurance:'Insurance', subscriptions:'Subscriptions', loans:'Loans', phone:'Phone', internet:'Internet', other:'Other' }
  const BILL_STATUS_COLOR = { paid:'#4ade80', 'due-soon':'#facc15', overdue:'#f87171', upcoming:'var(--text-muted)' }
  const BILL_STATUS_LABEL = { paid:'Paid', 'due-soon':'Due Soon', overdue:'Overdue', upcoming:'Upcoming' }

  const loadBankData = async () => {`

src = src.replace(SAVE_ANCHOR, SAVE_NEW)

// 4. Insert Bills tab panel before the News tab section
const NEWS_ANCHOR = `          <div style={anim(80)}>
            <SectionHead title="Market News" sub="General" />`

const BILLS_PANEL = `        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div>
            {/* Summary row */}
            {(() => {
              const now = new Date()
              const key = now.toISOString().slice(0,7)
              const today = now.getDate()
              const monthly  = bills.filter(b => b.frequency === 'monthly').reduce((s,b) => s + b.amount, 0)
              const overdue  = bills.filter(b => getBillStatus(b) === 'overdue').length
              const dueSoon  = bills.filter(b => getBillStatus(b) === 'due-soon').length
              return (
                <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                  {[
                    ['Monthly', '$' + monthly.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })],
                    ['Due Soon', dueSoon],
                    ['Overdue',  overdue],
                  ].map(([label, val], i) => (
                    <div key={label} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px 12px', textAlign:'center' }}>
                      <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</p>
                      <p style={{ color: i===2 && overdue > 0 ? '#f87171' : i===1 && dueSoon > 0 ? '#facc15' : 'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif' }}>{val}</p>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Add bill button */}
            <button onClick={() => { setEditBill(null); setBillForm({ payee:'', amount:'', due_day:'1', frequency:'monthly', category:'other', autopay:false, notes:'' }); setShowAddBill(true) }}
              style={{ width:'100%', padding:'12px', borderRadius:11, border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Bill
            </button>

            {/* Bills list */}
            {bills.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.12)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'40px 0' }}>No bills yet. Add one above.</p>
            ) : (
              ['overdue','due-soon','upcoming','paid'].map(status => {
                const group = bills.filter(b => getBillStatus(b) === status)
                if (group.length === 0) return null
                return (
                  <div key={status} style={{ marginBottom:20 }}>
                    <p style={{ color: BILL_STATUS_COLOR[status], fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:10 }}>
                      {BILL_STATUS_LABEL[status]}
                    </p>
                    {group.map((bill, i) => (
                      <div key={bill.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:12, padding:'14px 16px', marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                            <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bill.payee}</p>
                            {bill.autopay && <span style={{ fontSize:9, background:'rgba(74,222,128,0.12)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.25)', borderRadius:5, padding:'2px 6px', letterSpacing:'0.08em', fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>AUTO</span>}
                          </div>
                          <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
                            {BILL_CATS[bill.category]} · Due the {bill.due_day}{bill.due_day===1?'st':bill.due_day===2?'nd':bill.due_day===3?'rd':'th'} · {bill.frequency}
                          </p>
                          {bill.notes ? <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', marginTop:2 }}>{bill.notes}</p> : null}
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <p style={{ color:'var(--text-primary)', fontSize:16, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif' }}>{'$' + bill.amount.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}</p>
                          <div style={{ display:'flex', gap:6, marginTop:6, justifyContent:'flex-end' }}>
                            <button onClick={() => togglePaid(bill.id)} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, border:'1px solid ' + BILL_STATUS_COLOR[status], background:'transparent', color:BILL_STATUS_COLOR[status], fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                              {status === 'paid' ? 'Undo' : 'Paid'}
                            </button>
                            <button onClick={() => openEditBill(bill)} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>Edit</button>
                            <button onClick={() => deleteBill(bill.id)} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, border:'1px solid rgba(248,113,113,0.25)', background:'transparent', color:'rgba(248,113,113,0.6)', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
            )}

            {/* Add/Edit Bill Sheet */}
            {showAddBill && (
              <div style={{ position:'fixed', inset:0, zIndex:300, background:'var(--overlay-bg)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end' }}>
                <div style={{ width:'100%', maxWidth:520, margin:'0 auto', background:'var(--bg-secondary)', borderTop:'1px solid var(--border)', borderRadius:'18px 18px 0 0', padding:'20px 18px max(28px,env(safe-area-inset-bottom))', maxHeight:'90vh', overflowY:'auto' }}>
                  <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:99, margin:'0 auto 20px' }}/>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <h2 style={{ color:'var(--text-primary)', fontSize:17, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif' }}>{editBill ? 'Edit Bill' : 'Add Bill'}</h2>
                    <button onClick={() => setShowAddBill(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:20 }}>✕</button>
                  </div>

                  {[
                    ['Payee', 'text',   'payee',   'e.g. Verizon, Rent, Netflix'],
                    ['Amount ($)', 'number', 'amount', '0.00'],
                    ['Due Day (1–31)', 'number', 'due_day', '1'],
                  ].map(([label, type, field, ph]) => (
                    <div key={field} style={{ marginBottom:14 }}>
                      <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</label>
                      <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'11px 14px' }}>
                        <input type={type} value={billForm[field]} onChange={e => setBillForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph}
                          style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }}/>
                      </div>
                    </div>
                  ))}

                  {/* Frequency */}
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Frequency</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {['monthly','yearly','weekly','one-time'].map(f => (
                        <button key={f} onClick={() => setBillForm(x => ({ ...x, frequency:f }))}
                          style={{ flex:1, padding:'9px 4px', borderRadius:9, border:'1px solid ' + (billForm.frequency===f ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'), background: billForm.frequency===f ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: billForm.frequency===f ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', fontWeight: billForm.frequency===f ? 700 : 400, cursor:'pointer', letterSpacing:'0.04em', textTransform:'capitalize' }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Category</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {Object.entries(BILL_CATS).map(([k, v]) => (
                        <button key={k} onClick={() => setBillForm(x => ({ ...x, category:k }))}
                          style={{ padding:'8px 12px', borderRadius:9, border:'1px solid ' + (billForm.category===k ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'), background: billForm.category===k ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: billForm.category===k ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Autopay toggle */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, padding:'12px 14px', background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:10 }}>
                    <div>
                      <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600 }}>Auto-Pay</p>
                      <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>Paid automatically each cycle</p>
                    </div>
                    <div onClick={() => setBillForm(f => ({ ...f, autopay:!f.autopay }))}
                      style={{ width:40, height:22, borderRadius:11, background: billForm.autopay ? '#4ade80' : 'rgba(255,255,255,0.12)', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                      <div style={{ position:'absolute', top:3, left: billForm.autopay ? 21 : 3, width:16, height:16, borderRadius:8, background:'#fff', transition:'left 0.2s' }}/>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Notes (optional)</label>
                    <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', borderRadius:10, padding:'11px 14px' }}>
                      <input value={billForm.notes} onChange={e => setBillForm(f => ({ ...f, notes:e.target.value }))} placeholder="Account #, login info, etc."
                        style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }}/>
                    </div>
                  </div>

                  <button onClick={addOrUpdateBill} disabled={!billForm.payee.trim() || !billForm.amount}
                    style={{ width:'100%', padding:'14px', borderRadius:11, border:'1px solid rgba(255,255,255,0.25)', background: billForm.payee.trim() && billForm.amount ? 'rgba(255,255,255,0.08)' : 'transparent', color: billForm.payee.trim() && billForm.amount ? 'var(--text-primary)' : 'var(--text-muted)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', cursor: billForm.payee.trim() && billForm.amount ? 'pointer' : 'default', letterSpacing:'0.04em' }}>
                    {editBill ? 'Save Changes' : 'Add Bill'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

          <div style={anim(80)}>
            <SectionHead title="Market News" sub="General" />`

src = src.replace(NEWS_ANCHOR, BILLS_PANEL)

fs.writeFileSync(file, src, 'utf8')
console.log('Done.')
console.log('Bills tab:', src.includes("'bills','Bills'") ? 'YES' : 'MISSING')
console.log('saveBills:', src.includes('saveBills') ? 'YES' : 'MISSING')
console.log('togglePaid:', src.includes('togglePaid') ? 'YES' : 'MISSING')
console.log('Add Bill sheet:', src.includes('Add Bill') ? 'YES' : 'MISSING')
