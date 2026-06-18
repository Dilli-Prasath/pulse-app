import { create } from 'zustand'
import { AppData, Profile, Workout, Meal, WeightEntry, Friend, Routine, InBodyEntry, Settings, MeasurementEntry, CustomFood } from './types'
import { emptyAccount, uid } from './seed'
import { supabase, cloudConfigured, TABLE } from './supabase'
import type { Session } from '@supabase/supabase-js'

const LOCAL_KEY = 'pulse_fit_v3'

function loadLocal(): AppData {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return migrate(JSON.parse(raw))
  } catch {
    /* ignore */
  }
  return emptyAccount()
}

/** Merge any stored document onto a fresh account so new fields always exist. */
function migrate(d: Partial<AppData>): AppData {
  const base = emptyAccount()
  return {
    profile: { ...base.profile, ...(d.profile || {}) },
    weights: d.weights ?? [],
    workouts: d.workouts ?? [],
    meals: d.meals ?? [],
    // strip the old seeded demo friends (Arjun/Meera/Karthik) that may linger in saved data
    friends: (d.friends ?? []).filter((f) => !['f1', 'f2', 'f3'].includes(f.id)),
    routines: d.routines ?? [],
    inbody: d.inbody ?? [],
    water: d.water ?? [],
    measurements: d.measurements ?? [],
    customFoods: d.customFoods ?? [],
    settings: { ...base.settings, ...(d.settings || {}) },
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
  authReady: boolean
  toast: string | null

  init: () => Promise<void>
  showToast: (msg: string) => void
  persist: () => void
  pullCloud: () => Promise<void>
  pushCloud: () => Promise<void>

  // auth
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>

  // mutations
  update: (fn: (d: AppData) => void) => void
  addWorkout: (w: Omit<Workout, 'id'>) => void
  logSession: (w: Omit<Workout, 'id'>) => void
  delWorkout: (id: string) => void
  addMeal: (m: Omit<Meal, 'id'>) => void
  setDayMeals: (date: string, meals: Omit<Meal, 'id'>[]) => void
  delMeal: (id: string) => void
  logWeight: (e: WeightEntry) => void
  addFriend: (f: Omit<Friend, 'id'>) => void
  delFriend: (id: string) => void
  saveProfile: (p: Partial<Profile>) => void
  updateSettings: (s: Partial<Settings>) => void
  completeOnboarding: (p: Partial<Profile>) => void
  addRoutine: (r: Omit<Routine, 'id'>) => void
  delRoutine: (id: string) => void
  addInbody: (e: Omit<InBodyEntry, 'id'>) => void
  importInbody: (rows: Omit<InBodyEntry, 'id'>[]) => void
  delInbody: (id: string) => void
  addCustomFood: (f: CustomFood) => void
  delCustomFood: (name: string) => void
  logWater: (ml: number) => void
  addMeasurement: (m: Omit<MeasurementEntry, 'id'>) => void
  delMeasurement: (id: string) => void
  resetAll: () => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useStore = create<StoreState>((set, get) => ({
  data: loadLocal(),
  session: null,
  cloud: cloudConfigured,
  sync: cloudConfigured ? 'signedout' : 'local',
  authReady: !cloudConfigured, // when offline, the app is immediately usable
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
      set({ sync: 'local', authReady: true })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    set({ session })
    if (session) await get().pullCloud()
    set({ authReady: true })
    supabase.auth.onAuthStateChange((_e, s) => {
      const had = get().session
      set({ session: s, sync: s ? 'synced' : 'signedout' })
      if (s && !had) void get().pullCloud()
      if (!s) set({ data: emptyAccount() })
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
      // Brand-new account: start clean, then create the cloud row.
      set({ data: emptyAccount() })
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
  signInWithGoogle: async () => {
    if (!supabase) return 'Cloud not configured'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return error ? error.message : null
  },
  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ session: null, sync: cloudConfigured ? 'signedout' : 'local', data: emptyAccount() })
  },

  update: (fn) => {
    const next = structuredClone(get().data)
    fn(next)
    set({ data: next })
    get().persist()
  },

  addWorkout: (w) => get().update((d) => { d.workouts.push({ ...w, id: uid() }) }),
  // Upsert by date+name so re-starting the same session doesn't create duplicates.
  logSession: (w) => get().update((d) => {
    d.workouts = d.workouts.filter((x) => !(x.date === w.date && x.name === w.name))
    d.workouts.push({ ...w, id: uid() })
  }),
  delWorkout: (id) => get().update((d) => { d.workouts = d.workouts.filter((x) => x.id !== id) }),
  addMeal: (m) => get().update((d) => { d.meals.push({ ...m, id: uid() }) }),
  // Replace all of a day's meals (used by "apply diet plan").
  setDayMeals: (date, meals) => get().update((d) => {
    d.meals = d.meals.filter((m) => m.date !== date)
    meals.forEach((m) => d.meals.push({ ...m, id: uid() }))
  }),
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
  updateSettings: (s) => get().update((d) => { d.settings = { ...d.settings, ...s } }),
  completeOnboarding: (p) => get().update((d) => {
    d.profile = { ...d.profile, ...p, onboarded: true }
    if (p.startWeight && !d.weights.length) d.weights.push({ date: new Date().toISOString().slice(0, 10), kg: p.startWeight })
  }),
  addRoutine: (r) => get().update((d) => { d.routines.push({ ...r, id: uid() }) }),
  delRoutine: (id) => get().update((d) => { d.routines = d.routines.filter((x) => x.id !== id) }),
  addInbody: (e) => get().update((d) => {
    d.inbody.push({ ...e, id: uid() })
    d.inbody.sort((a, b) => a.date.localeCompare(b.date))
  }),
  importInbody: (rows) => get().update((d) => {
    rows.forEach((r) => d.inbody.push({ ...r, id: uid() }))
    d.inbody.sort((a, b) => a.date.localeCompare(b.date))
  }),
  delInbody: (id) => get().update((d) => { d.inbody = d.inbody.filter((x) => x.id !== id) }),
  addCustomFood: (f) => get().update((d) => {
    d.customFoods = [{ ...f }, ...d.customFoods.filter((x) => x.name.toLowerCase() !== f.name.toLowerCase())]
  }),
  delCustomFood: (name) => get().update((d) => { d.customFoods = d.customFoods.filter((x) => x.name !== name) }),
  logWater: (ml) => get().update((d) => {
    const today = new Date().toISOString().slice(0, 10)
    const ex = d.water.find((w) => w.date === today)
    if (ex) ex.ml = Math.max(0, ex.ml + ml)
    else d.water.push({ date: today, ml: Math.max(0, ml) })
  }),
  addMeasurement: (m) => get().update((d) => {
    d.measurements.push({ ...m, id: uid() })
    d.measurements.sort((a, b) => a.date.localeCompare(b.date))
  }),
  delMeasurement: (id) => get().update((d) => { d.measurements = d.measurements.filter((x) => x.id !== id) }),
  resetAll: () => { const s = emptyAccount(); set({ data: s }); get().persist() },
}))
