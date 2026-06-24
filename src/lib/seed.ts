import { AppData } from './types'
import { INDIAN_FOOD_DB } from './foodDb'

export const today = () => new Date().toISOString().slice(0, 10)
export const uid = () => Math.random().toString(36).slice(2, 9)

export const BUILT_IN_ROUTINES = [
  {
    id: 'r_push', name: 'Push Day', focus: 'Chest · Shoulders · Triceps', color: '#8b5cff', builtIn: true,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
      { name: 'Overhead Press', sets: 3, reps: 8 },
      { name: 'Lateral Raise', sets: 3, reps: 15 },
      { name: 'Triceps Pushdown', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'r_pull', name: 'Pull Day', focus: 'Back · Biceps', color: '#22e3ff', builtIn: true,
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 6 },
      { name: 'Pull Up', sets: 3, reps: 10 },
      { name: 'Bent Over Row', sets: 3, reps: 10 },
      { name: 'Lat Pulldown', sets: 3, reps: 12 },
      { name: 'Biceps Curl', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'r_legs', name: 'Leg Day', focus: 'Quads · Hamstrings · Glutes', color: '#2bffb0', builtIn: true,
    exercises: [
      { name: 'Squat', sets: 4, reps: 8 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Leg Curl', sets: 3, reps: 12 },
      { name: 'Calf Raise', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'r_full', name: 'Fat-Burn Full Body', focus: 'Conditioning · Weight loss', color: '#ff4fd8', builtIn: true,
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: 12 },
      { name: 'Push Up', sets: 3, reps: 15 },
      { name: 'Dumbbell Row', sets: 3, reps: 12 },
      { name: 'Walking Lunge', sets: 3, reps: 20 },
      { name: 'Plank', sets: 3, reps: 1 },
    ],
  },
]

/**
 * A brand-new, EMPTY account. No demo data — every value is filled in by the
 * user through onboarding and by logging. `onboarded: false` triggers the
 * onboarding wizard on first sign-in.
 */
export function emptyAccount(): AppData {
  return {
    profile: {
      name: '', sex: 'male', age: 30, heightCm: 175,
      startWeight: 0, targetWeight: 0, activity: 1.375, goalRate: 0.5,
      avatar: '#8b5cff', onboarded: false,
    },
    weights: [],
    workouts: [],
    meals: [],
    friends: [],
    routines: [],
    inbody: [],
    water: [],
    measurements: [],
    customFoods: [],
    menus: {},
    settings: { accent: 'aurora', weightUnit: 'kg', exerciseSource: 'auto', foodSource: 'auto', waterTargetMl: 3000 },
    // Private by default — nothing is shared with teammates until you opt in.
    sharing: { enabled: false, pages: { dashboard: false, workouts: false, nutrition: false, body: false } },
  }
}

// Backwards-compatible alias used across the app.
export const seed = emptyAccount

// Common foods database (per typical serving)
export interface FoodItem { name: string; serving: string; calories: number; protein: number; carbs: number; fat: number }

const BASE_FOOD_DB: FoodItem[] = [
  { name: 'Grilled Chicken Breast', serving: '150g', calories: 248, protein: 46, carbs: 0, fat: 5 },
  { name: 'White Rice (cooked)', serving: '1 cup', calories: 205, protein: 4, carbs: 45, fat: 0 },
  { name: 'Brown Rice (cooked)', serving: '1 cup', calories: 218, protein: 5, carbs: 46, fat: 2 },
  { name: 'Roti / Chapati', serving: '1 piece', calories: 104, protein: 3, carbs: 18, fat: 2 },
  { name: 'Dal (lentils)', serving: '1 cup', calories: 230, protein: 18, carbs: 40, fat: 1 },
  { name: 'Paneer', serving: '100g', calories: 265, protein: 18, carbs: 4, fat: 21 },
  { name: 'Idli', serving: '2 pieces', calories: 116, protein: 4, carbs: 24, fat: 1 },
  { name: 'Dosa (plain)', serving: '1 piece', calories: 168, protein: 4, carbs: 29, fat: 4 },
  { name: 'Boiled Egg', serving: '1 large', calories: 78, protein: 6, carbs: 1, fat: 5 },
  { name: 'Oats (dry)', serving: '50g', calories: 190, protein: 7, carbs: 33, fat: 3 },
  { name: 'Banana', serving: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Apple', serving: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Whey Protein Scoop', serving: '30g', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: 'Greek Yogurt', serving: '170g', calories: 100, protein: 17, carbs: 6, fat: 0 },
  { name: 'Almonds', serving: '28g', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Peanut Butter', serving: '2 tbsp', calories: 188, protein: 8, carbs: 6, fat: 16 },
  { name: 'Salmon', serving: '150g', calories: 280, protein: 39, carbs: 0, fat: 13 },
  { name: 'Sweet Potato', serving: '1 medium', calories: 112, protein: 2, carbs: 26, fat: 0 },
  { name: 'Broccoli', serving: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 1 },
  { name: 'Chicken Biryani', serving: '1 plate', calories: 490, protein: 22, carbs: 62, fat: 16 },

  // ---- South Indian / Tamil Nadu ----
  { name: 'Idli', serving: '2 pcs', calories: 116, protein: 4, carbs: 24, fat: 1 },
  { name: 'Plain Dosa', serving: '1 pc', calories: 168, protein: 4, carbs: 29, fat: 4 },
  { name: 'Masala Dosa', serving: '1 pc', calories: 290, protein: 6, carbs: 45, fat: 9 },
  { name: 'Ghee Roast Dosa', serving: '1 pc', calories: 330, protein: 6, carbs: 44, fat: 14 },
  { name: 'Medu Vada', serving: '2 pcs', calories: 280, protein: 8, carbs: 30, fat: 14 },
  { name: 'Pongal', serving: '1 cup', calories: 280, protein: 8, carbs: 42, fat: 9 },
  { name: 'Ven Pongal', serving: '1 cup', calories: 300, protein: 8, carbs: 40, fat: 12 },
  { name: 'Rava Upma', serving: '1 cup', calories: 250, protein: 6, carbs: 38, fat: 8 },
  { name: 'Sambar', serving: '1 cup', calories: 140, protein: 7, carbs: 20, fat: 4 },
  { name: 'Rasam', serving: '1 cup', calories: 65, protein: 3, carbs: 11, fat: 1 },
  { name: 'Curd Rice', serving: '1 cup', calories: 230, protein: 7, carbs: 38, fat: 5 },
  { name: 'Lemon Rice', serving: '1 cup', calories: 290, protein: 5, carbs: 48, fat: 9 },
  { name: 'Tamarind Rice', serving: '1 cup', calories: 320, protein: 5, carbs: 52, fat: 10 },
  { name: 'Coconut Chutney', serving: '2 tbsp', calories: 90, protein: 2, carbs: 4, fat: 8 },
  { name: 'Parotta', serving: '1 pc', calories: 260, protein: 6, carbs: 36, fat: 10 },
  { name: 'Chicken Chettinad', serving: '1 cup', calories: 320, protein: 28, carbs: 9, fat: 19 },
  { name: 'Egg Dosa', serving: '1 pc', calories: 230, protein: 9, carbs: 29, fat: 9 },
  { name: 'Uttapam', serving: '1 pc', calories: 200, protein: 5, carbs: 32, fat: 6 },
  { name: 'Filter Coffee (with milk+sugar)', serving: '1 cup', calories: 90, protein: 3, carbs: 12, fat: 3 },

  // ---- North Indian / common ----
  { name: 'Chapati / Roti', serving: '1 pc', calories: 104, protein: 3, carbs: 18, fat: 2 },
  { name: 'Plain Naan', serving: '1 pc', calories: 260, protein: 9, carbs: 45, fat: 5 },
  { name: 'Rajma', serving: '1 cup', calories: 230, protein: 13, carbs: 38, fat: 3 },
  { name: 'Chana Masala', serving: '1 cup', calories: 270, protein: 12, carbs: 40, fat: 7 },
  { name: 'Palak Paneer', serving: '1 cup', calories: 300, protein: 14, carbs: 12, fat: 22 },
  { name: 'Butter Chicken', serving: '1 cup', calories: 430, protein: 30, carbs: 12, fat: 28 },
  { name: 'Veg Pulao', serving: '1 cup', calories: 280, protein: 6, carbs: 45, fat: 8 },
  { name: 'Aloo Paratha', serving: '1 pc', calories: 290, protein: 6, carbs: 42, fat: 10 },
  { name: 'Poha', serving: '1 cup', calories: 250, protein: 5, carbs: 40, fat: 8 },
  { name: 'Roti + Dal (meal)', serving: '2 roti + 1 cup', calories: 440, protein: 20, carbs: 70, fat: 9 },
]

/**
 * Full searchable food list = base foods + the large Indian / Tamil Nadu /
 * Bangladeshi / hotel database, de-duplicated by name (first match wins).
 */
function dedupeFoods(list: FoodItem[]): FoodItem[] {
  const seen = new Set<string>()
  const out: FoodItem[] = []
  for (const f of list) {
    const k = f.name.toLowerCase().trim()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(f)
  }
  return out
}
export const FOOD_DB: FoodItem[] = dedupeFoods([...BASE_FOOD_DB, ...INDIAN_FOOD_DB])
