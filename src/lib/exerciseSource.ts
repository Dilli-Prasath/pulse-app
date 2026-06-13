/**
 * Unified exercise search.
 *
 * API Ninjas is the live exercise database (proxied through our Supabase Edge
 * Function, so failures/limits happen server-side and never spam the browser
 * console). wger no longer offers a usable public search endpoint, so it can't
 * serve text search anymore — when the source is 'wger' or API Ninjas returns
 * nothing, we degrade gracefully to an empty result.
 */
import { searchExercises as ninjaSearch, NinjaExercise } from './apiNinjas'
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

function fromNinja(e: NinjaExercise): UnifiedExercise {
  return {
    name: e.name, type: e.type || 'strength', muscle: (e.muscle || '').replace(/_/g, ' '),
    equipment: e.equipment || '—', difficulty: e.difficulty || '—', instructions: e.instructions || '',
  }
}

export async function findExercises(
  params: { muscle: string; difficulty?: string },
  source: ExerciseSource,
): Promise<ExerciseSearchResult> {
  // 'wger' has no usable search endpoint anymore; fall through to API Ninjas.
  try {
    const n = await ninjaSearch({ muscle: params.muscle, difficulty: params.difficulty })
    if (n.length) return { items: n.map(fromNinja), provider: 'ninja', fellBack: source === 'wger' }
  } catch {
    /* swallow — handled below */
  }
  return { items: [], provider: 'none', fellBack: false }
}
