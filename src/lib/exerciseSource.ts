/**
 * Unified exercise search with automatic failover.
 *
 * Order depends on the user's setting:
 *   - 'auto'  : API Ninjas first; if it errors / hits its limit / returns
 *               nothing, immediately fall back to wger.
 *   - 'ninja' : API Ninjas only.
 *   - 'wger'  : wger only (no key, unlimited).
 *
 * Returns a normalized shape plus which provider actually answered, so the UI
 * can show a "served by" badge.
 */
import { searchExercises as ninjaSearch, NinjaExercise } from './apiNinjas'
import { wgerGet } from './wgerApi'
import { ExerciseSource } from './types'

export interface UnifiedExercise {
  name: string
  type: string
  muscle: string
  equipment: string
  difficulty: string
  instructions: string
}
export interface ExerciseSearchResult {
  items: UnifiedExercise[]
  provider: 'ninja' | 'wger' | 'none'
  fellBack: boolean
}

/** Map a wger muscle/category term to something both APIs understand. */
function fromNinja(e: NinjaExercise): UnifiedExercise {
  return {
    name: e.name, type: e.type || 'strength', muscle: (e.muscle || '').replace(/_/g, ' '),
    equipment: e.equipment || '—', difficulty: e.difficulty || '—', instructions: e.instructions || '',
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function wgerSearch(muscle: string): Promise<UnifiedExercise[]> {
  // wger search endpoint returns name suggestions (proxied with the wger key when signed in).
  const json = await wgerGet('exercise/search/', { language: 'en', format: 'json', term: muscle })
  const list: any[] = json?.suggestions || []
  const seen = new Set<string>()
  const items: UnifiedExercise[] = []
  for (const s of list) {
    const name: string = s?.value || s?.data?.name
    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    items.push({
      name,
      type: 'strength',
      muscle: s?.data?.category || muscle,
      equipment: '—',
      difficulty: '—',
      instructions: 'Open the Library for form tips, or search this exercise online for a full guide.',
    })
    if (items.length >= 16) break
  }
  return items
}

export async function findExercises(
  params: { muscle: string; difficulty?: string },
  source: ExerciseSource,
): Promise<ExerciseSearchResult> {
  const tryNinja = source === 'auto' || source === 'ninja'
  const tryWger = source === 'auto' || source === 'wger'

  if (tryNinja) {
    try {
      const n = await ninjaSearch({ muscle: params.muscle, difficulty: params.difficulty })
      if (n.length) return { items: n.map(fromNinja), provider: 'ninja', fellBack: false }
      // empty (often = quota exhausted or no match) → fall through to wger in auto mode
      if (source === 'ninja') return { items: [], provider: 'none', fellBack: false }
    } catch {
      if (source === 'ninja') return { items: [], provider: 'none', fellBack: false }
    }
  }

  if (tryWger) {
    try {
      const w = await wgerSearch(params.muscle)
      return { items: w, provider: 'wger', fellBack: source === 'auto' && tryNinja }
    } catch {
      return { items: [], provider: 'none', fellBack: false }
    }
  }

  return { items: [], provider: 'none', fellBack: false }
}
