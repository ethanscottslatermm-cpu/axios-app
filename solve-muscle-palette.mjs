/**
 * Solves the muscle-map colouring as a graph-colouring problem.
 *
 * The map is a planar adjacency graph: what matters is that touching muscles
 * are told apart, not that all 20 differ globally. Hues come from the
 * validated categorical set; every candidate assignment is checked against the
 * dataviz validator per adjacent pair, so nothing here is eyeballed.
 */
import { pathToFileURL } from 'url'

const SKILL = 'C:/Users/ETHANS~1/AppData/Local/Temp/claude/bundled-skills/2.1.226/5a448b3ff2580255f683c28c73914f14/dataviz/scripts/validate_palette.js'
const { validate } = await import(pathToFileURL(SKILL).href)

const SURFACE = '#0a0d14'          // the app's near-black behind the figure
const MODE    = 'dark'

// dark steps of the reference categorical theme, plus two neutrals for
// non-muscle regions (skull, patella) that should read as "not trainable"
const HUES = {
  blue:    '#3987e5',
  orange:  '#d95926',
  aqua:    '#199e70',
  yellow:  '#c98500',
  magenta: '#d55181',
  violet:  '#9085e9',
  red:     '#e66767',
  green:   '#008300',
}
/* Non-trainable regions (skull, patella) read as inert gray. Several
   lightnesses are offered so the solver can pick one that separates from
   whatever lands beside it - a mid gray collides with too much. */
const NEUTRALS = {
  steel: '#64748b', slate: '#8a8f98', mist: '#cbd5e1', iron: '#3f4a5a',
}

// merged nodes: front/rear halves of one muscle share a colour by design
const MERGE = {
  traps:'back', traps_lats:'back',
  deltoids:'shoulders', deltoids_rear:'shoulders',
  forearms:'forearms', forearms_rear:'forearms',
  calves:'calves', calves_rear:'calves',
  tibialis:'shins', shins_rear:'shins',
  triceps_rear:'triceps', glute_med:'glutes', hamstrings:'hamstrings',
}
const M = k => MERGE[k] || k

// Measured from the rendered SVGs, one box per element - never unioning the
// left and right halves of a bilateral pair, since that box spans the torso
// and invents adjacencies (biceps<->abs) that do not exist on screen.
const FRONT_ADJ = [['head','traps'],['deltoids','traps'],['chest','deltoids'],['biceps','deltoids'],['biceps','chest'],['chest','upper_abs'],['biceps','forearms'],['obliques','upper_abs'],['lower_abs','upper_abs'],['lower_abs','obliques'],['hips','obliques'],['inner_quad','lower_abs'],['hips','inner_quad'],['inner_quad','outer_quad'],['knees','outer_quad'],['inner_quad','knees'],['calves','knees'],['knees','tibialis'],['calves','tibialis']]
const REAR_ADJ  = [['deltoids_rear','traps_lats'],['lower_back','traps_lats'],['deltoids_rear','lower_back'],['deltoids_rear','triceps_rear'],['lower_back','triceps_rear'],['lower_back','spine'],['forearms_rear','triceps_rear'],['glute_med','spine'],['glute_med','hips'],['glute_med','hamstrings'],['hamstrings','hips'],['calves_rear','hamstrings'],['calves_rear','shins_rear'],
  // Box proximity misses this one: `spine` is a narrow central column and the
  // lats flank it, so their boxes never came within tolerance - but on screen
  // the two share a long border and merged into one mass when both went magenta.
  ['spine','traps_lats']]

// merged, de-duplicated edge set
const edges = new Set()
;[...FRONT_ADJ, ...REAR_ADJ].forEach(([a, b]) => {
  const [x, y] = [M(a), M(b)].sort()
  if (x !== y) edges.add(`${x}|${y}`)
})
const EDGES = [...edges].map(e => e.split('|'))
const NODES = [...new Set(EDGES.flat())]

// ── pairwise compatibility, computed by the validator ──────────────────
const num = (s, re) => { const m = s.match(re); return m ? parseFloat(m[1]) : null }
const cache = new Map()
function pairStats(c1, c2) {
  const key = [c1, c2].sort().join()
  if (cache.has(key)) return cache.get(key)
  const { report } = validate([c1, c2], { mode: MODE, surface: SURFACE })
  const cvdRow = report.find(r => r[0] === 'CVD separation')
  const norRow = report.find(r => r[0] === 'Normal-vision floor')
  const out = {
    cvd:    num(cvdRow[2], /ΔE ([\d.]+)/),
    normal: num(norRow[2], /ΔE ([\d.]+)/),
    cvdState: cvdRow[1],
  }
  cache.set(key, out)
  return out
}
/* CVD_TARGET 8 is the goal; 6-8 is a documented floor that is legal only with
   secondary encoding. This map has strong secondary encoding - every region
   carries a leader-lined text label, and tapping names the muscle in the card -
   so the floor band is available if the target proves infeasible. The
   normal-vision floor of 15 is hard either way and is never relaxed. */
let CVD_MIN = 8
const compatible = (a, b) => {
  const s = pairStats(a, b)
  return s.cvd >= CVD_MIN && s.normal >= 15
}

// ── contrast + band screening of the hue set itself ────────────────────
console.log(`surface ${SURFACE}, mode ${MODE}\n`)
console.log('hue screening (single-slot checks):')
const usable = {}
for (const [name, hex] of Object.entries({ ...HUES, ...NEUTRALS })) {
  const { report } = validate([hex], { mode: MODE, surface: SURFACE })
  const band     = report.find(r => r[0] === 'Lightness band')
  const chroma   = report.find(r => r[0] === 'Chroma floor')
  const contrast = report.find(r => r[0] === 'Contrast vs surface')
  const bandOk = band[1] === true
  const contrastOk = contrast[1] === 'pass'
  console.log(`  ${name.padEnd(8)} ${hex}  band:${bandOk?'ok ':'OFF'}  chroma:${chroma[1]===true?'ok ':'low'}  contrast:${contrastOk?'ok':'RELIEF'}`)
  if (bandOk && contrastOk) usable[name] = hex
}
const HUE_ORDER = Object.keys(HUES).filter(h => usable[h])
console.log(`\nusable hues: ${HUE_ORDER.join(', ')}`)

// ── greedy colouring, most-constrained node first, with backtracking ────
const degree = Object.fromEntries(NODES.map(n => [n, EDGES.filter(e => e.includes(n)).length]))
const order = [...NODES].sort((a, b) => degree[b] - degree[a])
const neighbours = n => EDGES.filter(e => e.includes(n)).map(e => (e[0] === n ? e[1] : e[0]))

// skull and patella are not trainable - they take a neutral, any neutral that fits
const NEUTRAL_NODES = new Set(['head', 'knees'])

const assign = {}
function candidatesFor(node) {
  const pool = NEUTRAL_NODES.has(node)
    ? Object.values(NEUTRALS)
    : HUE_ORDER.map(h => usable[h])
  // spread hues rather than first-fit, so the map reads as a designed set
  const used = Object.values(assign).reduce((m, h) => (m[h] = (m[h] || 0) + 1, m), {})
  return [...pool].sort((a, b) => (used[a] || 0) - (used[b] || 0))
}
function solve(i) {
  if (i === order.length) return true
  const node = order[i]
  for (const hex of candidatesFor(node)) {
    const ok = neighbours(node).every(nb => !assign[nb] || compatible(hex, assign[nb]))
    if (!ok) continue
    assign[node] = hex
    if (solve(i + 1)) return true
    delete assign[node]
  }
  return false
}

// compatibility matrix - shows which gate is binding
const ALL = { ...usable, ...NEUTRALS }
const names = Object.keys(ALL)
console.log('\npairwise (cvd / normal), * = fails cvd>=8, X = fails normal>=15:')
console.log('           ' + names.map(n => n.slice(0, 6).padEnd(7)).join(''))
for (const a of names) {
  let row = '  ' + a.padEnd(9)
  for (const b of names) {
    if (a === b) { row += '  --   '; continue }
    const s = pairStats(ALL[a], ALL[b])
    const flag = s.normal < 15 ? 'X' : s.cvd < 8 ? '*' : ' '
    row += `${s.cvd.toFixed(0)}/${s.normal.toFixed(0)}${flag}`.padEnd(7)
  }
  console.log(row)
}

let solved = solve(0)
if (!solved) {
  console.log('\nno solution at CVD target 8 - retrying in the documented 6-8 floor band')
  CVD_MIN = 6
  cache.clear()
  for (const k of Object.keys(assign)) delete assign[k]
  solved = solve(0)
}
console.log(`\nsolved: ${solved} (CVD_MIN ${CVD_MIN})   nodes: ${NODES.length}   merged edges: ${EDGES.length}`)
if (!solved) process.exit(1)

const nameOf = hex => Object.entries({ ...HUES, ...NEUTRALS }).find(([, v]) => v === hex)?.[0]
console.log('\nassignment:')
Object.entries(assign).sort().forEach(([n, hex]) =>
  console.log(`  ${n.padEnd(12)} ${hex}  ${nameOf(hex)}`))

// ── verify EVERY adjacent pair in the original per-view graphs ──────────
let worstCvd = [99], worstNor = [99], hardFails = 0
const floorBand = []
for (const [view, list] of [['front', FRONT_ADJ], ['rear', REAR_ADJ]]) {
  for (const [a, b] of list) {
    const ca = assign[M(a)], cb = assign[M(b)]
    if (!ca || !cb) continue
    if (ca === cb) { console.log(`  !! ${view} ${a}/${b} share ${ca}`); hardFails++; continue }
    const s = pairStats(ca, cb)
    if (s.cvd < worstCvd[0]) worstCvd = [s.cvd, `${view} ${a}/${b}`]
    if (s.normal < worstNor[0]) worstNor = [s.normal, `${view} ${a}/${b}`]
    // normal-vision below 15 is a hard fail; CVD 6-8 is the documented floor band
    if (s.normal < 15) { console.log(`  HARD FAIL ${view} ${a}/${b} normal ΔE ${s.normal}`); hardFails++ }
    else if (s.cvd < 8) floorBand.push(`${view} ${a}/${b} (cvd ${s.cvd.toFixed(1)})`)
  }
}
console.log(`\nverification over ${FRONT_ADJ.length + REAR_ADJ.length} real adjacent pairs:`)
console.log(`  hard failures            : ${hardFails}`)
console.log(`  in CVD 6-8 floor band    : ${floorBand.length}${floorBand.length ? ' -> ' + floorBand.join(', ') : ''}`)
console.log(`  worst CVD ΔE             : ${worstCvd[0].toFixed(1)}  (${worstCvd[1]})   target >= 8`)
console.log(`  worst normal-vision ΔE   : ${worstNor[0].toFixed(1)}  (${worstNor[1]})   hard floor >= 15`)
if (floorBand.length) console.log('\n  floor-band pairs are legal here: every region carries a leader-lined\n  text label and names itself in the card on tap, so hue never carries\n  identity alone.')
