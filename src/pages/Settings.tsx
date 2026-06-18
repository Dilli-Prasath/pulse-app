import { useStore } from '../lib/store'
import { Card, PageHeader } from '../components/ui'
import { ACCENTS } from '../lib/theme'
import { Accent, WeightUnit, ExerciseSource, FoodSource } from '../lib/types'
import { Check } from 'lucide-react'

function Segmented<T extends string>({ value, options, onChange }:
  { value: T; options: { value: T; label: string; hint?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold border transition text-center ${
            value === o.value ? 'text-white border-line2' : 'text-muted border-line hover:text-txt'}`}
          style={value === o.value ? { background: 'linear-gradient(135deg,rgba(34,227,255,.18),rgba(139,92,255,.18))' } : { background: 'rgba(6,8,15,.4)' }}>
          {o.label}{o.hint && <span className="block text-[11px] font-normal text-muted mt-0.5">{o.hint}</span>}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const s = useStore((st) => st.data.settings)
  const updateSettings = useStore((st) => st.updateSettings)
  const showToast = useStore((st) => st.showToast)
  const set = (patch: Parameters<typeof updateSettings>[0], msg = 'Saved') => { updateSettings(patch); showToast(msg) }

  return (
    <>
      <PageHeader title="Settings" sub="Make PULSE yours" />

      {/* Appearance */}
      <Card className="mb-4">
        <div className="h3 mb-3">🎨 Appearance — Accent Theme</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
          {(Object.keys(ACCENTS) as Accent[]).map((key) => {
            const a = ACCENTS[key]
            const active = s.accent === key
            return (
              <button key={key} onClick={() => set({ accent: key }, `${a.label} theme applied`)}
                className={`relative rounded-2xl p-4 border transition ${active ? 'border-line2' : 'border-line hover:border-line2'}`}
                style={{ background: 'rgba(6,8,15,.4)' }}>
                <div className="h-12 rounded-xl mb-2" style={{ background: a.swatch }} />
                <div className="text-sm font-semibold flex items-center justify-center gap-1.5">
                  {a.label}{active && <Check size={14} className="text-green" />}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Units */}
      <Card className="mb-4">
        <div className="h3 mb-3">⚖️ Units</div>
        <label className="label">Weight</label>
        <Segmented<WeightUnit> value={s.weightUnit}
          options={[{ value: 'kg', label: 'Kilograms', hint: 'kg' }, { value: 'lb', label: 'Pounds', hint: 'lb' }]}
          onChange={(v) => set({ weightUnit: v }, `Weight shown in ${v}`)} />
        <div className="text-[11px] text-muted2 mt-2">Existing weigh-ins are stored in kg and converted for display — no data is lost when you switch.</div>

        <label className="label mt-4">Daily Water Goal (litres)</label>
        <input className="input max-w-[160px]" type="number" step="0.1" min="0.5"
          value={(s.waterTargetMl || 3000) / 1000}
          onChange={(e) => set({ waterTargetMl: Math.round((+e.target.value || 3) * 1000) }, 'Water goal updated')} />
      </Card>

      {/* Data sources */}
      <Card className="mb-4">
        <div className="h3 mb-3">🔌 Data Sources</div>

        <label className="label">Exercise database</label>
        <Segmented<ExerciseSource> value={s.exerciseSource}
          options={[
            { value: 'auto', label: 'Auto', hint: 'Ninjas → wger' },
            { value: 'ninja', label: 'API Ninjas', hint: 'quota limited' },
            { value: 'wger', label: 'wger', hint: 'free · unlimited' },
          ]}
          onChange={(v) => set({ exerciseSource: v }, 'Exercise source updated')} />
        <div className="text-[11px] text-muted2 mt-2 mb-4">
          <b className="text-muted">Auto</b> uses API Ninjas and instantly falls back to wger if it errors or hits its daily limit.
        </div>

        <label className="label">Food database (whole app)</label>
        <Segmented<FoodSource> value={s.foodSource}
          options={[
            { value: 'static', label: 'Static · Indian', hint: 'Tamil Nadu + North · offline' },
            { value: 'off', label: 'Open Food Facts', hint: 'global · free' },
            { value: 'ninja', label: 'API Ninjas', hint: 'NLP' },
            { value: 'auto', label: 'Auto', hint: 'Ninjas → OFF' },
          ]}
          onChange={(v) => set({ foodSource: v }, 'Food source updated')} />
        <div className="text-[11px] text-muted2 mt-2">
          <b className="text-muted">Static · Indian</b> opens the meal logger on the built-in Tamil Nadu + North Indian food list and your saved custom foods — no internet needed. Other options use online databases for the Smart/Search tabs.
        </div>
      </Card>
    </>
  )
}
