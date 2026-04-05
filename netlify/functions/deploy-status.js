/**
 * Axios App — Netlify Deploy Status
 * Founder/Creator: Ethan Thomas Scott
 *
 * Returns recent deploys + build minute usage for the Admin › System panel.
 * Requires: NETLIFY_TOKEN, NETLIFY_SITE_ID env vars in Netlify dashboard.
 */

const TOKEN   = process.env.NETLIFY_TOKEN || process.env.NETLIFY_ACCESS_TOKEN || ''
const SITE_ID = process.env.NETLIFY_SITE_ID || ''

exports.handler = async () => {
  if (!TOKEN || !SITE_ID) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Add NETLIFY_TOKEN and NETLIFY_SITE_ID to your Netlify environment variables to enable deploy tracking.',
        deploys: [],
        buildMinutes: null,
      }),
    }
  }

  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

  const [deploysRes, siteRes, accountRes] = await Promise.allSettled([
    fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys?per_page=10`, { headers }),
    fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}`,                      { headers }),
    fetch(`https://api.netlify.com/api/v1/accounts`,                               { headers }),
  ])

  const deploys = deploysRes.status === 'fulfilled' && deploysRes.value.ok
    ? (await deploysRes.value.json()).map(d => ({
        id:        d.id,
        state:     d.state,
        branch:    d.branch,
        title:     d.title || d.commit_message || 'Deploy',
        createdAt: d.created_at,
        buildTime: d.deploy_time, // seconds
        error:     d.error_message || null,
      }))
    : []

  let buildMinutes = null
  if (accountRes.status === 'fulfilled' && accountRes.value.ok) {
    const accounts = await accountRes.value.json()
    const acct = accounts?.[0]
    if (acct?.billing_period) {
      buildMinutes = {
        used:      acct.billing_period?.build_minutes_used ?? null,
        included:  acct.billing_plan?.build_minutes ?? 300,
        period:    acct.billing_period?.period_start_date ?? null,
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ deploys, buildMinutes }),
  }
}
