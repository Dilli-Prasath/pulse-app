export type Sex = 'male' | 'female'
export type WorkoutType = 'strength' | 'cardio'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Profile {
  name: string
  sex: Sex
  age: number
  heightCm: number
  startWeight: number
  targetWeight: number
  activity: number
  goalRate: number
  avatar: string
  onboarded: boolean
  /** id of the active goal program (see programs.ts), if chosen. */
  programId?: string
}

export type Level = 'Beginner' | 'Intermediate' | 'Advanced'

/** A body-composition reading, e.g. from an InBody scan. */
export interface InBodyEntry {
  id: string
  date: string
  weight?: number          // kg
  bodyFatPct?: number      // %
  skeletalMuscleMass?: number // kg (SMM)
  visceralFat?: number     // level
  bodyWaterPct?: number    // % total body water
  bmr?: number             // kcal (basal metabolic rate from scan)
  inbodyScore?: number     // points
}

export interface SetEntry { reps: number; weight: number }
export interface Exercise { name: string; sets: SetEntry[]; image?: string | null }
export interface Cardio { duration: number; distance: number; calories: number }

export interface Workout {
  id: string
  date: string
  type: WorkoutType
  name: string
  exercises?: Exercise[]
  cardio?: Cardio
  notes?: string
}

export interface Meal {
  id: string
  date: string
  mealType: MealType
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface WeightEntry { date: string; kg: number }

export interface Friend {
  id: string
  name: string
  color: string
  weeklyWorkouts: number
  streak: number
  weightLost: number
  caloriesAvg: number
}

export interface RoutineExercise { name: string; sets: number; reps: number; image?: string | null }
export interface Routine {
  id: string
  name: string
  focus: string
  color: string
  exercises: RoutineExercise[]
  builtIn?: boolean
}

export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  check: (s: AppData) => boolean
}

export interface WaterEntry { date: string; ml: number }
export interface CustomFood { name: string; serving: string; calories: number; protein: number; carbs: number; fat: number }
export interface MenuItem { meal: MealType; name: string; calories: number }
export interface MeasurementEntry {
  id: string
  date: string
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
}

export type Accent = 'aurora' | 'cyan' | 'violet' | 'sunset' | 'emerald'
export type WeightUnit = 'kg' | 'lb'
export type ExerciseSource = 'auto' | 'ninja' | 'wger'
export type FoodSource = 'auto' | 'ninja' | 'off' | 'static'

export interface Settings {
  accent: Accent
  weightUnit: WeightUnit
  exerciseSource: ExerciseSource
  foodSource: FoodSource
  waterTargetMl: number
}

/** Pages a user can choose to share with their group teammates. */
export type SharePage = 'dashboard' | 'workouts' | 'nutrition' | 'body'
/** Privacy & sharing: master switch + per-page visibility for teammates. */
export interface SharingConfig {
  enabled: boolean
  pages: Record<SharePage, boolean>
}
export const SHARE_PAGES: { key: SharePage; label: string; icon: string; desc: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Weight, BMI, streak, workouts & calories overview' },
  { key: 'workouts', label: 'Workouts', icon: '🏋️', desc: 'Workout history, weekly count, PRs & volume' },
  { key: 'nutrition', label: 'Nutrition', icon: '🥗', desc: 'Calories, macros, water & nutrition score' },
  { key: 'body', label: 'Body & Programs', icon: '🧬', desc: 'Weight, BMI, InBody, measurements & active goal' },
]

export interface AppData {
  profile: Profile
  weights: WeightEntry[]
  workouts: Workout[]
  meals: Meal[]
  friends: Friend[]
  routines: Routine[]
  inbody: InBodyEntry[]
  water: WaterEntry[]
  measurements: MeasurementEntry[]
  customFoods: CustomFood[]
  /** office/canteen menus keyed by date (YYYY-MM-DD) */
  menus: Record<string, MenuItem[]>
  settings: Settings
  /** privacy: what (if anything) group teammates may view. */
  sharing: SharingConfig
}
