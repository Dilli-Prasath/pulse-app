import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, Stat, Modal, Empty, Tag, PageHeader } from '../components/ui'
import { ExerciseImage } from '../components/ExerciseImage'
import { totalVolume, prs, workoutsThisWeek, streak, fmtDate } from '../lib/calcs'
import { today, uid } from '../lib/seed'
import { WorkoutType, Exercise } from '../lib/types'
import { Trash2 } from 'lucide-react'

interface ExRow { id: string; name: string; setsReps: string; weight: string }

export default function Workouts() {
  const d = useStore((s) => s.data)
  const addWorkout = useStore((s) => s.addWorkout)
  const delWorkout = useStore((s) => s.delWorkout)
  const showToast = useStore((s) => s.showToast)
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(params.get('add') === '1')

  const list = [...d.workouts].sort((a, b) => b.date.localeCompare(a.date))
  const pr = prs(d)
  const prKeys = Object.keys(pr)

  function close() { setOpen(false); params.delete('add'); setParams(params, { replace: true }) }

  return (
    <>
      <PageHeader title="Workouts" sub={`${d.workouts.length} sessions · ${streak(d)} day streak 🔥`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ New Workout</button>} />

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
    </>
  )
}

function WorkoutModal({ onClose, onSave }: { onClose: () => void; onSave: (w: any) => void }) {
  const [type, setType] = useState<WorkoutType>('strength')
  const [name, setName] = useState('')
  const [date, setDate] = useState(today())
  const [rows, setRows] = useState<ExRow[]>([{ id: uid(), name: '', setsReps: '3x10', weight: '' }])
  const [cardio, setCardio] = useState({ duration: '', distance: '', calories: '' })

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
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day / Morning Run" /></div>
        <div className="mb-3.5"><label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>

        {type === 'strength' ? (
          <>
            <label className="label">Exercises</label>
            {rows.map((r) => (
              <div key={r.id} className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: r.name.trim() ? '40px 1fr 90px 70px 32px' : '1fr 90px 70px 32px' }}>
                {r.name.trim() && <ExerciseImage name={r.name} size={40} />}
                <input className="input" placeholder="Exercise" value={r.name}
                  onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} />
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
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Duration (min)</label><input className="input" type="number" value={cardio.duration} onChange={(e) => setCardio({ ...cardio, duration: e.target.value })} /></div>
            <div><label className="label">Distance (km)</label><input className="input" type="number" value={cardio.distance} onChange={(e) => setCardio({ ...cardio, distance: e.target.value })} /></div>
            <div><label className="label">Calories</label><input className="input" type="number" value={cardio.calories} onChange={(e) => setCardio({ ...cardio, calories: e.target.value })} /></div>
          </div>
        )}
        <button className="btn btn-primary w-full mt-4" onClick={save}>Save Workout</button>
      </div>
    </Modal>
  )
}
