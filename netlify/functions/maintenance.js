/**
 * Axios App — Maintenance Sweeps
 * Founder/Creator: Ethan Thomas Scott
 *
 * Runs server-side cleanup tasks on Supabase tables.
 * Called from Admin › System › Maintenance panel.
 */

const SUPABASE_URL = process.env.SUPABASE_URL  || process.env.VITE_SUPABASE_URL  || ''
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const BASE_HEADERS = {
  apikey:        SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  Prefer:        'return=minimal, count=exact',
}

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { ...BASE_HEADERS, ...(opts.headers || {}) },
  })
  const count = (() => {
    const range = res.headers.get('content-range') || ''
    const m = range.match(/\/(\d+)$/)
    return m ? parseInt(m[1]) : 0
  })()
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      msg = body.message || body.error || body.hint || msg
    } catch { /* keep msg as-is */ }
    throw new Error(msg)
  }
  return { ok: true, count }
}

exports.handler = async (event) => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Supabase env vars not configured' }),
    }
  }

  const { action } = JSON.parse(event.body || '{}')
  const results = {}

  // ── Sweep old logs (> 1 year) ────────────────────────────────────────────────
  if (action === 'sweep_old_logs') {
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 1)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    for (const table of ['food_logs', 'water_logs', 'prayer_logs', 'fitness_logs']) {
      try {
        const { count } = await sb(`${table}?date=lt.${cutoffStr}`, { method: 'DELETE' })
        results[table] = `${count} rows deleted`
      } catch (e) {
        results[table] = `error: ${e.message}`
      }
    }
  }

  // ── Deactivate suspended accounts past their end date ────────────────────────
  if (action === 'expire_suspensions') {
    try {
      const now = new Date().toISOString()
      const { count } = await sb(
        `profiles?status=eq.suspended&suspended_until=lt.${now}`,
        { method: 'PATCH', body: JSON.stringify({ status: 'active', suspended_until: null }) }
      )
      results.suspensions = `${count} accounts reactivated`
    } catch (e) {
      results.suspensions = `error: ${e.message}`
    }
  }

  // ── Purge orphaned watchlist entries (no matching profile) ───────────────────
  // PostgREST does not support subqueries in filter values — we fetch profile IDs
  // first, then pass them as a literal list.
  if (action === 'purge_orphans') {
    try {
      const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id`, {
        headers: BASE_HEADERS,
      })
      if (!profilesRes.ok) {
        throw new Error(`Could not fetch profiles (HTTP ${profilesRes.status})`)
      }
      const profiles = await profilesRes.json()

      if (!Array.isArray(profiles) || profiles.length === 0) {
        results.orphans = 'no profiles found — skipped'
      } else {
        const ids = profiles.map(p => p.id).join(',')
        const { count } = await sb(
          `stock_watchlist?user_id=not.in.(${ids})`,
          { method: 'DELETE' }
        )
        results.orphans = `${count} orphaned rows deleted`
      }
    } catch (e) {
      results.orphans = `error: ${e.message}`
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, action, results }),
  }
}
