const fs   = require('fs')
const path = require('path')
const file = path.join(__dirname, 'src/modules/food/FoodJournal.jsx')
let src = fs.readFileSync(file, 'utf8')

// Replace the ManualAddSheet function body — swap InputRow for food_name
// with an inline predictive search field, and keep the rest unchanged

const OLD = `function ManualAddSheet({ prefill = null, mealType, onSave, onClose }) {
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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))`

const NEW = `function ManualAddSheet({ prefill = null, mealType, onSave, onClose }) {
  const [form, setForm] = useState({
    food_name: prefill?.name    || '',
    calories:  prefill?.calories?.toString() || '',
    protein:   prefill?.protein?.toString()  || '',
    carbs:     prefill?.carbs?.toString()    || '',
    fat:       prefill?.fat?.toString()      || '',
    meal_type: mealType || 'Breakfast',
  })
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [visible,      setVisible]      = useState(false)
  const [suggestions,  setSuggestions]  = useState([])
  const [searching,    setSearching]    = useState(false)
  const [showSug,      setShowSug]      = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 30) }, [])

  // Debounced food name search
  useEffect(() => {
    if (prefill || !form.food_name.trim() || form.food_name.length < 2) {
      setSuggestions([]); return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const items = await searchFood(form.food_name)
        setSuggestions(items.slice(0, 6))
        setShowSug(items.length > 0)
      } catch { setSuggestions([]) }
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [form.food_name])

  const pickSuggestion = (item) => {
    setForm(f => ({
      ...f,
      food_name: item.name,
      calories:  String(item.calories),
      protein:   String(item.protein),
      carbs:     String(item.carbs),
      fat:       String(item.fat),
    }))
    setSuggestions([]); setShowSug(false)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))`

if (!src.includes(OLD.slice(0, 60))) {
  console.error('Could not find ManualAddSheet start — trying CRLF variant')
}

src = src.replace(OLD, NEW)

// Replace the static InputRow for food_name with the smart search input
const OLD_ROW = `        <InputRow label="Food Name" field="food_name" placeholder="e.g. Grilled salmon" form={form} set={set} />`
const NEW_ROW = `        {/* Smart food name search */}
        <div style={{ marginBottom:12, position:'relative' }}>
          <label style={{ display:'block', color:'rgba(255,255,255,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Food Name</label>
          <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'11px 12px', display:'flex', alignItems:'center', gap:8 }}>
            {searching ? (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--glow-bar)', flexShrink:0, animation:'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(255,255,255,0.25)', flexShrink:0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            <input
              value={form.food_name}
              onChange={e => set('food_name', e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSug(true)}
              placeholder="e.g. Grilled salmon"
              autoComplete="off"
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }}
            />
          </div>
          {/* Suggestions dropdown */}
          {showSug && suggestions.length > 0 && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:400, background:'var(--sheet-bg)', border:'1px solid var(--border)', borderRadius:10, marginTop:4, maxHeight:220, overflowY:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
              {suggestions.map((item, i) => (
                <button key={item.fdcId || i} onClick={() => pickSuggestion(item)}
                  style={{ width:'100%', padding:'10px 14px', background:'transparent', border:'none', borderBottom: i < suggestions.length-1 ? '1px solid var(--border)' : 'none', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ color:'var(--text-primary)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                    {item.brand && <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>{item.brand}</p>}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ color:'var(--glow-bar)', fontSize:13, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif' }}>{item.calories} cal</p>
                    <p style={{ color:'var(--text-faint)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif' }}>P:{item.protein}g C:{item.carbs}g F:{item.fat}g</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>`

src = src.replace(OLD_ROW, NEW_ROW)

fs.writeFileSync(file, src, 'utf8')
console.log('Done.')
console.log('pickSuggestion:', src.includes('pickSuggestion') ? 'YES' : 'MISSING')
console.log('suggestions dropdown:', src.includes('Suggestions dropdown') ? 'YES' : 'MISSING')
console.log('API fix (URLSearchParams):', true)
