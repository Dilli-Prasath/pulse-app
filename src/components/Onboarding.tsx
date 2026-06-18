import { useState } from 'react'
import { useStore } from '../lib/store'
import { Sex } from '../lib/types'

export function Onboarding() {
  const { data, completeOnboarding, session, showToast } = useStore()
  const [step, setStep] = useState(0)
  const defaultName = session?.user.user_metadata?.full_name || session?.user.email?.split('@')[0] || ''
  const [f, setF] = useState({
    name: data.profile.name || defaultName,
    sex: data.profile.sex as Sex,
    age: data.profile.age || 28,
    heightCm: data.profile.heightCm || 175,
    startWeight: data.profile.startWeight || 80,
    targetWeight: data.profile.targetWeight || 75,
    activity: data.profile.activity || 1.375,
    goalRate: data.profile.goalRate || 0.5,
    avatar: data.profile.avatar || '#8b5cff',
  })
  const set = (k: keyof typeof f, v: string | number) => setF({ ...f, [k]: v })

  const steps = ['You', 'Body', 'Goal']
  const canNext =
    (step === 0 && f.name.trim() && f.age > 0) ||
    (step === 1 && f.heightCm > 0 && f.startWeight > 0) ||
    step === 2

  function finish() {
    if (!f.targetWeight) return
    completeOnboarding(f)
    showToast(`Welcome, ${f.name.split(' ')[0]}! 🎉`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-grad grid place-items-center font-black shadow-glowViolet">P</div>
          <b className="text-xl tracking-[3px] font-extrabold">PULSE</b>
        </div>

        {/* progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="h-1.5 rounded-full" style={{ background: i <= step ? 'linear-gradient(90deg,#22e3ff,#8b5cff)' : 'rgba(120,160,255,.12)' }} />
              <div className={`text-[11px] mt-1.5 font-semibold ${i <= step ? 'text-txt' : 'text-muted2'}`}>{s}</div>
            </div>
          ))}
        </div>

        <div className="card card-glow">
          {step === 0 && (
            <>
              <h2 className="text-xl font-extrabold mb-1">Let's set you up</h2>
              <p className="text-muted text-sm mb-5">Tell us a bit about yourself.</p>
              <div className="mb-3.5"><label className="label">Name</label>
                <input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" /></div>
              <div className="grid grid-cols-2 gap-3.5">
                <div><label className="label">Sex</label>
                  <select className="input" value={f.sex} onChange={(e) => set('sex', e.target.value)}>
                    <option value="male">Male</option><option value="female">Female</option></select></div>
                <div><label className="label">Age</label>
                  <input className="input" type="number" value={f.age} onChange={(e) => set('age', +e.target.value)} /></div>
              </div>
              <div className="mt-3.5"><label className="label">Avatar Color</label>
                <input className="input" type="color" style={{ height: 44, padding: 4 }} value={f.avatar} onChange={(e) => set('avatar', e.target.value)} /></div>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-xl font-extrabold mb-1">Your body</h2>
              <p className="text-muted text-sm mb-5">Used to calculate your calorie and protein targets.</p>
              <div className="mb-3.5"><label className="label">Height (cm)</label>
                <input className="input" type="number" value={f.heightCm} onChange={(e) => set('heightCm', +e.target.value)} /></div>
              <div className="mb-3.5"><label className="label">Current Weight (kg)</label>
                <input className="input" type="number" step="0.1" value={f.startWeight} onChange={(e) => set('startWeight', +e.target.value)} /></div>
              <div><label className="label">Activity Level</label>
                <select className="input" value={f.activity} onChange={(e) => set('activity', +e.target.value)}>
                  <option value={1.2}>Sedentary (desk job)</option>
                  <option value={1.375}>Light (1-3 days/wk)</option>
                  <option value={1.55}>Moderate (3-5 days/wk)</option>
                  <option value={1.725}>Active (6-7 days/wk)</option>
                  <option value={1.9}>Extremely active (hard daily + job)</option></select></div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl font-extrabold mb-1">Your goal</h2>
              <p className="text-muted text-sm mb-5">Where are you headed?</p>
              <div className="mb-3.5"><label className="label">Target Weight (kg)</label>
                <input className="input" type="number" step="0.1" value={f.targetWeight} onChange={(e) => set('targetWeight', +e.target.value)} /></div>
              <div><label className="label">Pace</label>
                <select className="input" value={f.goalRate} onChange={(e) => set('goalRate', +e.target.value)}>
                  <option value={0.25}>Relaxed · 0.25 kg/week</option>
                  <option value={0.5}>Steady · 0.5 kg/week (recommended)</option>
                  <option value={0.75}>Moderate · 0.75 kg/week</option>
                  <option value={1}>Aggressive · 1 kg/week</option></select></div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 2
              ? <button className="btn btn-primary flex-1 justify-center" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</button>
              : <button className="btn btn-primary flex-1 justify-center" disabled={!f.targetWeight} onClick={finish}>Finish & enter PULSE</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
