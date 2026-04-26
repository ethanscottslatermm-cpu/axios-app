// Fetches OHLC history from Yahoo Finance — server-side, no CORS
const RANGE_INTERVAL = {
  '1d':  '5m',
  '5d':  '15m',
  '1mo': '1d',
  '3mo': '1d',
  '6mo': '1wk',
  '1y':  '1wk',
}

exports.handler = async (event) => {
  const { symbol, range = '1mo' } = event.queryStringParameters || {}
  if (!symbol) return { statusCode: 400, body: JSON.stringify({ error: 'symbol required' }) }

  const interval = RANGE_INTERVAL[range] || '1d'
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AxiosApp/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: 'upstream error' }) }

    const data = await res.json()
    const result = data.chart?.result?.[0]
    if (!result) return { statusCode: 404, body: JSON.stringify({ error: 'no data' }) }

    const meta       = result.meta
    const timestamps = result.timestamp || []
    const closes     = result.indicators?.quote?.[0]?.close || []
    const highs      = result.indicators?.quote?.[0]?.high  || []
    const lows       = result.indicators?.quote?.[0]?.low   || []

    const points = timestamps
      .map((ts, i) => ({ ts, close: closes[i], high: highs[i], low: lows[i] }))
      .filter(p => p.close != null)

    return {
      statusCode: 200,
      headers: {
        'Content-Type':                'application/json',
        'Cache-Control':               'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        symbol:                  meta.symbol,
        displayName:             meta.longName || meta.shortName || meta.symbol,
        currency:                meta.currency || 'USD',
        regularMarketPrice:      meta.regularMarketPrice,
        previousClose:           meta.chartPreviousClose ?? meta.previousClose,
        regularMarketDayHigh:    meta.regularMarketDayHigh,
        regularMarketDayLow:     meta.regularMarketDayLow,
        regularMarketVolume:     meta.regularMarketVolume,
        points,
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
