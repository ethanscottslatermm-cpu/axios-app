/**
 * Chooses a body_line fill.
 *
 * body_line paints first, so a fill on it becomes the backdrop the muscles sit
 * on - visible in the gaps (neck, hands, feet, joints, the rear skull). That
 * makes it the palette's SURFACE, so every candidate is re-validated with the
 * full muscle palette against it, not just eyeballed against the page.
 */
import { pathToFileURL } from 'url'
const SKILL = 'C:/Users/ETHANS~1/AppData/Local/Temp/claude/bundled-skills/2.1.226/5a448b3ff2580255f683c28c73914f14/dataviz/scripts/validate_palette.js'
const { validate } = await import(pathToFileURL(SKILL).href)

const PAGE = '#0a0d14'   // the plane behind the figure

// every hue the muscles use, plus the two inert neutrals
const MUSCLES = ['#d95926','#3987e5','#d55181','#008300','#9085e9','#199e70','#c98500','#e66767']
const INERT   = { head: '#8a8f98', knees: '#64748b' }

const CANDIDATES = {
  'near-black slate': '#12161f',
  'deep slate':       '#171d28',
  'gunmetal':         '#1c2431',
  'graphite':         '#212a38',
  'steel shadow':     '#26303f',
  'warm charcoal':    '#241f1c',
  'authored tan':     '#AC7F5E',
  '(none - page)':    PAGE,
}

const num = (s, re) => { const m = s.match(re); return m ? parseFloat(m[1]) : null }
const row = (rep, name) => rep.find(r => r[0] === name)

function contrastOf(hex, surface) {
  const { report } = validate([hex], { mode: 'dark', surface })
  const r = row(report, 'Contrast vs surface')
  // the detail string carries the ratio only when it fails; recompute via pass state
  const m = r[2].match(/\[\["#[0-9a-fA-F]+",([\d.]+)\]\]/)
  return m ? parseFloat(m[1]) : null   // null => cleared 3:1
}
function deltaE(a, b) {
  const { report } = validate([a, b], { mode: 'dark', surface: PAGE })
  return {
    cvd:    num(row(report, 'CVD separation')[2], /ΔE ([\d.]+)/),
    normal: num(row(report, 'Normal-vision floor')[2], /ΔE ([\d.]+)/),
  }
}

console.log(`page plane ${PAGE}\n`)
console.log('candidate            vs-page  muscles<3:1  worst-muscle  head ΔE  knees ΔE  verdict')
console.log('-'.repeat(92))

for (const [name, hex] of Object.entries(CANDIDATES)) {
  // 1. does the body read as a distinct shape against the page?
  const vsPage = deltaE(hex, PAGE).normal

  // 2. do the muscle hues still clear 3:1 against this new surface?
  const { report } = validate(MUSCLES, { mode: 'dark', surface: hex })
  const cRow = row(report, 'Contrast vs surface')
  const below = cRow[1] === 'relief'
    ? (cRow[2].match(/\["#[0-9a-fA-F]{6}",[\d.]+\]/g) || []).length : 0
  const ratios = MUSCLES.map(m => contrastOf(m, hex)).filter(v => v !== null)
  const worst = ratios.length ? Math.min(...ratios).toFixed(2) : '>=3.0'

  // 3. the inert regions must not dissolve into the body
  const dHead  = deltaE(hex, INERT.head).normal
  const dKnees = deltaE(hex, INERT.knees).normal

  const ok = below === 0 && vsPage >= 4 && dHead >= 15 && dKnees >= 15
  const why = below ? `${below} muscle(s) under 3:1`
    : vsPage < 4 ? 'invisible against page'
    : dHead < 15 ? 'head dissolves in'
    : dKnees < 15 ? 'knees dissolve in' : 'PASS'

  console.log(
    `${name.padEnd(20)} ${String(vsPage.toFixed(1)).padStart(6)}  ${String(below).padStart(11)}  ` +
    `${String(worst).padStart(12)}  ${String(dHead.toFixed(1)).padStart(7)}  ${String(dKnees.toFixed(1)).padStart(8)}  ${ok ? 'PASS' : why}`
  )
}

console.log(`
Reading the columns:
  vs-page      normal-vision ΔE against the page plane - how clearly the body
               silhouette reads as a shape. Too low and the fill does nothing.
  muscles<3:1  muscle hues that drop below 3:1 once this becomes their surface.
               Any number above zero disqualifies the candidate.
  head/knees   the inert neutrals sit directly on the body fill, so they must
               stay separable from it or the skull and patella vanish.`)
