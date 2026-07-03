const GROQ_API_KEY = process.env.GROQ_API_KEY

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

async function generateProgramVariation(prompt, variation) {
  const groqPrompt = `${prompt}\n\nGeneration variant #${variation}: Create a UNIQUE program with different exercise selection and periodization strategy. Return ONLY valid JSON.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: groqPrompt }],
      max_tokens: 2048,
      temperature: 0.7 + (variation * 0.15),
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error(`Groq API error (variant ${variation}):`, err)
    throw new Error(err)
  }

  const data = await response.json()
  const text = (data.choices?.[0]?.message?.content || '').trim()

  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const jsonStart = stripped.indexOf('{')
  const jsonEnd = stripped.lastIndexOf('}')
  const clean = jsonStart !== -1 && jsonEnd !== -1 ? stripped.slice(jsonStart, jsonEnd + 1) : stripped

  try {
    return JSON.parse(clean)
  } catch {
    console.error(`JSON parse failed (variant ${variation}). Raw text:`, text.slice(0, 500))
    throw new Error('Could not parse program variant')
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  if (!GROQ_API_KEY) {
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
    // Generate 3 program variations in parallel for speed
    const [variant1, variant2, variant3] = await Promise.all([
      generateProgramVariation(prompt, 1),
      generateProgramVariation(prompt, 2),
      generateProgramVariation(prompt, 3),
    ])

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variants: [variant1, variant2, variant3]
      })
    }
  } catch (e) {
    console.error('generate-program error:', e.message)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) }
  }
}
