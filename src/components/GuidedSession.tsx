import { useEffect, useRef, useState } from 'react'
import { ExerciseImage } from './ExerciseImage'
import { SessionItem, SessionMode } from '../lib/session'
import { Workout } from '../lib/types'
import { today, uid } from '../lib/seed'
import { X, ChevronLeft, ChevronRight, Check, Maximize2, Pause, Play as PlayIcon, SkipForward } from 'lucide-react'

const IMG_SIZES = [
  { key: 'S', px: 120 }, { key: 'M', px: 200 }, { key: 'L', px: 300 }, { key: 'XL', px: 420 },
]
const IMG_KEY = 'pulse_guided_imgsize'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`

export function GuidedSession({ title, items, mode, restSec, estMin, onClose, onComplete }: {
  title: string
  items: SessionItem[]
  mode: SessionMode
  restSec: number
  estMin: number
  onClose: () => void
  onComplete: (w: Omit<Workout, 'id'>) => void
}) {
  const [i, setI] = useState(0)
  const [resting, setResting] = useState(false)
  const [weights, setWeights] = useState<number[]>(items.map(() => 0))
  const [repsArr, setRepsArr] = useState<number[]>(items.map((it) => it.reps || 0))
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [countdown, setCountdown] = useState<number>(mode === 'circuit' ? (items[0]?.seconds || 40) : 0)
  const [sizeKey, setSizeKey] = useState(() => localStorage.getItem(IMG_KEY) || 'L')
  const size = IMG_SIZES.find((s) => s.key === sizeKey) || IMG_SIZES[2]

  const cur = items[i]
  const next = items[i + 1]
  const last = i === items.length - 1

  // overall elapsed clock
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [paused])

  // countdown for timed circuit / rest periods
  useEffect(() => {
    if (paused) return
    if (mode !== 'circuit' && !resting) return
    if (countdown <= 0) { advance(); return }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }) // re-run each render; guarded by countdown

  const advanceRef = useRef<() => void>(() => {})
  function advance() {
    if (resting) {
      // finished rest → start next item
      setResting(false)
      const ni = i + 1
      if (ni >= items.length) { finish(); return }
      setI(ni)
      setCountdown(mode === 'circuit' ? (items[ni]?.seconds || 40) : 0)
    } else {
      // finished a work interval
      if (last) { finish(); return }
      setResting(true)
      setCountdown(restSec)
    }
  }
  advanceRef.current = advance

  function manualNext() {
    if (last) { finish(); return }
    setI(i + 1)
    setCountdown(mode === 'circuit' ? (items[i + 1]?.seconds || 40) : 0)
    setResting(false)
  }
  function manualPrev() {
    if (i === 0) return
    setI(i - 1); setResting(false)
    setCountdown(mode === 'circuit' ? (items[i - 1]?.seconds || 40) : 0)
  }

  function finish() {
    const w: Omit<Workout, 'id'> = mode === 'circuit'
      ? { date: today(), type: 'cardio', name: title,
          cardio: { duration: Math.round(elapsed / 60), distance: 0, calories: Math.round((elapsed / 60) * 8) } }
      : { date: today(), type: 'strength', name: title,
          exercises: items.map((it, idx) => ({ name: it.name, sets: Array.from({ length: it.sets || 3 }, () => ({ reps: repsArr[idx] || it.reps || 10, weight: weights[idx] || 0 })) })) }
    onComplete(w)
  }

  function pickSize(k: string) { setSizeKey(k); localStorage.setItem(IMG_KEY, k) }

  if (!cur) return null

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto" style={{ background: 'rgba(3,5,12,.92)', backdropFilter: 'blur(8px)' }}>
      <div className="max-w-[760px] mx-auto min-h-screen flex flex-col p-4 sm:p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            <div className="text-[11px] text-muted uppercase tracking-widest truncate">Guided · {title}</div>
            <div className="text-lg font-extrabold">Step {i + 1} of {items.length}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-xl font-extrabold tabular-nums">{fmt(elapsed)}</div>
              <div className="text-[10px] text-muted uppercase tracking-wide">~{estMin} min total</div>
            </div>
            <button className="btn btn-sm" onClick={() => setPaused((p) => !p)}>{paused ? <PlayIcon size={15} /> : <Pause size={15} />}</button>
            <button className="btn btn-sm" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {/* progress */}
        <div className="h-1.5 rounded-full bg-[rgba(120,160,255,.12)] mb-4 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${((i + (resting ? 0.5 : 0)) / items.length) * 100}%`, background: 'linear-gradient(90deg,#22e3ff,#8b5cff,#ff4fd8)' }} />
        </div>

        {/* image size */}
        <div className="flex items-center gap-2 mb-3">
          <Maximize2 size={13} className="text-muted" />
          <span className="text-[11px] text-muted uppercase tracking-wide mr-1">Image</span>
          {IMG_SIZES.map((s) => (
            <button key={s.key} onClick={() => pickSize(s.key)}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold border ${sizeKey === s.key ? 'text-white border-line2' : 'text-muted border-line'}`}
              style={sizeKey === s.key ? { background: 'linear-gradient(135deg,rgba(34,227,255,.2),rgba(139,92,255,.2))' } : undefined}>{s.key}</button>
          ))}
        </div>

        {resting ? (
          /* REST screen */
          <div className="card card-glow flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-muted uppercase tracking-widest">Rest</div>
            <div className="text-6xl font-extrabold tabular-nums my-3" style={{ color: '#22e3ff' }}>{fmt(countdown)}</div>
            {next && <div className="text-muted text-sm">Next up: <b className="text-txt">{next.name}</b></div>}
            <button className="btn mt-5" onClick={() => { setCountdown(0); advance() }}><SkipForward size={15} /> Skip rest</button>
          </div>
        ) : (
          /* WORK screen */
          <div className="card card-glow flex-1 flex flex-col items-center text-center">
            <div className="text-[11px] text-cyan uppercase tracking-widest mb-1">Now</div>
            <div className="flex justify-center my-1"><ExerciseImage name={cur.name} size={Math.min(size.px, 460)} rounded={20} /></div>
            <h2 className="text-2xl font-extrabold mt-2">{cur.name}</h2>
            {mode === 'circuit'
              ? <div className="text-5xl font-extrabold tabular-nums my-2" style={{ color: countdown <= 5 ? '#ff5d7a' : '#2bffb0' }}>{fmt(countdown)}</div>
              : <div className="text-muted text-sm mt-1">{cur.muscle} · target {cur.sets} × {cur.reps}</div>}
            <p className="text-muted text-[13.5px] leading-relaxed mt-2 max-w-[520px]">{cur.howto}</p>

            {mode === 'strength' && (
              <div className="grid grid-cols-2 gap-3 w-full max-w-[360px] mt-4">
                <div><label className="label">Weight (kg)</label>
                  <input className="input text-center" type="number" value={weights[i] || ''} placeholder="0"
                    onChange={(e) => setWeights(weights.map((w, idx) => idx === i ? +e.target.value : w))} /></div>
                <div><label className="label">Reps / set</label>
                  <input className="input text-center" type="number" value={repsArr[i] || ''}
                    onChange={(e) => setRepsArr(repsArr.map((r, idx) => idx === i ? +e.target.value : r))} /></div>
              </div>
            )}

            {next && <div className="text-muted text-xs mt-4">⏭️ Next: <b className="text-txt">{next.name}</b></div>}
          </div>
        )}

        {/* nav */}
        <div className="flex gap-3 mt-5 pb-4">
          <button className="btn" disabled={i === 0 && !resting} onClick={manualPrev}><ChevronLeft size={16} /> Prev</button>
          {!last
            ? <button className="btn btn-primary flex-1 justify-center" onClick={manualNext}>{mode === 'circuit' ? 'Skip to next' : 'Done — next'} <ChevronRight size={16} /></button>
            : <button className="btn btn-primary flex-1 justify-center" onClick={finish}><Check size={16} /> Finish & save 🎉</button>}
        </div>
      </div>
    </div>
  )
}
