import { Level } from './types'

export type Gender = 'all' | 'men' | 'women'
export interface MacroSplit { protein: number; carbs: number; fat: number } // % of calories
export interface SplitDay { day: string; focus: string }
export interface FoodList {
  protein: string[]
  carbs: string[]
  fats: string[]
  veg: string[]
  snacks: string[]
}

export interface Program {
  id: string
  name: string
  emoji: string
  gender: Gender
  level: Level
  tagline: string
  description: string
  /** kcal added (+) or removed (–) from maintenance (TDEE). */
  kcalDelta: number
  /** grams of protein per kg of bodyweight. */
  proteinPerKg: number
  macros: MacroSplit
  split: SplitDay[]
  /** exercise names (match wger images) used to seed a starter workout. */
  keyExercises: string[]
  foods: FoodList
  results: string
  color: string
}

const ABS_FOODS: FoodList = {
  protein: ['Chicken breast', 'Egg whites', 'Whey isolate', 'White fish', 'Greek yogurt (0%)'],
  carbs: ['Oats', 'Brown rice', 'Quinoa', 'Sweet potato'],
  fats: ['Almonds (small portion)', 'Olive oil', 'Chia seeds'],
  veg: ['Broccoli', 'Spinach', 'Cucumber', 'Bell peppers'],
  snacks: ['Boiled eggs', 'Protein shake', 'Apple + peanut butter (1 tbsp)'],
}

export const PROGRAMS: Program[] = [
  /* ---------------- Fat loss / cutting ---------------- */
  {
    id: 'cut', name: 'Cut · Fat Loss', emoji: '🔥', gender: 'all', level: 'Beginner',
    tagline: 'Lose fat while keeping muscle',
    description: 'A moderate calorie deficit with high protein and 4 weekly sessions mixing strength and conditioning. Built to strip fat without burning out.',
    kcalDelta: -500, proteinPerKg: 2.0, macros: { protein: 40, carbs: 35, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Full body strength' }, { day: 'Tue', focus: 'Cardio / steps' },
      { day: 'Wed', focus: 'Upper body' }, { day: 'Thu', focus: 'Rest / walk' },
      { day: 'Fri', focus: 'Lower body' }, { day: 'Sat', focus: 'HIIT 20 min' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Goblet Squat', 'Push Up', 'Dumbbell Row', 'Walking Lunge', 'Plank'],
    foods: {
      protein: ['Chicken breast', 'Eggs', 'Fish', 'Paneer / tofu', 'Whey', 'Dal'],
      carbs: ['Oats', 'Brown rice', 'Roti', 'Sweet potato', 'Fruit'],
      fats: ['Almonds', 'Olive oil', 'Peanut butter'],
      veg: ['Broccoli', 'Spinach', 'Salad greens', 'Beans'],
      snacks: ['Greek yogurt', 'Boiled eggs', 'Protein shake', 'Cucumber + hummus'],
    },
    results: 'Expect ~0.5 kg/week fat loss. Visible difference in 4–6 weeks; major change in 12 weeks.',
    color: '#22e3ff',
  },
  {
    id: 'sixpack_men', name: 'Six-Pack Abs (Men)', emoji: '🧊', gender: 'men', level: 'Intermediate',
    tagline: 'Get to single-digit visible abs',
    description: 'A tighter deficit, very high protein, daily core work and heavy compounds to reveal the abs you already have under the fat.',
    kcalDelta: -600, proteinPerKg: 2.2, macros: { protein: 45, carbs: 30, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Push + abs' }, { day: 'Tue', focus: 'Pull + abs' },
      { day: 'Wed', focus: 'HIIT + core' }, { day: 'Thu', focus: 'Legs + abs' },
      { day: 'Fri', focus: 'Full body + abs' }, { day: 'Sat', focus: 'Cardio / steps' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Bench Press', 'Pull Up', 'Squat', 'Plank', 'Hanging Leg Raise'],
    foods: ABS_FOODS,
    results: 'Abs typically show under ~12% body fat. With a 600 kcal deficit, plan 10–16 weeks depending on starting point.',
    color: '#8b5cff',
  },
  {
    id: 'sixpack_women', name: 'Toned Core (Women)', emoji: '✨', gender: 'women', level: 'Intermediate',
    tagline: 'Flat, defined midsection',
    description: 'A sustainable deficit with strong protein, core and full-body resistance plus light conditioning to reveal a toned, defined core.',
    kcalDelta: -400, proteinPerKg: 2.0, macros: { protein: 40, carbs: 35, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Lower + core' }, { day: 'Tue', focus: 'Upper + core' },
      { day: 'Wed', focus: 'Pilates / walk' }, { day: 'Thu', focus: 'Glutes + core' },
      { day: 'Fri', focus: 'Full body' }, { day: 'Sat', focus: 'Cardio' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Glute Bridge', 'Goblet Squat', 'Plank', 'Dumbbell Row', 'Walking Lunge'],
    foods: ABS_FOODS,
    results: 'Core definition usually appears under ~20–22% body fat for women. Expect noticeable change in 8–12 weeks.',
    color: '#ff4fd8',
  },

  /* ---------------- Muscle gain / bulk ---------------- */
  {
    id: 'bulk_men', name: 'Lean Bulk (Men)', emoji: '💪', gender: 'men', level: 'Intermediate',
    tagline: 'Build muscle, minimise fat',
    description: 'A controlled calorie surplus with a push/pull/legs split and progressive overload to add quality size without excess fat.',
    kcalDelta: 350, proteinPerKg: 2.0, macros: { protein: 30, carbs: 45, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Push' }, { day: 'Tue', focus: 'Pull' }, { day: 'Wed', focus: 'Legs' },
      { day: 'Thu', focus: 'Push' }, { day: 'Fri', focus: 'Pull' }, { day: 'Sat', focus: 'Legs' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Bench Press', 'Deadlift', 'Squat', 'Overhead Press', 'Bent Over Row'],
    foods: {
      protein: ['Chicken', 'Beef', 'Eggs', 'Whey', 'Paneer', 'Fish'],
      carbs: ['Rice', 'Potato', 'Oats', 'Pasta', 'Banana', 'Roti'],
      fats: ['Whole eggs', 'Nuts', 'Olive oil', 'Cheese'],
      veg: ['Broccoli', 'Mixed veg', 'Spinach'],
      snacks: ['Mass shake (oats+whey+banana)', 'Trail mix', 'Peanut butter sandwich'],
    },
    results: 'Aim for ~0.25–0.5 kg/month of mostly muscle. Beginners can gain faster. Strength up noticeably in 4–8 weeks.',
    color: '#2bffb0',
  },
  {
    id: 'glutes_women', name: 'Glutes & Lower Body (Women)', emoji: '🍑', gender: 'women', level: 'Intermediate',
    tagline: 'Build and shape glutes & legs',
    description: 'Slight surplus or maintenance with glute-focused lower-body volume twice a week plus upper-body and core balance.',
    kcalDelta: 150, proteinPerKg: 1.9, macros: { protein: 32, carbs: 43, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Glutes & hamstrings' }, { day: 'Tue', focus: 'Upper body' },
      { day: 'Wed', focus: 'Rest / walk' }, { day: 'Thu', focus: 'Quads & glutes' },
      { day: 'Fri', focus: 'Full body' }, { day: 'Sat', focus: 'Core + cardio' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Barbell Hip Thrust', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Glute Bridge', 'Walking Lunge'],
    foods: {
      protein: ['Chicken', 'Eggs', 'Greek yogurt', 'Tofu', 'Whey', 'Fish'],
      carbs: ['Rice', 'Sweet potato', 'Oats', 'Fruit', 'Quinoa'],
      fats: ['Avocado', 'Nuts', 'Olive oil'],
      veg: ['Spinach', 'Broccoli', 'Peppers'],
      snacks: ['Yogurt + berries', 'Rice cakes + PB', 'Protein smoothie'],
    },
    results: 'Visible glute/leg shape change in 8–12 weeks of progressive overload + adequate protein.',
    color: '#ff4fd8',
  },

  /* ---------------- Recomp / strength / general ---------------- */
  {
    id: 'recomp', name: 'Body Recomposition', emoji: '🔄', gender: 'all', level: 'Intermediate',
    tagline: 'Lose fat & gain muscle together',
    description: 'Eat around maintenance with very high protein and hard resistance training. Best for beginners or those returning after a break.',
    kcalDelta: 0, proteinPerKg: 2.2, macros: { protein: 40, carbs: 35, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Upper' }, { day: 'Tue', focus: 'Lower' }, { day: 'Wed', focus: 'Rest' },
      { day: 'Thu', focus: 'Upper' }, { day: 'Fri', focus: 'Lower' }, { day: 'Sat', focus: 'Conditioning' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Bench Press', 'Squat', 'Bent Over Row', 'Overhead Press', 'Romanian Deadlift'],
    foods: {
      protein: ['Chicken', 'Eggs', 'Fish', 'Whey', 'Paneer / tofu', 'Dal'],
      carbs: ['Brown rice', 'Oats', 'Potato', 'Fruit', 'Roti'],
      fats: ['Nuts', 'Olive oil', 'Whole eggs'],
      veg: ['Broccoli', 'Greens', 'Mixed veg'],
      snacks: ['Greek yogurt', 'Protein shake', 'Boiled eggs'],
    },
    results: 'Slower scale change but body looks leaner and firmer. Best results over 12–20 weeks.',
    color: '#ffcf5c',
  },
  {
    id: 'strength', name: 'Pure Strength', emoji: '🏋️', gender: 'all', level: 'Advanced',
    tagline: 'Get strong on the big lifts',
    description: 'Maintenance-plus calories and low-rep heavy compound training (5×5 style) to maximise strength on squat, bench, deadlift and press.',
    kcalDelta: 200, proteinPerKg: 1.8, macros: { protein: 30, carbs: 45, fat: 25 },
    split: [
      { day: 'Mon', focus: 'Squat + bench' }, { day: 'Tue', focus: 'Rest' },
      { day: 'Wed', focus: 'Deadlift + press' }, { day: 'Thu', focus: 'Rest' },
      { day: 'Fri', focus: 'Squat + bench (volume)' }, { day: 'Sat', focus: 'Optional accessories' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Weighted Pull Up'],
    foods: {
      protein: ['Beef', 'Chicken', 'Eggs', 'Whey', 'Fish'],
      carbs: ['Rice', 'Potato', 'Oats', 'Pasta'],
      fats: ['Whole eggs', 'Nuts', 'Olive oil'],
      veg: ['Mixed veg', 'Greens'],
      snacks: ['Shake + oats', 'Rice + chicken', 'Nuts'],
    },
    results: 'Expect steady strength PRs every 1–2 weeks for months as a beginner/intermediate.',
    color: '#8b5cff',
  },
  {
    id: 'general', name: 'General Fitness & Health', emoji: '🌿', gender: 'all', level: 'Beginner',
    tagline: 'Feel good, move well, stay healthy',
    description: 'Balanced eating at maintenance with 3 full-body sessions and daily movement. Great default if you just want to be fit and healthy.',
    kcalDelta: 0, proteinPerKg: 1.6, macros: { protein: 30, carbs: 40, fat: 30 },
    split: [
      { day: 'Mon', focus: 'Full body' }, { day: 'Tue', focus: 'Walk / mobility' },
      { day: 'Wed', focus: 'Full body' }, { day: 'Thu', focus: 'Walk / yoga' },
      { day: 'Fri', focus: 'Full body' }, { day: 'Sat', focus: 'Active / sport' }, { day: 'Sun', focus: 'Rest' },
    ],
    keyExercises: ['Bodyweight Squat', 'Push Up', 'Dumbbell Row', 'Glute Bridge', 'Plank'],
    foods: {
      protein: ['Eggs', 'Chicken', 'Fish', 'Dal', 'Yogurt'],
      carbs: ['Whole grains', 'Fruit', 'Rice', 'Roti'],
      fats: ['Nuts', 'Olive oil', 'Avocado'],
      veg: ['Plenty of vegetables', 'Salads'],
      snacks: ['Fruit', 'Yogurt', 'Nuts'],
    },
    results: 'Better energy, sleep and strength within a few weeks; sustainable for life.',
    color: '#2bffb0',
  },
]

export function getProgram(id?: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id)
}

/** Suggest a program from the user's own numbers + sex. */
export function suggestProgram(args: { sex: 'male' | 'female'; bmi: number; currentKg: number; targetKg: number }): Program {
  const wantLoss = args.targetKg && args.currentKg - args.targetKg > 1.5
  const wantGain = args.targetKg && args.targetKg - args.currentKg > 1.5
  const women = args.sex === 'female'
  if (args.bmi >= 25 || wantLoss) {
    if (args.bmi < 27) return getProgram(women ? 'sixpack_women' : 'sixpack_men')!
    return getProgram('cut')!
  }
  if (wantGain) return getProgram(women ? 'glutes_women' : 'bulk_men')!
  if (args.bmi >= 18.5 && args.bmi < 25) return getProgram('recomp')!
  return getProgram('general')!
}
