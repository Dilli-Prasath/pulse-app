/**
 * "Today's session" engine.
 *
 * From the active program + current weekday, decide what to train today and
 * auto-build the plan so nothing has to be typed:
 *   - strength days  → exercises with sets/reps
 *   - cardio/HIIT     → a guided timed circuit (work seconds per move)
 * Also estimates how long the session will take.
 */
import { AppData } from './types'
import { getProgram, Program } from './programs'
import { EXERCISE_LIBRARY } from './exerciseLibrary'

export interface SessionItem {
  name: string
  muscle?: string
  howto: string
  /** strength */
  sets?: number
  reps?: number
  /** timed circuit (work interval) */
  seconds?: number
}
export type SessionMode = 'strength' | 'circuit'
export interface TodaySession {
  program: Program
  weekday: string
  focus: string
  rest: boolean
  mode: SessionMode
  items: SessionItem[]
  estMin: number
  /** rest between items, seconds (timer guidance) */
  restSec: number
}

const BIG_LIFTS = new Set(['Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Front Squat', 'Power Clean', 'Romanian Deadlift'])
const STRENGTH_REST = 75
const CIRCUIT_REST = 20

function musclesForFocus(focus: string): string[] {
  const f = focus.toLowerCase()
  if (/push|chest/.test(f)) return ['Chest', 'Shoulders', 'Arms']
  if (/pull|\bback\b|bicep/.test(f)) return ['Back', 'Arms']
  if (/leg|lower|quad|hamstring|glute/.test(f)) return ['Legs', 'Glutes', 'Hamstrings']
  if (/upper/.test(f)) return ['Chest', 'Back', 'Shoulders', 'Arms']
  if (/shoulder/.test(f)) return ['Shoulders', 'Arms']
  if (/core|abs/.test(f)) return ['Core']
  if (/full body|full|whole|conditioning|strength/.test(f)) return ['Legs', 'Chest', 'Back', 'Core', 'Glutes']
  return []
}
const isCardio = (focus: string) => /cardio|hiit|run|walk|step|conditioning|spin|cycle|swim/i.test(focus)

// Bodyweight HIIT circuit — every move has a verified static image.
const HIIT_CIRCUIT: SessionItem[] = [
  { name: 'Bodyweight Squat', muscle: 'Legs', howto: 'Sit back and down keeping chest up, drive through heels. Fast but controlled.', seconds: 40 },
  { name: 'Push Up', muscle: 'Chest', howto: 'Body in a straight line, lower until elbows ~90°, press up. Drop to knees if needed.', seconds: 40 },
  { name: 'Walking Lunge', muscle: 'Legs', howto: 'Step forward and drop the back knee toward the floor; alternate legs continuously.', seconds: 40 },
  { name: 'Glute Bridge', muscle: 'Glutes', howto: 'Lie on your back, drive hips up squeezing the glutes, lower under control. Repeat fast.', seconds: 40 },
  { name: 'Plank', muscle: 'Core', howto: 'Forearms down, body straight, brace your core and hold the whole interval.', seconds: 40 },
]

export function buildStrength(program: Program, focus: string): SessionItem[] {
  const muscles = musclesForFocus(focus)
  let picks = EXERCISE_LIBRARY.filter((e) => muscles.includes(e.muscle))
  const keys = new Set(program.keyExercises)
  picks = [...picks].sort((a, b) => Number(keys.has(b.name)) - Number(keys.has(a.name)))
  let chosen = picks.slice(0, 6)
  if (chosen.length < 4) {
    const fb = program.keyExercises.map((n) => EXERCISE_LIBRARY.find((e) => e.name === n)).filter(Boolean) as typeof EXERCISE_LIBRARY
    const seen = new Set(chosen.map((c) => c.name))
    for (const e of fb) if (!seen.has(e.name)) { chosen.push(e); seen.add(e.name) }
    chosen = chosen.slice(0, 6)
  }
  return chosen.map((e) => ({
    name: e.name, muscle: e.muscle, howto: e.howto,
    sets: BIG_LIFTS.has(e.name) ? 4 : 3, reps: BIG_LIFTS.has(e.name) ? 8 : 12,
  }))
}

export function todaySession(d: AppData): TodaySession | null {
  const program = getProgram(d.profile.programId)
  if (!program) return null
  const idx = (new Date().getDay() + 6) % 7
  const day = program.split[idx]
  const focus = day?.focus || 'Rest'
  const rest = /rest/i.test(focus)
  const cardio = isCardio(focus)
  const mode: SessionMode = cardio ? 'circuit' : 'strength'
  const items = rest ? [] : cardio ? HIIT_CIRCUIT : buildStrength(program, focus)
  const restSec = cardio ? CIRCUIT_REST : STRENGTH_REST

  // estimate minutes
  let estMin = 0
  if (!rest) {
    if (mode === 'circuit') {
      const perItem = items.reduce((s, it) => s + (it.seconds || 40) + restSec, 0)
      estMin = Math.round((perItem) / 60)
    } else {
      // ~ sets * (reps*3s work + rest)
      const sec = items.reduce((s, it) => s + (it.sets || 3) * ((it.reps || 10) * 3 + restSec), 0)
      estMin = Math.round(sec / 60)
    }
  }
  return { program, weekday: new Date().toLocaleDateString('en-US', { weekday: 'long' }), focus, rest, mode, items, estMin, restSec }
}
