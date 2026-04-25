import { useState, useMemo, useEffect, useRef } from 'react'
import Model from 'react-body-highlighter'
import { DB } from './WorkoutGuide'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MIND_COLOR = '#a78bfa'

const MUSCLES = ['Head','Chest','Shoulders','Traps','Biceps','Triceps','Core','Upper Back','Lower Back','Quads','Hamstrings','Glutes','Calves']

const SLUG_MAP = {
  Head:           ['head'],
  Chest:          ['chest'],
  Shoulders:      ['front-deltoids', 'back-deltoids'],
  Traps:          ['trapezius', 'neck'],  // neck polygon covers upper traps on anterior view
  Biceps:         ['biceps', 'forearm'],
  Triceps:        ['triceps'],
  Core:           ['abs', 'obliques'],
  'Upper Back':   ['upper-back'],
  'Lower Back':   ['lower-back'],
  Quads:          ['quadriceps'],
  Hamstrings:     ['hamstring'],
  Glutes:         ['gluteal'],
  Calves:         ['calves', 'left-soleus', 'right-soleus'],
}

const GROUP_FROM_SLUG = {
  head:            'Head',
  chest:           'Chest',
  'front-deltoids':'Shoulders',
  'back-deltoids': 'Shoulders',
  biceps:          'Biceps',
  forearm:         'Biceps',
  triceps:         'Triceps',
  abs:             'Core',
  obliques:        'Core',
  trapezius:       'Traps',
  neck:            'Traps',
  'upper-back':    'Upper Back',
  'lower-back':    'Lower Back',
  quadriceps:      'Quads',
  adductor:        'Quads',
  abductors:       'Quads',
  hamstring:       'Hamstrings',
  gluteal:         'Glutes',
  calves:          'Calves',
  'left-soleus':   'Calves',
  'right-soleus':  'Calves',
}

const GROUP_TO_DB = {
  Head:           null,
  Chest:          'chest',
  Shoulders:      'shoulders',
  Traps:          'traps',
  Biceps:         'biceps',
  Triceps:        'triceps',
  Core:           'core',
  'Upper Back':   'upper_back',
  'Lower Back':   'lower_back',
  Quads:          'quads',
  Hamstrings:     'hamstrings',
  Glutes:         'glutes',
  Calves:         'calves',
}

const SCI_SHORT = {
  Head:           'Mind & Recovery',
  Chest:          'Pectoralis',
  Shoulders:      'Deltoideus',
  Traps:          'Trapezius',
  Biceps:         'Biceps Brachii',
  Triceps:        'Triceps Brachii',
  Core:           'Rectus Abdominis',
  'Upper Back':   'Rhomboids',
  'Lower Back':   'Erector Spinae',
  Quads:          'Quadriceps Femoris',
  Hamstrings:     'Biceps Femoris',
  Glutes:         'Gluteus Maximus',
  Calves:         'Gastrocnemius',
}

// Muscle cuts, bone landmarks, and vein paths — coords in model's 0 0 100 200 space.
// Based on actual polygon data extracted from react-body-highlighter source.
const DEFINITION_LINES = {
  anterior: {
    Traps: [
      { d: 'M 44 24 Q 40 30 38 35',            type: 'muscle' }, // left upper trap (anterior)
      { d: 'M 56 24 Q 60 30 62 35',            type: 'muscle' }, // right upper trap (anterior)
    ],
    Chest: [
      { d: 'M 49.5 34 L 49.5 58',             type: 'bone'   }, // sternum
      { d: 'M 49 34 L 22 31',                  type: 'bone'   }, // left clavicle
      { d: 'M 51 34 L 78 31',                  type: 'bone'   }, // right clavicle
      { d: 'M 32 54 Q 41 61 49.5 58',          type: 'muscle' }, // left pec lower arch
      { d: 'M 68 54 Q 59 61 50.5 58',          type: 'muscle' }, // right pec lower arch
      { d: 'M 49.5 41 Q 38 47 30 53',          type: 'muscle' }, // left pec fiber
      { d: 'M 50.5 41 Q 62 47 70 53',          type: 'muscle' }, // right pec fiber
      { d: 'M 49 38 Q 47.5 48 48.5 57',        type: 'vein'   }, // left sternal vein
      { d: 'M 51 38 Q 52.5 48 51.5 57',        type: 'vein'   }, // right sternal vein
    ],
    Shoulders: [
      { d: 'M 22 32 Q 18.5 38 20 45',          type: 'muscle' }, // left delt groove
      { d: 'M 78 32 Q 81.5 38 80 45',          type: 'muscle' }, // right delt groove
      { d: 'M 20 45 Q 24 51 28 56',            type: 'muscle' }, // left delt/bi junction
      { d: 'M 80 45 Q 76 51 72 56',            type: 'muscle' }, // right delt/bi junction
      { d: 'M 21 38 Q 19 44 20 52',            type: 'vein'   }, // left cephalic vein (shoulder)
      { d: 'M 79 38 Q 81 44 80 52',            type: 'vein'   }, // right cephalic vein (shoulder)
    ],
    Biceps: [
      { d: 'M 23 52 Q 21 61 19 71',            type: 'muscle' }, // left bicep split
      { d: 'M 77 52 Q 79 61 81 71',            type: 'muscle' }, // right bicep split
      { d: 'M 21 54 Q 19 65 17 75',            type: 'vein'   }, // left cephalic vein (bicep)
      { d: 'M 79 54 Q 81 65 83 75',            type: 'vein'   }, // right cephalic vein (bicep)
      { d: 'M 24 56 Q 22 66 20 74',            type: 'vein'   }, // left basilic vein
      { d: 'M 76 56 Q 78 66 80 74',            type: 'vein'   }, // right basilic vein
      { d: 'M 15 78 Q 10 89 7 98',             type: 'vein'   }, // left forearm vein 1
      { d: 'M 17 79 Q 13 90 10 99',            type: 'vein'   }, // left forearm vein 2
      { d: 'M 19 78 Q 16 89 14 98',            type: 'vein'   }, // left forearm vein 3
      { d: 'M 85 78 Q 90 89 93 98',            type: 'vein'   }, // right forearm vein 1
      { d: 'M 83 79 Q 87 90 90 99',            type: 'vein'   }, // right forearm vein 2
      { d: 'M 81 78 Q 84 89 86 98',            type: 'vein'   }, // right forearm vein 3
    ],
    Triceps: [
      { d: 'M 25 57 Q 23 64 22 72',            type: 'muscle' }, // left tricep line
      { d: 'M 75 57 Q 77 64 78 72',            type: 'muscle' }, // right tricep line
    ],
    Core: [
      { d: 'M 50 58 L 50 95',                  type: 'muscle' }, // ab midline
      { d: 'M 42 63 Q 50 62 58 63',            type: 'muscle' }, // subcostal arch
      { d: 'M 42 65 L 58 65',                  type: 'muscle' }, // cut 1
      { d: 'M 41 72 L 59 72',                  type: 'muscle' }, // cut 2
      { d: 'M 41 79 L 59 79',                  type: 'muscle' }, // cut 3
      { d: 'M 40 86 L 60 86',                  type: 'muscle' }, // cut 4
      { d: 'M 44 65 L 44 72',                  type: 'muscle' }, // left inner col 1
      { d: 'M 56 65 L 56 72',                  type: 'muscle' }, // right inner col 1
      { d: 'M 43 72 L 43 79',                  type: 'muscle' }, // left inner col 2
      { d: 'M 57 72 L 57 79',                  type: 'muscle' }, // right inner col 2
      { d: 'M 38 64 Q 33 77 35 91',            type: 'muscle' }, // left oblique edge
      { d: 'M 62 64 Q 67 77 65 91',            type: 'muscle' }, // right oblique edge
      { d: 'M 49 65 Q 48 72 49 79',            type: 'muscle' }, // left ab cell line
      { d: 'M 51 65 Q 52 72 51 79',            type: 'muscle' }, // right ab cell line
    ],
    Quads: [
      { d: 'M 40 101 Q 37 123 36 144',         type: 'muscle' }, // left RF/VL cut
      { d: 'M 60 101 Q 63 123 64 144',         type: 'muscle' }, // right RF/VL cut
      { d: 'M 29 112 Q 27 129 27 147',         type: 'muscle' }, // left outer VL
      { d: 'M 71 112 Q 73 129 73 147',         type: 'muscle' }, // right outer VL
      { d: 'M 39 136 Q 37 143 40 151',         type: 'muscle' }, // left VMO bulge
      { d: 'M 61 136 Q 63 143 60 151',         type: 'muscle' }, // right VMO bulge
      { d: 'M 44 102 Q 42 128 42 148',         type: 'vein'   }, // left great saphenous vein
      { d: 'M 56 102 Q 58 128 58 148',         type: 'vein'   }, // right great saphenous vein
    ],
    Calves: [
      { d: 'M 30 165 Q 29 176 30 187',         type: 'muscle' }, // left medial/lateral split
      { d: 'M 70 165 Q 71 176 70 187',         type: 'muscle' }, // right medial/lateral split
      { d: 'M 27 168 Q 26 179 28 187',         type: 'muscle' }, // left lateral head line
      { d: 'M 73 168 Q 74 179 72 187',         type: 'muscle' }, // right lateral head line
      { d: 'M 33 163 Q 32 176 33 188',         type: 'vein'   }, // left anterior tibial vein
      { d: 'M 67 163 Q 68 176 67 188',         type: 'vein'   }, // right anterior tibial vein
    ],
  },
  posterior: {
    Traps: [
      { d: 'M 44 22 Q 37 33 32 42',            type: 'muscle' }, // left trap fiber
      { d: 'M 56 22 Q 63 33 68 42',            type: 'muscle' }, // right trap fiber
      { d: 'M 47.5 22 L 47.5 62',              type: 'muscle' }, // left inner trap line
      { d: 'M 52.5 22 L 52.5 62',              type: 'muscle' }, // right inner trap line
    ],
    Shoulders: [
      { d: 'M 24 39 Q 20 48 22 57',            type: 'muscle' }, // left rear delt line
      { d: 'M 76 39 Q 80 48 78 57',            type: 'muscle' }, // right rear delt line
    ],
    'Upper Back': [
      { d: 'M 50 28 L 50 100',                 type: 'bone'   }, // spine
      { d: 'M 47 40 L 35 56 L 37 67',          type: 'muscle' }, // left scapula border
      { d: 'M 53 40 L 65 56 L 63 67',          type: 'muscle' }, // right scapula border
      { d: 'M 47 41 Q 41 55 37 65',            type: 'muscle' }, // left lat sweep
      { d: 'M 53 41 Q 59 55 63 65',            type: 'muscle' }, // right lat sweep
      { d: 'M 41 68 Q 35 77 34 86',            type: 'muscle' }, // left lat lower
      { d: 'M 59 68 Q 65 77 66 86',            type: 'muscle' }, // right lat lower
    ],
    'Lower Back': [
      { d: 'M 46 74 L 44 101',                 type: 'muscle' }, // left erector spinae
      { d: 'M 54 74 L 56 101',                 type: 'muscle' }, // right erector spinae
      { d: 'M 44 80 Q 43 88 44 97',            type: 'vein'   }, // left paraspinal vein
      { d: 'M 56 80 Q 57 88 56 97',            type: 'vein'   }, // right paraspinal vein
    ],
    Triceps: [
      { d: 'M 22 56 Q 19 67 18 77',            type: 'muscle' }, // left long head
      { d: 'M 78 56 Q 81 67 82 77',            type: 'muscle' }, // right long head
      { d: 'M 25 59 Q 22 69 21 79',            type: 'muscle' }, // left lateral head
      { d: 'M 75 59 Q 78 69 79 79',            type: 'muscle' }, // right lateral head
      { d: 'M 19 60 Q 17 70 16 80',            type: 'vein'   }, // left posterior vein
      { d: 'M 81 60 Q 83 70 84 80',            type: 'vein'   }, // right posterior vein
      { d: 'M 16 82 Q 13 90 11 100',           type: 'vein'   }, // left forearm posterior vein
      { d: 'M 84 82 Q 87 90 89 100',           type: 'vein'   }, // right forearm posterior vein
    ],
    Glutes: [
      { d: 'M 50 100 L 50 123',                type: 'muscle' }, // glute cleft
      { d: 'M 32 113 Q 41 120 49.5 117',       type: 'muscle' }, // left glute crease
      { d: 'M 68 113 Q 59 120 50.5 117',       type: 'muscle' }, // right glute crease
    ],
    Hamstrings: [
      { d: 'M 33 128 Q 31 144 29 161',         type: 'muscle' }, // left biceps femoris
      { d: 'M 67 128 Q 69 144 71 161',         type: 'muscle' }, // right biceps femoris
      { d: 'M 38 127 Q 37 146 38 163',         type: 'muscle' }, // left semimembranosus
      { d: 'M 62 127 Q 63 146 62 163',         type: 'muscle' }, // right semimembranosus
    ],
    Calves: [
      { d: 'M 30 168 Q 29 180 30 193',         type: 'muscle' }, // left lateral/medial split
      { d: 'M 70 168 Q 71 180 70 193',         type: 'muscle' }, // right lateral/medial split
      { d: 'M 26 169 Q 25 181 27 193',         type: 'muscle' }, // left lateral head
      { d: 'M 74 169 Q 75 181 73 193',         type: 'muscle' }, // right lateral head
      { d: 'M 34 166 Q 33 179 34 193',         type: 'vein'   }, // left small saphenous vein
      { d: 'M 66 166 Q 67 179 66 193',         type: 'vein'   }, // right small saphenous vein
    ],
  },
}

// Labels positioned in the model's 0 0 100 200 coordinate space.
// x < 0 or x > 100 renders outside body (requires overflow:visible on parent).
// ex = x-coordinate of the leader line's body-side endpoint.
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
    { group: 'Head',        x: 103, y: 11,  anchor: 'start', ex: 57 },
    { group: 'Shoulders',   x: 103, y: 42,  anchor: 'start', ex: 79 },
    { group: 'Chest',       x: 103, y: 51,  anchor: 'start', ex: 70 },
    { group: 'Biceps',      x: -3,  y: 61,  anchor: 'end',   ex: 17 },
    { group: 'Core',        x: 103, y: 81,  anchor: 'start', ex: 59 },
    { group: 'Quads',       x: -3,  y: 118, anchor: 'end',   ex: 29 },
    { group: 'Calves',      x: 103, y: 175, anchor: 'start', ex: 74 },
  ],
  posterior: [
    { group: 'Head',        x: 103, y: 10,  anchor: 'start', ex: 57 },
    { group: 'Traps',       x: 103, y: 38,  anchor: 'start', ex: 64 },
    { group: 'Shoulders',   x: -3,  y: 46,  anchor: 'end',   ex: 29 },
    { group: 'Upper Back',  x: 103, y: 57,  anchor: 'start', ex: 66 },
    { group: 'Triceps',     x: -3,  y: 65,  anchor: 'end',   ex: 27 },
    { group: 'Lower Back',  x: -3,  y: 82,  anchor: 'end',   ex: 44 },
    { group: 'Glutes',      x: 103, y: 111, anchor: 'start', ex: 69 },
    { group: 'Hamstrings',  x: -3,  y: 140, anchor: 'end',   ex: 29 },
    { group: 'Calves',      x: 103, y: 178, anchor: 'start', ex: 71 },
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

  // Derive current phase from elapsed seconds
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

      {/* Animated breathing ring */}
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

function ExCard({ ex, accent }) {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '11px 12px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, fontFamily: FF, marginBottom: 3 }}>{ex.name}</p>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: FF, background: 'rgba(212,212,232,0.06)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{ex.eq}</span>
            <span style={{ color: accent, fontSize: 9, fontFamily: FF, fontWeight: 700, background: `${accent}18`, padding: '2px 6px', borderRadius: 4 }}>{ex.sets}</span>
          </div>
        </div>
        <a href={ytUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
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
  )
}

export default function MuscleMapView({ workouts = [] }) {
  const [selected,     setSelected]    = useState(null)
  const [view,         setView]        = useState('anterior')
  const [exercises,    setExercises]   = useState([])
  const [spinning,     setSpinning]    = useState(false)
  const [breathingEx,  setBreathingEx] = useState(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7)
  const sevenStr = sevenAgo.toISOString().split('T')[0]

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

  useEffect(() => {
    if (selected && selected !== 'Head') {
      const dbKey = GROUP_TO_DB[selected]
      if (dbKey && DB[dbKey]) setExercises(pickFour(DB[dbKey].exercises))
    } else {
      setExercises([])
    }
    setBreathingEx(null)
  }, [selected])

  function handleClick({ muscle }) {
    const group = GROUP_FROM_SLUG[muscle]
    if (group) setSelected(s => s === group ? null : group)
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
        @keyframes mmFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes mmGlow   { 0%,100% { opacity:0.85 } 50% { opacity:1 } }
        @keyframes mmPulse  { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
      `}</style>

      {/* Front / Back toggle */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[['anterior','Front'], ['posterior','Back']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '6px 20px', borderRadius: 99, cursor: 'pointer',
            background: view === v ? 'rgba(180,188,220,0.12)' : 'var(--bg-card)',
            border:    `1px solid ${view === v ? 'rgba(180,188,220,0.45)' : 'var(--border)'}`,
            color:      view === v ? '#d8e0ee' : 'var(--text-muted)',
            fontSize: 11, fontFamily: FF, fontWeight: view === v ? 700 : 400,
            letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Body model + label overlay */}
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 240, overflow: 'visible' }}>

          {/* Background glow — tints to selected muscle DB color */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, borderRadius: 8, pointerEvents: 'none',
            background: dbData
              ? `radial-gradient(ellipse 72% 62% at 50% 45%, ${dbData.color}28 0%, transparent 65%)`
              : 'none',
            transition: 'background 0.6s ease',
          }}/>

          {/* Base body silhouette — handles all click events */}
          <Model
            data={[]}
            type={view}
            bodyColor="#1a1a28"
            onClick={handleClick}
            style={{
              width: '100%', display: 'block', position: 'relative', zIndex: 1,
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.28)) drop-shadow(0 0 1px rgba(255,255,255,0.55))',
            }}
            svgStyle={{ borderRadius: 8 }}
          />

          {/* Per-muscle DB-colored overlays */}
          {MUSCLES.map(m => {
            const dbKey = GROUP_TO_DB[m]
            const color = m === 'Head' ? MIND_COLOR : (DB[dbKey]?.color || '#b4bccc')
            const c     = counts[m] || 0
            const isSel = selected === m
            const op    = isSel ? 1.0 : c === 0 ? 0.38 : c === 1 ? 0.60 : c === 2 ? 0.80 : 0.95
            return (
              <div key={m} style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                opacity: op,
                filter: isSel ? `drop-shadow(0 0 9px ${color}) drop-shadow(0 0 4px ${color})` : undefined,
                transition: 'opacity 0.35s ease, filter 0.35s ease',
                animation: isSel ? 'mmPulse 2.4s ease-in-out infinite' : undefined,
              }}>
                <Model
                  data={[{ name: m, muscles: SLUG_MAP[m], frequency: 1 }]}
                  type={view}
                  bodyColor="rgba(0,0,0,0)"
                  highlightedColors={[color, color, color]}
                  style={{ width: '100%', display: 'block' }}
                  svgStyle={{ borderRadius: 8 }}
                />
              </div>
            )
          })}

          {/* Label overlay — viewBox matches model's 0 0 100 200 space */}
          <svg
            viewBox="0 0 100 200"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              overflow: 'visible', pointerEvents: 'none',
            }}
          >
            <defs>
              <filter id="mm-label-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/>
                <feFlood floodColor="#ffffff" floodOpacity="1" result="white"/>
                <feComposite in="white" in2="blur" operator="in" result="wb"/>
                <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Facial definition — anterior only, always visible */}
            {view === 'anterior' && (
              <g opacity="0.32" pointerEvents="none">
                <ellipse cx="46.2" cy="9.2" rx="1.9" ry="1.3" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.35"/>
                <ellipse cx="53.8" cy="9.2" rx="1.9" ry="1.3" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.35"/>
                <path d="M 50 11 L 48.3 14.2 M 50 11 L 51.7 14.2 M 48 14.3 Q 50 15.2 52 14.3" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.3" strokeLinecap="round"/>
                <path d="M 46.5 17.8 Q 50 20 53.5 17.8" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.42" strokeLinecap="round"/>
                <path d="M 41.8 11.5 Q 42.5 20.5 50 24.2" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.28" strokeLinecap="round"/>
                <path d="M 58.2 11.5 Q 57.5 20.5 50 24.2" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.28" strokeLinecap="round"/>
                <path d="M 49.5 21.5 Q 50 22.5 50.5 21.5" fill="none" stroke="rgba(155,168,195,1)" strokeWidth="0.28" strokeLinecap="round"/>
              </g>
            )}

            {/* Definition lines — bone landmarks, muscle cuts, veins */}
            {Object.entries(DEFINITION_LINES[view] || {}).map(([group, lines]) => {
              const isActive = selected === group
              const dbKey    = GROUP_TO_DB[group]
              const color    = DB[dbKey]?.color || '#b4bccc'
              return lines.map((line, i) => {
                const isVein   = line.type === 'vein'
                const isBone   = line.type === 'bone'
                const baseOp   = isBone ? 0.26 : isVein ? 0.28 : 0.22
                const activeOp = isBone ? 0.90 : isVein ? 0.92 : 0.86
                const stroke   = isVein ? 'rgba(80,185,255,1)' : isBone ? 'rgba(228,234,255,1)' : color
                const sw       = isBone ? 0.5 : isVein ? 0.45 : 0.42
                const glowF    = isActive
                  ? (isVein
                      ? 'drop-shadow(0 0 2px rgba(80,185,255,0.95)) drop-shadow(0 0 1px rgba(120,210,255,0.7))'
                      : isBone
                      ? 'drop-shadow(0 0 2px rgba(255,255,255,0.8))'
                      : `drop-shadow(0 0 1.8px ${color})`)
                  : undefined
                return (
                  <path
                    key={`def-${group}-${i}`}
                    d={line.d}
                    stroke={stroke}
                    strokeWidth={isActive ? sw * 1.8 : sw}
                    fill="none"
                    strokeLinecap="round"
                    opacity={isActive ? activeOp : baseOp}
                    filter={glowF}
                    style={{ transition: 'opacity 0.3s, stroke-width 0.3s' }}
                  />
                )
              })
            })}

            {labels.map(l => {
              const isActive  = selected === l.group
              const dbKey     = GROUP_TO_DB[l.group]
              const color     = isActive ? (DB[dbKey]?.color || '#d8e0ee') : 'rgba(200,210,230,0.30)'
              const lineX1    = l.anchor === 'start' ? 101 : -1
              const dotX      = l.ex

              return (
                <g key={l.group} style={{ transition: 'opacity 0.2s' }}>
                  {/* Leader line */}
                  <line
                    x1={lineX1} y1={l.y}
                    x2={dotX}   y2={l.y}
                    stroke={color}
                    strokeWidth={isActive ? 0.5 : 0.3}
                    strokeDasharray={isActive ? 'none' : '2 2'}
                    style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                  />
                  {/* Endpoint dot on muscle */}
                  <circle cx={dotX} cy={l.y} r={isActive ? 1.4 : 0.8}
                    fill={color}
                    style={{ transition: 'fill 0.2s, r 0.2s' }}
                  />
                  {/* Label text — common name */}
                  <text
                    x={l.x} y={l.y}
                    textAnchor={l.anchor}
                    fontSize="4.2"
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
                  {/* Scientific name sub-label */}
                  <text
                    x={l.x} y={l.y + 4.2}
                    textAnchor={l.anchor}
                    fontSize="3.0"
                    fontFamily={FF}
                    fontWeight="400"
                    fontStyle="italic"
                    fill={isActive ? `${color}cc` : 'rgba(200,210,230,0.18)'}
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
          background: 'rgba(212,212,232,0.04)',
          border: '1px dashed rgba(212,212,232,0.14)',
          borderRadius: 12, padding: '18px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
        }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="rgba(212,212,232,0.45)" strokeWidth="1.4" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3.5"/>
            <line x1="12" y1="2" x2="12" y2="5.5"/>
            <line x1="12" y1="18.5" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="5.5" y2="12"/>
            <line x1="18.5" y1="12" x2="22" y2="12"/>
          </svg>
          <p style={{ color: 'rgba(220,225,245,0.78)', fontSize: 13, fontFamily: FF, fontStyle: 'italic', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            Tap a muscle on the model<br/>to see activation details
          </p>
        </div>
      ) : isHead ? (
        /* ── Mind & Recovery panel ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'mmFadeUp 0.22s ease both' }}>
          {/* Header */}
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
              {/* Brain icon */}
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

          {/* Active breathing guide */}
          {breathingEx ? (
            <div style={{
              background: 'var(--bg-card)', border: `1px solid ${MIND_COLOR}30`,
              borderRadius: 14, padding: '14px 16px',
              animation: 'mmFadeUp 0.18s ease both',
            }}>
              <BreathingGuide exercise={breathingEx} onStop={() => setBreathingEx(null)} />
            </div>
          ) : (
            /* Breathing exercise cards */
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

          {/* Muscle activation card */}
          {dbData && (
            <div style={{
              background: 'var(--bg-card)',
              border: `1px solid ${dbData.color}35`,
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Header row */}
              <div style={{
                background: `linear-gradient(90deg, ${dbData.color}18 0%, transparent 100%)`,
                borderBottom: `1px solid ${dbData.color}22`,
                padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: 9,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: dbData.color, boxShadow: `0 0 10px ${dbData.color}` }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: dbData.color, fontSize: 14, fontWeight: 800, fontFamily: FF, margin: 0, lineHeight: 1.2 }}>{selected}</p>
                  <p style={{ color: `${dbData.color}99`, fontSize: 8.5, fontFamily: FF, fontStyle: 'italic', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dbData.scientific}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: i <= dbData.intensity ? dbData.color : 'rgba(212,212,232,0.10)',
                      boxShadow: i <= dbData.intensity ? `0 0 4px ${dbData.color}` : 'none',
                    }}/>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: FF, lineHeight: 1.68, margin: 0 }}>{dbData.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {n > 0 && (
                    <span style={{
                      background: `${dbData.color}18`, border: `1px solid ${dbData.color}44`,
                      color: dbData.color, fontSize: 9, fontFamily: FF, fontWeight: 700,
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
              </div>
            </div>
          )}

          {/* Exercises */}
          {dbData && exercises.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 3, height: 12, background: dbData.color, borderRadius: 2, boxShadow: `0 0 6px ${dbData.color}` }}/>
                <p style={{ color: dbData.color, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: FF, fontWeight: 700, flex: 1, margin: 0 }}>
                  Exercises
                </p>
                <button onClick={handleShuffle} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px', borderRadius: 7,
                  background: `${dbData.color}18`, border: `1px solid ${dbData.color}44`,
                  color: dbData.color, fontSize: 9, fontWeight: 700,
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
                {exercises.map((ex, i) => <ExCard key={`${ex.name}-${i}`} ex={ex} accent={dbData.color} />)}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
