const KEY = import.meta.env.VITE_USDA_KEY || 'DEMO_KEY'
const BASE = 'https://api.nal.usda.gov/fdc/v1'

const get = (nutrients, id) => {
  const n = (nutrients || []).find(n => n.nutrientId === id)
  return n ? Math.round(n.value * 10) / 10 : 0
}

export async function searchFood(query) {
  if (!query.trim()) return []
  const url = `${BASE}/foods/search?query=${encodeURIComponent(query)}&api_key=${KEY}` +
    `&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS),Branded&pageSize=15&sortBy=score&sortOrder=desc`
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

// ── Open Food Facts barcode lookup ────────────────────────────────────────────
export async function lookupBarcode(barcode) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
  if (!res.ok) throw new Error('Lookup failed')
  const data = await res.json()
  if (data.status !== 1 || !data.product) throw new Error('Product not found')

  const p = data.product
  const n = p.nutriments || {}

  const calories = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0)
  const protein  = Math.round((n['proteins_100g']      || 0) * 10) / 10
  const carbs    = Math.round((n['carbohydrates_100g'] || 0) * 10) / 10
  const fat      = Math.round((n['fat_100g']           || 0) * 10) / 10

  const servingSize = p.serving_size || '100g'

  return {
    name:     p.product_name || p.product_name_en || 'Unknown product',
    brand:    p.brands || '',
    calories,
    protein,
    carbs,
    fat,
    serving:  servingSize,
  }
}
