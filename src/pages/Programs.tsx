import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, PageHeader, Modal, Tag } from '../components/ui'
import { ExerciseImage } from '../components/ExerciseImage'
import { PROGRAMS, Program, Gender, suggestProgram, getProgram } from '../lib/programs'
import { tdee, bmi, latestWeight } from '../lib/calcs'
import { today } from '../lib/seed'
import { Check, Sparkles, Play } from 'lucide-react'

export default function Programs() {
  const d = useStore((s) => s.data)
  const saveProfile = useStore((s) => s.saveProfile)
  const addWorkout = useStore((s) => s.addWorkout)
  const showToast = useStore((s) => s.showToast)
  const nav = useNavigate()
  const [gender, setGender] = useState<Gender>('all')
  const [detail, setDetail] = useState<Program | null>(null)

  const w = latestWeight(d)
  const recommended = suggestProgram({ sex: d.profile.sex, bmi: bmi(d), currentKg: w, targetKg: d.profile.targetWeight })
  const active = getProgram(d.profile.programId)

  const list = PROGRAMS.filter((p) => gender === 'all' ? true : p.gender === 'all' || p.gender === gender)

  function pick(p: Program) { saveProfile({ programId: p.id }); showToast(`${p.name} set as your goal 🎯`) }
  function startWorkout(p: Program) {
    addWorkout({ date: today(), type: 'strength', name: `${p.name} — Day 1`,
      exercises: p.keyExercises.map((n) => ({ name: n, sets: Array.from({ length: 3 }, () => ({ reps: 10, weight: 0 })) })) })
    showToast('Starter workout added — set your weights in Workouts 💪'); nav('/workouts')
  }

  return (
    <>
      <PageHeader title="Programs & Coaching" sub="Goal-based plans for every body — workouts, diet & expected results" />

      {/* recommended */}
      <Card className="mb-5" >
        <div className="flex items-center gap-2 mb-3"><Sparkles size={16} className="text-cyan" /><div className="h3">Recommended for you</div></div>
        <ProgramRow p={recommended} active={active?.id === recommended.id} onOpen={() => setDetail(recommended)} onPick={() => pick(recommended)} />
        {active && active.id !== recommended.id && (
          <div className="text-muted text-xs mt-3">Your active goal: <b className="text-txt">{active.emoji} {active.name}</b></div>
        )}
      </Card>

      {/* gender filter */}
      <div className="flex gap-2 mb-4">
        {([['all', 'All'], ['men', 'Men'], ['women', 'Women']] as [Gender, string][]).map(([g, l]) => (
          <span key={g} className={`chip ${gender === g ? 'chip-on' : ''}`} onClick={() => setGender(g)}>{l}</span>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {list.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <b className="text-[16px]">{p.name}</b>
                  {active?.id === p.id && <Check size={15} className="text-green" />}
                </div>
                <div className="text-muted text-xs mt-1">{p.tagline}</div>
              </div>
              <Tag color={p.level === 'Advanced' ? 'gold' : p.level === 'Intermediate' ? 'cardio' : 'str'}>{p.level}</Tag>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {p.keyExercises.slice(0, 4).map((n) => <ExerciseImage key={n} name={n} size={40} rounded={9} />)}
            </div>
            <div className="flex gap-2 mt-3.5">
              <button className="btn btn-sm btn-primary flex-1 justify-center" onClick={() => setDetail(p)}>View plan</button>
              <button className={`btn btn-sm ${active?.id === p.id ? '' : ''}`} onClick={() => pick(p)}>{active?.id === p.id ? 'Active' : 'Set goal'}</button>
            </div>
          </Card>
        ))}
      </div>

      {detail && (
        <ProgramDetail p={detail} tdeeVal={Math.round(tdee(d))} bodyKg={w}
          active={active?.id === detail.id}
          onClose={() => setDetail(null)} onPick={() => pick(detail)} onStart={() => startWorkout(detail)} />
      )}
    </>
  )
}

function ProgramRow({ p, active, onOpen, onPick }: { p: Program; active: boolean; onOpen: () => void; onPick: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: `1px solid ${p.color}44` }}>
      <span className="text-3xl shrink-0">{p.emoji}</span>
      <div className="flex-1 min-w-0">
        <b className="text-[15px]">{p.name}</b>
        <div className="text-muted text-xs">{p.tagline}</div>
      </div>
      <button className="btn btn-sm" onClick={onOpen}>View</button>
      <button className="btn btn-sm btn-primary" onClick={onPick}>{active ? 'Active' : 'Set goal'}</button>
    </div>
  )
}

function ProgramDetail({ p, tdeeVal, bodyKg, active, onClose, onPick, onStart }:
  { p: Program; tdeeVal: number; bodyKg: number; active: boolean; onClose: () => void; onPick: () => void; onStart: () => void }) {
  const kcal = Math.max(1200, tdeeVal + p.kcalDelta)
  const protein = Math.round((bodyKg || 75) * p.proteinPerKg)
  const carbs = Math.round((kcal * p.macros.carbs / 100) / 4)
  const fat = Math.round((kcal * p.macros.fat / 100) / 9)

  return (
    <Modal title={`${p.emoji} ${p.name}`} onClose={onClose}>
      <div className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
        <p className="text-sm text-muted leading-relaxed mb-4">{p.description}</p>

        <div className="h3 mb-2">🎯 Daily Nutrition Target</div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[['Calories', kcal, ''], ['Protein', protein, 'g'], ['Carbs', carbs, 'g'], ['Fat', fat, 'g']].map(([l, v, u]) => (
            <div key={l as string} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
              <div className="text-[18px] font-extrabold">{v as number}<span className="text-[11px] text-muted">{u as string}</span></div>
              <div className="text-[10px] text-muted uppercase tracking-wide">{l as string}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-muted2 mb-4">{p.kcalDelta < 0 ? `${Math.abs(p.kcalDelta)} kcal deficit` : p.kcalDelta > 0 ? `${p.kcalDelta} kcal surplus` : 'at maintenance'} · based on your TDEE of {tdeeVal} kcal.</div>

        <div className="h3 mb-2">📅 Weekly Split</div>
        <div className="grid grid-cols-1 gap-1.5 mb-4">
          {p.split.map((s) => (
            <div key={s.day} className="flex items-center gap-3 text-sm p-2 rounded-lg" style={{ background: 'rgba(6,8,15,.4)' }}>
              <span className="w-10 font-bold text-muted">{s.day}</span><span>{s.focus}</span>
            </div>
          ))}
        </div>

        <div className="h3 mb-2">🏋️ Key Exercises</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {p.keyExercises.map((n) => (
            <div key={n} className="flex items-center gap-2 pr-3 rounded-xl" style={{ background: 'rgba(6,8,15,.4)' }}>
              <ExerciseImage name={n} size={34} rounded={9} /><span className="text-xs font-semibold">{n}</span>
            </div>
          ))}
        </div>

        <div className="h3 mb-2">🥗 Recommended Foods</div>
        <div className="space-y-2 mb-4 text-sm">
          {([['Protein', p.foods.protein], ['Carbs', p.foods.carbs], ['Fats', p.foods.fats], ['Veg', p.foods.veg], ['Snacks', p.foods.snacks]] as [string, string[]][]).map(([k, arr]) => (
            <div key={k} className="flex gap-2">
              <b className="w-16 shrink-0 text-muted text-xs uppercase tracking-wide pt-0.5">{k}</b>
              <span className="text-txt">{arr.join(', ')}</span>
            </div>
          ))}
        </div>

        <div className="h3 mb-2">📈 Expected Results</div>
        <p className="text-sm text-muted leading-relaxed mb-5">{p.results}</p>

        <div className="flex gap-2 sticky bottom-0 pt-2" style={{ background: 'linear-gradient(180deg,transparent,#121826 40%)' }}>
          <button className="btn btn-primary flex-1 justify-center" onClick={onPick}>{active ? '✓ Active goal' : 'Set as my goal'}</button>
          <button className="btn" onClick={onStart}><Play size={14} /> Start Day 1</button>
        </div>
      </div>
    </Modal>
  )
}
