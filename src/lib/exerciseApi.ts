/**
 * Exercise visuals — deterministic generated tiles (see note on getExerciseImage).
 */

const GRADIENTS = [
  ['#22e3ff', '#8b5cff'],
  ['#8b5cff', '#ff4fd8'],
  ['#2bffb0', '#22e3ff'],
  ['#ffcf5c', '#ff4fd8'],
]

/** Deterministic, always-available SVG placeholder (data URI). */
export function placeholderImage(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const [a, b] = GRADIENTS[h % GRADIENTS.length]
  const letter = (name.trim()[0] || '?').toUpperCase()
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
    <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs>
    <rect width='200' height='200' rx='20' fill='url(#g)' opacity='0.22'/>
    <text x='100' y='118' font-family='Inter,sans-serif' font-size='90' font-weight='800'
      text-anchor='middle' fill='${a}' opacity='0.85'>${letter}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

/**
 * Real exercise photos from the open, free "free-exercise-db" (served from
 * GitHub raw with permissive CORS, no key). We map our curated exercise names
 * to verified image paths; anything unmapped falls back to a generated tile,
 * and the <img> onError also falls back, so a visual always shows.
 */
const EX_IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const EXERCISE_IMAGES: Record<string, string> = {
  'Push Up': 'Pushups/0.jpg',
  'Bodyweight Squat': 'Bodyweight_Squat/0.jpg',
  'Plank': 'Plank/0.jpg',
  'Dumbbell Row': 'One-Arm_Dumbbell_Row/0.jpg',
  'Glute Bridge': 'Barbell_Glute_Bridge/0.jpg',
  'Lat Pulldown': 'Wide-Grip_Lat_Pulldown/0.jpg',
  'Leg Press': 'Leg_Press/0.jpg',
  'Biceps Curl': 'Dumbbell_Bicep_Curl/0.jpg',
  'Bench Press': 'Barbell_Bench_Press_-_Medium_Grip/0.jpg',
  'Goblet Squat': 'Goblet_Squat/0.jpg',
  'Romanian Deadlift': 'Romanian_Deadlift/0.jpg',
  'Overhead Press': 'Standing_Military_Press/0.jpg',
  'Pull Up': 'Pullups/0.jpg',
  'Bent Over Row': 'Bent_Over_Barbell_Row/0.jpg',
  'Walking Lunge': 'Barbell_Walking_Lunge/0.jpg',
  'Incline Dumbbell Press': 'Incline_Dumbbell_Press/0.jpg',
  'Lateral Raise': 'Side_Lateral_Raise/0.jpg',
  'Deadlift': 'Barbell_Deadlift/0.jpg',
  'Squat': 'Barbell_Full_Squat/0.jpg',
  'Front Squat': 'Front_Barbell_Squat/0.jpg',
  'Barbell Hip Thrust': 'Barbell_Hip_Thrust/0.jpg',
  'Weighted Pull Up': 'Weighted_Pull_Ups/0.jpg',
  'Dips': 'Dips_-_Triceps_Version/0.jpg',
  'Power Clean': 'Power_Clean/0.jpg',
  'Bulgarian Split Squat': 'Barbell_Side_Split_Squat/0.jpg',
  'Hanging Leg Raise': 'Hanging_Leg_Raise/0.jpg',
  'Triceps Pushdown': 'Triceps_Pushdown/0.jpg',
  // ---- expanded catalogue (best-effort free-exercise-db paths; unmapped/404 fall back to a tile) ----
  'Incline Push Up': 'Incline_Push-Up/0.jpg',
  'Incline Bench Press': 'Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg',
  'Dumbbell Bench Press': 'Dumbbell_Bench_Press/0.jpg',
  'Chest Fly': 'Dumbbell_Flyes/0.jpg',
  'Cable Crossover': 'Cable_Crossover/0.jpg',
  'Pec Deck Machine': 'Butterfly/0.jpg',
  'Chin Up': 'Chin-Up/0.jpg',
  'Seated Cable Row': 'Seated_Cable_Rows/0.jpg',
  'T-Bar Row': 'Lying_T-Bar_Row/0.jpg',
  'Face Pull': 'Face_Pull/0.jpg',
  'Straight-Arm Pulldown': 'Straight-Arm_Pulldown/0.jpg',
  'Hyperextension': 'Hyperextensions_(Back_Extensions)/0.jpg',
  'Dumbbell Shoulder Press': 'Dumbbell_Shoulder_Press/0.jpg',
  'Arnold Press': 'Arnold_Dumbbell_Press/0.jpg',
  'Front Raise': 'Front_Dumbbell_Raise/0.jpg',
  'Rear Delt Fly': 'Reverse_Flyes/0.jpg',
  'Upright Row': 'Upright_Barbell_Row/0.jpg',
  'Shrug': 'Dumbbell_Shrug/0.jpg',
  'Barbell Curl': 'Barbell_Curl/0.jpg',
  'Hammer Curl': 'Hammer_Curls/0.jpg',
  'Preacher Curl': 'Preacher_Curl/0.jpg',
  'Concentration Curl': 'Concentration_Curls/0.jpg',
  'Overhead Triceps Extension': 'Seated_Triceps_Press/0.jpg',
  'Skull Crusher': 'Lying_Triceps_Press/0.jpg',
  'Close-Grip Bench Press': 'Close-Grip_Barbell_Bench_Press/0.jpg',
  'Triceps Dips (Bench)': 'Bench_Dips/0.jpg',
  'Triceps Kickback': 'Tricep_Dumbbell_Kickback/0.jpg',
  "Farmer's Carry": 'Farmers_Walk/0.jpg',
  'Leg Extension': 'Leg_Extensions/0.jpg',
  'Step Up': 'Dumbbell_Step_Ups/0.jpg',
  'Hack Squat': 'Hack_Squat/0.jpg',
  'Lying Leg Curl': 'Lying_Leg_Curls/0.jpg',
  'Seated Leg Curl': 'Seated_Leg_Curl/0.jpg',
  'Stiff-Leg Deadlift': 'Stiff-Legged_Dumbbell_Deadlift/0.jpg',
  'Good Morning': 'Good_Morning/0.jpg',
  'Sumo Deadlift': 'Sumo_Deadlift/0.jpg',
  'Standing Calf Raise': 'Standing_Calf_Raises/0.jpg',
  'Seated Calf Raise': 'Seated_Calf_Raise/0.jpg',
  'Crunch': 'Crunches/0.jpg',
  'Bicycle Crunch': 'Air_Bike/0.jpg',
  'Leg Raise': 'Flat_Bench_Lying_Leg_Raise/0.jpg',
  'Russian Twist': 'Russian_Twist/0.jpg',
  'Mountain Climber': 'Mountain_Climbers/0.jpg',
  'Cable Crunch': 'Cable_Crunch/0.jpg',
  'Ab Wheel Rollout': 'Ab_Roller/0.jpg',
  'Kettlebell Swing': 'Kettlebell_Swings/0.jpg',
  'Clean and Press': 'Clean_and_Press/0.jpg',
  'Box Jump': 'Box_Jump_(Multiple_Response)/0.jpg',
  'Burpee': 'Burpee/0.jpg',
}

/** Resolve a real photo URL for an exercise, or a generated tile if unmapped. */
export function exerciseImageUrl(name: string): string {
  const path = EXERCISE_IMAGES[name.trim()]
  return path ? EX_IMG_BASE + path : placeholderImage(name)
}

export async function getExerciseImage(name: string): Promise<string> {
  return exerciseImageUrl(name)
}
