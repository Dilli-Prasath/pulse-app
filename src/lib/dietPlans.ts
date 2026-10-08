import { MealType } from './types'
import { Program } from './programs'

/**
 * Comprehensive STATIC Indian diet plans (no API needed). Each plan has a full
 * day of meals with calories + macros (protein/carbs/fat). Values are typical
 * per-serving figures for common Indian foods. Users can apply a plan to today
 * with one tap, then review & edit before saving.
 */
export interface PlanItem { meal: MealType; name: string; calories: number; protein: number; carbs: number; fat: number }
export type DietGoal = 'Fat loss' | 'Maintenance' | 'Muscle gain' | 'Endurance'
export interface DietPlan {
  id: string
  name: string
  veg: boolean
  goal: DietGoal
  region: string
  blurb: string
  items: PlanItem[]
}

export const DIET_PLANS: DietPlan[] = [
  {
    id: 'veg_cut', name: 'Indian Veg · Fat Loss', veg: true, goal: 'Fat loss', region: 'North/South India',
    blurb: 'High-protein vegetarian deficit (~1700 kcal). Dal, paneer, curd & veggies.',
    items: [
      { meal: 'breakfast', name: '3 Idli + sambar', calories: 240, protein: 9, carbs: 44, fat: 3 },
      { meal: 'breakfast', name: 'Coconut chutney (2 tbsp)', calories: 90, protein: 2, carbs: 4, fat: 8 },
      { meal: 'lunch', name: '2 Roti', calories: 208, protein: 6, carbs: 36, fat: 4 },
      { meal: 'lunch', name: 'Dal (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 1 },
      { meal: 'lunch', name: 'Mixed veg sabzi (1 cup)', calories: 110, protein: 4, carbs: 14, fat: 5 },
      { meal: 'lunch', name: 'Curd (1 cup)', calories: 100, protein: 9, carbs: 12, fat: 3 },
      { meal: 'snack', name: 'Roasted chana (30g)', calories: 120, protein: 7, carbs: 18, fat: 2 },
      { meal: 'snack', name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
      { meal: 'dinner', name: 'Paneer bhurji (100g paneer)', calories: 265, protein: 18, carbs: 6, fat: 20 },
      { meal: 'dinner', name: '1 Roti + salad', calories: 150, protein: 5, carbs: 24, fat: 3 },
    ],
  },
  {
    id: 'veg_gain', name: 'Indian Veg · Muscle Gain', veg: true, goal: 'Muscle gain', region: 'North India',
    blurb: 'Vegetarian surplus (~2700 kcal) with whey, paneer, rajma & milk.',
    items: [
      { meal: 'breakfast', name: 'Oats (50g) + milk + banana', calories: 350, protein: 14, carbs: 55, fat: 7 },
      { meal: 'breakfast', name: 'Whey scoop', calories: 120, protein: 24, carbs: 3, fat: 1 },
      { meal: 'lunch', name: '3 Roti', calories: 312, protein: 9, carbs: 54, fat: 6 },
      { meal: 'lunch', name: 'Rajma (1 cup)', calories: 230, protein: 13, carbs: 38, fat: 3 },
      { meal: 'lunch', name: 'Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0 },
      { meal: 'lunch', name: 'Curd (1 cup)', calories: 100, protein: 9, carbs: 12, fat: 3 },
      { meal: 'snack', name: 'Peanut butter sandwich', calories: 350, protein: 13, carbs: 38, fat: 17 },
      { meal: 'snack', name: 'Milk (1 glass)', calories: 150, protein: 8, carbs: 12, fat: 8 },
      { meal: 'dinner', name: 'Paneer curry (150g)', calories: 400, protein: 27, carbs: 12, fat: 28 },
      { meal: 'dinner', name: '2 Roti', calories: 208, protein: 6, carbs: 36, fat: 4 },
    ],
  },
  {
    id: 'nonveg_protein', name: 'Indian Non-Veg · High Protein', veg: false, goal: 'Maintenance', region: 'Pan-India',
    blurb: 'Chicken, eggs & fish forward (~2200 kcal, ~180g protein).',
    items: [
      { meal: 'breakfast', name: '3 Boiled eggs', calories: 234, protein: 18, carbs: 3, fat: 15 },
      { meal: 'breakfast', name: '2 Brown bread toast', calories: 160, protein: 8, carbs: 28, fat: 2 },
      { meal: 'lunch', name: 'Chicken curry (150g)', calories: 320, protein: 30, carbs: 8, fat: 18 },
      { meal: 'lunch', name: 'Rice (1.5 cup)', calories: 308, protein: 6, carbs: 68, fat: 0 },
      { meal: 'lunch', name: 'Curd (1 cup)', calories: 100, protein: 9, carbs: 12, fat: 3 },
      { meal: 'snack', name: 'Whey scoop + water', calories: 120, protein: 24, carbs: 3, fat: 1 },
      { meal: 'snack', name: 'Handful almonds', calories: 164, protein: 6, carbs: 6, fat: 14 },
      { meal: 'dinner', name: 'Grilled fish (150g)', calories: 280, protein: 39, carbs: 0, fat: 13 },
      { meal: 'dinner', name: '2 Roti + salad', calories: 250, protein: 7, carbs: 40, fat: 6 },
    ],
  },
  {
    id: 'south_balanced', name: 'South Indian · Balanced', veg: true, goal: 'Maintenance', region: 'Tamil Nadu / South',
    blurb: 'Classic Tamil meals (~2100 kcal): dosa, sambar, rasam, curd rice.',
    items: [
      { meal: 'breakfast', name: '2 Dosa + sambar', calories: 336, protein: 8, carbs: 58, fat: 8 },
      { meal: 'breakfast', name: 'Filter coffee', calories: 90, protein: 3, carbs: 12, fat: 3 },
      { meal: 'lunch', name: 'Rice (1.5 cup)', calories: 308, protein: 6, carbs: 68, fat: 0 },
      { meal: 'lunch', name: 'Sambar (1 cup)', calories: 140, protein: 7, carbs: 20, fat: 4 },
      { meal: 'lunch', name: 'Rasam (1 cup)', calories: 65, protein: 3, carbs: 11, fat: 1 },
      { meal: 'lunch', name: 'Poriyal (veg, 1 cup)', calories: 120, protein: 4, carbs: 14, fat: 6 },
      { meal: 'snack', name: '2 Medu vada', calories: 280, protein: 8, carbs: 30, fat: 14 },
      { meal: 'dinner', name: 'Curd rice (1.5 cup)', calories: 345, protein: 10, carbs: 57, fat: 8 },
      { meal: 'dinner', name: 'Pickle + papad', calories: 90, protein: 2, carbs: 12, fat: 4 },
    ],
  },
  {
    id: 'veg_maintain', name: 'Indian Veg · Maintenance', veg: true, goal: 'Maintenance', region: 'Pan-India',
    blurb: 'Balanced vegetarian day (~2000 kcal) for steady weight.',
    items: [
      { meal: 'breakfast', name: 'Poha (1 plate)', calories: 250, protein: 5, carbs: 40, fat: 8 },
      { meal: 'breakfast', name: 'Greek yogurt (170g)', calories: 100, protein: 17, carbs: 6, fat: 0 },
      { meal: 'lunch', name: '2 Roti + dal + sabzi', calories: 440, protein: 20, carbs: 62, fat: 10 },
      { meal: 'lunch', name: 'Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0 },
      { meal: 'snack', name: 'Fruit + nuts', calories: 220, protein: 5, carbs: 28, fat: 11 },
      { meal: 'dinner', name: 'Palak paneer (1 cup)', calories: 300, protein: 14, carbs: 12, fat: 22 },
      { meal: 'dinner', name: '2 Roti', calories: 208, protein: 6, carbs: 36, fat: 4 },
    ],
  },
  {
    id: 'south_cut', name: 'South Indian Veg · Fat Loss', veg: true, goal: 'Fat loss', region: 'Tamil Nadu / canteen-friendly',
    blurb: 'Idli, sambar, sundal, keerai & chapathi (~1550 kcal). Easy to follow from the office canteen.',
    items: [
      { meal: 'breakfast', name: '3 Idli + sambar', calories: 240, protein: 9, carbs: 44, fat: 3 },
      { meal: 'breakfast', name: 'Buttermilk (1 glass)', calories: 40, protein: 3, carbs: 5, fat: 1 },
      { meal: 'lunch', name: 'Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0 },
      { meal: 'lunch', name: 'Sambar (1 cup)', calories: 140, protein: 7, carbs: 20, fat: 4 },
      { meal: 'lunch', name: 'Keerai / poriyal (1 cup)', calories: 120, protein: 4, carbs: 14, fat: 6 },
      { meal: 'lunch', name: 'Curd (1 cup)', calories: 100, protein: 9, carbs: 12, fat: 3 },
      { meal: 'snack', name: 'Chana sundal (1 cup)', calories: 210, protein: 11, carbs: 35, fat: 3 },
      { meal: 'snack', name: 'Guava', calories: 68, protein: 3, carbs: 14, fat: 1 },
      { meal: 'dinner', name: '2 Chapathi', calories: 208, protein: 6, carbs: 36, fat: 4 },
      { meal: 'dinner', name: 'Moong dal (1 cup)', calories: 180, protein: 12, carbs: 30, fat: 1 },
      { meal: 'dinner', name: 'Cucumber salad', calories: 30, protein: 1, carbs: 6, fat: 0 },
    ],
  },
  {
    id: 'nonveg_cut', name: 'Indian Non-Veg · Fat Loss', veg: false, goal: 'Fat loss', region: 'Pan-India',
    blurb: 'Eggs, grilled chicken & fish keep you full on ~1650 kcal with ~150 g protein.',
    items: [
      { meal: 'breakfast', name: 'Omelette (1 egg + 3 whites)', calories: 140, protein: 17, carbs: 2, fat: 6 },
      { meal: 'breakfast', name: '2 Idli + sambar', calories: 180, protein: 7, carbs: 33, fat: 2 },
      { meal: 'lunch', name: 'Tandoori / grilled chicken (150g)', calories: 250, protein: 38, carbs: 3, fat: 9 },
      { meal: 'lunch', name: 'Rice (1 cup)', calories: 205, protein: 4, carbs: 45, fat: 0 },
      { meal: 'lunch', name: 'Rasam (1 cup)', calories: 65, protein: 3, carbs: 11, fat: 1 },
      { meal: 'lunch', name: 'Poriyal (veg, 1 cup)', calories: 120, protein: 4, carbs: 14, fat: 6 },
      { meal: 'snack', name: 'Hung curd / Greek yogurt (150g)', calories: 90, protein: 15, carbs: 6, fat: 0 },
      { meal: 'snack', name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
      { meal: 'dinner', name: 'Fish curry (150g)', calories: 250, protein: 32, carbs: 6, fat: 11 },
      { meal: 'dinner', name: '2 Chapathi', calories: 208, protein: 6, carbs: 36, fat: 4 },
      { meal: 'dinner', name: 'Cucumber salad', calories: 30, protein: 1, carbs: 6, fat: 0 },
    ],
  },
  {
    id: 'nonveg_gain', name: 'Indian Non-Veg · Lean Bulk', veg: false, goal: 'Muscle gain', region: 'Pan-India',
    blurb: 'Surplus (~2750 kcal) with eggs, chicken, dal & whey — ~175 g protein.',
    items: [
      { meal: 'breakfast', name: '4-egg omelette + 2 toast', calories: 472, protein: 31, carbs: 30, fat: 23 },
      { meal: 'breakfast', name: 'Banana + milk (1 glass)', calories: 270, protein: 9, carbs: 39, fat: 8 },
      { meal: 'lunch', name: 'Rice (1.5 cup)', calories: 308, protein: 6, carbs: 68, fat: 0 },
      { meal: 'lunch', name: 'Chicken curry (200g)', calories: 420, protein: 40, carbs: 10, fat: 24 },
      { meal: 'lunch', name: 'Dal (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 1 },
      { meal: 'lunch', name: 'Curd (1 cup)', calories: 100, protein: 9, carbs: 12, fat: 3 },
      { meal: 'snack', name: 'Whey + banana', calories: 225, protein: 25, carbs: 30, fat: 1 },
      { meal: 'snack', name: 'Roasted peanuts (30g)', calories: 170, protein: 7, carbs: 5, fat: 14 },
      { meal: 'dinner', name: '3 Chapathi', calories: 312, protein: 9, carbs: 54, fat: 6 },
      { meal: 'dinner', name: 'Egg curry (2 eggs)', calories: 220, protein: 13, carbs: 8, fat: 15 },
      { meal: 'dinner', name: 'Salad', calories: 30, protein: 1, carbs: 6, fat: 0 },
    ],
  },
  {
    id: 'runner', name: "Runner's Fuel · Endurance", veg: true, goal: 'Endurance', region: 'South India',
    blurb: 'Carb-forward (~2100 kcal) for running & sports — dosa, rice, sundal, dates, beetroot.',
    items: [
      { meal: 'breakfast', name: '2 Dosa + sambar', calories: 336, protein: 8, carbs: 58, fat: 8 },
      { meal: 'breakfast', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
      { meal: 'lunch', name: 'Rice (1.5 cup)', calories: 308, protein: 6, carbs: 68, fat: 0 },
      { meal: 'lunch', name: 'Sambar (1 cup)', calories: 140, protein: 7, carbs: 20, fat: 4 },
      { meal: 'lunch', name: 'Beetroot poriyal (1 cup)', calories: 110, protein: 3, carbs: 16, fat: 5 },
      { meal: 'lunch', name: 'Curd (1 cup)', calories: 100, protein: 9, carbs: 12, fat: 3 },
      { meal: 'snack', name: 'Dates (3) — pre-run', calories: 66, protein: 1, carbs: 18, fat: 0 },
      { meal: 'snack', name: 'Buttermilk + pinch of salt — post-run', calories: 40, protein: 3, carbs: 5, fat: 1 },
      { meal: 'snack', name: 'Chana sundal (1 cup)', calories: 210, protein: 11, carbs: 35, fat: 3 },
      { meal: 'dinner', name: 'Vegetable upma / poha (1 plate)', calories: 250, protein: 6, carbs: 42, fat: 7 },
      { meal: 'dinner', name: 'Paneer bhurji (100g paneer)', calories: 265, protein: 18, carbs: 6, fat: 20 },
      { meal: 'dinner', name: 'Milk (1 glass)', calories: 150, protein: 8, carbs: 12, fat: 8 },
    ],
  },

]

export function planTotals(p: DietPlan) {
  return p.items.reduce((a, it) => ({
    calories: a.calories + it.calories, protein: a.protein + it.protein, carbs: a.carbs + it.carbs, fat: a.fat + it.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

/** Which kind of diet a goal program needs. */
export function dietGoalFor(p: Program): DietGoal {
  if (p.id === 'run_endurance') return 'Endurance'
  if (p.kcalDelta <= -100) return 'Fat loss'
  if (p.kcalDelta >= 100) return 'Muscle gain'
  return 'Maintenance'
}

/**
 * Best static plan for a program: same goal first, then the closest calories to
 * the program's own daily target, then the most protein per 100 kcal.
 */
export function bestDietFor(p: Program, kcalTarget: number, veg?: boolean): DietPlan {
  const goal = dietGoalFor(p)
  const pool = DIET_PLANS.filter((d) => veg === undefined || d.veg === veg)
  const score = (d: DietPlan) => {
    const t = planTotals(d)
    return (d.goal === goal ? 0 : 1000) + Math.abs(t.calories - kcalTarget) - (t.protein / t.calories) * 400
  }
  return [...pool].sort((a, b) => score(a) - score(b))[0]
}
