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
      .select('access_token')
      .eq('user_id', userId)
      .single()

    if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'No bank connected' }) }

    // Last 30 days
    const end   = new Date().toISOString().slice(0, 10)
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const res = await plaid.transactionsGet({
      access_token: data.access_token,
      start_date:   start,
      end_date:     end,
      options: { count: 50, offset: 0 },
    })

    const transactions = res.data.transactions.map(t => ({
      id:       t.transaction_id,
      date:     t.date,
      name:     t.merchant_name || t.name,
      amount:   t.amount,          // positive = debit, negative = credit
      category: t.personal_finance_category?.primary || (t.category?.[0] ?? 'Other'),
      pending:  t.pending,
    }))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    }
  } catch (err) {
    console.error('plaid-transactions error:', err.response?.data || err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
