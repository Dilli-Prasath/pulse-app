/**
 * PULSE nutrition-judgement engine — Indian-cuisine aware.
 *
 * This is the app's "dietician brain". Given any food (even one where only the
 * calories are known, like a canteen menu), it:
 *   1. classifies the dish using Indian food vocabulary (Tamil Nadu + North),
 *   2. estimates the nutrients health depends on (protein, fibre, free sugar,
 *      sodium, saturated fat) via macros.ts,
 *   3. scores it 0–100 the way a nutritionist would reason about Indian food —
 *      rewarding dals, vegetables, millets, steamed/fermented tiffin, curd,
 *      lean protein and fruit; penalising deep-fried snacks, sweets, refined
 *      maida, very salty pickles/papads and sugary drinks,
 *   4. explains *why* in plain English (pros / cons),
 *   5. and grades a whole day, flagging gaps ("eat a vegetable", "protein low",
 *      "sugar high") with culturally-sensible coaching.
 *
 * It is a transparent rules engine, not a medical device — accurate enough to
 * steer everyday eating, and honest about being an estimate.
 */
import { estimateMacros, estimateMicros, Macros, Micros } from './macros'
import { fetchNutrients } from './foodApi'

export type Band = 'great' | 'good' | 'moderate' | 'limit'
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E'

/** Food groups we detect — drives both scoring and "did you eat a __ today?". */
export interface FoodTags {
  legume: boolean
  vegetable: boolean
  leafyGreen: boolean
  fruit: boolean
  wholeGrain: boolean
  refinedGrain: boolean
  leanProtein: boolean
  dairy: boolean
  fermented: boolean
  steamed: boolean
  grilled: boolean
  raw: boolean
  fried: boolean
  sweet: boolean
  sugaryDrink: boolean
  saltBomb: boolean // pickle / papad / namkeen
  nutsSeeds: boolean
}

export interface FoodHealth {
  macros: Macros
  micros: Micros
  proteinDensity: number // g protein per 100 kcal
  score: number // 0–100
  grade: Grade
  band: Band
  pros: string[]
  cons: string[]
  labels: string[] // short chips e.g. ["High protein","Deep-fried"]
  tags: FoodTags
  /** true once Open Food Facts (or another DB) has refined the micros. */
  enriched?: boolean
}

const has = (n: string, re: RegExp) => re.test(n)

export function foodTags(name: string): FoodTags {
  const n = name.toLowerCase()
  return {
    legume: has(n, /\bdal\b|dall|sambar|sambhar|rasam|rajma|chana|chole|\bgram\b|moong|toor|masoor|lentil|kootu|usili|paruppu|peas|sundal|payaru|bean curry/),
    vegetable: has(n, /poriyal|sabzi|sabji|cabbage|cauliflower|gobi|beans|carrot|beetroot|gourd|brinjal|okra|bhindi|avial|aviyal|vegetable|\bveg\b|capsicum|kootu|peas|tomato|cucumber/),
    leafyGreen: has(n, /keerai|spinach|palak|methi|greens|murungai|drumstick leaf|amaranth/),
    fruit: has(n, /banana|guava|apple|orange|fruit|grape|melon|papaya|berry|pomegranate|sapota|mango|pear|dates|watermelon|muskmelon/),
    wholeGrain: has(n, /ragi|kambu|bajra|jowar|millet|samai|thinai|varagu|oats|dalia|brown rice|whole wheat|multigrain|adai|pesarattu|koozh|phulka/),
    refinedGrain: has(n, /maida|naan|parotta|porotta|white bread|\bbun\b|noodle|pasta|biryani|biriyani|pulao|fried rice|poori|puri/),
    leanProtein: has(n, /egg(?!less)|omelette|omlet|paneer|chicken|fish|prawn|mutton|tofu|soya|soy chunk|grilled|tandoori|boiled egg|egg white/),
    dairy: has(n, /curd|yogurt|yoghurt|buttermilk|\bmilk\b|lassi|chaas|raita/),
    fermented: has(n, /idli|dosa|uttapam|appam|idiyappam|dhokla|kanji|fermented|adai|pesarattu/),
    steamed: has(n, /idli|idiyappam|steam|puttu|kozhukattai|modak|boiled|sundal/),
    grilled: has(n, /grilled|tandoori|roast|baked|tikka|steam/),
    raw: has(n, /salad|sprout|raw|fruit|cucumber|carrot stick|kosambari/),
    fried: has(n, /vada|vadai|bonda|bajji|pakoda|pakora|samosa|cutlet|kachori|deep fried|deep-fried|\bfried\b|\bfry\b|chips|65\b|crispy|suzhiyam|seyal|murukku|appalam fry/),
    sweet: has(n, /halwa|halva|jamun|jalebi|jangiri|payasam|kheer|laddu|ladoo|mysore pak|boondi|kesari|sweet|dessert|cake|pastry|ice cream|chocolate|barfi|burfi|peda|gulab|rasmalai|rasgulla|sheera|sooji ka/),
    sugaryDrink: has(n, /juice|soda|cola|sherbet|sharbat|sweet lassi|milkshake|\bshake\b|frooti|maaza|thumbs|energy drink|badam milk|rose milk/),
    saltBomb: has(n, /pickle|achar|papad|appalam|fryums|vathal|vadagam|namkeen|\bchips\b|kara sev|mixture|podi/),
    nutsSeeds: has(n, /almond|cashew|peanut|groundnut|walnut|nut\b|seed|flax|chia|til|sesame/),
  }
}

const GRADE = (s: number): Grade => (s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : s >= 35 ? 'D' : 'E')
const BAND = (s: number): Band => (s >= 72 ? 'great' : s >= 55 ? 'good' : s >= 40 ? 'moderate' : 'limit')

export const BAND_COLOR: Record<Band, string> = {
  great: '#2bffb0', good: '#7CFC9B', moderate: '#ffcf5c', limit: '#ff5d7a',
}
export const BAND_LABEL: Record<Band, string> = {
  great: 'Excellent', good: 'Good', moderate: 'Moderate', limit: 'Limit',
}

/** Analyse one food. `calories` may be 0 if unknown (score still uses groups). */
export function analyzeFood(name: string, calories: number, given?: Partial<Macros & Micros>): FoodHealth {
  const t = foodTags(name)
  const macros: Macros = {
    protein: given?.protein ?? estimateMacros(name, calories).protein,
    carbs: given?.carbs ?? estimateMacros(name, calories).carbs,
    fat: given?.fat ?? estimateMacros(name, calories).fat,
  }
  const baseMicros = estimateMicros(name, calories, macros)
  const micros: Micros = {
    fiber: given?.fiber ?? baseMicros.fiber,
    sugar: given?.sugar ?? baseMicros.sugar,
    sodium: given?.sodium ?? baseMicros.sodium,
    satFat: given?.satFat ?? baseMicros.satFat,
  }
  const kcal = calories || macros.protein * 4 + macros.carbs * 4 + macros.fat * 9 || 1
  const proteinDensity = (macros.protein / kcal) * 100

  let score = 58
  const pros: string[] = []
  const cons: string[] = []
  const labels: string[] = []

  // —— Food-group rewards (Indian context) ——
  if (t.leafyGreen) { score += 20; pros.push('Leafy greens — iron, folate & fibre'); labels.push('Leafy greens') }
  else if (t.vegetable) { score += 15; pros.push('Vegetables add fibre & micronutrients'); labels.push('Veg-rich') }
  if (t.legume) { score += 17; pros.push('Dal/legume — plant protein + fibre'); labels.push('Legume') }
  if (t.wholeGrain) { score += 15; pros.push('Whole grain / millet — slow carbs & fibre'); labels.push('Whole grain') }
  if (t.leanProtein) { score += 14; pros.push('Good protein source'); labels.push('Protein') }
  if (t.dairy && !t.sugaryDrink) { score += 9; pros.push('Dairy — protein, calcium, probiotics') }
  if (t.fruit && !t.sweet) { score += 11; pros.push('Whole fruit — vitamins & fibre'); labels.push('Fruit') }
  if (t.nutsSeeds) { score += 6; pros.push('Nuts/seeds — healthy fats') }

  // —— Cooking method ——
  if (t.fermented || t.steamed) { score += 11; pros.push('Steamed/fermented — light, gut-friendly'); labels.push('Steamed') }
  else if (t.grilled) { score += 7; pros.push('Grilled/roasted — minimal oil') }
  if (t.raw && !t.fruit) { score += 6 }

  // —— Penalties ——
  if (t.fried) { score -= 28; cons.push('Deep-fried — high in oil & calories'); labels.push('Deep-fried') }
  if (t.sweet) { score -= 26; cons.push('Sweet — high free sugar'); labels.push('Sugary') }
  if (t.sugaryDrink) { score -= 22; cons.push('Sugary drink — liquid calories'); labels.push('Sugary drink') }
  if (t.refinedGrain && !t.wholeGrain) { score -= 9; cons.push('Refined grain (maida/white) — low fibre') }
  if (t.saltBomb) { score -= 12; cons.push('Very salty — watch sodium'); labels.push('High sodium') }

  // —— Nutrient-quality adjustments (from estimated/real numbers) ——
  if (proteinDensity >= 9) { score += 12; if (!labels.includes('Protein')) labels.push('High protein') }
  else if (proteinDensity >= 6) score += 6
  if (micros.fiber >= 6) { score += 8; pros.push(`High fibre (~${micros.fiber}g)`) }
  else if (micros.fiber >= 3) score += 4
  if (micros.sugar >= 18) { score -= 12; if (!cons.some((c) => /sugar/i.test(c))) cons.push(`High sugar (~${micros.sugar}g)`) }
  else if (micros.sugar >= 10) score -= 6
  if (micros.sodium >= 700) { score -= 10; if (!labels.includes('High sodium')) { labels.push('High sodium'); cons.push(`High sodium (~${micros.sodium}mg)`) } }
  else if (micros.sodium >= 450) score -= 5
  if (micros.satFat >= 9) { score -= 10; cons.push(`High saturated fat (~${micros.satFat}g)`) }
  else if (micros.satFat >= 5) score -= 5

  score = Math.max(2, Math.min(100, Math.round(score)))
  if (!pros.length && score >= 55) pros.push('Balanced, reasonable choice')
  if (!cons.length && score < 55) cons.push('Light on protein & fibre')

  return {
    macros, micros, proteinDensity: +proteinDensity.toFixed(1),
    score, grade: GRADE(score), band: BAND(score),
    pros, cons, labels: labels.slice(0, 3), tags: t,
  }
}

/**
 * Like analyzeFood, but first tries Open Food Facts for *real* micronutrients,
 * scaled from per-100g to this food's calories. Falls back to the pure engine
 * when there's no match or no network. `enriched` flags when DB data was used.
 */
export async function enrichFood(name: string, calories: number, given?: Partial<Macros & Micros>): Promise<FoodHealth> {
  try {
    const off = await fetchNutrients(name)
    if (off && off.kcal > 0 && calories > 0) {
      const f = calories / off.kcal // scale per-100g → this serving's calories
      const refined: Partial<Macros & Micros> = {
        protein: given?.protein ?? Math.round(off.protein * f),
        carbs: given?.carbs ?? Math.round(off.carbs * f),
        fat: given?.fat ?? Math.round(off.fat * f),
        fiber: Math.round(off.fiber * f),
        sugar: Math.round(off.sugar * f),
        sodium: Math.round(off.sodium * f),
        satFat: Math.round(off.satFat * f),
      }
      const a = analyzeFood(name, calories, refined)
      a.enriched = true
      return a
    }
  } catch { /* fall through to engine */ }
  return analyzeFood(name, calories, given)
}

// ————————————————————————————————————————————————————————————————
//  Whole-day report card
// ————————————————————————————————————————————————————————————————

export interface DayTargets { calories: number; protein: number; carbs: number; fat: number }
export interface DayMeal {
  name: string; calories: number; protein?: number; carbs?: number; fat?: number
  // optional DB-refined micros (from enrichFood)
  fiber?: number; sugar?: number; sodium?: number; satFat?: number
}

export type MetricStatus = 'good' | 'low' | 'high' | 'warn'
export interface DayMetric {
  key: string
  label: string
  value: number
  unit: string
  target?: number
  status: MetricStatus
  detail: string
}
export interface DayReport {
  score: number
  grade: Grade
  band: Band
  summary: string
  metrics: DayMetric[]
  coaching: string[]
  totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; sodium: number; satFat: number }
  groups: { veg: boolean; fruit: boolean; legume: boolean; wholeGrain: boolean; dairy: boolean; protein: boolean }
}

/**
 * Grade a full day. Uses each meal's logged P/C/F when present and estimates
 * fibre/sugar/sodium/sat-fat + food groups from the food name. Day score blends
 * the calorie-weighted average food quality with how well protein, fibre,
 * vegetables/fruit and sugar/sodium land against sensible targets.
 */
export function dayReport(meals: DayMeal[], tgt: DayTargets, sex: 'male' | 'female' = 'male'): DayReport {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, satFat: 0 }
  const groups = { veg: false, fruit: false, legume: false, wholeGrain: false, dairy: false, protein: false }
  let weightedScore = 0
  let weight = 0

  for (const meal of meals) {
    const a = analyzeFood(meal.name, meal.calories, {
      protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
      fiber: meal.fiber, sugar: meal.sugar, sodium: meal.sodium, satFat: meal.satFat,
    })
    totals.calories += meal.calories || 0
    totals.protein += meal.protein ?? a.macros.protein
    totals.carbs += meal.carbs ?? a.macros.carbs
    totals.fat += meal.fat ?? a.macros.fat
    totals.fiber += a.micros.fiber
    totals.sugar += a.micros.sugar
    totals.sodium += a.micros.sodium
    totals.satFat += a.micros.satFat
    const w = Math.max(40, meal.calories || 60)
    weightedScore += a.score * w
    weight += w
    if (a.tags.vegetable || a.tags.leafyGreen) groups.veg = true
    if (a.tags.fruit) groups.fruit = true
    if (a.tags.legume) groups.legume = true
    if (a.tags.wholeGrain) groups.wholeGrain = true
    if (a.tags.dairy) groups.dairy = true
    if (a.tags.leanProtein || a.tags.legume || a.tags.dairy) groups.protein = true
  }
  Object.keys(totals).forEach((k) => ((totals as Record<string, number>)[k] = Math.round((totals as Record<string, number>)[k])))

  // Targets for the nutrients that don't have an explicit user target
  const fiberTarget = Math.round((tgt.calories / 1000) * 14) // 14 g per 1000 kcal (Dietary Guidelines)
  const sugarLimit = Math.round((tgt.calories * 0.1) / 4) // WHO free-sugar < 10% energy
  const sodiumLimit = 2300 // mg, FDA/WHO daily
  const satFatLimit = Math.round((tgt.calories * 0.1) / 9) // < 10% energy

  const pct = (v: number, t: number) => (t ? v / t : 0)
  const metrics: DayMetric[] = []
  const coaching: string[] = []

  // Calories
  const calP = pct(totals.calories, tgt.calories)
  metrics.push({
    key: 'calories', label: 'Calories', value: totals.calories, unit: 'kcal', target: tgt.calories,
    status: calP > 1.08 ? 'high' : calP < 0.6 && meals.length ? 'low' : 'good',
    detail: calP > 1.08 ? `${totals.calories - tgt.calories} over target` : `${Math.max(0, tgt.calories - totals.calories)} kcal left`,
  })

  // Protein
  const protP = pct(totals.protein, tgt.protein)
  metrics.push({
    key: 'protein', label: 'Protein', value: totals.protein, unit: 'g', target: tgt.protein,
    status: protP >= 0.9 ? 'good' : 'low',
    detail: protP >= 0.9 ? 'On target — protects muscle' : `${Math.max(0, tgt.protein - totals.protein)}g short`,
  })
  if (protP < 0.9 && meals.length) coaching.push(`Add ~${Math.max(0, tgt.protein - totals.protein)}g protein — eggs, curd, paneer, dal, chicken or fish.`)

  // Fibre
  metrics.push({
    key: 'fiber', label: 'Fibre', value: totals.fiber, unit: 'g', target: fiberTarget,
    status: totals.fiber >= fiberTarget * 0.9 ? 'good' : 'low',
    detail: totals.fiber >= fiberTarget * 0.9 ? 'Great for digestion & satiety' : `Aim for ~${fiberTarget}g`,
  })
  if (totals.fiber < fiberTarget * 0.9 && meals.length) coaching.push('Boost fibre with a vegetable poriyal/sabzi, dal, salad or fruit.')

  // Sugar
  metrics.push({
    key: 'sugar', label: 'Free sugar', value: totals.sugar, unit: 'g', target: sugarLimit,
    status: totals.sugar > sugarLimit ? 'high' : 'good',
    detail: totals.sugar > sugarLimit ? `Over the ~${sugarLimit}g free-sugar guide` : 'Within a healthy range',
  })
  if (totals.sugar > sugarLimit) coaching.push('Sugar is high today — go easy on sweets and sweetened drinks.')

  // Sodium
  metrics.push({
    key: 'sodium', label: 'Sodium', value: totals.sodium, unit: 'mg', target: sodiumLimit,
    status: totals.sodium > sodiumLimit ? 'high' : 'good',
    detail: totals.sodium > sodiumLimit ? 'Above 2300mg — limit pickle/papad/fried' : 'Within daily limit',
  })
  if (totals.sodium > sodiumLimit) coaching.push('Cut back on pickle, papad and fried snacks to lower sodium.')

  // Saturated fat
  metrics.push({
    key: 'satFat', label: 'Sat. fat', value: totals.satFat, unit: 'g', target: satFatLimit,
    status: totals.satFat > satFatLimit ? 'high' : 'good',
    detail: totals.satFat > satFatLimit ? 'High — limit fried, ghee & coconut-heavy items' : 'Within a healthy range',
  })

  // Food-group gaps
  if (meals.length) {
    if (!groups.veg) coaching.push('No vegetables yet — add a poriyal, kootu, sabzi or salad.')
    if (!groups.fruit) coaching.push('Add a fruit (banana, guava, apple) for vitamins & fibre.')
    if (!groups.dairy && totals.protein < tgt.protein) coaching.push('A cup of curd or buttermilk adds easy protein & probiotics.')
  }

  // —— Day score ——
  let score = weight ? weightedScore / weight : 60
  // nudge by how the headline targets land
  score += protP >= 0.9 ? 6 : -6
  score += totals.fiber >= fiberTarget * 0.9 ? 4 : -4
  score += groups.veg ? 3 : -4
  score += groups.fruit ? 2 : 0
  score += totals.sugar > sugarLimit ? -5 : 2
  score += totals.sodium > sodiumLimit ? -4 : 0
  score += calP > 1.08 ? -5 : 0
  if (!meals.length) score = 0
  score = Math.max(0, Math.min(100, Math.round(score)))

  const grade = GRADE(score)
  const band = BAND(score)
  const summary = !meals.length
    ? 'Log your meals to see today’s nutrition grade.'
    : band === 'great' ? 'Excellent day — balanced, protein-rich and nutrient-dense. 💪'
    : band === 'good' ? 'Solid day. A small tweak or two and it’s top-tier.'
    : band === 'moderate' ? 'Decent, but there’s room to balance it better.'
    : 'Heavy on the less-healthy stuff today — let’s rebalance.'

  if (!coaching.length && meals.length) coaching.push('Nicely balanced — keep it up. 🎯')

  return { score, grade, band, summary, metrics, coaching: coaching.slice(0, 5), totals, groups }
}
