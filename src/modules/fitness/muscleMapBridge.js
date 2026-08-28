/**
 * Translates between the muscle vocabulary stored in workout data and the
 * group keys used by the new warrior-figure SVGs.
 *
 * Logged exercises carry `muscle_group` values from the original 14-name
 * list ('Chest', 'Quads', 'Abs', ...). The new model uses finer-grained
 * anatomical keys and splits some groups across the front/rear views, so a
 * single stored name can light up several regions.
 */

// stored muscle_group  ->  new pair keys, per view
export const LEGACY_TO_PAIRS = {
  Chest:      { front: ['chest'],                     rear: [] },
  Shoulders:  { front: ['deltoids'],                  rear: ['deltoids_rear'] },
  Back:       { front: ['traps'],                     rear: ['traps_lats', 'lower_back', 'spine'] },
  Biceps:     { front: ['biceps'],                    rear: [] },
  Triceps:    { front: [],                            rear: ['triceps_rear'] },
  Forearms:   { front: ['forearms'],                  rear: ['forearms_rear'] },
  Abs:        { front: ['upper_abs', 'lower_abs'],    rear: [] },
  Obliques:   { front: ['obliques'],                  rear: [] },
  Quads:      { front: ['outer_quad', 'inner_quad'],  rear: [] },
  Hamstrings: { front: [],                            rear: ['hamstrings'] },
  Glutes:     { front: ['hips'],                      rear: ['glute_med', 'hips'] },
  Calves:     { front: ['calves'],                    rear: ['calves_rear'] },
  Shins:      { front: ['tibialis'],                  rear: ['shins_rear'] },
  Head:       { front: [],                            rear: [] }, // structural, not tappable
}

// new pair key -> the muscle_group name to log against.
// `knees` has no training equivalent, so it stays unlogged.
export const PAIR_TO_LEGACY = {
  chest: 'Chest',
  deltoids: 'Shoulders',   deltoids_rear: 'Shoulders',
  traps: 'Back',           traps_lats: 'Back',
  lower_back: 'Back',      spine: 'Back',
  biceps: 'Biceps',
  triceps_rear: 'Triceps',
  forearms: 'Forearms',    forearms_rear: 'Forearms',
  upper_abs: 'Abs',        lower_abs: 'Abs',
  obliques: 'Obliques',
  outer_quad: 'Quads',     inner_quad: 'Quads',
  hamstrings: 'Hamstrings',
  glute_med: 'Glutes',     hips: 'Glutes',
  calves: 'Calves',        calves_rear: 'Calves',
  tibialis: 'Shins',       shins_rear: 'Shins',
  knees: null,
}

/**
 * New group key -> key in the WorkoutGuide exercise DB.
 *
 * The DB is coarser than the map in places: upper_abs and lower_abs both draw
 * from `core`, both quad heads from `quads`, and hips from `glutes`. head and
 * knees have no training entry at all and resolve to null.
 */
export const PAIR_TO_DB = {
  // front
  head: null,
  traps: 'traps',        deltoids: 'shoulders',  chest: 'chest',
  biceps: 'biceps',      forearms: 'forearms',
  upper_abs: 'core',     lower_abs: 'core',      obliques: 'obliques',
  hips: 'glutes',        outer_quad: 'quads',    inner_quad: 'quads',
  knees: null,
  tibialis: 'shins',     calves: 'calves',
  // rear
  traps_lats: 'lats',    deltoids_rear: 'shoulders', triceps_rear: 'triceps',
  forearms_rear: 'forearms',
  spine: 'lower_back',   lower_back: 'lower_back',
  glute_med: 'glutes',   hamstrings: 'hamstrings',
  calves_rear: 'calves', shins_rear: 'shins',
}

/**
 * Four exercises drawn at random from a group's pool.
 *
 * Same behaviour as pickFour in MuscleMapView.jsx: Fisher-Yates, then take the
 * first four. Each group has eight (six for shins), so a shuffle meaningfully
 * changes the set rather than reordering the same list.
 */
export function pickFour(pool = []) {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 4)
}

/** The app's convention: a curated search query, never a hardcoded video id. */
export const ytUrlFor = query =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`

/** Which view should be shown to reveal a given stored muscle name. */
export function viewForLegacy(name) {
  const m = LEGACY_TO_PAIRS[name]
  if (!m) return null
  if (m.front.length) return 'front'
  if (m.rear.length)  return 'rear'
  return null
}

/** Pair keys for a stored muscle name within one view. */
export function pairsForLegacy(name, view) {
  return LEGACY_TO_PAIRS[name]?.[view] ?? []
}

/**
 * Pair keys trained within `days` (default 7), for the given view.
 * 'Full Body' entries light every mapped region.
 */
export function recentlyTrainedPairs(workouts = [], view = 'front', days = 7) {
  const today = new Date().toISOString().split('T')[0]
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fromStr = from.toISOString().split('T')[0]

  const out = new Set()
  workouts.forEach(w => {
    const d = w.workout_date || w.created_at?.split('T')[0]
    if (!d || d < fromStr || d > today) return
    ;(w.exercises || []).forEach(ex => {
      const mg = ex.muscle_group
      if (!mg) return
      if (mg === 'Full Body') {
        Object.keys(LEGACY_TO_PAIRS).forEach(k =>
          pairsForLegacy(k, view).forEach(p => out.add(p)))
      } else {
        pairsForLegacy(mg, view).forEach(p => out.add(p))
      }
    })
  })
  return [...out]
}

/** Days since a stored muscle name was last trained, or null. */
export function daysSinceTrained(workouts = [], name) {
  let latest = null
  workouts.forEach(w => {
    const d = w.workout_date || w.created_at?.split('T')[0]
    if (!d) return
    ;(w.exercises || []).forEach(ex => {
      if (ex.muscle_group !== name) return
      if (!latest || d > latest) latest = d
    })
  })
  if (!latest) return null
  const today = new Date().toISOString().split('T')[0]
  return Math.round(
    (new Date(today + 'T12:00:00') - new Date(latest + 'T12:00:00')) / 86400000
  )
}

/* ────────────────────────────────────────────────────────────────────────
   V2 vocabulary (secondary build — Frame_Front_Figma / Frame_Rear_Figma).

   The V2 artwork regroups several regions, so it cannot reuse the tables
   above: quads is one region instead of outer_quad + inner_quad, hips and
   knees are gone, and midsection, elbows, infraspinatus and obliques_rear
   are new. Kept as separate exports so MuscleMapNew keeps its own mapping
   untouched and either model can be reverted to independently.
   ──────────────────────────────────────────────────────────────────────── */

export const LEGACY_TO_PAIRS_V2 = {
  Chest:      { front: ['chest'],                              rear: [] },
  Shoulders:  { front: ['deltoids'],                           rear: ['deltoids_rear'] },
  Back:       { front: ['traps'],                              rear: ['traps_lats', 'lower_back', 'spine', 'infraspinatus'] },
  Biceps:     { front: ['biceps'],                             rear: [] },
  Triceps:    { front: [],                                     rear: ['triceps_rear'] },
  Forearms:   { front: ['forearms'],                           rear: ['forearms_rear'] },
  Abs:        { front: ['upper_abs', 'lower_abs'],              rear: [] },
  Obliques:   { front: ['obliques'],                           rear: ['obliques_rear'] },
  Quads:      { front: ['quads'],                              rear: [] },
  Hamstrings: { front: ['hamstrings_front'],                   rear: ['hamstrings'] },
  Glutes:     { front: [],                                     rear: ['glute_med'] },
  Calves:     { front: ['calves'],                             rear: ['calves_rear'] },
  Shins:      { front: ['tibialis'],                           rear: ['shins_rear'] },
  Head:       { front: [],                                     rear: [] },
}

// `elbows` is a joint, not a trainable group, so it logs nothing.
export const PAIR_TO_LEGACY_V2 = {
  // front
  upper_abs: 'Abs',      lower_abs: 'Abs',
  traps: 'Back',         deltoids: 'Shoulders',   chest: 'Chest',
  biceps: 'Biceps',      forearms: 'Forearms',    obliques: 'Obliques',
  quads: 'Quads',        tibialis: 'Shins',
  calves: 'Calves',      elbows: null,       hamstrings_front: 'Hamstrings',
  // rear
  spine: 'Back',         traps_lats: 'Back',      deltoids_rear: 'Shoulders',
  infraspinatus: 'Back', triceps_rear: 'Triceps', forearms_rear: 'Forearms',
  lower_back: 'Back',    obliques_rear: 'Obliques',
  glute_med: 'Glutes',   hamstrings: 'Hamstrings',
  shins_rear: 'Shins',   calves_rear: 'Calves',
}

/* The exercise DB is coarser than the artwork: the three abdominal regions
   all draw from `core`, both shin regions from `shins`, and infraspinatus
   from `upper_back`. `elbows` has no entry and resolves to null. */
export const PAIR_TO_DB_V2 = {
  // front
  upper_abs: 'core',     lower_abs: 'core',
  traps: 'traps',        deltoids: 'shoulders',   chest: 'chest',
  biceps: 'biceps',      forearms: 'forearms',    obliques: 'obliques',
  quads: 'quads',        tibialis: 'shins',
  calves: 'calves',      elbows: null,       hamstrings_front: 'hamstrings',
  // rear
  spine: 'lower_back',   traps_lats: 'lats',      deltoids_rear: 'shoulders',
  infraspinatus: 'upper_back', triceps_rear: 'triceps', forearms_rear: 'forearms',
  lower_back: 'lower_back', obliques_rear: 'obliques',
  glute_med: 'glutes',   hamstrings: 'hamstrings',
  shins_rear: 'shins',   calves_rear: 'calves',
}

/* Table-driven forms of the three lookups above, so a model passes the
   vocabulary it was built against instead of the module picking one. */
export function viewForLegacyIn(table, name) {
  const m = table[name]
  if (!m) return null
  if (m.front.length) return 'front'
  if (m.rear.length)  return 'rear'
  return null
}

export function pairsForLegacyIn(table, name, view) {
  return table[name]?.[view] ?? []
}

export function recentlyTrainedPairsIn(table, workouts = [], view = 'front', days = 7) {
  const today = new Date().toISOString().split('T')[0]
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fromStr = from.toISOString().split('T')[0]

  const out = new Set()
  workouts.forEach(w => {
    const d = w.workout_date || w.created_at?.split('T')[0]
    if (!d || d < fromStr || d > today) return
    ;(w.exercises || []).forEach(ex => {
      const mg = ex.muscle_group
      if (!mg) return
      if (mg === 'Full Body') {
        Object.keys(table).forEach(k =>
          pairsForLegacyIn(table, k, view).forEach(p => out.add(p)))
      } else {
        pairsForLegacyIn(table, mg, view).forEach(p => out.add(p))
      }
    })
  })
  return [...out]
}
