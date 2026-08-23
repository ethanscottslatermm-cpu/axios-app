import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import frontSVGNew from '../../assets/body/axios_front_new.svg?raw'
import rearSVGNew  from '../../assets/body/axios_rear_new.svg?raw'
import {
  PAIR_TO_LEGACY, PAIR_TO_DB, pickFour,
  pairsForLegacy, viewForLegacy, recentlyTrainedPairs,
} from './muscleMapBridge'
import { DB } from './WorkoutGuide'
import ExerciseRow, { ExerciseRowStyles } from './ExerciseRow'

/* ────────────────────────────────────────────────────────────
   Muscle groups. Every id below was verified present in the
   two source SVGs before this component was written.
   ──────────────────────────────────────────────────────────── */

const FRONT_MUSCLE_PAIRS = {
  head:       ['head'],
  chest:      ['chest_both'],
  upper_abs:  ['upper_abs'],
  lower_abs:  ['lower_abs'],
  traps:      ['traps_left',      'traps_right'],
  deltoids:   ['deltoids_left',   'deltoids_right'],
  biceps:     ['biceps_left',     'biceps_right'],
  forearms:   ['forearms_left',   'forearms_right'],
  obliques:   ['obliques_left',   'obliques_right'],
  hips:       ['hips_left',       'hips_right'],
  outer_quad: ['outer_quad_left', 'outer_quad_right'],
  inner_quad: ['inner_quad_left', 'inner_quad_right'],
  tibialis:   ['tibialis_left',   'tibialis_right'],
  calves:     ['calves_left',     'calves_right'],
  knees:      ['knees_left',      'knees_right'],
}

const REAR_MUSCLE_PAIRS = {
  spine:         ['spine'],
  traps_lats:    ['traps_lats_left',      'traps_lats_right'],
  deltoids_rear: ['deltoids_rear_left',   'deltoids_rear_right'],
  triceps_rear:  ['triceps_rear_left',    'triceps_rear_right'],
  forearms_rear: ['forearms_rear_left',   'forearms_rear_right'],
  lower_back:    ['lower_back_left',      'lower_back_right'],
  glute_med:     ['glute_med_left',       'glute_med_right'],
  hamstrings:    ['hamstrings_rear_left', 'hamstrings_rear_right'],
  calves_rear:   ['calves_rear_left',     'calves_rear_right'],
  shins_rear:    ['shins_rear_left',      'shins_rear_right'],
  hips:          ['hips_left',            'hips_right'],
}

const MUSCLE_NAMES = {
  head:'Head',
  chest:'Chest', upper_abs:'Upper Abs', lower_abs:'Lower Abs', traps:'Trapezius',
  deltoids:'Shoulders', biceps:'Biceps', forearms:'Forearms', obliques:'Obliques',
  hips:'Hips', outer_quad:'Quads', inner_quad:'Inner Quad', tibialis:'Shins',
  calves:'Calves', knees:'Knees',
  spine:'Spine', traps_lats:'Back', deltoids_rear:'Shoulders', triceps_rear:'Triceps',
  forearms_rear:'Forearms', lower_back:'Lower Back', glute_med:'Glutes',
  hamstrings:'Hamstrings', calves_rear:'Calves', shins_rear:'Shins',
}

const SCIENTIFIC_NAMES = {
  head:'Cranium / Cervical',
  chest:'Pectoralis Major', upper_abs:'Rectus Abdominis (Upper)',
  lower_abs:'Rectus Abdominis (Lower)', traps:'Trapezius', deltoids:'Deltoideus',
  biceps:'Biceps Brachii', forearms:'Flexors & Extensors', obliques:'Obliquus Externus',
  hips:'Gluteus Medius / TFL', outer_quad:'Quadriceps / Adductors',
  inner_quad:'Vastus Medialis', tibialis:'Tibialis Anterior', calves:'Gastrocnemius',
  knees:'Patella',
  spine:'Erector Spinae', traps_lats:'Trapezius, Lats, Erec.',
  deltoids_rear:'Posterior Deltoid', triceps_rear:'Triceps Brachii',
  forearms_rear:'Extensor Group', lower_back:'Erector Spinae',
  glute_med:'Gluteus Medius/Maximus', hamstrings:'Biceps Femoris',
  calves_rear:'Gastrocnemius', shins_rear:'Tibialis Anterior',
}

/* Palette solved as a graph colouring against the measured adjacency of the
   two figures, using the validated categorical hue set. Every touching pair
   clears CVD ΔE >= 8 and normal-vision ΔE >= 15 on the near-black surface
   (worst measured: 8.4 and 15.3). Hues repeat across non-touching regions by
   design - a map only has to separate neighbours, not all twenty.
   Regenerate with solve-muscle-palette.mjs if the artwork changes.

   Split per view because `hips` exists in BOTH sheets; a single merged map
   silently kept only the last definition. */
const FRONT_COLORS = {
  head:'#8a8f98',                              // inert - not trainable
  traps:'#d95926',      deltoids:'#3987e5',    chest:'#d55181',
  biceps:'#008300',     forearms:'#d55181',
  upper_abs:'#9085e9',  lower_abs:'#199e70',   obliques:'#d95926',
  hips:'#199e70',       outer_quad:'#9085e9',  inner_quad:'#c98500',
  knees:'#64748b',                             // inert - not trainable
  tibialis:'#008300',   calves:'#e66767',
}
const REAR_COLORS = {
  traps_lats:'#d95926', deltoids_rear:'#3987e5', triceps_rear:'#c98500',
  forearms_rear:'#d55181',
  spine:'#3987e5',      lower_back:'#199e70',
  glute_med:'#d95926',  hips:'#199e70',          hamstrings:'#9085e9',
  calves_rear:'#e66767', shins_rear:'#008300',
}

/* Label columns. Front has no triceps element, so it is not listed.
   Rear has no `head` element, so no Head label is rendered. */
const LABELS = {
  front: {
    left:  ['biceps', 'forearms', 'outer_quad', 'tibialis'],
    right: ['deltoids', 'chest', 'upper_abs', 'obliques', 'calves'],
  },
  rear: {
    left:  ['deltoids_rear', 'triceps_rear', 'forearms_rear', 'hamstrings'],
    right: ['traps_lats', 'glute_med', 'calves_rear'],
  },
}

/* The figure reads as a glowing outline, not a filled body. A fill here would
   become the surface the muscle hues sit on; pick-bodyline-fill.mjs measured
   the options if that is ever wanted (#1c2431 was the lightest value keeping
   every hue above 3:1, and the authored tan #AC7F5E put all eight under it). */
const BODY_FILL = 'transparent'

/* The single source of truth for the outline look. The body line and every
   OUTLINE_ONLY region read from these, so the head cannot drift from the body. */
const OUTLINE_STROKE = 'rgba(255,255,255,0.9)'
const OUTLINE_WIDTH  = '1.5'
const OUTLINE_FILTER = 'url(#bodyGlow)'

/* Regions drawn as outline only - no colour fill, identical to the body line.
   `transparent` rather than `none` on purpose: none removes the interior from
   hit-testing, transparent keeps the region tappable while staying invisible. */
const OUTLINE_ONLY = new Set(['head'])

const ALL_COLORS = [...new Set([...Object.values(FRONT_COLORS), ...Object.values(REAR_COLORS)])]
const glowId = c => `glow_${c.replace('#', '')}`

/* A muscle id may be a <g> wrapping paths, or a bare <path>.
   outer_quad_left/right are bare paths - querySelectorAll('*') on
   them returns nothing, which would leave Quads unpainted and dead. */
function paintTargets(el) {
  if (!el) return []
  if (el.tagName.toLowerCase() !== 'g') return [el]
  return Array.from(el.querySelectorAll('*')).filter(n => n.tagName.toLowerCase() !== 'g')
}

const DEFS = `
<defs id="axios_map_defs">
  <filter id="bodyGlow" x="-15%" y="-15%" width="130%" height="130%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feFlood flood-color="#FFFFFF" flood-opacity="0.8" result="color"/>
    <feComposite in="color" in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
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

/* Accepts the MuscleMapView prop shape (workouts / onLogWorkout /
   defaultSelected / defaultView) so it can be swapped in without touching
   call sites, plus the newer activeMuscles / onMusclePress form. */
export default function MuscleMapNew({
  // legacy-compatible
  workouts = [],
  onLogWorkout,
  onSaveExercise,          // eslint-disable-line no-unused-vars -- accepted for prop parity
  defaultSelected = null,  // a stored muscle_group name, e.g. 'Chest'
  defaultView = 'anterior',
  // newer form
  activeMuscles = [],
  onMusclePress,
  view: viewProp,
  interactive = true,
  context = 'fitguide',
}) {
  const initialView =
    viewProp === 'rear' || viewProp === 'front' ? viewProp
    : (defaultSelected && viewForLegacy(defaultSelected))
      || (defaultView === 'posterior' ? 'rear' : 'front')

  const [view, setView]           = useState(initialView)
  const [active, setActive]       = useState(null)
  const [hovered, setHovered]     = useState(null)
  const [exercises, setExercises] = useState([])
  const [spinning, setSpinning]   = useState(false)
  const containerRef = useRef(null)

  useEffect(() => { if (viewProp) setView(viewProp) }, [viewProp])

  const pairs  = view === 'front' ? FRONT_MUSCLE_PAIRS : REAR_MUSCLE_PAIRS
  const colors = view === 'front' ? FRONT_COLORS       : REAR_COLORS

  // preselect the region matching a stored muscle name
  useEffect(() => {
    if (!defaultSelected) return
    const [first] = pairsForLegacy(defaultSelected, view)
    if (first) setActive(first)
  }, [defaultSelected, view])

  // Regions to highlight without a tap. An explicit list wins; otherwise only
  // the recovery view derives them from training history, since the Fit Guide
  // is meant to show every muscle fully coloured and un-glowed at rest.
  const highlighted = useMemo(() => {
    if (activeMuscles.length) return activeMuscles
    if (context === 'recovery') return recentlyTrainedPairs(workouts, view)
    return []
  }, [activeMuscles, context, workouts, view])

  const emitPress = useCallback((pairKey) => {
    onMusclePress?.(pairKey)
    const legacy = PAIR_TO_LEGACY[pairKey]
    if (legacy) onLogWorkout?.(legacy)
  }, [onMusclePress, onLogWorkout])

  /* ── inject SVG + wire delegated events (once per view) ── */
  useEffect(() => {
    const host = containerRef.current
    if (!host) return

    const raw = view === 'front' ? frontSVGNew : rearSVGNew
    host.innerHTML = raw
      .replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1')
      .replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1')

    const svg = host.querySelector('svg')
    if (!svg) return
    svg.setAttribute('viewBox', '0 0 326 1043')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.style.display  = 'block'
    svg.style.overflow = 'visible'
    svg.insertAdjacentHTML('afterbegin', DEFS)

    /* Body silhouette. It paints before the muscles, so this fill is the
       surface they sit on - it shows through the gaps (neck, hands, feet,
       joints, and the rear skull). Chosen with pick-bodyline-fill.mjs: the
       lightest value that still leaves every muscle hue above 3:1 against it.
       Going lighter drops green #008300 under the line. The authored tan
       #AC7F5E puts all eight hues under 3:1, which is why it is discarded. */
    const bodyLine = svg.querySelector('#body_line')
    if (bodyLine) {
      bodyLine.querySelectorAll('path').forEach(p => {
        p.setAttribute('fill', BODY_FILL)
        p.setAttribute('stroke', OUTLINE_STROKE)
        p.setAttribute('stroke-width', OUTLINE_WIDTH)
        p.style.fill = BODY_FILL
      })
      bodyLine.setAttribute('filter', OUTLINE_FILTER)
      bodyLine.setAttribute('pointer-events', 'none')
    }

    // The `Frame N` group is the SVG root wrapper - giving it a fill would
    // repaint every descendant (including body_line), and pointer-events:none
    // on it would disable every muscle that inherits. Leave it alone.
    // #head is a real group on the front sheet and is treated as a normal
    // region below; the rear sheet has no head element (its skull is part of
    // the single full-body body_line path), so rear has no head to paint.

    // tag every muscle element so one delegated listener can resolve it
    Object.entries(pairs).forEach(([pairKey, ids]) => {
      ids.forEach(id => {
        const el = svg.getElementById(id)
        if (!el) return
        el.dataset.pair = pairKey
        // Children first - for a bare <path> muscle (outer_quad) paintTargets
        // returns the element itself, so this must not run after the line below
        // or it would overwrite its own pointer-events and kill the hit area.
        if (el.tagName.toLowerCase() === 'g') {
          paintTargets(el).forEach(n => n.setAttribute('pointer-events', 'inherit'))
        }
        el.setAttribute('pointer-events', interactive ? 'all' : 'none')
        el.style.cursor = interactive ? 'pointer' : 'default'
      })
    })

    if (!interactive) return

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
    // note: selecting a region only highlights it; logging is driven by the
    // card CTA so a stray tap on the figure never opens the workout sheet
    const onOver  = e => { const p = findPair(e); if (p) setHovered(p) }
    const onOut   = e => { const p = findPair(e); if (p) setHovered(h => (h === p ? null : h)) }

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
      const color    = colors[pairKey] || '#7F8C8D'
      const isActive = active === pairKey || highlighted.includes(pairKey)
      const isHover  = !isActive && hovered === pairKey
      // Outline-only regions render exactly as the body line does - same
      // stroke, width and glow, read from the same constants - so the head
      // sits on the figure as one continuous contour. Selection is carried by
      // the label and the info card rather than by tinting the shape.
      const outline = OUTLINE_ONLY.has(pairKey)

      ids.forEach(id => {
        const el = svg.getElementById(id)
        if (!el) return
        paintTargets(el).forEach(n => {
          if (outline) {
            n.setAttribute('fill', 'transparent'); n.style.fill = 'transparent'
            n.setAttribute('stroke', OUTLINE_STROKE)
            n.setAttribute('stroke-width', OUTLINE_WIDTH)
            return
          }
          n.setAttribute('fill', color);        n.style.fill = color
          n.setAttribute('fill-opacity', '1');  n.style.fillOpacity = '1'
          n.setAttribute('stroke',
            isActive ? 'rgba(255,255,255,0.9)' : isHover ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)')
          n.setAttribute('stroke-width', isActive ? '1.5' : isHover ? '1' : '0.5')
        })
        if (outline)       el.setAttribute('filter', OUTLINE_FILTER)
        else if (isActive) el.setAttribute('filter', `url(#${glowId(color)})`)
        else if (isHover)  el.setAttribute('filter', 'url(#hoverGlow)')
        else               el.removeAttribute('filter')
      })
    })
  }, [pairs, colors, active, hovered, highlighted])

  useEffect(() => { paint() })

  /* ── anchor labels to real muscle geometry ───────────────────────────
     An evenly-spaced column drifts out of register with the figure, so each
     label is measured against the muscle it names. getScreenCTM maps SVG
     user units through whatever scaling preserveAspectRatio applied, which
     keeps this correct at any container width. */
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
    // two frames: the first lets the injected SVG lay out, the second measures it
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(measure) })
    const ro = new ResizeObserver(measure)
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    return () => {
      cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); ro.disconnect()
    }
  }, [measure])

  /* Place labels at their muscle's height, resolving overlap by centring each
     colliding cluster on its members' mean rather than pushing the stack down.
     A push-down pass makes one near-coincident pair (deltoids and chest sit
     2px apart) cascade into 35px of drift for every label beneath it. */
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

  /* Exercises for the selected region, pulled from the same WorkoutGuide DB the
     current 2D model uses - one source of truth for both maps. Four at a time,
     re-drawn on shuffle, matching how the 2D model presents them. */
  const entry = selected ? DB[PAIR_TO_DB[selected]] : null

  useEffect(() => {
    setExercises(entry?.exercises ? pickFour(entry.exercises) : [])
  }, [entry])

  const handleShuffle = () => {
    if (!entry?.exercises) return
    setSpinning(true)
    setExercises(pickFour(entry.exercises))
    setTimeout(() => setSpinning(false), 460)
  }

  /* ── label rendering ── */
  const labelStyle = key => {
    const isActive = selected === key
    const dimmed   = selected && !isActive
    const color    = colors[key] || '#7F8C8D'
    return {
      name: isActive ? color : dimmed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
      sci:  isActive ? color : dimmed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
      line: isActive ? color : dimmed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
      solid: isActive,
      op:   isActive ? 0.7 : 1,
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
          margin:0, fontSize:12.5, fontWeight:500, letterSpacing:'.04em',
          color:s.name, transition:'color .25s ease', whiteSpace:'nowrap',
          overflow:'hidden', textOverflow:'ellipsis',
        }}>{MUSCLE_NAMES[key]}</p>
        <p style={{
          margin:0, fontSize:9.5, fontStyle:'italic', color:s.sci, opacity:s.op,
          transition:'color .25s ease', whiteSpace:'nowrap',
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
              strokeWidth={s.solid ? 1.4 : 1}
              strokeDasharray={s.solid ? 'none' : '3 3'}
              style={{ transition:'stroke .25s ease' }} />
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
              aspectRatio:'326 / 1043',
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
              color:colors[selected] || '#fff',
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

                {/* same rows, same accent, same handler wiring as the current 2D model */}
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
              disabled={!PAIR_TO_LEGACY[selected]}
              style={{
                width:'100%', padding:14, fontSize:14,
                background:'transparent', border:'1px solid rgba(255,255,255,0.2)',
                color:'rgba(255,255,255,0.8)', borderRadius:8, cursor:'pointer',
              }}>
              {PAIR_TO_LEGACY[selected]
                ? `+ Log ${MUSCLE_NAMES[selected]} ${context === 'recovery' ? 'Recovery' : 'Workout'}`
                : `${MUSCLE_NAMES[selected]} — no exercises tracked`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
