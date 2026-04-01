exports.handler = async () => {
  const symbols = '^DJI,^GSPC,^IXIC,BTC-USD,GC=F'
  const url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbols}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`)

    const data = await res.json()
    const quotes = (data?.quoteResponse?.result || []).map(q => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
    }))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
      body: JSON.stringify(quotes),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
