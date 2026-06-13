import { useState } from 'react'
import { ExerciseImage } from './ExerciseImage'
import { SessionExercise } from '../lib/session'
import { Workout } from '../lib/types'
import { today, uid } from '../lib/seed'
import { X, ChevronLeft, ChevronRight, Check, Maximize2 } from 'lucide-react'

interface LoggedEx { name: string; targetSets: number; reps: number; weight: number; muscle: string; howto: string; done: boolean }

const IMG_SIZES: { key: string; label: string; px: number }[] = [
  { key: 'S', label: 'S', px: 120 },
  { key: 'M', label: 'M', px: 200 },
  { key: 'L', label: 'L', px: 300 },
  { key: 'XL', label: 'XL', px: 420 },
]
const IMG_KEY = 'pulse_guided_imgsize'

export function GuidedSession({ title, exercises, onClose, onComplete }: {
  title: string
  exercises: SessionExercise[]
  onClose: () => void
  onComplete: (w: Omit<Workout, 'id'> & { id: string }) => void
}) {
  const [i, setI] = useState(0)
  const [rows, setRows] = useState<LoggedEx[]>(
    exercises.map((e) => ({ name: e.name, targetSets: e.sets, reps: e.reps, weight: 0, muscle: e.muscle, howto: e.howto, done: false })),
  )
  const [sizeKey, setSizeKey] = useState<string>(() => localStorage.getItem(IMG_KEY) || 'L')
  const size = IMG_SIZES.find((s) => s.key === sizeKey) || IMG_SIZES[2]

  const cur = rows[i]
  const last = i === rows.length - 1
  const doneCount = rows.filter((r) => r.done).length

  function setCur(patch: Partial<LoggedEx>) { setRows(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r)) }
  function pickSize(k: string) { setSizeKey(k); localStorage.setItem(IMG_KEY, k) }

  function finish() {
    const w: Omit<Workout, 'id'> & { id: string } = {
      id: uid(), date: today(), type: 'strength', name: title,
      exercises: rows.map((r) => ({ name: r.name, sets: Array.from({ length: r.targetSets }, () => ({ reps: r.reps, weight: r.weight })) })),
    }
    onComplete(w)
  }

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto" style={{ background: 'rgba(3,5,12,.9)', backdropFilter: 'blur(8px)' }}>
      <div className="max-w-[760px] mx-auto min-h-screen flex flex-col p-4 sm:p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] text-muted uppercase tracking-widest">Guided · {title}</div>
            <div className="text-lg font-extrabold">Exercise {i + 1} of {rows.length}</div>
          </div>
          <button className="btn btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* progress bar */}
        <div className="h-1.5 rounded-full bg-[rgba(120,160,255,.12)] mb-5 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / rows.length) * 100}%`, background: 'linear-gradient(90deg,#22e3ff,#8b5cff,#ff4fd8)' }} />
        </div>

        {/* image size control */}
        <div className="flex items-center gap-2 mb-3">
          <Maximize2 size={13} className="text-muted" />
          <span className="text-[11px] text-muted uppercase tracking-wide mr-1">Image size</span>
          {IMG_SIZES.map((s) => (
            <button key={s.key} onClick={() => pickSize(s.key)}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold border ${sizeKey === s.key ? 'text-white border-line2' : 'text-muted border-line'}`}
              style={sizeKey === s.key ? { background: 'linear-gradient(135deg,rgba(34,227,255,.2),rgba(139,92,255,.2))' } : undefined}>{s.label}</button>
          ))}
        </div>

        {/* card */}
        <div className="card card-glow flex-1 flex flex-col items-center text-center">
          <div className="flex justify-center my-2"><ExerciseImage name={cur.name} size={Math.min(size.px, 460)} rounded={20} /></div>
          <h2 className="text-2xl font-extrabold mt-2">{cur.name}</h2>
          <div className="text-muted text-sm mt-1">{cur.muscle} · target {cur.targetSets} × {cur.reps}</div>
          <p className="text-muted text-[13.5px] leading-relaxed mt-3 max-w-[520px]">{cur.howto}</p>

          {/* quick log */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[360px] mt-5">
            <div><label className="label">Weight (kg)</label>
              <input className="input text-center" type="number" value={cur.weight || ''} placeholder="0"
                onChange={(e) => setCur({ weight: +e.target.value })} /></div>
            <div><label className="label">Reps / set</label>
              <input className="input text-center" type="number" value={cur.reps}
                onChange={(e) => setCur({ reps: +e.target.value })} /></div>
          </div>
          <button className={`btn mt-4 ${cur.done ? 'btn-primary' : ''}`} onClick={() => setCur({ done: !cur.done })}>
            <Check size={15} /> {cur.done ? 'Done ✓' : 'Mark set done'}
          </button>
        </div>

        {/* nav */}
        <div className="flex gap-3 mt-5 pb-4">
          <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={16} /> Prev</button>
          {!last
            ? <button className="btn btn-primary flex-1 justify-center" onClick={() => { setCur({ done: true }); setI(i + 1) }}>Next exercise <ChevronRight size={16} /></button>
            : <button className="btn btn-primary flex-1 justify-center" onClick={() => { setCur({ done: true }); finish() }}>Finish & save 🎉</button>}
        </div>
      </div>
    </div>
  )
}
