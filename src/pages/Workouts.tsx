import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, Stat, Modal, Empty, Tag, PageHeader } from '../components/ui'
import { useNavigate } from 'react-router-dom'
import { ExerciseImage } from '../components/ExerciseImage'
import { Combobox } from '../components/Combobox'
import { GuidedSession } from '../components/GuidedSession'
import { EXERCISE_LIBRARY } from '../lib/exerciseLibrary'
import { todaySession } from '../lib/session'
import { totalVolume, prs, workoutsThisWeek, streak, fmtDate, latestWeight } from '../lib/calcs'
import { today, uid } from '../lib/seed'
import { caloriesBurned, ninjaConfigured } from '../lib/apiNinjas'
import { WorkoutType, Exercise } from '../lib/types'
import { Trash2, Loader2, Flame, Play, Sparkles } from 'lucide-react'

interface ExRow { id: string; name: string; setsReps: string; weight: string }

const EXERCISE_NAMES = [...new Set(EXERCISE_LIBRARY.map((e) => e.name))].sort()
const NAME_SUGGESTIONS = ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Full Body', 'Chest & Triceps', 'Back & Biceps', 'Shoulders & Arms', 'Core & Abs', 'Morning Run', 'Cardio', 'HIIT']

export default function Workouts() {
  const d = useStore((s) => s.data)
  const addWorkout = useStore((s) => s.addWorkout)
  const logSession = useStore((s) => s.logSession)
  const delWorkout = useStore((s) => s.delWorkout)
  const showToast = useStore((s) => s.showToast)
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(params.get('add') === '1')
  const [guided, setGuided] = useState(false)
  const nav = useNavigate()
  const sess = todaySession(d)

  const list = [...d.workouts].sort((a, b) => b.date.localeCompare(a.date))
  const pr = prs(d)
  const prKeys = Object.keys(pr)

  function close() { setOpen(false); params.delete('add'); setParams(params, { replace: true }) }

  return (
    <>
      <PageHeader title="Workouts" sub={`${d.workouts.length} sessions · ${streak(d)} day streak 🔥`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ New Workout</button>} />

      {/* Today's guided session */}
      {!sess ? (
        <Card className="mb-4 card-glow">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div><div className="h3">📆 Today's Session</div>
              <div className="text-muted text-sm mt-1">Pick a goal program to get a guided daily workout.</div></div>
            <button className="btn btn-primary" onClick={() => nav('/programs')}>Choose a program</button>
          </div>
        </Card>
      ) : sess.rest ? (
        <Card className="mb-4"><div className="h3 mb-1">📆 Today · {sess.weekday}</div>
          <div className="text-[15px] font-bold mt-1">😴 Rest day — {sess.program.name}</div>
          <div className="text-muted text-sm mt-1">Recover well. You can still log a custom workout above.</div></Card>
      ) : (
        <Card className="mb-4 card-glow">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div><div className="h3">📆 Today · {sess.weekday}</div>
              <div className="text-[16px] font-extrabold mt-1">{sess.program.emoji} {sess.focus}</div>
              <div className="text-muted text-xs">{sess.program.name} · {sess.mode === 'circuit' ? `${sess.items.length}-move circuit` : `${sess.items.length} exercises`} · ~{sess.estMin} min</div></div>
            <button className="btn btn-primary" onClick={() => setGuided(true)}><Play size={15} /> Start guided</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sess.items.map((e) => (
              <div key={e.name} className="flex items-center gap-2 pr-3 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <ExerciseImage name={e.name} size={40} rounded={10} />
                <div className="text-xs"><b className="block">{e.name}</b><span className="text-muted">{sess.mode === 'circuit' ? `${e.seconds}s` : `${e.sets}×${e.reps}`}</span></div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-muted2 mt-2 flex items-center gap-1"><Sparkles size={11} /> Auto-planned & timed. Tap “Start guided” — it walks you through each move with a clock and shows what's next.</div>
        </Card>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <Stat label="This Week" value={workoutsThisWeek(d)} color="#22e3ff" />
        <Stat label="Total Volume" value={totalVolume(d).toLocaleString()} unit="kg" color="#8b5cff" />
        <Stat label="Personal Records" value={prKeys.length} color="#ff4fd8" />
      </div>

      <Card className="mt-4"><div className="h3 mb-3">🏆 Personal Records</div>
        {prKeys.length ? (
          <div className="flex flex-col gap-2.5">
            {prKeys.slice(0, 8).map((n) => (
              <div key={n} className="flex items-center gap-3.5 p-3 rounded-xl"
                style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <ExerciseImage name={n} size={44} />
                <div className="flex-1 min-w-0"><b className="text-[14.5px] block truncate">{n}</b>
                  <span className="text-xs text-muted">{fmtDate(pr[n].date)}</span></div>
                <div className="font-extrabold text-right">{pr[n].weight} kg
                  <span className="block text-[11px] text-muted font-semibold">{pr[n].reps} reps</span></div>
              </div>
            ))}
          </div>
        ) : <Empty icon="🏆" title="No PRs yet" sub="Lift with weights to track records" />}
      </Card>

      <Card className="mt-4"><div className="h3 mb-3">History</div>
        {list.length ? (
          <div className="flex flex-col gap-2.5">
            {list.map((w) => {
              const vol = (w.exercises || []).reduce((s, e) => s + (e.sets || []).reduce((a, x) => a + x.reps * x.weight, 0), 0)
              const detail = w.type === 'cardio'
                ? `${w.cardio?.duration || 0} min · ${w.cardio?.distance || 0} km · ${w.cardio?.calories || 0} kcal`
                : `${(w.exercises || []).length} exercises · ${vol.toLocaleString()} kg volume`
              return (
                <div key={w.id} className="flex items-center gap-3.5 p-3 rounded-xl"
                  style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                  {w.type === 'strength' && w.exercises?.[0]
                    ? <ExerciseImage name={w.exercises[0].name} size={44} />
                    : <div className="w-11 h-11 rounded-xl grid place-items-center text-lg" style={{ background: 'rgba(120,160,255,.08)' }}>🏃</div>}
                  <div className="flex-1 min-w-0">
                    <b className="text-[14.5px]">{w.name} <Tag color={w.type === 'cardio' ? 'cardio' : 'str'}>{w.type}</Tag></b>
                    <span className="block text-xs text-muted">{fmtDate(w.date)} · {detail}</span>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => { delWorkout(w.id); showToast('Deleted') }}><Trash2 size={14} /></button>
                </div>
              )
            })}
          </div>
        ) : <Empty icon="🏋️" title="No workouts yet" sub="Log your first session to start your streak" />}
      </Card>

      {open && <WorkoutModal onClose={close} onSave={(w) => { addWorkout(w); showToast('Workout logged 💪'); close() }} />}

      {guided && sess && !sess.rest && (
        <GuidedSession title={`${sess.program.name} — ${sess.focus}`} items={sess.items} mode={sess.mode}
          restSec={sess.restSec} estMin={sess.estMin}
          onClose={() => setGuided(false)}
          onComplete={(w) => { logSession(w); setGuided(false); showToast('Session complete — saved! 🎉') }} />
      )}
    </>
  )
}

function WorkoutModal({ onClose, onSave }: { onClose: () => void; onSave: (w: any) => void }) {
  const [type, setType] = useState<WorkoutType>('strength')
  const [name, setName] = useState('')
  const [date, setDate] = useState(today())
  const [rows, setRows] = useState<ExRow[]>([{ id: uid(), name: '', setsReps: '3x10', weight: '' }])
  const [cardio, setCardio] = useState({ duration: '', distance: '', calories: '' })
  const [activity, setActivity] = useState('')
  const [estBusy, setEstBusy] = useState(false)
  const [estMsg, setEstMsg] = useState<string | null>(null)
  const weightKg = useStore((s) => latestWeight(s.data))

  async function estimate() {
    const act = (activity || name).trim()
    if (!act) { setEstMsg('Enter an activity (e.g. running)'); return }
    setEstBusy(true); setEstMsg(null)
    const res = await caloriesBurned(act, +cardio.duration || 0, weightKg)
    setEstBusy(false)
    if (!res.length) { setEstMsg('No match — try a simpler activity name, or enter calories manually.'); return }
    const r = res[0]
    setCardio((c) => ({ ...c, calories: String(r.total_calories || r.calories_per_hour) }))
    setEstMsg(`${r.name}: ~${r.total_calories || r.calories_per_hour} kcal`)
  }

  function save() {
    if (type === 'strength') {
      const exercises: Exercise[] = rows.filter((r) => r.name.trim()).map((r) => {
        const mm = r.setsReps.match(/(\d+)\s*[x×]\s*(\d+)/i)
        const sets = mm ? +mm[1] : 1
        const reps = mm ? +mm[2] : (+r.setsReps || 0)
        const weight = +r.weight || 0
        return { name: r.name.trim(), sets: Array.from({ length: sets }, () => ({ reps, weight })) }
      })
      if (!exercises.length) return alert('Add at least one exercise')
      onSave({ id: uid(), date, type, name: name.trim() || 'Workout', exercises })
    } else {
      onSave({ id: uid(), date, type, name: name.trim() || 'Cardio',
        cardio: { duration: +cardio.duration || 0, distance: +cardio.distance || 0, calories: +cardio.calories || 0 } })
    }
  }

  return (
    <Modal title="Log Workout" onClose={onClose}>
      <div className="mt-4">
        <label className="label">Type</label>
        <div className="flex gap-2 mb-4">
          <span className={`chip ${type === 'strength' ? 'chip-on' : ''}`} onClick={() => setType('strength')}>🏋️ Strength</span>
          <span className={`chip ${type === 'cardio' ? 'chip-on' : ''}`} onClick={() => setType('cardio')}>🏃 Cardio</span>
        </div>
        <div className="mb-3.5"><label className="label">Workout Name</label>
          <Combobox value={name} options={NAME_SUGGESTIONS} placeholder="e.g. Push Day / Morning Run" onChange={setName} /></div>
        <div className="mb-3.5"><label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>

        {type === 'strength' ? (
          <>
            <label className="label">Exercises</label>
            {rows.map((r) => (
              <div key={r.id} className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: r.name.trim() ? '40px 1fr 90px 70px 32px' : '1fr 90px 70px 32px' }}>
                {r.name.trim() && <ExerciseImage name={r.name} size={40} />}
                <Combobox value={r.name} placeholder="Search exercise…" options={EXERCISE_NAMES}
                  onChange={(v) => setRows(rows.map((x) => x.id === r.id ? { ...x, name: v } : x))} />
                <input className="input" placeholder="3x10" value={r.setsReps}
                  onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, setsReps: e.target.value } : x))} />
                <input className="input" type="number" placeholder="kg" value={r.weight}
                  onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, weight: e.target.value } : x))} />
                <button className="btn btn-sm" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}>✕</button>
              </div>
            ))}
            <button className="btn btn-sm mt-1" onClick={() => setRows([...rows, { id: uid(), name: '', setsReps: '3x10', weight: '' }])}>+ Add Exercise</button>
          </>
        ) : (
          <>
            <div className="mb-3"><label className="label">Activity</label>
              <input className="input" placeholder="e.g. running, cycling, swimming" value={activity} onChange={(e) => setActivity(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Duration (min)</label><input className="input" type="number" value={cardio.duration} onChange={(e) => setCardio({ ...cardio, duration: e.target.value })} /></div>
              <div><label className="label">Distance (km)</label><input className="input" type="number" value={cardio.distance} onChange={(e) => setCardio({ ...cardio, distance: e.target.value })} /></div>
              <div><label className="label">Calories</label><input className="input" type="number" value={cardio.calories} onChange={(e) => setCardio({ ...cardio, calories: e.target.value })} /></div>
            </div>
            {ninjaConfigured && (
              <div className="mt-2.5">
                <button className="btn btn-sm w-full justify-center" disabled={estBusy} onClick={estimate}>
                  {estBusy ? <Loader2 size={14} className="animate-spin" /> : <Flame size={14} className="text-amber" />} Estimate calories from activity
                </button>
                {estMsg && <div className="text-[11px] text-muted mt-1.5 text-center">{estMsg}</div>}
              </div>
            )}
          </>
        )}
        <button className="btn btn-primary w-full mt-4" onClick={save}>Save Workout</button>
      </div>
    </Modal>
  )
}
