import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Modal } from './ui'
import { ACTIVITIES, ACTIVITY_GROUPS, ActivityGroup, Activity, activitiesForProgram, activityCalories, activityDistance } from '../lib/activities'
import { getProgram } from '../lib/programs'
import { latestWeight } from '../lib/calcs'
import { today } from '../lib/seed'
import { Check, Flame, Sparkles } from 'lucide-react'

const DURATIONS = [10, 15, 20, 30, 45, 60, 90]

/** Browse running, jogging, sports & everyday activities — tap one to log it. */
export function ActivitiesCard({ onPick }: { onPick: (a: Activity) => void }) {
  const d = useStore((s) => s.data)
  const kg = latestWeight(d) || 70
  const program = getProgram(d.profile.programId)
  const recs = activitiesForProgram(program?.id)
  const [group, setGroup] = useState<ActivityGroup>('Walk & Run')
  const list = ACTIVITIES.filter((a) => a.group === group)

  return (
    <Card className="mt-4">
      <div className="h3 mb-1">🏃 Running & Activities</div>
      <div className="text-muted text-xs mb-3">Walk, jog, run, ride, play — tap any activity to log it. Calories are estimated offline for your {kg} kg.</div>

      <div className="text-[11px] text-muted uppercase tracking-wide font-bold mb-1.5 flex items-center gap-1">
        <Sparkles size={11} className="text-cyan" /> Best for {program ? `${program.emoji} ${program.name}` : 'general fitness'}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3 -mx-1 px-1">
        {recs.map((a) => (
          <button key={a.id} onClick={() => onPick(a)} className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left"
            style={{ background: 'linear-gradient(135deg,rgba(34,227,255,.12),rgba(139,92,255,.12))', border: '1px solid rgba(120,160,255,.25)' }}>
            <span className="text-xl">{a.emoji}</span>
            <span><b className="text-[12.5px] block whitespace-nowrap">{a.name}</b>
              <span className="text-[10.5px] text-muted whitespace-nowrap">{a.defMin} min · ~{activityCalories(a, a.defMin, kg)} kcal</span></span>
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3 -mx-1 px-1">
        {ACTIVITY_GROUPS.map((g) => (
          <span key={g} className={`chip shrink-0 ${group === g ? 'chip-on' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setGroup(g)}>{g}</span>
        ))}
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
        {list.map((a) => (
          <button key={a.id} onClick={() => onPick(a)} className="flex items-center gap-2.5 p-2.5 rounded-xl text-left transition hover:-translate-y-0.5"
            style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
            <span className="text-2xl shrink-0">{a.emoji}</span>
            <span className="min-w-0"><b className="text-[12.5px] block leading-tight">{a.name}</b>
              <span className="text-[10.5px] text-muted">~{Math.round(a.met * kg)} kcal/hr</span></span>
          </button>
        ))}
      </div>
    </Card>
  )
}

/** Quick-log an activity: pick duration → distance & calories auto-fill (editable). */
export function ActivityLogModal({ activity, minutes, onClose }: { activity: Activity; minutes?: number; onClose: () => void }) {
  const kg = useStore((s) => latestWeight(s.data)) || 70
  const addWorkout = useStore((s) => s.addWorkout)
  const showToast = useStore((s) => s.showToast)
  const [a, setA] = useState(activity)
  const [min, setMin] = useState(String(minutes || activity.defMin))
  const [date, setDate] = useState(today())
  // null = follow the auto estimate; a string = the user typed their own value
  const [kmOverride, setKm] = useState<string | null>(null)
  const [kcalOverride, setKcal] = useState<string | null>(null)

  const m = +min || 0
  const km = kmOverride ?? (activityDistance(a, m) ? String(activityDistance(a, m)) : '')
  const kcal = kcalOverride ?? String(activityCalories(a, m, kg))

  function changeActivity(id: string) {
    const next = ACTIVITIES.find((x) => x.id === id)
    if (next) { setA(next); setKm(null); setKcal(null) }
  }
  function save() {
    if (!m) { showToast('Enter how many minutes'); return }
    addWorkout({ date, type: 'cardio', name: a.name, cardio: { duration: m, distance: +km || 0, calories: +kcal || 0 } })
    showToast(`${a.emoji} ${a.name} logged — ${kcal} kcal 🔥`)
    onClose()
  }

  return (
    <Modal title={`${a.emoji} Log ${a.name}`} onClose={onClose}>
      <div className="mt-3">
        <div className="text-[12.5px] text-muted mb-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(34,227,255,.06)', border: '1px solid rgba(34,227,255,.18)' }}>💡 {a.tip}</div>

        <div className="mb-3.5"><label className="label">Activity</label>
          <select className="input" value={a.id} onChange={(e) => changeActivity(e.target.value)}>
            {ACTIVITY_GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {ACTIVITIES.filter((x) => x.group === g).map((x) => <option key={x.id} value={x.id}>{x.emoji} {x.name}</option>)}
              </optgroup>
            ))}
          </select></div>

        <label className="label">Duration (min)</label>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {DURATIONS.map((v) => (
            <span key={v} className={`chip ${m === v ? 'chip-on' : ''}`} style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { setMin(String(v)); setKm(null) }}>{v}</span>
          ))}
        </div>
        <input className="input mb-3.5" type="number" inputMode="numeric" value={min} onChange={(e) => { setMin(e.target.value); setKm(null) }} />

        <div className="grid grid-cols-2 gap-3 mb-1">
          <div><label className="label">Distance (km)</label>
            <input className="input" type="number" inputMode="decimal" placeholder={a.kmh ? '' : 'optional'} value={km} onChange={(e) => setKm(e.target.value)} /></div>
          <div><label className="label">Calories</label>
            <input className="input" type="number" inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} /></div>
        </div>
        <div className="text-[11px] text-muted2 mb-3.5 flex items-center gap-1"><Flame size={11} className="text-amber" />
          {kcalOverride === null ? `Auto: ${a.met} MET × ${kg} kg × ${m} min` : <>Custom value · <button className="underline" onClick={() => setKcal(null)}>use estimate</button></>}
          {a.kmh && kmOverride === null ? ` · distance at ~${a.kmh} km/h` : ''}
        </div>

        <div className="mb-1"><label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <button className="btn btn-primary w-full mt-4" onClick={save}><Check size={15} /> Save activity</button>
      </div>
    </Modal>
  )
}
