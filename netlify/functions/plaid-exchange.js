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

    // Delete existing then insert fresh (avoids upsert conflict issues)
    await supabase.from('plaid_items').delete().eq('user_id', userId)
    const { error: insertError } = await supabase.from('plaid_items').insert({
      user_id: userId,
      access_token,
      item_id,
      institution_name: institutionName || null,
    })

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save bank connection: ' + insertError.message }) }
    }

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
