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

  const push = (name: string | undefined, calStr: string | undefined, qty?: string) => {
    if (!name || !calStr || !INT.test(calStr)) return
    const nm = name.trim()
    if (!nm || HEADER_WORDS.has(nm.toLowerCase()) || INT.test(nm)) return
    const key = meal + '|' + nm.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    items.push({ meal, name: nm, calories: +calStr, qty: qty?.trim() })
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
        push(cells.slice(start, qi).join(' '), cells[qi + 1], cells[qi])
        continue
      }
    }

    // Column form: each field on its own line
    if (QTY.test(line)) push(lines[i - 1], lines[i + 1], line)
  }
  return items
}

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snacks & Drinks',
}

/* ----------------------------- Quantities ----------------------------- */

export interface Qty { n: number; unit: 'No' | 'g' }
const COUNTABLE = /idli|dosa|poori|puri|chapathi|chapati|roti|naan|paratha|vada|vadai|egg|omelette|omlet|banana|guava|apple|orange|cutlet|appalam|papad|bajji|bonda|samosa|uttapam|adai|appam|bread|paniyaram|kozhukattai/
const BY_WEIGHT = /sagu|kurma|korma|masala|curry|gravy|rice|sambar|chutney|thuvaiyal|kanji|upma|pongal|koozh|biryani|briyani|\bdal|dall|rasam|payasam|sundal|puttu|raitha|raita|kootu|poriyal|kitchdi|fry|curd|kuzhambu|kadappa/

/** Canteen serving when the menu didn't state one: drinks 200 g, countable items 1 No, else 100 g. */
export function defaultQty(name: string): string {
  const n = name.toLowerCase()
  if (foodRole(name) === 'drink') return '200 Gms'
  if (!BY_WEIGHT.test(n) && COUNTABLE.test(n)) return '1 No'
  return '100 Gms'
}
export function parseQty(s?: string): Qty | null {
  const m = s?.match(/^(\d+(?:\.\d+)?)\s*(gms?|g|grams?|nos?|pcs?)\b/i)
  if (!m) return null
  return { n: +m[1], unit: /^g/i.test(m[2]) ? 'g' : 'No' }
}
export const itemQty = (it: MenuItem): Qty => parseQty(it.qty) || parseQty(defaultQty(it.name))!

/** "3 Nos" / "1 No" / "150 g" for `servings` × the item's serving. */
export function fmtQty(q: Qty, servings = 1): string {
  const t = Math.round(q.n * servings * 10) / 10
  return q.unit === 'g' ? `${t} g` : `${t} ${t === 1 ? 'No' : 'Nos'}`
}

/** How a dish may be portioned on a plate (multiples of its serving). */
function portionRules(role: Role, q: Qty, name: string): { start: number; step: number; max: number } {
  const g = q.unit === 'g'
  const step = g ? 0.5 : 1
  if (role === 'accompaniment') return { start: g ? 0.5 : 1, step, max: 1 }        // ~50 g chutney, 1 appalam
  if (role === 'base') return { start: 1, step, max: g ? 2.5 : /poori|puri|bread|vada/i.test(name) ? 2 : 4 }
  if (role === 'protein') return { start: 1, step, max: g ? 2 : 3 }               // up to 3 eggs / 200 g dal
  if (role === 'veg') return { start: 1, step, max: 2 }
  return { start: 1, step, max: 1 }
}

export interface Portion { kcal: number; role: Role; servings: number; step: number; max: number }
/**
 * Grow servings toward the calorie budget — protein first, then base, then veg,
 * round-robin so the plate stays balanced (e.g. 3 idli + 2 eggs + 150 g sambar).
 */
export function growServings<T extends Portion>(picks: T[], budget: number): T[] {
  let cal = picks.reduce((s, p) => s + p.kcal * p.servings, 0)
  for (let changed = true; changed;) {
    changed = false
    for (const role of ['protein', 'base', 'veg'] as Role[]) {
      for (const p of picks) {
        if (p.role !== role || p.servings + p.step > p.max + 1e-9) continue
        const add = p.kcal * p.step
        if (cal + add > budget) continue
        p.servings = Math.round((p.servings + p.step) * 1000) / 1000; cal += add; changed = true
      }
    }
  }
  return picks
}

/** One suggested dish. Macros & `calories` are for the whole portion (`servings` × serving). */
export interface SuggestedItem { item: MenuItem; servings: number; qtyLabel: string; calories: number; protein: number; carbs: number; fat: number; role: Role; score: number; band: Band }
export interface MenuSuggestion {
  picks: SuggestedItem[]
  totals: { calories: number; protein: number; carbs: number; fat: number; score: number; band: Band }
}

/** Role of a dish in an Indian meal — drives sensible plate-building. */
export type Role = 'base' | 'protein' | 'veg' | 'accompaniment' | 'fruit' | 'drink' | 'fried' | 'other'

export function foodRole(name: string): Role {
  const n = name.toLowerCase()
  if (/rasam|kuzhambu/.test(n)) return 'accompaniment' // before drinks ("jeera rasam") — eaten over a base, not alone
  if (/tea|coffee|\bmilk\b|buttermilk|juice|lemonade|jaljeera|jeera|lassi/.test(n)) return 'drink'
  if (/podi\s*(dosa|idli|uttapam)/.test(n)) return 'base' // a dosa dusted with podi, not the podi itself
  if (/chutney|thuvaiyal|thogayal|thokku|pickle|appalam|papad|malli|podi/.test(n)) return 'accompaniment'
  if (/egg|omelette|omlet|paneer|chicken|fish|mutton|prawn/.test(n)) return 'protein'
  if (/\bdal\b|dall|sambar|sambhar|rajma|chana|channa|\bgram\b|peas|moong|toor|kootu/.test(n)) return 'protein'
  if (/sagu|kurma|korma/.test(n)) return 'veg' // gravy side served with poori/chapathi
  if (/idli|dosa|kaldosa|poori|puri|chapathi|chapati|roti|naan|rice|pongal|upma|koozh|kanji|kanchi|porridge|biryani|paratha|uttapam|bread|fermented/.test(n)) return 'base'
  if (/poriyal|masala|aloo|potato|beetroot|cabbage|cauliflower|sabzi|sabji|\bveg\b/.test(n)) return 'veg'
  if (/banana|guava|muskmelon|melon|apple|orange|fruit|grape|papaya|pomegranate|pineapple|sapota|chikoo|pear\b/.test(n)) return 'fruit'
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
      .map((c) => {
        const r = portionRules(c.role, itemQty(c.it), c.it.name)
        return { c, kcal: c.it.calories, role: c.role, servings: r.start, step: r.step, max: r.max }
      })
    growServings(plate, budget)
    plate.forEach(({ c, servings }) => {
      const r1 = (v: number) => Math.round(v * servings)
      picks.push({ item: c.it, servings, qtyLabel: fmtQty(itemQty(c.it), servings), calories: r1(c.it.calories),
        protein: r1(c.protein), carbs: r1(c.carbs), fat: r1(c.fat), role: c.role, score: c.score, band: c.band })
    })
  }

  const base = picks.reduce((a, p) => ({
    calories: a.calories + p.calories, protein: a.protein + p.protein, carbs: a.carbs + p.carbs, fat: a.fat + p.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  // calorie-weighted average health score of the suggested plate
  const tw = picks.reduce((s, p) => s + Math.max(40, p.calories), 0) || 1
  const score = Math.round(picks.reduce((s, p) => s + p.score * Math.max(40, p.calories), 0) / tw)
  const band: Band = score >= 72 ? 'great' : score >= 55 ? 'good' : score >= 40 ? 'moderate' : 'limit'
  picks.sort((a, b) => order.indexOf(a.item.meal) - order.indexOf(b.item.meal))
  return { picks, totals: { ...base, score, band } }
}
