/**
 * "Today's session" engine.
 *
 * From the user's active program + the current weekday, work out what they
 * should train today and auto-build the exercise list (mapped from the day's
 * focus → muscle groups → curated exercises) so nothing has to be typed.
 */
import { AppData } from './types'
import { getProgram, Program } from './programs'
import { EXERCISE_LIBRARY } from './exerciseLibrary'

export interface SessionExercise { name: string; sets: number; reps: number; muscle: string; howto: string }
export interface TodaySession {
  program: Program
  weekday: string
  focus: string
  rest: boolean
  cardio: boolean
  exercises: SessionExercise[]
}

const BIG_LIFTS = new Set(['Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Front Squat', 'Power Clean', 'Romanian Deadlift'])

/** Map a free-text focus label to the muscle groups it targets. */
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

/** Build the exercise list for a given program day focus. */
export function buildSessionExercises(program: Program, focus: string): SessionExercise[] {
  const muscles = musclesForFocus(focus)
  let picks = EXERCISE_LIBRARY.filter((e) => muscles.includes(e.muscle))
  // bias toward the program's own key exercises first
  const keys = new Set(program.keyExercises)
  picks.sort((a, b) => Number(keys.has(b.name)) - Number(keys.has(a.name)))
  let chosen = picks.slice(0, 6)
  if (chosen.length < 4) {
    // fall back to the program's signature lifts
    const fallback = program.keyExercises.map((n) => EXERCISE_LIBRARY.find((e) => e.name === n)).filter(Boolean) as typeof EXERCISE_LIBRARY
    const seen = new Set(chosen.map((c) => c.name))
    for (const e of fallback) if (!seen.has(e.name)) { chosen.push(e); seen.add(e.name) }
    chosen = chosen.slice(0, 6)
  }
  return chosen.map((e) => ({
    name: e.name,
    sets: BIG_LIFTS.has(e.name) ? 4 : 3,
    reps: BIG_LIFTS.has(e.name) ? 8 : 12,
    muscle: e.muscle,
    howto: e.howto,
  }))
}

export function todaySession(d: AppData): TodaySession | null {
  const program = getProgram(d.profile.programId)
  if (!program) return null
  const idx = (new Date().getDay() + 6) % 7 // Mon=0
  const day = program.split[idx]
  const focus = day?.focus || 'Rest'
  const rest = /rest/i.test(focus)
  const cardio = isCardio(focus)
  return {
    program,
    weekday: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    focus,
    rest,
    cardio,
    exercises: rest || cardio ? [] : buildSessionExercises(program, focus),
  }
}
