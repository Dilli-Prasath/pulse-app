import { MealType } from './types'

/**
 * Comprehensive STATIC Indian diet plans (no API needed). Each plan has a full
 * day of meals with calories + macros (protein/carbs/fat). Values are typical
 * per-serving figures for common Indian foods. Users can apply a plan to today
 * with one tap, then review & edit before saving.
 */
export interface PlanItem { meal: MealType; name: string; calories: number; protein: number; carbs: number; fat: number }
export interface DietPlan {
  id: string
  name: string
  veg: boolean
  goal: 'Fat loss' | 'Maintenance' | 'Muscle gain'
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
]

export function planTotals(p: DietPlan) {
  return p.items.reduce((a, it) => ({
    calories: a.calories + it.calories, protein: a.protein + it.protein, carbs: a.carbs + it.carbs, fat: a.fat + it.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}
