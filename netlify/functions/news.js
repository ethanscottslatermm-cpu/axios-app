// Fetches RSS feeds server-side — no CORS, no API key required
const FEEDS = [
  { url: 'https://rss.cnn.com/rss/cnn_topstories.rss', source: 'CNN',  color: '#ef4444' },
  { url: 'https://feeds.bbci.co.uk/news/rss.xml',       source: 'BBC',  color: '#60a5fa' },
  { url: 'https://feeds.npr.org/1001/rss.xml',           source: 'NPR',  color: '#4ade80' },
]

function parseItems(xml, source, color) {
  const items = []
  // Match <item>...</item> blocks
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let m
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       block.match(/<title>(.*?)<\/title>/)
    const linkMatch  = block.match(/<link>(.*?)<\/link>/) ||
                       block.match(/<guid[^>]*>(.*?)<\/guid>/)
    if (!titleMatch) continue
    const title = titleMatch[1]
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
    if (!title || title.length < 10) continue
    items.push({ id: linkMatch?.[1] || title, title, source, color })
    if (items.length >= 6) break
  }
  return items
}

exports.handler = async () => {
  const all = []
  await Promise.allSettled(
    FEEDS.map(async ({ url, source, color }) => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'AxiosApp/1.0 RSS Reader' },
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) return
        const xml = await res.text()
        const items = parseItems(xml, source, color)
        all.push(...items)
      } catch {}
    })
  )

  return {
    statusCode: 200,
    headers: {
      'Content-Type':                'application/json',
      'Cache-Control':               'public, max-age=300', // cache 5 min on CDN
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(all),
  }
}
