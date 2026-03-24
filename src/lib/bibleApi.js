const BASE_URL = 'https://bible-api.com'

export const DAILY_VERSES = [
  'jeremiah+29:11', 'psalm+23:1', 'philippians+4:13',
  'proverbs+3:5', 'psalm+46:10', 'isaiah+41:10',
  'romans+8:28', 'isaiah+40:31', 'psalm+145:18',
  'psalm+55:22', 'matthew+7:7', 'psalm+51:10',
  'john+15:5', 'romans+12:2', 'matthew+6:33',
  'isaiah+26:3', 'philippians+4:6', 'proverbs+4:23',
  '2+timothy+1:7', 'hebrews+11:1',
]

export async function fetchVerse(reference) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(reference)}?translation=kjv`)
  if (!res.ok) throw new Error('Verse not found')
  return res.json()
}

export function getDailyVerseRef() {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return DAILY_VERSES[seed % DAILY_VERSES.length]
}
