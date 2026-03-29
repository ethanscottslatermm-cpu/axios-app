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
    const { userId } = JSON.parse(event.body || '{}')
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'userId required' }) }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('plaid_items')
      .select('access_token, institution_name')
      .eq('user_id', userId)
      .single()

    if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'No bank connected' }) }

    const res = await plaid.accountsBalanceGet({ access_token: data.access_token })

    const accounts = res.data.accounts.map(a => ({
      id:              a.account_id,
      name:            a.name,
      officialName:    a.official_name,
      type:            a.type,
      subtype:         a.subtype,
      balance:         a.balances.current,
      available:       a.balances.available,
      currency:        a.balances.iso_currency_code || 'USD',
      institution:     data.institution_name,
    }))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accounts }),
    }
  } catch (err) {
    console.error('plaid-balances error:', err.response?.data || err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
