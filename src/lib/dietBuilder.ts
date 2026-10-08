import { MealType } from './types'
import type { FoodItem } from './seed'
import { FOOD_GROUPS } from './foodDb'
import { foodRole, growServings, Role } from './canteen'
import { analyzeFood, Band } from './nutrition'

/**
 * "My best diet" — builds a full day from the static food library (not the
 * canteen menu) toward the user's calorie & protein targets, with a concrete
 * quantity for every item (e.g. "3 pcs Idli", "1½ cups Sambar").
 */
export type DietPref = 'veg' | 'egg' | 'nonveg'

export interface BuiltItem {
  meal: MealType
  food: FoodItem
  role: Role
  servings: number   // multiple of food.serving
  qtyLabel: string   // e.g. "3 pcs", "1½ cups", "225g"
  calories: number; protein: number; carbs: number; fat: number
  score: number; band: Band
}
export interface BuiltDay { items: BuiltItem[]; totals: { calories: number; protein: number; carbs: number; fat: number } }

const MEAT = /chicken|mutton|fish|prawn|crab|beef|meat|keema|kheema|nethili|vanjaram|meen|kozhi|pork|liver/i
const EGG = /\begg|omelette|omlet|bhurji \(egg\)/i
// dishes that are really a base even when the name mentions a protein ("Egg Biryani", "Mini Idli (Sambar)")
const BASEY = /idli|dosa|appam|biryani|briyani|rice|paratha|roti|chapathi|chapati|upma|pongal|poori|puri|uttapam|naan|kulcha|pulao|noodles/i
// what a South Indian breakfast plate actually looks like
const BREAKFASTY: Partial<Record<Role, RegExp>> = {
  protein: /sambar|egg|omelette|sprout|chana|chickpea|curd|yogurt|moong|pesarattu|adai|sundal|bhurji/i,
  accompaniment: /chutney|podi|thuvaiyal|thogayal/i,
}
// light snack-friendly items for the evening slot
const SNACKY = /sundal|sprout|chana|chickpea|yogurt|curd|buttermilk|boiled egg|almond|peanut|nuts|makhana|apple|banana|guava|orange|papaya|fruit|pomegranate|watermelon|grapes|corn/i

// which library sections can supply which meals
const MEAL_SECTIONS: Record<MealType, RegExp> = {
  breakfast: /Breakfast & Tiffin|Gravies|Chutney|Staples/,
  lunch: /Rice & Meals|North Indian · Rice|Breads|Gravies|Dals|Poriyal|Paneer & Veg|Non-veg|Staples/,
  dinner: /Breakfast & Tiffin|Breads|Gravies|Dals|Poriyal|Paneer & Veg|Non-veg|Staples/,
  snack: /Staples|Drinks|Snacks & Sweets/,
}
// plate shape per meal: which roles, in order
const TEMPLATE: Record<MealType, Role[]> = {
  breakfast: ['base', 'protein', 'accompaniment'],
  lunch: ['base', 'protein', 'veg', 'other'],
  snack: ['protein', 'fruit'],
  dinner: ['base', 'protein', 'veg'],
}
const SHARE: Record<MealType, number> = { breakfast: 0.27, lunch: 0.35, snack: 0.1, dinner: 0.28 }

/** Parse "2 pcs" / "1 cup" / "150g" so servings can be scaled into a readable quantity. */
function parseServing(s: string): { n: number; unit: string; countable: boolean } | null {
  const m = s.trim().match(/^(\d+(?:\.\d+)?)\s*([a-z ()]*)$/i)
  if (!m) return null
  const unit = m[2].trim()
  return { n: +m[1], unit, countable: /^(pcs?|pieces?|medium|large|small|eggs?|rolls?|slices?)$/i.test(unit) || unit === '' }
}
const FRACTION: Record<string, string> = { '0.5': '½', '0.25': '¼', '0.75': '¾' }
function fmtNum(v: number): string {
  const whole = Math.floor(v), frac = Math.round((v - whole) * 100) / 100
  if (!frac) return String(whole)
  return (whole || '') + (FRACTION[String(frac)] ?? frac.toString().slice(1))
}
function plural(unit: string, total: number): string {
  if (/^g$|^ml$|^\d/.test(unit) || /\(/.test(unit)) return unit
  const sing = unit.replace(/^pcs$/, 'pc').replace(/^pieces$/, 'piece').replace(/^eggs$/, 'egg').replace(/^cups$/, 'cup')
    .replace(/^plates$/, 'plate').replace(/^glasses$/, 'glass').replace(/^slices$/, 'slice').replace(/^rolls$/, 'roll')
  if (total <= 1 || /^(medium|large|small|tbsp)$/.test(sing)) return sing
  if (sing === 'pc') return 'pcs'
  if (sing === 'glass') return 'glasses'
  return sing + 's'
}
export function servingLabel(serving: string, servings: number): string {
  const p = parseServing(serving)
  if (!p) return servings === 1 ? serving : `${fmtNum(servings)} × ${serving}`
  const total = p.countable ? Math.round(p.n * servings) : Math.round(p.n * servings * 100) / 100
  if (/^g$|^ml$/i.test(p.unit)) return `${Math.round(total)}${p.unit}`
  return `${fmtNum(total)} ${plural(p.unit, total)}`.trim()
}

interface Cand { food: FoodItem; category: string; meals: MealType[]; role: Role; score: number; band: Band; veg: DietPref }
let CANDS: Cand[] | null = null
function candidates(): Cand[] {
  if (CANDS) return CANDS
  const out: Cand[] = []
  for (const g of FOOD_GROUPS) {
    const sectionMeals = (Object.keys(MEAL_SECTIONS) as MealType[]).filter((m) => MEAL_SECTIONS[m].test(g.category))
    for (const food of g.items) {
      // snack-friendly items (sundal, sprouts, curd, boiled egg…) work as a snack whichever section they're in
      const meals = SNACKY.test(food.name) && !sectionMeals.includes('snack') ? [...sectionMeals, 'snack' as MealType] : sectionMeals
      if (!meals.length) continue
      if (!parseServing(food.serving)) continue // skip combo servings like "2 roti + 1 cup"
      let role = foodRole(food.name)
      // protein-dense items the name rules miss (sprouts, tofu, whey…) — curd stays "other" for the lunch curd slot
      if (role === 'protein' && BASEY.test(food.name)) role = 'base'
      if (role === 'other' && !/curd|yogurt|dahi|raita|raitha/i.test(food.name) && (food.protein * 4) / Math.max(food.calories, 1) >= 0.25) role = 'protein'
      if (role === 'fried' || (role === 'drink' && !meals.includes('snack'))) continue
      const h = analyzeFood(food.name, food.calories, { protein: food.protein, carbs: food.carbs, fat: food.fat })
      const veg: DietPref = MEAT.test(food.name) ? 'nonveg' : EGG.test(food.name) ? 'egg' : 'veg'
      out.push({ food, category: g.category, meals, role, score: h.score, band: h.band, veg })
    }
  }
  return (CANDS = out)
}

// tiny seeded RNG so "Shuffle" gives a new but reproducible day
function rng(seed: number) {
  let t = seed >>> 0
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296 }
}

function rules(role: Role, serving: string): { start: number; step: number; max: number } {
  const p = parseServing(serving)!
  // countable items step by one whole piece ("2 pcs" idli → ½ serving = 1 pc, "1 large" egg → 1 egg); others by half a serving
  const step = p.countable ? 1 / p.n : 0.5
  const start = !p.countable && role === 'accompaniment' ? 0.5 : 1
  if (role === 'accompaniment') return { start, step, max: 1 }
  if (role === 'base') return { start, step, max: 2.5 }
  if (role === 'protein') return { start, step, max: 2 }
  if (role === 'veg') return { start, step, max: 2 }
  return { start, step, max: 1 }
}

export function buildDay(opts: { calTarget: number; pref: DietPref; seed: number }): BuiltDay {
  const rand = rng(opts.seed)
  const allowed = (c: Cand) => opts.pref === 'nonveg' || (opts.pref === 'egg' ? c.veg !== 'nonveg' : c.veg === 'veg')
  const used = new Set<string>()
  const items: BuiltItem[] = []

  for (const meal of ['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]) {
    const budget = opts.calTarget * SHARE[meal]
    const plate: (Cand & { kcal: number; servings: number; step: number; max: number })[] = []
    let cal = 0
    const roles = TEMPLATE[meal]
    roles.forEach((role, ri) => {
      // leave room for the slots still to fill (~110 kcal core, ~50 fruit/side; curd is optional) so a big base never crowds out the veg
      const reserve = roles.slice(ri + 1).reduce((t, r) => t + (r === 'other' ? 0 : r === 'fruit' || r === 'accompaniment' ? 50 : 110), 0)
      const room = budget - cal - reserve + 80
      // the snack's "protein" slot takes any light snack (sundal, curd, sprouts) — not just name-matched proteins
      const roleOk = (c: Cand) => c.role === role || (meal === 'snack' && role === 'protein' && (c.role === 'other' || c.role === 'drink'))
      let pool = candidates().filter((c) => c.meals.includes(meal) && roleOk(c) && allowed(c) && !used.has(c.food.name) && c.score >= 50
        && c.food.calories * rules(role, c.food.serving).start <= room)
      // breakfast & snacks stay light: no meat, and only snack-friendly items in the evening
      if (meal === 'breakfast' || meal === 'snack') pool = pool.filter((c) => c.veg !== 'nonveg')
      if (meal === 'snack') pool = pool.filter((c) => SNACKY.test(c.food.name))
      if (meal === 'breakfast') pool = role === 'base' ? pool.filter((c) => /Tiffin/.test(c.category)) : pool.filter((c) => BREAKFASTY[role]?.test(c.food.name) ?? true)
      if (role === 'other') pool = pool.filter((c) => /curd|yogurt|dahi|raita|raitha|buttermilk/i.test(c.food.name))
      // egg / non-veg eaters: favour their protein (meat for non-veg) at lunch & dinner
      if (role === 'protein' && opts.pref !== 'veg' && (meal === 'lunch' || meal === 'dinner')) {
        const nv = pool.filter((c) => c.veg === opts.pref); if (nv.length) pool = nv
      }
      pool.sort((a, b) => b.score - a.score || b.food.protein / b.food.calories - a.food.protein / a.food.calories)
      const top = pool.slice(0, 6)
      if (!top.length) return
      const pick = top[Math.floor(rand() * top.length)]
      const r = rules(role, pick.food.serving)
      used.add(pick.food.name)
      plate.push({ ...pick, kcal: pick.food.calories, servings: r.start, step: r.step, max: r.max })
      cal += pick.food.calories * r.start
    })
    growServings(plate, budget)
    for (const p of plate) {
      const k = p.servings
      items.push({ meal, food: p.food, role: p.role, servings: k, qtyLabel: servingLabel(p.food.serving, k),
        calories: Math.round(p.food.calories * k), protein: Math.round(p.food.protein * k), carbs: Math.round(p.food.carbs * k), fat: Math.round(p.food.fat * k),
        score: p.score, band: p.band })
    }
  }
  const totals = items.reduce((a, i) => ({ calories: a.calories + i.calories, protein: a.protein + i.protein, carbs: a.carbs + i.carbs, fat: a.fat + i.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 })
  return { items, totals }
}
