import { useState, useEffect, useRef } from 'react'
import { useToday } from '../../hooks/useToday'
import { useHaptic } from '../../hooks/useHaptic'
import foodIconSrc from '../../food-icon.png'
import { useNavigate } from 'react-router-dom'
import { useFoodLog } from '../../hooks/useFoodLog'
import { BottomNav } from '../../pages/Dashboard'
import { searchFood, lookupBarcode } from '../../lib/foodSearch'
import { useWaterLog } from '../../hooks/useWaterLog'
import WaterPanel from './WaterPanel'
import nourishmentHeroImg from '../fitness/Images/Nourishment.png'

// ── Date ───────────────────────────────────────────────────────────────────────

const FOOD_IMG = nourishmentHeroImg

// ── Constants ──────────────────────────────────────────────────────────────────
const CALORIE_GOAL = 2200
const WATER_GOAL   = 8
const MEAL_TYPES   = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const DAILY_PROTEIN_MEALS = [
  { name:'Grilled Chicken & Quinoa Bowl',  emoji:'🍗', tag:'High Protein', cal:460, p:42, c:38, f:10,
    instructions:['Season 6 oz chicken breast with salt, pepper, and garlic powder.','Grill or pan-sear 6–7 min per side on medium-high heat.','Cook ½ cup quinoa per package instructions (≈15 min).','Serve over quinoa with steamed broccoli or cucumber slices.'] },
  { name:'Greek Yogurt Parfait',           emoji:'🥣', tag:'Quick & Clean', cal:310, p:28, c:32, f:6,
    instructions:['Layer 1 cup plain Greek yogurt (0% fat) in a bowl.','Top with ½ cup mixed berries and 2 tbsp granola.','Drizzle with 1 tsp honey.','Add 1 scoop protein powder for an extra 20–25g of protein.'] },
  { name:'Egg White Veggie Scramble',      emoji:'🍳', tag:'Low Carb',      cal:240, p:30, c:12, f:8,
    instructions:['Whisk 6 egg whites with salt, pepper, and a pinch of turmeric.','Sauté ½ cup spinach and ¼ cup diced bell pepper in a non-stick pan.','Pour in egg whites and cook on medium until set, folding gently.','Serve with 1 slice whole grain toast or as-is.'] },
  { name:'Tuna Avocado Bowl',              emoji:'🥑', tag:'Omega-3 Rich',  cal:380, p:38, c:14, f:18,
    instructions:['Drain 1 can (5 oz) albacore tuna.','Mix with ½ avocado diced, 1 tbsp lime juice, salt and pepper.','Serve over ½ cup cooked brown rice or in a lettuce cup.','Optional: add sliced jalapeño and cilantro.'] },
  { name:'Protein Smoothie',               emoji:'🥤', tag:'Post-Workout',  cal:350, p:35, c:30, f:8,
    instructions:['Blend 1 cup unsweetened almond milk with 1 scoop vanilla protein powder.','Add 1 frozen banana, 1 tbsp almond butter, 1 cup spinach.','Blend until smooth. Add ice if desired.','Best consumed within 30 minutes of exercise.'] },
  { name:'Turkey & Sweet Potato',          emoji:'🍠', tag:'Clean Bulk',    cal:440, p:40, c:36, f:9,
    instructions:['Preheat oven to 400°F. Cube 1 sweet potato, toss with olive oil and roast 25 min.','Brown 5 oz lean ground turkey with garlic and onion powder.','Combine and season with cumin, paprika, and a squeeze of lime.','Serve immediately or meal-prep for up to 4 days.'] },
  { name:'Cottage Cheese Bowl',            emoji:'🧀', tag:'High Protein',  cal:260, p:30, c:16, f:6,
    instructions:['Scoop 1 cup low-fat cottage cheese into a bowl.','Add ½ cup sliced peaches or pineapple chunks.','Top with chia seeds and a pinch of cinnamon.','Savory version: swap fruit for sliced tomato and cracked pepper.'] },
  { name:'Baked Salmon & Asparagus',       emoji:'🐟', tag:'Omega-3 Rich',  cal:420, p:45, c:8,  f:20,
    instructions:['Preheat oven to 400°F. Line a sheet pan with parchment.','Place 6 oz salmon fillet and trimmed asparagus on the pan.','Drizzle with olive oil, season with salt, pepper, and lemon zest.','Bake 12–15 minutes until salmon flakes easily with a fork.'] },
  { name:'Overnight Oats',                 emoji:'🌾', tag:'Prep Ahead',    cal:390, p:25, c:52, f:8,
    instructions:['Combine ½ cup oats, ¾ cup almond milk, 1 scoop protein powder in a jar.','Add 1 tbsp chia seeds, ½ tsp vanilla, pinch of salt.','Stir, seal, and refrigerate overnight (or at least 4 hours).','Top with berries and almond butter before eating.'] },
  { name:'Chicken Lettuce Wraps',          emoji:'🥬', tag:'Low Carb',      cal:330, p:38, c:16, f:10,
    instructions:['Dice 5 oz cooked chicken breast (rotisserie works great).','Mix with 1 tbsp hoisin sauce, minced ginger, and garlic.','Spoon into large romaine or butter lettuce leaves.','Top with shredded carrots, scallions, and a squeeze of lime.'] },
  { name:'Lentil Power Bowl',              emoji:'🫘', tag:'Plant-Based',   cal:400, p:22, c:58, f:8,
    instructions:['Cook ½ cup green lentils per package instructions (≈20 min).','Serve over ½ cup cooked farro or barley.','Add roasted veggies and a dollop of hummus.','Drizzle with olive oil, lemon juice, and za\'atar spice.'] },
  { name:'Shrimp Stir Fry',                emoji:'🍤', tag:'Quick Cook',    cal:370, p:36, c:28, f:10,
    instructions:['Heat a wok on high. Add 1 tsp sesame oil.','Toss in 6 oz peeled shrimp. Cook 2 min per side until pink.','Add mixed frozen vegetables and 2 tbsp low-sodium soy sauce.','Serve over ½ cup brown rice or cauliflower rice.'] },
  { name:'Hard Boiled Egg Salad',          emoji:'🥚', tag:'Keto-Friendly', cal:290, p:24, c:6,  f:18,
    instructions:['Boil 4 eggs: bring to boil, cover, remove from heat for 10 min, then ice bath.','Peel and chop. Mix with 1 tbsp Greek yogurt, mustard, salt, pepper.','Serve on cucumber rounds, lettuce, or whole grain crackers.'] },
  { name:'Black Bean Tacos',               emoji:'🌮', tag:'Plant-Based',   cal:410, p:20, c:54, f:12,
    instructions:['Heat 1 can drained black beans with cumin, smoked paprika, garlic salt.','Warm 2 small corn tortillas in a dry skillet.','Fill with beans, diced avocado, salsa, and shredded cabbage.','Add lime and hot sauce to taste.'] },
]

function getDailyMeal() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const day   = Math.floor((now - start) / 86400000)
  return DAILY_PROTEIN_MEALS[day % DAILY_PROTEIN_MEALS.length]
}

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
  barcode: (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v2M3 10v4M3 19v-2M21 5v2M21 10v4M21 19v-2M7 5v14M10 5v14M13 5v14M17 5v14"/></svg>,
}

// ── Glow Progress Bar ──────────────────────────────────────────────────────────
function GlowBar({ pct, h = 4, color = '#fff' }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:99, background:'rgba(212,212,232,0.07)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color, borderRadius:99, transition:'width 0.9s cubic-bezier(.16,1,.3,1)', boxShadow:`0 0 8px rgba(212,212,232,0.5)` }} />
    </div>
  )
}

// ── Macro Pill ─────────────────────────────────────────────────────────────────
function MacroPill({ label, value, unit = 'g' }) {
  return (
    <div style={{ flex:1, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'10px 10px' }}>
      <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:5 }}>{label}</p>
      <p style={{ color:'var(--text-primary)', fontSize:18, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{value}<span style={{ fontSize:11, fontWeight:400, color:'rgba(212,212,232,0.4)', marginLeft:2 }}>{unit}</span></p>
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHead({ title, count }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:2, height:14, background:`linear-gradient(to bottom,var(--accent-food),transparent)`, borderRadius:2, boxShadow:`0 0 8px var(--accent-food)` }} />
        <p style={{ color:'var(--text-secondary)', fontSize:10, letterSpacing:'0.26em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700 }}>{title}</p>
      </div>
      {count != null && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{count} {count === 1 ? 'item' : 'items'}</p>}
    </div>
  )
}

// ── Barcode Scanner ────────────────────────────────────────────────────────────
function BarcodeScanner({ onResult, onClose }) {
  const [status, setStatus] = useState('starting') // starting | scanning | found | error
  const [msg,    setMsg]    = useState('')
  const scannerRef = useRef(null)
  const handledRef = useRef(false)
  const startedRef = useRef(false) // true only after .start() resolves

  useEffect(() => {
    let mounted = true

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (!mounted) return

      // Clear any leftover DOM injected by a previous render
      const el = document.getElementById('barcode-reader')
      if (el) el.innerHTML = ''

      const html5Qrcode = new Html5Qrcode('barcode-reader')
      scannerRef.current = html5Qrcode

      const onSuccess = (decodedText) => {
        if (handledRef.current) return
        handledRef.current = true
        if (mounted) { setStatus('found'); setMsg('Looking up product…') }

        setTimeout(async () => {
          try {
            if (startedRef.current) await html5Qrcode.stop().catch(() => {})
            startedRef.current = false
            const food = await lookupBarcode(decodedText)
            if (mounted) onResult(food)
          } catch {
            if (mounted) {
              setStatus('error')
              setMsg('Product not found in database. Try searching manually.')
              handledRef.current = false
            }
          }
        }, 0)
      }

      html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 140 } },
        onSuccess,
        () => {}
      ).then(() => {
        startedRef.current = true
        if (mounted) setStatus('scanning')
      }).catch(() => {
        if (mounted) {
          setStatus('error')
          setMsg('Camera access denied. Please allow camera permissions.')
        }
      })
    }).catch(() => {
      if (mounted) {
        setStatus('error')
        setMsg('Scanner failed to load. Try searching manually.')
      }
    })

    return () => {
      mounted = false
      if (scannerRef.current && startedRef.current) {
        scannerRef.current.stop().catch(() => {})
        startedRef.current = false
      }
    }
  }, [])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(0,0,0,0.97)', display:'flex', flexDirection:'column',
    }}>
      {/* Header */}
      <div style={{ padding:'max(16px, env(safe-area-inset-top)) 16px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(212,212,232,0.1)' }}>
        <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.08em' }}>Scan Barcode</p>
        <button onClick={onClose} style={{
          background:'rgba(0,0,0,0.55)', border:'none', cursor:'pointer',
          color:'rgba(212,212,232,0.9)', display:'flex', alignItems:'center', justifyContent:'center',
          width:44, height:44, borderRadius:'50%', flexShrink:0,
        }}>
          {Ico.close(24)}
        </button>
      </div>

      {/* Viewfinder */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, padding:24 }}>
        <div style={{ position:'relative', width:'100%', maxWidth:340 }}>
          <div id="barcode-reader" style={{ width:'100%', borderRadius:12, overflow:'hidden' }} />
          {status === 'scanning' && (
            <div style={{
              position:'absolute', inset:0, pointerEvents:'none',
              border:'2px solid rgba(212,212,232,0.6)', borderRadius:12,
              boxShadow:'0 0 0 9999px rgba(0,0,0,0.5)',
            }}>
              <div style={{ position:'absolute', top:0, left:0, width:24, height:24, borderTop:'3px solid #c8a000', borderLeft:'3px solid #c8a000', borderRadius:'4px 0 0 0' }} />
              <div style={{ position:'absolute', top:0, right:0, width:24, height:24, borderTop:'3px solid #c8a000', borderRight:'3px solid #c8a000', borderRadius:'0 4px 0 0' }} />
              <div style={{ position:'absolute', bottom:0, left:0, width:24, height:24, borderBottom:'3px solid #c8a000', borderLeft:'3px solid #c8a000', borderRadius:'0 0 0 4px' }} />
              <div style={{ position:'absolute', bottom:0, right:0, width:24, height:24, borderBottom:'3px solid #c8a000', borderRight:'3px solid #c8a000', borderRadius:'0 0 4px 0' }} />
            </div>
          )}
        </div>

        <p style={{ color:'rgba(212,212,232,0.5)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', letterSpacing:'0.06em' }}>
          {status === 'starting'  && 'Starting camera…'}
          {status === 'scanning'  && 'Point at a barcode on any packaged food'}
          {status === 'found'     && msg}
          {status === 'error'     && msg}
        </p>

        {status === 'error' && (
          <button onClick={onClose} style={{ padding:'11px 28px', borderRadius:9, background:'rgba(212,212,232,0.08)', border:'1px solid rgba(212,212,232,0.2)', color:'var(--text-primary)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, letterSpacing:'0.12em', cursor:'pointer' }}>
            BACK TO SEARCH
          </button>
        )}
      </div>

      <p style={{ textAlign:'center', padding:'0 0 32px', color:'rgba(212,212,232,0.2)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.1em' }}>
        Powered by Open Food Facts · 3M+ products
      </p>
    </div>
  )
}

// ── AI Search Panel ────────────────────────────────────────────────────────────
function AISearchPanel({ onSelect, onClose }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [focused,  setFocused]  = useState(false)
  const [scanning, setScanning] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setError(''); return }
    setLoading(true); setError('')
    const t = setTimeout(async () => {
      try {
        const items = await searchFood(query)
        setResults(items)
        if (items.length === 0) setError('No results found. Try a different name.')
      } catch {
        setError('Search unavailable. Check your connection.')
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'var(--overlay-bg)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
      display:'flex', flexDirection:'column', padding:'0 0 env(safe-area-inset-bottom)',
    }}>
      {scanning && (
        <BarcodeScanner
          onResult={food => { setScanning(false); onSelect(food) }}
          onClose={() => setScanning(false)}
        />
      )}
      {/* Header */}
      <div style={{ padding:'16px 16px 14px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--border)' }}>
        <div style={{
          flex:1, display:'flex', alignItems:'center', gap:10,
          background: focused ? 'rgba(212,212,232,0.07)' : 'var(--bg-card)',
          border: focused ? '1px solid rgba(212,212,232,0.3)' : '1px solid rgba(212,212,232,0.12)',
          boxShadow: focused ? '0 0 18px rgba(212,212,232,0.06)' : 'none',
          borderRadius:11, padding:'11px 14px',
          transition:'border-color 0.2s, box-shadow 0.2s',
        }}>
          <div style={{ color: loading ? 'var(--glow-bar)' : 'rgba(212,212,232,0.4)', transition:'color 0.2s' }}>
            {loading ? (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search 300,000+ foods…"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:15, fontFamily:'Helvetica Neue,sans-serif', caretColor:'var(--glow-bar)' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setError('') }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
              {Ico.close()}
            </button>
          )}
        </div>
        <button onClick={() => setScanning(true)} style={{ background:'rgba(212,212,232,0.06)', border:'1px solid rgba(212,212,232,0.14)', borderRadius:9, padding:'8px 10px', cursor:'pointer', color:'rgba(212,212,232,0.6)', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          {Ico.barcode(18)}
        </button>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)', display:'flex' }}>
          {Ico.close(20)}
        </button>
      </div>

      {/* Source badge */}
      <div style={{ padding:'8px 16px', display:'flex', alignItems:'center', gap:6 }}>
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text-faint)' }}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <p style={{ color:'var(--text-faint)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          USDA · 300,000+ foods  ·  Open Food Facts · 3M+ barcodes
        </p>
      </div>

      {/* Results */}
      <div style={{ flex:1, overflowY:'auto', padding:'4px 16px 16px' }}>
        {error && <p style={{ color:'rgba(255,100,100,0.8)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'20px 0' }}>{error}</p>}
        {!loading && results.length === 0 && !error && !query.trim() && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <p style={{ color:'rgba(212,212,232,0.12)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1.7 }}>
              Start typing to search — results appear instantly.<br/>Try "chicken breast", "brown rice", or "banana".
            </p>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {results.map((item, i) => (
            <button key={item.fdcId || i} onClick={() => onSelect(item)}
              style={{
                background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)',
                borderRadius:12, padding:'14px 16px', textAlign:'left', cursor:'pointer', width:'100%',
                transition:'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(212,212,232,0.07)'; e.currentTarget.style.borderColor='rgba(212,212,232,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='' }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ flex:1, minWidth:0, marginRight:12 }}>
                  <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>
                    {item.brand ? item.brand + ' · ' : ''}{item.serving}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ color:'var(--text-primary)', fontSize:20, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{item.calories}</p>
                  <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif' }}>cal</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[['Protein', item.protein + 'g'], ['Carbs', item.carbs + 'g'], ['Fat', item.fat + 'g']].map(([l, v]) => (
                  <div key={l} style={{ flex:1, background:'rgba(212,212,232,0.04)', borderRadius:7, padding:'6px 8px', textAlign:'center' }}>
                    <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{l}</p>
                    <p style={{ color:'var(--text-secondary)', fontSize:12, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif' }}>{v}</p>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

// ── Input Row (top-level to prevent focus-reset on every keystroke) ────────────
function InputRow({ label, field, type='text', placeholder='', form, set }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</label>
      <div style={{ background:'var(--stat-bg)', border:`1px solid ${focused ? 'rgba(212,212,232,0.25)' : 'rgba(212,212,232,0.09)'}`, borderRadius:10, padding:'12px 14px', transition:'border-color 0.2s,box-shadow 0.2s', boxShadow: focused ? '0 0 0 1px rgba(212,212,232,0.07)' : 'none' }}>
        <input
          type={type}
          value={form[field]}
          onChange={e => set(field, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }}
        />
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
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [visible,      setVisible]      = useState(false)
  const [suggestions,  setSuggestions]  = useState([])
  const [searching,    setSearching]    = useState(false)
  const [showSug,      setShowSug]      = useState(false)
  const [scanning,     setScanning]     = useState(false)

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

  const pickBarcode = (food) => {
    setForm(f => ({
      ...f,
      food_name: [food.brand, food.name].filter(Boolean).join(' – '),
      calories:  String(food.calories || ''),
      protein:   String(food.protein  || ''),
      carbs:     String(food.carbs    || ''),
      fat:       String(food.fat      || ''),
    }))
    setScanning(false)
  }

  return (
    <>
    {scanning && <BarcodeScanner onResult={pickBarcode} onClose={() => setScanning(false)} />}
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'var(--overlay-bg)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
      display:'flex', alignItems:'flex-end',
    }}>
      <div style={{
        width:'100%', maxWidth:520, margin:'0 auto',
        background:'var(--bg-secondary)', borderTop:'1px solid var(--border)',
        borderRadius:'18px 18px 0 0', padding:'20px 18px max(24px,env(safe-area-inset-bottom))',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.35s cubic-bezier(.16,1,.3,1)',
        maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* Handle */}
        <div style={{ width:36, height:4, background:'rgba(212,212,232,0.15)', borderRadius:99, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ color:'var(--text-primary)', fontSize:17, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'-0.01em' }}>
            {prefill ? 'Confirm & Add' : 'Add Food'}
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)' }}>{Ico.close(18)}</button>
        </div>

        {/* Meal type selector */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:8 }}>Meal</label>
          <div style={{ display:'flex', gap:8 }}>
            {MEAL_TYPES.map(m => (
              <button key={m} onClick={() => set('meal_type', m)}
                style={{ flex:1, padding:'9px 4px', borderRadius:9, border:`1px solid ${form.meal_type===m ? 'rgba(200,212,200,0.5)' : 'rgba(212,212,232,0.08)'}`, background: form.meal_type===m ? 'rgba(200,212,200,0.12)' : 'rgba(212,212,232,0.03)', color: form.meal_type===m ? '#c8d4c8' : 'rgba(212,212,232,0.35)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', fontWeight: form.meal_type===m ? 700 : 400, cursor:'pointer', transition:'all 0.18s', textAlign:'center', letterSpacing:'0.04em' }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Smart food name search */}
        <div style={{ marginBottom:12, position:'relative' }}>
          <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>Food Name</label>
          <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'11px 12px', display:'flex', alignItems:'center', gap:8 }}>
            {searching ? (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--glow-bar)', flexShrink:0, animation:'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(212,212,232,0.25)', flexShrink:0 }}>
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
            <button onClick={() => setScanning(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(212,212,232,0.4)', display:'flex', flexShrink:0, padding:'2px' }} title="Scan barcode">
              {Ico.barcode(16)}
            </button>
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
        </div>
        <InputRow label="Calories" field="calories" type="number" placeholder="350" form={form} set={set} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:4 }}>
          {[['Protein (g)', 'protein', '32'], ['Carbs (g)', 'carbs', '0'], ['Fat (g)', 'fat', '14']].map(([label, field, ph]) => (
            <div key={field}>
              <label style={{ display:'block', color:'rgba(212,212,232,0.32)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:6 }}>{label}</label>
              <div style={{ background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', borderRadius:10, padding:'11px 12px' }}>
                <input type="number" value={form[field]} onChange={e => set(field, e.target.value)} placeholder={ph}
                  style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'Helvetica Neue,sans-serif' }} />
              </div>
            </div>
          ))}
        </div>

        {error && <p style={{ color:'rgba(255,100,100,0.85)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginBottom:12, marginTop:10 }}>{error}</p>}

        <button onClick={handleSave} disabled={saving}
          style={{ width:'100%', padding:'15px', background:'rgba(200,212,200,0.15)', color:'#c8d4c8', border:'1px solid rgba(200,212,200,0.4)', borderRadius:11, fontSize:12, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s', boxShadow:'0 0 14px rgba(200,212,200,0.1)' }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background='rgba(200,212,200,0.25)'; e.currentTarget.style.boxShadow='0 0 22px rgba(200,212,200,0.25)' }}}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(200,212,200,0.15)'; e.currentTarget.style.boxShadow='0 0 14px rgba(200,212,200,0.1)' }}
        >
          {saving ? 'Saving…' : <>{Ico.check()} Add to Log</>}
        </button>
      </div>
    </div>
    </>
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
      background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-10px)',
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:'rgba(212,212,232,0.85)', fontSize:13, fontWeight:600, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.food_name}</p>
        <div style={{ display:'flex', gap:10 }}>
          {entry.protein > 0 && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>P {entry.protein}g</p>}
          {entry.carbs   > 0 && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>C {entry.carbs}g</p>}
          {entry.fat     > 0 && <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>F {entry.fat}g</p>}
        </div>
      </div>
      <p style={{ color:'var(--text-primary)', fontSize:15, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>{entry.calories}</p>
      <p style={{ color:'var(--text-muted)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', flexShrink:0 }}>cal</p>
      <button onClick={handleDelete}
        style={{ background: confirming ? 'rgba(255,60,60,0.15)' : 'rgba(212,212,232,0.05)', border:`1px solid ${confirming ? 'rgba(255,60,60,0.35)' : 'rgba(212,212,232,0.08)'}`, borderRadius:8, padding:'7px 9px', cursor:'pointer', color: confirming ? 'rgba(255,100,100,0.9)' : 'rgba(212,212,232,0.3)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 }}
        title={confirming ? 'Tap again to confirm' : 'Delete'}>
        {confirming ? <p style={{ fontSize:9, fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, letterSpacing:'0.06em', margin:0 }}>DEL?</p> : Ico.trash()}
      </button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FoodJournal() {
  const todayStr = useToday()
  const haptic = useHaptic()
  const navigate  = useNavigate()
  const [visible, setVisible]   = useState(false)
  const [showAI,  setShowAI]    = useState(false)
  const [showAdd, setShowAdd]   = useState(false)
  const [prefill, setPrefill]   = useState(null)
  const [activeMeal, setActiveMeal] = useState('All')
  const [showSuggest,  setShowSuggest]  = useState(false)

  const [activeTab, setActiveTab] = useState('food')
  const { logs, totals, addEntry, deleteEntry, isLoading: loading } = useFoodLog(todayStr)
  const { count: waterCount } = useWaterLog(todayStr)
  const waterPct = Math.min(100, Math.round((waterCount / WATER_GOAL) * 100))

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

  const handleSuggestAdd = (meal) => {
    setPrefill({ name: meal.name, calories: meal.cal, protein: meal.p, carbs: meal.c, fat: meal.f })
    setShowAdd(true)
  }

  const handleSave = async (entry) => {
    haptic.bump()
    await addEntry.mutateAsync({ ...entry, date: todayStr })
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
        body{background:var(--bg-primary);overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(212,212,232,0.1);border-radius:99px;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(212,212,232,0.2);}
        input:focus{outline:none;}
        .ax-back:hover{background:rgba(212,212,232,0.08)!important;}
        .ax-ai-btn:hover{background:rgba(212,212,232,0.07)!important;border-color:rgba(212,212,232,0.22)!important;}
        .ax-add-btn:hover{background:rgba(212,212,232,0.88)!important;box-shadow:0 0 22px rgba(212,212,232,0.2)!important;}
        .ax-meal-tab:hover{background:rgba(212,212,232,0.05)!important;}
        .ax-tab:hover{background:rgba(212,212,232,0.05)!important;}
      `}</style>

      <div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom:'calc(env(safe-area-inset-bottom) + 160px)', position:'relative' }}>
        {/* Food market background */}
        <div style={{
          position:'fixed', inset:0, zIndex:0,
          backgroundImage:`url(${FOOD_IMG})`,
          backgroundSize:'cover', backgroundPosition:'center 35%',
          backgroundRepeat:'no-repeat',
          opacity:0.17,
          pointerEvents:'none',
          filter:'grayscale(100%) contrast(1.3) brightness(1.1)',
        }} />
        <div style={{
          position:'fixed', inset:0, zIndex:0,
          background:'linear-gradient(to bottom, rgba(8,8,8,0.42) 0%, rgba(8,8,8,0.08) 40%, rgba(8,8,8,0.80) 100%)',
          pointerEvents:'none',
        }} />

        {/* ── Sticky Header ── */}
        <div style={{ position:'sticky', top:0, zIndex:50, background:'var(--header-bg)', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', borderBottom:'1px solid var(--border)', padding:'14px 16px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <button onClick={() => navigate('/dashboard')} className="ax-back"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              {Ico.back()}
            </button>
            <div style={{ flex:1 }}>
              <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>Today</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <h1 style={{ color:'#c8d4c8', fontWeight:400, fontSize:18, fontFamily:"'The Seasons', serif", letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Nourishment</h1>
                <img src={foodIconSrc} width={20} height={20} style={{ filter:'brightness(0) invert(1)', objectFit:'contain', opacity:0.72, display:'block' }} alt="" />
              </div>
            </div>
            {/* Action buttons */}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowAI(true)} className="ax-ai-btn"
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 12px', borderRadius:9, background:'var(--stat-bg)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:600, letterSpacing:'0.06em', transition:'all 0.2s' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search
              </button>
              <button onClick={handleManualAdd} className="ax-add-btn"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 14px', borderRadius:9, background:'var(--btn-bg)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.2s' }}>
                {Ico.plus(13)} Add
              </button>
            </div>
          </div>

          {/* Summary row — changes per tab */}
          {activeTab === 'food' ? (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div>
                  <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Consumed</p>
                  <p style={{ color:'var(--text-primary)', fontSize:28, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.02em' }}>{calories.toLocaleString()} <span style={{ fontSize:13, fontWeight:400, color:'var(--text-muted)' }}>cal</span></p>
                  <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>{calLeft.toLocaleString()} remaining of {CALORIE_GOAL.toLocaleString()}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Progress</p>
                  <p style={{ color:'var(--text-primary)', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{calPct}<span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:400 }}>%</span></p>
                </div>
              </div>
              <div style={{ marginTop:10 }}>
                <GlowBar pct={calPct} h={5} />
              </div>
            </>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div>
                  <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Today</p>
                  <p style={{ color:'#9ab4cc', fontSize:28, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1, letterSpacing:'-0.02em' }}>{waterCount} <span style={{ fontSize:13, fontWeight:400, color:'var(--text-muted)' }}>glasses</span></p>
                  <p style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'Helvetica Neue,sans-serif', marginTop:3 }}>{Math.max(0, WATER_GOAL - waterCount)} remaining of {WATER_GOAL}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', marginBottom:4 }}>Progress</p>
                  <p style={{ color:'#9ab4cc', fontSize:26, fontWeight:900, fontFamily:'Helvetica Neue,sans-serif', lineHeight:1 }}>{waterPct}<span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:400 }}>%</span></p>
                </div>
              </div>
              <div style={{ marginTop:10 }}>
                <GlowBar pct={waterPct} h={5} color="#9ab4cc" />
              </div>
            </>
          )}

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            {[['food','Nourishment'],['water','Water']].map(([key, label]) => {
              const isActive = activeTab === key
              return (
                <button key={key} onClick={() => setActiveTab(key)} className="ax-tab"
                  style={{
                    flex:1, padding:'10px', borderRadius:10,
                    border: isActive ? '1px solid rgba(200,212,200,0.55)' : '1px solid rgba(212,212,232,0.06)',
                    background: isActive ? 'rgba(200,212,200,0.12)' : 'rgba(212,212,232,0.03)',
                    color: isActive ? '#c8d4c8' : 'rgba(212,212,232,0.35)',
                    boxShadow: isActive ? '0 0 12px rgba(200,212,200,0.18)' : 'none',
                    fontSize:12, fontFamily:'Helvetica Neue,sans-serif',
                    fontWeight: isActive ? 700 : 400,
                    cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.04em',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Water Body ── */}
        {activeTab === 'water' && (
          <div style={{ padding:'16px', maxWidth:600, margin:'0 auto' }}>
            <WaterPanel todayStr={todayStr} visible={visible} />
          </div>
        )}

        {/* ── Food Body ── */}
        <div style={{ padding:'16px', display: activeTab === 'food' ? 'flex' : 'none', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>

          {/* Macro summary */}
          <div style={{ display:'flex', gap:10, ...anim(80) }}>
            <MacroPill label="Protein" value={protein} />
            <MacroPill label="Carbs"   value={carbs} />
            <MacroPill label="Fat"     value={fat} />
          </div>

          {/* ── Today's Meal ── */}
          {(() => {
            const meal = getDailyMeal()
            return (
              <div style={{ ...anim(100) }}>
                <button onClick={() => setShowSuggest(s => !s)} style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'13px 16px',
                  background: showSuggest ? 'rgba(130,200,130,0.11)' : 'rgba(130,200,130,0.06)',
                  border: `1px solid ${showSuggest ? 'rgba(160,210,160,0.45)' : 'rgba(160,210,160,0.22)'}`,
                  borderRadius:13, cursor:'pointer', transition:'all 0.22s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:'rgba(130,200,130,0.12)', border:'1px solid rgba(160,210,160,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{meal.emoji}</div>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ color:'#a8d8a8', fontSize:13, fontWeight:700, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{meal.name}</p>
                      <p style={{ color:'rgba(160,210,160,0.5)', fontSize:10, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.04em' }}>Today's Recommendation · {meal.p}g protein</p>
                    </div>
                  </div>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(160,210,160,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showSuggest ? 'rotate(90deg)' : 'rotate(0deg)', transition:'transform 0.22s', flexShrink:0 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )
          })()}

          {/* Meal filter tabs */}
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, ...anim(140) }}>
            {['All', ...MEAL_TYPES].map(m => {
              const active = activeMeal === m
              const count  = m === 'All' ? allLogs.length : (mealGroups[m]?.length || 0)
              return (
                <button key={m} onClick={() => setActiveMeal(m)} className="ax-meal-tab"
                  style={{
                    display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:99,
                    border: `1px solid ${active ? 'rgba(200,212,200,0.5)' : 'rgba(212,212,232,0.08)'}`,
                    background: active ? 'rgba(200,212,200,0.12)' : 'rgba(212,212,232,0.03)',
                    color: active ? '#c8d4c8' : 'rgba(212,212,232,0.35)',
                    fontSize:11, fontFamily:'Helvetica Neue,sans-serif',
                    fontWeight: active ? 700 : 400,
                    cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', flexShrink:0,
                  }}>
                  {m !== 'All' && <span style={{ color: active ? 'rgba(200,212,200,0.7)' : 'rgba(212,212,232,0.2)' }}>{MEAL_ICONS[m](12)}</span>}
                  {m}
                  {count > 0 && <span style={{ background: active ? 'rgba(200,212,200,0.2)' : 'rgba(212,212,232,0.07)', borderRadius:99, padding:'1px 6px', fontSize:10 }}>{count}</span>}
                </button>
              )
            })}
          </div>

          {showSuggest && (() => {
            const meal = getDailyMeal()
            return (
              <div style={anim(160)}>
                {/* Macro bar */}
                <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                  {[['Protein', meal.p, 'g', '#a8d8a8'], ['Carbs', meal.c, 'g', 'rgba(180,188,210,0.7)'], ['Fat', meal.f, 'g', 'rgba(210,180,140,0.7)'], ['Cal', meal.cal, '', 'rgba(212,212,232,0.45)']].map(([label, val, unit, color]) => (
                    <div key={label} style={{ flex:1, background:'rgba(160,210,160,0.06)', border:'1px solid rgba(160,210,160,0.14)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                      <p style={{ color, fontSize:15, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif', marginBottom:2 }}>{val}{unit}</p>
                      <p style={{ color:'rgba(212,212,232,0.35)', fontSize:9, fontFamily:'Helvetica Neue,sans-serif', letterSpacing:'0.1em', textTransform:'uppercase' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Tag + add button row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <span style={{ background:'rgba(160,210,160,0.1)', border:'1px solid rgba(160,210,160,0.28)', borderRadius:99, padding:'4px 10px', color:'#a8d8a8', fontSize:10, fontWeight:700, letterSpacing:'0.08em', fontFamily:'Helvetica Neue,sans-serif' }}>{meal.tag}</span>
                  <button onClick={() => handleSuggestAdd(meal)} style={{ padding:'8px 16px', borderRadius:9, background:'rgba(160,210,160,0.12)', border:'1px solid rgba(160,210,160,0.35)', color:'#a8d8a8', fontSize:11, fontWeight:700, letterSpacing:'0.08em', fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', transition:'all 0.15s' }}>+ Log This Meal</button>
                </div>

                {/* Quick instructions */}
                <div style={{ borderTop:'1px solid rgba(212,212,232,0.07)', paddingTop:16 }}>
                  <p style={{ color:'rgba(212,212,232,0.35)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Helvetica Neue,sans-serif', fontWeight:700, marginBottom:12 }}>Quick Instructions</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {meal.instructions.map((step, i) => (
                      <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(160,210,160,0.1)', border:'1px solid rgba(160,210,160,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          <span style={{ color:'#a8d8a8', fontSize:9, fontWeight:800, fontFamily:'Helvetica Neue,sans-serif' }}>{i+1}</span>
                        </div>
                        <p style={{ color:'var(--text-secondary)', fontSize:13, fontFamily:"'EB Garamond',serif", lineHeight:1.65, fontStyle:'italic' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Log entries */}
          {(
          <div style={anim(200)}>
            <SectionHead
              title={activeMeal === 'All' ? "Today's Log" : activeMeal}
              count={filteredLogs.length}
            />

            {loading && (
              <p style={{ color:'rgba(212,212,232,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', textAlign:'center', padding:'24px 0', fontStyle:'italic' }}>Loading…</p>
            )}

            {!loading && filteredLogs.length === 0 && (
              <div style={{ background:'var(--bg-card)', border:'1px dashed rgba(212,212,232,0.08)', borderRadius:12, padding:'32px 20px', textAlign:'center' }}>
                <p style={{ color:'rgba(212,212,232,0.2)', fontSize:13, fontFamily:'Helvetica Neue,sans-serif', fontStyle:'italic', marginBottom:12 }}>Nothing logged yet.</p>
                <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                  <button onClick={() => setShowAI(true)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
                    {Ico.spark(12)} Search with AI
                  </button>
                  <button onClick={handleManualAdd}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--card-shadow)', color:'var(--text-secondary)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer' }}>
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
                  onDelete={(id) => deleteEntry.mutate(id)}
                  delay={i * 40}
                  visible={visible}
                />
              ))}
            </div>

            {/* Meal-grouped totals when viewing All */}
            {activeMeal === 'All' && allLogs.length > 0 && (
              <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(212,212,232,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'Helvetica Neue,sans-serif' }}>{allLogs.length} {allLogs.length === 1 ? 'entry' : 'entries'} today</p>
                <p style={{ color:'var(--text-primary)', fontWeight:900, fontSize:15, fontFamily:'Helvetica Neue,sans-serif' }}>{calories.toLocaleString()} cal total</p>
              </div>
            )}
          </div>
          )}

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
