const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')
const { createClient } = require('@supabase/supabase-js')

const plaid = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET':    process.env.PLAID_SECRET,
    },
  },
}))

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { publicToken, userId, institutionName } = JSON.parse(event.body || '{}')
    if (!publicToken || !userId) return { statusCode: 400, body: JSON.stringify({ error: 'publicToken and userId required' }) }

    // Exchange public token for access token
    const exchangeRes = await plaid.itemPublicTokenExchange({ public_token: publicToken })
    const { access_token, item_id } = exchangeRes.data

    // Store in Supabase using service role key (server-side only)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Upsert — one item per user (replace existing connection)
    await supabase.from('plaid_items').upsert(
      { user_id: userId, access_token, item_id, institution_name: institutionName || null },
      { onConflict: 'user_id' }
    )

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    }
  } catch (err) {
    console.error('plaid-exchange error:', err.response?.data || err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
