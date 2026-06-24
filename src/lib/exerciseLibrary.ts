import { Level } from './types'

export interface LibExercise {
  name: string          // matched to an image where available
  level: Level
  muscle: string        // BROAD group used by the session engine (Chest/Back/Shoulders/Arms/Legs/Hamstrings/Glutes/Core/Cardio/Full Body)
  category: string      // FINE section used for the library/picker UI (Chest/Back/Biceps/Triceps/Quads/...)
  equipment: string
  def: string           // default sets×reps for auto-fill (e.g. "4x8", "3x12", "3x30s", "20 min")
  howto: string
}

/**
 * Comprehensive, static exercise catalogue (product content, not user data),
 * grouped into sections by `category`. `muscle` stays a broad bucket so the
 * "today's session" engine keeps working, while `category` powers the
 * section-by-section browser & picker. `def` auto-fills sets/reps on pick.
 */
export const EXERCISE_LIBRARY: LibExercise[] = [
  // ============ CHEST ============
  { name: 'Push Up', level: 'Beginner', muscle: 'Chest', category: 'Chest', equipment: 'Bodyweight', def: '3x15', howto: 'Hands shoulder-width, body in a straight line, lower until elbows ~90°, press back up.' },
  { name: 'Knee Push Up', level: 'Beginner', muscle: 'Chest', category: 'Chest', equipment: 'Bodyweight', def: '3x12', howto: 'Push up from the knees keeping a straight line from knees to head.' },
  { name: 'Incline Push Up', level: 'Beginner', muscle: 'Chest', category: 'Chest', equipment: 'Bodyweight', def: '3x15', howto: 'Hands on a bench/step, press up — easier variation that targets lower chest.' },
  { name: 'Bench Press', level: 'Intermediate', muscle: 'Chest', category: 'Chest', equipment: 'Barbell', def: '4x8', howto: 'Retract shoulder blades, lower bar to mid-chest, press up over shoulders.' },
  { name: 'Incline Bench Press', level: 'Intermediate', muscle: 'Chest', category: 'Chest', equipment: 'Barbell', def: '4x8', howto: 'Bench at 30°, lower bar to upper chest, press up — emphasises upper chest.' },
  { name: 'Dumbbell Bench Press', level: 'Intermediate', muscle: 'Chest', category: 'Chest', equipment: 'Dumbbell', def: '4x10', howto: 'Press dumbbells from chest level up over the shoulders, control the descent.' },
  { name: 'Incline Dumbbell Press', level: 'Intermediate', muscle: 'Chest', category: 'Chest', equipment: 'Dumbbell', def: '3x10', howto: 'Bench at 30°, press dumbbells up and slightly together.' },
  { name: 'Chest Fly', level: 'Intermediate', muscle: 'Chest', category: 'Chest', equipment: 'Dumbbell', def: '3x12', howto: 'Slight elbow bend, open arms wide then squeeze chest to bring them together.' },
  { name: 'Cable Crossover', level: 'Intermediate', muscle: 'Chest', category: 'Chest', equipment: 'Cable', def: '3x15', howto: 'Pull both handles down and across, squeezing the chest at the bottom.' },
  { name: 'Pec Deck Machine', level: 'Beginner', muscle: 'Chest', category: 'Chest', equipment: 'Machine', def: '3x12', howto: 'Bring the pads together in front, squeeze chest, return slowly.' },
  { name: 'Dips', level: 'Advanced', muscle: 'Chest', category: 'Chest', equipment: 'Bodyweight', def: '3x10', howto: 'Lean slightly forward, lower until shoulders below elbows, press up.' },

  // ============ BACK ============
  { name: 'Pull Up', level: 'Intermediate', muscle: 'Back', category: 'Back', equipment: 'Bodyweight', def: '3x8', howto: 'Hang, pull chin over the bar leading with the chest, control the descent.' },
  { name: 'Chin Up', level: 'Intermediate', muscle: 'Back', category: 'Back', equipment: 'Bodyweight', def: '3x8', howto: 'Underhand grip, pull up until chin clears the bar — hits back and biceps.' },
  { name: 'Weighted Pull Up', level: 'Advanced', muscle: 'Back', category: 'Back', equipment: 'Bodyweight', def: '4x6', howto: 'Add a belt/dumbbell, strict full-range pull-ups.' },
  { name: 'Lat Pulldown', level: 'Beginner', muscle: 'Back', category: 'Back', equipment: 'Cable', def: '3x12', howto: 'Pull the bar to upper chest, lead with elbows, control the return.' },
  { name: 'Seated Cable Row', level: 'Beginner', muscle: 'Back', category: 'Back', equipment: 'Cable', def: '3x12', howto: 'Pull the handle to your stomach, squeeze shoulder blades, keep torso upright.' },
  { name: 'Bent Over Row', level: 'Intermediate', muscle: 'Back', category: 'Back', equipment: 'Barbell', def: '4x8', howto: 'Hinge ~45°, row bar to lower ribs, squeeze, lower with control.' },
  { name: 'Dumbbell Row', level: 'Beginner', muscle: 'Back', category: 'Back', equipment: 'Dumbbell', def: '3x12', howto: 'Hinge at hips, pull the dumbbell to your hip, squeeze the shoulder blade.' },
  { name: 'T-Bar Row', level: 'Intermediate', muscle: 'Back', category: 'Back', equipment: 'Barbell', def: '4x10', howto: 'Hinge over the bar, row to the chest, drive elbows back and squeeze.' },
  { name: 'Face Pull', level: 'Intermediate', muscle: 'Back', category: 'Back', equipment: 'Cable', def: '3x15', howto: 'Pull rope toward the face, elbows high, squeeze rear delts and upper back.' },
  { name: 'Straight-Arm Pulldown', level: 'Intermediate', muscle: 'Back', category: 'Back', equipment: 'Cable', def: '3x15', howto: 'Arms straight, push the bar down to thighs using the lats.' },
  { name: 'Hyperextension', level: 'Beginner', muscle: 'Back', category: 'Back', equipment: 'Bodyweight', def: '3x15', howto: 'On a back-extension bench, hinge down then raise to a straight line — lower back.' },

  // ============ SHOULDERS ============
  { name: 'Overhead Press', level: 'Intermediate', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Barbell', def: '4x8', howto: 'Brace core, press bar overhead, finish with biceps by ears.' },
  { name: 'Dumbbell Shoulder Press', level: 'Beginner', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Dumbbell', def: '3x10', howto: 'Press dumbbells from shoulder height to overhead, control down.' },
  { name: 'Arnold Press', level: 'Intermediate', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Dumbbell', def: '3x10', howto: 'Start palms-in at chin, rotate out as you press overhead.' },
  { name: 'Lateral Raise', level: 'Intermediate', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Dumbbell', def: '3x15', howto: 'Slight bend in elbows, raise to shoulder height, lower slowly.' },
  { name: 'Front Raise', level: 'Beginner', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Dumbbell', def: '3x12', howto: 'Raise dumbbells in front to shoulder height, control the lowering.' },
  { name: 'Rear Delt Fly', level: 'Intermediate', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Dumbbell', def: '3x15', howto: 'Hinge forward, raise dumbbells out to the sides, squeeze rear delts.' },
  { name: 'Upright Row', level: 'Intermediate', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Barbell', def: '3x12', howto: 'Pull the bar up along the body to chest height, elbows leading.' },
  { name: 'Shrug', level: 'Beginner', muscle: 'Shoulders', category: 'Shoulders', equipment: 'Dumbbell', def: '3x15', howto: 'Lift shoulders straight up toward ears, squeeze traps, lower slowly.' },

  // ============ BICEPS ============
  { name: 'Biceps Curl', level: 'Beginner', muscle: 'Arms', category: 'Biceps', equipment: 'Dumbbell', def: '3x12', howto: 'Elbows pinned, curl up, squeeze, lower slowly.' },
  { name: 'Barbell Curl', level: 'Beginner', muscle: 'Arms', category: 'Biceps', equipment: 'Barbell', def: '3x10', howto: 'Curl the bar up keeping elbows fixed at your sides.' },
  { name: 'Hammer Curl', level: 'Beginner', muscle: 'Arms', category: 'Biceps', equipment: 'Dumbbell', def: '3x12', howto: 'Neutral (palms-in) grip, curl up — hits biceps and forearms.' },
  { name: 'Preacher Curl', level: 'Intermediate', muscle: 'Arms', category: 'Biceps', equipment: 'Dumbbell', def: '3x12', howto: 'Arm on the pad, curl up with strict form, full stretch at the bottom.' },
  { name: 'Concentration Curl', level: 'Beginner', muscle: 'Arms', category: 'Biceps', equipment: 'Dumbbell', def: '3x12', howto: 'Seated, elbow on inner thigh, curl with a peak squeeze.' },
  { name: 'Cable Curl', level: 'Beginner', muscle: 'Arms', category: 'Biceps', equipment: 'Cable', def: '3x15', howto: 'Constant tension curl from a low pulley, control the negative.' },

  // ============ TRICEPS ============
  { name: 'Triceps Pushdown', level: 'Beginner', muscle: 'Arms', category: 'Triceps', equipment: 'Cable', def: '3x15', howto: 'Elbows pinned, push the bar/rope down to full extension, squeeze.' },
  { name: 'Overhead Triceps Extension', level: 'Intermediate', muscle: 'Arms', category: 'Triceps', equipment: 'Dumbbell', def: '3x12', howto: 'Hold a dumbbell overhead, lower behind the head, extend back up.' },
  { name: 'Skull Crusher', level: 'Intermediate', muscle: 'Arms', category: 'Triceps', equipment: 'Barbell', def: '3x10', howto: 'Lying down, lower the bar to the forehead, extend with the triceps.' },
  { name: 'Close-Grip Bench Press', level: 'Intermediate', muscle: 'Arms', category: 'Triceps', equipment: 'Barbell', def: '4x8', howto: 'Narrow grip, lower to lower chest, press up driving with the triceps.' },
  { name: 'Triceps Dips (Bench)', level: 'Beginner', muscle: 'Arms', category: 'Triceps', equipment: 'Bodyweight', def: '3x12', howto: 'Hands on a bench behind you, lower the hips, press back up.' },
  { name: 'Triceps Kickback', level: 'Beginner', muscle: 'Arms', category: 'Triceps', equipment: 'Dumbbell', def: '3x15', howto: 'Hinge forward, extend the dumbbell back until the arm is straight.' },

  // ============ FOREARMS ============
  { name: 'Wrist Curl', level: 'Beginner', muscle: 'Arms', category: 'Forearms', equipment: 'Dumbbell', def: '3x15', howto: 'Forearms on thighs, curl the wrists up, control down.' },
  { name: 'Reverse Wrist Curl', level: 'Beginner', muscle: 'Arms', category: 'Forearms', equipment: 'Dumbbell', def: '3x15', howto: 'Palms-down, extend the wrists up to work the forearm extensors.' },
  { name: 'Farmer\'s Carry', level: 'Beginner', muscle: 'Arms', category: 'Forearms', equipment: 'Dumbbell', def: '3x30s', howto: 'Hold heavy dumbbells and walk tall with a strong grip.' },

  // ============ QUADS / LEGS ============
  { name: 'Bodyweight Squat', level: 'Beginner', muscle: 'Legs', category: 'Quads', equipment: 'Bodyweight', def: '3x15', howto: 'Feet shoulder-width, sit back and down keeping chest up, drive through heels.' },
  { name: 'Goblet Squat', level: 'Intermediate', muscle: 'Legs', category: 'Quads', equipment: 'Dumbbell', def: '3x12', howto: 'Hold a dumbbell at chest, squat deep keeping torso upright.' },
  { name: 'Squat', level: 'Advanced', muscle: 'Legs', category: 'Quads', equipment: 'Barbell', def: '4x6', howto: 'Bar on traps, brace, sit between hips below parallel, drive up.' },
  { name: 'Front Squat', level: 'Advanced', muscle: 'Legs', category: 'Quads', equipment: 'Barbell', def: '4x6', howto: 'Bar on front delts, elbows high, squat tall and upright.' },
  { name: 'Leg Press', level: 'Beginner', muscle: 'Legs', category: 'Quads', equipment: 'Machine', def: '3x12', howto: 'Feet mid-platform, lower to ~90°, press without locking knees hard.' },
  { name: 'Leg Extension', level: 'Beginner', muscle: 'Legs', category: 'Quads', equipment: 'Machine', def: '3x15', howto: 'Extend the knees to straight, squeeze quads, lower slowly.' },
  { name: 'Walking Lunge', level: 'Intermediate', muscle: 'Legs', category: 'Quads', equipment: 'Dumbbell', def: '3x20', howto: 'Step forward, drop back knee toward floor, drive up and alternate.' },
  { name: 'Bulgarian Split Squat', level: 'Advanced', muscle: 'Legs', category: 'Quads', equipment: 'Dumbbell', def: '3x10', howto: 'Rear foot elevated, drop straight down, drive through the front heel.' },
  { name: 'Step Up', level: 'Beginner', muscle: 'Legs', category: 'Quads', equipment: 'Dumbbell', def: '3x12', howto: 'Step onto a box driving through the lead heel, control down.' },
  { name: 'Hack Squat', level: 'Intermediate', muscle: 'Legs', category: 'Quads', equipment: 'Machine', def: '3x10', howto: 'Back on the pad, squat down and press up through the heels.' },

  // ============ HAMSTRINGS ============
  { name: 'Romanian Deadlift', level: 'Intermediate', muscle: 'Hamstrings', category: 'Hamstrings', equipment: 'Barbell', def: '4x8', howto: 'Soft knees, push hips back, bar close to legs, feel the hamstring stretch.' },
  { name: 'Lying Leg Curl', level: 'Beginner', muscle: 'Hamstrings', category: 'Hamstrings', equipment: 'Machine', def: '3x12', howto: 'Curl the pad toward your glutes, squeeze, lower slowly.' },
  { name: 'Seated Leg Curl', level: 'Beginner', muscle: 'Hamstrings', category: 'Hamstrings', equipment: 'Machine', def: '3x12', howto: 'Drive the pad down and under, squeeze the hamstrings.' },
  { name: 'Stiff-Leg Deadlift', level: 'Intermediate', muscle: 'Hamstrings', category: 'Hamstrings', equipment: 'Dumbbell', def: '3x10', howto: 'Near-straight legs, hinge at the hips lowering the weights down the shins.' },
  { name: 'Good Morning', level: 'Advanced', muscle: 'Hamstrings', category: 'Hamstrings', equipment: 'Barbell', def: '3x10', howto: 'Bar on back, hinge forward with a flat back, return by squeezing glutes/hams.' },

  // ============ GLUTES ============
  { name: 'Glute Bridge', level: 'Beginner', muscle: 'Glutes', category: 'Glutes', equipment: 'Bodyweight', def: '3x15', howto: 'Lie on back, drive hips up squeezing glutes, lower under control.' },
  { name: 'Barbell Hip Thrust', level: 'Advanced', muscle: 'Glutes', category: 'Glutes', equipment: 'Barbell', def: '4x10', howto: 'Upper back on bench, drive hips up to full extension, squeeze.' },
  { name: 'Cable Kickback', level: 'Beginner', muscle: 'Glutes', category: 'Glutes', equipment: 'Cable', def: '3x15', howto: 'Kick the leg straight back from a low cable, squeeze the glute.' },
  { name: 'Sumo Deadlift', level: 'Advanced', muscle: 'Glutes', category: 'Glutes', equipment: 'Barbell', def: '4x6', howto: 'Wide stance, grip inside knees, drive hips through to lock out.' },
  { name: 'Curtsy Lunge', level: 'Intermediate', muscle: 'Glutes', category: 'Glutes', equipment: 'Dumbbell', def: '3x12', howto: 'Step one leg behind and across, lower, then drive back up.' },

  // ============ CALVES ============
  { name: 'Standing Calf Raise', level: 'Beginner', muscle: 'Legs', category: 'Calves', equipment: 'Machine', def: '4x15', howto: 'Rise onto the toes as high as possible, pause, lower for a full stretch.' },
  { name: 'Seated Calf Raise', level: 'Beginner', muscle: 'Legs', category: 'Calves', equipment: 'Machine', def: '4x15', howto: 'Knees bent under the pad, raise the heels, squeeze, lower slowly.' },

  // ============ CORE / ABS ============
  { name: 'Plank', level: 'Beginner', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x40s', howto: 'Forearms down, body straight, brace the core and hold without sagging.' },
  { name: 'Side Plank', level: 'Beginner', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x30s', howto: 'On one forearm, body in a straight diagonal line, hold and switch sides.' },
  { name: 'Crunch', level: 'Beginner', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x20', howto: 'Curl the shoulders off the floor, squeeze the abs, lower slowly.' },
  { name: 'Bicycle Crunch', level: 'Beginner', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x20', howto: 'Alternate elbow to opposite knee in a pedalling motion.' },
  { name: 'Hanging Leg Raise', level: 'Advanced', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x12', howto: 'Hang from a bar, raise straight legs to hip height, lower with control.' },
  { name: 'Leg Raise', level: 'Beginner', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x15', howto: 'Lying down, raise straight legs to vertical, lower without touching the floor.' },
  { name: 'Russian Twist', level: 'Intermediate', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x20', howto: 'Lean back, rotate the torso side to side, optionally holding a weight.' },
  { name: 'Mountain Climber', level: 'Beginner', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x40s', howto: 'In a plank, drive the knees toward the chest alternately and fast.' },
  { name: 'Cable Crunch', level: 'Intermediate', muscle: 'Core', category: 'Core', equipment: 'Cable', def: '3x15', howto: 'Kneel at a cable, crunch the torso down rounding the spine, squeeze abs.' },
  { name: 'Ab Wheel Rollout', level: 'Advanced', muscle: 'Core', category: 'Core', equipment: 'Bodyweight', def: '3x10', howto: 'Roll the wheel out keeping a braced flat back, pull back in with the abs.' },

  // ============ CARDIO / CONDITIONING ============
  { name: 'Burpee', level: 'Intermediate', muscle: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', def: '3x40s', howto: 'Squat, kick to plank, push-up, jump the feet in and explode up.' },
  { name: 'Jumping Jacks', level: 'Beginner', muscle: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', def: '3x40s', howto: 'Jump feet out while raising arms overhead, then back in — keep a rhythm.' },
  { name: 'High Knees', level: 'Beginner', muscle: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', def: '3x40s', howto: 'Run in place driving the knees up to hip height as fast as possible.' },
  { name: 'Jump Rope', level: 'Beginner', muscle: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', def: '5x60s', howto: 'Light bounces on the balls of the feet, turning the rope from the wrists.' },
  { name: 'Box Jump', level: 'Intermediate', muscle: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', def: '4x10', howto: 'Explode onto a box landing softly, step down and repeat.' },
  { name: 'Treadmill Run', level: 'Beginner', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', def: '20 min', howto: 'Steady run or intervals at a pace you can sustain.' },
  { name: 'Cycling', level: 'Beginner', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', def: '30 min', howto: 'Steady or interval cycling, keep cadence smooth.' },
  { name: 'Rowing Machine', level: 'Beginner', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', def: '15 min', howto: 'Drive with the legs, then pull — full-body conditioning.' },

  // ============ FULL BODY / OLYMPIC ============
  { name: 'Deadlift', level: 'Advanced', muscle: 'Full Body', category: 'Full Body', equipment: 'Barbell', def: '3x5', howto: 'Bar over mid-foot, flat back, drive the floor away, lock out hips.' },
  { name: 'Power Clean', level: 'Advanced', muscle: 'Full Body', category: 'Full Body', equipment: 'Barbell', def: '5x3', howto: 'Explosively pull and catch the bar on the front delts in a quarter squat.' },
  { name: 'Clean and Press', level: 'Advanced', muscle: 'Full Body', category: 'Full Body', equipment: 'Barbell', def: '5x3', howto: 'Clean the bar to the shoulders, then press overhead in one fluid effort.' },
  { name: 'Kettlebell Swing', level: 'Intermediate', muscle: 'Full Body', category: 'Full Body', equipment: 'Kettlebell', def: '4x15', howto: 'Hinge and snap the hips to swing the bell to chest height, glutes drive it.' },
  { name: 'Thruster', level: 'Intermediate', muscle: 'Full Body', category: 'Full Body', equipment: 'Dumbbell', def: '4x12', howto: 'Front squat into an overhead press in one continuous movement.' },
  { name: 'Turkish Get-Up', level: 'Advanced', muscle: 'Full Body', category: 'Full Body', equipment: 'Kettlebell', def: '3x5', howto: 'From lying, stand up while holding a weight overhead, then reverse it.' },
]

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced']

/** Ordered section labels for the browser & picker. */
export const EX_CATEGORIES: string[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio', 'Full Body',
]

/** name -> exercise (fast lookup). */
export const EXERCISE_BY_NAME: Record<string, LibExercise> =
  Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.name, e]))

/** Exercises grouped by section, in EX_CATEGORIES order. */
export const EXERCISES_BY_CATEGORY: { category: string; items: LibExercise[] }[] =
  EX_CATEGORIES.map((category) => ({ category, items: EXERCISE_LIBRARY.filter((e) => e.category === category) }))
    .filter((g) => g.items.length > 0)

/** Default "sets×reps" text for an exercise (used to auto-fill on selection). */
export function exerciseDef(name: string): string {
  return EXERCISE_BY_NAME[name.trim()]?.def || '3x10'
}
/** Parse a def string into numeric sets/reps (best-effort, for routines). */
export function defToSetsReps(def: string): { sets: number; reps: number } {
  const m = def.match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (m) return { sets: +m[1], reps: +m[2] }
  return { sets: 3, reps: 12 }
}

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
      { name: 'Mountain Climber', sets: 3, reps: 1 },
    ],
  },
  {
    id: 't_int_push', name: 'Push Day', level: 'Intermediate', focus: 'Chest · Shoulders · Triceps', color: '#8b5cff',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
      { name: 'Overhead Press', sets: 3, reps: 8 },
      { name: 'Lateral Raise', sets: 3, reps: 15 },
      { name: 'Triceps Pushdown', sets: 3, reps: 15 },
    ],
  },
  {
    id: 't_int_pull', name: 'Pull Day', level: 'Intermediate', focus: 'Back · Biceps', color: '#22e3ff',
    exercises: [
      { name: 'Pull Up', sets: 3, reps: 8 },
      { name: 'Bent Over Row', sets: 3, reps: 10 },
      { name: 'Lat Pulldown', sets: 3, reps: 12 },
      { name: 'Face Pull', sets: 3, reps: 15 },
      { name: 'Barbell Curl', sets: 3, reps: 12 },
    ],
  },
  {
    id: 't_int_legs', name: 'Leg Day', level: 'Intermediate', focus: 'Quads · Hamstrings · Glutes', color: '#ff4fd8',
    exercises: [
      { name: 'Goblet Squat', sets: 4, reps: 10 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Walking Lunge', sets: 3, reps: 20 },
      { name: 'Standing Calf Raise', sets: 4, reps: 15 },
    ],
  },
  {
    id: 't_int_upper', name: 'Upper Body', level: 'Intermediate', focus: 'Chest · Back · Arms', color: '#8b5cff',
    exercises: [
      { name: 'Dumbbell Bench Press', sets: 4, reps: 10 },
      { name: 'Seated Cable Row', sets: 4, reps: 12 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10 },
      { name: 'Hammer Curl', sets: 3, reps: 12 },
      { name: 'Triceps Pushdown', sets: 3, reps: 15 },
    ],
  },
  {
    id: 't_core', name: 'Core & Abs', level: 'Beginner', focus: 'Abs · core stability', color: '#2bffb0',
    exercises: [
      { name: 'Plank', sets: 3, reps: 1 },
      { name: 'Bicycle Crunch', sets: 3, reps: 20 },
      { name: 'Leg Raise', sets: 3, reps: 15 },
      { name: 'Russian Twist', sets: 3, reps: 20 },
      { name: 'Mountain Climber', sets: 3, reps: 1 },
    ],
  },
  {
    id: 't_hiit', name: 'HIIT Fat Burn', level: 'Beginner', focus: 'Cardio circuit · weight loss', color: '#ff4fd8',
    exercises: [
      { name: 'Burpee', sets: 4, reps: 1 },
      { name: 'Jumping Jacks', sets: 4, reps: 1 },
      { name: 'High Knees', sets: 4, reps: 1 },
      { name: 'Mountain Climber', sets: 4, reps: 1 },
      { name: 'Bodyweight Squat', sets: 4, reps: 20 },
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
