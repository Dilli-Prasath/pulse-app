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
/** BMR — Mifflin–St Jeor equation (the most accurate validated predictive formula). */
export function bmr(d: AppData): number {
  const p = d.profile
  const w = latestWeight(d)
  return 10 * w + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161)
}
/** Maintenance / TDEE = BMR × activity factor. */
export function tdee(d: AppData): number {
  return bmr(d) * d.profile.activity
}
/**
 * Daily calorie target = maintenance − deficit (≈7700 kcal per kg).
 * Safety floor: never below BMR, and never below 1500 kcal (men) / 1200 (women)
 * — deeper deficits hurt adherence, muscle and hormones with no extra fat loss.
 */
export function calorieTarget(d: AppData): number {
  const raw = tdee(d) - (d.profile.goalRate * 7700) / 7
  const floor = Math.max(bmr(d), d.profile.sex === 'male' ? 1500 : 1200)
  return Math.round(Math.max(raw, floor))
}

/** Reference weight for protein: goal weight while cutting (avoids over-counting body fat), else current. */
function refWeight(d: AppData): number {
  const cur = latestWeight(d)
  const tgt = d.profile.targetWeight
  return tgt > 0 && tgt < cur ? tgt : cur
}
/**
 * Protein target (ISSN). During a deficit, resistance-trained people retain
 * the most lean mass at ~2.3–3.1 g/kg; we use 2.4 g/kg on reference (goal/lean)
 * weight — high enough to spare muscle, scaled off lean weight so high-body-fat
 * users aren't over-prescribed. Otherwise ~2.0 g/kg. Capped at 3.0 g/kg.
 */
export function proteinTarget(d: AppData): number {
  const inDeficit = calorieTarget(d) < tdee(d) - 50
  const perKg = inDeficit ? 2.4 : 2.0
  const w = refWeight(d)
  return Math.round(Math.min(w * perKg, w * 3.0))
}
/**
 * Fat target: 0.9 g/kg (within the evidence-based 0.8–1.0 g/kg band for hormone
 * health) with an absolute floor of 50 g (men) / 35 g (women) to avoid
 * essential-fatty-acid deficiency on small/lean frames.
 */
export function fatTarget(d: AppData): number {
  const floor = d.profile.sex === 'male' ? 50 : 35
  return Math.round(Math.max(refWeight(d) * 0.9, floor))
}
/** Carbs fill the remaining calories so protein+carbs+fat = the calorie target. */
export function carbTarget(d: AppData): number {
  const remaining = calorieTarget(d) - proteinTarget(d) * 4 - fatTarget(d) * 9
  return Math.max(0, Math.round(remaining / 4))
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

export function waterToday(d: AppData): number {
  const t = new Date().toISOString().slice(0, 10)
  return d.water.find((w) => w.date === t)?.ml || 0
}
