import { ReactNode, useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { FOOD_DB, FoodItem, today } from '../lib/seed'
import { menuForToday } from '../lib/canteenData'
import { MEAL_LABEL, itemQty, fmtQty } from '../lib/canteen'
import { servingLabel, servingStep } from '../lib/dietBuilder'
import { estimateMacros } from '../lib/macros'
import { Meal, MealType, MenuItem } from '../lib/types'
import { Minus, Plus, X, Search, Check } from 'lucide-react'

/**
 * Editable "plate" rows shared by the canteen suggestion, My Best Diet and
 * quick-add: every row can be stepped up/down or removed, and any food from
 * today's canteen menu or the food library can be added to any meal.
 */
export interface Macros { calories: number; protein: number; carbs: number; fat: number }
export interface PlanRow {
  key: string
  meal: MealType
  name: string
  servings: number
  step: number
  /** values for ONE serving */
  per: Macros
  /** "3 Nos" / "1½ cups" for a given number of servings */
  label: (servings: number) => string
  /** optional extra on the row (role, health pill…) */
  tag?: ReactNode
  /** already logged to today from this plate (locked) */
  logged?: boolean
}

let n = 0
const key = () => `r${++n}`

export function rowFromMenu(it: MenuItem, servings = 1, per?: Macros): PlanRow {
  const q = itemQty(it)
  const m = per || { calories: it.calories, ...estimateMacros(it.name, it.calories) }
  return { key: key(), meal: it.meal, name: it.name, servings, step: q.unit === 'g' ? 0.5 : 1, per: m, label: (s) => fmtQty(q, s) }
}
export function rowFromFood(f: FoodItem, meal: MealType, servings = 1): PlanRow {
  return { key: key(), meal, name: f.name, servings, step: servingStep(f.serving),
    per: { calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat }, label: (s) => servingLabel(f.serving, s) }
}
export function rowTotals(r: PlanRow): Macros {
  const k = r.servings
  return { calories: Math.round(r.per.calories * k), protein: Math.round(r.per.protein * k), carbs: Math.round(r.per.carbs * k), fat: Math.round(r.per.fat * k) }
}
export function sumRows(rows: PlanRow[]): Macros {
  return rows.map(rowTotals).reduce((a, t) => ({ calories: a.calories + t.calories, protein: a.protein + t.protein, carbs: a.carbs + t.carbs, fat: a.fat + t.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

/** Mark rows already in today's log for that meal (logged as "Name (qty)") so reopening never double-logs. */
export function markLogged(rows: PlanRow[], meals: Meal[], date = today()): PlanRow[] {
  const done = meals.filter((m) => m.date === date)
  return rows.map((r) => done.some((m) => m.mealType === r.meal && m.name.startsWith(r.name + ' (')) ? { ...r, logged: true } : r)
}

/** Log rows to today, each with its quantity in the name — e.g. "Idli (3 Nos)". */
export function useLogRows() {
  const addMeal = useStore((s) => s.addMeal)
  return (rows: PlanRow[], date = today()) => rows.forEach((r) => {
    const t = rowTotals(r)
    addMeal({ date, mealType: r.meal, name: `${r.name} (${r.label(r.servings)})`, ...t })
  })
}

/** Search today's canteen menu + the food library; tap a result to add one serving. */
export function FoodSearch({ meal, onPick, onClose }: { meal: MealType; onPick: (row: PlanRow) => void; onClose?: () => void }) {
  const menus = useStore((s) => s.data.menus)
  const menu = menus[today()] || menuForToday().items
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    const hit = (name: string) => !t || name.toLowerCase().includes(t)
    // canteen items for this meal first, then the rest of today's menu, then the library
    const fromMenu = menu.filter((i) => hit(i.name)).sort((a, b) => Number(b.meal === meal) - Number(a.meal === meal))
    const seen = new Set<string>()
    const menuRows = fromMenu.filter((i) => !seen.has(i.name) && seen.add(i.name)).slice(0, t ? 12 : 8)
      .map((i) => ({ id: 'm:' + i.name, name: i.name, sub: `🏢 Canteen · ${fmtQty(itemQty(i))} · ${i.calories} kcal`, row: () => ({ ...rowFromMenu(i), meal }) }))
    const libRows = t ? FOOD_DB.filter((f) => hit(f.name)).slice(0, 20)
      .map((f) => ({ id: 'f:' + f.name, name: f.name, sub: `📚 ${f.serving} · ${f.calories} kcal`, row: () => rowFromFood(f, meal) })) : []
    return [...menuRows, ...libRows]
  }, [q, menu, meal])

  return (
    <div className="mt-2 p-2 rounded-xl" style={{ background: 'rgba(6,8,15,.6)', border: '1px solid rgba(34,227,255,.3)' }}>
      <div className="flex items-center gap-2">
        <Search size={14} className="text-muted shrink-0" />
        <input autoFocus className="input py-1.5 text-[13px]" placeholder={`Add to ${MEAL_LABEL[meal].slice(2).trim()} — e.g. banana, idli, egg…`} value={q} onChange={(e) => setQ(e.target.value)} />
        {onClose && <button className="text-muted hover:text-white p-1 shrink-0" aria-label="Close search" onClick={onClose}><X size={16} /></button>}
      </div>
      <div className="flex flex-col mt-1.5 max-h-[240px] overflow-y-auto overscroll-contain">
        {results.length === 0 && <div className="text-muted text-xs p-2">No match — try a simpler name.</div>}
        {results.map((r) => (
          <button key={r.id} className="flex items-center justify-between gap-2 text-left px-2 py-1.5 rounded-lg hover:bg-[rgba(120,160,255,.08)]"
            onClick={() => onPick(r.row())}>
            <span className="min-w-0"><b className="text-[13px] block truncate">{r.name}</b><span className="text-[11px] text-muted">{r.sub}</span></span>
            <Plus size={15} className="text-cyan shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

/** −/+ stepper with a remove button when it reaches zero-ish. */
export function QtyStepper({ value, label, onMinus, onPlus, onRemove }:
  { value: number; label: string; onMinus: () => void; onPlus: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button className="btn btn-sm px-1.5" aria-label="Less" onClick={onMinus} disabled={value <= 0}><Minus size={12} /></button>
      <span className="min-w-[58px] text-center text-[12px] font-bold" style={{ color: '#22e3ff' }}>{label}</span>
      <button className="btn btn-sm px-1.5" aria-label="More" onClick={onPlus}><Plus size={12} /></button>
      <button className="p-1 text-muted hover:text-red" aria-label="Remove" onClick={onRemove}><X size={15} /></button>
    </div>
  )
}

const MEALS: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']

/**
 * The editable plate: grouped by meal, −/+/✕ per row, "+ Add food" per meal,
 * live totals. Each meal can be logged on its own ("Log breakfast"); logged
 * rows lock, and the bottom button logs whatever is left. `onLog` gets the rows
 * just logged and whether the whole plate is now logged.
 */
export function PlanEditor({ rows, onChange, onLog, logLabel = 'Log all to today' }:
  { rows: PlanRow[]; onChange: (rows: PlanRow[]) => void; onLog: (rows: PlanRow[], allDone: boolean) => void; logLabel?: string }) {
  const [adding, setAdding] = useState<MealType | null>(null)
  const totals = sumRows(rows)
  const set = (k: string, servings: number) => onChange(rows.map((r) => r.key === k ? { ...r, servings: Math.max(0, Math.round(servings * 1000) / 1000) } : r))
  const remove = (k: string) => onChange(rows.filter((r) => r.key !== k))
  const add = (row: PlanRow) => {
    // adding something already on that meal's plate just bumps its quantity
    const same = rows.find((r) => r.meal === row.meal && r.name === row.name && !r.logged)
    onChange(same ? rows.map((r) => r === same ? { ...r, servings: r.servings + r.step } : r) : [...rows, row])
    setAdding(null)
  }
  const pending = (r: PlanRow) => !r.logged && r.servings > 0
  // log some rows, lock them, and tell the parent whether anything is left
  function logSome(which: (r: PlanRow) => boolean) {
    const rs = rows.filter((r) => pending(r) && which(r))
    if (!rs.length) return
    const next = rows.map((r) => rs.includes(r) ? { ...r, logged: true } : r)
    onChange(next)
    onLog(rs, !next.some(pending))
  }
  const anyLogged = rows.some((r) => r.logged)
  const left = rows.filter(pending).length
  const meals = MEALS.filter((m) => rows.some((r) => r.meal === m) || adding === m)
  const missing = MEALS.filter((m) => !meals.includes(m))

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[['Calories', totals.calories, ''], ['Protein', totals.protein, 'g'], ['Carbs', totals.carbs, 'g'], ['Fat', totals.fat, 'g']].map(([l, v, u]) => (
          <div key={l as string} className="rounded-xl p-2 text-center" style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
            <div className="text-[16px] font-extrabold">{v}<span className="text-[10px] text-muted">{u}</span></div><div className="text-[10px] text-muted uppercase tracking-wide">{l}</div></div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {meals.map((m) => {
          const its = rows.filter((r) => r.meal === m)
          const toLog = its.filter(pending)
          const allLogged = its.length > 0 && its.every((r) => r.logged || r.servings <= 0) && its.some((r) => r.logged)
          const mealName = MEAL_LABEL[m].slice(2).trim().replace(' & Drinks', '').toLowerCase()
          return (
            <div key={m} className="p-2.5 rounded-xl" style={{ background: allLogged ? 'rgba(43,255,176,.05)' : 'rgba(6,8,15,.4)', border: `1px solid ${allLogged ? 'rgba(43,255,176,.3)' : 'rgba(120,160,255,.12)'}` }}>
              <div className="flex justify-between items-center mb-1 px-0.5 gap-2">
                <b className="text-[12px] text-muted">{MEAL_LABEL[m]} <span className="text-muted2 font-normal">· {its.reduce((a, r) => a + rowTotals(r).calories, 0)} kcal</span></b>
                {allLogged
                  ? <span className="text-[11.5px] font-bold text-green flex items-center gap-1 shrink-0"><Check size={13} /> Logged</span>
                  : toLog.length > 0 && <button className="btn btn-sm shrink-0" style={{ borderColor: 'rgba(43,255,176,.4)' }} onClick={() => logSome((r) => r.meal === m)}>
                      <Check size={13} className="text-green" /> Log {its.some((r) => r.logged) ? `${toLog.length} more` : mealName}</button>}
              </div>
              {its.map((r) => {
                const t = rowTotals(r)
                const off = r.servings <= 0
                return (
                  <div key={r.key} className="flex items-center gap-2 py-1.5 border-b border-line last:border-0" style={{ opacity: off ? 0.45 : 1 }}>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-1.5 flex-wrap"><b className="text-[13px] leading-tight" style={{ textDecoration: off ? 'line-through' : undefined }}>{r.name}</b>{r.tag}</span>
                      <span className="text-[11px] text-muted"><b className="text-green">{t.calories} kcal</b> · P{t.protein} C{t.carbs} F{t.fat}</span>
                    </span>
                    {r.logged
                      ? <span className="text-[12px] font-bold shrink-0 flex items-center gap-1" style={{ color: '#22e3ff' }}>{r.label(r.servings)} <Check size={13} className="text-green" /></span>
                      : <QtyStepper value={r.servings} label={off ? 'skip' : r.label(r.servings)}
                          onMinus={() => set(r.key, r.servings - r.step)} onPlus={() => set(r.key, r.servings + r.step)} onRemove={() => remove(r.key)} />}
                  </div>
                )
              })}
              {adding === m
                ? <FoodSearch meal={m} onPick={add} onClose={() => setAdding(null)} />
                : <button className="text-[12px] font-bold text-cyan mt-1.5 flex items-center gap-1 px-0.5" onClick={() => setAdding(m)}><Plus size={13} /> Add food</button>}
            </div>
          )
        })}
      </div>
      {missing.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {missing.map((m) => <span key={m} className="chip" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setAdding(m)}>+ {MEAL_LABEL[m]}</span>)}
        </div>
      )}

      {anyLogged && <div className="text-[11px] text-muted2 mt-2.5">Logged items are in Today's Meals — change or remove them there.</div>}
      <button className="btn btn-primary w-full mt-3 justify-center" disabled={!left}
        onClick={() => logSome(() => true)}><Check size={15} /> {!left && anyLogged ? 'Everything logged' : anyLogged ? `Log the rest (${left} items)` : logLabel}</button>
    </div>
  )
}
