import { AppData } from './types'

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

export function seed(): AppData {
  const t = today()
  return {
    profile: {
      name: 'Dilli Prasath', sex: 'male', age: 28, heightCm: 188,
      startWeight: 110, targetWeight: 88, activity: 1.375, goalRate: 0.5, avatar: '#8b5cff',
    },
    weights: [{ date: t, kg: 110 }],
    workouts: [],
    meals: [],
    friends: [
      { id: 'f1', name: 'Arjun', color: '#22e3ff', weeklyWorkouts: 4, streak: 11, weightLost: 6.2, caloriesAvg: 2150 },
      { id: 'f2', name: 'Meera', color: '#ff4fd8', weeklyWorkouts: 5, streak: 23, weightLost: 9.1, caloriesAvg: 1820 },
      { id: 'f3', name: 'Karthik', color: '#2bffb0', weeklyWorkouts: 2, streak: 3, weightLost: 2.4, caloriesAvg: 2400 },
    ],
    routines: BUILT_IN_ROUTINES.map((r) => ({ ...r })),
  }
}

// Common foods database (per typical serving)
export interface FoodItem { name: string; serving: string; calories: number; protein: number; carbs: number; fat: number }
export const FOOD_DB: FoodItem[] = [
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
]
