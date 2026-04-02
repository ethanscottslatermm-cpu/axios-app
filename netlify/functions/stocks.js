const KEY = process.env.FINNHUB_KEY

// Finnhub symbols — indices use ^ prefix, crypto uses exchange:pair format
const SYMBOLS = [
  { id: '^DJI',    name: 'DOW',     fh: 'DIA'              },
  { id: '^GSPC',   name: 'S&P 500', fh: 'SPY'              },
  { id: '^IXIC',   name: 'NASDAQ',  fh: 'QQQ'              },
  { id: 'BTC-USD', name: 'BTC',     fh: 'BINANCE:BTCUSDT'  },
  { id: 'GC=F',    name: 'GOLD',    fh: 'GLD'              },
]

async function fetchQuote(sym) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.fh)}&token=${KEY}`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`Finnhub HTTP ${res.status}`)
  const data = await res.json()
  if (!data.c || data.c === 0) throw new Error(`no data for ${sym.fh}`)
  return {
    symbol:        sym.id,
    name:          sym.name,
    price:         data.c,
    change:        data.d,
    changePercent: data.dp,
  }
}

exports.handler = async () => {
  const results = await Promise.allSettled(SYMBOLS.map(fetchQuote))
  const quotes  = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)

  return {
    statusCode: 200,
    headers: {
      'Content-Type':  'application/json',
      'Cache-Control': 'public, max-age=60',
    },
    body: JSON.stringify(quotes),
  }
}
