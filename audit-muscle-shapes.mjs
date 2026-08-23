/**
 * Audits the muscle shapes inside the body line for two things:
 *   1. corner sharpness  - tangent breaks between consecutive curve segments
 *   2. fill integrity    - sub-paths, fill-rule holes, and stroke-only paths
 *      that would leave a group looking gappy rather than solid.
 * Read-only.
 */
import { readFileSync } from 'fs'

const FILES = {
  front: 'src/assets/body/axios_front_new.svg',
  rear:  'src/assets/body/axios_rear_new.svg',
}
const STRUCTURAL = new Set(['body_line', 'head'])

const mag = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1])

function parseAbs(d) {
  const t = d.match(/[MmCcZzLlHhVvQqSsAaTt]/g) || []
  if (t.some(c => !'MCZmcz'.includes(c)) || /[mcz]/.test(d)) return null
  const v = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number)
  let i = 0, cur = null
  const subpaths = []
  let segs = [], closed = false
  for (const cmd of t) {
    if (cmd === 'M') {
      if (segs.length) { subpaths.push({ segs, closed }); segs = []; closed = false }
      cur = [v[i++], v[i++]]
    } else if (cmd === 'C') {
      const c1 = [v[i++], v[i++]], c2 = [v[i++], v[i++]], p = [v[i++], v[i++]]
      segs.push({ c1, c2, p1: p }); cur = p
    } else if (cmd === 'Z') closed = true
  }
  if (segs.length) subpaths.push({ segs, closed })
  return subpaths
}

for (const [view, file] of Object.entries(FILES)) {
  const svg = readFileSync(file, 'utf8')

  // slice the file into <g id="X"> ... blocks so paths attribute to a group
  const groups = {}
  const re = /<(g|path)\s+id="([^"]+)"/g
  let m, marks = []
  while ((m = re.exec(svg))) marks.push({ tag: m[1], id: m[2], at: m.index })
  marks.push({ id: '__end', at: svg.length })

  for (let k = 0; k < marks.length - 1; k++) {
    const { id, at } = marks[k]
    if (STRUCTURAL.has(id) || /^Frame|^clip/.test(id)) continue
    const chunk = svg.slice(at, marks[k + 1].at)
    const ds = [...chunk.matchAll(/\sd="([^"]+)"/g)].map(x => x[1])
    if (!ds.length) continue

    let nodes = 0, soft = 0, mid = 0, sharp = 0, cusp = 0, degenerate = 0
    let subpathCount = 0, openPaths = 0
    const evenodd = (chunk.match(/fill-rule="evenodd"/g) || []).length
    const strokeOnly = (chunk.match(/fill="none"/g) || []).length

    for (const d of ds) {
      const subs = parseAbs(d)
      if (!subs) continue
      subpathCount += subs.length
      for (const { segs, closed } of subs) {
        if (!closed) openPaths++
        if (segs.length < 2) continue
        const joins = []
        for (let a = 0; a < segs.length - 1; a++) joins.push([segs[a], segs[a + 1]])
        if (closed && segs.length > 2) joins.push([segs[segs.length - 1], segs[0]])
        for (const [a, b] of joins) {
          const node = a.p1
          const iL = mag(a.c2, node), oL = mag(node, b.c1)
          if (iL < 1e-6 || oL < 1e-6) { degenerate++; continue }
          nodes++
          const iD = [(node[0] - a.c2[0]) / iL, (node[1] - a.c2[1]) / iL]
          const oD = [(b.c1[0] - node[0]) / oL, (b.c1[1] - node[1]) / oL]
          const dot = Math.max(-1, Math.min(1, iD[0] * oD[0] + iD[1] * oD[1]))
          const dev = Math.acos(dot) * 180 / Math.PI
          if (dev >= 150) cusp++
          else if (dev > 45) sharp++
          else if (dev > 12) mid++
          else soft++
        }
      }
    }
    groups[id] = { nodes, soft, mid, sharp, cusp, degenerate, subpathCount, openPaths, evenodd, strokeOnly, paths: ds.length }
  }

  const rows = Object.entries(groups)
  const tot = rows.reduce((a, [, g]) => ({
    nodes: a.nodes + g.nodes, mid: a.mid + g.mid, sharp: a.sharp + g.sharp,
    cusp: a.cusp + g.cusp, degenerate: a.degenerate + g.degenerate,
    evenodd: a.evenodd + g.evenodd, strokeOnly: a.strokeOnly + g.strokeOnly,
    subpathCount: a.subpathCount + g.subpathCount, openPaths: a.openPaths + g.openPaths,
  }), { nodes:0, mid:0, sharp:0, cusp:0, degenerate:0, evenodd:0, strokeOnly:0, subpathCount:0, openPaths:0 })

  console.log(`\n================= ${view.toUpperCase()} =================`)
  console.log('group              nodes  soft  12-45  45-150  cusp  degen  subs  open  eo  strokeOnly')
  rows.sort((a, b) => (b[1].sharp + b[1].mid) - (a[1].sharp + a[1].mid))
  for (const [id, g] of rows) {
    console.log(
      `${id.padEnd(19)}${String(g.nodes).padStart(5)}${String(g.soft).padStart(6)}` +
      `${String(g.mid).padStart(7)}${String(g.sharp).padStart(8)}${String(g.cusp).padStart(6)}` +
      `${String(g.degenerate).padStart(7)}${String(g.subpathCount).padStart(6)}` +
      `${String(g.openPaths).padStart(6)}${String(g.evenodd).padStart(4)}${String(g.strokeOnly).padStart(12)}`)
  }
  console.log(`TOTAL              ${String(tot.nodes).padStart(5)}${String(tot.nodes-tot.mid-tot.sharp-tot.cusp).padStart(6)}` +
    `${String(tot.mid).padStart(7)}${String(tot.sharp).padStart(8)}${String(tot.cusp).padStart(6)}` +
    `${String(tot.degenerate).padStart(7)}${String(tot.subpathCount).padStart(6)}` +
    `${String(tot.openPaths).padStart(6)}${String(tot.evenodd).padStart(4)}${String(tot.strokeOnly).padStart(12)}`)
}
console.log(`
soft   <=12deg  already smooth
12-45  candidates for smoothing - a visible angle on a shape meant to curve
45-150 hard corners - often deliberate (muscle insertions, tapered ends)
cusp   >=150deg direction reversal - striation tips, must never be smoothed
open   sub-paths with no Z: they still fill, but the closing edge is implied
eo     fill-rule="evenodd" - sub-paths punch holes, a real source of gaps`)
