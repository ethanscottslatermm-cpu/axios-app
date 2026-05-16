const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

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

  const focusStr = focusMuscles?.length ? focusMuscles.join(', ') : 'balanced full body'
  const notesStr = notes?.trim() || 'None'
  const numWeeks = parseInt(duration) || 8

  const prompt = `You are an elite strength and conditioning coach. Build a complete ${duration} training program for this athlete:

- Goal: ${goal}
- Training days per week: ${days}
- Experience: ${experience}
- Equipment: ${equipment}
- Muscle focus: ${focusStr}
- Injuries / notes: ${notesStr}

IMPORTANT: Return ONLY a valid JSON object — no markdown, no code fences, no text before or after.

{
  "name": "Short punchy program name",
  "tagline": "One sentence that captures the program's identity",
  "overview": "2-3 sentences: the training philosophy, why this approach fits this athlete, and what they'll achieve.",
  "weeks": [
    {
      "week": 1,
      "theme": "Week phase name (e.g. Foundation, Accumulation, Intensification, Peak, Deload)",
      "days": [
        {
          "day": "Monday",
          "focus": "Primary muscle group(s)",
          "duration": "Estimated session length e.g. 50-65 min",
          "exercises": [
            {
              "name": "Exercise name",
              "sets": 4,
              "reps": "6-8",
              "rest": "2 min",
              "tempo": "3-1-1",
              "cue": "One coaching cue that makes this exercise click"
            }
          ]
        }
      ]
    }
  ],
  "progressionNotes": "Specific week-to-week progression strategy (load increases, rep ranges, etc.)",
  "nutritionTip": "One concrete nutrition recommendation aligned with the stated goal",
  "recoveryProtocol": "Recovery recommendations: sleep, mobility, deload timing"
}

Include all ${numWeeks} weeks. Each week should have exactly ${days} training days with rest days implied. Make the program genuinely progressive — week themes and exercise selection should evolve meaningfully across the program.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err }) }
    }

    const data = await response.json()
    const text = (data.content?.[0]?.text || '').trim()

    const jsonStart = text.indexOf('{')
    const jsonEnd   = text.lastIndexOf('}')
    const clean     = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text

    let program
    try {
      program = JSON.parse(clean)
    } catch (parseErr) {
      console.error('JSON parse failed. Raw text length:', text.length, 'Clean snippet:', clean.slice(-200))
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Program generation returned invalid JSON. Try a shorter duration or fewer days.' }) }
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(program) }
  } catch (e) {
    console.error('generate-program error:', e.message)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) }
  }
}
