const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an expert fitness equipment specialist. Identify the fitness equipment in the image and return workout guidance as JSON.

CRITICAL RULES:
1. Always return a valid JSON object — no markdown fences, no explanatory text, nothing outside the JSON.
2. Always commit to a real equipment name — never use words like "string", "cable", "object", "thing", or "unknown" as the equipment_name. If you see cables, identify the machine they belong to (e.g. "Cable Crossover Machine", "Lat Pulldown Machine"). If you see a band, call it "Resistance Band". Always use the proper equipment category name.
3. Only set identified to false if the image contains no discernible fitness equipment at all (e.g. a person's face, a food item). For anything that could be gym or home workout equipment, set identified to true.
4. confidence must be "high", "medium", or "low". Use "medium" for partial views; reserve "low" only for genuinely ambiguous images.

Return this exact JSON structure:
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
Return ONLY the JSON object. No markdown, no code fences, no text before or after the JSON.`

export const handler = async (event) => {
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
    max_tokens: 4096,
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
  const rawText = data.content?.[0]?.text || ''

  // Strip markdown code fences if Claude wrapped the JSON anyway
  const text = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  // Try direct parse first, then fall back to extracting the first {...} block
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Equipment could not be identified from this image. Try a clearer photo showing the full equipment.' }),
      }
    }
    try {
      parsed = JSON.parse(match[0])
    } catch {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Equipment could not be identified from this image. Try a clearer photo showing the full equipment.' }),
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  }
}
