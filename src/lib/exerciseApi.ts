/**
 * Exercise image service backed by the free & open wger.de API.
 * No API key required. Results are cached in localStorage so we don't
 * hammer the network, and every lookup degrades gracefully to a
 * generated SVG placeholder if the API is unreachable / has no image.
 */

import { wgerGet } from './wgerApi'

const BASE = 'https://wger.de'
const CACHE_KEY = 'pulse_ex_imgcache_v1'

type Cache = Record<string, string> // exerciseName(lower) -> image url (or '' = none)

function readCache(): Cache {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}
function writeCache(c: Cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)) } catch { /* ignore */ }
}

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

interface Suggestion {
  data?: { image?: string | null; image_thumbnail?: string | null; name?: string }
}

/** Look up a real exercise image; falls back to a placeholder. Cached. */
export async function getExerciseImage(name: string): Promise<string> {
  const key = name.trim().toLowerCase()
  if (!key) return placeholderImage(name)
  const cache = readCache()
  if (key in cache) return cache[key] || placeholderImage(name)

  try {
    const json = await wgerGet('exercise/search/', { language: 'en', format: 'json', term: name })
    const list: Suggestion[] = json?.suggestions || []
    let img = ''
    for (const s of list) {
      const raw = s?.data?.image || s?.data?.image_thumbnail
      if (raw) { img = raw.startsWith('http') ? raw : BASE + raw; break }
    }
    cache[key] = img
    writeCache(cache)
    return img || placeholderImage(name)
  } catch {
    // Don't cache failures so we can retry later; just use placeholder now.
    return placeholderImage(name)
  }
}
