const SYMBOLS = [
  { id: '^DJI',    name: 'DOW',     stooq: '%5Edji'  },
  { id: '^GSPC',   name: 'S&P 500', stooq: '%5Espx'  },
  { id: '^IXIC',   name: 'NASDAQ',  stooq: '%5Eixic' },
  { id: 'BTC-USD', name: 'BTC',     stooq: 'btc.v'   },
  { id: 'GC=F',    name: 'GOLD',    stooq: 'gc.f'    },
]

async function fetchStooq(sym) {
  const url = `https://stooq.com/q/l/?s=${sym.stooq}&f=sd2t2ohlcvn&e=json`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`stooq ${res.status}`)
  const data = await res.json()
  const q = data?.symbols?.[0]
  if (!q) throw new Error('no data')
  return {
    symbol:        sym.id,
    name:          sym.name,
    price:         q.close,
    change:        +(q.close - q.open).toFixed(2),
    changePercent: +((q.close - q.open) / q.open * 100).toFixed(2),
  }
}

exports.handler = async () => {
  try {
    const results = await Promise.allSettled(SYMBOLS.map(fetchStooq))
    const quotes = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)

    if (quotes.length === 0) throw new Error('all sources failed')

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
