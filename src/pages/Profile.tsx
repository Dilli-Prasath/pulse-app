import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Stat, PageHeader, Modal } from '../components/ui'
import { bmr, tdee, calorieTarget, weeksToGoal } from '../lib/calcs'
import { Sex } from '../lib/types'
import { Cloud, LogOut } from 'lucide-react'

export default function Profile() {
  const d = useStore((s) => s.data)
  const saveProfile = useStore((s) => s.saveProfile)
  const resetAll = useStore((s) => s.resetAll)
  const showToast = useStore((s) => s.showToast)
  const { cloud, session, signOut } = useStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [p, setP] = useState(d.profile)

  function exportData() {
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'pulse-backup.json'; a.click()
    showToast('Backup downloaded')
  }
  function importData() {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'
    i.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
      const r = new FileReader()
      r.onload = () => { try { const obj = JSON.parse(r.result as string); useStore.setState({ data: obj }); useStore.getState().persist(); showToast('Data imported ✅') } catch { showToast('Invalid file') } }
      r.readAsText(f)
    }
    i.click()
  }

  return (
    <>
      <PageHeader title="Profile & Goals" sub="Your stats drive every calculation in PULSE"
        action={cloud ? (session
          ? <button className="btn" onClick={() => { void signOut(); showToast('Signed out') }}><LogOut size={15} /> Sign out</button>
          : <button className="btn btn-primary" onClick={() => setAuthOpen(true)}><Cloud size={15} /> Sign in to sync</button>
        ) : undefined} />

      {cloud && (
        <Card className="mb-4"><div className="flex items-center gap-3">
          <Cloud size={20} className={session ? 'text-green' : 'text-muted'} />
          <div><b className="text-sm">{session ? `Cloud sync on · ${session.user.email}` : 'Cloud available — sign in to sync across devices'}</b>
            <div className="text-muted text-xs mt-0.5">{session ? 'Your data is backed up automatically.' : 'Until you sign in, data is saved on this device only.'}</div></div>
        </div></Card>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
        <Card><div className="h3 mb-3.5">Personal Details</div>
          <div className="mb-3.5"><label className="label">Name</label><input className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3.5">
            <div><label className="label">Sex</label><select className="input" value={p.sex} onChange={(e) => setP({ ...p, sex: e.target.value as Sex })}><option value="male">Male</option><option value="female">Female</option></select></div>
            <div><label className="label">Age</label><input className="input" type="number" value={p.age} onChange={(e) => setP({ ...p, age: +e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3.5 mt-3.5">
            <div><label className="label">Height (cm)</label><input className="input" type="number" value={p.heightCm} onChange={(e) => setP({ ...p, heightCm: +e.target.value })} /></div>
            <div><label className="label">Avatar Color</label><input className="input" type="color" style={{ height: 44, padding: 4 }} value={p.avatar} onChange={(e) => setP({ ...p, avatar: e.target.value })} /></div>
          </div>
        </Card>

        <Card><div className="h3 mb-3.5">Goal Settings</div>
          <div className="grid grid-cols-2 gap-3.5">
            <div><label className="label">Start Weight (kg)</label><input className="input" type="number" step="0.1" value={p.startWeight} onChange={(e) => setP({ ...p, startWeight: +e.target.value })} /></div>
            <div><label className="label">Target Weight (kg)</label><input className="input" type="number" step="0.1" value={p.targetWeight} onChange={(e) => setP({ ...p, targetWeight: +e.target.value })} /></div>
          </div>
          <div className="mt-3.5"><label className="label">Weekly Loss Rate</label>
            <select className="input" value={p.goalRate} onChange={(e) => setP({ ...p, goalRate: +e.target.value })}>
              <option value={0.25}>Relaxed · 0.25 kg/week</option><option value={0.5}>Steady · 0.5 kg/week (recommended)</option>
              <option value={0.75}>Moderate · 0.75 kg/week</option><option value={1}>Aggressive · 1 kg/week</option></select></div>
          <div className="mt-3.5"><label className="label">Activity Level</label>
            <select className="input" value={p.activity} onChange={(e) => setP({ ...p, activity: +e.target.value })}>
              <option value={1.2}>Sedentary (desk job)</option><option value={1.375}>Light (1-3 days/wk)</option>
              <option value={1.55}>Moderate (3-5 days/wk)</option><option value={1.725}>Active (6-7 days/wk)</option></select></div>
        </Card>
      </div>

      <Card className="mt-4"><div className="h3 mb-3">Calculated Targets</div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
          <Stat label="BMR" value={Math.round(bmr({ ...d, profile: p }))} unit="kcal" color="#22e3ff" />
          <Stat label="Maintenance" value={Math.round(tdee({ ...d, profile: p }))} unit="kcal" color="#8b5cff" />
          <Stat label="Daily Target" value={calorieTarget({ ...d, profile: p })} unit="kcal" color="#2bffb0" />
          <Stat label="Time to goal" value={weeksToGoal({ ...d, profile: p })} unit="wks" color="#ff4fd8" />
        </div></Card>

      <div className="flex gap-3 flex-wrap mt-5">
        <button className="btn btn-primary" onClick={() => { saveProfile(p); showToast('Profile saved ✅') }}>Save Changes</button>
        <button className="btn" onClick={exportData}>Export Backup</button>
        <button className="btn" onClick={importData}>Import Backup</button>
        <button className="btn btn-danger" onClick={() => setResetOpen(true)}>Reset All Data</button>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {resetOpen && (
        <Modal title="Reset all data?" onClose={() => setResetOpen(false)}>
          <p className="text-muted my-3.5">This permanently clears your workouts, meals, weight log and friends. This cannot be undone.</p>
          <div className="flex gap-2.5"><button className="btn" onClick={() => setResetOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { resetAll(); setResetOpen(false); showToast('Reset complete') }}>Yes, reset</button></div>
        </Modal>
      )}
    </>
  )
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp, showToast } = useStore()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    setBusy(true); setErr(null)
    const fn = mode === 'in' ? signIn : signUp
    const error = await fn(email.trim(), pw)
    setBusy(false)
    if (error) { setErr(error); return }
    showToast(mode === 'in' ? 'Signed in ☁️' : 'Account created — check your email to confirm')
    onClose()
  }

  return (
    <Modal title={mode === 'in' ? 'Sign in' : 'Create account'} onClose={onClose}>
      <div className="mt-4">
        <div className="flex gap-2 mb-4">
          <span className={`chip ${mode === 'in' ? 'chip-on' : ''}`} onClick={() => setMode('in')}>Sign in</span>
          <span className={`chip ${mode === 'up' ? 'chip-on' : ''}`} onClick={() => setMode('up')}>Sign up</span>
        </div>
        <div className="mb-3.5"><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="mb-1"><label className="label">Password</label><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        {err && <div className="text-red text-[13px] mt-2">{err}</div>}
        <button className="btn btn-primary w-full mt-4" disabled={busy} onClick={submit}>{busy ? 'Working…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
      </div>
    </Modal>
  )
}
