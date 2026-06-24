import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, PageHeader, Modal, Tag } from '../components/ui'
import { ExerciseImage } from '../components/ExerciseImage'
import { EXERCISE_LIBRARY, LEVELS, ROUTINE_TEMPLATES, LibExercise } from '../lib/exerciseLibrary'
import { NINJA_MUSCLES, NINJA_DIFFICULTY } from '../lib/apiNinjas'
import { findExercises, UnifiedExercise } from '../lib/exerciseSource'
import { Level } from '../lib/types'
import { today } from '../lib/seed'
import { Search, Play, Loader2, Globe } from 'lucide-react'

const LEVEL_COLOR: Record<Level, string> = { Beginner: '#2bffb0', Intermediate: '#22e3ff', Advanced: '#ffcf5c' }

export default function Library() {
  const addWorkout = useStore((s) => s.addWorkout)
  const addRoutine = useStore((s) => s.addRoutine)
  const showToast = useStore((s) => s.showToast)
  const nav = useNavigate()
  const [level, setLevel] = useState<Level | 'All'>('All')
  const [q, setQ] = useState('')
  const [detail, setDetail] = useState<LibExercise | null>(null)

  const muscles = useMemo(() => ['All', ...Array.from(new Set(EXERCISE_LIBRARY.map((e) => e.category)))], [])
  const [muscle, setMuscle] = useState('All')

  // Online exercise search (API Ninjas with automatic wger fallback)
  const exerciseSource = useStore((s) => s.data.settings.exerciseSource)
  const [nMuscle, setNMuscle] = useState('chest')
  const [nDiff, setNDiff] = useState('')
  const [nResults, setNResults] = useState<UnifiedExercise[]>([])
  const [nProvider, setNProvider] = useState<'ninja' | 'wger' | 'none' | null>(null)
  const [nFellBack, setNFellBack] = useState(false)
  const [nLoading, setNLoading] = useState(false)
  const [nDetail, setNDetail] = useState<UnifiedExercise | null>(null)
  async function searchOnline() {
    setNLoading(true); setNProvider(null)
    const r = await findExercises({ muscle: nMuscle, difficulty: nDiff }, exerciseSource)
    setNResults(r.items); setNProvider(r.provider); setNFellBack(r.fellBack); setNLoading(false)
  }
  function addNinja(e: UnifiedExercise) {
    addWorkout({ date: today(), type: 'strength', name: e.name,
      exercises: [{ name: e.name, sets: Array.from({ length: 3 }, () => ({ reps: 10, weight: 0 })) }] })
    showToast(`Logged ${e.name} — set your weights in Workouts`)
    setNDetail(null); nav('/workouts')
  }

  const filtered = EXERCISE_LIBRARY.filter((e) =>
    (level === 'All' || e.level === level) &&
    (muscle === 'All' || e.category === muscle) &&
    (!q.trim() || e.name.toLowerCase().includes(q.toLowerCase())))

  function startTemplate(id: string) {
    const t = ROUTINE_TEMPLATES.find((x) => x.id === id)!
    addWorkout({ date: today(), type: 'strength', name: t.name,
      exercises: t.exercises.map((e) => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: 0 })) })) })
    showToast(`Started "${t.name}" — add your weights in Workouts 💪`)
    nav('/workouts')
  }
  function saveTemplate(id: string) {
    const t = ROUTINE_TEMPLATES.find((x) => x.id === id)!
    addRoutine({ name: t.name, focus: t.focus, color: t.color, exercises: t.exercises })
    showToast('Saved to your Routines ✅')
  }

  return (
    <>
      <PageHeader title="Exercise Library" sub={`${EXERCISE_LIBRARY.length} exercises · ${ROUTINE_TEMPLATES.length} ready-made programs`} />

      {/* Programs by level */}
      <Card className="mb-5"><div className="h3 mb-3">📋 Programs by Level</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
          {ROUTINE_TEMPLATES.map((t) => (
            <div key={t.id} className="p-3.5 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
              <div className="flex items-center justify-between">
                <b className="text-[15px]">{t.name}</b>
                <Tag color={t.level === 'Advanced' ? 'gold' : t.level === 'Intermediate' ? 'cardio' : 'str'}>{t.level}</Tag>
              </div>
              <div className="text-muted text-xs mt-0.5">{t.focus}</div>
              <div className="flex -space-x-2 mt-3">
                {t.exercises.slice(0, 5).map((e, i) => (
                  <div key={i} className="rounded-lg ring-2 ring-[#0a0e1a]"><ExerciseImage name={e.name} size={34} rounded={8} /></div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-sm btn-primary flex-1 justify-center" onClick={() => startTemplate(t.id)}><Play size={13} /> Start</button>
                <button className="btn btn-sm" onClick={() => saveTemplate(t.id)}>Save</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Online exercise search with auto-fallback */}
      {(
        <Card className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="h3 sm:mr-auto flex items-center gap-2"><Globe size={15} className="text-cyan" /> Search Full Database
              {nProvider === 'ninja' && <span className="tag bg-[rgba(139,92,255,.16)] text-[#c4b1ff]">API Ninjas</span>}
              {nProvider === 'wger' && <span className="tag bg-[rgba(34,227,255,.14)] text-cyan">wger{nFellBack ? ' (fallback)' : ''}</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <select className="input" style={{ width: 'auto' }} value={nMuscle} onChange={(e) => setNMuscle(e.target.value)}>
                {NINJA_MUSCLES.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
              <select className="input" style={{ width: 'auto' }} value={nDiff} onChange={(e) => setNDiff(e.target.value)}>
                <option value="">Any level</option>
                {NINJA_DIFFICULTY.map((dd) => <option key={dd} value={dd}>{dd}</option>)}
              </select>
              <button className="btn btn-primary shrink-0" disabled={nLoading} onClick={searchOnline}>
                {nLoading ? <Loader2 size={15} className="animate-spin" /> : 'Find'}</button>
            </div>
          </div>
          {nResults.length > 0 ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
              {nResults.map((e, i) => (
                <button key={i} onClick={() => setNDetail(e)} className="text-left p-2.5 rounded-xl transition hover:-translate-y-0.5"
                  style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                  <ExerciseImage name={e.name} size={120} rounded={12} />
                  <b className="text-[13px] block mt-2 leading-tight">{e.name}</b>
                  <span className="text-[11px] text-muted capitalize">{e.type} · {e.difficulty}</span>
                </button>
              ))}
            </div>
          ) : <div className="text-muted2 text-sm">Pick a muscle group and tap Find to pull exercises with full instructions.</div>}
        </Card>
      )}

      {/* Exercise browser */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="h3 sm:mr-auto">💪 All Exercises</div>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input className="input pl-9" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {(['All', ...LEVELS] as const).map((l) => (
            <span key={l} className={`chip ${level === l ? 'chip-on' : ''}`} onClick={() => setLevel(l)}>{l}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {muscles.map((m) => (
            <span key={m} className={`chip ${muscle === m ? 'chip-on' : ''}`} onClick={() => setMuscle(m)} style={{ fontSize: 11, padding: '5px 11px' }}>{m}</span>
          ))}
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
          {filtered.map((e) => (
            <button key={e.name} onClick={() => setDetail(e)} className="text-left p-2.5 rounded-xl transition hover:-translate-y-0.5"
              style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
              <ExerciseImage name={e.name} size={120} rounded={12} />
              <b className="text-[13px] block mt-2 leading-tight">{e.name}</b>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: LEVEL_COLOR[e.level] }} />
                <span className="text-[11px] text-muted">{e.category}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-muted2 text-sm py-6">No exercises match.</div>}
        </div>
      </Card>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div className="mt-3 flex gap-4">
            <ExerciseImage name={detail.name} size={120} rounded={14} />
            <div className="text-sm">
              <div className="flex gap-2 flex-wrap mb-2">
                <Tag color={detail.level === 'Advanced' ? 'gold' : detail.level === 'Intermediate' ? 'cardio' : 'str'}>{detail.level}</Tag>
                <span className="tag bg-[rgba(120,160,255,.12)] text-muted">{detail.muscle}</span>
                <span className="tag bg-[rgba(120,160,255,.12)] text-muted">{detail.equipment}</span>
              </div>
              <p className="text-muted leading-relaxed">{detail.howto}</p>
            </div>
          </div>
          <button className="btn btn-primary w-full mt-4" onClick={() => {
            addWorkout({ date: today(), type: 'strength', name: detail.name,
              exercises: [{ name: detail.name, sets: Array.from({ length: 3 }, () => ({ reps: 10, weight: 0 })) }] })
            showToast(`Logged ${detail.name} — set your weights in Workouts`)
            setDetail(null); nav('/workouts')
          }}>Add to today's workout</button>
        </Modal>
      )}

      {nDetail && (
        <Modal title={nDetail.name} onClose={() => setNDetail(null)}>
          <div className="mt-3">
            <div className="flex gap-4">
              <ExerciseImage name={nDetail.name} size={120} rounded={14} />
              <div className="flex gap-2 flex-wrap text-sm h-fit">
                <span className="tag bg-[rgba(120,160,255,.12)] text-muted capitalize">{nDetail.type}</span>
                <span className="tag bg-[rgba(120,160,255,.12)] text-muted capitalize">{nDetail.muscle.replace('_', ' ')}</span>
                <span className="tag bg-[rgba(120,160,255,.12)] text-muted capitalize">{nDetail.equipment}</span>
                <span className="tag bg-[rgba(255,207,92,.14)] text-amber capitalize">{nDetail.difficulty}</span>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed mt-3 whitespace-pre-line">{nDetail.instructions}</p>
            <button className="btn btn-primary w-full mt-4" onClick={() => addNinja(nDetail)}>Add to today's workout</button>
          </div>
        </Modal>
      )}
    </>
  )
}
