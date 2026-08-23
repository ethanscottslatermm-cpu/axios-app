import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import frontSVGNew from '../../assets/body/axios_front_new.svg?raw'
import rearSVGNew  from '../../assets/body/axios_rear_new.svg?raw'
import {
  PAIR_TO_LEGACY, pairsForLegacy, viewForLegacy, recentlyTrainedPairs,
} from './muscleMapBridge'

/* ────────────────────────────────────────────────────────────
   Muscle groups. Every id below was verified present in the
   two source SVGs before this component was written.
   ──────────────────────────────────────────────────────────── */

const FRONT_MUSCLE_PAIRS = {
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
  chest:'Chest', upper_abs:'Upper Abs', lower_abs:'Lower Abs', traps:'Trapezius',
  deltoids:'Shoulders', biceps:'Biceps', forearms:'Forearms', obliques:'Obliques',
  hips:'Hips', outer_quad:'Quads', inner_quad:'Inner Quad', tibialis:'Shins',
  calves:'Calves', knees:'Knees',
  spine:'Spine', traps_lats:'Back', deltoids_rear:'Shoulders', triceps_rear:'Triceps',
  forearms_rear:'Forearms', lower_back:'Lower Back', glute_med:'Glutes',
  hamstrings:'Hamstrings', calves_rear:'Calves', shins_rear:'Shins',
}

const SCIENTIFIC_NAMES = {
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

/* Split per view: `hips` exists in BOTH SVGs and takes a different
   colour in each, which a single merged map cannot express. */
const FRONT_COLORS = {
  chest:'#E05C6E', upper_abs:'#3A7BD5', lower_abs:'#3A7BD5', traps:'#2E8B57',
  deltoids:'#3A7BD5', biceps:'#3A7BD5', forearms:'#2C3E6B', obliques:'#C0392B',
  hips:'#2E8B57', outer_quad:'#2E8B57', inner_quad:'#2E8B57', tibialis:'#2E8B57',
  calves:'#2E8B57', knees:'#7F8C8D',
}
const REAR_COLORS = {
  spine:'#00CED1', traps_lats:'#2E8B57', deltoids_rear:'#00BFFF',
  triceps_rear:'#2C3E6B', forearms_rear:'#2C3E6B', lower_back:'#2E8B57',
  glute_med:'#3A7BD5', hamstrings:'#2C3E6B', calves_rear:'#2E8B57',
  shins_rear:'#2E8B57', hips:'#C0392B',
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

  const [view, setView]       = useState(initialView)
  const [active, setActive]   = useState(null)
  const [hovered, setHovered] = useState(null)
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

    // body outline: transparent fill + white neon glow, never interactive
    const bodyLine = svg.querySelector('#body_line')
    if (bodyLine) {
      bodyLine.querySelectorAll('path').forEach(p => {
        p.setAttribute('fill', 'transparent')
        p.setAttribute('stroke', 'rgba(255,255,255,0.9)')
        p.setAttribute('stroke-width', '1.5')
        p.style.fill = 'transparent'
      })
      bodyLine.setAttribute('filter', 'url(#bodyGlow)')
      bodyLine.setAttribute('pointer-events', 'none')
    }

    // Structural: head only. The `Frame N` group is the ROOT wrapper - giving
    // it a fill would repaint every descendant (including body_line), and
    // giving it pointer-events:none would disable every muscle that inherits.
    const head = svg.querySelector('#head')
    if (head) {
      head.setAttribute('pointer-events', 'none')
      paintTargets(head).forEach(n => {
        n.setAttribute('fill', 'rgba(30,30,50,0.8)')
        n.style.fill = 'rgba(30,30,50,0.8)'
      })
    }

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
      ids.forEach(id => {
        const el = svg.getElementById(id)
        if (!el) return
        paintTargets(el).forEach(n => {
          n.setAttribute('fill', color);        n.style.fill = color
          n.setAttribute('fill-opacity', '1');  n.style.fillOpacity = '1'
          n.setAttribute('stroke',
            isActive ? 'rgba(255,255,255,0.9)' : isHover ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)')
          n.setAttribute('stroke-width', isActive ? '1.5' : isHover ? '1' : '0.5')
        })
        if (isActive)      el.setAttribute('filter', `url(#${glowId(color)})`)
        else if (isHover)  el.setAttribute('filter', 'url(#hoverGlow)')
        else               el.removeAttribute('filter')
      })
    })
  }, [pairs, colors, active, hovered, highlighted])

  useEffect(() => { paint() })

  const selected = active && MUSCLE_NAMES[active] ? active : null

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

  const renderLabels = (side) => (
    <div style={{
      display:'flex', flexDirection:'column', justifyContent:'center',
      gap:'1.6rem', flex:'0 0 96px', minWidth:0,
    }}>
      {LABELS[view][side].map(key => {
        const s = labelStyle(key)
        const connector = (
          <div style={{
            flex:1, height:1, minWidth:14,
            borderTop:`1px ${s.solid ? 'solid' : 'dashed'} ${s.line}`,
            transition:'border-color .25s ease',
          }}/>
        )
        return (
          <div key={key}
            onClick={() => interactive && (setActive(p => p === key ? null : key), onMusclePress?.(key))}
            style={{
              display:'flex', alignItems:'center', gap:6,
              flexDirection: side === 'left' ? 'row' : 'row-reverse',
              cursor: interactive ? 'pointer' : 'default',
            }}>
            <div style={{ textAlign: side === 'left' ? 'right' : 'left', minWidth:0 }}>
              <p style={{
                margin:0, fontSize:13, fontWeight:500, letterSpacing:'.05em',
                color:s.name, transition:'color .25s ease', whiteSpace:'nowrap',
              }}>{MUSCLE_NAMES[key]}</p>
              <p style={{
                margin:0, fontSize:10, fontStyle:'italic', color:s.sci,
                opacity:s.op, transition:'color .25s ease',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{SCIENTIFIC_NAMES[key]}</p>
            </div>
            {connector}
          </div>
        )
      })}
    </div>
  )

  const pillStyle = isActive => ({
    padding:'6px 24px', borderRadius:20,
    border:`1px solid ${isActive ? '#00CED1' : 'rgba(255,255,255,0.2)'}`,
    background:'transparent',
    color:isActive ? '#00CED1' : 'rgba(255,255,255,0.4)',
    fontFamily:'inherit', fontSize:13, letterSpacing:'.08em', cursor:'pointer',
  })

  return (
    <div style={{ width:'100%' }}>

      {/* front / back toggle */}
      <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:'1.1rem' }}>
        <button style={pillStyle(view === 'front')} onClick={() => { setView('front'); setActive(null) }}>FRONT</button>
        <button style={pillStyle(view === 'rear')}  onClick={() => { setView('rear');  setActive(null) }}>BACK</button>
      </div>

      {/* labels + figure */}
      <div style={{ display:'flex', alignItems:'stretch', gap:4, overflow:'visible' }}>
        {renderLabels('left')}
        <div
          key={view}
          ref={containerRef}
          style={{
            width:'100%', flex:'1 1 auto', aspectRatio:'326 / 1043',
            overflow:'visible', position:'relative',
          }}
        />
        {renderLabels('right')}
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
