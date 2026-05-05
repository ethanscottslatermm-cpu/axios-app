const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an expert fitness coach and equipment specialist. Analyze the fitness equipment in this image and return a JSON response with the following structure:

{
  "identified": true,
  "confidence": "high",
  "equipment_name": "Barbell",
  "equipment_type": "free_weight",
  "description": "Brief description of the equipment",
  "muscles_targeted": ["Chest", "Triceps", "Shoulders"],
  "how_to_use": [
    { "step": 1, "instruction": "..." },
    { "step": 2, "instruction": "..." }
  ],
  "pro_tips": ["tip 1", "tip 2"],
  "common_mistakes": ["mistake 1", "mistake 2"],
  "suggested_workout": {
    "name": "Workout Name",
    "exercises": [
      {
        "name": "Exercise Name",
        "sets": 3,
        "reps": "10-12",
        "rest": "60 seconds",
        "instructions": "Brief cue"
      }
    ]
  },
  "youtube_search_query": "how to use barbell proper form"
}

equipment_type must be one of: gym_machine, free_weight, cardio, home, improvised.
If you cannot confidently identify the equipment, set identified to false and return your best guess in equipment_name with confidence set to low.
Return ONLY the JSON object, no additional text or markdown.`

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Anthropic API key not configured' }),
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid request body' }),
    }
  }

  const { imageBase64, mediaType, confirmName } = body

  if (!imageBase64) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No image data provided' }),
    }
  }

  const userText = confirmName
    ? `Analyze this fitness equipment. The user has identified it as: "${confirmName}". Use this as context and return a complete analysis with that equipment name.`
    : 'Analyze the fitness equipment shown in this image.'

  const anthropicBody = {
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: imageBase64,
            },
          },
          { type: 'text', text: userText },
        ],
      },
    ],
  }

  let anthropicRes
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(anthropicBody),
    })
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to reach Anthropic API', detail: err.message }),
    }
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Anthropic API error ${anthropicRes.status}`, detail: errText }),
    }
  }

  const data = await anthropicRes.json()
  const text = data.content?.[0]?.text || ''

  // Try direct parse first, fall back to regex extraction
  let parsed
  try {
    parsed = JSON.parse(text.trim())
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Could not extract equipment data from response' }),
      }
    }
    try {
      parsed = JSON.parse(match[0])
    } catch {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to parse equipment data' }),
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  }
}
