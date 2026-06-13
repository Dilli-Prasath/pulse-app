/**
 * Global, admin-curated leaderboard.
 *
 * Everyone signed in can READ it. Only the admin can add / edit / delete —
 * enforced in the database with Row Level Security (see supabase/schema.sql),
 * not just hidden in the UI. The UI also checks isAdmin() to show controls.
 */
import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'

export const ADMIN_EMAIL = 'dilli.prasath0201@gmail.com'

export function isAdmin(session: Session | null): boolean {
  return !!session && (session.user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export interface LbEntry {
  id?: string
  name: string
  avatar_color: string
  weight_lost: number
  streak: number
  weekly_workouts: number
  note?: string
  updated_at?: string
}

export async function fetchLeaderboard(): Promise<LbEntry[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('leaderboard').select('*').order('weight_lost', { ascending: false })
  if (error) return []
  return (data as LbEntry[]) || []
}

export async function upsertEntry(e: LbEntry): Promise<string | null> {
  if (!supabase) return 'Cloud not configured'
  const row = { ...e, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('leaderboard').upsert(row)
  return error ? error.message : null
}

export async function deleteEntry(id: string): Promise<string | null> {
  if (!supabase) return 'Cloud not configured'
  const { error } = await supabase.from('leaderboard').delete().eq('id', id)
  return error ? error.message : null
}
