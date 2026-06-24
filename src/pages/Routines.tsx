import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Modal, PageHeader, Empty, Tag } from '../components/ui'
import { ExerciseImage } from '../components/ExerciseImage'
import { ExercisePicker } from '../components/ExercisePicker'
import { Combobox } from '../components/Combobox'
import { EXERCISE_LIBRARY, EXERCISE_BY_NAME, exerciseDef, defToSetsReps, ROUTINE_TEMPLATES, LEVELS } from '../lib/exerciseLibrary'
import { uid, today } from '../lib/seed'
import { RoutineExercise, Level } from '../lib/types'
import { Trash2, Play, Plus, Dumbbell } from 'lucide-react'

const EX_NAMES = [...new Set(EXERCISE_LIBRARY.map((e) => e.name))].sort()

export default function Routines() {
  const d = useStore((s) => s.data)
  const addRoutine = useStore((s) => s.addRoutine)
  const delRoutine = useStore((s) => s.delRoutine)
  const addWorkout = useStore((s) => s.addWorkout)
  const showToast = useStore((s) => s.showToast)
  const [open, setOpen] = useState(false)
  const [tLevel, setTLevel] = useState<Level | 'All'>('All')

  function startExercises(name: string, exercises: { name: string; sets: number; reps: number }[]) {
    addWorkout({
      date: today(), type: 'strength', name,
      exercises: exercises.map((e) => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: 0 })) })),
    })
  }
  function start(rId: string) {
    const r = d.routines.find((x) => x.id === rId)
    if (!r) return
    startExercises(r.name, r.exercises)
    showToast(`Started "${r.name}" — fill in your weights in Workouts 💪`)
  }
  // Auto-add a ready-made routine to "My Routines" (skips if already there).
  function addTemplate(id: string) {
    const t = ROUTINE_TEMPLATES.find((x) => x.id === id)!
    if (d.routines.some((r) => r.name.toLowerCase() === t.name.toLowerCase())) { showToast(`"${t.name}" is already in your routines`); return }
    addRoutine({ name: t.name, focus: t.focus, color: t.color, exercises: t.exercises })
    showToast(`Added "${t.name}" to your routines ✅`)
  }
  function startTemplate(id: string) {
    const t = ROUTINE_TEMPLATES.find((x) => x.id === id)!
    startExercises(t.name, t.exercises)
    showToast(`Started "${t.name}" — add your weights in Workouts 💪`)
  }

  const templates = ROUTINE_TEMPLATES.filter((t) => tLevel === 'All' || t.level === tLevel)

  return (
    <>
      <PageHeader title="Routines & Plans" sub="Follow a program or build your own"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ New Routine</button>} />

      {/* Ready-made routines — one tap to add or start */}
      <Card className="mb-5">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="h3 flex items-center gap-2"><Dumbbell size={15} className="text-violet" /> Ready-made Routines</div>
          <div className="flex gap-2">
            {(['All', ...LEVELS] as const).map((l) => (
              <span key={l} className={`chip ${tLevel === l ? 'chip-on' : ''}`} onClick={() => setTLevel(l)} style={{ fontSize: 11, padding: '4px 10px' }}>{l}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))' }}>
          {templates.map((t) => {
            const added = d.routines.some((r) => r.name.toLowerCase() === t.name.toLowerCase())
            return (
              <div key={t.id} className="p-3.5 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="flex items-center justify-between gap-2">
                  <b className="text-[14.5px]">{t.name}</b>
                  <Tag color={t.level === 'Advanced' ? 'gold' : t.level === 'Intermediate' ? 'cardio' : 'str'}>{t.level}</Tag>
                </div>
                <div className="text-muted text-xs mt-0.5">{t.focus} · {t.exercises.length} exercises</div>
                <div className="flex -space-x-2 mt-3">
                  {t.exercises.slice(0, 5).map((e, i) => (
                    <div key={i} className="rounded-lg ring-2 ring-[#0a0e1a]"><ExerciseImage name={e.name} size={32} rounded={8} zoomable={false} /></div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-sm btn-primary flex-1 justify-center" onClick={() => addTemplate(t.id)} disabled={added}>
                    {added ? '✓ Added' : <><Plus size={13} /> Add</>}
                  </button>
                  <button className="btn btn-sm flex-1 justify-center" onClick={() => startTemplate(t.id)}><Play size={13} /> Start</button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-[11px] text-muted2 mt-2">“Add” saves a routine to your list below (edit anytime). “Start” logs it to today’s workouts to fill in your weights.</div>
      </Card>

      <div className="h3 mb-3">📋 My Routines</div>
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
  const [picker, setPicker] = useState(false)
  const colors = ['#8b5cff', '#22e3ff', '#2bffb0', '#ff4fd8', '#ffcf5c']

  // Add from picker → fill first empty row else append; sets/reps auto-fill from the default.
  function addExercise(nm: string) {
    setRows((rs) => {
      const { sets, reps } = defToSetsReps(exerciseDef(nm))
      const empty = rs.find((r) => !r.name.trim())
      if (empty) return rs.map((r) => r.id === empty.id ? { ...r, name: nm, sets, reps } : r)
      return [...rs, { id: uid(), name: nm, sets, reps }]
    })
  }
  // Auto-fill sets/reps when a known exercise is chosen in a row.
  function setRowName(id: string, v: string) {
    setRows((rs) => rs.map((x) => {
      if (x.id !== id) return x
      if (!EXERCISE_BY_NAME[v.trim()]) return { ...x, name: v }
      const { sets, reps } = defToSetsReps(exerciseDef(v))
      return { ...x, name: v, sets, reps }
    }))
  }

  return (
    <Modal title="New Routine" onClose={onClose}>
      <div className="mt-4">
        <div className="mb-3.5"><label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Upper Body Power" /></div>
        <div className="mb-3.5"><label className="label">Focus</label>
          <input className="input" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Chest · Back" /></div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">Exercises</label>
          <button className="btn btn-sm" onClick={() => setPicker(true)}><Dumbbell size={13} /> Browse by muscle</button>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: r.name.trim() ? '34px 1fr 56px 56px 32px' : '1fr 56px 56px 32px' }}>
            {r.name.trim() && <ExerciseImage name={r.name} size={34} rounded={8} zoomable={false} />}
            <Combobox value={r.name} placeholder="Search exercise…" options={EX_NAMES}
              onChange={(v) => setRowName(r.id, v)} />
            <input className="input" type="number" value={r.sets} title="sets"
              onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, sets: +e.target.value } : x))} />
            <input className="input" type="number" value={r.reps} title="reps"
              onChange={(e) => setRows(rows.map((x) => x.id === r.id ? { ...x, reps: +e.target.value } : x))} />
            <button className="btn btn-sm" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}>✕</button>
          </div>
        ))}
        <button className="btn btn-sm mt-1" onClick={() => setRows([...rows, { id: uid(), name: '', sets: 3, reps: 10 }])}>+ Add Exercise</button>
        {picker && <ExercisePicker onPick={addExercise} onClose={() => setPicker(false)} />}
        <button className="btn btn-primary w-full mt-4" onClick={() => {
          const exercises = rows.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), sets: r.sets, reps: r.reps }))
          if (!name.trim() || !exercises.length) return alert('Add a name and at least one exercise')
          onSave({ id: uid(), name: name.trim(), focus: focus.trim() || 'Custom', color: colors[Math.floor(Math.random() * colors.length)], exercises })
        }}>Save Routine</button>
      </div>
    </Modal>
  )
}
