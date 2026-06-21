import { useState, useMemo, useEffect, useRef } from 'react'
import { DB } from './WorkoutGuide'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MIND_COLOR      = '#a78bfa'
const HIGHLIGHT_COLOR = '#F5A623'

const ACTIVE_FILL = {
  Head:       '#D4AA80',
  Shoulders:  '#4A8FD4',
  Chest:      '#E85568',
  Back:       '#32B47C',
  Biceps:     '#C04462',
  Triceps:    '#33AAAA',
  Forearms:   '#3864B8',
  Abs:        '#3864B8',
  Obliques:   '#C04462',
  Quads:      '#40AE7E',
  Hamstrings: '#2E9090',
  Glutes:     '#3864B8',
  Shins:      '#C04462',
  Calves:     '#3864B8',
}

const ACTIVE_GLOW_RGB = {
  Head:       [184, 144, 106],
  Shoulders:  [74,  143, 212],
  Chest:      [232, 85,  104],
  Back:       [50,  180, 124],
  Biceps:     [192, 68,  98 ],
  Triceps:    [51,  170, 170],
  Forearms:   [56,  100, 184],
  Abs:        [56,  100, 184],
  Obliques:   [192, 68,  98 ],
  Quads:      [64,  174, 126],
  Hamstrings: [46,  144, 144],
  Glutes:     [56,  100, 184],
  Shins:      [192, 68,  98 ],
  Calves:     [56,  100, 184],
}

const makeGlow = ([r, g, b]) =>
  `drop-shadow(0 0 22px rgba(${r},${g},${b},0.40)) drop-shadow(0 0 10px rgba(${r},${g},${b},0.65)) drop-shadow(0 0 4px rgba(${r},${g},${b},0.92))`

// Premium white rim: razor-sharp 0.3px edge traces the muscle silhouette, 1.5px halo softens it,
// 6px ambient gives depth. Pulses with the group's existing opacity animation.
const WHITE_RIM = 'drop-shadow(0 0 0.3px rgba(255,255,255,0.95)) drop-shadow(0 0 1.5px rgba(255,255,255,0.50)) drop-shadow(0 0 6px rgba(255,255,255,0.16))'
// Wider glow for the transparent body outline — 3px bright edge, 8px halo, 18px ambient.
const BODY_OUTLINE_FILTER = 'drop-shadow(0 0 3px rgba(255,255,255,0.70)) drop-shadow(0 0 8px rgba(255,255,255,0.35)) drop-shadow(0 0 18px rgba(255,255,255,0.14))'

const IDLE_FILL = {
  Head:       '#B8906A',
  Shoulders:  '#1F4E79',
  Chest:      '#C7303D',
  Back:       '#1E6B4F',
  Biceps:     '#8C2F39',
  Triceps:    '#1F6B6B',
  Forearms:   '#2A3F6B',
  Abs:        '#2A3F6B',
  Obliques:   '#8C2F39',
  Quads:      '#2F7D5B',
  Hamstrings: '#1F5C5C',
  Glutes:     '#2A3F6B',
  Shins:      '#8C2F39',
  Calves:     '#2A3F6B',
}

const MUSCLES = ['Head','Chest','Shoulders','Back','Biceps','Triceps','Forearms','Abs','Obliques','Quads','Hamstrings','Glutes','Calves','Shins']

const GROUP_FROM_ID = {
  head_spine_rear:             'Head',
  // Shoulders
  deltoid_anterior_left:       'Shoulders',
  deltoid_anterior_right:      'Shoulders',
  deltoid_posterior_left:      'Shoulders',
  deltoid_posterior_right:     'Shoulders',
  base:                        'Shoulders',
  base_2:                      'Shoulders',
  // Chest
  pectoralis_major_left:       'Chest',
  pectoralis_major_right:      'Chest',
  // Back
  trapezius_left:              'Back',
  trapezius_right:             'Back',
  latissimus_dorsi_left:       'Back',
  latissimus_dorsi_right:      'Back',
  erector_spinae:              'Back',
  // Arms
  biceps_brachii_left:         'Biceps',
  biceps_brachii_right:        'Biceps',
  triceps_brachii_left:        'Triceps',
  triceps_brachii_right:       'Triceps',
  forearm_flexors_left:        'Forearms',
  forearm_flexors_right:       'Forearms',
  forearm_extensors_left:      'Forearms',
  forearm_extensors_right:     'Forearms',
  // Torso
  upper_abs:                   'Abs',
  lower_abs:                   'Abs',
  external_oblique_left:       'Obliques',
  external_oblique_right:      'Obliques',
  internal_oblique_left:       'Obliques',
  internal_oblique_right:      'Obliques',
  iliopsoas_left:              'Obliques',
  iliopsoas_right:             'Obliques',
  // Legs
  quadriceps_femoris_left:     'Quads',
  quadriceps_femoris_right:    'Quads',
  adductor_longus_left:        'Quads',
  adductor_longus_right:       'Quads',
  hamstrings_left:             'Hamstrings',
  hamstrings_right:            'Hamstrings',
  gluteus_maximus_left:        'Glutes',
  gluteus_maximus_right:       'Glutes',
  gluteus_medius_left:         'Glutes',
  gluteus_medius_right:        'Glutes',
  gastrocnemius_left:          'Calves',
  gastrocnemius_right:         'Calves',
  soleus_left:                 'Calves',
  soleus_right:                'Calves',
  tibialis_anterior_left:      'Shins',
  tibialis_anterior_right:     'Shins',
}

const GROUP_TO_DB = {
  Head:       null,
  Chest:      'chest',
  Shoulders:  'shoulders',
  Back:       'back',
  Biceps:     'biceps',
  Triceps:    'triceps',
  Forearms:   'forearms',
  Abs:        'core',
  Obliques:   'obliques',
  Quads:      'quads',
  Hamstrings: 'hamstrings',
  Glutes:     'glutes',
  Calves:     'calves',
  Shins:      'shins',
}

const SCI_SHORT = {
  Head:       'Mind & Recovery',
  Chest:      'Pectoralis Major',
  Shoulders:  'Deltoideus',
  Back:       'Trapezius · Lats · Erectors',
  Biceps:     'Biceps Brachii',
  Triceps:    'Triceps Brachii',
  Forearms:   'Flexors & Extensors',
  Abs:        'Rectus Abdominis',
  Obliques:   'Hip Flexors',
  Quads:      'Quadriceps · Adductors',
  Hamstrings: 'Biceps Femoris',
  Glutes:     'Gluteus Maximus',
  Calves:     'Gastrocnemius · Soleus',
  Shins:      'Tibialis Anterior',
}

// Forward mapping: region → SVG group IDs (used for CSS-based highlighting)
const REGION_TO_IDS = {
  Shoulders:  ['deltoid_anterior_left','deltoid_anterior_right','deltoid_posterior_left','deltoid_posterior_right','base','base_2'],
  Chest:      ['pectoralis_major_left','pectoralis_major_right'],
  Back:       ['trapezius_left','trapezius_right','latissimus_dorsi_left','latissimus_dorsi_right','erector_spinae'],
  Biceps:     ['biceps_brachii_left','biceps_brachii_right'],
  Triceps:    ['triceps_brachii_left','triceps_brachii_right'],
  Forearms:   ['forearm_flexors_left','forearm_flexors_right','forearm_extensors_left','forearm_extensors_right'],
  Abs:        ['upper_abs','lower_abs'],
  Obliques:   ['external_oblique_left','external_oblique_right','internal_oblique_left','internal_oblique_right','iliopsoas_left','iliopsoas_right'],
  Quads:      ['quadriceps_femoris_left','quadriceps_femoris_right','adductor_longus_left','adductor_longus_right'],
  Hamstrings: ['hamstrings_left','hamstrings_right'],
  Glutes:     ['gluteus_maximus_left','gluteus_maximus_right','gluteus_medius_left','gluteus_medius_right'],
  Calves:     ['gastrocnemius_left','gastrocnemius_right','soleus_left','soleus_right'],
  Shins:      ['tibialis_anterior_left','tibialis_anterior_right'],
}

const NON_INTERACTIVE_IDS = [
  'main_body','hand_left','hand_right','hand_rear_left','hand_rear_right',
]

const NON_INTERACTIVE_FILLS = {
  main_body:       '#B8906A',
  hand_left:       '#B8906A',
  hand_right:      '#B8906A',
  hand_rear_left:  '#B8906A',
  hand_rear_right: '#B8906A',
}

// Labels in 0 0 580 1615 viewBox coordinate space.
// x < 0 or x > 580 renders outside body (requires overflow:visible on parent).
// ex = x-coordinate of leader-line body-side endpoint.
const MIND_DATA = {
  color:      MIND_COLOR,
  scientific: 'Mind–Body Recovery',
  desc:       'Controlled breathing activates the parasympathetic nervous system, lowering cortisol and heart rate within minutes. Use these techniques between sets or post-workout.',
  breathing: [
    {
      name:  'Box Breathing',
      tag:   'Focus & Calm',
      desc:  'Equal 4-count phases. Used by Navy SEALs to reset the nervous system under pressure.',
      phases: [{ label: 'Inhale', s: 4 }, { label: 'Hold', s: 4 }, { label: 'Exhale', s: 4 }, { label: 'Hold', s: 4 }],
    },
    {
      name:  '4 · 7 · 8',
      tag:   'Deep Relaxation',
      desc:  'Extended exhale stimulates the vagus nerve. Ideal for winding down post-training.',
      phases: [{ label: 'Inhale', s: 4 }, { label: 'Hold', s: 7 }, { label: 'Exhale', s: 8 }],
    },
    {
      name:  'Physiological Sigh',
      tag:   'Fastest Reset',
      desc:  'Double nasal inhale + long exhale. Deflates air sacs and drops CO₂ fastest.',
      phases: [{ label: 'Inhale', s: 2 }, { label: '+Inhale', s: 2 }, { label: 'Exhale', s: 6 }],
    },
    {
      name:  'Resonant Breathing',
      tag:   'HRV Optimise',
      desc:  '5.5-second cycles synchronise heart rate variability for peak recovery.',
      phases: [{ label: 'Inhale', s: 5.5 }, { label: 'Exhale', s: 5.5 }],
    },
  ],
}

const LABELS = {
  anterior: [
    { group: 'Shoulders', x: 605,  y: 345,  anchor: 'start', ex: 468 },
    { group: 'Chest',     x: 605,  y: 400,  anchor: 'start', ex: 445 },
    { group: 'Triceps',   x: -25,  y: 450,  anchor: 'end',   ex: 120 },
    { group: 'Biceps',    x: -25,  y: 510,  anchor: 'end',   ex: 95  },
    { group: 'Abs',       x: 605,  y: 490,  anchor: 'start', ex: 362 },
    { group: 'Obliques',  x: 605,  y: 635,  anchor: 'start', ex: 372 },
    { group: 'Forearms',  x: -25,  y: 650,  anchor: 'end',   ex: 115 },
    { group: 'Quads',     x: -25,  y: 900,  anchor: 'end',   ex: 178 },
    { group: 'Shins',     x: -25,  y: 1120, anchor: 'end',   ex: 248 },
    { group: 'Calves',    x: 605,  y: 1310, anchor: 'start', ex: 452 },
  ],
  posterior: [
    { group: 'Head',       x: 605,  y: 100,  anchor: 'start', ex: 362 },
    { group: 'Shoulders',  x: -25,  y: 340,  anchor: 'end',   ex: 110 },
    { group: 'Back',       x: 605,  y: 455,  anchor: 'start', ex: 425 },
    { group: 'Triceps',    x: -25,  y: 515,  anchor: 'end',   ex: 125 },
    { group: 'Forearms',   x: -25,  y: 650,  anchor: 'end',   ex: 108 },
    { group: 'Glutes',     x: 605,  y: 790,  anchor: 'start', ex: 412 },
    { group: 'Hamstrings', x: -25,  y: 1000, anchor: 'end',   ex: 260 },
    { group: 'Calves',     x: 605,  y: 1305, anchor: 'start', ex: 450 },
  ],
}

function getRecovery(n) {
  return [
    { pct: 100, status: 'Ready',    color: '#3cb371' },
    { pct: 84,  status: 'Ready',    color: '#80c060' },
    { pct: 68,  status: 'Active',   color: '#e8a030' },
    { pct: 45,  status: 'Fatigued', color: '#d73a28' },
  ][Math.min(n, 3)]
}

function fmtDate(ds, todayStr) {
  if (!ds) return 'Never'
  const diff = Math.round((new Date(todayStr + 'T12:00:00') - new Date(ds + 'T12:00:00')) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)   return `${diff}d ago`
  return new Date(ds + 'T12:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function pickFour(pool) {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 4)
}

function BreathingGuide({ exercise, onStop }) {
  const [tick, setTick] = useState(0)
  const totalCycle = exercise.phases.reduce((s, p) => s + p.s, 0)

  useEffect(() => {
    setTick(0)
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [exercise])

  const elapsed = tick % totalCycle
  let acc = 0, phase = exercise.phases[0], remaining = phase.s
  for (const ph of exercise.phases) {
    if (elapsed < acc + ph.s) {
      phase = ph
      remaining = Math.ceil(acc + ph.s - elapsed)
      break
    }
    acc += ph.s
  }
  const isInhale = phase.label.toLowerCase().startsWith('inhale') || phase.label.startsWith('+')
  const isHold   = phase.label.toLowerCase().startsWith('hold')
  const progress = 1 - (remaining / phase.s)
  const ringSize = isInhale ? 54 + progress * 30 : isHold ? 84 : 84 - progress * 30

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '4px 0 8px' }}>
      <p style={{ color: MIND_COLOR, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FF, margin: 0 }}>
        {exercise.name}
      </p>

      <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${MIND_COLOR}20` }}/>
        <div style={{
          width: ringSize, height: ringSize, borderRadius: '50%',
          background: `radial-gradient(circle, ${MIND_COLOR}38 0%, ${MIND_COLOR}0a 70%)`,
          border: `1.5px solid ${MIND_COLOR}${isHold ? 'cc' : '77'}`,
          boxShadow: `0 0 ${isHold ? 24 : 10}px ${MIND_COLOR}${isHold ? '55' : '28'}`,
          transition: `width ${remaining}s linear, height ${remaining}s linear, box-shadow 0.6s ease`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: MIND_COLOR, fontSize: 20, fontWeight: 900, fontFamily: FF, lineHeight: 1 }}>{remaining}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: MIND_COLOR, fontSize: 15, fontWeight: 800, fontFamily: FF, margin: '0 0 3px' }}>{phase.label}</p>
        <p style={{ color: 'var(--text-faint)', fontSize: 8.5, fontFamily: FF, margin: 0, letterSpacing: '0.06em' }}>
          {exercise.phases.map(p => `${p.label} ${p.s}s`).join(' · ')}
        </p>
      </div>

      <button onClick={onStop} style={{
        padding: '5px 18px', borderRadius: 99, cursor: 'pointer',
        background: `${MIND_COLOR}14`, border: `1px solid ${MIND_COLOR}40`,
        color: MIND_COLOR, fontSize: 10, fontFamily: FF, fontWeight: 700,
        letterSpacing: '0.08em',
      }}>Stop</button>
    </div>
  )
}

function ExCard({ ex, accent, onLog, muscleLabel }) {
  const [logging, setLogging] = useState(false)
  const [sets,    setSets]    = useState('')
  const [reps,    setReps]    = useState('')
  const [weight,  setWeight]  = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`

  const handleSave = async () => {
    setSaving(true)
    try {
      await onLog({ name: ex.name, sets, reps, weight, muscleLabel })
      setSaved(true)
      setTimeout(() => { setSaved(false); setLogging(false); setSets(''); setReps(''); setWeight('') }, 900)
    } catch(e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '11px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, fontFamily: FF, marginBottom: 3 }}>{ex.name}</p>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 9, fontFamily: FF, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.14)', animation: 'mmPulse 2.8s ease-in-out infinite' }}>{ex.eq}</span>
            <span style={{ color: accent, fontSize: 9, fontFamily: FF, fontWeight: 700, background: `${accent}18`, padding: '2px 6px', borderRadius: 4 }}>{ex.sets}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {onLog && (
            <button onClick={() => setLogging(l => !l)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 7,
                background: logging ? 'rgba(248,113,113,0.15)' : 'rgba(180,188,204,0.1)',
                border: `1px solid ${logging ? 'rgba(248,113,113,0.4)' : 'rgba(180,188,204,0.25)'}`,
                color: logging ? '#f87171' : '#b4bccc',
                fontSize: 9, fontWeight: 700, fontFamily: FF, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Log
            </button>
          )}
          <a href={ytUrl} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 9px', borderRadius: 7,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
              color: '#ef4444', fontSize: 9, fontWeight: 700,
              fontFamily: FF, letterSpacing: '0.08em', textDecoration: 'none',
            }}
            onClick={e => e.stopPropagation()}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="#ef4444">
              <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.8 5 12 5 12 5s-4.8 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.8 19 12 19 12 19s4.8 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8z"/>
              <polygon fill="white" points="10,8.5 16,12 10,15.5"/>
            </svg>
            Watch
          </a>
        </div>
      </div>

      <div style={{ overflow: 'hidden', maxHeight: logging ? 130 : 0, transition: 'max-height 0.28s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(212,212,232,0.06)' }}>
          <div style={{ display: 'flex', gap: 7, marginTop: 10, marginBottom: 8 }}>
            {[['Sets', sets, setSets], ['Reps', reps, setReps], ['Weight (lbs)', weight, setWeight]].map(([lbl, val, set]) => (
              <div key={lbl} style={{ flex: 1 }}>
                <p style={{ color: 'rgba(212,212,232,0.3)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: FF, marginBottom: 4 }}>{lbl}</p>
                <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="—"
                  style={{ width: '100%', background: 'rgba(212,212,232,0.05)', border: '1px solid rgba(212,212,232,0.1)', borderRadius: 7, padding: '7px 4px', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, fontFamily: FF, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving || saved}
            style={{
              width: '100%', padding: '8px', borderRadius: 8,
              background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(180,188,204,0.12)',
              border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'rgba(180,188,204,0.28)'}`,
              color: saved ? '#10b981' : '#b4bccc',
              fontSize: 10, fontWeight: 700, fontFamily: FF, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: saving || saved ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            }}>
            {saved ? '✓ Logged' : saving ? 'Saving…' : `Log ${ex.name}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// Adds stable CSS classes to stroke-only paths during SVG load so they can be
// reliably targeted without positional/nth-child selectors (which break on re-export).
function tagDetailLines(svgText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  Object.keys(GROUP_FROM_ID).forEach(id => {
    const g = doc.getElementById(id)
    if (!g) return
    g.querySelectorAll('path').forEach(p => {
      const fill = p.getAttribute('fill')
      if (!fill || fill === 'none') p.classList.add('muscle-detail-line')
    })
  })
  // Knee-adjacent quad strokes: those whose path data contains y-coords in [1050, 1165].
  // x-coords are at most ~580 in this viewBox, so any number in 1050-1165 is a y-value.
  ;['quadriceps_femoris_left', 'quadriceps_femoris_right'].forEach(id => {
    const g = doc.getElementById(id)
    if (!g) return
    g.querySelectorAll('path.muscle-detail-line').forEach(p => {
      const nums = (p.getAttribute('d') || '').match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
      if (nums.some(n => n >= 1050 && n <= 1165)) p.classList.add('knee-detail-line')
    })
  })
  // Fix z-order: the new SVG places tibialis_anterior_right before both gastrocnemius groups,
  // so calf renders on top of the right shin. Move it to just after gastrocnemius_right.
  const tibR = doc.getElementById('tibialis_anterior_right')
  const gastR = doc.getElementById('gastrocnemius_right')
  if (tibR && gastR && tibR.parentNode === gastR.parentNode) {
    gastR.parentNode.insertBefore(tibR, gastR.nextSibling)
  }
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export default function MuscleMapView({ workouts = [], onLogWorkout, onSaveExercise, defaultSelected = null }) {
  const [selected,     setSelected]    = useState(defaultSelected)
  const [lastSelected, setLastSelected] = useState(null)
  const [view,         setView]        = useState('anterior')
  const [exercises,    setExercises]   = useState([])
  const [spinning,     setSpinning]    = useState(false)
  const [breathingEx,  setBreathingEx] = useState(null)
  const [ripples,      setRipples]     = useState([])
  const [svgs,               setSvgs]               = useState({ anterior: '', posterior: '' })
  const [transitionsEnabled, setTransitionsEnabled]  = useState(false)
  const svgRef      = useRef(null)
  const touchStartX = useRef(null)
  const didSwipe    = useRef(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const sevenStr = sevenAgo.toISOString().split('T')[0]

  // Load both SVG files once on mount
  useEffect(() => {
    Promise.all([
      fetch('/New%20SVG%202D%20MODEL/Frame%201%20front.svg').then(r => r.text()),
      fetch('/New%20SVG%202D%20MODEL/Frame%202%20back.svg').then(r => r.text()),
    ]).then(([ant, post]) => {
      setSvgs({ anterior: tagDetailLines(ant), posterior: post })
      // Double rAF ensures first painted frame with fills applied before transitions are enabled,
      // eliminating the flash-of-unstyled-filter on mobile initial load.
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionsEnabled(true)))
    })
  }, [])

  const counts = useMemo(() => {
    const c = {}; MUSCLES.forEach(m => { c[m] = 0 })
    const seen = new Set()
    workouts.forEach(w => {
      if (!w.workout_date || w.workout_date < sevenStr || w.workout_date > todayStr) return
      ;(w.exercises || []).forEach(ex => {
        const mg = ex.muscle_group; if (!mg) return
        if (mg === 'Full Body') {
          MUSCLES.forEach(k => { const key = `${w.workout_date}-${k}`; if (!seen.has(key)) { seen.add(key); c[k]++ } })
        } else if (c[mg] !== undefined) {
          const key = `${w.workout_date}-${mg}`; if (!seen.has(key)) { seen.add(key); c[mg]++ }
        }
      })
    })
    return c
  }, [workouts, sevenStr, todayStr])

  const lastWorked = useMemo(() => {
    const lw = {}
    workouts.forEach(w => {
      if (!w.workout_date) return
      ;(w.exercises || []).forEach(ex => {
        if (!ex.muscle_group || ex.muscle_group === 'Full Body') return
        if (!lw[ex.muscle_group] || w.workout_date > lw[ex.muscle_group]) lw[ex.muscle_group] = w.workout_date
      })
    })
    return lw
  }, [workouts])

  function muscleAgeDays(muscle) {
    const lw = lastWorked[muscle]
    if (!lw) return null
    return Math.round((new Date(todayStr + 'T12:00:00') - new Date(lw + 'T12:00:00')) / 86400000)
  }

  // CSS-based muscle highlighting — scoped to .mm-body-scope to avoid leaking to other SVGs
  const muscleCSS = useMemo(() => {
    const lines = []
    // Transition only enabled after SVGs first paint to prevent flicker on mobile mount
    const tr = transitionsEnabled ? 'transition: filter 0.4s ease;' : 'transition: none;'

    lines.push('.mm-body-scope svg { width: 100% !important; height: auto !important; display: block; }')

    NON_INTERACTIVE_IDS.forEach(id => {
      lines.push(`.mm-body-scope #${id} path { fill: none !important; stroke: rgba(255,255,255,0.88) !important; stroke-width: 1.8px !important; }`)
      lines.push(`.mm-body-scope #${id} { pointer-events: none !important; filter: ${BODY_OUTLINE_FILTER}; animation: mmIdleGlow 4s ease-in-out infinite; }`)
    })

    // Head region
    const headSel  = selected === 'Head'
    const headFill = headSel ? ACTIVE_FILL.Head : 'none'
    const headGlow = headSel ? makeGlow(ACTIVE_GLOW_RGB.Head) + ' ' + BODY_OUTLINE_FILTER + ' ' + WHITE_RIM : BODY_OUTLINE_FILTER + ' ' + WHITE_RIM
    const headAnim = headSel ? 'mmSelectPulse 2.4s ease-in-out infinite' : 'mmIdleGlow 4s ease-in-out 0s infinite'
    lines.push(`.mm-body-scope #head_spine_rear path { fill: ${headFill} !important; stroke: rgba(255,255,255,0.88) !important; stroke-width: 1.8px !important; }`)
    lines.push(`.mm-body-scope #head_spine_rear { filter: ${headGlow}; cursor: pointer; animation: ${headAnim}; ${tr} }`)

    // Interactive muscle regions
    MUSCLES.filter(m => m !== 'Head').forEach((region, mIdx) => {
      const isSelected = selected === region
      const ids        = REGION_TO_IDS[region] || []
      if (!ids.length) return

      const lw         = lastWorked[region]
      const isFatigued = lw
        ? Math.round((new Date(todayStr + 'T12:00:00') - new Date(lw + 'T12:00:00')) / 86400000) === 0
        : false

      const isShins  = region === 'Shins' || region === 'Triceps'
      const fill     = isShins ? 'none' : isSelected ? ACTIVE_FILL[region] : IDLE_FILL[region]
      const filter   = isSelected ? makeGlow(ACTIVE_GLOW_RGB[region]) + ' ' + BODY_OUTLINE_FILTER + ' ' + WHITE_RIM : BODY_OUTLINE_FILTER + ' ' + WHITE_RIM
      const stroke   = isShins ? 'rgba(255,255,255,0.88)' : isSelected ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.42)'
      const strokeW  = isShins ? '1.8px'                  : isSelected ? '0.9px'                  : '0.6px'

      const anim = isSelected
        ? 'mmSelectPulse 2.4s ease-in-out infinite'
        : isFatigued
        ? 'mmFatiguePulse 2s ease-in-out infinite'
        : `mmIdleGlow 3.5s ease-in-out ${(mIdx * 0.3).toFixed(1)}s infinite`

      ids.forEach(id => {
        lines.push(`.mm-body-scope #${id} path { fill: ${fill} !important; stroke: ${stroke} !important; stroke-width: ${strokeW} !important; }`)
        // Compound stroke-only paths (muscle-detail-line) must stay fill:none — CSS forced fills on
        // compound multi-sub-path elements create winding-rule holes that reveal muscles behind.
        lines.push(`.mm-body-scope #${id} path.muscle-detail-line { fill: none !important; stroke: rgba(255,255,255,0.10) !important; }`)
        lines.push(`.mm-body-scope #${id} { filter: ${filter}; cursor: pointer; animation: ${anim}; ${tr} }`)
      })
    })

    // Knee-adjacent quad detail lines get ghosted so the joint boundary reads cleanly.
    // Specificity: #id path.knee-detail-line (1,2,1) beats #id path (1,1,1) — wins !important race.
    lines.push('.mm-body-scope #quadriceps_femoris_left path.knee-detail-line { stroke-opacity: 0.22 !important; }')
    lines.push('.mm-body-scope #quadriceps_femoris_right path.knee-detail-line { stroke-opacity: 0.22 !important; }')

    return lines.join('\n')
  }, [selected, lastWorked, todayStr, transitionsEnabled])

  useEffect(() => {
    if (selected && selected !== 'Head') {
      const dbKey = GROUP_TO_DB[selected]
      if (dbKey && DB[dbKey]) setExercises(pickFour(DB[dbKey].exercises))
    } else {
      setExercises([])
    }
    setBreathingEx(null)
  }, [selected])

  // Event delegation: walk up from clicked element to find a named muscle group
  function handleSvgClick(e) {
    if (didSwipe.current) { didSwipe.current = false; return }
    let el = e.target
    while (el && el !== e.currentTarget) {
      if (el.id && GROUP_FROM_ID[el.id]) {
        const group = GROUP_FROM_ID[el.id]
        setLastSelected(group)
        setSelected(s => s === group ? null : group)
        return
      }
      el = el.parentElement
    }
  }

  function handleShuffle() {
    if (!selected) return
    const dbKey = GROUP_TO_DB[selected]
    if (!dbKey || !DB[dbKey]) return
    setSpinning(true)
    setExercises(pickFour(DB[dbKey].exercises))
    setTimeout(() => setSpinning(false), 460)
  }

  const isHead = selected === 'Head'
  const n      = selected && !isHead ? (counts[selected] || 0) : 0
  const rec    = selected && !isHead ? getRecovery(n) : null
  const dbData = selected && !isHead ? DB[GROUP_TO_DB[selected]] : null
  const labels = LABELS[view] || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        @keyframes mmFadeUp         { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes mmGlow           { 0%,100% { opacity:0.85 } 50% { opacity:1 } }
        @keyframes mmPulse          { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        @keyframes mmSelectPulse    { 0%,100% { opacity:0.78 } 50% { opacity:1.00 } }
        @keyframes mmIdleGlow       { 0%,100% { opacity:0.42 } 50% { opacity:0.88 } }
        @keyframes mmCrosshairPulse { 0%,100% { opacity:0.45; transform:scale(1) } 50% { opacity:0.9; transform:scale(1.14) } }
        @-webkit-keyframes mmFatiguePulse { 0%,100% { opacity:0.32 } 50% { opacity:0.62 } }
        @keyframes mmFatiguePulse         { 0%,100% { opacity:0.32 } 50% { opacity:0.62 } }
        @-webkit-keyframes mmPulse        { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        @-webkit-keyframes mmSelectPulse  { 0%,100% { opacity:0.78 } 50% { opacity:1.00 } }
        @-webkit-keyframes mmIdleGlow     { 0%,100% { opacity:0.42 } 50% { opacity:0.88 } }
        @keyframes mmScan    { 0%{transform:translateY(0);opacity:0} 4%{opacity:0.85} 30%{transform:translateY(1620px);opacity:0.5} 33%{transform:translateY(1620px);opacity:0} 100%{transform:translateY(1620px);opacity:0} }
        @keyframes mmRipple  { from{transform:scale(0);opacity:0.85} to{transform:scale(1);opacity:0} }
      `}</style>

      {/* Dynamic muscle highlighting */}
      <style>{muscleCSS}</style>

      {/* Front / Back toggle */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[['anterior','Front'], ['posterior','Back']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '7px 26px', borderRadius: 99, cursor: 'pointer',
            background: view === v
              ? 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.08) 100%)'
              : 'var(--bg-card)',
            border: `1px solid ${view === v ? 'rgba(56,189,248,0.6)' : 'var(--border)'}`,
            color: view === v ? '#38bdf8' : 'var(--text-muted)',
            fontSize: 11, fontFamily: FF, fontWeight: view === v ? 700 : 400,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            boxShadow: view === v ? '0 0 14px rgba(56,189,248,0.28), inset 0 1px 0 rgba(56,189,248,0.18)' : 'none',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Body model + label overlay */}
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
        <div
          style={{ position: 'relative', width: '100%', maxWidth: 240, overflow: 'visible' }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(dx) > 40) { setView(dx < 0 ? 'posterior' : 'anterior'); didSwipe.current = true }
            touchStartX.current = null
          }}
          onPointerDown={e => {
            const svg = svgRef.current
            if (!svg) return
            const rect = svg.getBoundingClientRect()
            if (!rect.width || !rect.height) return
            const x = (e.clientX - rect.left) / rect.width  * 580
            const y = (e.clientY - rect.top)  / rect.height * 1615
            const id = Date.now()
            setRipples(r => [...r, { x, y, id }])
            setTimeout(() => setRipples(r => r.filter(ri => ri.id !== id)), 700)
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, borderRadius: 8, pointerEvents: 'none',
            background: selected && ACTIVE_GLOW_RGB[selected]
              ? `radial-gradient(ellipse 72% 62% at 50% 45%, rgba(${ACTIVE_GLOW_RGB[selected].join(',')},0.16) 0%, transparent 65%)`
              : 'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(27,58,107,0.08) 0%, transparent 65%)',
            transition: 'background 0.6s ease',
          }}/>

          {/* Inline SVG body — CSS class scopes all muscle highlighting rules */}
          <div
            className="mm-body-scope"
            style={{
              position: 'relative', zIndex: 1, width: '100%',
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.18))',
            }}
            dangerouslySetInnerHTML={{ __html: svgs[view] || '' }}
            onClick={handleSvgClick}
          />

          {/* Label overlay — same viewBox as body SVG */}
          <svg
            ref={svgRef}
            viewBox="0 0 580 1615"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              overflow: 'visible', pointerEvents: 'none',
            }}
          >
            <defs>
              <filter id="mm-label-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
                <feFlood floodColor="#38bdf8" floodOpacity="1" result="col"/>
                <feComposite in="col" in2="blur" operator="in" result="wb"/>
                <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <linearGradient id="mm-scan-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="transparent"/>
                <stop offset="20%"  stopColor="rgba(255,255,255,0.18)"/>
                <stop offset="50%"  stopColor="rgba(255,255,255,0.72)"/>
                <stop offset="80%"  stopColor="rgba(255,255,255,0.18)"/>
                <stop offset="100%" stopColor="transparent"/>
              </linearGradient>
            </defs>

            {/* Periodic scan sweep */}
            <rect
              x="0" y="-5" width="580" height="10"
              fill="url(#mm-scan-grad)"
              style={{
                animation: 'mmScan 14s ease-in-out infinite',
                filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.90)) drop-shadow(0 0 14px rgba(255,255,255,0.40))',
              }}
            />

            {/* Tap ripples */}
            {ripples.map(rp => (
              <circle
                key={rp.id}
                cx={rp.x} cy={rp.y}
                r="64"
                fill="rgba(56,189,248,0.10)"
                stroke="rgba(147,223,253,0.72)"
                strokeWidth="3.2"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: 'mmRipple 0.65s ease-out forwards',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Leader-line labels */}
            {labels.map(l => {
              const isActive    = selected === l.group
              const isHeadLbl   = l.group === 'Head'
              const idleFill    = isHeadLbl ? MIND_COLOR : (IDLE_FILL[l.group] ?? MIND_COLOR)
              const activeFill  = isHeadLbl ? MIND_COLOR : (ACTIVE_FILL[l.group] ?? MIND_COLOR)
              const color       = isActive ? activeFill : idleFill + '88'
              const lineX1      = l.anchor === 'start' ? 581 : -1
              const dotX        = l.ex

              return (
                <g key={l.group} style={{ transition: 'opacity 0.2s' }}>
                  <line
                    x1={lineX1} y1={l.y}
                    x2={dotX}   y2={l.y}
                    stroke={color}
                    strokeWidth={isActive ? 3 : 2}
                    strokeDasharray={isActive ? 'none' : '12 12'}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                  <circle cx={dotX} cy={l.y} r={isActive ? 8 : 5}
                    fill={color}
                    style={{ transition: 'fill 0.2s' }}
                  />
                  <text
                    x={l.x} y={l.y}
                    textAnchor={l.anchor}
                    fontSize="27"
                    fontFamily={FF}
                    fontWeight={isActive ? '700' : '500'}
                    fill={color}
                    filter={isActive ? 'url(#mm-label-glow)' : undefined}
                    letterSpacing="0.04em"
                    style={{
                      transition: 'fill 0.2s',
                      animation: isActive ? 'mmGlow 2.4s ease-in-out infinite' : undefined,
                    }}
                  >
                    {l.group}
                  </text>
                  <text
                    x={l.x} y={l.y + 24}
                    textAnchor={l.anchor}
                    fontSize="19"
                    fontFamily={FF}
                    fontWeight="400"
                    fontStyle="italic"
                    fill={isActive ? activeFill + 'cc' : idleFill + '44'}
                    letterSpacing="0.02em"
                    style={{ transition: 'fill 0.2s' }}
                  >
                    {SCI_SHORT[l.group] || ''}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Detail panel */}
      {!selected ? (
        <div style={{
          background: 'radial-gradient(ellipse 110% 100% at 50% 0%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 0 24px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.14)',
          borderRadius: 14, padding: '22px 18px 18px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.80)" strokeWidth="1.4" strokeLinecap="round"
            style={{ animation: 'mmCrosshairPulse 2.4s ease-in-out infinite', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.55))' }}>
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3.5"/>
            <line x1="12" y1="2" x2="12" y2="5.5"/>
            <line x1="12" y1="18.5" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="5.5" y2="12"/>
            <line x1="18.5" y1="12" x2="22" y2="12"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: FF, fontStyle: 'italic', margin: '0 0 7px', lineHeight: 1.55, textShadow: '0 0 12px rgba(255,255,255,0.35)' }}>
              Tap a muscle on the model<br/>to see activation details
            </p>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 9.5, fontFamily: FF, letterSpacing: '0.06em', margin: 0 }}>
              Exercises · Recovery · Scientific name
            </p>
          </div>
          {lastSelected && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 13px', borderRadius: 99,
              background: `${HIGHLIGHT_COLOR}12`, border: `1px solid ${HIGHLIGHT_COLOR}38`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: HIGHLIGHT_COLOR, boxShadow: `0 0 5px ${HIGHLIGHT_COLOR}` }}/>
              <p style={{ color: `${HIGHLIGHT_COLOR}cc`, fontSize: 9.5, fontFamily: FF, fontWeight: 600, margin: 0, letterSpacing: '0.04em' }}>
                Last: {lastSelected}
              </p>
            </div>
          )}
        </div>
      ) : isHead ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'mmFadeUp 0.22s ease both' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${MIND_COLOR}35`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              background: `linear-gradient(90deg, ${MIND_COLOR}18 0%, transparent 100%)`,
              borderBottom: `1px solid ${MIND_COLOR}22`,
              padding: '11px 14px',
              display: 'flex', alignItems: 'center', gap: 9,
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MIND_COLOR} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9.5 2a3.5 3.5 0 0 1 3 1.7A3.5 3.5 0 0 1 18 7v1a3 3 0 0 1 1 5.74V15a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1.26A3 3 0 0 1 6 8V7a3.5 3.5 0 0 1 3.5-5z"/>
                <path d="M12 12v5M9 15h6"/>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ color: MIND_COLOR, fontSize: 14, fontWeight: 800, fontFamily: FF, margin: 0, lineHeight: 1.2 }}>Mind & Recovery</p>
                <p style={{ color: `${MIND_COLOR}99`, fontSize: 8.5, fontFamily: FF, fontStyle: 'italic', margin: 0 }}>Stress Relief · Breathing Techniques</p>
              </div>
            </div>
            <div style={{ padding: '10px 14px 12px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, lineHeight: 1.68, margin: 0 }}>{MIND_DATA.desc}</p>
            </div>
          </div>

          {breathingEx ? (
            <div style={{
              background: 'var(--bg-card)', border: `1px solid ${MIND_COLOR}30`,
              borderRadius: 14, padding: '14px 16px',
              animation: 'mmFadeUp 0.18s ease both',
            }}>
              <BreathingGuide exercise={breathingEx} onStop={() => setBreathingEx(null)} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <p style={{ color: `${MIND_COLOR}88`, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: FF, fontWeight: 700, margin: '0 0 2px 2px' }}>
                Breathing Exercises
              </p>
              {MIND_DATA.breathing.map(ex => (
                <button key={ex.name} onClick={() => setBreathingEx(ex)} style={{
                  display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left',
                  background: `${MIND_COLOR}08`, border: `1px solid ${MIND_COLOR}28`,
                  borderRadius: 11, padding: '11px 13px', cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: MIND_COLOR, boxShadow: `0 0 6px ${MIND_COLOR}`, flexShrink: 0 }}/>
                    <p style={{ color: MIND_COLOR, fontSize: 12, fontWeight: 700, fontFamily: FF, margin: 0, flex: 1 }}>{ex.name}</p>
                    <span style={{
                      background: `${MIND_COLOR}18`, border: `1px solid ${MIND_COLOR}38`,
                      color: `${MIND_COLOR}cc`, fontSize: 8, fontFamily: FF, fontWeight: 600,
                      padding: '2px 7px', borderRadius: 99, letterSpacing: '0.04em',
                    }}>{ex.tag}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 10.5, fontFamily: FF, margin: '0 0 0 13px', lineHeight: 1.55 }}>{ex.desc}</p>
                  <p style={{ color: `${MIND_COLOR}77`, fontSize: 8.5, fontFamily: FF, margin: '0 0 0 13px', letterSpacing: '0.04em' }}>
                    {ex.phases.map(p => `${p.label} ${p.s}s`).join(' · ')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'mmFadeUp 0.22s ease both' }}>

          {dbData && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(16,185,129,0.28)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{
                background: 'linear-gradient(90deg, rgba(16,185,129,0.14) 0%, rgba(255,255,255,0.03) 100%)',
                borderBottom: '1px solid rgba(16,185,129,0.15)',
                padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: 9,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.85)' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, fontFamily: FF, margin: 0, lineHeight: 1.2, textShadow: '0 0 10px rgba(16,185,129,0.9), 0 0 22px rgba(255,255,255,0.35)' }}>{selected}</p>
                  <p style={{ color: 'rgba(180,240,210,0.65)', fontSize: 8.5, fontFamily: FF, fontStyle: 'italic', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dbData.scientific}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: i <= dbData.intensity ? '#10b981' : 'rgba(212,212,232,0.10)',
                      boxShadow: i <= dbData.intensity ? '0 0 4px rgba(16,185,129,0.85)' : 'none',
                    }}/>
                  ))}
                </div>
              </div>

              <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontFamily: FF, lineHeight: 1.68, margin: 0, textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>{dbData.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {n > 0 && (
                    <span style={{
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.42)',
                      color: '#10b981', fontSize: 9, fontFamily: FF, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em',
                    }}>{n}× this week</span>
                  )}
                  {rec && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: rec.color, fontSize: 9, fontFamily: FF, fontWeight: 600 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: rec.color, display: 'inline-block', boxShadow: `0 0 4px ${rec.color}` }}/>
                      {rec.status}
                    </span>
                  )}
                  {lastWorked[selected] && (
                    <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF }}>
                      Last: {fmtDate(lastWorked[selected], todayStr)}
                    </span>
                  )}
                </div>
                {onLogWorkout && (
                  <button onClick={() => onLogWorkout(selected)} style={{
                    width: '100%', padding: '10px',
                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.42)',
                    borderRadius: 10, cursor: 'pointer',
                    color: '#10b981', fontSize: 11, fontWeight: 700,
                    fontFamily: FF, letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    marginTop: 2,
                  }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Log {selected} Workout
                  </button>
                )}
              </div>
            </div>
          )}

          {dbData && exercises.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 3, height: 12, background: '#ffffff', borderRadius: 2, boxShadow: '0 0 6px rgba(255,255,255,0.7)' }}/>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: FF, fontWeight: 700, flex: 1, margin: 0 }}>
                  Exercises
                </p>
                <button onClick={handleShuffle} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: 700,
                  fontFamily: FF, cursor: 'pointer', letterSpacing: '0.08em',
                }}>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.46s ease' }}>
                    <polyline points="1 4 1 10 7 10"/>
                    <polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  Shuffle
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exercises.map((ex, i) => <ExCard key={`${ex.name}-${i}`} ex={ex} accent='#10b981' onLog={onSaveExercise} muscleLabel={dbData?.label} />)}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
