const SYMBOLS = [
  { id: '^DJI',    name: 'DOW',     stooq: '%5Edji'  },
  { id: '^GSPC',   name: 'S&P 500', stooq: '%5Espx'  },
  { id: '^IXIC',   name: 'NASDAQ',  stooq: '%5Eixic' },
  { id: 'BTC-USD', name: 'BTC',     stooq: 'btc.v'   },
  { id: 'GC=F',    name: 'GOLD',    stooq: 'gc.f'    },
]

// Stooq CSV columns: Symbol,Date,Time,Open,High,Low,Close,Volume,Name
async function fetchStooq(sym) {
  const url = `https://stooq.com/q/l/?s=${sym.stooq}&f=sd2t2ohlcvn&e=csv`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const text  = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('empty response')

  const parts = lines[1].split(',')
  const open  = parseFloat(parts[3])
  const close = parseFloat(parts[6])
  if (isNaN(close) || isNaN(open)) throw new Error('bad data')

  return {
    symbol:        sym.id,
    name:          sym.name,
    price:         close,
    change:        +(close - open).toFixed(2),
    changePercent: +((close - open) / open * 100).toFixed(2),
  }
}

exports.handler = async () => {
  const results = await Promise.allSettled(SYMBOLS.map(fetchStooq))
  const quotes  = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
    body: JSON.stringify(quotes),
  }
}
