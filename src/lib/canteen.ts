import { MenuItem, MealType } from './types'
import { estimateMacros } from './macros'
import { analyzeFood, Band } from './nutrition'

/**
 * Parse a pasted office/canteen menu into {meal, name, calories} items.
 *
 * Handles the common table layout where each item appears across lines as:
 *   S.No → Item name → Qty (e.g. "100 Gms" / "1 No") → Calorie → Allergens
 * and meal sections are headed by lines with a time range, e.g.
 *   "Breakfast ( 08.00 AM – 10.30 AM )".
 */
const QTY = /^\d+(\.\d+)?\s*(gms?|nos?)$/i
const TIME_HEADER = /\(\s*\d{1,2}[.:]\d{2}\s*(am|pm)/i
const INT = /^\d{1,4}$/
const HEADER_WORDS = new Set(['s.no', 'sno', 'item', 'qty (nos / gms)', 'qty', 'calorie', 'calories', 'allergens'])

function mealFor(header: string): MealType {
  const h = header.toLowerCase()
  if (/breakfast/.test(h)) return 'breakfast'
  if (/lunch/.test(h)) return 'lunch'
  if (/dinner|supper/.test(h)) return 'dinner'
  return 'snack' // beverages, juice, snacks, etc.
}

export function parseCanteenMenu(text: string): MenuItem[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  let meal: MealType = 'snack'
  const items: MenuItem[] = []
  const seen = new Set<string>()

  const push = (name: string | undefined, calStr: string | undefined) => {
    if (!name || !calStr || !INT.test(calStr)) return
    const nm = name.trim()
    if (!nm || HEADER_WORDS.has(nm.toLowerCase()) || INT.test(nm)) return
    const key = meal + '|' + nm.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    items.push({ meal, name: nm, calories: +calStr })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (TIME_HEADER.test(line)) { meal = mealFor(line); continue }

    // Row form: a whole row on one line, split by tabs or 2+ spaces
    //   "1<tab>Idli<tab>1 No<tab>60<tab>-"
    const cells = line.split(/\t|\s{2,}/).map((c) => c.trim()).filter(Boolean)
    if (cells.length >= 3) {
      const qi = cells.findIndex((c) => QTY.test(c))
      if (qi > 0 && cells[qi + 1] && INT.test(cells[qi + 1])) {
        const start = INT.test(cells[0]) ? 1 : 0 // drop leading S.No
        push(cells.slice(start, qi).join(' '), cells[qi + 1])
        continue
      }
    }

    // Column form: each field on its own line
    if (QTY.test(line)) push(lines[i - 1], lines[i + 1])
  }
  return items
}

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snacks & Drinks',
}

export interface SuggestedItem { item: MenuItem; protein: number; carbs: number; fat: number; role: Role; score: number; band: Band }
export interface MenuSuggestion {
  picks: SuggestedItem[]
  totals: { calories: number; protein: number; carbs: number; fat: number; score: number; band: Band }
}

/** Role of a dish in an Indian meal — drives sensible plate-building. */
export type Role = 'base' | 'protein' | 'veg' | 'accompaniment' | 'fruit' | 'drink' | 'fried' | 'other'

export function foodRole(name: string): Role {
  const n = name.toLowerCase()
  if (/tea|coffee|\bmilk\b|buttermilk|juice|jaljeera|jeera|lassi/.test(n)) return 'drink'
  if (/chutney|thuvaiyal|thogayal|thokku|pickle|appalam|papad|malli|podi/.test(n)) return 'accompaniment'
  if (/rasam|kuzhambu/.test(n)) return 'accompaniment' // eaten over a base, not alone
  if (/egg|omelette|omlet|paneer|chicken|fish|mutton|prawn/.test(n)) return 'protein'
  if (/\bdal\b|dall|sambar|sambhar|rajma|chana|\bgram\b|peas|moong|toor|kootu/.test(n)) return 'protein'
  if (/idli|dosa|kaldosa|poori|puri|chapathi|chapati|roti|naan|rice|pongal|upma|koozh|biryani|paratha|uttapam|bread|fermented/.test(n)) return 'base'
  if (/poriyal|masala|aloo|potato|beetroot|cabbage|cauliflower|sabzi|sabji|\bveg\b/.test(n)) return 'veg'
  if (/banana|guava|muskmelon|melon|apple|orange|fruit|grape/.test(n)) return 'fruit'
  if (/vada|suzhiyam|boondhi|bajji|bonda|pakoda/.test(n)) return 'fried'
  return 'other'
}

interface Cand { it: MenuItem; protein: number; carbs: number; fat: number; role: Role; score: number; band: Band }
function enrich(items: MenuItem[]): Cand[] {
  return items.map((it) => {
    const a = analyzeFood(it.name, it.calories)
    return { it, role: foodRole(it.name), protein: a.macros.protein, carbs: a.macros.carbs, fat: a.macros.fat, score: a.score, band: a.band }
  })
}

/**
 * Build one balanced plate (base + protein + veg + a side) within a calorie
 * budget — now health-aware: within each role we prefer the higher health-score
 * option (which already rewards steamed/whole-grain/lean and penalises
 * fried/sweet), tie-breaking on protein. Deep-fried & sweet items are avoided
 * unless nothing healthier exists.
 */
function buildPlate(cands: Cand[], budget: number): Cand[] {
  const plate: Cand[] = []
  const used = new Set<string>()
  let cal = 0
  const fits = (c: Cand, slack = 60) => cal + c.it.calories <= budget + slack
  const take = (c?: Cand) => { if (c && !used.has(c.it.name) && fits(c)) { plate.push(c); used.add(c.it.name); cal += c.it.calories; return true } return false }
  // rank: health score first, then protein — so the plate is nutritious, not just high-protein
  const byHealth = (a: Cand, b: Cand) => b.score - a.score || b.protein - a.protein
  const wholesome = (c: Cand) => c.role !== 'fried' && c.score >= 30
  const of = (r: Role) => cands.filter((c) => c.role === r && !used.has(c.it.name) && wholesome(c)).sort(byHealth)

  take(of('protein')[0])                 // 1) best protein (egg/paneer/dal/sambar)
  take(of('base')[0])                    // 2) best base (prefer idli/millet/brown over fried)
  take(of('veg')[0])                     // 3) a vegetable side (fibre & micros)
  if (plate.some((p) => p.role === 'protein')) take(of('protein')[0]) // 4) 2nd protein if room
  // 5) one small accompaniment ONLY if there's a base to eat it with
  if (plate.some((p) => p.role === 'base')) {
    const acc = of('accompaniment').filter((c) => c.it.calories <= 130).sort((a, b) => a.it.calories - b.it.calories)[0]
    take(acc)
  }
  if (!plate.length) { // fallback: best available wholesome item, else anything
    const best = cands.filter((c) => !used.has(c.it.name)).sort(byHealth)[0]
    take(best || cands[0])
  }
  return plate
}

/**
 * Indian-meal-aware suggestion: builds a proper plate (base + protein + veg + a
 * paired side) for each meal toward the calorie/protein targets — never a lone
 * chutney or appalam, and drinks/fried snacks are deprioritised.
 */
export function suggestFromMenu(items: MenuItem[], calTarget: number, _proteinTarget: number): MenuSuggestion {
  const order: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
  const present = order.filter((m) => items.some((i) => i.meal === m && foodRole(i.name) !== 'drink'))
  // weight calories across the meals that exist (snack gets little)
  const rawW: Record<MealType, number> = { breakfast: 0.3, lunch: 0.4, dinner: 0.3, snack: 0.1 }
  const totalW = present.reduce((s, m) => s + rawW[m], 0) || 1

  const picks: SuggestedItem[] = []
  for (const m of present) {
    const budget = calTarget * (rawW[m] / totalW)
    const plate = buildPlate(enrich(items.filter((i) => i.meal === m)), budget)
    plate.forEach((c) => picks.push({ item: c.it, protein: c.protein, carbs: c.carbs, fat: c.fat, role: c.role, score: c.score, band: c.band }))
  }

  const base = picks.reduce((a, p) => ({
    calories: a.calories + p.item.calories, protein: a.protein + p.protein, carbs: a.carbs + p.carbs, fat: a.fat + p.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  // calorie-weighted average health score of the suggested plate
  const tw = picks.reduce((s, p) => s + Math.max(40, p.item.calories), 0) || 1
  const score = Math.round(picks.reduce((s, p) => s + p.score * Math.max(40, p.item.calories), 0) / tw)
  const band: Band = score >= 72 ? 'great' : score >= 55 ? 'good' : score >= 40 ? 'moderate' : 'limit'
  picks.sort((a, b) => order.indexOf(a.item.meal) - order.indexOf(b.item.meal))
  return { picks, totals: { ...base, score, band } }
}
