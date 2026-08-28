import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import frontSVGv2 from '../../assets/body/axios_front_v2.svg?raw'
import rearSVGv2  from '../../assets/body/axios_rear_v2.svg?raw'
import {
  PAIR_TO_LEGACY_V2, PAIR_TO_DB_V2, LEGACY_TO_PAIRS_V2,
  pickFour, pairsForLegacyIn, viewForLegacyIn, recentlyTrainedPairsIn,
} from './muscleMapBridge'
import { DB } from './WorkoutGuide'
import ExerciseRow, { ExerciseRowStyles } from './ExerciseRow'

/* ────────────────────────────────────────────────────────────
   Secondary build - Frame_Front_Figma / Frame_Rear_Figma.

   Every id below was verified present in the two source sheets
   before this component was written: 30 ids on the front, 29 on
   the rear, no misses in either direction.

   The two figures are NOT the same width (900 vs 750) while
   sharing a height of 1944, so the container aspect ratio has to
   switch with the view or the rear figure renders stretched.
   ──────────────────────────────────────────────────────────── */

const FRONT_MUSCLE_PAIRS = {
  // unified singles
  upper_abs:  ['upper_abs'],
  lower_abs:  ['lower_abs'],
  // bilateral pairs
  traps:      ['traps_left',       'traps_right'],
  deltoids:   ['deltoids_left',    'deltoids_right'],
  chest:      ['chest_left',       'chest_right'],
  biceps:     ['biceps_left',      'biceps_right'],
  forearms:   ['forearms_left',    'forearms_right'],
  obliques:   ['obliques_left',    'obliques_right'],
  quads:      ['quads_left',       'quads_right'],
  tibialis:   ['tibialis_left',    'tibialis_right'],
  calves:     ['calves_left',      'calves_right'],
  elbows:     ['elbow_joint_left', 'elbow_joint_right'],
  /* One shape per leg covering thigh mass, lower-leg background and foot,
     with holes where quads, tibialis and calves sit. Figma named it "shins",
     but #tibialis is the actual shin muscle - this is the surrounding leg
     mass, so it carries the Hamstrings label. Keyed _front because the rear
     sheet has its own `hamstrings` and the merged name/colour maps require
     the two views to stay disjoint. */
  hamstrings_front: ['shins_left', 'shins_right'],
}

const REAR_MUSCLE_PAIRS = {
  spine:         ['spine'],
  traps_lats:    ['traps_lats_left',      'traps_lats_right'],
  deltoids_rear: ['deltoids_rear_left',   'deltoids_rear_right'],
  infraspinatus: ['infraspinatus_left',   'infraspinatus_right'],
  triceps_rear:  ['triceps_rear_left',    'triceps_rear_right'],
  forearms_rear: ['forearms_rear_left',   'forearms_rear_right'],
  lower_back:    ['lower_back_left',      'lower_back_right'],
  obliques_rear: ['obliques_rear_left',   'obliques_rear_right'],
  glute_med:     ['glute_med_left',       'glute_med_right'],
  hamstrings:    ['hamstrings_rear_left', 'hamstrings_rear_right'],
  shins_rear:    ['shins_rear_left',      'shins_rear_right'],
  calves_rear:   ['calves_rear_left',     'calves_rear_right'],
}

/* Structural regions. Left with the fills Figma authored and taken out of
   hit-testing, so a tap near a hand or the head never selects anything. */
const STRUCTURAL = {
  front: ['head', 'branded_shorts', 'fist_left', 'fist_right'],
  rear:  ['head', 'shorts_rear', 'hand_rear_left', 'hand_rear_right',
          'foot_rear_left', 'foot_rear_right'],
}

/* Body fill, NOT a muscle. #midsection is 553x639 covering the whole torso
   from neck to hips and painting before everything else, so it is the
   surface the chest, abs and obliques sit on and it shows through the gaps
   between them. Colouring it as a muscle gives an orange slab across the
   torso. The rear sheet has no equivalent; every region there is a real
   muscle. */
const BODY_BASE = {
  front: ['midsection'],
  rear:  [],
}

/* The surface the muscle hues sit on. Carried over from the primary build,
   where it was measured as the lightest value that keeps every hue above 3:1
   against it. */
const BODY_FILL = '#1c2431'

/* Silhouette treatment. The artwork outlines the figure in black line art,
   which is invisible against the near-black page - the feet and the outer
   leg edge disappear. A white stroke on the body fill plus a soft glow on
   the whole figure gives the silhouette back its edge, matching how the
   primary build draws its #body_line. */
const OUTLINE_STROKE = 'rgba(255,255,255,0.9)'
const OUTLINE_WIDTH  = '1.5'

/* Front and rear key sets are disjoint here (deltoids vs deltoids_rear, and
   so on), so one merged name/colour map is unambiguous. MuscleMapNew could
   not do this because `hips` existed in both of its sheets. */
const MUSCLE_NAMES = {
  // front
  upper_abs:'Upper Abs', lower_abs:'Lower Abs',
  traps:'Trapezius', deltoids:'Shoulders', chest:'Chest', biceps:'Biceps',
  forearms:'Forearms', obliques:'Obliques', quads:'Quads', tibialis:'Shins',
  calves:'Calves', elbows:'Elbows', hamstrings_front:'Hamstrings',
  // rear
  spine:'Spine', traps_lats:'Back', deltoids_rear:'Shoulders',
  infraspinatus:'Infraspinatus', triceps_rear:'Triceps',
  forearms_rear:'Forearms', lower_back:'Lower Back', obliques_rear:'Obliques',
  glute_med:'Glutes', hamstrings:'Hamstrings', shins_rear:'Shins',
  calves_rear:'Calves',
}

const SCIENTIFIC_NAMES = {
  // front
  upper_abs:'Rectus Abdominis (Upper)', lower_abs:'Rectus Abdominis (Lower)',
  traps:'Trapezius', deltoids:'Deltoideus',
  chest:'Pectoralis Major', biceps:'Biceps Brachii',
  forearms:'Flexors & Extensors', obliques:'Obliquus Externus',
  quads:'Quadriceps / Adductors', tibialis:'Tibialis Anterior',
  calves:'Gastrocnemius', elbows:'Elbow Joint',
  hamstrings_front:'Biceps Femoris',
  // rear
  spine:'Erector Spinae', traps_lats:'Trapezius / Latissimus Dorsi',
  deltoids_rear:'Posterior Deltoid', infraspinatus:'Infraspinatus',
  triceps_rear:'Triceps Brachii', forearms_rear:'Extensor Group',
  lower_back:'Erector Spinae', obliques_rear:'Obliquus Externus',
  glute_med:'Gluteus Medius / Maximus', hamstrings:'Biceps Femoris',
  shins_rear:'Tibialis Anterior', calves_rear:'Gastrocnemius',
}

const MUSCLE_COLORS = {
  // front
  upper_abs:'#9B59B6', lower_abs:'#2ECC71',
  traps:'#1ABC9C',     deltoids:'#3498DB',  chest:'#E91E8C',
  biceps:'#9B59B6',    forearms:'#E74C3C',  obliques:'#27AE60',
  quads:'#A855F7',     tibialis:'#F39C12',
  calves:'#27AE60',    elbows:'#7F8C8D',
  hamstrings_front:'#C0392B',
  // rear
  spine:'#00CED1',         traps_lats:'#1ABC9C',    deltoids_rear:'#3498DB',
  infraspinatus:'#E67E22', triceps_rear:'#9B59B6',  forearms_rear:'#E74C3C',
  lower_back:'#27AE60',    obliques_rear:'#F39C12', glute_med:'#A855F7',
  hamstrings:'#2C3E50',    shins_rear:'#2ECC71',    calves_rear:'#27AE60',
}

/* Label columns, per the left/right split in the spec. */
const LABELS = {
  front: {
    left:  ['biceps', 'forearms', 'quads', 'hamstrings_front', 'tibialis'],
    right: ['deltoids', 'chest', 'upper_abs', 'obliques', 'calves'],
  },
  rear: {
    left:  ['deltoids_rear', 'triceps_rear', 'forearms_rear', 'hamstrings'],
    right: ['traps_lats', 'glute_med', 'calves_rear'],
  },
}

/* One box for both views, shaped to the WIDER sheet.

   The two figures share a height of 1944 user units and differ only in
   canvas width (900 front, 750 rear), so matching the rendered height is
   what makes the two bodies the same size. Giving each view its own aspect
   ratio at a fixed container width does the opposite: it holds the width
   equal and lets the height float, which scaled the rear to 900/750 = 1.2x
   the front - measurably 486px tall against 403px.

   Sized to the front, the rear (narrower than the box) is fitted by height
   by preserveAspectRatio="xMidYMid meet" and centred, so both render at the
   same scale and the rear simply occupies less horizontal room - which is
   correct, because it is a narrower drawing. */
const FIGURE_BOX = '900 / 1944'

/* One glow filter per colour rather than a single filter reading
   var(--glow-color).

   A custom property set on the element that REFERENCES a filter is not in
   scope inside that filter's own feFlood flood-color, so the shared-filter
   form resolves to the fallback and every muscle glows the same colour. The
   current live model already solved it this way; keeping the same approach
   is what actually reproduces its look. */
const ALL_COLORS = [...new Set(Object.values(MUSCLE_COLORS))]
const glowId = c => `glowv2_${c.replace('#', '')}`

const DEFS = `
<defs id="axios_v2_defs">
  <filter id="bodyGlowV2" x="-12%" y="-6%" width="124%" height="112%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feFlood flood-color="#FFFFFF" flood-opacity="0.8" result="color"/>
    <feComposite in="color" in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="hoverGlowV2" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feFlood flood-color="#FFFFFF" flood-opacity="0.4" result="color"/>
    <feComposite in="color" in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  ${ALL_COLORS.map(c => `
  <filter id="${glowId(c)}" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feFlood flood-color="${c}" flood-opacity="0.7" result="color"/>
    <feComposite in="color" in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`).join('')}
</defs>`

/* A region is a <g> of paths on the front sheet; on the rear, #head is a bare
   <path>. querySelectorAll('*') returns nothing for a bare path, which would
   leave that region unpainted, so fall back to the element itself. */
function paintTargets(el) {
  if (!el) return []
  if (el.tagName.toLowerCase() !== 'g') return [el]
  return Array.from(el.querySelectorAll('*')).filter(n => n.tagName.toLowerCase() !== 'g')
}

/* Figma writes width/height onto <svg>; both have to go or the figure renders
   at its intrinsic pixel size and ignores the container. The authored viewBox
   is correct on both sheets, so it is left alone. */
function injectSVG(rawSVG, containerEl) {
  containerEl.innerHTML = rawSVG
    .replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1')
    .replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1')

  const svg = containerEl.querySelector('svg')
  if (!svg) return null
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  svg.style.display  = 'block'
  svg.style.overflow = 'visible'
  return svg
}

/* Accepts both the MuscleMapView prop shape (workouts / onLogWorkout /
   defaultSelected / defaultView) and the newer activeMuscles / onMusclePress
   form, so it drops into either call site unchanged. */
export default function MuscleMapV2({
  workouts = [],
  onLogWorkout,
  onSaveExercise,
  defaultSelected = null,
  defaultView = 'anterior',
  activeMuscles = [],
  onMusclePress,
  view: viewProp,
  interactive = true,
  context = 'fitguide',
}) {
  const initialView =
    viewProp === 'rear' || viewProp === 'front' ? viewProp
    : (defaultSelected && viewForLegacyIn(LEGACY_TO_PAIRS_V2, defaultSelected))
      || (defaultView === 'posterior' ? 'rear' : 'front')

  const [view, setView]           = useState(initialView)
  const [active, setActive]       = useState(null)
  const [hovered, setHovered]     = useState(null)
  const [exercises, setExercises] = useState([])
  const [spinning, setSpinning]   = useState(false)
  const containerRef = useRef(null)

  useEffect(() => { if (viewProp) setView(viewProp) }, [viewProp])

  const pairs = view === 'front' ? FRONT_MUSCLE_PAIRS : REAR_MUSCLE_PAIRS

  useEffect(() => {
    if (!defaultSelected) return
    const [first] = pairsForLegacyIn(LEGACY_TO_PAIRS_V2, defaultSelected, view)
    if (first) setActive(first)
  }, [defaultSelected, view])

  /* Regions lit without a tap. An explicit list wins; otherwise only the
     recovery context derives them from history - the Fit Guide is meant to
     show every muscle fully coloured and un-glowed at rest. */
  const highlighted = useMemo(() => {
    if (activeMuscles.length) return activeMuscles
    if (context === 'recovery') return recentlyTrainedPairsIn(LEGACY_TO_PAIRS_V2, workouts, view)
    return []
  }, [activeMuscles, context, workouts, view])

  const emitPress = useCallback((pairKey) => {
    onMusclePress?.(pairKey)
    const legacy = PAIR_TO_LEGACY_V2[pairKey]
    if (legacy) onLogWorkout?.(legacy)
  }, [onMusclePress, onLogWorkout])

  /* ── inject + wire delegated events (once per view) ── */
  useEffect(() => {
    const host = containerRef.current
    if (!host) return

    const svg = injectSVG(view === 'front' ? frontSVGv2 : rearSVGv2, host)
    if (!svg) return
    svg.insertAdjacentHTML('afterbegin', DEFS)

    /* Glow the figure as a whole rather than any one shape. Every region is
       opaque and they tile without gaps, so the composite alpha of the root
       group IS the silhouette - the halo lands on the outer contour only,
       and internal boundaries between adjacent muscles produce no alpha edge
       to glow. Doing it here rather than in paint() keeps it off the hot
       path; filters do not affect hit-testing of the content inside. */
    const root = svg.querySelector('g[id^="Frame"]')
    if (root) root.setAttribute('filter', 'url(#bodyGlowV2)')

    /* Structural regions keep their authored Figma fills (the tan head, the
       branded shorts, the fists) and only come out of hit-testing. */
    STRUCTURAL[view].forEach(id => {
      const el = svg.getElementById(id)
      if (!el) return
      el.setAttribute('pointer-events', 'none')
      paintTargets(el).forEach(n => n.setAttribute('pointer-events', 'none'))
    })

    /* Body fill. Figma authored these in the same bright placeholder palette
       as the muscles (#34C759, #00C3D0, #FF383C), so unlike the structural
       regions above they DO have to be repainted, or the figure reads as a
       colour test sheet. */
    BODY_BASE[view].forEach(id => {
      const el = svg.getElementById(id)
      if (!el) return
      paintTargets(el).forEach(n => {
        n.setAttribute('fill', BODY_FILL); n.style.fill = BODY_FILL
        n.setAttribute('fill-opacity', '1')
        n.setAttribute('stroke', OUTLINE_STROKE)
        n.setAttribute('stroke-width', OUTLINE_WIDTH)
      })
      el.setAttribute('pointer-events', 'none')
    })

    Object.entries(pairs).forEach(([pairKey, ids]) => {
      ids.forEach(id => {
        const el = svg.getElementById(id)
        if (!el) { console.warn(`MuscleMapV2: #${id} not found`); return }
        el.dataset.pair = pairKey
        // children first: for a bare <path> region paintTargets returns the
        // element itself, so doing this after the line below would overwrite
        // its own pointer-events and kill the hit area
        if (el.tagName.toLowerCase() === 'g') {
          paintTargets(el).forEach(n => n.setAttribute('pointer-events', 'inherit'))
        }
        el.setAttribute('pointer-events', interactive ? 'all' : 'none')
        el.style.cursor = interactive ? 'pointer' : 'default'
      })
    })

    if (!interactive) return

    /* One delegated listener on the root rather than a pair per region: 26
       regions x 4 events is a lot of teardown to get exactly right on every
       view switch. click covers tap on iOS Safari without the synthetic
       touchend handler, which would otherwise fire the toggle twice. */
    const findPair = e => {
      const node = e.target
      if (!node || !node.closest) return null
      const owner = node.closest('[data-pair]')
      return owner ? owner.dataset.pair : null
    }
    const onClick = e => {
      const p = findPair(e); if (!p) return
      setActive(prev => (prev === p ? null : p))
      onMusclePress?.(p)
    }
    const onOver = e => { const p = findPair(e); if (p) setHovered(p) }
    const onOut  = e => { const p = findPair(e); if (p) setHovered(h => (h === p ? null : h)) }

    svg.addEventListener('click', onClick)
    svg.addEventListener('mouseover', onOver)
    svg.addEventListener('mouseout', onOut)
    return () => {
      svg.removeEventListener('click', onClick)
      svg.removeEventListener('mouseover', onOver)
      svg.removeEventListener('mouseout', onOut)
    }
  }, [view, interactive, onMusclePress, pairs])

  /* ── paint state (no re-injection, so hover stays cheap) ── */
  const paint = useCallback(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return
    Object.entries(pairs).forEach(([pairKey, ids]) => {
      const color    = MUSCLE_COLORS[pairKey] || '#7F8C8D'
      const isActive = active === pairKey || highlighted.includes(pairKey)
      const isHover  = !isActive && hovered === pairKey

      ids.forEach(id => {
        const el = svg.getElementById(id)
        if (!el) return
        paintTargets(el).forEach(n => {
          // attribute AND inline style: Figma writes a presentation attribute
          // on every path, and inline style is what reliably wins over it
          n.setAttribute('fill', color);       n.style.fill = color
          n.setAttribute('fill-opacity', '1'); n.style.fillOpacity = '1'
          n.setAttribute('stroke',
            isActive ? 'rgba(255,255,255,0.9)' : isHover ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)')
          n.setAttribute('stroke-width', isActive ? '2' : isHover ? '1' : '0.5')
          n.style.transition = 'stroke 0.15s ease, stroke-width 0.15s ease'
        })
        if (isActive)     el.setAttribute('filter', `url(#${glowId(color)})`)
        else if (isHover) el.setAttribute('filter', 'url(#hoverGlowV2)')
        else              el.removeAttribute('filter')
      })
    })
  }, [pairs, active, hovered, highlighted])

  useEffect(() => { paint() })

  /* ── anchor labels to real muscle geometry ──────────────────────────
     An evenly-spaced column drifts out of register with the figure, so each
     label is measured against the muscle it names. getScreenCTM maps SVG user
     units through whatever scaling preserveAspectRatio applied, which keeps
     this correct at any container width - and across the 900/750 width change
     between the two sheets. */
  const wrapperRef = useRef(null)
  const [layout, setLayout] = useState({ w: 0, h: 0, anchors: {} })

  const measure = useCallback(() => {
    const wrap = wrapperRef.current
    const svg  = containerRef.current?.querySelector('svg')
    if (!wrap || !svg) return
    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const wrapBox = wrap.getBoundingClientRect()
    const pt = svg.createSVGPoint()
    const toWrap = (x, y) => {
      pt.x = x; pt.y = y
      const s = pt.matrixTransform(ctm)
      return { x: s.x - wrapBox.left, y: s.y - wrapBox.top }
    }

    const anchors = {}
    ;['left', 'right'].forEach(side => {
      LABELS[view][side].forEach(key => {
        let best = null
        ;(pairs[key] || []).forEach(id => {
          const el = svg.getElementById(id)
          if (!el) return
          let b
          try { b = el.getBBox() } catch { return }
          if (!b || !b.width) return
          // a left label points at the left-most of a bilateral pair
          const edgeX = side === 'left' ? b.x : b.x + b.width
          const better = !best || (side === 'left' ? edgeX < best.edgeX : edgeX > best.edgeX)
          if (better) best = { edgeX, cy: b.y + b.height / 2 }
        })
        if (best) anchors[key] = { ...toWrap(best.edgeX, best.cy), side }
      })
    })

    setLayout(prev => {
      const unchanged =
        Math.abs(prev.w - wrapBox.width) < 0.5 &&
        Math.abs(prev.h - wrapBox.height) < 0.5 &&
        Object.keys(anchors).length === Object.keys(prev.anchors).length &&
        Object.entries(anchors).every(([k, v]) =>
          prev.anchors[k] &&
          Math.abs(prev.anchors[k].x - v.x) < 0.5 &&
          Math.abs(prev.anchors[k].y - v.y) < 0.5)
      return unchanged ? prev : { w: wrapBox.width, h: wrapBox.height, anchors }
    })
  }, [view, pairs])

  useEffect(() => {
    // two frames: the first lets the injected SVG lay out, the second measures
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(measure) })
    const ro = new ResizeObserver(measure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => {
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); ro.disconnect()
    }
  }, [measure])

  /* Place labels at their muscle's height, resolving overlap by centring each
     colliding cluster on its members' mean rather than pushing the stack down
     - a push-down pass turns one near-coincident pair into cascading drift for
     every label beneath it. */
  const LABEL_SLOT = 32
  const placed = useMemo(() => {
    const out = {}
    ;['left', 'right'].forEach(side => {
      const items = LABELS[view][side]
        .map(key => ({ key, target: layout.anchors[key]?.y }))
        .filter(i => typeof i.target === 'number')
        .sort((a, b) => a.target - b.target)
      if (!items.length || !layout.h) return

      // merge overlapping runs into blocks, each centred on its own mean
      let blocks = items.map((it, i) => ({ start: i, count: 1, sum: it.target }))
      for (let merged = true; merged;) {
        merged = false
        for (let i = 0; i < blocks.length - 1; i++) {
          const a = blocks[i], b = blocks[i + 1]
          const aBottom = a.sum / a.count + ((a.count - 1) / 2) * LABEL_SLOT
          const bTop    = b.sum / b.count - ((b.count - 1) / 2) * LABEL_SLOT
          if (bTop - aBottom < LABEL_SLOT) {
            blocks[i] = { start: a.start, count: a.count + b.count, sum: a.sum + b.sum }
            blocks.splice(i + 1, 1)
            merged = true
            break
          }
        }
      }

      const ys = []
      blocks.forEach(b => {
        const top = b.sum / b.count - ((b.count - 1) / 2) * LABEL_SLOT
        for (let k = 0; k < b.count; k++) ys[b.start + k] = top + k * LABEL_SLOT
      })

      // keep the whole column inside the figure box
      const minY = LABEL_SLOT / 2
      const maxY = layout.h - LABEL_SLOT / 2
      const shift = Math.max(0, minY - ys[0]) - Math.max(0, ys[ys.length - 1] - maxY)
      if (shift) ys.forEach((_, i) => { ys[i] += shift })

      items.forEach((it, i) => { out[it.key] = ys[i] })
    })
    return out
  }, [layout, view])

  const selected = active && MUSCLE_NAMES[active] ? active : null

  /* Exercises come from the same WorkoutGuide DB the live model uses, so the
     rows, the Log handler and the Watch links all carry over unchanged. */
  const entry = selected ? DB[PAIR_TO_DB_V2[selected]] : null

  useEffect(() => {
    setExercises(entry?.exercises ? pickFour(entry.exercises) : [])
  }, [entry])

  const handleShuffle = () => {
    if (!entry?.exercises) return
    setSpinning(true)
    setExercises(pickFour(entry.exercises))
    setTimeout(() => setSpinning(false), 460)
  }

  /* ── labels ── */
  const labelStyle = key => {
    const isActive = selected === key
    const dimmed   = selected && !isActive
    const color    = MUSCLE_COLORS[key] || '#7F8C8D'
    return {
      name: isActive ? color : dimmed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
      sci:  isActive ? `${color}CC` : dimmed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)',
      line: isActive ? color : dimmed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
      solid: isActive,
    }
  }

  const LABEL_W = 88

  const renderLabel = (key, side) => {
    const y = placed[key]
    if (y == null) return null
    const s = labelStyle(key)
    return (
      <div key={key}
        onClick={() => interactive && (setActive(p => p === key ? null : key), onMusclePress?.(key))}
        style={{
          position:'absolute', top:y, [side]:0, transform:'translateY(-50%)',
          width:LABEL_W, textAlign: side === 'left' ? 'right' : 'left',
          cursor: interactive ? 'pointer' : 'default',
          transition:'top .3s cubic-bezier(.16,1,.3,1)',
        }}>
        <p style={{
          margin:0, fontSize:12.5, fontWeight:600, letterSpacing:'.04em',
          color:s.name, transition:'color .2s ease', whiteSpace:'nowrap',
          overflow:'hidden', textOverflow:'ellipsis',
        }}>{MUSCLE_NAMES[key]}</p>
        <p style={{
          margin:0, fontSize:9.5, fontStyle:'italic', color:s.sci,
          transition:'color .2s ease', whiteSpace:'nowrap',
          overflow:'hidden', textOverflow:'ellipsis',
        }}>{SCIENTIFIC_NAMES[key]}</p>
      </div>
    )
  }

  /* Leader lines: short horizontal run off the label, then a diagonal into
     the muscle edge - so a nudged label still reads unambiguously. */
  const renderLeaders = () => {
    if (!layout.w || !layout.h) return null
    return (
      <svg
        width={layout.w} height={layout.h}
        viewBox={`0 0 ${layout.w} ${layout.h}`}
        style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible' }}>
        {Object.entries(placed).map(([key, y]) => {
          const a = layout.anchors[key]
          if (!a) return null
          const s    = labelStyle(key)
          const left = a.side === 'left'
          const lx   = left ? LABEL_W + 5 : layout.w - LABEL_W - 5
          const bend = left ? Math.max(lx + 4, a.x - 10) : Math.min(lx - 4, a.x + 10)
          return (
            <polyline key={key}
              points={`${lx},${y} ${bend},${y} ${a.x},${a.y}`}
              fill="none"
              stroke={s.line}
              strokeWidth={s.solid ? 1.5 : 1}
              strokeDasharray={s.solid ? 'none' : '3 3'}
              style={{ transition:'stroke .2s ease' }} />
          )
        })}
      </svg>
    )
  }

  const pillStyle = isActive => ({
    padding:'6px 24px', borderRadius:20,
    border:`1px solid ${isActive ? '#00CED1' : 'rgba(255,255,255,0.2)'}`,
    background:'transparent',
    color:isActive ? '#00CED1' : 'rgba(255,255,255,0.4)',
    fontFamily:'inherit', fontSize:13, letterSpacing:'.08em', cursor:'pointer',
  })

  return (
    <div style={{ width:'100%' }}>
      <ExerciseRowStyles />

      {/* front / back toggle */}
      <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:'1.1rem' }}>
        <button style={pillStyle(view === 'front')} onClick={() => { setView('front'); setActive(null) }}>FRONT</button>
        <button style={pillStyle(view === 'rear')}  onClick={() => { setView('rear');  setActive(null) }}>BACK</button>
      </div>

      {/* figure with anchored labels */}
      <div ref={wrapperRef} style={{ position:'relative', width:'100%', overflow:'visible' }}>
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div
            key={view}
            ref={containerRef}
            style={{
              width:'46%', minWidth:140, maxWidth:250,
              aspectRatio: FIGURE_BOX,
              overflow:'visible', position:'relative',
            }}
          />
        </div>
        {renderLeaders()}
        {LABELS[view].left.map(k => renderLabel(k, 'left'))}
        {LABELS[view].right.map(k => renderLabel(k, 'right'))}
      </div>

      {/* bottom info card */}
      <div style={{
        marginTop:'1.2rem', background:'rgba(20,25,45,0.85)',
        border:'1px solid rgba(255,255,255,0.1)', borderRadius:12,
        padding:'1.5rem', textAlign:'center', color:'rgba(255,255,255,0.6)',
      }}>
        {!selected ? (
          <>
            <div style={{ fontSize:22, marginBottom:8, opacity:.7 }}>&#8853;</div>
            <p style={{ margin:0, fontSize:14 }}>Tap a muscle on the model</p>
            <p style={{ margin:'2px 0 0', fontSize:14 }}>to see activation details</p>
            <p style={{ margin:'10px 0 0', fontSize:11, opacity:.6 }}>
              Exercises &middot; Recovery &middot; Scientific name
            </p>
            <p style={{ margin:'14px 0 0', fontSize:11, letterSpacing:'.12em', opacity:.5 }}>
              &or; TAP TO OPEN
            </p>
          </>
        ) : (
          <>
            <p style={{
              margin:'0 0 4px', fontSize:15, fontWeight:600, letterSpacing:'.04em',
              color:MUSCLE_COLORS[selected] || '#fff',
            }}>{MUSCLE_NAMES[selected]}</p>
            <p style={{ margin:'0 0 14px', fontSize:11, fontStyle:'italic', opacity:.65 }}>
              {SCIENTIFIC_NAMES[selected]}
            </p>

            {entry?.desc && (
              <p style={{
                margin:'0 0 14px', fontSize:11.5, lineHeight:1.55, textAlign:'left',
                color:'rgba(255,255,255,0.55)',
              }}>{entry.desc}</p>
            )}

            {exercises.length > 0 && (
              <div style={{ textAlign:'left', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:3, height:12, background:'#ffffff', borderRadius:2, boxShadow:'0 0 6px rgba(255,255,255,0.7)' }}/>
                  <p style={{
                    color:'rgba(255,255,255,0.85)', fontSize:9, letterSpacing:'0.22em',
                    textTransform:'uppercase', fontWeight:700, flex:1, margin:0,
                  }}>Exercises</p>
                  <button onClick={handleShuffle} style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'4px 9px', borderRadius:7,
                    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.25)',
                    color:'rgba(255,255,255,0.75)', fontSize:9, fontWeight:700,
                    cursor:'pointer', letterSpacing:'0.08em',
                  }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.46s ease' }}>
                      <polyline points="1 4 1 10 7 10"/>
                      <polyline points="23 20 23 14 17 14"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                    Shuffle
                  </button>
                </div>

                {/* same rows, same accent, same handler wiring as the live model */}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {exercises.map((ex, i) => (
                    <ExerciseRow
                      key={`${ex.name}-${i}`}
                      ex={ex}
                      accent="#10b981"
                      onLog={onSaveExercise}
                      muscleLabel={entry?.label}
                    />
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => emitPress(selected)}
              disabled={!PAIR_TO_LEGACY_V2[selected]}
              style={{
                width:'100%', padding:14, fontSize:14,
                background:'transparent', border:'1px solid rgba(255,255,255,0.2)',
                color:'rgba(255,255,255,0.8)', borderRadius:8, cursor:'pointer',
              }}>
              {PAIR_TO_LEGACY_V2[selected]
                ? `+ Log ${MUSCLE_NAMES[selected]} ${context === 'recovery' ? 'Recovery' : 'Workout'}`
                : `${MUSCLE_NAMES[selected]} — no exercises tracked`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
