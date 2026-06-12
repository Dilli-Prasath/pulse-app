import { create } from 'zustand'
import { AppData, Profile, Workout, Meal, WeightEntry, Friend, Routine } from './types'
import { seed, uid } from './seed'
import { supabase, cloudConfigured, TABLE } from './supabase'
import type { Session } from '@supabase/supabase-js'

const LOCAL_KEY = 'pulse_fit_v2'

function loadLocal(): AppData {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return migrate(JSON.parse(raw))
  } catch {
    /* ignore */
  }
  return seed()
}
function migrate(d: Partial<AppData>): AppData {
  const base = seed()
  return {
    profile: { ...base.profile, ...(d.profile || {}) },
    weights: d.weights ?? base.weights,
    workouts: d.workouts ?? [],
    meals: d.meals ?? [],
    friends: d.friends ?? base.friends,
    routines: d.routines && d.routines.length ? d.routines : base.routines,
  }
}
function saveLocal(d: AppData) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(d))
}

type SyncState = 'local' | 'syncing' | 'synced' | 'error' | 'signedout'

interface StoreState {
  data: AppData
  session: Session | null
  cloud: boolean
  sync: SyncState
  toast: string | null

  init: () => Promise<void>
  showToast: (msg: string) => void
  persist: () => void
  pullCloud: () => Promise<void>
  pushCloud: () => Promise<void>

  // auth
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>

  // mutations
  update: (fn: (d: AppData) => void) => void
  addWorkout: (w: Omit<Workout, 'id'>) => void
  delWorkout: (id: string) => void
  addMeal: (m: Omit<Meal, 'id'>) => void
  delMeal: (id: string) => void
  logWeight: (e: WeightEntry) => void
  addFriend: (f: Omit<Friend, 'id'>) => void
  delFriend: (id: string) => void
  saveProfile: (p: Partial<Profile>) => void
  addRoutine: (r: Omit<Routine, 'id'>) => void
  delRoutine: (id: string) => void
  resetAll: () => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<StoreState>((set, get) => ({
  data: loadLocal(),
  session: null,
  cloud: cloudConfigured,
  sync: cloudConfigured ? 'signedout' : 'local',
  toast: null,

  showToast: (msg) => {
    set({ toast: msg })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toast: null }), 2400)
  },

  persist: () => {
    saveLocal(get().data)
    if (get().session) void get().pushCloud()
  },

  init: async () => {
    if (!cloudConfigured || !supabase) {
      set({ sync: 'local' })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    set({ session })
    if (session) await get().pullCloud()
    supabase.auth.onAuthStateChange((_e, s) => {
      set({ session: s, sync: s ? 'synced' : 'signedout' })
      if (s) void get().pullCloud()
    })
  },

  pullCloud: async () => {
    if (!supabase || !get().session) return
    set({ sync: 'syncing' })
    const uidv = get().session!.user.id
    const { data, error } = await supabase.from(TABLE).select('data').eq('user_id', uidv).maybeSingle()
    if (error) { set({ sync: 'error' }); return }
    if (data?.data) {
      set({ data: migrate(data.data as AppData), sync: 'synced' })
      saveLocal(get().data)
    } else {
      // first login: push current local data up
      await get().pushCloud()
    }
    set({ sync: 'synced' })
  },

  pushCloud: async () => {
    if (!supabase || !get().session) return
    set({ sync: 'syncing' })
    const uidv = get().session!.user.id
    const { error } = await supabase.from(TABLE).upsert({ user_id: uidv, data: get().data, updated_at: new Date().toISOString() })
    set({ sync: error ? 'error' : 'synced' })
  },

  signIn: async (email, password) => {
    if (!supabase) return 'Cloud not configured'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  },
  signUp: async (email, password) => {
    if (!supabase) return 'Cloud not configured'
    const { error } = await supabase.auth.signUp({ email, password })
    return error ? error.message : null
  },
  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ session: null, sync: cloudConfigured ? 'signedout' : 'local' })
  },

  update: (fn) => {
    const next = structuredClone(get().data)
    fn(next)
    set({ data: next })
    get().persist()
  },

  addWorkout: (w) => get().update((d) => { d.workouts.push({ ...w, id: uid() }) }),
  delWorkout: (id) => get().update((d) => { d.workouts = d.workouts.filter((x) => x.id !== id) }),
  addMeal: (m) => get().update((d) => { d.meals.push({ ...m, id: uid() }) }),
  delMeal: (id) => get().update((d) => { d.meals = d.meals.filter((x) => x.id !== id) }),
  logWeight: (e) => get().update((d) => {
    const ex = d.weights.find((w) => w.date === e.date)
    if (ex) ex.kg = e.kg
    else d.weights.push(e)
    d.weights.sort((a, b) => a.date.localeCompare(b.date))
  }),
  addFriend: (f) => get().update((d) => { d.friends.push({ ...f, id: uid() }) }),
  delFriend: (id) => get().update((d) => { d.friends = d.friends.filter((x) => x.id !== id) }),
  saveProfile: (p) => get().update((d) => { d.profile = { ...d.profile, ...p } }),
  addRoutine: (r) => get().update((d) => { d.routines.push({ ...r, id: uid() }) }),
  delRoutine: (id) => get().update((d) => { d.routines = d.routines.filter((x) => x.id !== id) }),
  resetAll: () => { const s = seed(); set({ data: s }); get().persist() },
}))
