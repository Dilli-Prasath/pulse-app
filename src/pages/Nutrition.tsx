import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Ring, Bar, Modal, Empty, PageHeader, Accordion } from '../components/ui'
import { caloriesOn, calorieTarget, macrosOn, mealsOn, proteinTarget, carbTarget, fatTarget, waterToday, tdee } from '../lib/calcs'
import { today, uid, FOOD_DB, FoodItem } from '../lib/seed'
import { FOOD_GROUPS } from '../lib/foodDb'
import { parseMealOffline } from '../lib/foodNlp'
import { searchFoods, lookupBarcode, FoodResult } from '../lib/foodApi'
import { parseNutrition, ParsedNutrition, ninjaConfigured } from '../lib/apiNinjas'
import { exportNutrition } from '../lib/shareExport'
import { ocrImage } from '../lib/ocr'
import { DIET_PLANS, planTotals, DietPlan } from '../lib/dietPlans'
import { parseCanteenMenu, MEAL_LABEL, suggestFromMenu, MenuSuggestion } from '../lib/canteen'
import { menuForToday } from '../lib/canteenData'
import { estimateMacros } from '../lib/macros'
import { analyzeFood, dayReport, enrichFood, FoodHealth, BAND_COLOR } from '../lib/nutrition'
import { MealType, Meal, MenuItem } from '../lib/types'
import { Trash2, Search, Barcode, Globe, ListPlus, Loader2, Sparkles, ScanLine, Image as ImageIcon, FileDown, UtensilsCrossed, Check, Building2, Plus, Minus, HeartPulse, Database } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = { good: '#2bffb0', low: '#ffcf5c', high: '#ff5d7a', warn: '#ffcf5c' }

/** Compact health badge: grade chip + 0–100 score (+ optional top reason). Hover shows why. */
function HealthPill({ h, showLabel }: { h: FoodHealth; showLabel?: boolean }) {
  const c = BAND_COLOR[h.band]
  const title = [...h.pros.map((p) => '+ ' + p), ...h.cons.map((p) => '– ' + p)].join('\n') + (h.enriched ? '\n(refined with food database)' : '')
  return (
    <span title={title} className="inline-flex items-center gap-1 rounded-full pl-0.5 pr-1.5 py-0.5 text-[10px] font-bold align-middle shrink-0"
      style={{ background: c + '1f', color: c, border: `1px solid ${c}55` }}>
      <span className="grid place-items-center rounded-full font-black" style={{ width: 15, height: 15, background: c, color: '#06080f' }}>{h.grade}</span>
      {h.score}{showLabel && h.labels[0] ? <span className="font-semibold opacity-90"> · {h.labels[0]}</span> : null}
    </span>
  )
}

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

  async function doExport(fmt: 'png' | 'pdf') {
    showToast('Generating ' + fmt.toUpperCase() + '…')
    try {
      await exportNutrition({
        who: d.profile.name || 'You',
        dateLabel: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        meals: meals.map((x) => ({ name: x.name, mealType: x.mealType, calories: x.calories, protein: x.protein, carbs: x.carbs, fat: x.fat })),
        totals: { cal: cals, p: Math.round(m.p), c: Math.round(m.c), f: Math.round(m.f) },
        target: tgt,
        waterMl: waterToday(d),
      }, fmt)
    } catch {
      showToast('Export failed — try again')
    }
  }

  return (
    <>
      <PageHeader title="Nutrition" sub={`${d.profile.goalRate} kg/week plan · Mifflin–St Jeor`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Meal</button>} />

      {/* Energy targets */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card card-glow text-center py-4">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-1">Maintenance</div>
          <div className="text-[26px] font-extrabold text-violet leading-none">{Math.round(tdee(d))}</div>
          <div className="text-[11px] text-muted mt-1">kcal · TDEE</div>
        </div>
        <div className="card card-glow text-center py-4">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-1">Daily Target</div>
          <div className="text-[26px] font-extrabold text-green leading-none">{tgt}</div>
          <div className="text-[11px] text-muted mt-1">kcal/day</div>
        </div>
        <div className="card card-glow text-center py-4">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-1">Daily Deficit</div>
          <div className="text-[26px] font-extrabold text-cyan leading-none">−{Math.max(0, Math.round(tdee(d) - tgt))}</div>
          <div className="text-[11px] text-muted mt-1">kcal · {d.profile.goalRate} kg/wk</div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-[1fr_1.6fr]">
        <Card><div className="h3 mb-2">Calories Today</div>
          <div className="flex flex-col items-center text-center mt-1">
            <Ring pct={tgt ? (cals / tgt) * 100 : 0} color={cals <= tgt ? '#2bffb0' : '#ffcf5c'} label="consumed" center={cals} />
            <div className="mt-3 text-[13px] text-muted">
              {cals <= tgt ? <><b className="text-green">{tgt - cals} kcal</b> remaining</> : <><b className="text-amber">{cals - tgt} kcal</b> over</>}
            </div></div></Card>
        <Card><div className="h3 mb-3">Macros</div>
          <Bar label="Protein" value={m.p} target={proteinTarget(d)} color="#22e3ff" />
          <Bar label="Carbs" value={m.c} target={carbTarget(d)} color="#8b5cff" />
          <Bar label="Fat" value={m.f} target={fatTarget(d)} color="#ff4fd8" />
          <div className="text-muted text-[11.5px] mt-1.5">Protein 2.4 g/kg in a deficit (2.0 g/kg otherwise) to preserve muscle · fat 0.9 g/kg · carbs fill the rest.</div>
        </Card>
      </div>

      <NutritionScoreCard />

      <WaterCard />

      <CanteenMenuCard />

      <DietPlansCard />

      <Card className="mt-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="h3">Today's Meals</div>
          {meals.length > 0 && (
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => doExport('png')}><ImageIcon size={13} /> PNG</button>
              <button className="btn btn-sm" onClick={() => doExport('pdf')}><FileDown size={13} /> PDF</button>
            </div>
          )}
        </div>
        {meals.length ? (
          <div className="flex flex-col gap-4">
            {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((mt) => {
              const group = meals.filter((x) => x.mealType === mt)
              if (!group.length) return null
              const sub = group.reduce((s, x) => s + (x.calories || 0), 0)
              return (
                <Accordion key={mt}
                  title={<div className="text-[12px] font-bold text-muted flex items-center gap-1.5">
                    <span className="text-base">{MEAL_ICON[mt]}</span>{mt[0].toUpperCase() + mt.slice(1)}
                    <span className="text-muted2 font-normal">· {group.length} item{group.length > 1 ? 's' : ''}</span></div>}
                  right={<span className="text-[12px] font-bold text-cyan">{sub} kcal</span>}>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(120,160,255,.12)' }}>
                    {group.map((meal, idx) => (
                      <div key={meal.id} className="flex items-center gap-3 px-3 py-2.5"
                        style={{ background: 'rgba(6,8,15,.35)', borderTop: idx ? '1px solid rgba(120,160,255,.08)' : 'none' }}>
                        <div className="flex-1 min-w-0">
                          <b className="text-[14px] block truncate">{meal.name}</b>
                          <span className="text-[11px] text-muted">P{meal.protein} · C{meal.carbs} · F{meal.fat}</span>
                        </div>
                        <HealthPill h={analyzeFood(meal.name, meal.calories, { protein: meal.protein, carbs: meal.carbs, fat: meal.fat })} />
                        <div className="font-extrabold text-right shrink-0 tabular-nums">{meal.calories}<span className="text-[10px] text-muted font-semibold ml-0.5">kcal</span></div>
                        <button className="text-muted hover:text-red shrink-0 p-1" onClick={() => delMeal(meal.id)}><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )
            })}
            <div className="flex items-center justify-between pt-1 px-1 border-t border-line">
              <span className="text-sm font-bold">Day total</span>
              <span className="text-base font-extrabold text-green">{cals} kcal · <span className="text-muted text-sm">P{Math.round(m.p)} C{Math.round(m.c)} F{Math.round(m.f)}</span></span>
            </div>
          </div>
        ) : <Empty icon="🍽️" title="Nothing logged today" sub="Tap “Log Meal” to add food" />}
      </Card>

      {open && <MealModal onClose={() => setOpen(false)} onSave={(meal) => { addMeal(meal); showToast('Meal logged 🍽️'); setOpen(false) }} />}
    </>
  )
}

function NutritionScoreCard() {
  const d = useStore((s) => s.data)
  const showToast = useStore((s) => s.showToast)
  const t = today()
  const meals = mealsOn(d, t)
  const targets = { calories: calorieTarget(d), protein: proteinTarget(d), carbs: carbTarget(d), fat: fatTarget(d) }

  // optional Open Food Facts refinement, keyed by meal id
  const [enriched, setEnriched] = useState<Record<string, { fiber: number; sugar: number; sodium: number; satFat: number }>>({})
  const [busy, setBusy] = useState(false)

  const dayMeals = meals.map((mm) => ({ name: mm.name, calories: mm.calories, protein: mm.protein, carbs: mm.carbs, fat: mm.fat, ...(enriched[mm.id] || {}) }))
  const rep = dayReport(dayMeals, targets, d.profile.sex)
  const anyEnriched = Object.keys(enriched).length > 0

  async function refine() {
    if (!meals.length) return
    setBusy(true)
    const next: Record<string, { fiber: number; sugar: number; sodium: number; satFat: number }> = {}
    await Promise.all(meals.map(async (mm) => {
      const a = await enrichFood(mm.name, mm.calories, { protein: mm.protein, carbs: mm.carbs, fat: mm.fat })
      if (a.enriched) next[mm.id] = { fiber: a.micros.fiber, sugar: a.micros.sugar, sodium: a.micros.sodium, satFat: a.micros.satFat }
    }))
    setEnriched(next)
    setBusy(false)
    const n = Object.keys(next).length
    showToast(n ? `Refined ${n} food${n > 1 ? 's' : ''} with real database values 🔬` : 'No database matches — using PULSE estimates')
  }

  const c = BAND_COLOR[rep.band]

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="h3 flex items-center gap-2"><HeartPulse size={16} className="text-pink" /> Today's Nutrition Score</div>
        {meals.length > 0 && (
          <button className="btn btn-sm" disabled={busy} onClick={refine} title="Refine fibre/sugar/sodium with Open Food Facts">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
            {anyEnriched ? 'Refined' : 'Refine with database'}
          </button>
        )}
      </div>

      {meals.length === 0 ? (
        <div className="text-muted text-sm">Log meals to get a real-time nutrition grade — protein, fibre, sugar, sodium and saturated-fat judgement, plus coaching for your goal.</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="shrink-0">
              <Ring pct={rep.score} color={c} label="score" center={<span className="flex flex-col items-center leading-none"><b className="text-[26px]" style={{ color: c }}>{rep.score}</b><span className="text-[10px] text-muted font-semibold">/100</span></span>} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center rounded-lg font-black text-[15px]" style={{ width: 30, height: 30, background: c, color: '#06080f' }}>{rep.grade}</span>
                <b className="text-[15px]">{rep.summary}</b>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {([['🥗 Veg', rep.groups.veg], ['🍎 Fruit', rep.groups.fruit], ['🫘 Dal/Protein', rep.groups.protein], ['🌾 Whole grain', rep.groups.wholeGrain], ['🥛 Dairy', rep.groups.dairy]] as [string, boolean][]).map(([lbl, ok]) => (
                  <span key={lbl} className="text-[10.5px] font-semibold rounded-full px-2 py-0.5" style={{ background: ok ? 'rgba(43,255,176,.12)' : 'rgba(120,160,255,.07)', color: ok ? '#2bffb0' : '#7d89a8', border: `1px solid ${ok ? 'rgba(43,255,176,.3)' : 'rgba(120,160,255,.15)'}` }}>{ok ? '✓ ' : ''}{lbl}</span>
                ))}
              </div>
            </div>
          </div>

          {/* nutrient metrics */}
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
            {rep.metrics.map((mt) => {
              const sc = STATUS_COLOR[mt.status]
              return (
                <div key={mt.key} className="rounded-xl p-2.5" style={{ background: 'rgba(6,8,15,.45)', border: '1px solid rgba(120,160,255,.12)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-semibold">{mt.label}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc }} />
                  </div>
                  <div className="text-[15px] font-extrabold mt-0.5">{mt.value}<span className="text-[10px] text-muted font-semibold ml-0.5">{mt.unit}</span>
                    {mt.target ? <span className="text-[10px] text-muted2 font-medium"> / {mt.target}</span> : null}</div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: sc }}>{mt.detail}</div>
                </div>
              )
            })}
          </div>

          {/* coaching */}
          {rep.coaching.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,255,.07)', border: '1px solid rgba(139,92,255,.2)' }}>
              <div className="text-[11px] font-bold text-violet mb-1.5 flex items-center gap-1.5"><Sparkles size={12} /> Coaching</div>
              <ul className="flex flex-col gap-1">
                {rep.coaching.map((tip, i) => (
                  <li key={i} className="text-[12.5px] text-txt flex gap-1.5"><span className="text-violet">›</span>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[10.5px] text-muted2">
            Judged by PULSE's Indian-food nutrition engine — rewards dals, vegetables, millets, steamed tiffin, curd, lean protein & fruit; flags fried, sweets, refined maida and high sodium. Fibre/sugar/sodium are estimates{anyEnriched ? ', partly refined with Open Food Facts' : ' (tap "Refine with database" for real values where matched)'}. Targets follow Mifflin–St Jeor, ISSN protein, and WHO/FDA sugar–sodium guidance. Not medical advice.
          </div>
        </div>
      )}
    </Card>
  )
}

function WaterCard() {
  const d = useStore((s) => s.data)
  const logWater = useStore((s) => s.logWater)
  const target = d.settings.waterTargetMl || 3000
  const ml = waterToday(d)
  const pct = Math.round((ml / target) * 100)
  const glasses = [250, 500]
  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Ring pct={pct} color="#22e3ff" label="of goal" center={`${pct}%`} />
          <div>
            <div className="h3">💧 Water</div>
            <div className="text-2xl font-extrabold mt-1">{(ml / 1000).toFixed(2)}<span className="text-sm text-muted font-semibold"> / {(target / 1000).toFixed(1)} L</span></div>
            <div className="text-xs text-muted mt-0.5">{ml >= target ? 'Goal reached 🎉' : `${((target - ml) / 1000).toFixed(2)} L to go`}</div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {glasses.map((g) => (
            <button key={g} className="btn btn-sm" onClick={() => logWater(g)}>+{g} ml</button>
          ))}
          <button className="btn btn-sm btn-primary" onClick={() => logWater(250)}>+ Glass</button>
          {ml > 0 && <button className="btn btn-sm" onClick={() => logWater(-250)}>−250</button>}
        </div>
      </div>
    </Card>
  )
}

function CanteenMenuCard() {
  const d = useStore((s) => s.data)
  const menus = d.menus
  const setMenu = useStore((s) => s.setMenu)
  const clearMenu = useStore((s) => s.clearMenu)
  const addMeal = useStore((s) => s.addMeal)
  const showToast = useStore((s) => s.showToast)
  const t = today()
  const staticDay = menuForToday()
  const todayMenu = menus[t] || staticDay.items
  const officeLabel = !menus[t] ? `${staticDay.office}${staticDay.note ? ` · ${staticDay.note}` : ''}` : null
  const [importOpen, setImportOpen] = useState(false)
  const [text, setText] = useState('')
  const [suggest, setSuggest] = useState<MenuSuggestion | null>(null)

  const calTgt = calorieTarget(d)
  const protTgt = proteinTarget(d)

  function logItem(it: MenuItem, qty: number) {
    const m = estimateMacros(it.name, it.calories)
    addMeal({ date: t, mealType: it.meal, name: qty !== 1 ? `${qty}× ${it.name}` : it.name,
      calories: Math.round(it.calories * qty), protein: m.protein * qty, carbs: m.carbs * qty, fat: m.fat * qty })
    showToast(`Logged ${it.name} ✅`)
  }
  function logAllPicks() {
    if (!suggest) return
    suggest.picks.forEach((p) => addMeal({ date: t, mealType: p.item.meal, name: p.item.name,
      calories: p.item.calories, protein: p.protein, carbs: p.carbs, fat: p.fat }))
    showToast(`Logged ${suggest.picks.length} recommended items 🎯`); setSuggest(null)
  }

  function doImport() {
    const items = parseCanteenMenu(text)
    if (!items.length) { showToast('Could not find any items — paste the full menu with calories'); return }
    setMenu(t, items)
    showToast(`Imported ${items.length} menu items for today 🍴`)
    setImportOpen(false); setText('')
  }

  const meals: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="h3 flex items-center gap-2"><Building2 size={15} className="text-cyan" /> Canteen Menu · Today{officeLabel ? ` · ${officeLabel}` : ''}</div>
        <div className="flex gap-2 flex-wrap">
          {todayMenu.length > 0 && <button className="btn btn-sm" onClick={() => setSuggest(suggestFromMenu(todayMenu, calTgt, protTgt))}><Sparkles size={13} /> Suggest for my goal</button>}
          {todayMenu.length > 0 && <button className="btn btn-sm btn-danger" onClick={() => clearMenu(t)}>Clear</button>}
          <button className="btn btn-sm btn-primary" onClick={() => setImportOpen(true)}><Plus size={13} /> {todayMenu.length ? 'Re-import' : 'Paste menu'}</button>
        </div>
      </div>

      {todayMenu.length === 0 ? (
        <div className="text-muted text-sm">No menu for today. Tap <b className="text-txt">Paste menu</b> to add one (item + calories), then log what you ate with quantity.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {meals.map((m) => {
            const its = todayMenu.filter((x) => x.meal === m)
            if (!its.length) return null
            return (
              <Accordion key={m} defaultOpen={m === 'lunch' || m === 'breakfast'}
                title={<span className="text-[12px] font-bold text-muted">{MEAL_LABEL[m]}</span>}
                right={<span className="text-[11px] text-muted2">{its.length} items</span>}>
                <div className="flex flex-col gap-1.5">
                  {its.map((it, i) => <MenuRow key={i} item={it} onLog={(qty) => logItem(it, qty)} />)}
                </div>
              </Accordion>
            )
          })}
        </div>
      )}

      {importOpen && (
        <Modal title="Paste today's canteen menu" onClose={() => setImportOpen(false)}>
          <div className="mt-4">
            <p className="text-muted text-[13px] mb-2">Copy the whole menu (with calories) and paste below. I'll auto-detect each item, its calories, and the meal.</p>
            <textarea className="input" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Breakfast ( 08.00 AM – 10.30 AM )\n1\nIdli\n1 No\n60\n-\n...'} />
            <button className="btn btn-primary w-full mt-3" onClick={doImport}>Import menu</button>
          </div>
        </Modal>
      )}

      {suggest && (
        <Modal title="🎯 Best picks for your goal" onClose={() => setSuggest(null)}>
          <div className="mt-2">
            <div className="text-muted text-[13px] mb-3">From today's canteen menu, optimised for your target of <b className="text-txt">{calTgt} kcal</b> and <b className="text-txt">{protTgt}g protein</b> — nutrition-first (balanced, protein-rich, low fried/sugar), without overshooting.</div>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: BAND_COLOR[suggest.totals.band] + '14', border: `1px solid ${BAND_COLOR[suggest.totals.band]}44` }}>
              <span className="grid place-items-center rounded-lg font-black text-[13px] shrink-0" style={{ width: 28, height: 28, background: BAND_COLOR[suggest.totals.band], color: '#06080f' }}>{suggest.totals.score}</span>
              <span className="text-[12.5px]"><b style={{ color: BAND_COLOR[suggest.totals.band] }}>Plate health {suggest.totals.score}/100</b> — these picks favour dals, veg, steamed & lean items over fried and sweet.</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[['Calories', suggest.totals.calories], ['Protein', suggest.totals.protein + 'g'], ['Carbs', suggest.totals.carbs + 'g'], ['Fat', suggest.totals.fat + 'g']].map(([l, v]) => (
                <div key={l as string} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
                  <div className="text-[17px] font-extrabold">{v}</div><div className="text-[10px] text-muted uppercase tracking-wide">{l}</div></div>
              ))}
            </div>
            {suggest.picks.length === 0 ? <div className="text-muted text-sm">No suitable items found in today's menu.</div> : (
              <div className="flex flex-col gap-1.5">
                {suggest.picks.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg text-sm" style={{ background: 'rgba(43,255,176,.06)', border: '1px solid rgba(43,255,176,.2)' }}>
                    <span className="min-w-0"><span className="flex items-center gap-1.5 flex-wrap"><b>{p.item.name}</b><span className="grid place-items-center rounded-full font-black text-[9px] shrink-0" style={{ width: 14, height: 14, background: BAND_COLOR[p.band], color: '#06080f' }}>{p.score}</span></span>
                      <span className="text-muted text-xs block">{MEAL_LABEL[p.item.meal]} · <span className="capitalize" style={{ color: '#8b5cff' }}>{p.role === 'accompaniment' ? 'side' : p.role}</span></span></span>
                    <span className="text-right shrink-0"><b className="text-green">{p.item.calories} kcal</b><span className="text-muted text-[11px] block">P{p.protein} C{p.carbs} F{p.fat}</span></span>
                  </div>
                ))}
              </div>
            )}
            {suggest.picks.length > 0 && <button className="btn btn-primary w-full mt-3" onClick={logAllPicks}><Check size={15} /> Log all picks to today</button>}
          </div>
        </Modal>
      )}
    </Card>
  )
}

function MenuRow({ item, onLog }: { item: MenuItem; onLog: (qty: number) => void }) {
  const [qty, setQty] = useState(1)
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
      <div className="flex-1 min-w-0"><b className="text-[13.5px] block truncate">{item.name}</b>
        <span className="text-muted text-[11px]">{item.calories} kcal{qty !== 1 ? ` × ${qty} = ${item.calories * qty}` : ''}</span></div>
      <HealthPill h={analyzeFood(item.name, item.calories)} />
      <div className="flex items-center gap-1 shrink-0">
        <button className="btn btn-sm px-2" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={12} /></button>
        <span className="w-5 text-center text-sm font-bold">{qty}</span>
        <button className="btn btn-sm px-2" onClick={() => setQty(qty + 1)}><Plus size={12} /></button>
      </div>
      <button className="btn btn-sm btn-primary shrink-0" onClick={() => onLog(qty)}>Log</button>
    </div>
  )
}

function DietPlansCard() {
  const setDayMeals = useStore((s) => s.setDayMeals)
  const showToast = useStore((s) => s.showToast)
  const [preview, setPreview] = useState<DietPlan | null>(null)
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all')

  const plans = DIET_PLANS.filter((p) => filter === 'all' ? true : filter === 'veg' ? p.veg : !p.veg)

  function apply(p: DietPlan) {
    setDayMeals(today(), p.items.map((it) => ({ date: today(), mealType: it.meal, name: it.name, calories: it.calories, protein: it.protein, carbs: it.carbs, fat: it.fat })))
    showToast(`${p.name} loaded into today — review & edit below ✅`)
    setPreview(null)
  }

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <div className="h3 flex items-center gap-2"><UtensilsCrossed size={15} className="text-pink" /> Indian Diet Plans</div>
        <div className="flex gap-2">
          {([['all', 'All'], ['veg', 'Veg'], ['nonveg', 'Non-veg']] as const).map(([k, l]) => (
            <span key={k} className={`chip ${filter === k ? 'chip-on' : ''}`} onClick={() => setFilter(k)} style={{ fontSize: 12, padding: '4px 10px' }}>{l}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
        {plans.map((p) => {
          const t = planTotals(p)
          return (
            <div key={p.id} className="p-3.5 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
              <div className="flex items-center justify-between gap-2">
                <b className="text-[14.5px]">{p.name}</b>
                <span className="tag bg-[rgba(120,160,255,.12)] text-muted">{p.goal}</span>
              </div>
              <div className="text-muted text-xs mt-1">{p.blurb}</div>
              <div className="flex gap-2 mt-2 text-[11px]">
                <b className="text-green">{t.calories} kcal</b><span className="text-muted">P{t.protein} · C{t.carbs} · F{t.fat}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-sm flex-1 justify-center" onClick={() => setPreview(p)}>View</button>
                <button className="btn btn-sm btn-primary flex-1 justify-center" onClick={() => apply(p)}>Apply today</button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-[11px] text-muted2 mt-2">Static, offline Indian plans with full macros. “Apply today” auto-fills your meals — then review & edit before saving.</div>

      {preview && (
        <Modal title={preview.name} onClose={() => setPreview(null)}>
          <div className="mt-2">
            <div className="text-muted text-sm mb-3">{preview.blurb}</div>
            {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((mt) => {
              const its = preview.items.filter((x) => x.meal === mt)
              if (!its.length) return null
              return (
                <div key={mt} className="mb-3">
                  <div className="h3 mb-1.5">{({ breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', snack: '🍎 Snack', dinner: '🌙 Dinner' })[mt]}</div>
                  {its.map((it, i) => (
                    <div key={i} className="flex justify-between text-[13px] py-1 border-b border-line">
                      <span>{it.name}</span><span className="text-muted">{it.calories} kcal · P{it.protein} C{it.carbs} F{it.fat}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            <button className="btn btn-primary w-full mt-2" onClick={() => apply(preview)}><Check size={15} /> Apply to today</button>
          </div>
        </Modal>
      )}
    </Card>
  )
}

type Source = 'smart' | 'scan' | 'online' | 'quick' | 'barcode' | 'manual'

function MealModal({ onClose, onSave }: { onClose: () => void; onSave: (m: Omit<Meal, 'id'> & { id: string }) => void }) {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [name, setName] = useState('')
  const [vals, setVals] = useState({ calories: '', protein: '', carbs: '', fat: '' })
  const [qty, setQty] = useState('1')
  const [date, setDate] = useState(today())
  const foodSource = useStore((s) => s.data.settings.foodSource)
  const customFoods = useStore((s) => s.data.customFoods)
  const addCustomFood = useStore((s) => s.addCustomFood)
  const delCustomFood = useStore((s) => s.delCustomFood)
  // Smart works offline now (local NLP over the food database), so it's always available.
  const smartAvailable = true
  const [source, setSource] = useState<Source>(
    foodSource === 'static' ? 'quick' : foodSource === 'off' ? 'online' : 'smart',
  )

  // smart (NLP) mode
  const [sq, setSq] = useState('')
  const [parsed, setParsed] = useState<ParsedNutrition | null>(null)
  const [sBusy, setSBusy] = useState(false)
  const [sMsg, setSMsg] = useState<string | null>(null)

  // scan (OCR) mode
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrPct, setOcrPct] = useState(0)
  const [ocrMsg, setOcrMsg] = useState<string | null>(null)

  async function doScan(file: File) {
    setOcrBusy(true); setOcrMsg('Reading image…'); setOcrPct(0)
    try {
      const text = await ocrImage(file, setOcrPct)
      if (!text) { setOcrMsg('Could not read any text. Try a clearer photo.'); setOcrBusy(false); return }
      setSq(text)
      setOcrMsg('Text extracted — analyzing nutrition…')
      const r = await parseNutrition(text)
      if (r) {
        setParsed(r); setName('Scanned meal')
        setVals({ calories: String(r.total.calories), protein: String(r.total.protein), carbs: String(r.total.carbs), fat: String(r.total.fat) })
        setOcrMsg(`Found ${r.items.length} item(s). Review below and save.`)
        setSource('smart')
      } else {
        setOcrMsg('Text extracted into the Smart tab — review/edit it there, then Analyze.')
        setSource('smart')
      }
    } catch {
      setOcrMsg('Scan failed. Try a clearer image or use Manual.')
    }
    setOcrBusy(false)
  }

  // online search
  const [q, setQ] = useState('')
  const [qcat, setQcat] = useState<string>(FOOD_GROUPS[0]?.category || 'All')
  const [online, setOnline] = useState<FoodResult[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // barcode
  const [code, setCode] = useState('')
  const [bcBusy, setBcBusy] = useState(false)
  const [bcMsg, setBcMsg] = useState<string | null>(null)

  useEffect(() => {
    if (source !== 'online') return
    const term = q.trim()
    if (term.length < 2) { setOnline([]); return }
    setLoading(true)
    const tmr = setTimeout(async () => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      const res = await searchFoods(term, ac.signal)
      setOnline(res)
      setLoading(false)
    }, 400)
    return () => clearTimeout(tmr)
  }, [q, source])

  const searchTerm = q.trim().toLowerCase()
  const searchResults = searchTerm ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(searchTerm)).slice(0, 50) : []
  const catItems = qcat === 'All' ? FOOD_GROUPS.flatMap((g) => g.items) : (FOOD_GROUPS.find((g) => g.category === qcat)?.items || [])
  const customMatches = searchTerm ? customFoods.filter((f) => f.name.toLowerCase().includes(searchTerm)) : customFoods.slice(0, 6)

  function saveAsCustom() {
    if (!name.trim() || !(+vals.calories)) { alert('Enter a name and calories first'); return }
    addCustomFood({ name: name.trim(), serving: '1 serving', calories: +vals.calories || 0, protein: +vals.protein || 0, carbs: +vals.carbs || 0, fat: +vals.fat || 0 })
  }

  function fillLocal(f: FoodItem) {
    setName(`${f.name} (${f.serving})`)
    setVals({ calories: String(f.calories), protein: String(f.protein), carbs: String(f.carbs), fat: String(f.fat) })
  }
  function fillOnline(f: FoodResult) {
    setName(`${f.brand ? f.brand + ' ' : ''}${f.name}${f.serving ? ` (${f.serving})` : ''}`)
    setVals({ calories: String(f.calories), protein: String(f.protein), carbs: String(f.carbs), fat: String(f.fat) })
    showFilled()
  }
  function showFilled() { /* visual cue handled by populated fields */ }

  async function doSmart() {
    if (!sq.trim()) return
    setSBusy(true); setSMsg(null); setParsed(null)
    // 1) try the API (best accuracy) if configured; 2) fall back to the offline DB parser
    let r: ParsedNutrition | null = ninjaConfigured ? await parseNutrition(sq.trim()) : null
    let offline = false
    if (!r || !r.items.length) {
      const local = parseMealOffline(sq.trim())
      if (local.items.length) { r = { items: local.items, total: local.total }; offline = true }
    }
    setSBusy(false)
    if (!r || !r.items.length) {
      setSMsg('Couldn’t recognise those foods — try simpler names like “2 idli, sambar, 1 banana”, or use the Browse / Manual tabs.')
      return
    }
    setParsed(r)
    setName(sq.trim())
    setVals({ calories: String(r.total.calories), protein: String(r.total.protein), carbs: String(r.total.carbs), fat: String(r.total.fat) })
    if (offline) setSMsg('Matched offline from PULSE’s food database — review & save.')
  }

  async function doBarcode() {
    if (!code.trim()) return
    setBcBusy(true); setBcMsg(null)
    const r = await lookupBarcode(code)
    setBcBusy(false)
    if (!r) { setBcMsg('Not found — try another code or enter manually.'); return }
    fillOnline(r); setBcMsg(`Found: ${r.name}`)
  }

  const SOURCES: { id: Source; label: string; icon: typeof Globe }[] = [
    ...(smartAvailable ? [{ id: 'smart' as Source, label: 'Smart', icon: Sparkles }] : []),
    { id: 'scan', label: 'Scan', icon: ScanLine },
    { id: 'online', label: 'Search', icon: Globe },
    { id: 'quick', label: 'Quick', icon: ListPlus },
    { id: 'barcode', label: 'Barcode', icon: Barcode },
    { id: 'manual', label: 'Manual', icon: Search },
  ]

  return (
    <Modal title="Log Meal" onClose={onClose}>
      <div className="mt-4">
        <label className="label">Meal</label>
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(MEAL_ICON) as MealType[]).map((tt) => (
            <span key={tt} className={`chip ${mealType === tt ? 'chip-on' : ''}`} onClick={() => setMealType(tt)}>
              {MEAL_ICON[tt]} {tt[0].toUpperCase() + tt.slice(1)}</span>
          ))}
        </div>

        {/* source switcher */}
        <div className="grid gap-1.5 p-1 rounded-xl mb-3" style={{ background: 'rgba(6,8,15,.5)', gridTemplateColumns: `repeat(${SOURCES.length},1fr)` }}>
          {SOURCES.map((s) => (
            <button key={s.id} onClick={() => setSource(s.id)}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition ${source === s.id ? 'text-white' : 'text-muted'}`}
              style={source === s.id ? { background: 'linear-gradient(135deg,rgba(34,227,255,.2),rgba(139,92,255,.2))' } : undefined}>
              <s.icon size={16} />{s.label}
            </button>
          ))}
        </div>

        {source === 'scan' && (
          <div className="mb-3">
            <label className="label">Upload a food sheet / menu photo</label>
            <label className="btn w-full justify-center cursor-pointer">
              {ocrBusy ? <><Loader2 size={15} className="animate-spin" /> Reading… {ocrPct}%</> : <><ScanLine size={15} /> Choose image</>}
              <input type="file" accept="image/*" className="hidden" disabled={ocrBusy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) doScan(f); e.currentTarget.value = '' }} />
            </label>
            {ocrMsg && <div className="text-xs mt-2 text-muted">{ocrMsg}</div>}
            <div className="text-[11px] text-muted2 mt-2">Snap your office diet chart — PULSE reads it on your device (OCR), extracts the foods & macros, and loads them below to review. Clear, well-lit photos work best. (Beta — always double-check before saving.)</div>
          </div>
        )}

        {source === 'smart' && (
          <div className="mb-3">
            <label className="label">Describe your meal in plain English</label>
            <div className="flex gap-2">
              <input className="input" placeholder="e.g. 2 eggs, 2 toast and a banana" value={sq}
                onChange={(e) => setSq(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSmart()} autoFocus />
              <button className="btn btn-primary shrink-0" disabled={sBusy} onClick={doSmart}>
                {sBusy ? <Loader2 size={15} className="animate-spin" /> : 'Analyze'}</button>
            </div>
            {sMsg && <div className="text-xs mt-2 text-muted">{sMsg}</div>}
            {parsed && (
              <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
                {parsed.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-[13px] py-1">
                    <span className="text-txt capitalize">{it.name}</span>
                    <span className="text-muted">{it.calories} kcal · P{it.protein} C{it.carbs} F{it.fat}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[13px] mt-2 pt-2 border-t border-line font-bold">
                  <span>Total</span>
                  <span className="text-cyan">{parsed.total.calories} kcal · P{parsed.total.protein} C{parsed.total.carbs} F{parsed.total.fat}</span>
                </div>
                <div className="text-[11px] text-muted2 mt-1.5">Loaded into the fields below — adjust and save.</div>
              </div>
            )}
            <div className="text-[11px] text-muted2 mt-2">{ninjaConfigured ? 'Uses API Ninjas NLP when available, with an offline fallback over PULSE’s Indian food database.' : 'Works fully offline — matched against PULSE’s 260+ Indian/Tamil Nadu/Bangladeshi/hotel food database.'}</div>
          </div>
        )}

        {source === 'online' && (
          <>
            <div className="relative mb-2">
              {loading ? <Loader2 size={15} className="absolute left-3 top-3 text-cyan animate-spin" /> : <Globe size={15} className="absolute left-3 top-3 text-muted" />}
              <input className="input pl-9" placeholder="Search foods worldwide (Open Food Facts)…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            </div>
            <FoodResultList items={online} loading={loading} q={q} onPick={fillOnline} />
          </>
        )}

        {source === 'quick' && (
          <>
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3 top-3 text-muted" />
              <input className="input pl-9" placeholder="Search 260+ foods, or browse by category…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>

            {/* my custom foods */}
            {customMatches.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {customMatches.map((f) => (
                  <div key={'c' + f.name} className="flex justify-between items-center p-2.5 rounded-lg text-sm"
                    style={{ background: 'rgba(139,92,255,.08)', border: '1px solid rgba(139,92,255,.25)' }}>
                    <button className="flex-1 text-left" onClick={() => fillLocal(f)}>
                      <b>★ {f.name}</b><span className="text-muted text-xs block">{f.serving} · my food</span></button>
                    <span className="text-cyan font-bold mr-2">{f.calories} kcal</span>
                    <button className="text-muted hover:text-red" onClick={() => delCustomFood(f.name)}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}

            {searchTerm ? (
              <div className="flex flex-col gap-1.5 mb-3 max-h-[300px] overflow-y-auto">
                {searchResults.length === 0 && <div className="text-muted2 text-sm px-1 py-3">No matches — try the Manual tab or save a custom food.</div>}
                {searchResults.map((f) => <QuickFoodRow key={f.name} f={f} onPick={() => fillLocal(f)} />)}
              </div>
            ) : (
              <>
                {/* category chips — tap to browse a cuisine section */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[{ category: 'All', icon: '🍽️' }, ...FOOD_GROUPS].map((g) => (
                    <span key={g.category} className={`chip ${qcat === g.category ? 'chip-on' : ''}`} onClick={() => setQcat(g.category)} style={{ fontSize: 11, padding: '4px 9px' }}>
                      {g.icon} {g.category.replace(' · ', ' ')}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-muted2 mb-1.5 px-0.5">{catItems.length} foods{qcat !== 'All' ? ` in ${qcat}` : ''} — tap to add</div>
                <div className="flex flex-col gap-1.5 mb-3 max-h-[300px] overflow-y-auto pr-0.5">
                  {catItems.map((f) => <QuickFoodRow key={f.name} f={f} onPick={() => fillLocal(f)} />)}
                </div>
              </>
            )}
          </>
        )}

        {source === 'barcode' && (
          <div className="mb-3">
            <label className="label">Barcode number</label>
            <div className="flex gap-2">
              <input className="input" inputMode="numeric" placeholder="e.g. 8901058000368" value={code}
                onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doBarcode()} />
              <button className="btn btn-primary shrink-0" disabled={bcBusy} onClick={doBarcode}>{bcBusy ? <Loader2 size={15} className="animate-spin" /> : 'Look up'}</button>
            </div>
            {bcMsg && <div className="text-xs mt-2 text-muted">{bcMsg}</div>}
            <div className="text-[11px] text-muted2 mt-2">Type the digits under any product barcode. Powered by Open Food Facts.</div>
          </div>
        )}

        {/* editable fields — per-serving values; Quantity multiplies them */}
        <div className="mb-3.5"><label className="label">Food</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Food name" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Calories / serving</label>
            <input className="input" type="number" value={vals.calories} onChange={(e) => setVals({ ...vals, calories: e.target.value })} placeholder="kcal" /></div>
          <div><label className="label">Quantity / servings</label>
            <input className="input" type="number" step="0.25" min="0.25" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3.5">
          <div><label className="label">Protein</label><input className="input" type="number" value={vals.protein} onChange={(e) => setVals({ ...vals, protein: e.target.value })} /></div>
          <div><label className="label">Carbs</label><input className="input" type="number" value={vals.carbs} onChange={(e) => setVals({ ...vals, carbs: e.target.value })} /></div>
          <div><label className="label">Fat</label><input className="input" type="number" value={vals.fat} onChange={(e) => setVals({ ...vals, fat: e.target.value })} /></div>
        </div>
        {(+qty || 1) !== 1 && (
          <div className="text-[12px] mt-2.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(34,227,255,.08)', border: '1px solid rgba(34,227,255,.2)' }}>
            Total for <b>{qty}×</b>: <b className="text-cyan">{Math.round((+vals.calories || 0) * (+qty || 1))} kcal</b> · P{Math.round((+vals.protein || 0) * (+qty || 1))} C{Math.round((+vals.carbs || 0) * (+qty || 1))} F{Math.round((+vals.fat || 0) * (+qty || 1))}
          </div>
        )}
        {name.trim() && +vals.calories > 0 && (() => {
          const h = analyzeFood(name, +vals.calories, { protein: +vals.protein || undefined, carbs: +vals.carbs || undefined, fat: +vals.fat || undefined })
          return (
            <div className="mt-2.5 px-3 py-2.5 rounded-lg" style={{ background: BAND_COLOR[h.band] + '12', border: `1px solid ${BAND_COLOR[h.band]}40` }}>
              <div className="flex items-center gap-2"><HealthPill h={h} showLabel /><span className="text-[12px] font-semibold" style={{ color: BAND_COLOR[h.band] }}>Health check</span></div>
              {(h.pros.length > 0 || h.cons.length > 0) && (
                <div className="text-[11.5px] text-muted mt-1.5">{[...h.pros, ...h.cons].slice(0, 2).join(' · ')}</div>
              )}
            </div>
          )
        })()}
        <div className="mt-3.5 mb-1"><label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <button className="btn btn-sm w-full mt-3" onClick={saveAsCustom}>★ Save as my custom food (reuse later)</button>
        <button className="btn btn-primary w-full mt-2" onClick={() => {
          if (!name.trim()) return alert('Pick a food or enter a name')
          const q = +qty || 1
          const nm = q !== 1 ? `${q}× ${name.trim()}` : name.trim()
          onSave({ id: uid(), date, mealType, name: nm,
            calories: Math.round((+vals.calories || 0) * q), protein: Math.round((+vals.protein || 0) * q),
            carbs: Math.round((+vals.carbs || 0) * q), fat: Math.round((+vals.fat || 0) * q) })
        }}>Save Meal</button>
      </div>
    </Modal>
  )
}

function QuickFoodRow({ f, onPick }: { f: FoodItem; onPick: () => void }) {
  return (
    <button onClick={onPick}
      className="flex justify-between items-center p-2.5 rounded-lg text-left text-sm hover:bg-[rgba(120,160,255,.08)]"
      style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
      <span className="min-w-0"><b className="block truncate">{f.name}</b><span className="text-muted text-xs block">{f.serving} · P{f.protein} C{f.carbs} F{f.fat}</span></span>
      <span className="text-cyan font-bold shrink-0 ml-2">{f.calories}<span className="text-muted text-[10px] font-semibold"> kcal</span></span>
    </button>
  )
}

function FoodResultList({ items, loading, q, onPick }: { items: FoodResult[]; loading: boolean; q: string; onPick: (f: FoodResult) => void }) {
  if (q.trim().length < 2) return <div className="text-muted2 text-xs mb-3 px-1">Type at least 2 letters to search millions of foods.</div>
  if (loading && !items.length) return <div className="text-muted text-sm mb-3 px-1 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Searching…</div>
  if (!items.length) return <div className="text-muted2 text-sm mb-3 px-1">No matches — try the Quick or Manual tab.</div>
  return (
    <div className="flex flex-col gap-1.5 mb-3 max-h-[230px] overflow-y-auto">
      {items.map((f, i) => (
        <button key={i} onClick={() => onPick(f)}
          className="flex items-center gap-3 p-2.5 rounded-lg text-left text-sm hover:bg-[rgba(120,160,255,.08)]"
          style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
          {f.image
            ? <img src={f.image} alt="" width={36} height={36} className="rounded-md object-cover shrink-0" style={{ width: 36, height: 36 }} />
            : <div className="w-9 h-9 rounded-md grid place-items-center text-base shrink-0" style={{ background: 'rgba(120,160,255,.08)' }}>🍴</div>}
          <span className="flex-1 min-w-0"><b className="block truncate">{f.name}</b>
            <span className="text-muted text-xs block truncate">{f.brand ? f.brand + ' · ' : ''}{f.serving}</span></span>
          <span className="text-cyan font-bold shrink-0">{f.calories}<span className="text-muted text-[10px] font-semibold"> kcal</span></span>
        </button>
      ))}
    </div>
  )
}
