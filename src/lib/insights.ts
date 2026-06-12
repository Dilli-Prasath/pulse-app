import { AppData } from './types'
import {
  latestWeight, caloriesOn, calorieTarget, proteinTarget, macrosOn, workoutsThisWeek,
  streak, totalLost, weeksToGoal, last7Days, bmi, bmiLabel,
} from './calcs'

export interface Insight {
  tone: 'good' | 'warn' | 'info'
  icon: string
  title: string
  body: string
}

/** A lightweight rules-based "AI coach" that adapts to the user's data. */
export function coachInsights(d: AppData): Insight[] {
  const out: Insight[] = []
  const today = new Date().toISOString().slice(0, 10)
  const cals = caloriesOn(d, today)
  const tgt = calorieTarget(d)
  const days = last7Days()
  const logged = days.filter((dt) => caloriesOn(d, dt) > 0)
  const avgCals = logged.length ? Math.round(logged.reduce((s, dt) => s + caloriesOn(d, dt), 0) / logged.length) : 0
  const wkW = workoutsThisWeek(d)
  const st = streak(d)
  const macros = macrosOn(d, today)
  const pTgt = proteinTarget(d)
  const [bl] = bmiLabel(bmi(d))

  // Calorie pacing
  if (cals === 0) {
    out.push({ tone: 'info', icon: '🍽️', title: 'Log today to stay on track', body: `Your target is ${tgt} kcal/day. Logging meals is the single biggest predictor of weight-loss success.` })
  } else if (cals > tgt + 200) {
    out.push({ tone: 'warn', icon: '⚠️', title: 'Over your calorie budget today', body: `You're ${cals - tgt} kcal over. A 20-min walk burns ~120 kcal, or shift the surplus by trimming a snack.` })
  } else if (cals <= tgt) {
    out.push({ tone: 'good', icon: '✅', title: "You're in a deficit today", body: `Eating ${cals}/${tgt} kcal keeps you on pace to lose ${d.profile.goalRate} kg this week. Nice work.` })
  }

  // Weekly average trend
  if (avgCals > 0 && avgCals > tgt + 150) {
    out.push({ tone: 'warn', icon: '📊', title: 'Weekly average is creeping up', body: `Your 7-day average is ${avgCals} kcal vs a ${tgt} target. Small consistent deficits beat aggressive crash weeks.` })
  }

  // Protein
  if (cals > 0 && macros.p < pTgt * 0.7) {
    out.push({ tone: 'warn', icon: '🥩', title: 'Push your protein', body: `At ${Math.round(macros.p)}g vs a ${pTgt}g target. Protein preserves muscle in a deficit and keeps you full — add eggs, paneer, dal, or a whey scoop.` })
  }

  // Training frequency
  if (wkW === 0) {
    out.push({ tone: 'info', icon: '🏋️', title: 'No workouts yet this week', body: 'Even 2–3 strength sessions a week protect muscle while you lose fat. Try a built-in routine to start fast.' })
  } else if (wkW >= 4) {
    out.push({ tone: 'good', icon: '🔥', title: `${wkW} workouts this week — strong`, body: 'Great training volume. Make sure you get a rest day and 7–8h sleep for recovery.' })
  }

  // Streak
  if (st >= 3) out.push({ tone: 'good', icon: '⚡', title: `${st}-day streak`, body: "Momentum is your superpower. Don't break the chain." })

  // Big-picture
  const wks = weeksToGoal(d)
  if (wks > 0) {
    out.push({ tone: 'info', icon: '🎯', title: 'Projected timeline', body: `At ${d.profile.goalRate} kg/week you'll hit ${d.profile.targetWeight} kg in about ${wks} weeks. You've already lost ${Math.max(0, totalLost(d))} kg.` })
  } else if (totalLost(d) >= d.profile.startWeight - d.profile.targetWeight) {
    out.push({ tone: 'good', icon: '👑', title: 'Target reached!', body: 'Consider switching to a maintenance calorie target to lock in your results.' })
  }

  // BMI nudge
  out.push({ tone: bl === 'Healthy' ? 'good' : 'info', icon: '🧬', title: `BMI status: ${bl}`, body: `At ${latestWeight(d)} kg and ${d.profile.heightCm} cm your BMI is ${bmi(d).toFixed(1)}. A BMI of 18.5–24.9 is the healthy range.` })

  return out
}
