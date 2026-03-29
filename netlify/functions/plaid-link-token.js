const { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } = require('plaid')

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

    const res = await plaid.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Axios',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link_token: res.data.link_token }),
    }
  } catch (err) {
    console.error('plaid-link-token error:', err.response?.data || err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
