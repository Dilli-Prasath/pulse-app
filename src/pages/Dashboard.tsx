import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, Stat, Ring, Bar, PageHeader } from '../components/ui'
import { LineArea } from '../components/charts'
import {
  latestWeight, bmi, bmiLabel, caloriesOn, calorieTarget, workoutsThisWeek, streak,
  totalLost, goalProgress, macrosOn, proteinTarget, carbTarget, fatTarget, fmtDate, last7Days,
} from '../lib/calcs'
import { dispWeight, wLabel } from '../lib/units'

export default function Dashboard() {
  const d = useStore((s) => s.data)
  const nav = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const w = latestWeight(d)
  const b = bmi(d)
  const [bl, bc] = bmiLabel(b)
  const cals = caloriesOn(d, today)
  const tgt = calorieTarget(d)
  const lost = totalLost(d)
  const m = macrosOn(d, today)
  const unit = d.settings.weightUnit

  const weightData = d.weights.slice(-14).map((p) => ({ label: fmtDate(p.date), value: dispWeight(p.kg, unit) }))
  const calData = last7Days().map((dt) => ({ label: fmtDate(dt), value: caloriesOn(d, dt) }))

  return (
    <>
      <PageHeader
        title={`Welcome back, ${d.profile.name.split(' ')[0]} ⚡`}
        sub={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        action={<div className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full text-muted"
          style={{ background: 'rgba(18,24,42,.66)', border: '1px solid rgba(120,160,255,.22)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_10px_#2bffb0]" />{streak(d)} day streak</div>} />

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
        <Stat label="Current Weight" value={dispWeight(w, unit).toFixed(1)} unit={wLabel(unit)}
          sub={<span className={lost >= 0 ? 'text-cyan' : 'text-amber'}>{lost >= 0 ? '▼' : '▲'} {Math.abs(dispWeight(lost, unit))} {wLabel(unit)} from start</span>} />
        <Stat label="BMI" value={b.toFixed(1)} sub={<span style={{ color: bc }}>● {bl}</span>} />
        <Stat label="Workouts / week" value={workoutsThisWeek(d)} unit="sessions"
          sub={<span className="text-violet">⚡ {d.workouts.length} all-time</span>} />
        <Stat label="Calories today" value={cals} unit={`/ ${tgt}`}
          sub={<span className={cals <= tgt ? 'text-green' : 'text-amber'}>{cals <= tgt ? 'On target' : 'Over budget'}</span>} />
      </div>

      <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <Card><div className="h3 mb-2">Weight Trajectory</div>
          <LineArea data={weightData} color="#22e3ff" goal={dispWeight(d.profile.targetWeight, unit)} unit={` ${wLabel(unit)}`} /></Card>
        <Card><div className="h3 mb-2">Goal Progress</div>
          <div className="flex flex-col items-center text-center mt-2">
            <Ring pct={goalProgress(d)} color="#8b5cff" label="to goal" center={`${goalProgress(d)}%`} />
            <div className="mt-3.5 text-[13px] text-muted">
              <b className="text-txt">{dispWeight(d.profile.targetWeight, unit)} {wLabel(unit)}</b> target<br />
              {dispWeight(w - d.profile.targetWeight, unit).toFixed(1)} {wLabel(unit)} to go</div>
          </div></Card>
      </div>

      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <Card><div className="h3 mb-2">Calories · Last 7 days</div>
          <LineArea data={calData} color="#ff4fd8" goal={tgt} unit=" kcal" /></Card>
        <Card>
          <div className="h3 mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-primary" onClick={() => nav('/workouts')}>+ Log Workout</button>
            <button className="btn" onClick={() => nav('/nutrition')}>+ Log Meal</button>
            <button className="btn" onClick={() => nav('/body')}>+ Log Weight</button>
            <button className="btn" onClick={() => nav('/coach')}>AI Coach</button>
          </div>
          <div className="h3 mt-5 mb-3">Today's Macros</div>
          <Bar label="Protein" value={m.p} target={proteinTarget(d)} color="#22e3ff" />
          <Bar label="Carbs" value={m.c} target={carbTarget(d)} color="#8b5cff" />
          <Bar label="Fat" value={m.f} target={fatTarget(d)} color="#ff4fd8" />
        </Card>
      </div>
    </>
  )
}
