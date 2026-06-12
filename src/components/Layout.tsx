import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Dumbbell, Apple, LineChart, Users, ListChecks, Sparkles, User2, Cloud, CloudOff, RefreshCw,
} from 'lucide-react'
import { useStore } from '../lib/store'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/body', label: 'Body', icon: LineChart },
  { to: '/routines', label: 'Routines', icon: ListChecks },
  { to: '/coach', label: 'AI Coach', icon: Sparkles },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/profile', label: 'Profile', icon: User2 },
]

function SyncBadge() {
  const { cloud, sync, session } = useStore()
  let icon = <CloudOff size={14} />, text = 'Local', cls = 'text-muted'
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
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl font-semibold text-sm text-white animate-pop"
      style={{ background: '#121826', border: '1px solid #22e3ff', boxShadow: '0 0 22px rgba(34,227,255,.45)' }}>
      {toast}
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const loc = useLocation()
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[248px] shrink-0 sticky top-0 h-screen flex-col gap-2 p-[26px_18px] px-[18px] py-[26px]"
        style={{ borderRight: '1px solid rgba(120,160,255,.12)', background: 'linear-gradient(180deg,rgba(10,14,26,.6),rgba(6,8,15,.3))', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3 px-2 pt-1.5 pb-5">
          <div className="w-[38px] h-[38px] rounded-xl bg-grad grid place-items-center font-black shadow-glowViolet">P</div>
          <div><b className="text-[21px] tracking-[3px] font-extrabold">PULSE</b>
            <span className="block text-[9px] tracking-[4px] text-muted">FITNESS OS</span></div>
        </div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition border ${
                isActive ? 'text-white border-line2' : 'text-muted border-transparent hover:text-txt hover:bg-[rgba(120,160,255,.06)]'
              }`}
            style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg,rgba(34,227,255,.16),rgba(139,92,255,.16))' } : undefined}>
            <n.icon size={20} />{n.label}
          </NavLink>
        ))}
        <div className="mt-auto p-2.5 text-[11px] text-muted2 leading-relaxed">
          <SyncBadge /><br />v2.0 · React + Supabase
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-4 sm:px-9 py-6 pb-24 md:pb-20 max-w-[1280px] w-full">
        <div key={loc.pathname} className="animate-fade">{children}</div>
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around px-1.5 pt-2 pb-3"
        style={{ background: 'rgba(10,14,26,.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(120,160,255,.22)' }}>
        {NAV.slice(0, 6).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[9.5px] font-bold p-1.5 ${isActive ? 'text-cyan' : 'text-muted'}`}>
            <n.icon size={21} />{n.label}
          </NavLink>
        ))}
      </nav>
      <Toast />
    </div>
  )
}
