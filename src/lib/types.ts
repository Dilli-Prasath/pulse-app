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

export interface AppData {
  profile: Profile
  weights: WeightEntry[]
  workouts: Workout[]
  meals: Meal[]
  friends: Friend[]
  routines: Routine[]
}
