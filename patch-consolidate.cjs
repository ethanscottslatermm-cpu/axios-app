const fs = require('fs')
const path = require('path')

// Read with CRLF normalized to LF for reliable matching
const read  = f => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
const write = (f, s) => fs.writeFileSync(f, s, 'utf8')

// ─── 1. WaterTracker — embedded prop ──────────────────────────────────────
;(() => {
  const file = path.join(__dirname, 'src/modules/water/WaterTracker.jsx')
  let s = read(file)

  s = s.replace(
    'export default function WaterTracker() {',
    'export default function WaterTracker({ embedded = false }) {'
  )

  s = s.replace(
    `<div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom:90, position:'relative' }}>`,
    `<div style={{ background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom: embedded ? 0 : 90, position:'relative' }}>`
  )

  // Hide bg image when embedded
  s = s.replace(
    `backgroundImage:\`url(\${WATER_IMG})\`, backgroundSize:'cover', backgroundPosition:'center 30%', backgroundRepeat:'no-repeat', opacity:0.11, pointerEvents:'none', filter:'grayscale(100%)' }} />`,
    `backgroundImage:\`url(\${WATER_IMG})\`, backgroundSize:'cover', backgroundPosition:'center 30%', backgroundRepeat:'no-repeat', opacity:0.11, pointerEvents:'none', filter:'grayscale(100%)', display: embedded ? 'none' : undefined }} />`
  )

  // Wrap sticky header
  s = s.replace(
    `        {/* ── Sticky Header ── */}`,
    `        {!embedded && (<>`
  )
  s = s.replace(
    `          <GlowBar pct={pct} />\n        </div>\n\n        {/* ── Body ──`,
    `          <GlowBar pct={pct} />\n        </div>\n        </>)}\n\n        {/* ── Body ──`
  )

  s = s.replace('      <BottomNav />', '      {!embedded && <BottomNav />}')

  write(file, s)
  console.log('WaterTracker embedded:', s.includes('embedded = false') ? 'YES' : 'NO')
  console.log('WaterTracker header guard:', s.includes('!embedded && (<>') ? 'YES' : 'NO')
  console.log('WaterTracker nav guard:', s.includes('!embedded && <BottomNav') ? 'YES' : 'NO')
})()

// ─── 2. PrayerTracker — embedded prop ─────────────────────────────────────
;(() => {
  const file = path.join(__dirname, 'src/modules/prayer/PrayerTracker.jsx')
  let s = read(file)

  s = s.replace(
    'export default function PrayerTracker() {',
    'export default function PrayerTracker({ embedded = false }) {'
  )

  s = s.replace(
    `<div style={{ minHeight:'100vh', background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom:90, position:'relative' }}>`,
    `<div style={{ background:'var(--bg-primary)', WebkitFontSmoothing:'antialiased', paddingBottom: embedded ? 0 : 90, position:'relative' }}>`
  )

  s = s.replace(
    `backgroundImage:\`url(\${PRAYER_IMG})\`, backgroundSize:'cover', backgroundPosition:'center 30%', backgroundRepeat:'no-repeat', opacity:0.11, pointerEvents:'none', filter:'grayscale(100%)' }} />`,
    `backgroundImage:\`url(\${PRAYER_IMG})\`, backgroundSize:'cover', backgroundPosition:'center 30%', backgroundRepeat:'no-repeat', opacity:0.11, pointerEvents:'none', filter:'grayscale(100%)', display: embedded ? 'none' : undefined }} />`
  )

  s = s.replace(
    `        {/* ── Sticky Header ── */}`,
    `        {!embedded && (<>`
  )
  // Prayer header closes with stat row </div></div>
  s = s.replace(
    `          </div>\n        </div>\n\n        {/* ── Body ──`,
    `          </div>\n        </div>\n        </>)}\n\n        {/* ── Body ──`
  )

  s = s.replace('      <BottomNav />', '      {!embedded && <BottomNav />}')

  write(file, s)
  console.log('PrayerTracker embedded:', s.includes('embedded = false') ? 'YES' : 'NO')
  console.log('PrayerTracker header guard:', s.includes('!embedded && (<>') ? 'YES' : 'NO')
  console.log('PrayerTracker nav guard:', s.includes('!embedded && <BottomNav') ? 'YES' : 'NO')
})()

// ─── 3. FoodJournal — add Water tab ────────────────────────────────────────
;(() => {
  const file = path.join(__dirname, 'src/modules/food/FoodJournal.jsx')
  let s = read(file)

  if (!s.includes('WaterTracker')) {
    s = s.replace(
      "import { BottomNav } from '../../pages/Dashboard'",
      "import { BottomNav } from '../../pages/Dashboard'\nimport WaterTracker from '../water/WaterTracker'"
    )
  }

  if (!s.includes('mainTab')) {
    s = s.replace(
      'export default function FoodJournal() {',
      "export default function FoodJournal() {\n  const [mainTab, setMainTab] = useState('food')"
    )
  }

  const ANCHOR = `        {/* ── Body ── */}\n        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>`
  const REPLACEMENT = `        {/* ── Tabs: Food | Water ── */}
        <div style={{ display:'flex', gap:8, padding:'12px 16px 0' }}>
          {[['food','Food Journal'],['water','Water']].map(([key,label]) => (
            <button key={key} onClick={() => setMainTab(key)} style={{ flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--border)', background: mainTab===key ? 'rgba(255,255,255,0.08)' : 'transparent', color: mainTab===key ? 'var(--text-primary)' : 'var(--text-muted)', fontSize:12, fontWeight: mainTab===key ? 700 : 400, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</button>
          ))}
        </div>

        {mainTab === 'water' && <WaterTracker embedded />}

        {/* ── Body ── */}
        <div style={{ padding:'16px', display: mainTab === 'food' ? 'flex' : 'none', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>`

  if (s.includes(ANCHOR)) {
    s = s.replace(ANCHOR, REPLACEMENT)
    console.log('FoodJournal: anchor matched')
  } else {
    console.log('FoodJournal: anchor STILL not found — dumping context')
    const idx = s.indexOf('/* ── Body ──')
    if (idx !== -1) console.log(JSON.stringify(s.slice(idx-20, idx+200)))
  }

  write(file, s)
  console.log('FoodJournal WaterTracker:', s.includes('<WaterTracker embedded') ? 'YES' : 'NO')
  console.log('FoodJournal mainTab:', s.includes("mainTab === 'food'") ? 'YES' : 'NO')
})()

// ─── 4. Devotional — add Prayer tab ────────────────────────────────────────
;(() => {
  const file = path.join(__dirname, 'src/modules/devotional/Devotional.jsx')
  let s = read(file)

  if (!s.includes('PrayerTracker')) {
    s = s.replace(
      "import { BottomNav } from '../../pages/Dashboard'",
      "import { BottomNav } from '../../pages/Dashboard'\nimport PrayerTracker from '../prayer/PrayerTracker'"
    )
  }

  if (!s.includes('mainTab')) {
    s = s.replace(
      'export default function Devotional() {',
      "export default function Devotional() {\n  const [mainTab, setMainTab] = useState('devotional')"
    )
  }

  const ANCHOR = `        {/* ── Body ── */}\n        <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>`
  const REPLACEMENT = `        {/* ── Tabs: Devotional | Prayer ── */}
        <div style={{ display:'flex', gap:8, padding:'12px 16px 0' }}>
          {[['devotional','Devotional'],['prayer','Prayer']].map(([key,label]) => (
            <button key={key} onClick={() => setMainTab(key)} style={{ flex:1, padding:'10px', borderRadius:10, border:'1px solid var(--border)', background: mainTab===key ? 'rgba(255,255,255,0.08)' : 'transparent', color: mainTab===key ? 'var(--text-primary)' : 'var(--text-muted)', fontSize:12, fontWeight: mainTab===key ? 700 : 400, fontFamily:'Helvetica Neue,sans-serif', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</button>
          ))}
        </div>

        {mainTab === 'prayer' && <PrayerTracker embedded />}

        {/* ── Body ── */}
        <div style={{ padding:'16px', display: mainTab === 'devotional' ? 'flex' : 'none', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto', position:'relative', zIndex:1 }}>`

  if (s.includes(ANCHOR)) {
    s = s.replace(ANCHOR, REPLACEMENT)
    console.log('Devotional: anchor matched')
  } else {
    console.log('Devotional: anchor STILL not found')
    const idx = s.indexOf('/* ── Body ──')
    if (idx !== -1) console.log(JSON.stringify(s.slice(idx-20, idx+200)))
  }

  write(file, s)
  console.log('Devotional PrayerTracker:', s.includes('<PrayerTracker embedded') ? 'YES' : 'NO')
  console.log('Devotional mainTab:', s.includes("mainTab === 'devotional'") ? 'YES' : 'NO')
})()

console.log('\nAll patches done.')
