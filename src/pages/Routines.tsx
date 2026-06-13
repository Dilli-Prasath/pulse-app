import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Modal, PageHeader, Empty } from '../components/ui'
import { ExerciseImage } from '../components/ExerciseImage'
import { Combobox } from '../components/Combobox'
import { EXERCISE_LIBRARY } from '../lib/exerciseLibrary'
import { uid, today } from '../lib/seed'
import { RoutineExercise } from '../lib/types'
import { Trash2, Play } from 'lucide-react'

const EX_NAMES = [...new Set(EXERCISE_LIBRARY.map((e) => e.name))].sort()

export default function Routines() {
  const d = useStore((s) => s.data)
  const addRoutine = useStore((s) => s.addRoutine)
  const delRoutine = useStore((s) => s.delRoutine)
  const addWorkout = useStore((s) => s.addWorkout)
  const showToast = useStore((s) => s.showToast)
  const [open, setOpen] = useState(false)

  function start(rId: string) {
    const r = d.routines.find((x) => x.id === rId)
    if (!r) return
    addWorkout({
      date: today(), type: 'strength', name: r.name,
      exercises: r.exercises.map((e) => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: 0 })) })),
    })
    showToast(`Started "${r.name}" — fill in your weights in Workouts 💪`)
  }

  return (
    <>
      <PageHeader title="Routines & Plans" sub="Follow a program or build your own"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ New Routine</button>} />

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        {d.routines.length ? d.routines.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div><div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
                <b className="text-[16px]">{r.name}</b></div>
                <div className="text-muted text-xs mt-1">{r.focus} · {r.exercises.length} exercises</div></div>
              {!r.builtIn && <button className="btn btn-sm btn-danger" onClick={() => delRoutine(r.id)}><Trash2 size={14} /></button>}
            </div>
            <div className="flex flex-col gap-2 mt-3.5">
              {r.exercises.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(6,8,15,.4)' }}>
                  <ExerciseImage name={e.name} size={36} rounded={9} />
                  <div className="flex-1 min-w-0"><b className="text-[13px] block truncate">{e.name}</b></div>
                  <span className="text-muted text-xs font-semibold">{e.sets} × {e.reps}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary w-full mt-3.5" onClick={() => start(r.id)}><Play size={15} /> Start Workout</button>
          </Card>
        )) : <Empty icon="📋" title="No routines" sub="Create one to get started" />}
      </div>

      {open && <RoutineModal onClose={() => setOpen(false)} onSave={(r) => { addRoutine(r); showToast('Routine created ✅'); setOpen(false) }} />}
    </>
  )
}

function RoutineModal({ onClose, onSave }: { onClose: () => void; onSave: (r: any) => void }) {
  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')
  const [rows, setRows] = useState<(RoutineExercise & { id: string })[]>([{ id: uid(), name: '', sets: 3, reps: 10 }])
  const colors = ['#8b5cff', '#22e3ff', '#2bffb0', '#ff4fd8', '#ffcf5c']

  return (
    <Modal title="New Routine" onClose={onClose}>
      <div className="mt-4">
        <div className="mb-3.5"><label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Upper Body Power" /></div>
        <div className="mb-3.5"><label className="label">Focus</label>
          <input className="input" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Chest · Back" /></div>
        <label className="label">Exercises</label>
        {rows.map((r) => (
          <div key={r.id} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '1fr 56px 56px 32px' }}>
            <Combobox value={r.name} placeholder="Search exercise…" options={EX_NAMES}
              onChange={(v) => setRows(rows.map((x) => x.id === r.id ? { ...x, name: v } : x))} />
            <input className="input" type="number" value={r.sets} title="sets"
              onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, sets: +e.target.value } : x))} />
            <input className="input" type="number" value={r.reps} title="reps"
              onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, reps: +e.target.value } : x))} />
            <button className="btn btn-sm" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}>✕</button>
          </div>
        ))}
        <button className="btn btn-sm mt-1" onClick={() => setRows([...rows, { id: uid(), name: '', sets: 3, reps: 10 }])}>+ Add Exercise</button>
        <button className="btn btn-primary w-full mt-4" onClick={() => {
          const exercises = rows.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), sets: r.sets, reps: r.reps }))
          if (!name.trim() || !exercises.length) return alert('Add a name and at least one exercise')
          onSave({ id: uid(), name: name.trim(), focus: focus.trim() || 'Custom', color: colors[Math.floor(Math.random() * colors.length)], exercises })
        }}>Save Routine</button>
      </div>
    </Modal>
  )
}
