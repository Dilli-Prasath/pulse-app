import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './lib/store'
import { applyAccent } from './lib/theme'
import { Layout, Toast } from './components/Layout'
import { AuthGate } from './components/AuthGate'
import { Onboarding } from './components/Onboarding'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Programs from './pages/Programs'
import Nutrition from './pages/Nutrition'
import Recipes from './pages/Recipes'
import Body from './pages/Body'
import Routines from './pages/Routines'
import Library from './pages/Library'
import Coach from './pages/Coach'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

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
    </Layout>
  )
}
