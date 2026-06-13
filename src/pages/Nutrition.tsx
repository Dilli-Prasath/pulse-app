import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Ring, Bar, Modal, Empty, PageHeader } from '../components/ui'
import { caloriesOn, calorieTarget, macrosOn, mealsOn, proteinTarget, carbTarget, fatTarget } from '../lib/calcs'
import { today, uid, FOOD_DB, FoodItem } from '../lib/seed'
import { searchFoods, lookupBarcode, FoodResult } from '../lib/foodApi'
import { parseNutrition, ParsedNutrition, ninjaConfigured } from '../lib/apiNinjas'
import { MealType, Meal } from '../lib/types'
import { Trash2, Search, Barcode, Globe, ListPlus, Loader2, Sparkles } from 'lucide-react'

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
          <div className="text-muted text-[11.5px] mt-1.5">Protein target scales with bodyweight (1.8 g/kg) to preserve muscle in a deficit.</div>
        </Card>
      </div>

      <Card className="mt-4"><div className="h3 mb-3">Today's Meals</div>
        {meals.length ? (
          <div className="flex flex-col gap-2.5">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-3 sm:gap-3.5 p-3 rounded-xl"
                style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0" style={{ background: 'rgba(120,160,255,.08)' }}>{MEAL_ICON[meal.mealType]}</div>
                <div className="flex-1 min-w-0"><b className="text-[14.5px] block truncate">{meal.name}</b>
                  <span className="text-xs text-muted">{meal.mealType} · P{meal.protein} C{meal.carbs} F{meal.fat}</span></div>
                <div className="font-extrabold text-right shrink-0">{meal.calories}<span className="block text-[11px] text-muted font-semibold">kcal</span></div>
                <button className="btn btn-sm btn-danger shrink-0" onClick={() => delMeal(meal.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        ) : <Empty icon="🍽️" title="Nothing logged today" sub="Tap “Log Meal” to add food" />}
      </Card>

      {open && <MealModal onClose={() => setOpen(false)} onSave={(meal) => { addMeal(meal); showToast('Meal logged 🍽️'); setOpen(false) }} />}
    </>
  )
}

type Source = 'smart' | 'online' | 'quick' | 'barcode' | 'manual'

function MealModal({ onClose, onSave }: { onClose: () => void; onSave: (m: Omit<Meal, 'id'> & { id: string }) => void }) {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [name, setName] = useState('')
  const [vals, setVals] = useState({ calories: '', protein: '', carbs: '', fat: '' })
  const [date, setDate] = useState(today())
  const foodSource = useStore((s) => s.data.settings.foodSource)
  const smartAvailable = foodSource !== 'off'
  const [source, setSource] = useState<Source>(smartAvailable && ninjaConfigured ? 'smart' : 'online')

  // smart (NLP) mode
  const [sq, setSq] = useState('')
  const [parsed, setParsed] = useState<ParsedNutrition | null>(null)
  const [sBusy, setSBusy] = useState(false)
  const [sMsg, setSMsg] = useState<string | null>(null)

  // online search
  const [q, setQ] = useState('')
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

  const quick = q.trim() ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : FOOD_DB.slice(0, 8)

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
    const r = await parseNutrition(sq.trim())
    setSBusy(false)
    if (!r) { setSMsg('Could not read that — try simpler wording, or use another tab. (Needs the api-ninjas function deployed.)'); return }
    setParsed(r)
    setName(sq.trim())
    setVals({ calories: String(r.total.calories), protein: String(r.total.protein), carbs: String(r.total.carbs), fat: String(r.total.fat) })
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
            <div className="text-[11px] text-muted2 mt-2">Powered by API Ninjas NLP, via your secure Supabase function.</div>
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
              <input className="input pl-9" placeholder="Common foods (incl. Indian)…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 mb-3 max-h-[200px] overflow-y-auto">
              {quick.map((f) => (
                <button key={f.name} onClick={() => fillLocal(f)}
                  className="flex justify-between items-center p-2.5 rounded-lg text-left text-sm hover:bg-[rgba(120,160,255,.08)]"
                  style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
                  <span><b>{f.name}</b><span className="text-muted text-xs block">{f.serving}</span></span>
                  <span className="text-cyan font-bold">{f.calories} kcal</span>
                </button>
              ))}
            </div>
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

        {/* editable fields — always shown so you can tweak before saving */}
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
          if (!name.trim()) return alert('Pick a food or enter a name')
          onSave({ id: uid(), date, mealType, name: name.trim(), calories: +vals.calories || 0, protein: +vals.protein || 0, carbs: +vals.carbs || 0, fat: +vals.fat || 0 })
        }}>Save Meal</button>
      </div>
    </Modal>
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
