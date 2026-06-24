/**
 * Groups / teams. Members can read their groups and each member's published
 * stats. Enforced by Supabase RLS (see supabase/schema.sql).
 */
import { supabase, TABLE } from './supabase'
import { AppData } from './types'

export interface Group { id: string; name: string; owner_id: string; invite_code: string; created_at?: string }
export interface GroupMember {
  group_id: string; user_id: string; name: string; color: string
  weight_lost: number; streak: number; weekly_workouts: number; updated_at?: string
}
export interface MemberStats { name: string; color: string; weight_lost: number; streak: number; weekly_workouts: number }

function code(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createGroup(name: string, me: MemberStats): Promise<{ group?: Group; error?: string }> {
  if (!supabase) return { error: 'Cloud not configured' }
  const uid = (await supabase.auth.getUser()).data.user?.id
  if (!uid) return { error: 'Not signed in' }
  const { data, error } = await supabase.from('groups')
    .insert({ name, owner_id: uid, invite_code: code() }).select().single()
  if (error) return { error: error.message }
  const g = data as Group
  await supabase.from('group_members').upsert({ group_id: g.id, user_id: uid, ...me })
  return { group: g }
}

export async function myGroups(): Promise<Group[]> {
  if (!supabase) return []
  const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: true })
  return (data as Group[]) || []
}

export async function groupMembers(groupId: string): Promise<GroupMember[]> {
  if (!supabase) return []
  const { data } = await supabase.from('group_members').select('*').eq('group_id', groupId).order('weight_lost', { ascending: false })
  return (data as GroupMember[]) || []
}

export async function joinByCode(code: string, me: MemberStats): Promise<{ groupId?: string; error?: string }> {
  if (!supabase) return { error: 'Cloud not configured' }
  const { data, error } = await supabase.rpc('join_group', { p_code: code.trim().toUpperCase(), p_name: me.name, p_color: me.color })
  if (error) return { error: error.message }
  if (!data) return { error: 'Invalid or expired invite code' }
  // refresh our stats on the row
  const uid = (await supabase.auth.getUser()).data.user?.id
  if (uid) await supabase.from('group_members').upsert({ group_id: data as string, user_id: uid, ...me })
  return { groupId: data as string }
}

/** Push the signed-in user's latest stats to every group they're in. */
export async function publishStats(groupIds: string[], me: MemberStats): Promise<void> {
  if (!supabase || !groupIds.length) return
  const uid = (await supabase.auth.getUser()).data.user?.id
  if (!uid) return
  await supabase.from('group_members').upsert(groupIds.map((g) => ({ group_id: g, user_id: uid, ...me })))
}

export async function leaveGroup(groupId: string): Promise<void> {
  if (!supabase) return
  const uid = (await supabase.auth.getUser()).data.user?.id
  if (!uid) return
  await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', uid)
}

export function inviteLink(code: string): string {
  return `${window.location.origin}/friends?join=${code}`
}

/** The signed-in user's id (used to hide "View" on your own row). */
export async function currentUserId(): Promise<string | null> {
  if (!supabase) return null
  return (await supabase.auth.getUser()).data.user?.id ?? null
}

/**
 * Fetch a teammate's full app data — succeeds only if they enabled sharing and
 * share a group with you (enforced by Supabase RLS). Returns null otherwise.
 * Page-level visibility is then read from data.sharing.pages by the viewer.
 */
export async function fetchMemberData(userId: string): Promise<AppData | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from(TABLE).select('data').eq('user_id', userId).maybeSingle()
  if (error || !data?.data) return null
  return data.data as AppData
}
