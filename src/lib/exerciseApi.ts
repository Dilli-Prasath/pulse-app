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
 * Returns a visual for an exercise.
 *
 * Note: wger removed its public exercise search/autocomplete endpoint (its list
 * filters are ignored too), so reliable name→image matching is no longer
 * possible without a paid provider. We render a clean, deterministic generated
 * tile instead — instant, offline, and zero network errors. (A real-photo
 * provider can be slotted in here later.)
 */
export async function getExerciseImage(name: string): Promise<string> {
  return placeholderImage(name)
}
