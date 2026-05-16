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

  const focusStr = focusMuscles?.length ? focusMuscles.join(', ') : 'full body'
  const notesStr = notes?.trim() || 'None'
  // Cap at 4 weeks to stay within Netlify's 26s timeout
  const numWeeks = Math.min(parseInt(duration) || 4, 4)

  const prompt = `You are a strength coach. Return ONLY valid JSON, no markdown, no code fences.

Athlete: Goal=${goal}, Days/week=${days}, Experience=${experience}, Equipment=${equipment}, Focus=${focusStr}, Notes=${notesStr}

Build a ${numWeeks}-week program. JSON shape:
{"name":"","tagline":"","overview":"","weeks":[{"week":1,"theme":"","days":[{"day":"Monday","focus":"","duration":"","exercises":[{"name":"","sets":3,"reps":"8-10","rest":"90s","tempo":"2-0-1","cue":""}]}]}],"progressionNotes":"","nutritionTip":"","recoveryProtocol":""}

Rules: exactly ${days} training days per week, 4-6 exercises per day, progressive overload across weeks. Be concise.`

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

    const jsonStart = text.indexOf('{')
    const jsonEnd   = text.lastIndexOf('}')
    const clean     = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text

    let program
    try {
      program = JSON.parse(clean)
    } catch (parseErr) {
      console.error('JSON parse failed. Raw text:', text.slice(0, 500))
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Could not parse program. Try again.' }) }
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(program) }
  } catch (e) {
    console.error('generate-program error:', e.message)
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) }
  }
}
