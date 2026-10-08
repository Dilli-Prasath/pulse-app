/**
 * Static, offline catalogue of cardio / sport / everyday activities (product
 * content, not user data). Calorie burn uses MET values from the Compendium of
 * Physical Activities: kcal = MET × bodyweight(kg) × hours. No API needed.
 */
export type ActivityGroup = 'Walk & Run' | 'Cycle & Swim' | 'Gym Cardio' | 'Sports' | 'Classes & Dance' | 'Mind & Body' | 'Everyday'

export interface Activity {
  id: string
  name: string
  emoji: string
  group: ActivityGroup
  met: number
  /** typical speed — lets us auto-fill distance from duration. */
  kmh?: number
  /** sensible default duration, minutes. */
  defMin: number
  tip: string
}

export const ACTIVITY_GROUPS: ActivityGroup[] = ['Walk & Run', 'Cycle & Swim', 'Gym Cardio', 'Sports', 'Classes & Dance', 'Mind & Body', 'Everyday']

export const ACTIVITIES: Activity[] = [
  // ============ WALK & RUN ============
  { id: 'walk', name: 'Walking (easy)', emoji: '🚶', group: 'Walk & Run', met: 2.8, kmh: 3.5, defMin: 30, tip: 'Relaxed pace — great on rest days and after meals for blood-sugar control.' },
  { id: 'brisk_walk', name: 'Brisk Walk', emoji: '🚶‍♂️', group: 'Walk & Run', met: 4.3, kmh: 5.6, defMin: 40, tip: 'Fast enough that talking is slightly harder. The best low-stress fat-loss cardio.' },
  { id: 'power_walk', name: 'Power Walk', emoji: '💨', group: 'Walk & Run', met: 5.0, kmh: 6.4, defMin: 30, tip: 'Pump the arms, short quick steps — near-jogging burn with no impact.' },
  { id: 'incline_walk', name: 'Incline Treadmill Walk', emoji: '⛰️', group: 'Walk & Run', met: 6.0, kmh: 5, defMin: 30, tip: '8–12% incline at 4.5–5.5 km/h. Glutes & hamstrings work hard, knees stay happy. Don\'t hold the rails.' },
  { id: 'jog', name: 'Jogging', emoji: '🏃', group: 'Walk & Run', met: 7.0, kmh: 7.5, defMin: 25, tip: 'Conversational pace (you can speak in sentences). Build your aerobic base here — ~80% of all running.' },
  { id: 'run_8', name: 'Running · 8 km/h', emoji: '🏃‍♂️', group: 'Walk & Run', met: 8.3, kmh: 8, defMin: 30, tip: '7:30 min/km. Steady easy run — land under your hips, relaxed shoulders.' },
  { id: 'run_10', name: 'Running · 10 km/h', emoji: '🏃‍♀️', group: 'Walk & Run', met: 9.8, kmh: 10, defMin: 30, tip: '6:00 min/km. Comfortably hard tempo — use once a week to raise your threshold.' },
  { id: 'run_12', name: 'Running · 12 km/h', emoji: '⚡', group: 'Walk & Run', met: 11.8, kmh: 12, defMin: 25, tip: '5:00 min/km. Fast running — for experienced runners; warm up 10 min first.' },
  { id: 'sprint', name: 'Sprint Intervals', emoji: '🔥', group: 'Walk & Run', met: 10.0, kmh: 9, defMin: 20, tip: 'e.g. 8 × (30 s hard + 90 s easy jog) after a 5-min warm-up. Huge burn in little time.' },
  { id: 'trail_run', name: 'Trail Run', emoji: '🌲', group: 'Walk & Run', met: 9.0, kmh: 8, defMin: 40, tip: 'Uneven ground works ankles & stabilisers. Slow down on descents.' },
  { id: 'hike', name: 'Hiking / Trekking', emoji: '🥾', group: 'Walk & Run', met: 6.0, kmh: 4, defMin: 90, tip: 'Long, steady effort. Carry water and a snack for anything over an hour.' },
  { id: 'stairs', name: 'Stair Climbing', emoji: '🪜', group: 'Walk & Run', met: 8.0, defMin: 15, tip: 'Office stairs count! Every step up, drive through the heel. Walk down to recover.' },

  // ============ CYCLE & SWIM ============
  { id: 'cycle_easy', name: 'Cycling (leisure)', emoji: '🚲', group: 'Cycle & Swim', met: 4.0, kmh: 14, defMin: 30, tip: 'Easy ride / commute pace under 16 km/h.' },
  { id: 'cycle_mod', name: 'Cycling (moderate)', emoji: '🚴', group: 'Cycle & Swim', met: 6.8, kmh: 18, defMin: 40, tip: '16–19 km/h. Knee-friendly cardio that still burns well.' },
  { id: 'cycle_vig', name: 'Cycling (fast)', emoji: '🚴‍♂️', group: 'Cycle & Swim', met: 8.0, kmh: 21, defMin: 40, tip: '19–22 km/h. Keep cadence 80–90 rpm.' },
  { id: 'spin', name: 'Spin Class / Stationary Bike', emoji: '🔄', group: 'Cycle & Swim', met: 8.5, defMin: 45, tip: 'Mix seated climbs and standing sprints. Set saddle at hip height.' },
  { id: 'swim_easy', name: 'Swimming (leisure)', emoji: '🏊', group: 'Cycle & Swim', met: 6.0, defMin: 30, tip: 'Easy laps or water play — zero impact, full body.' },
  { id: 'swim_laps', name: 'Swimming Laps', emoji: '🏊‍♂️', group: 'Cycle & Swim', met: 8.3, kmh: 2.2, defMin: 30, tip: 'Freestyle at a steady effort. Breathe every 3 strokes to stay balanced.' },

  // ============ GYM CARDIO ============
  { id: 'elliptical', name: 'Elliptical / Cross-trainer', emoji: '🌀', group: 'Gym Cardio', met: 5.0, defMin: 30, tip: 'Low impact. Push and pull the handles to involve the upper body.' },
  { id: 'rower', name: 'Rowing Machine', emoji: '🚣', group: 'Gym Cardio', met: 7.0, defMin: 20, tip: 'Legs → hips → arms on the drive; reverse on the return. 24–28 strokes/min.' },
  { id: 'jump_rope', name: 'Skipping / Jump Rope', emoji: '🪢', group: 'Gym Cardio', met: 10.0, defMin: 15, tip: 'Small bounces on the balls of the feet. Try 1 min on / 30 s off.' },
  { id: 'hiit', name: 'HIIT / Circuit', emoji: '⏱️', group: 'Gym Cardio', met: 8.0, defMin: 20, tip: 'Work 40 s / rest 20 s through 5–6 moves, 3–4 rounds.' },
  { id: 'stair_mill', name: 'Stair Master', emoji: '🏢', group: 'Gym Cardio', met: 9.0, defMin: 20, tip: 'Upright posture, light hand contact only. Brutal but effective.' },

  // ============ SPORTS ============
  { id: 'badminton', name: 'Badminton', emoji: '🏸', group: 'Sports', met: 5.5, defMin: 45, tip: 'Social doubles ~5.5 MET; competitive singles burns closer to 7.' },
  { id: 'cricket', name: 'Cricket', emoji: '🏏', group: 'Sports', met: 4.8, defMin: 90, tip: 'Batting & bowling. Fielding sprints add up over a match.' },
  { id: 'football', name: 'Football', emoji: '⚽', group: 'Sports', met: 7.0, defMin: 60, tip: 'Casual game. Competitive matches are closer to 10 MET.' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', group: 'Sports', met: 6.5, defMin: 45, tip: 'Game play — lots of short sprints and jumps.' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', group: 'Sports', met: 7.3, defMin: 60, tip: 'Singles. Doubles burns ~6 MET.' },
  { id: 'table_tennis', name: 'Table Tennis', emoji: '🏓', group: 'Sports', met: 4.0, defMin: 30, tip: 'Great reflex & footwork work, easy on joints.' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', group: 'Sports', met: 4.0, defMin: 45, tip: 'Recreational. Beach volleyball ~8 MET.' },
  { id: 'kabaddi', name: 'Kabaddi / Kho-kho', emoji: '🤼', group: 'Sports', met: 7.0, defMin: 40, tip: 'Explosive raids and chases — warm up the hamstrings well.' },
  { id: 'squash', name: 'Squash', emoji: '🎯', group: 'Sports', met: 7.3, defMin: 40, tip: 'Very high intensity — hydrate between games.' },
  { id: 'martial_arts', name: 'Martial Arts / Boxing', emoji: '🥊', group: 'Sports', met: 7.5, defMin: 45, tip: 'Pad/bag work or drills. Sparring is higher.' },

  // ============ CLASSES & DANCE ============
  { id: 'zumba', name: 'Zumba', emoji: '💃', group: 'Classes & Dance', met: 6.5, defMin: 45, tip: 'Fun, high-energy cardio — follow the low-impact options if knees complain.' },
  { id: 'dance', name: 'Dancing', emoji: '🕺', group: 'Classes & Dance', met: 5.0, defMin: 30, tip: 'Any style — Bollywood, Bharatanatyam, freestyle all count.' },
  { id: 'aerobics', name: 'Aerobics (step)', emoji: '🎵', group: 'Classes & Dance', met: 7.3, defMin: 45, tip: 'High-impact step aerobics. Low-impact is ~5 MET.' },

  // ============ MIND & BODY ============
  { id: 'yoga', name: 'Yoga (hatha)', emoji: '🧘', group: 'Mind & Body', met: 2.5, defMin: 45, tip: 'Mobility + recovery. Pairs well with heavy lifting days.' },
  { id: 'power_yoga', name: 'Power Yoga / Vinyasa', emoji: '🧘‍♀️', group: 'Mind & Body', met: 4.0, defMin: 45, tip: 'Flowing sequences that raise the heart rate.' },
  { id: 'surya', name: 'Surya Namaskar', emoji: '☀️', group: 'Mind & Body', met: 3.8, defMin: 15, tip: '12 rounds ≈ 15 min. Move with the breath.' },
  { id: 'pilates', name: 'Pilates', emoji: '🤸', group: 'Mind & Body', met: 3.0, defMin: 40, tip: 'Deep core control and posture.' },
  { id: 'stretch', name: 'Stretching / Mobility', emoji: '🙆', group: 'Mind & Body', met: 2.3, defMin: 15, tip: 'Hold each stretch 30 s; never bounce.' },

  // ============ EVERYDAY ============
  { id: 'chores', name: 'Household Chores', emoji: '🧹', group: 'Everyday', met: 3.3, defMin: 30, tip: 'Sweeping, mopping, cleaning — NEAT adds up!' },
  { id: 'gardening', name: 'Gardening', emoji: '🌱', group: 'Everyday', met: 3.8, defMin: 30, tip: 'Digging, weeding, carrying pots.' },
  { id: 'play_kids', name: 'Playing with Kids', emoji: '🧒', group: 'Everyday', met: 4.0, defMin: 30, tip: 'Running around, carrying — it\'s real exercise.' },
]

export const ACTIVITY_BY_ID: Record<string, Activity> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]))

/** kcal burned for an activity (MET × kg × hours). */
export function activityCalories(a: Activity, minutes: number, kg: number): number {
  return Math.round(a.met * (kg || 70) * (minutes / 60))
}
/** Estimated distance in km for distance-type activities, else 0. */
export function activityDistance(a: Activity, minutes: number): number {
  return a.kmh ? Math.round(a.kmh * (minutes / 60) * 10) / 10 : 0
}

/** Best cardio/activity picks per goal program, most-recommended first. */
export const PROGRAM_ACTIVITIES: Record<string, string[]> = {
  cut: ['brisk_walk', 'jog', 'cycle_mod', 'swim_laps', 'jump_rope', 'badminton'],
  sixpack_men: ['sprint', 'run_8', 'jump_rope', 'cycle_vig', 'stairs', 'football'],
  sixpack_women: ['brisk_walk', 'jog', 'zumba', 'cycle_mod', 'power_yoga', 'swim_laps'],
  bulk_men: ['brisk_walk', 'cycle_easy', 'yoga', 'badminton', 'swim_easy'],
  glutes_women: ['incline_walk', 'stairs', 'hike', 'cycle_mod', 'pilates', 'dance'],
  recomp: ['jog', 'sprint', 'cycle_mod', 'swim_laps', 'badminton', 'rower'],
  strength: ['brisk_walk', 'cycle_easy', 'yoga', 'stretch', 'swim_easy'],
  general: ['brisk_walk', 'jog', 'yoga', 'badminton', 'cycle_mod', 'dance'],
  run_endurance: ['jog', 'run_8', 'run_10', 'sprint', 'cycle_mod', 'swim_laps'],
}

export function activitiesForProgram(programId?: string): Activity[] {
  return (PROGRAM_ACTIVITIES[programId || ''] || PROGRAM_ACTIVITIES.general).map((id) => ACTIVITY_BY_ID[id]).filter(Boolean)
}

// keyword → activity, used to turn a program day's focus ("Easy jog 25 min") into a loggable activity
const FOCUS_KEYS: [RegExp, string][] = [
  [/interval|sprint/, 'sprint'], [/tempo/, 'run_10'], [/long run/, 'run_8'], [/jog/, 'jog'], [/\brun/, 'run_8'],
  [/hike|trek/, 'hike'], [/swim/, 'swim_laps'], [/spin|cycl|bike/, 'cycle_mod'], [/pilates/, 'pilates'],
  [/yoga/, 'yoga'], [/mobility|stretch/, 'stretch'], [/walk|step/, 'brisk_walk'], [/sport|active/, 'badminton'],
]

/** True for program days best done as an activity (walk/run/ride/sport) rather than a gym circuit. */
export function isActivityFocus(focus: string): boolean {
  const f = focus.toLowerCase()
  if (/hiit|circuit|conditioning|core|\+|strength/.test(f)) return false
  return /run|jog|walk|step|cycl|spin|swim|sport|active|yoga|pilates|hike|trek|cardio/.test(f)
}

/** Resolve a day's focus to an activity + duration (earliest keyword in the text wins). */
export function activityForFocus(focus: string, programId?: string): { activity: Activity; minutes: number } {
  const f = focus.toLowerCase()
  let best: { id: string; at: number } | null = null
  for (const [re, id] of FOCUS_KEYS) {
    const m = re.exec(f)
    if (m && (!best || m.index < best.at)) best = { id, at: m.index }
  }
  const activity = best ? ACTIVITY_BY_ID[best.id] : activitiesForProgram(programId)[0]
  const mins = f.match(/(\d+)\s*min/)
  return { activity, minutes: mins ? +mins[1] : activity.defMin }
}
