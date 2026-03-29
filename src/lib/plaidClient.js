const call = async (fn, body) => {
  const res = await fetch(`/api/${fn}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  let data
  try { data = await res.json() } catch { data = {} }
  if (!res.ok) throw new Error(`[${res.status}] ${data.error || data.message || res.statusText || 'Request failed'}`)
  return data
}

export const getLinkToken      = (userId)                          => call('plaid-link-token',   { userId })
export const exchangeToken     = (userId, publicToken, name)       => call('plaid-exchange',      { userId, publicToken, institutionName: name })
export const fetchBalances     = (userId)                          => call('plaid-balances',      { userId })
export const fetchTransactions = (userId)                          => call('plaid-transactions',  { userId })
