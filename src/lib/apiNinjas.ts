/**
 * API Ninjas client — talks ONLY to our Supabase Edge Function proxy
 * (functions/api-ninjas), which holds the secret key. Never calls API Ninjas
 * directly, so the key is never exposed in the browser.
 */
import { supabase, cloudConfigured } from './supabase'

export const ninjaConfigured = cloudConfigured

async function call<T>(endpoint: string, params: Record<string, string | number>): Promise<T | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.functions.invoke('api-ninjas', { body: { endpoint, params } })
    if (error) throw error
    if (data && (data as { error?: string }).error) throw new Error((data as { error: string }).error)
    return data as T
  } catch (e) {
    console.warn('API Ninjas call failed:', e)
    return null
  }
}

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? Math.round((n as number) * 10) / 10 : 0
}

/* ----------------------------- Exercises ----------------------------- */
export interface NinjaExercise {
  name: string
  type: string
  muscle: string
  equipment: string
  difficulty: string
  instructions: string
}
export async function searchExercises(params: { muscle?: string; difficulty?: string; type?: string; name?: string }): Promise<NinjaExercise[]> {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v)) as Record<string, string>
  const res = await call<NinjaExercise[]>('exercises', clean)
  return Array.isArray(res) ? res : []
}
export const NINJA_MUSCLES = [
  'abdominals', 'biceps', 'chest', 'forearms', 'glutes', 'hamstrings', 'lats',
  'lower_back', 'middle_back', 'quadriceps', 'shoulders', 'traps', 'triceps', 'calves',
]
export const NINJA_DIFFICULTY = ['beginner', 'intermediate', 'expert']

/* ----------------------------- Nutrition (NLP) ----------------------------- */
export interface NinjaNutritionItem {
  name: string
  calories: number
  serving_size_g: number
  protein_g: number
  fat_total_g: number
  carbohydrates_total_g: number
}
export interface ParsedNutrition {
  items: { name: string; calories: number; protein: number; carbs: number; fat: number }[]
  total: { calories: number; protein: number; carbs: number; fat: number }
}
export async function parseNutrition(query: string): Promise<ParsedNutrition | null> {
  const res = await call<NinjaNutritionItem[]>('nutrition', { query })
  if (!Array.isArray(res) || !res.length) return null
  const items = res.map((r) => ({
    name: r.name || 'item',
    calories: num(r.calories),
    protein: num(r.protein_g),
    carbs: num(r.carbohydrates_total_g),
    fat: num(r.fat_total_g),
  }))
  const total = items.reduce((a, i) => ({
    calories: a.calories + i.calories, protein: a.protein + i.protein, carbs: a.carbs + i.carbs, fat: a.fat + i.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  total.calories = Math.round(total.calories)
  total.protein = Math.round(total.protein)
  total.carbs = Math.round(total.carbs)
  total.fat = Math.round(total.fat)
  return { items, total }
}

/* ----------------------------- Calories Burned ----------------------------- */
export interface NinjaCalories {
  name: string
  calories_per_hour: number
  duration_minutes: number
  total_calories: number
}
export async function caloriesBurned(activity: string, durationMin: number, weightKg: number): Promise<NinjaCalories[]> {
  const params: Record<string, string | number> = { activity }
  if (durationMin > 0) params.duration = Math.round(durationMin)
  if (weightKg > 0) params.weight = Math.round(weightKg * 2.20462) // API expects pounds
  const res = await call<NinjaCalories[]>('caloriesburned', params)
  return Array.isArray(res) ? res : []
}

/* ----------------------------- Recipes ----------------------------- */
export interface NinjaRecipe {
  title: string
  ingredients: string
  servings: string
  instructions: string
}
export async function searchRecipes(query: string): Promise<NinjaRecipe[]> {
  const res = await call<NinjaRecipe[]>('recipe', { query })
  return Array.isArray(res) ? res : []
}
