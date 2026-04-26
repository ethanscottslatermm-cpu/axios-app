const KEY = import.meta.env.VITE_FINNHUB_KEY

const BASE = 'https://finnhub.io/api/v1'

export async function getQuote(symbol) {
  const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${KEY}`)
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  return res.json()
}

export async function getMarketNews() {
  const res = await fetch(`${BASE}/news?category=general&token=${KEY}`)
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  const data = await res.json()
  return data.slice(0, 6)
}

export async function getCryptoNews() {
  const res = await fetch(`${BASE}/news?category=crypto&token=${KEY}`)
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  const data = await res.json()
  return data.slice(0, 12)
}

export async function searchSymbol(query) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&token=${KEY}`)
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  const data = await res.json()
  return (data.result || []).slice(0, 6)
}

const CANDLE_CFG = {
  '1d':  { resolution: '5',  days: 1   },
  '5d':  { resolution: '15', days: 5   },
  '1mo': { resolution: 'D',  days: 30  },
  '3mo': { resolution: 'D',  days: 90  },
  '6mo': { resolution: 'W',  days: 180 },
  '1y':  { resolution: 'W',  days: 365 },
}

export async function getCandles(symbol, range = '1mo', isCrypto = false) {
  const cfg  = CANDLE_CFG[range] || CANDLE_CFG['1mo']
  const to   = Math.floor(Date.now() / 1000)
  const from = to - cfg.days * 86400

  const endpoint = isCrypto ? 'crypto/candle' : 'stock/candle'
  const res = await fetch(
    `${BASE}/${endpoint}?symbol=${encodeURIComponent(symbol)}&resolution=${cfg.resolution}&from=${from}&to=${to}&token=${KEY}`
  )
  if (!res.ok) throw new Error(`Finnhub ${res.status}`)
  const data = await res.json()
  if (data.s !== 'ok' || !data.t?.length) throw new Error('no data')

  const points = data.t.map((ts, i) => ({
    ts,
    close: data.c?.[i] ?? null,
    high:  data.h?.[i] ?? null,
    low:   data.l?.[i] ?? null,
  })).filter(p => p.close != null)

  const last = points.length - 1
  return {
    symbol,
    points,
    regularMarketPrice:   points[last]?.close ?? null,
    previousClose:        points[last - 1]?.close ?? points[0]?.close ?? null,
    regularMarketDayHigh: points[last]?.high  ?? null,
    regularMarketDayLow:  points[last]?.low   ?? null,
    regularMarketVolume:  data.v?.[last] ?? null,
  }
}
