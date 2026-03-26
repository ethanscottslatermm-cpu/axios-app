import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFoodLog } from '../../hooks/useFoodLog'
import { BottomNav } from '../../pages/Dashboard'

// ── Date ───────────────────────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0]

// ── Constants ──────────────────────────────────────────────────────────────────
const CALORIE_GOAL = 2200
const MEAL_TYPES   = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const MEAL_ICONS = {
  Breakfast: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Lunch:     (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  Dinner:    (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Snack:     (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="m19 10 2 2-4 4"/></svg>,
}

// ── Shared Icons ───────────────────────────────────────────────────────────────
const Ico = {
  back:    (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  search:  (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  plus:    (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  trash:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  close:   (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  spark:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  check:   (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
}

// ── Glow Progress Bar ──────────────────────────────────────────────────────────
function GlowBar({ pct, h = 4, color = '#fff' }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color, borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1)', boxShadow:`0 0 8px rgba(255,255,255,0.5)` }} />
    </div>
  )
}

// ── Macro Pill ─────────────────────────────────────────────────────────────────
function MacroPill({ label, value, unit = 'g' }) {
  return (
    <div style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 10px' }}>
      <p style={{ color:'rgba(255,255,255,0.28)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{label}</p>
      <p style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{value}<span style={{ fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.4)', marginLeft:2 }}>{unit}</span></p>
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHead({ title, count }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:'linear-gradient(to bottom,rgba(255,255,255,0.8),rgba(255,255,255,0.1))', borderRadius:2, boxShadow:'0 0 6px rgba(255,255,255,0.5)' }} />
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {count != null && <p style={{ color:'rgba(255,255,255,0.22)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{count} {count === 1 ? 'item' : 'items'}</p>}
    </div>
  )
}

// ── AI Search Panel ────────────────────────────────────────────────────────────
function AISearchPanel({ onSelect, onClose }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError(''); setResults([])
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a nutrition database. When given a food query, respond ONLY with a JSON array (no markdown, no explanation) of up to 5 food items. Each item must have: name (string), calories (number, per serving), protein (number, grams), carbs (number, grams), fat (number, grams), serving (string describing the serving size). Be accurate and realistic. Example format: [{"name":"Grilled Chicken Breast","calories":165,"protein":31,"carbs":0,"fat":3.6,"serving":"3.5 oz / 100g"}]`,
          messages: [{ role: 'user', content: query }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResults(Array.isArray(parsed) ? parsed : [])
    } catch {
      setError('Could not fetch results. Try again or add manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = e => { if (e.key === 'Enter') search() }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
      display:'flex', flexDirection:'column', padding:'0 0 env(safe-area-inset-bottom)',
    }}>
      {/* Header */}
      <div style={{ padding:'16px 16px 0', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:14 }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:11, padding:'11px 14px' }}>
          <div style={{ color:'rgba(255,255,255,0.4)' }}>{Ico.spark()}</div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search any food…"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:15, fontFamily:'Helvetica Neue,sans-serif' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', display:'flex' }}>
              {Ico.close()}
            </button>
          )}
        </div>
        <button onClick={search} disabled={loading || !query.trim()}
          style={{ background:'#fff', color:'#080808', border:'none', borderRadius:9, padding:'11px 16px', fontSize:12, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', opacity: loading || !query.trim() ? 0.5 : 1, whiteSpace:'nowrap' }}>
          {loading ? '…' : 'Search'}
        </button>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex' }}>
          {Ico.close(20)}
        </button>
      </div>

      {/* AI badge */}
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ color:'rgba(255,255,255,0.35)' }}>{Ico.spark()}</div>
        <p style={{ color:'rgba(255,255,255,0.28)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.06em' }}>AI-powered nutrition lookup · tap a result to add it</p>
      </div>

      {/* Results */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 16px 16px' }}>
        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em' }}>Looking up nutrition data…</p>
          </div>
        )}
        {error && <p style={{ color:'rgba(255,100,100,0.8)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'20px 0' }}>{error}</p>}
        {!loading && results.length === 0 && !error && query && (
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'32px 0', fontStyle:'italic' }}>No results yet — hit Search</p>
        )}
        {!loading && results.length === 0 && !error && !query && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <p style={{ color:'rgba(255,255,255,0.12)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.7 }}>Try "grilled salmon", "oatmeal with banana",<br/>or any food you ate today.</p>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {results.map((item, i) => (
            <button key={i} onClick={() => onSelect(item)}
              style={{
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12,
                padding:'14px 16px', textAlign:'left', cursor:'pointer', width:'100%',
                transition:'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)' }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <p style={{ color:'#fff', fontSize:14, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{item.name}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{item.serving}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ color:'#fff', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{item.calories}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>cal</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {[['P', item.protein], ['C', item.carbs], ['F', item.fat]].map(([l, v]) => (
                  <div key={l} style={{ flex:1, background:'rgba(255,255,255,0.05)', borderRadius:7, padding:'6px 8px', textAlign:'center' }}>
                    <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, letterSpacing:'0.15em', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{l}</p>
                    <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{v}g</p>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Manual Add Sheet ───────────────────────────────────────────────────────────
function ManualAddSheet({ prefill = null, mealType, onSave, onClose }) {
  const [form, setForm] = useState({
    food_name: prefill?.name    || '',
    calories:  prefill?.calories?.toString() || '',
    protein:   prefill?.protein?.toString()  || '',
    carbs:     prefill?.carbs?.toString()    || '',
    fat:       prefill?.fat?.toString()      || '',
    meal_type: mealType || 'Breakfast',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.food_name.trim()) { setError('Food name is required.'); return }
    if (!form.calories || isNaN(form.calories)) { setError('Please enter calories.'); return }
    setError(''); setSaving(true)
    try {
      await onSave({
        food_name: form.food_name.trim(),
        calories:  parseInt(form.calories),
        protein:   parseFloat(form.protein)  || 0,
        carbs:     parseFloat(form.carbs)    || 0,
        fat:       parseFloat(form.fat)      || 0,
        meal_type: form.meal_type,
      })
      onClose()
    } catch (e) {
      setError(e.message || 'Failed to save.')
      setSaving(false)
    }
  }

  const InputRow = ({ label, field, type='text', placeholder='' }) => {
    const [focused, setFocused] = useState(false)
    return (
      <div style={{ marginBottom:12 }}>
        <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</label>
        <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${focused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.09)'}`, borderRadius:10, padding:'12px 14px', transition:'border-color 0.2s,box-shadow 0.2s', boxShadow: focused ? '0 0 0 1px rgba(255,255,255,0.07)' : 'none' }}>
          <input
            type={type}
            value={form[field]}
            onChange={e => set(field, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'flex', alignItems:'flex-end',
    }}>
      <div style={{
        width:'100%', maxWidth:520, margin:'0 auto',
        background:'#0e0e0e', borderTop:'1px solid rgba(255,255,255,0.1)',
        borderRadius:'18px 18px 0 0', padding:'20px 18px max(24px,env(safe-area-inset-bottom))',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.35s cubic-bezier(.16,1,.3,1)',
        maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* Handle */}
        <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:99, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ color:'#fff', fontSize:17, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>
            {prefill ? 'Confirm & Add' : 'Add Food'}
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {/* Meal type selector */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Meal</label>
          <div style={{ display:'flex', gap:8 }}>
            {MEAL_TYPES.map(m => (
              <button key={m} onClick={() => set('meal_type', m)}
                style={{ flex:1, padding:'9px 4px', borderRadius:9, border:`1px solid ${form.meal_type===m ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`, background: form.meal_type===m ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: form.meal_type===m ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight: form.meal_type===m ? 700 : 400, cursor:'pointer', transition:'all 0.18s', textAlign:'center', letterSpacing:'0.04em' }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <InputRow label="Food Name" field="food_name" placeholder="e.g. Grilled salmon" />
        <InputRow label="Calories" field="calories" type="number" placeholder="350" />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:4 }}>
          {[['Protein (g)', 'protein', '32'], ['Carbs (g)', 'carbs', '0'], ['Fat (g)', 'fat', '14']].map(([label, field, ph]) => (
            <div key={field}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</label>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, padding:'11px 12px' }}>
                <input type="number" value={form[field]} onChange={e => set(field, e.target.value)} placeholder={ph}
                  style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }} />
              </div>
            </div>
          ))}
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12, marginTop:10 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', padding:'15px', background:'#fff', color:'#080808', border:'none', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s,box-shadow 0.2s' }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background='rgba(255,255,255,0.88)'; e.currentTarget.style.boxShadow='0 0 22px rgba(255,255,255,0.2)' }}}
          onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.boxShadow='none' }}
        >
          {saving ? 'Saving…' : <>{Ico.check()} Add to Log</>}
        </button>
      </div>
    </div>
  )
}

// ── Food Entry Row ─────────────────────────────────────────────────────────────
function FoodRow({ entry, onDelete, delay = 0, visible }) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) { onDelete(entry.id); return }
    setConfirming(true)
    setTimeout(() => setConfirming(false), 2500)
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'13px 14px', borderRadius:12,
      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-10px)',
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.food_name}</p>
        <div style={{ display:'flex', gap:10 }}>
          {entry.protein > 0 && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>P {entry.protein}g</p>}
          {entry.carbs   > 0 && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>C {entry.carbs}g</p>}
          {entry.fat     > 0 && <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>F {entry.fat}g</p>}
        </div>
      </div>
      <p style={{ color:'#fff', fontSize:15, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>{entry.calories}</p>
      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>cal</p>
      <button onClick={handleDelete}
        style={{ background: confirming ? 'rgba(255,60,60,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${confirming ? 'rgba(255,60,60,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius:8, padding:'7px 9px', cursor:'pointer', color: confirming ? 'rgba(255,100,100,0.9)' : 'rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 }}
        title={confirming ? 'Tap again to confirm' : 'Delete'}>
        {confirming ? <p style={{ fontSize:9, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, letterSpacing:'0.06em', margin:0 }}>DEL?</p> : Ico.trash()}
      </button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FoodJournal() {
  const navigate  = useNavigate()
  const [visible, setVisible]   = useState(false)
  const [showAI,  setShowAI]    = useState(false)
  const [showAdd, setShowAdd]   = useState(false)
  const [prefill, setPrefill]   = useState(null)
  const [activeMeal, setActiveMeal] = useState('All')

  const { logs, totals, addEntry, deleteEntry, loading } = useFoodLog(todayStr)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  const calories = totals?.calories || 0
  const protein  = totals?.protein  || 0
  const carbs    = totals?.carbs    || 0
  const fat      = totals?.fat      || 0
  const calPct   = Math.min(100, Math.round((calories / CALORIE_GOAL) * 100))
  const calLeft  = Math.max(0, CALORIE_GOAL - calories)

  const handleAISelect = (item) => {
    setPrefill(item)
    setShowAI(false)
    setShowAdd(true)
  }

  const handleManualAdd = () => {
    setPrefill(null)
    setShowAdd(true)
  }

  const handleSave = async (entry) => {
    await addEntry({ ...entry, date: todayStr })
  }

  // Group logs by meal type
  const mealGroups = MEAL_TYPES.reduce((acc, m) => {
    acc[m] = (logs || []).filter(e => (e.meal_type || 'Snack') === m)
    return acc
  }, {})
  const allLogs = logs || []
  const filteredLogs = activeMeal === 'All' ? allLogs : mealGroups[activeMeal] || []

  const anim = (d=0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital@1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#080808;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input:focus{outline:none;}
        .ax-back:hover{background:rgba(255,255,255,0.08)!important;}
        .ax-ai-btn:hover{background:rgba(255,255,255,0.07)!important;border-color:rgba(255,255,255,0.22)!important;}
        .ax-add-btn:hover{background:rgba(255,255,255,0.88)!important;box-shadow:0 0 22px rgba(255,255,255,0.2)!important;}
        .ax-meal-tab:hover{background:rgba(255,255,255,0.05)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#080808', WebkitFontSmoothing:'antialiased', paddingBottom:90 }}>

        {/* ── Sticky Header ── */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,8,8,0.93)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 16px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'rgba(255,255,255,0.22)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>Today</p>
              <h1 style={{ color:'#fff', fontWeight:900, fontSize:20, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.02em' }}>Food Journal</h1>
            </div>
            {/* Action buttons */}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowAI(true)} className="ax-ai-btn"
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 12px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.06em', transition:'all 0.2s' }}>
                {Ico.spark()} AI
              </button>
              <button onClick={handleManualAdd} className="ax-add-btn"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 14px', borderRadius:9, background:'#fff', color:'#080808', border:'none', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.2s' }}>
                {Ico.plus(13)} Add
              </button>
            </div>
          </div>

          {/* Calorie ring summary */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Consumed</p>
              <p style={{ color:'#fff', fontSize:28, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.02em' }}>{calories.toLocaleString()} <span style={{ fontSize:13, fontWeight:400, color:'rgba(255,255,255,0.35)' }}>cal</span></p>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>{calLeft.toLocaleString()} remaining of {CALORIE_GOAL.toLocaleString()}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Progress</p>
              <p style={{ color:'#fff', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{calPct}<span style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>%</span></p>
            </div>
          </div>
          <div style={{ marginTop:10 }}>
            <GlowBar pct={calPct} h={5} />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto' }}>

          {/* Macro summary */}
          <div style={{ display:'flex', gap:10, ...anim(80) }}>
            <MacroPill label="Protein" value={protein} />
            <MacroPill label="Carbs"   value={carbs} />
            <MacroPill label="Fat"     value={fat} />
          </div>

          {/* Meal filter tabs */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, ...anim(140) }}>
            {['All', ...MEAL_TYPES].map(m => {
              const active = activeMeal === m
              const count = m === 'All' ? allLogs.length : (mealGroups[m]?.length || 0)
              return (
                <button key={m} onClick={() => setActiveMeal(m)} className="ax-meal-tab"
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:99, border:`1px solid ${active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#fff' : 'rgba(255,255,255,0.35)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight: active ? 700 : 400, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', flexShrink:0 }}>
                  {m !== 'All' && <span style={{ color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>{MEAL_ICONS[m](12)}</span>}
                  {m}
                  {count > 0 && <span style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)', borderRadius:99, padding:'1px 6px', fontSize:10 }}>{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Log entries */}
          <div style={anim(200)}>
            <SectionHead
              title={activeMeal === 'All' ? "Today's Log" : activeMeal}
              count={filteredLogs.length}
            />

            {loading && (
              <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'24px 0', fontStyle:'italic' }}>Loading…</p>
            )}

            {!loading && filteredLogs.length === 0 && (
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:12, padding:'32px 20px', textAlign:'center' }}>
                <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic', marginBottom:12 }}>Nothing logged yet.</p>
                <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                  <button onClick={() => setShowAI(true)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                    {Ico.spark(12)} Search with AI
                  </button>
                  <button onClick={handleManualAdd}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                    {Ico.plus(12)} Add manually
                  </button>
                </div>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filteredLogs.map((entry, i) => (
                <FoodRow
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                  delay={i * 40}
                  visible={visible}
                />
              ))}
            </div>

            {/* Meal-grouped totals when viewing All */}
            {activeMeal === 'All' && allLogs.length > 0 && (
              <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{allLogs.length} {allLogs.length === 1 ? 'entry' : 'entries'} today</p>
                <p style={{ color:'#fff', fontWeight:900, fontSize:15, fontFamily:'Helvetica Neue,sans-serif' }}>{calories.toLocaleString()} cal total</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Overlays */}
      {showAI  && <AISearchPanel onSelect={handleAISelect} onClose={() => setShowAI(false)} />}
      {showAdd && (
        <ManualAddSheet
          prefill={prefill}
          mealType={activeMeal !== 'All' ? activeMeal : 'Breakfast'}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setPrefill(null) }}
        />
      )}

      <BottomNav />
    </>
  )
}
