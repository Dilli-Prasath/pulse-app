import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, Stat, Ring, Bar, PageHeader } from '../components/ui'
import { LineArea } from '../components/charts'
import {
  latestWeight, bmi, bmiLabel, caloriesOn, calorieTarget, workoutsThisWeek, streak,
  totalLost, goalProgress, macrosOn, proteinTarget, carbTarget, fatTarget, fmtDate, last7Days, tdee,
} from '../lib/calcs'
import { dispWeight, wLabel } from '../lib/units'
import { todaySession } from '../lib/session'
import { waterToday } from '../lib/calcs'
import { Dumbbell, ChevronRight } from 'lucide-react'

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

      {/* Today's session — the one thing to do now */}
      {(() => {
        const sess = todaySession(d)
        if (!sess) return (
          <Card className="mb-4 card-glow"><div className="flex items-center justify-between gap-3 flex-wrap">
            <div><div className="h3">🎯 Get started</div><div className="text-muted text-sm mt-1">Pick a goal program for a guided daily plan.</div></div>
            <button className="btn btn-primary" onClick={() => nav('/programs')}>Choose program</button></div></Card>
        )
        return (
          <Card className="mb-4 card-glow"><div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-grad grid place-items-center shadow-glowViolet shrink-0"><Dumbbell size={20} /></div>
              <div><div className="h3">Today · {sess.weekday}</div>
                <div className="text-[15px] font-extrabold mt-0.5">{sess.program.emoji} {sess.rest ? 'Rest day 😴' : sess.focus}</div>
                {!sess.rest && <div className="text-muted text-xs">{sess.mode === 'circuit' ? `${sess.items.length}-move circuit` : `${sess.items.length} exercises`} · ~{sess.estMin} min</div>}</div>
            </div>
            {!sess.rest && <button className="btn btn-primary" onClick={() => nav('/workouts')}>Start workout <ChevronRight size={15} /></button>}
          </div></Card>
        )
      })()}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
        <Stat label="Water" value={(waterToday(d) / 1000).toFixed(1)} unit={`/ ${((d.settings.waterTargetMl || 3000) / 1000).toFixed(1)} L`}
          sub={<span className="text-cyan">💧 stay hydrated</span>} />
        <Stat label="Current Weight" value={dispWeight(w, unit).toFixed(1)} unit={wLabel(unit)}
          sub={<span className={lost >= 0 ? 'text-cyan' : 'text-amber'}>{lost >= 0 ? '▼' : '▲'} {Math.abs(dispWeight(lost, unit))} {wLabel(unit)} from start</span>} />
        <Stat label="BMI" value={b.toFixed(1)} sub={<span style={{ color: bc }}>● {bl}</span>} />
        <Stat label="Workouts / week" value={workoutsThisWeek(d)} unit="sessions"
          sub={<span className="text-violet">⚡ {d.workouts.length} all-time</span>} />
        <Stat label="Calories today" value={cals} unit={`/ ${tgt}`}
          sub={<span className={cals <= tgt ? 'text-green' : 'text-amber'}>{cals <= tgt ? 'On target' : 'Over budget'}</span>} />
        <Stat label="Maintenance" value={Math.round(tdee(d))} unit="kcal" color="#8b5cff"
          sub={<span className="text-muted">TDEE · target {tgt}</span>} />
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
