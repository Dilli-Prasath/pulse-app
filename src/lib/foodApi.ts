/**
 * Food search backed by Open Food Facts — a free, open, no-key food database
 * with millions of products and barcodes. CORS-enabled, so it works directly
 * from the browser. Falls back silently on network errors.
 */

export interface FoodResult {
  name: string
  brand?: string
  serving: string
  calories: number
  protein: number
  carbs: number
  fat: number
  image?: string
  source: 'openfoodfacts'
}

const SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl'
const PRODUCT = 'https://world.openfoodfacts.org/api/v2/product/'

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? Math.round(n as number) : 0
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toResult(p: any): FoodResult | null {
  if (!p) return null
  const n = p.nutriments || {}
  const name: string = p.product_name || p.generic_name || ''
  if (!name) return null
  // Prefer per-serving values, else per-100g.
  const hasServing = n['energy-kcal_serving'] != null || n.proteins_serving != null
  const suffix = hasServing ? '_serving' : '_100g'
  const serving = hasServing && p.serving_size ? p.serving_size : '100 g'
  return {
    name,
    brand: p.brands ? String(p.brands).split(',')[0].trim() : undefined,
    serving,
    calories: num(n['energy-kcal' + suffix] ?? n['energy-kcal_100g']),
    protein: num(n['proteins' + suffix] ?? n.proteins_100g),
    carbs: num(n['carbohydrates' + suffix] ?? n.carbohydrates_100g),
    fat: num(n['fat' + suffix] ?? n.fat_100g),
    image: p.image_front_small_url || p.image_thumb_url || undefined,
    source: 'openfoodfacts',
  }
}

/** Free-text search across the Open Food Facts database. */
export async function searchFoods(query: string, signal?: AbortSignal): Promise<FoodResult[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url = `${SEARCH}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,generic_name,brands,serving_size,nutriments,image_front_small_url,image_thumb_url`
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return []
    const json = await res.json()
    const items: FoodResult[] = (json.products || [])
      .map(toResult)
      .filter((r: FoodResult | null): r is FoodResult => !!r && r.calories > 0)
    // de-dupe by name+brand
    const seen = new Set<string>()
    return items.filter((r) => {
      const k = (r.name + '|' + (r.brand || '')).toLowerCase()
      if (seen.has(k)) return false
      seen.add(k)
      return true
    }).slice(0, 12)
  } catch {
    return []
  }
}

/** Look up a single product by its barcode number. */
export async function lookupBarcode(code: string): Promise<FoodResult | null> {
  const c = code.replace(/\D/g, '')
  if (!c) return null
  try {
    const res = await fetch(`${PRODUCT}${c}.json?fields=product_name,generic_name,brands,serving_size,nutriments,image_front_small_url,image_thumb_url`)
    if (!res.ok) return null
    const json = await res.json()
    if (json.status !== 1) return null
    return toResult(json.product)
  } catch {
    return null
  }
}
