import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './lib/store'
import { applyAccent } from './lib/theme'
import { Layout, Toast } from './components/Layout'
import { AuthGate } from './components/AuthGate'
import { Onboarding } from './components/Onboarding'

// Route-level code splitting — each page is its own chunk, so the heavy
// chart/page code only loads when that route is opened (smaller initial load).
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Workouts = lazy(() => import('./pages/Workouts'))
const Programs = lazy(() => import('./pages/Programs'))
const Nutrition = lazy(() => import('./pages/Nutrition'))
const Recipes = lazy(() => import('./pages/Recipes'))
const Body = lazy(() => import('./pages/Body'))
const Routines = lazy(() => import('./pages/Routines'))
const Library = lazy(() => import('./pages/Library'))
const Coach = lazy(() => import('./pages/Coach'))
const Friends = lazy(() => import('./pages/Friends'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))

function Splash() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex flex-col items-center gap-4 animate-pop">
        <div className="w-14 h-14 rounded-2xl bg-grad grid place-items-center font-black text-xl shadow-glowViolet animate-pulse">P</div>
        <div className="text-muted text-sm tracking-widest">LOADING…</div>
      </div>
    </div>
  )
}

export default function App() {
  const { init, cloud, authReady, session, data } = useStore()
  useEffect(() => { void init() }, [init])
  useEffect(() => { applyAccent(data.settings.accent) }, [data.settings.accent])

  // Cloud configured but still checking the session.
  if (cloud && !authReady) return <Splash />
  // Cloud configured and signed out → show the login screen.
  if (cloud && !session) return (<><AuthGate /><Toast /></>)
  // Signed in (or offline) but profile not set up yet → onboarding.
  if (!data.profile.onboarded) return (<><Onboarding /><Toast /></>)

  return (
    <Layout>
      <Suspense fallback={<div className="py-20 text-center text-muted text-sm">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/body" element={<Body />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/library" element={<Library />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
      </Suspense>
    </Layout>
  )
}
