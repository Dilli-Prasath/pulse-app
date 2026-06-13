/**
 * wger API access.
 *
 * When the user is signed in, calls go through our Supabase Edge Function,
 * which attaches the wger token (WGER_API_KEY secret) server-side — so the key
 * is never in the browser bundle and you get the higher authenticated limits.
 *
 * When there's no session (offline / cloud not configured), it falls back to
 * wger's free public endpoints directly, keyless. Either way it just works.
 */
import { supabase } from './supabase'
import { useStore } from './store'

const BASE = 'https://wger.de/api/v2'

/* eslint-disable @typescript-eslint/no-explicit-any */
async function viaProxy(path: string, query: Record<string, string>): Promise<any> {
  const { data, error } = await supabase!.functions.invoke('api-ninjas', {
    body: { endpoint: 'wger', params: { path, ...query } },
  })
  if (error) throw error
  if (data && (data as { error?: string }).error) throw new Error((data as { error: string }).error)
  return data
}

async function direct(path: string, query: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(query).toString()
  const res = await fetch(`${BASE}/${path.replace(/^\/+/, '')}?${qs}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('wger ' + res.status)
  return res.json()
}

/** GET a wger v2 path (e.g. 'exercise/search/') with query params. */
export async function wgerGet(path: string, query: Record<string, string> = {}): Promise<any> {
  const canProxy = !!(supabase && useStore.getState().session)
  if (canProxy) {
    try { return await viaProxy(path, query) } catch { /* fall back to keyless */ }
  }
  return direct(path, query)
}
