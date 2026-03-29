const KEY = import.meta.env.VITE_USDA_KEY || 'DEMO_KEY'
const BASE = 'https://api.nal.usda.gov/fdc/v1'

const get = (nutrients, id) => {
  const n = (nutrients || []).find(n => n.nutrientId === id)
  return n ? Math.round(n.value * 10) / 10 : 0
}

export async function searchFood(query) {
  if (!query.trim()) return []
  const url = `${BASE}/foods/search?query=${encodeURIComponent(query)}&api_key=${KEY}` +
    `&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)&pageSize=10&sortBy=score&sortOrder=desc`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return (data.foods || []).map(item => ({
    fdcId:    item.fdcId,
    name:     item.description,
    brand:    item.brandOwner || item.brandName || '',
    calories: Math.round(get(item.foodNutrients, 1008)),
    protein:  get(item.foodNutrients, 1003),
    carbs:    get(item.foodNutrients, 1005),
    fat:      get(item.foodNutrients, 1004),
    serving:  item.servingSize
      ? `${item.servingSize}${item.servingSizeUnit || 'g'}`
      : 'per 100g',
  }))
}
