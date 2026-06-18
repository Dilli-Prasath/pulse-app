import { MenuItem, MealType } from './types'
import { estimateMacros } from './macros'

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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (TIME_HEADER.test(line)) { meal = mealFor(line); continue }
    if (QTY.test(line)) {
      const name = lines[i - 1]
      const calStr = lines[i + 1]
      if (!name || !calStr || !INT.test(calStr)) continue
      if (HEADER_WORDS.has(name.toLowerCase()) || INT.test(name)) continue
      const key = meal + '|' + name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      items.push({ meal, name, calories: +calStr })
    }
  }
  return items
}

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snacks & Drinks',
}

export interface SuggestedItem { item: MenuItem; protein: number; carbs: number; fat: number }
export interface MenuSuggestion {
  picks: SuggestedItem[]
  totals: { calories: number; protein: number; carbs: number; fat: number }
}

/**
 * Pick the best items from a day's menu for the user's calorie & protein
 * targets: favour protein density, fill toward the calorie target without
 * overshooting, keep some variety per meal, and avoid loading up on drinks.
 */
export function suggestFromMenu(items: MenuItem[], calTarget: number, proteinTarget: number): MenuSuggestion {
  const enriched = items.map((it) => {
    const m = estimateMacros(it.name, it.calories)
    const density = it.calories > 0 ? m.protein / it.calories : 0
    const isDrink = /tea|coffee|juice|water|buttermilk|jaljeera/i.test(it.name)
    return { it, ...m, density, isDrink }
  })
  // protein-dense first; drinks last; smaller items break ties
  enriched.sort((a, b) => (b.density - a.density) || (a.it.calories - b.it.calories))

  const picks: SuggestedItem[] = []
  const perMeal: Record<string, number> = {}
  let cal = 0, prot = 0, carbs = 0, fat = 0
  const ceil = calTarget + 120

  for (const e of enriched) {
    if (e.isDrink && cal > 0) continue                 // at most consider drinks when nothing else
    if ((perMeal[e.it.meal] || 0) >= 3) continue       // variety cap per meal
    if (cal + e.it.calories > ceil) continue           // don't overshoot
    picks.push({ item: e.it, protein: e.protein, carbs: e.carbs, fat: e.fat })
    perMeal[e.it.meal] = (perMeal[e.it.meal] || 0) + 1
    cal += e.it.calories; prot += e.protein; carbs += e.carbs; fat += e.fat
    if (cal >= calTarget * 0.92 && prot >= proteinTarget * 0.9) break
  }
  // sort picks back into meal order for display
  const order: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']
  picks.sort((a, b) => order.indexOf(a.item.meal) - order.indexOf(b.item.meal))
  return { picks, totals: { calories: cal, protein: prot, carbs, fat } }
}
