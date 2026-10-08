import { useStore } from '../lib/store'
import { Program, programCalories } from '../lib/programs'
import { DietPlan, bestDietFor, dietGoalFor, planTotals } from '../lib/dietPlans'
import { tdee } from '../lib/calcs'
import { today } from '../lib/seed'
import { Check } from 'lucide-react'

/** Apply a static diet plan as today's meals (replacing them). */
export function useApplyDiet() {
  const setDayMeals = useStore((s) => s.setDayMeals)
  const showToast = useStore((s) => s.showToast)
  return (p: DietPlan) => {
    setDayMeals(today(), p.items.map((it) => ({ date: today(), mealType: it.meal, name: it.name, calories: it.calories, protein: it.protein, carbs: it.carbs, fat: it.fat })))
    showToast(`${p.name} loaded into today — review & edit in Nutrition ✅`)
  }
}

/** The best veg and non-veg diet plans for a goal program, one tap to apply. */
export function DietPicks({ program, onView }: { program: Program; onView?: (p: DietPlan) => void }) {
  const d = useStore((s) => s.data)
  const apply = useApplyDiet()
  const kcal = programCalories(program, tdee(d))
  const picks = [bestDietFor(program, kcal, true), bestDietFor(program, kcal, false)]

  return (
    <div>
      <div className="text-[12px] text-muted mb-2">{program.emoji} <b className="text-txt">{program.name}</b> needs a <b className="text-txt">{dietGoalFor(program).toLowerCase()}</b> diet at ~<b className="text-txt">{kcal} kcal</b>/day. Best matches:</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {picks.map((p, i) => {
          const t = planTotals(p)
          return (
            <div key={p.id} className="p-3 rounded-xl" style={{ background: 'rgba(43,255,176,.05)', border: '1px solid rgba(43,255,176,.25)' }}>
              <div className="text-[10px] uppercase tracking-wide font-bold text-green mb-0.5">{i === 0 ? '🥬 Best veg' : '🍗 Best non-veg'}</div>
              <b className="text-[13.5px] block">{p.name}</b>
              <div className="text-[11px] mt-0.5"><b className="text-green">{t.calories} kcal</b> <span className="text-muted">· P{t.protein} C{t.carbs} F{t.fat}</span></div>
              <div className="flex gap-2 mt-2">
                {onView && <button className="btn btn-sm flex-1 justify-center" onClick={() => onView(p)}>View</button>}
                <button className="btn btn-sm btn-primary flex-1 justify-center" onClick={() => apply(p)}><Check size={13} /> Apply today</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
