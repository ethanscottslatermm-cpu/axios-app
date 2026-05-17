import { useState, useMemo, useEffect, useRef } from 'react'
import Model from 'react-body-highlighter'
import { DB } from './WorkoutGuide'
import axiosModel from './Images/Axios_2D_Model.png'

const FF = 'Helvetica Neue,Arial,sans-serif'

const MIND_COLOR      = '#a78bfa'
const HIGHLIGHT_COLOR = '#F5A623'
const ARMOR_NAVY = '#1B3A6B'
const ARMOR_GLOW = '#E8F4FF'
const ARMOR_RED  = '#8B1A1A'
const ARMOR_GOLD = '#F5A623'

function muscleArmorColor(m) {
  if (['Head','Biceps','Triceps','Quads','Abs','Glutes','Hamstrings','Lower Back','Forearms'].includes(m)) return ARMOR_GLOW
  if (['Calves','Chest','Core','Traps','Upper Back'].includes(m)) return ARMOR_RED
  if (m === 'Shoulders') return ARMOR_GOLD
  return ARMOR_NAVY
}

const MUSCLES = ['Head','Chest','Shoulders','Traps','Biceps','Triceps','Forearms','Abs','Core','Upper Back','Lower Back','Quads','Hamstrings','Glutes','Calves']

// Kept for rear-view placeholder (react-body-highlighter)
const SLUG_MAP = {
  Head:           ['head'],
  Chest:          ['chest'],
  Shoulders:      ['front-deltoids', 'back-deltoids'],
  Traps:          ['trapezius', 'neck'],
  Biceps:         ['biceps', 'forearm'],
  Triceps:        ['triceps'],
  Forearms:       ['forearm'],
  Abs:            ['abs'],
  Core:           ['obliques'],
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
  forearm:         'Forearms',
  triceps:         'Triceps',
  abs:             'Abs',
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
  Forearms:       'biceps',
  Abs:            'core',
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
  Forearms:       'Brachioradialis',
  Abs:            'Rectus Abdominis',
  Core:           'Obliques',
  'Upper Back':   'Rhomboids',
  'Lower Back':   'Erector Spinae',
  Quads:          'Quadriceps Femoris',
  Hamstrings:     'Biceps Femoris',
  Glutes:         'Gluteus Maximus',
  Calves:         'Gastrocnemius',
}

// SVG hit zones traced against the Axios_2D_Model figure in 0 0 100 200 coordinate space.
// Render order matters: later zones sit on top (win clicks at overlaps).
// Triceps/Forearms rest opacity is 0.85 (darker extremity skin tone compensation).
const FRONT_HIT_ZONES = [
  { id: 'traps',      group: 'Traps',     points: '44,14 56,14 75,21 72,28 60,25 50,21 40,25 28,28 25,21' },
  { id: 'chest',      group: 'Chest',     points: '30,26 70,26 74,40 69,53 50,57 31,53 26,40' },
  { id: 'abs',        group: 'Abs',       points: '43,54 57,54 58,61 58,89 50,94 42,89 42,61' },
  { id: 'l-core',     group: 'Core',      points: '27,54 43,54 42,89 38,97 24,83 24,61' },
  { id: 'r-core',     group: 'Core',      points: '57,54 73,54 76,61 76,83 62,97 58,89' },
  { id: 'l-quad',     group: 'Quads',     points: '30,97 48,97 47,156 29,156 23,129' },
  { id: 'r-quad',     group: 'Quads',     points: '52,97 70,97 77,129 71,156 53,156' },
  { id: 'l-calf',     group: 'Calves',    points: '27,158 44,158 42,197 25,197 21,181' },
  { id: 'r-calf',     group: 'Calves',    points: '56,158 73,158 79,181 75,197 58,197' },
  // Arms rendered after torso so they win at shoulder/trap overlaps
  { id: 'l-tricep',   group: 'Triceps',   points: '13,37 21,37 18,69 10,69' },
  { id: 'r-tricep',   group: 'Triceps',   points: '79,37 87,37 90,69 82,69' },
  { id: 'l-forearm',  group: 'Forearms',  points: '10,69 20,69 18,97 8,97' },
  { id: 'r-forearm',  group: 'Forearms',  points: '80,69 90,69 92,97 82,97' },
  { id: 'l-bicep',    group: 'Biceps',    points: '18,43 31,43 29,71 17,71' },
  { id: 'r-bicep',    group: 'Biceps',    points: '69,43 82,43 83,71 71,71' },
  { id: 'l-shoulder', group: 'Shoulders', points: '20,20 33,21 31,43 18,45 13,31' },
  { id: 'r-shoulder', group: 'Shoulders', points: '67,21 80,20 87,31 82,45 69,43' },
]

// Zones active (tappable) on each view
const FRONT_ACTIVE = new Set(['Head','Traps','Chest','Shoulders','Biceps','Triceps','Forearms','Abs','Core','Quads','Calves'])
const REAR_ACTIVE  = new Set(['Head','Traps','Shoulders','Upper Back','Lower Back','Triceps','Glutes','Hamstrings','Calves'])

const DEFINITION_LINES = {
  anterior: {
    Traps: [
      { d: 'M 44 24 Q 40 30 38 35',           type: 'muscle' },
      { d: 'M 56 24 Q 60 30 62 35',           type: 'muscle' },
    ],
    Chest: [
      { d: 'M 49 34 L 22 31',                 type: 'bone'   },
      { d: 'M 51 34 L 78 31',                 type: 'bone'   },
      { d: 'M 49.5 34 L 49.5 58',             type: 'bone'   },
      { d: 'M 32 54 Q 41 61 49.5 58',         type: 'muscle' },
      { d: 'M 68 54 Q 59 61 50.5 58',         type: 'muscle' },
      { d: 'M 49.5 41 Q 38 47 30 53',         type: 'muscle' },
      { d: 'M 50.5 41 Q 62 47 70 53',         type: 'muscle' },
      { d: 'M 49 38 Q 47.5 48 48.5 57',       type: 'vein'   },
      { d: 'M 51 38 Q 52.5 48 51.5 57',       type: 'vein'   },
    ],
    Shoulders: [
      { d: 'M 22 32 Q 18.5 38 20 45',         type: 'muscle' },
      { d: 'M 78 32 Q 81.5 38 80 45',         type: 'muscle' },
      { d: 'M 20 45 Q 24 51 28 56',           type: 'muscle' },
      { d: 'M 80 45 Q 76 51 72 56',           type: 'muscle' },
      { d: 'M 21 38 Q 19 44 20 52',           type: 'vein'   },
      { d: 'M 79 38 Q 81 44 80 52',           type: 'vein'   },
    ],
    Biceps: [
      { d: 'M 23 52 Q 21 61 19 71',           type: 'muscle' },
      { d: 'M 77 52 Q 79 61 81 71',           type: 'muscle' },
      { d: 'M 21 54 Q 19 65 17 75',           type: 'vein'   },
      { d: 'M 79 54 Q 81 65 83 75',           type: 'vein'   },
      { d: 'M 24 56 Q 22 66 20 74',           type: 'vein'   },
      { d: 'M 76 56 Q 78 66 80 74',           type: 'vein'   },
      { d: 'M 15 78 Q 10 89 7 98',            type: 'vein'   },
      { d: 'M 17 79 Q 13 90 10 99',           type: 'vein'   },
      { d: 'M 19 78 Q 16 89 14 98',           type: 'vein'   },
      { d: 'M 85 78 Q 90 89 93 98',           type: 'vein'   },
      { d: 'M 83 79 Q 87 90 90 99',           type: 'vein'   },
      { d: 'M 81 78 Q 84 89 86 98',           type: 'vein'   },
    ],
    Triceps: [
      { d: 'M 25 57 Q 23 64 22 72',           type: 'muscle' },
      { d: 'M 75 57 Q 77 64 78 72',           type: 'muscle' },
    ],
    Abs: [
      { d: 'M 50 58 L 50 95',                 type: 'muscle' },
      { d: 'M 42 63 Q 50 62 58 63',           type: 'muscle' },
      { d: 'M 42 65 L 58 65',                 type: 'muscle' },
      { d: 'M 41 72 L 59 72',                 type: 'muscle' },
      { d: 'M 41 79 L 59 79',                 type: 'muscle' },
      { d: 'M 40 86 L 60 86',                 type: 'muscle' },
      { d: 'M 44 65 L 44 72',                 type: 'muscle' },
      { d: 'M 56 65 L 56 72',                 type: 'muscle' },
      { d: 'M 43 72 L 43 79',                 type: 'muscle' },
      { d: 'M 57 72 L 57 79',                 type: 'muscle' },
      { d: 'M 49 65 Q 48 72 49 79',           type: 'muscle' },
      { d: 'M 51 65 Q 52 72 51 79',           type: 'muscle' },
    ],
    Core: [
      { d: 'M 38 64 Q 33 77 35 91',           type: 'muscle' },
      { d: 'M 62 64 Q 67 77 65 91',           type: 'muscle' },
    ],
    Quads: [
      { d: 'M 40 101 Q 37 123 36 144',        type: 'muscle' },
      { d: 'M 60 101 Q 63 123 64 144',        type: 'muscle' },
      { d: 'M 29 112 Q 27 129 27 147',        type: 'muscle' },
      { d: 'M 71 112 Q 73 129 73 147',        type: 'muscle' },
      { d: 'M 39 136 Q 37 143 40 151',        type: 'muscle' },
      { d: 'M 61 136 Q 63 143 60 151',        type: 'muscle' },
      { d: 'M 44 102 Q 42 128 42 148',        type: 'vein'   },
      { d: 'M 56 102 Q 58 128 58 148',        type: 'vein'   },
    ],
    Calves: [
      { d: 'M 30 165 Q 29 176 30 187',        type: 'muscle' },
      { d: 'M 70 165 Q 71 176 70 187',        type: 'muscle' },
      { d: 'M 27 168 Q 26 179 28 187',        type: 'muscle' },
      { d: 'M 73 168 Q 74 179 72 187',        type: 'muscle' },
      { d: 'M 33 163 Q 32 176 33 188',        type: 'vein'   },
      { d: 'M 67 163 Q 68 176 67 188',        type: 'vein'   },
    ],
  },
  posterior: {
    Traps: [
      { d: 'M 44 22 Q 37 33 32 42',           type: 'muscle' },
      { d: 'M 56 22 Q 63 33 68 42',           type: 'muscle' },
      { d: 'M 47.5 22 L 47.5 62',             type: 'muscle' },
      { d: 'M 52.5 22 L 52.5 62',             type: 'muscle' },
    ],
    Shoulders: [
      { d: 'M 24 39 Q 20 48 22 57',           type: 'muscle' },
      { d: 'M 76 39 Q 80 48 78 57',           type: 'muscle' },
    ],
    'Upper Back': [
      { d: 'M 50 28 L 50 100',                type: 'bone'   },
      { d: 'M 47 40 L 35 56 L 37 67',         type: 'muscle' },
      { d: 'M 53 40 L 65 56 L 63 67',         type: 'muscle' },
      { d: 'M 47 41 Q 41 55 37 65',           type: 'muscle' },
      { d: 'M 53 41 Q 59 55 63 65',           type: 'muscle' },
      { d: 'M 41 68 Q 35 77 34 86',           type: 'muscle' },
      { d: 'M 59 68 Q 65 77 66 86',           type: 'muscle' },
    ],
    'Lower Back': [
      { d: 'M 46 74 L 44 101',                type: 'muscle' },
      { d: 'M 54 74 L 56 101',                type: 'muscle' },
      { d: 'M 44 80 Q 43 88 44 97',           type: 'vein'   },
      { d: 'M 56 80 Q 57 88 56 97',           type: 'vein'   },
    ],
    Triceps: [
      { d: 'M 22 56 Q 19 67 18 77',           type: 'muscle' },
      { d: 'M 78 56 Q 81 67 82 77',           type: 'muscle' },
      { d: 'M 25 59 Q 22 69 21 79',           type: 'muscle' },
      { d: 'M 75 59 Q 78 69 79 79',           type: 'muscle' },
      { d: 'M 19 60 Q 17 70 16 80',           type: 'vein'   },
      { d: 'M 81 60 Q 83 70 84 80',           type: 'vein'   },
      { d: 'M 16 82 Q 13 90 11 100',          type: 'vein'   },
      { d: 'M 84 82 Q 87 90 89 100',          type: 'vein'   },
    ],
    Glutes: [
      { d: 'M 50 100 L 50 123',               type: 'muscle' },
      { d: 'M 32 113 Q 41 120 49.5 117',      type: 'muscle' },
      { d: 'M 68 113 Q 59 120 50.5 117',      type: 'muscle' },
    ],
    Hamstrings: [
      { d: 'M 33 128 Q 31 144 29 161',        type: 'muscle' },
      { d: 'M 67 128 Q 69 144 71 161',        type: 'muscle' },
      { d: 'M 38 127 Q 37 146 38 163',        type: 'muscle' },
      { d: 'M 62 127 Q 63 146 62 163',        type: 'muscle' },
    ],
    Calves: [
      { d: 'M 30 168 Q 29 180 30 193',        type: 'muscle' },
      { d: 'M 70 168 Q 71 180 70 193',        type: 'muscle' },
      { d: 'M 26 169 Q 25 181 27 193',        type: 'muscle' },
      { d: 'M 74 169 Q 75 181 73 193',        type: 'muscle' },
      { d: 'M 34 166 Q 33 179 34 193',        type: 'vein'   },
      { d: 'M 66 166 Q 67 179 66 193',        type: 'vein'   },
    ],
  },
}

const LABELS = {
  anterior: [
    { group: 'Head',      x: 103, y: 11,  anchor: 'start', ex: 57 },
    { group: 'Shoulders', x: 103, y: 42,  anchor: 'start', ex: 79 },
    { group: 'Chest',     x: 103, y: 51,  anchor: 'start', ex: 70 },
    { group: 'Biceps',    x: -3,  y: 57,  anchor: 'end',   ex: 17 },
    { group: 'Forearms',  x: -3,  y: 82,  anchor: 'end',   ex: 11 },
    { group: 'Abs',       x: 103, y: 72,  anchor: 'start', ex: 57 },
    { group: 'Core',      x: 103, y: 85,  anchor: 'start', ex: 60 },
    { group: 'Quads',     x: -3,  y: 118, anchor: 'end',   ex: 29 },
    { group: 'Calves',    x: 103, y: 175, anchor: 'start', ex: 74 },
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

function zoneGlowFilter(group, isSel) {
  const armorCol = muscleArmorColor(group)
  const whiteEdge = isSel
    ? 'drop-shadow(0 0 1px rgba(255,255,255,1)) drop-shadow(0 0 3px rgba(255,255,255,0.95)) drop-shadow(0 0 6px rgba(255,255,255,0.70))'
    : 'drop-shadow(0 0 1px rgba(255,255,255,1)) drop-shadow(0 0 2.5px rgba(255,255,255,0.80))'
  let colorGlow
  if (armorCol === ARMOR_GLOW) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 18px rgba(255,255,255,1.0)) drop-shadow(0 0 8px rgba(232,244,255,0.90))'
      : 'drop-shadow(0 0 10px rgba(232,244,255,0.60))'
  } else if (armorCol === ARMOR_RED) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 18px rgba(180,40,40,1.0)) drop-shadow(0 0 8px rgba(139,26,26,0.90))'
      : 'drop-shadow(0 0 10px rgba(139,26,26,0.70)) drop-shadow(0 0 4px rgba(180,40,40,0.45))'
  } else if (armorCol === ARMOR_GOLD) {
    colorGlow = isSel
      ? 'drop-shadow(0 0 18px rgba(245,166,35,1.0)) drop-shadow(0 0 8px rgba(255,200,80,0.90))'
      : 'drop-shadow(0 0 10px rgba(245,166,35,0.60)) drop-shadow(0 0 4px rgba(255,200,80,0.40))'
  } else {
    colorGlow = isSel
      ? 'drop-shadow(0 0 18px rgba(56,100,180,1.0)) drop-shadow(0 0 8px rgba(27,58,107,0.90))'
      : 'drop-shadow(0 0 8px rgba(27,58,107,0.60)) drop-shadow(0 0 3px rgba(56,100,180,0.35))'
  }
  return `${whiteEdge} ${colorGlow}`
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
    if (elapsed < acc + ph.s) { phase = ph; remaining = Math.ceil(acc + ph.s - elapsed); break }
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
        color: MIND_COLOR, fontSize: 10, fontFamily: FF, fontWeight: 700, letterSpacing: '0.08em',
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
    } catch(e) { console.error(e) } finally { setSaving(false) }
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
            <button onClick={() => setLogging(l => !l)} style={{
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
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 9px', borderRadius: 7,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
              color: '#ef4444', fontSize: 9, fontWeight: 700, fontFamily: FF, letterSpacing: '0.08em', textDecoration: 'none',
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
          <button onClick={handleSave} disabled={saving || saved} style={{
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

export default function MuscleMapView({ workouts = [], onLogWorkout, onSaveExercise, defaultSelected = null }) {
  const [selected,     setSelected]    = useState(defaultSelected)
  const [lastSelected, setLastSelected] = useState(null)
  const [view,         setView]        = useState('anterior')
  const [exercises,    setExercises]   = useState([])
  const [spinning,     setSpinning]    = useState(false)
  const [breathingEx,  setBreathingEx] = useState(null)
  const [ripples,      setRipples]     = useState([])
  const svgRef      = useRef(null)
  const touchStartX = useRef(null)
  const didSwipe    = useRef(false)

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

  function muscleAgeDays(muscle) {
    const lw = lastWorked[muscle]
    if (!lw) return null
    return Math.round((new Date(todayStr + 'T12:00:00') - new Date(lw + 'T12:00:00')) / 86400000)
  }

  useEffect(() => {
    if (selected && selected !== 'Head') {
      const dbKey = GROUP_TO_DB[selected]
      if (dbKey && DB[dbKey]) setExercises(pickFour(DB[dbKey].exercises))
    } else {
      setExercises([])
    }
    setBreathingEx(null)
  }, [selected])

  // Front view zone click
  function handleZoneClick(group, e) {
    e.stopPropagation()
    if (didSwipe.current) { didSwipe.current = false; return }
    const activeSet = view === 'anterior' ? FRONT_ACTIVE : REAR_ACTIVE
    if (!activeSet.has(group)) return
    setLastSelected(group)
    setSelected(s => s === group ? null : group)
  }

  // Rear view / react-body-highlighter click
  function handleClick({ muscle }) {
    if (didSwipe.current) { didSwipe.current = false; return }
    const group = GROUP_FROM_SLUG[muscle]
    if (group && REAR_ACTIVE.has(group)) {
      setLastSelected(group)
      setSelected(s => s === group ? null : group)
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

  function spawnRipple(e) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width * 100
    const y = (e.clientY - rect.top)  / rect.height * 200
    const id = Date.now()
    setRipples(r => [...r, { x, y, id }])
    setTimeout(() => setRipples(r => r.filter(ri => ri.id !== id)), 700)
  }

  const isHead  = selected === 'Head'
  const n       = selected && !isHead ? (counts[selected] || 0) : 0
  const rec     = selected && !isHead ? getRecovery(n) : null
  const dbData  = selected && !isHead ? DB[GROUP_TO_DB[selected]] : null
  const labels  = LABELS[view] || []

  // Shared touch handlers for swipe-to-flip
  const touchHandlers = {
    onTouchStart: e => { touchStartX.current = e.touches[0].clientX },
    onTouchEnd:   e => {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(dx) > 40) { setView(dx < 0 ? 'posterior' : 'anterior'); didSwipe.current = true }
      touchStartX.current = null
    },
    onPointerDown: spawnRipple,
  }

  // Shared SVG overlay (labels, definition lines, ripples, scan sweep) — used by both views
  function renderSvgOverlay() {
    return (
      <svg
        ref={svgRef}
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
            <feFlood floodColor="#38bdf8" floodOpacity="1" result="white"/>
            <feComposite in="white" in2="blur" operator="in" result="wb"/>
            <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="mm-scan-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="25%"  stopColor="rgba(245,166,35,0.45)"/>
            <stop offset="50%"  stopColor="rgba(255,210,120,0.28)"/>
            <stop offset="75%"  stopColor="rgba(245,166,35,0.45)"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>

        <rect x="0" y="-1" width="100" height="1.5"
          fill="url(#mm-scan-grad)"
          style={{ animation: 'mmScan 7s ease-in-out infinite', filter: 'drop-shadow(0 0 1.5px rgba(56,189,248,0.65))' }}
        />

        {/* Definition lines */}
        {Object.entries(DEFINITION_LINES[view] || {}).map(([group, lines]) => {
          const isActive = selected === group
          return lines.map((line, i) => {
            const isVein = line.type === 'vein'
            const isBone = line.type === 'bone'
            const baseOp   = isBone ? 0.55 : isVein ? 1 : 0.46
            const activeOp = isBone ? 0.96 : isVein ? 1 : 0.92
            const stroke   = isVein ? 'rgba(220,245,255,1)' : isBone ? 'rgba(255,210,80,1)' : 'rgba(147,223,253,1)'
            const sw       = isBone ? 0.65 : isVein ? 0.58 : 0.52
            const baseGlow = isVein
              ? 'drop-shadow(0 0 2px rgba(220,245,255,0.85)) drop-shadow(0 0 1px rgba(255,255,255,0.6))'
              : isBone ? 'drop-shadow(0 0 1.2px rgba(255,210,80,0.5))' : undefined
            const glowF = isActive
              ? (isVein
                  ? 'drop-shadow(0 0 4px rgba(255,255,255,1)) drop-shadow(0 0 2px rgba(186,230,253,0.9))'
                  : isBone
                  ? 'drop-shadow(0 0 3px rgba(255,210,80,0.9))'
                  : 'drop-shadow(0 0 2.5px rgba(56,189,248,1))')
              : baseGlow
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
                pathLength={isVein ? '1' : undefined}
                strokeDasharray={isVein && !isActive ? '0.12 0.08' : undefined}
                style={{
                  transition: 'opacity 0.3s, stroke-width 0.3s',
                  animation: !isActive && isVein ? `mmVeinDash 2.8s linear ${i * 0.22}s infinite` : undefined,
                }}
              />
            )
          })
        })}

        {/* Ripples */}
        {ripples.map(rp => (
          <circle key={rp.id} cx={rp.x} cy={rp.y} r="11"
            fill="rgba(56,189,248,0.10)" stroke="rgba(147,223,253,0.72)" strokeWidth="0.55"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'mmRipple 0.65s ease-out forwards', pointerEvents: 'none' }}
          />
        ))}

        {/* Labels */}
        {labels.map(l => {
          const isActive  = selected === l.group
          const color     = isActive ? '#ffffff' : 'rgba(200,210,230,0.30)'
          const lineX1    = l.anchor === 'start' ? 101 : -1
          return (
            <g key={l.group} style={{ transition: 'opacity 0.2s' }}>
              <line x1={lineX1} y1={l.y} x2={l.ex} y2={l.y}
                stroke={color} strokeWidth={isActive ? 0.5 : 0.3}
                strokeDasharray={isActive ? 'none' : '2 2'}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
              <circle cx={l.ex} cy={l.y} r={isActive ? 1.4 : 0.8} fill={color} style={{ transition: 'fill 0.2s' }} />
              <text x={l.x} y={l.y} textAnchor={l.anchor} fontSize="4.2" fontFamily={FF}
                fontWeight={isActive ? '700' : '500'} fill={color}
                filter={isActive ? 'url(#mm-label-glow)' : undefined}
                letterSpacing="0.04em"
                style={{ transition: 'fill 0.2s', animation: isActive ? 'mmGlow 2.4s ease-in-out infinite' : undefined }}>
                {l.group}
              </text>
              <text x={l.x} y={l.y + 4.2} textAnchor={l.anchor} fontSize="3.0" fontFamily={FF}
                fontWeight="400" fontStyle="italic"
                fill={isActive ? `${color}cc` : 'rgba(200,210,230,0.18)'}
                letterSpacing="0.02em" style={{ transition: 'fill 0.2s' }}>
                {SCI_SHORT[l.group] || ''}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        @keyframes mmFadeUp         { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes mmGlow           { 0%,100% { opacity:0.85 } 50% { opacity:1 } }
        @keyframes mmPulse          { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        @keyframes mmCrosshairPulse { 0%,100% { opacity:0.45; transform:scale(1) } 50% { opacity:0.9; transform:scale(1.14) } }
        @-webkit-keyframes mmFatiguePulse { 0%,100% { opacity:0.58 } 50% { opacity:0.78 } }
        @keyframes mmFatiguePulse         { 0%,100% { opacity:0.58 } 50% { opacity:0.78 } }
        @-webkit-keyframes mmPulse        { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        @keyframes mmVeinDash       { from { stroke-dashoffset:0.6 } to { stroke-dashoffset:-0.6 } }
        @keyframes mmScan           { 0%{transform:translateY(-2px);opacity:0} 4%{opacity:0.85} 30%{transform:translateY(202px);opacity:0.5} 33%{transform:translateY(202px);opacity:0} 100%{transform:translateY(202px);opacity:0} }
        @keyframes mmRipple         { from{transform:scale(0);opacity:0.85} to{transform:scale(1);opacity:0} }
      `}</style>

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

      {/* Body model */}
      <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>

        {/* ── FRONT VIEW — custom PNG + SVG hit zones ── */}
        {view === 'anterior' ? (
          <div
            style={{ position: 'relative', width: '100%', maxWidth: 240, aspectRatio: '1/2', overflow: 'visible', background: '#080808' }}
            {...touchHandlers}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0, borderRadius: 8, pointerEvents: 'none',
              background: selected && selected !== 'Head'
                ? 'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(245,166,35,0.12) 0%, transparent 65%)'
                : 'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(27,58,107,0.08) 0%, transparent 65%)',
              transition: 'background 0.6s ease',
            }}/>

            {/* Base anatomical figure */}
            <img
              src={axiosModel}
              alt=""
              draggable={false}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block', zIndex: 1, pointerEvents: 'none', userSelect: 'none' }}
            />

            {/* SVG: colored zone fills + hit areas + overlays */}
            <svg
              viewBox="0 0 100 200"
              preserveAspectRatio="xMidYMid meet"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: 2 }}
            >
              {/* Scan sweep */}
              <defs>
                <linearGradient id="mm-scan-grad-f" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="transparent"/>
                  <stop offset="25%"  stopColor="rgba(245,166,35,0.45)"/>
                  <stop offset="50%"  stopColor="rgba(255,210,120,0.28)"/>
                  <stop offset="75%"  stopColor="rgba(245,166,35,0.45)"/>
                  <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
                <filter id="mm-label-glow-f" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/>
                  <feFlood floodColor="#38bdf8" floodOpacity="1" result="white"/>
                  <feComposite in="white" in2="blur" operator="in" result="wb"/>
                  <feMerge><feMergeNode in="wb"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect x="0" y="-1" width="100" height="1.5" fill="url(#mm-scan-grad-f)"
                style={{ animation: 'mmScan 7s ease-in-out infinite', filter: 'drop-shadow(0 0 1.5px rgba(56,189,248,0.65))' }}
              />

              {/* Colored fill zones (behind hit zones so pointer events read from the transparent hit polygon on top) */}
              {FRONT_HIT_ZONES.map(zone => {
                const isSel = selected === zone.group
                const days  = muscleAgeDays(zone.group)
                const isExtremity = zone.group === 'Triceps' || zone.group === 'Forearms'
                const baseOp = isExtremity ? 0.85 : 0.72
                const op    = isSel ? 1.0 : baseOp
                const color = muscleArmorColor(zone.group)
                const anim  = isSel
                  ? 'mmPulse 2.4s ease-in-out infinite'
                  : days === 0 ? 'mmFatiguePulse 2s ease-in-out infinite' : undefined
                return (
                  <polygon
                    key={`fill-${zone.id}`}
                    points={zone.points}
                    fill={color}
                    opacity={op}
                    pointerEvents="none"
                    style={{
                      transition: 'opacity 0.35s ease, filter 0.6s ease',
                      filter: zoneGlowFilter(zone.group, isSel),
                      animation: anim,
                      WebkitAnimation: anim,
                    }}
                  />
                )
              })}

              {/* Head — white fill overlay (mind zone visual language) */}
              <polygon
                points="42,2 58,2 61,7 60,13 55,16 50,17 45,16 40,13 39,7"
                fill={selected === 'Head' ? MIND_COLOR : '#E8F4FF'}
                stroke={selected === 'Head' ? MIND_COLOR : 'rgba(232,244,255,1)'}
                strokeWidth={selected === 'Head' ? 0.9 : 0.42}
                strokeLinejoin="round"
                opacity={selected === 'Head' ? 0.55 : 0.72}
                pointerEvents="none"
                style={{
                  filter: selected === 'Head'
                    ? `drop-shadow(0 0 4px ${MIND_COLOR}) drop-shadow(0 0 8px ${MIND_COLOR}88)`
                    : 'drop-shadow(0 0 4px rgba(255,255,255,0.95)) drop-shadow(0 0 8px rgba(232,244,255,0.7))',
                  transition: 'all 0.3s',
                  animation: selected === 'Head' ? 'mmPulse 2.4s ease-in-out infinite' : undefined,
                }}
              />

              {/* Facial features — anterior */}
              <g opacity={selected === 'Head' ? 1.0 : 0.72} pointerEvents="none"
                style={{
                  filter: selected === 'Head'
                    ? 'drop-shadow(0 0 2px rgba(255,255,255,0.9))'
                    : 'drop-shadow(0 0 0.8px rgba(255,255,255,0.5))',
                  transition: 'opacity 0.3s',
                }}>
                <ellipse cx="46.2" cy="9.2" rx="1.9" ry="1.3" fill="none" stroke="rgba(30,30,50,1)" strokeWidth="0.75"/>
                <ellipse cx="53.8" cy="9.2" rx="1.9" ry="1.3" fill="none" stroke="rgba(30,30,50,1)" strokeWidth="0.75"/>
                <path d="M 50 11 L 48.3 14.2 M 50 11 L 51.7 14.2 M 48 14.3 Q 50 15.2 52 14.3" fill="none" stroke="rgba(30,30,50,1)" strokeWidth="0.6" strokeLinecap="round"/>
                <path d="M 46.5 17.8 Q 50 20 53.5 17.8" fill="none" stroke="rgba(30,30,50,1)" strokeWidth="0.75" strokeLinecap="round"/>
                <path d="M 41.8 11.5 Q 42.5 20.5 50 24.2" fill="none" stroke="rgba(30,30,50,0.7)" strokeWidth="0.55" strokeLinecap="round"/>
                <path d="M 58.2 11.5 Q 57.5 20.5 50 24.2" fill="none" stroke="rgba(30,30,50,0.7)" strokeWidth="0.55" strokeLinecap="round"/>
                <path d="M 49.5 21.5 Q 50 22.5 50.5 21.5" fill="none" stroke="rgba(30,30,50,0.7)" strokeWidth="0.55" strokeLinecap="round"/>
                <path d="M 43.5 12.2 Q 38.8 13.8 39.8 17.2" fill="none" stroke="rgba(30,30,50,0.65)" strokeWidth="0.65" strokeLinecap="round"/>
                <path d="M 56.5 12.2 Q 61.2 13.8 60.2 17.2" fill="none" stroke="rgba(30,30,50,0.65)" strokeWidth="0.65" strokeLinecap="round"/>
              </g>

              {/* Definition lines */}
              {Object.entries(DEFINITION_LINES.anterior).map(([group, lines]) => {
                const isActive = selected === group
                return lines.map((line, i) => {
                  const isVein = line.type === 'vein'
                  const isBone = line.type === 'bone'
                  const baseOp   = isBone ? 0.55 : isVein ? 1 : 0.46
                  const activeOp = isBone ? 0.96 : isVein ? 1 : 0.92
                  const stroke   = isVein ? 'rgba(220,245,255,1)' : isBone ? 'rgba(255,210,80,1)' : 'rgba(147,223,253,1)'
                  const sw       = isBone ? 0.65 : isVein ? 0.58 : 0.52
                  const baseGlow = isVein
                    ? 'drop-shadow(0 0 2px rgba(220,245,255,0.85)) drop-shadow(0 0 1px rgba(255,255,255,0.6))'
                    : isBone ? 'drop-shadow(0 0 1.2px rgba(255,210,80,0.5))' : undefined
                  const glowF = isActive
                    ? (isVein
                        ? 'drop-shadow(0 0 4px rgba(255,255,255,1)) drop-shadow(0 0 2px rgba(186,230,253,0.9))'
                        : isBone ? 'drop-shadow(0 0 3px rgba(255,210,80,0.9))' : 'drop-shadow(0 0 2.5px rgba(56,189,248,1))')
                    : baseGlow
                  return (
                    <path key={`def-${group}-${i}`} d={line.d} stroke={stroke}
                      strokeWidth={isActive ? sw * 1.8 : sw} fill="none" strokeLinecap="round"
                      opacity={isActive ? activeOp : baseOp} filter={glowF}
                      pathLength={isVein ? '1' : undefined}
                      strokeDasharray={isVein && !isActive ? '0.12 0.08' : undefined}
                      style={{
                        transition: 'opacity 0.3s, stroke-width 0.3s',
                        animation: !isActive && isVein ? `mmVeinDash 2.8s linear ${i * 0.22}s infinite` : undefined,
                        pointerEvents: 'none',
                      }}
                    />
                  )
                })
              })}

              {/* Transparent hit polygons — capture clicks, sit above fill polygons */}
              {FRONT_HIT_ZONES.map(zone => (
                <polygon
                  key={`hit-${zone.id}`}
                  points={zone.points}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer' }}
                  onClick={e => handleZoneClick(zone.group, e)}
                />
              ))}

              {/* Head hit zone */}
              <polygon
                points="42,2 58,2 61,7 60,13 55,16 50,17 45,16 40,13 39,7"
                fill="transparent"
                stroke="none"
                style={{ cursor: 'pointer' }}
                onClick={e => handleZoneClick('Head', e)}
              />

              {/* Ripples */}
              {ripples.map(rp => (
                <circle key={rp.id} cx={rp.x} cy={rp.y} r="11"
                  fill="rgba(56,189,248,0.10)" stroke="rgba(147,223,253,0.72)" strokeWidth="0.55"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'mmRipple 0.65s ease-out forwards', pointerEvents: 'none' }}
                />
              ))}

              {/* Labels */}
              {LABELS.anterior.map(l => {
                const isActive = selected === l.group
                const color    = isActive ? '#ffffff' : 'rgba(200,210,230,0.30)'
                const lineX1   = l.anchor === 'start' ? 101 : -1
                return (
                  <g key={l.group} style={{ transition: 'opacity 0.2s' }} pointerEvents="none">
                    <line x1={lineX1} y1={l.y} x2={l.ex} y2={l.y}
                      stroke={color} strokeWidth={isActive ? 0.5 : 0.3}
                      strokeDasharray={isActive ? 'none' : '2 2'}
                      style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                    />
                    <circle cx={l.ex} cy={l.y} r={isActive ? 1.4 : 0.8} fill={color} style={{ transition: 'fill 0.2s' }} />
                    <text x={l.x} y={l.y} textAnchor={l.anchor} fontSize="4.2" fontFamily={FF}
                      fontWeight={isActive ? '700' : '500'} fill={color}
                      filter={isActive ? 'url(#mm-label-glow-f)' : undefined}
                      letterSpacing="0.04em"
                      style={{ transition: 'fill 0.2s', animation: isActive ? 'mmGlow 2.4s ease-in-out infinite' : undefined }}>
                      {l.group}
                    </text>
                    <text x={l.x} y={l.y + 4.2} textAnchor={l.anchor} fontSize="3.0" fontFamily={FF}
                      fontWeight="400" fontStyle="italic"
                      fill={isActive ? `${color}cc` : 'rgba(200,210,230,0.18)'}
                      letterSpacing="0.02em" style={{ transition: 'fill 0.2s' }}>
                      {SCI_SHORT[l.group] || ''}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          /* ── REAR VIEW — react-body-highlighter placeholder ── */
          <div
            style={{ position: 'relative', width: '100%', maxWidth: 240, overflow: 'visible' }}
            {...touchHandlers}
          >
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0, borderRadius: 8, pointerEvents: 'none',
              background: selected && selected !== 'Head'
                ? 'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(245,166,35,0.12) 0%, transparent 65%)'
                : 'radial-gradient(ellipse 72% 62% at 50% 45%, rgba(27,58,107,0.08) 0%, transparent 65%)',
              transition: 'background 0.6s ease',
            }}/>

            {/* Base silhouette */}
            <Model data={[]} type="posterior" bodyColor="#3A3A3A" onClick={handleClick}
              style={{ width: '100%', display: 'block', position: 'relative', zIndex: 1,
                filter: 'drop-shadow(0 0 10px rgba(27,58,107,0.70)) drop-shadow(0 0 3px rgba(232,244,255,0.45))' }}
              svgStyle={{ borderRadius: 8 }}
            />

            {/* Per-muscle colored overlays */}
            {MUSCLES.filter(m => m !== 'Head' && SLUG_MAP[m] && REAR_ACTIVE.has(m)).map(m => {
              const isSel = selected === m
              const armorCol = muscleArmorColor(m)
              const days  = muscleAgeDays(m)
              const isExtremity = m === 'Triceps' || m === 'Forearms'
              const baseOp = isExtremity ? 0.85 : 0.72
              const op    = isSel ? 1.0 : baseOp
              const whiteEdge = isSel
                ? 'drop-shadow(0 0 1px rgba(255,255,255,1)) drop-shadow(0 0 3px rgba(255,255,255,0.95)) drop-shadow(0 0 6px rgba(255,255,255,0.70))'
                : 'drop-shadow(0 0 1px rgba(255,255,255,1)) drop-shadow(0 0 2.5px rgba(255,255,255,0.80))'
              const colorGlow = (() => {
                if (armorCol === ARMOR_GLOW)
                  return isSel
                    ? 'drop-shadow(0 0 18px rgba(255,255,255,1.0)) drop-shadow(0 0 8px rgba(232,244,255,0.90))'
                    : 'drop-shadow(0 0 10px rgba(232,244,255,0.60))'
                if (armorCol === ARMOR_RED)
                  return isSel
                    ? 'drop-shadow(0 0 18px rgba(180,40,40,1.0)) drop-shadow(0 0 8px rgba(139,26,26,0.90))'
                    : 'drop-shadow(0 0 10px rgba(139,26,26,0.70)) drop-shadow(0 0 4px rgba(180,40,40,0.45))'
                if (armorCol === ARMOR_GOLD)
                  return isSel
                    ? 'drop-shadow(0 0 18px rgba(245,166,35,1.0)) drop-shadow(0 0 8px rgba(255,200,80,0.90))'
                    : 'drop-shadow(0 0 10px rgba(245,166,35,0.60)) drop-shadow(0 0 4px rgba(255,200,80,0.40))'
                return isSel
                  ? 'drop-shadow(0 0 18px rgba(56,100,180,1.0)) drop-shadow(0 0 8px rgba(27,58,107,0.90))'
                  : 'drop-shadow(0 0 8px rgba(27,58,107,0.60)) drop-shadow(0 0 3px rgba(56,100,180,0.35))'
              })()
              const anim = isSel
                ? 'mmPulse 2.4s ease-in-out infinite'
                : days === 0 ? 'mmFatiguePulse 2s ease-in-out infinite' : undefined
              return (
                <div key={m} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                  filter: `${whiteEdge} ${colorGlow}`, transition: 'filter 0.6s ease' }}>
                  <div style={{ width: '100%', height: '100%', opacity: op, transition: 'opacity 0.35s ease', animation: anim, WebkitAnimation: anim, transform: 'translateZ(0)' }}>
                    <Model data={[{ name: m, muscles: SLUG_MAP[m], frequency: 1 }]} type="posterior"
                      bodyColor="rgba(0,0,0,0)" highlightedColors={[armorCol, armorCol, armorCol]}
                      style={{ width: '100%', display: 'block' }} svgStyle={{ borderRadius: 8 }}
                    />
                  </div>
                </div>
              )
            })}

            {/* Rear SVG overlay (labels + definition lines + ripples) */}
            {renderSvgOverlay()}
          </div>
        )}
      </div>

      {/* ── Detail panel (unchanged) ── */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderRadius: 99, background: `${HIGHLIGHT_COLOR}12`, border: `1px solid ${HIGHLIGHT_COLOR}38` }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: HIGHLIGHT_COLOR, boxShadow: `0 0 5px ${HIGHLIGHT_COLOR}` }}/>
              <p style={{ color: `${HIGHLIGHT_COLOR}cc`, fontSize: 9.5, fontFamily: FF, fontWeight: 600, margin: 0, letterSpacing: '0.04em' }}>
                Last: {lastSelected}
              </p>
            </div>
          )}
        </div>
      ) : isHead ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'mmFadeUp 0.22s ease both' }}>
          <div style={{ background: 'var(--bg-card)', border: `1px solid ${MIND_COLOR}35`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(90deg, ${MIND_COLOR}18 0%, transparent 100%)`, borderBottom: `1px solid ${MIND_COLOR}22`, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
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
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${MIND_COLOR}30`, borderRadius: 14, padding: '14px 16px', animation: 'mmFadeUp 0.18s ease both' }}>
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
                  borderRadius: 11, padding: '11px 13px', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: MIND_COLOR, boxShadow: `0 0 6px ${MIND_COLOR}`, flexShrink: 0 }}/>
                    <p style={{ color: MIND_COLOR, fontSize: 12, fontWeight: 700, fontFamily: FF, margin: 0, flex: 1 }}>{ex.name}</p>
                    <span style={{ background: `${MIND_COLOR}18`, border: `1px solid ${MIND_COLOR}38`, color: `${MIND_COLOR}cc`, fontSize: 8, fontFamily: FF, fontWeight: 600, padding: '2px 7px', borderRadius: 99, letterSpacing: '0.04em' }}>{ex.tag}</span>
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
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.14) 0%, rgba(255,255,255,0.03) 100%)', borderBottom: '1px solid rgba(16,185,129,0.15)', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.85)' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 800, fontFamily: FF, margin: 0, lineHeight: 1.2, textShadow: '0 0 10px rgba(16,185,129,0.9), 0 0 22px rgba(255,255,255,0.35)' }}>{selected}</p>
                  <p style={{ color: 'rgba(180,240,210,0.65)', fontSize: 8.5, fontFamily: FF, fontStyle: 'italic', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dbData.scientific}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i <= dbData.intensity ? '#10b981' : 'rgba(212,212,232,0.10)', boxShadow: i <= dbData.intensity ? '0 0 4px rgba(16,185,129,0.85)' : 'none' }}/>
                  ))}
                </div>
              </div>
              <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, fontFamily: FF, lineHeight: 1.68, margin: 0, textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>{dbData.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {n > 0 && (
                    <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.42)', color: '#10b981', fontSize: 9, fontFamily: FF, fontWeight: 700, padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em' }}>{n}× this week</span>
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
                    borderRadius: 10, cursor: 'pointer', color: '#10b981', fontSize: 11, fontWeight: 700,
                    fontFamily: FF, letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 2,
                  }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
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
                  display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 7,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: 700, fontFamily: FF, cursor: 'pointer', letterSpacing: '0.08em',
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
