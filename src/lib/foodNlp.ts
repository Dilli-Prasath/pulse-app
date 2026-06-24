/**
 * Offline plain-English meal parser — the "Smart" logger without any API.
 *
 * Splits a sentence like "2 idli, sambar and a banana" into items, figures out
 * the quantity for each, matches it against our large food database (FOOD_DB),
 * and sums the macros. Works fully offline so the Smart tab is useful even when
 * the API Ninjas function isn't deployed. Returns the same shape as the API
 * parser (ParsedNutrition) so the UI is identical.
 */
import { FOOD_DB, FoodItem } from './seed'
import { estimateMacros } from './macros'

export interface LocalParsed {
  items: { name: string; calories: number; protein: number; carbs: number; fat: number }[]
  total: { calories: number; protein: number; carbs: number; fat: number }
  matched: number
  unmatched: string[]
}

const WORD_NUM: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, half: 0.5, couple: 2, dozen: 12,
}
// units we strip when isolating the food name (qty is handled separately)
const UNIT = /^(cups?|plates?|bowls?|glass(?:es)?|pieces?|pcs?|pc|slices?|servings?|tbsp|tsp|spoons?|katori|nos?|g|gm|gms|grams?|ml)$/i
const STOP = new Set(['of', 'with', 'and', 'a', 'an', 'some', 'the', 'my', 'plus', 'extra'])

/** Pre-lowercased index for fast matching. */
const INDEX = FOOD_DB.map((f) => ({ f, key: f.name.toLowerCase() }))

/** Best DB match for a free-text food phrase, or null. */
export function matchFood(phrase: string): FoodItem | null {
  const p = phrase.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!p) return null
  let best: { f: FoodItem; score: number } | null = null
  for (const { f, key } of INDEX) {
    let score = 0
    if (key === p) score = 100
    else if (p.includes(key)) score = 60 + key.length            // DB name appears in the phrase
    else if (key.includes(p) && p.length >= 3) score = 40 + p.length // phrase appears in DB name
    else {
      // token overlap fallback
      const pTokens = p.split(' ').filter((t) => t.length > 2 && !STOP.has(t))
      const kTokens = new Set(key.split(/[\s()/]+/))
      const hits = pTokens.filter((t) => kTokens.has(t)).length
      if (hits) score = 20 + hits * 8
    }
    if (score && (!best || score > best.score)) best = { f, score }
  }
  return best && best.score >= 25 ? best.f : null
}

/** Parse one chunk like "2 cups rice" → { qty, phrase }. */
function parseChunk(raw: string): { qty: number; phrase: string } {
  const tokens = raw.trim().toLowerCase().replace(/[.,]/g, '').split(/\s+/).filter(Boolean)
  let qty = 1
  let i = 0
  // leading numeric quantity (digit, "1/2", or number word)
  if (tokens[i]) {
    const t = tokens[i]
    const frac = t.match(/^(\d+)\/(\d+)$/)
    if (/^\d+(\.\d+)?$/.test(t)) { qty = parseFloat(t); i++ }
    else if (frac) { qty = +frac[1] / +frac[2]; i++ }
    else if (t in WORD_NUM) { qty = WORD_NUM[t]; i++ }
  }
  // optional unit right after the number
  if (tokens[i] && UNIT.test(tokens[i])) i++
  const phrase = tokens.slice(i).filter((t) => !STOP.has(t)).join(' ') || tokens.slice(i).join(' ')
  return { qty: qty || 1, phrase }
}

export function parseMealOffline(text: string): LocalParsed {
  const chunks = text
    .replace(/\band\b|\bwith\b|\bplus\b/gi, ',')
    .split(/[,;\n+&]/)
    .map((c) => c.trim())
    .filter(Boolean)

  const items: LocalParsed['items'] = []
  const unmatched: string[] = []
  for (const chunk of chunks) {
    const { qty, phrase } = parseChunk(chunk)
    if (!phrase) continue
    const f = matchFood(phrase)
    if (!f) { unmatched.push(chunk.trim()); continue }
    const m = estimateMacros(f.name, f.calories) // ensures macros even if DB row lacks them
    const protein = f.protein || m.protein
    const carbs = f.carbs || m.carbs
    const fat = f.fat || m.fat
    items.push({
      name: qty !== 1 ? `${qty}× ${f.name}` : f.name,
      calories: Math.round(f.calories * qty),
      protein: Math.round(protein * qty),
      carbs: Math.round(carbs * qty),
      fat: Math.round(fat * qty),
    })
  }
  const total = items.reduce((a, it) => ({
    calories: a.calories + it.calories, protein: a.protein + it.protein, carbs: a.carbs + it.carbs, fat: a.fat + it.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  return { items, total, matched: items.length, unmatched }
}
