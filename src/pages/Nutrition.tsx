import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Ring, Bar, Modal, Empty, PageHeader } from '../components/ui'
import { caloriesOn, calorieTarget, macrosOn, mealsOn, proteinTarget, carbTarget, fatTarget } from '../lib/calcs'
import { today, uid, FOOD_DB, FoodItem } from '../lib/seed'
import { MealType } from '../lib/types'
import { Trash2, Search } from 'lucide-react'

const MEAL_ICON: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

export default function Nutrition() {
  const d = useStore((s) => s.data)
  const addMeal = useStore((s) => s.addMeal)
  const delMeal = useStore((s) => s.delMeal)
  const showToast = useStore((s) => s.showToast)
  const [open, setOpen] = useState(false)
  const t = today()
  const cals = caloriesOn(d, t)
  const tgt = calorieTarget(d)
  const m = macrosOn(d, t)
  const meals = mealsOn(d, t)

  return (
    <>
      <PageHeader title="Nutrition" sub={`Daily target ${tgt} kcal · ${d.profile.goalRate} kg/week plan`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Meal</button>} />

      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.6fr)' }}>
        <Card><div className="h3 mb-2">Calories Today</div>
          <div className="flex flex-col items-center text-center mt-1">
            <Ring pct={(cals / tgt) * 100} color={cals <= tgt ? '#2bffb0' : '#ffcf5c'} label="consumed" center={cals} />
            <div className="mt-3 text-[13px] text-muted">
              {cals <= tgt ? <><b className="text-green">{tgt - cals} kcal</b> remaining</> : <><b className="text-amber">{cals - tgt} kcal</b> over</>}
            </div></div></Card>
        <Card><div className="h3 mb-3">Macros</div>
          <Bar label="Protein" value={m.p} target={proteinTarget(d)} color="#22e3ff" />
          <Bar label="Carbs" value={m.c} target={carbTarget(d)} color="#8b5cff" />
          <Bar label="Fat" value={m.f} target={fatTarget(d)} color="#ff4fd8" />
          <div className="text-muted text-[11.5px] mt-1.5">Protein target scales with bodyweight (1.8 g/kg) to preserve muscle in a deficit.</div>
        </Card>
      </div>

      <Card className="mt-4"><div className="h3 mb-3">Today's Meals</div>
        {meals.length ? (
          <div className="flex flex-col gap-2.5">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-3.5 p-3 rounded-xl"
                style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-lg" style={{ background: 'rgba(120,160,255,.08)' }}>{MEAL_ICON[meal.mealType]}</div>
                <div className="flex-1 min-w-0"><b className="text-[14.5px] block truncate">{meal.name}</b>
                  <span className="text-xs text-muted">{meal.mealType} · P{meal.protein} C{meal.carbs} F{meal.fat}</span></div>
                <div className="font-extrabold text-right">{meal.calories}<span className="block text-[11px] text-muted font-semibold">kcal</span></div>
                <button className="btn btn-sm btn-danger" onClick={() => delMeal(meal.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        ) : <Empty icon="🍽️" title="Nothing logged today" sub="Tap “Log Meal” to add food" />}
      </Card>

      {open && <MealModal onClose={() => setOpen(false)} onSave={(meal) => { addMeal(meal); showToast('Meal logged 🍽️'); setOpen(false) }} />}
    </>
  )
}

function MealModal({ onClose, onSave }: { onClose: () => void; onSave: (m: any) => void }) {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [name, setName] = useState('')
  const [vals, setVals] = useState({ calories: '', protein: '', carbs: '', fat: '' })
  const [date, setDate] = useState(today())
  const [q, setQ] = useState('')

  const results = q.trim() ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : []

  function pick(f: FoodItem) {
    setName(`${f.name} (${f.serving})`)
    setVals({ calories: String(f.calories), protein: String(f.protein), carbs: String(f.carbs), fat: String(f.fat) })
    setQ('')
  }

  return (
    <Modal title="Log Meal" onClose={onClose}>
      <div className="mt-4">
        <label className="label">Meal</label>
        <div className="flex gap-2 mb-3.5 flex-wrap">
          {(Object.keys(MEAL_ICON) as MealType[]).map((t) => (
            <span key={t} className={`chip ${mealType === t ? 'chip-on' : ''}`} onClick={() => setMealType(t)}>
              {MEAL_ICON[t]} {t[0].toUpperCase() + t.slice(1)}</span>
          ))}
        </div>

        <label className="label">Search food database</label>
        <div className="relative mb-2">
          <Search size={15} className="absolute left-3 top-3 text-muted" />
          <input className="input pl-9" placeholder="e.g. chicken, rice, paneer…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {results.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-3 max-h-[180px] overflow-y-auto">
            {results.map((f) => (
              <button key={f.name} onClick={() => pick(f)}
                className="flex justify-between items-center p-2.5 rounded-lg text-left text-sm hover:bg-[rgba(120,160,255,.08)]"
                style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
                <span><b>{f.name}</b><span className="text-muted text-xs block">{f.serving}</span></span>
                <span className="text-cyan font-bold">{f.calories} kcal</span>
              </button>
            ))}
          </div>
        )}

        <div className="mb-3.5"><label className="label">Food</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Food name" /></div>
        <div className="mb-3.5"><label className="label">Calories</label>
          <input className="input" type="number" value={vals.calories} onChange={(e) => setVals({ ...vals, calories: e.target.value })} placeholder="kcal" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">Protein</label><input className="input" type="number" value={vals.protein} onChange={(e) => setVals({ ...vals, protein: e.target.value })} /></div>
          <div><label className="label">Carbs</label><input className="input" type="number" value={vals.carbs} onChange={(e) => setVals({ ...vals, carbs: e.target.value })} /></div>
          <div><label className="label">Fat</label><input className="input" type="number" value={vals.fat} onChange={(e) => setVals({ ...vals, fat: e.target.value })} /></div>
        </div>
        <div className="mt-3.5 mb-1"><label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <button className="btn btn-primary w-full mt-4" onClick={() => {
          if (!name.trim()) return alert('Enter a food name')
          onSave({ id: uid(), date, mealType, name: name.trim(), calories: +vals.calories || 0, protein: +vals.protein || 0, carbs: +vals.carbs || 0, fat: +vals.fat || 0 })
        }}>Save Meal</button>
      </div>
    </Modal>
  )
}
