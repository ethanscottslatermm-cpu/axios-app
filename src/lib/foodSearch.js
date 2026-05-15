const OFF_SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl'

const n100 = (nutriments, key) => Math.round((nutriments[key] || 0) * 10) / 10

export async function searchFood(query) {
  if (!query.trim()) return []
  const url = `${OFF_SEARCH}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,nutriments,serving_size`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return (data.products || [])
    .filter(p => p.product_name)
    .map(p => {
      const nm = p.nutriments || {}
      return {
        name:     p.product_name,
        brand:    p.brands || '',
        calories: Math.round(nm['energy-kcal_100g'] || nm['energy-kcal'] || 0),
        protein:  n100(nm, 'proteins_100g'),
        carbs:    n100(nm, 'carbohydrates_100g'),
        fat:      n100(nm, 'fat_100g'),
        serving:  p.serving_size || '100g',
      }
    })
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
