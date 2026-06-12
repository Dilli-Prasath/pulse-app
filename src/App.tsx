import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './lib/store'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Nutrition from './pages/Nutrition'
import Body from './pages/Body'
import Routines from './pages/Routines'
import Coach from './pages/Coach'
import Friends from './pages/Friends'
import Profile from './pages/Profile'

export default function App() {
  const init = useStore((s) => s.init)
  useEffect(() => { void init() }, [init])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/body" element={<Body />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  )
}
