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

export async function searchSymbol(query) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&token=${KEY}`)
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  const data = await res.json()
  return (data.result || []).slice(0, 6)
}
