const fs   = require('fs')
const path = require('path')
const file = path.join(__dirname, 'src/modules/finance/FinanceTracker.jsx')
let src = fs.readFileSync(file, 'utf8')

// Remove the entire broken bills panel and replace with component reference
// Use a function replacement to avoid $' / $` issues in str.replace
const BROKEN_START = `\n        {/* Bills Tab */}\n        {activeTab === 'bills' && (`
const CLEAN_NEWS   = `\n\n          <div style={anim(80)}>\n            <SectionHead title="Market News" sub="General" />`

const startIdx = src.indexOf(BROKEN_START)
const endIdx   = src.indexOf(CLEAN_NEWS, startIdx)

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find anchors:', startIdx, endIdx)
  process.exit(1)
}

const COMPONENT_REF = `
        {/* Bills Tab */}
        {activeTab === 'bills' && <BillsTab bills={bills} saveBills={saveBills} />}
`

src = src.slice(0, startIdx) + COMPONENT_REF + src.slice(endIdx)

// Add BillsTab import after existing imports (after the BottomNav import)
const IMPORT_ANCHOR = `import { BottomNav } from '../../pages/Dashboard'`
if (!src.includes('BillsTab')) {
  src = src.replace(
    IMPORT_ANCHOR,
    IMPORT_ANCHOR + `\nimport BillsTab from './BillsTab'`
  )
}

fs.writeFileSync(file, src, 'utf8')
console.log('Done.')
console.log('BillsTab import:', src.includes("import BillsTab") ? 'YES' : 'MISSING')
console.log('BillsTab ref:', src.includes('<BillsTab bills=') ? 'YES' : 'MISSING')
console.log('No more broken Monthly:', !src.includes("['Monthly', '\\n") ? 'CLEAN' : 'STILL BROKEN')
