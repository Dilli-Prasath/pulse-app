import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Cloud is "configured" only when both env vars are present and look real.
export const cloudConfigured = Boolean(url && anon && url.startsWith('http') && anon.length > 20)

export const supabase: SupabaseClient | null = cloudConfigured
  ? createClient(url as string, anon as string)
  : null

/**
 * One row per user holds the entire app document as JSON in `data`.
 * Simple, robust, and works perfectly for a personal tracker.
 * See supabase/schema.sql for the table + Row Level Security policies.
 */
export const TABLE = 'pulse_state'
