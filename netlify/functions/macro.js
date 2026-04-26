// Fetches macro economic indicators server-side (no CORS issues)
const DYNAMIC = [
  { id: 'oil',   ticker: 'CL=F',  label: 'WTI Oil',  prefix: '$', suffix: '/bbl', decimals: 1 },
  { id: 'yield', ticker: '%5ETNX', label: '10Y Yield', prefix: '',  suffix: '%',   decimals: 2 },
]

async function fetchYahoo(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AxiosApp/1.0)' },
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`)
  const data = await res.json()
  const result = data.chart?.result?.[0]
  if (!result) throw new Error('no result')
  const meta = result.meta
  const price    = meta.regularMarketPrice
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price
  const change   = price - prevClose
  const pct      = prevClose !== 0 ? (change / prevClose) * 100 : 0
  return { price, prevClose, change, pct }
}

exports.handler = async () => {
  const results = await Promise.allSettled(
    DYNAMIC.map(async m => {
      const d = await fetchYahoo(m.ticker)
      return { id: m.id, label: m.label, prefix: m.prefix, suffix: m.suffix, decimals: m.decimals, ...d, static: false }
    })
  )

  const items = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)

  // Static indicators — set via Netlify env vars, defaults shown below
  items.push(
    { id: 'fed', label: 'Fed Rate', prefix: '', suffix: '%', staticVal: process.env.FED_RATE  || '4.25–4.50', static: true },
    { id: 'cpi', label: 'CPI YoY',  prefix: '', suffix: '%', staticVal: process.env.CPI_RATE  || '2.4',       static: true },
  )

  return {
    statusCode: 200,
    headers: {
      'Content-Type':                'application/json',
      'Cache-Control':               'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(items),
  }
}
