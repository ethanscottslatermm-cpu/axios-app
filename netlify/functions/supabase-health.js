/**
 * Axios App — Supabase Health Check
 * Founder/Creator: Ethan Thomas Scott
 *
 * Returns table record counts and recent auth activity
 * for the Admin › System panel.
 */

const SUPABASE_URL  = process.env.SUPABASE_URL  || process.env.VITE_SUPABASE_URL  || ''
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const TABLES = ['profiles', 'food_logs', 'water_logs', 'prayer_logs', 'fitness_logs', 'stock_watchlist']

async function countTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    method: 'HEAD',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'count=exact',
    },
  })
  // count comes back in Content-Range: 0-0/N
  const range = res.headers.get('content-range') || ''
  const match = range.match(/\/(\d+)$/)
  return match ? parseInt(match[1]) : null
}

async function recentErrors() {
  // Query Postgres error logs via pg_catalog if available, else skip
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_recent_errors`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

exports.handler = async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars required' }),
    }
  }

  const counts = {}
  await Promise.allSettled(
    TABLES.map(async t => {
      counts[t] = await countTable(t)
    })
  )

  // Recent signups via profiles
  let recentSignups = []
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,created_at&order=created_at.desc&limit=10`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    })
    if (res.ok) recentSignups = await res.json()
  } catch {}

  // Errors (best-effort)
  const errors = await recentErrors()

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ counts, recentSignups, errors }),
  }
}
