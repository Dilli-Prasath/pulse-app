import { AppData } from './types'

export const fmtDate = (d: string) =>
  new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export function latestWeight(d: AppData): number {
  return d.weights.length ? d.weights[d.weights.length - 1].kg : d.profile.startWeight
}
export function bmi(d: AppData, w = latestWeight(d)): number {
  const h = d.profile.heightCm / 100
  return w / (h * h)
}
export function bmiLabel(b: number): [string, string] {
  if (b < 18.5) return ['Underweight', '#22e3ff']
  if (b < 25) return ['Healthy', '#2bffb0']
  if (b < 30) return ['Overweight', '#ffcf5c']
  return ['Obese', '#ff5d7a']
}
export function bmr(d: AppData): number {
  const p = d.profile
  const w = latestWeight(d)
  return 10 * w + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161)
}
export function tdee(d: AppData): number {
  return bmr(d) * d.profile.activity
}
export function calorieTarget(d: AppData): number {
  return Math.round(tdee(d) - (d.profile.goalRate * 7700) / 7)
}
export function proteinTarget(d: AppData): number {
  return Math.round(latestWeight(d) * 1.8)
}
export function carbTarget(d: AppData): number {
  return Math.round((calorieTarget(d) * 0.45) / 4)
}
export function fatTarget(d: AppData): number {
  return Math.round((calorieTarget(d) * 0.27) / 9)
}

export const mealsOn = (d: AppData, date: string) => d.meals.filter((m) => m.date === date)
export const caloriesOn = (d: AppData, date: string) =>
  mealsOn(d, date).reduce((s, m) => s + (+m.calories || 0), 0)
export function macrosOn(d: AppData, date: string) {
  return mealsOn(d, date).reduce(
    (a, m) => ({ p: a.p + (+m.protein || 0), c: a.c + (+m.carbs || 0), f: a.f + (+m.fat || 0) }),
    { p: 0, c: 0, f: 0 },
  )
}

export function weekStart(): string {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}
export const workoutsThisWeek = (d: AppData) => d.workouts.filter((w) => w.date >= weekStart()).length

export function streak(d: AppData): number {
  const set = new Set(d.workouts.map((w) => w.date))
  let s = 0
  const day = new Date()
  for (;;) {
    const ds = day.toISOString().slice(0, 10)
    if (set.has(ds)) {
      s++
      day.setDate(day.getDate() - 1)
    } else if (ds === new Date().toISOString().slice(0, 10)) {
      day.setDate(day.getDate() - 1)
    } else break
  }
  return s
}

export const totalLost = (d: AppData) => +(d.profile.startWeight - latestWeight(d)).toFixed(1)
export function goalProgress(d: AppData): number {
  const tot = d.profile.startWeight - d.profile.targetWeight
  if (tot <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((totalLost(d) / tot) * 100)))
}
export function weeksToGoal(d: AppData): number {
  const lose = latestWeight(d) - d.profile.targetWeight
  if (lose <= 0) return 0
  return Math.ceil(lose / d.profile.goalRate)
}
export function totalVolume(d: AppData): number {
  let v = 0
  d.workouts.forEach((w) => (w.exercises || []).forEach((e) => (e.sets || []).forEach((s) => (v += (+s.reps || 0) * (+s.weight || 0)))))
  return Math.round(v)
}
export function prs(d: AppData): Record<string, { weight: number; reps: number; date: string }> {
  const p: Record<string, { weight: number; reps: number; date: string }> = {}
  d.workouts.forEach((w) =>
    (w.exercises || []).forEach((e) =>
      (e.sets || []).forEach((s) => {
        const wt = +s.weight || 0
        if (wt > 0 && (!p[e.name] || wt > p[e.name].weight)) p[e.name] = { weight: wt, reps: s.reps, date: w.date }
      }),
    ),
  )
  return p
}

export function last7Days(): string[] {
  return [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}
