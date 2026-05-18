const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// wger.de equipment IDs
const EQUIPMENT_IDS = {
  'Full Gym': null,
  'Dumbbells Only': 3,
  'Barbell + Rack': 1,
  'Bodyweight Only': 7,
  'Kettlebells': 8,
  'Resistance Bands': 10,
}

// wger.de category IDs
const CATEGORY_IDS = {
  Chest: 11, Back: 12, Shoulders: 13,
  Biceps: 8, Triceps: 8, Core: 10,
  Quads: 9, Hamstrings: 9, Glutes: 9, Calves: 14,
}

async function fetchExercisesFromWger(equipmentId, focusMuscles) {
  const uniqueCategories = [...new Set(
    (focusMuscles || []).map(m => CATEGORY_IDS[m]).filter(Boolean)
  )]

  const buildUrl = (categoryId) => {
    let url = 'https://wger.de/api/v2/exerciseinfo/?format=json&language=2'
    url += uniqueCategories.length > 0 ? '&limit=25' : '&limit=80'
    if (equipmentId != null) url += `&equipment=${equipmentId}`
    if (categoryId != null) url += `&category=${categoryId}`
    return url
  }

  const urls = uniqueCategories.length > 0
    ? uniqueCategories.map(cat => buildUrl(cat))
    : [buildUrl(null)]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const responses = await Promise.all(
      urls.map(url =>
        fetch(url, { signal: controller.signal })
          .then(r => (r.ok ? r.json() : { results: [] }))
          .catch(() => ({ results: [] }))
      )
    )
    clearTimeout(timer)

    const seen = new Set()
    const exercises = []
    for (const data of responses) {
      for (const ex of data.results || []) {
        const t = ex.translations?.find(tr => tr.language === 2) || ex.translations?.[0]
        const name = t?.name?.trim()
        if (name && !seen.has(name)) {
          seen.add(name)
          exercises.push(`${name} (${ex.category?.name || 'General'})`)
        }
      }
    }
    return exercises
  } catch (e) {
    clearTimeout(timer)
    console.warn('wger fetch error:', e.message)
    return []
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  let body
  try { body = JSON.parse(event.body) } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const { goal, days, experience, equipment, duration, focusMuscles, notes } = body

  const focusStr = focusMuscles?.length ? focusMuscles.join(', ') : 'full body'
  const notesStr = notes?.trim() || 'None'
  const numWeeks = Math.min(parseInt(duration) || 4, 8)

  const equipmentId = EQUIPMENT_IDS[equipment] ?? null
  const exercisePool = await fetchExercisesFromWger(equipmentId, focusMuscles)

  const exerciseContext = exercisePool.length >= 8
    ? `\n\nExercise pool (use these; supplement with standard moves only if needed):\n${exercisePool.join('\n')}`
    : ''

  const prompt = `You are a strength coach. Return ONLY valid JSON, no markdown, no code fences.

Athlete: Goal=${goal}, Days/week=${days}, Experience=${experience}, Equipment=${equipment}, Focus=${focusStr}, Notes=${notesStr}

Build a ${numWeeks}-week program. JSON shape:
{"name":"","tagline":"","overview":"","weeks":[{"week":1,"theme":"","days":[{"day":"Monday","focus":"","duration":"","exercises":[{"name":"","sets":3,"reps":"8-10","rest":"90s","tempo":"2-0-1","cue":""}]}]}],"progressionNotes":"","nutritionTip":"","recoveryProtocol":""}

Rules: exactly ${days} training days per week, 4-5 exercises per day, progressive overload across weeks. Be concise.${exerciseContext}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err }) }
    }

    const data = await response.json()
    const text = (data.content?.[0]?.text || '').trim()

    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const jsonStart = stripped.indexOf('{')
    const jsonEnd = stripped.lastIndexOf('}')
    const clean = jsonStart !== -1 && jsonEnd !== -1 ? stripped.slice(jsonStart, jsonEnd + 1) : stripped

    let program
    try {
      program = JSON.parse(clean)
    } catch {
      console.error('JSON parse failed. Raw text:', text.slice(0, 500))
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Could not parse program. Try again.' }) }
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(program) }
  } catch (e) {
    console.error('generate-program error:', e.message)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) }
  }
}
