import { Level } from './types'

export interface LibExercise {
  name: string          // wger-matchable name -> auto image
  level: Level
  muscle: string
  equipment: string
  howto: string
}

/**
 * Curated, static exercise catalogue (product content, not user data).
 * Names are chosen to match the wger image database so each gets a real photo.
 */
export const EXERCISE_LIBRARY: LibExercise[] = [
  // ---- Beginner ----
  { name: 'Push Up', level: 'Beginner', muscle: 'Chest', equipment: 'Bodyweight', howto: 'Hands shoulder-width, body in a straight line, lower until elbows ~90°, press back up.' },
  { name: 'Bodyweight Squat', level: 'Beginner', muscle: 'Legs', equipment: 'Bodyweight', howto: 'Feet shoulder-width, sit back and down keeping chest up, drive through heels.' },
  { name: 'Plank', level: 'Beginner', muscle: 'Core', equipment: 'Bodyweight', howto: 'Forearms down, body straight, brace the core and hold without sagging.' },
  { name: 'Dumbbell Row', level: 'Beginner', muscle: 'Back', equipment: 'Dumbbell', howto: 'Hinge at hips, pull the dumbbell to your hip, squeeze the shoulder blade.' },
  { name: 'Glute Bridge', level: 'Beginner', muscle: 'Glutes', equipment: 'Bodyweight', howto: 'Lie on back, drive hips up squeezing glutes, lower under control.' },
  { name: 'Lat Pulldown', level: 'Beginner', muscle: 'Back', equipment: 'Cable', howto: 'Pull the bar to upper chest, lead with elbows, control the return.' },
  { name: 'Leg Press', level: 'Beginner', muscle: 'Legs', equipment: 'Machine', howto: 'Feet mid-platform, lower to ~90°, press without locking knees hard.' },
  { name: 'Biceps Curl', level: 'Beginner', muscle: 'Arms', equipment: 'Dumbbell', howto: 'Elbows pinned, curl up, squeeze, lower slowly.' },

  // ---- Intermediate ----
  { name: 'Bench Press', level: 'Intermediate', muscle: 'Chest', equipment: 'Barbell', howto: 'Retract shoulder blades, lower bar to mid-chest, press up over shoulders.' },
  { name: 'Goblet Squat', level: 'Intermediate', muscle: 'Legs', equipment: 'Dumbbell', howto: 'Hold a dumbbell at chest, squat deep keeping torso upright.' },
  { name: 'Romanian Deadlift', level: 'Intermediate', muscle: 'Hamstrings', equipment: 'Barbell', howto: 'Soft knees, push hips back, bar close to legs, feel the hamstring stretch.' },
  { name: 'Overhead Press', level: 'Intermediate', muscle: 'Shoulders', equipment: 'Barbell', howto: 'Brace core, press bar overhead, finish with biceps by ears.' },
  { name: 'Pull Up', level: 'Intermediate', muscle: 'Back', equipment: 'Bodyweight', howto: 'Hang, pull chin over the bar leading with the chest, control the descent.' },
  { name: 'Bent Over Row', level: 'Intermediate', muscle: 'Back', equipment: 'Barbell', howto: 'Hinge ~45°, row bar to lower ribs, squeeze, lower with control.' },
  { name: 'Walking Lunge', level: 'Intermediate', muscle: 'Legs', equipment: 'Dumbbell', howto: 'Step forward, drop back knee toward floor, drive up and alternate.' },
  { name: 'Incline Dumbbell Press', level: 'Intermediate', muscle: 'Chest', equipment: 'Dumbbell', howto: 'Bench at 30°, press dumbbells up and slightly together.' },
  { name: 'Lateral Raise', level: 'Intermediate', muscle: 'Shoulders', equipment: 'Dumbbell', howto: 'Slight bend in elbows, raise to shoulder height, lower slowly.' },

  // ---- Advanced ----
  { name: 'Deadlift', level: 'Advanced', muscle: 'Full Body', equipment: 'Barbell', howto: 'Bar over mid-foot, flat back, drive the floor away, lock out hips.' },
  { name: 'Squat', level: 'Advanced', muscle: 'Legs', equipment: 'Barbell', howto: 'Bar on traps, brace, sit between hips below parallel, drive up.' },
  { name: 'Front Squat', level: 'Advanced', muscle: 'Legs', equipment: 'Barbell', howto: 'Bar on front delts, elbows high, squat tall and upright.' },
  { name: 'Barbell Hip Thrust', level: 'Advanced', muscle: 'Glutes', equipment: 'Barbell', howto: 'Upper back on bench, drive hips up to full extension, squeeze.' },
  { name: 'Weighted Pull Up', level: 'Advanced', muscle: 'Back', equipment: 'Bodyweight', howto: 'Add a belt/dumbbell, strict full-range pull-ups.' },
  { name: 'Dips', level: 'Advanced', muscle: 'Chest', equipment: 'Bodyweight', howto: 'Lean slightly forward, lower until shoulders below elbows, press up.' },
  { name: 'Power Clean', level: 'Advanced', muscle: 'Full Body', equipment: 'Barbell', howto: 'Explosively pull and catch the bar on the front delts in a quarter squat.' },
  { name: 'Bulgarian Split Squat', level: 'Advanced', muscle: 'Legs', equipment: 'Dumbbell', howto: 'Rear foot elevated, drop straight down, drive through the front heel.' },
]

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced']

export interface RoutineTemplate {
  id: string
  name: string
  level: Level
  focus: string
  color: string
  exercises: { name: string; sets: number; reps: number }[]
}

/** Ready-made programs at every level (static product content). */
export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 't_beg_full', name: 'Beginner Full Body', level: 'Beginner', focus: 'Whole body · 3x/week', color: '#2bffb0',
    exercises: [
      { name: 'Bodyweight Squat', sets: 3, reps: 12 },
      { name: 'Push Up', sets: 3, reps: 10 },
      { name: 'Dumbbell Row', sets: 3, reps: 12 },
      { name: 'Glute Bridge', sets: 3, reps: 15 },
      { name: 'Plank', sets: 3, reps: 1 },
    ],
  },
  {
    id: 't_beg_burn', name: 'Beginner Fat Burn', level: 'Beginner', focus: 'Conditioning · weight loss', color: '#22e3ff',
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: 12 },
      { name: 'Push Up', sets: 3, reps: 12 },
      { name: 'Lat Pulldown', sets: 3, reps: 12 },
      { name: 'Walking Lunge', sets: 3, reps: 20 },
      { name: 'Plank', sets: 3, reps: 1 },
    ],
  },
  {
    id: 't_int_push', name: 'Push Day', level: 'Intermediate', focus: 'Chest · Shoulders · Triceps', color: '#8b5cff',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
      { name: 'Overhead Press', sets: 3, reps: 8 },
      { name: 'Lateral Raise', sets: 3, reps: 15 },
      { name: 'Dips', sets: 3, reps: 10 },
    ],
  },
  {
    id: 't_int_pull', name: 'Pull Day', level: 'Intermediate', focus: 'Back · Biceps', color: '#22e3ff',
    exercises: [
      { name: 'Pull Up', sets: 3, reps: 8 },
      { name: 'Bent Over Row', sets: 3, reps: 10 },
      { name: 'Lat Pulldown', sets: 3, reps: 12 },
      { name: 'Dumbbell Row', sets: 3, reps: 12 },
      { name: 'Biceps Curl', sets: 3, reps: 12 },
    ],
  },
  {
    id: 't_int_legs', name: 'Leg Day', level: 'Intermediate', focus: 'Quads · Hamstrings · Glutes', color: '#ff4fd8',
    exercises: [
      { name: 'Goblet Squat', sets: 4, reps: 10 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Walking Lunge', sets: 3, reps: 20 },
      { name: 'Glute Bridge', sets: 3, reps: 15 },
    ],
  },
  {
    id: 't_adv_power', name: 'Advanced Power', level: 'Advanced', focus: 'Strength · big lifts', color: '#ffcf5c',
    exercises: [
      { name: 'Squat', sets: 5, reps: 5 },
      { name: 'Deadlift', sets: 3, reps: 5 },
      { name: 'Bench Press', sets: 5, reps: 5 },
      { name: 'Weighted Pull Up', sets: 4, reps: 6 },
      { name: 'Barbell Hip Thrust', sets: 3, reps: 8 },
    ],
  },
  {
    id: 't_adv_athletic', name: 'Advanced Athletic', level: 'Advanced', focus: 'Explosive · full body', color: '#8b5cff',
    exercises: [
      { name: 'Power Clean', sets: 5, reps: 3 },
      { name: 'Front Squat', sets: 4, reps: 6 },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 10 },
      { name: 'Dips', sets: 3, reps: 12 },
      { name: 'Weighted Pull Up', sets: 3, reps: 8 },
    ],
  },
]
