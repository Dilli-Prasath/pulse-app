import { useEffect, useRef } from 'react'
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Dumbbell, Apple, LineChart, Users, ListChecks, Sparkles, User2,
  Cloud, CloudOff, RefreshCw, BookOpen, ChefHat, Settings as SettingsIcon, Target,
} from 'lucide-react'
import { useStore } from '../lib/store'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/programs', label: 'Programs', icon: Target },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
  { to: '/body', label: 'Body', icon: LineChart },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/routines', label: 'Routines', icon: ListChecks },
  { to: '/coach', label: 'AI Coach', icon: Sparkles },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/profile', label: 'Profile', icon: User2 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function SyncBadge() {
  const { cloud, sync, session } = useStore()
  let icon = <CloudOff size={14} />, text = 'Local only', cls = 'text-muted'
  if (cloud && session) {
    if (sync === 'syncing') { icon = <RefreshCw size={14} className="animate-spin" />; text = 'Syncing'; cls = 'text-cyan' }
    else if (sync === 'error') { icon = <CloudOff size={14} />; text = 'Sync error'; cls = 'text-red' }
    else { icon = <Cloud size={14} />; text = 'Cloud synced'; cls = 'text-green' }
  } else if (cloud && !session) { text = 'Sign in to sync' }
  return <div className={`inline-flex items-center gap-2 text-[11px] font-semibold ${cls}`}>{icon}{text}</div>
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  if (!toast) return null
  return (
    <div className="fixed bottom-20 md:bottom-7 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl font-semibold text-sm text-white animate-pop max-w-[90vw] text-center"
      style={{ background: '#121826', border: '1px solid #22e3ff', boxShadow: '0 0 22px rgba(34,227,255,.45)' }}>
      {toast}
    </div>
  )
}

const LAST_ROUTE_KEY = 'pulse_last_route'

export function Layout() {
  const loc = useLocation()
  const nav = useNavigate()
  const name = useStore((s) => s.data.profile.name)
  const avatar = useStore((s) => s.data.profile.avatar)
  const restored = useRef(false)

  // Remember the user's location and restore it on a fresh app open.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const saved = localStorage.getItem(LAST_ROUTE_KEY)
    if (loc.pathname === '/' && saved && saved !== '/') nav(saved, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loc.pathname && loc.pathname !== '/') localStorage.setItem(LAST_ROUTE_KEY, loc.pathname)
  }, [loc.pathname])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (tablet + desktop) */}
      <aside className="hidden md:flex w-[230px] lg:w-[248px] shrink-0 sticky top-0 h-screen flex-col gap-1.5 px-3 lg:px-[18px] py-[26px]"
        style={{ borderRight: '1px solid rgba(120,160,255,.12)', background: 'linear-gradient(180deg,rgba(10,14,26,.6),rgba(6,8,15,.3))', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3 px-2 pt-1.5 pb-5">
          <div className="w-[38px] h-[38px] rounded-xl bg-grad grid place-items-center font-black shadow-glowViolet shrink-0">P</div>
          <div><b className="text-[21px] tracking-[3px] font-extrabold">PULSE</b>
            <span className="block text-[9px] tracking-[4px] text-muted">FITNESS OS</span></div>
        </div>
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 lg:px-3.5 py-2.5 rounded-xl font-semibold text-sm transition border ${
                  isActive ? 'text-white border-line2' : 'text-muted border-transparent hover:text-txt hover:bg-[rgba(120,160,255,.06)]'
                }`}
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg,rgba(34,227,255,.16),rgba(139,92,255,.16))' } : undefined}>
              <n.icon size={20} className="shrink-0" />{n.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto pt-2.5 px-1.5 text-[11px] text-muted2 leading-relaxed border-t border-line">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg grid place-items-center text-white font-bold text-xs shrink-0" style={{ background: avatar }}>
              {(name || 'U')[0].toUpperCase()}
            </div>
            <span className="text-txt font-semibold text-xs truncate">{name || 'You'}</span>
          </div>
          <SyncBadge /><br />v3.0 · React + Supabase
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-9 py-5 sm:py-6 pb-28 md:pb-20 max-w-[1320px] w-full mx-auto">
        <div key={loc.pathname} className="animate-fade"><Outlet /></div>
      </main>

      {/* Mobile nav — horizontally scrollable so every page is reachable */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto no-scrollbar px-1 pt-2 pb-2.5"
        style={{ background: 'rgba(10,14,26,.94)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(120,160,255,.22)' }}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[9.5px] font-bold px-3 py-1 shrink-0 min-w-[64px] ${isActive ? 'text-cyan' : 'text-muted'}`}>
            <n.icon size={21} />{n.label}
          </NavLink>
        ))}
      </nav>
      <Toast />
    </div>
  )
}
