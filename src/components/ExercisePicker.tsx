import { useState } from 'react'
import { Modal } from './ui'
import { ExerciseImage } from './ExerciseImage'
import { EX_CATEGORIES, EXERCISES_BY_CATEGORY } from '../lib/exerciseLibrary'
import { Plus, Check, Search } from 'lucide-react'

/**
 * Section-by-section exercise picker. Browse by muscle group (Chest, Back,
 * Shoulders, Biceps … Core, Cardio), search, and tap to add — sets/reps
 * auto-fill from each exercise's default. Stays open for multi-add; "Done"
 * closes. Used by the Workout logger and the Routine builder.
 */
export function ExercisePicker({ onPick, onClose }: { onPick: (name: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [added, setAdded] = useState<Record<string, number>>({})

  const term = q.trim().toLowerCase()
  const groups = EXERCISES_BY_CATEGORY
    .filter((g) => cat === 'All' || g.category === cat)
    .map((g) => ({ ...g, items: g.items.filter((e) => !term || e.name.toLowerCase().includes(term)) }))
    .filter((g) => g.items.length)

  function pick(name: string) {
    onPick(name)
    setAdded((a) => ({ ...a, [name]: (a[name] || 0) + 1 }))
  }
  const totalAdded = Object.values(added).reduce((s, n) => s + n, 0)

  return (
    <Modal wide title="Add exercises" onClose={onClose}>
      <p className="text-muted text-[12.5px] mt-1 mb-3">Browse by muscle group and tap to add — sets &amp; reps auto-fill. Add as many as you like, then tap Done.</p>

      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-3 text-muted" />
        <input className="input pl-9" placeholder="Search all exercises…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(['All', ...EX_CATEGORIES]).map((c) => (
          <span key={c} className={`chip ${cat === c ? 'chip-on' : ''}`} onClick={() => setCat(c)} style={{ fontSize: 11, padding: '4px 10px' }}>{c}</span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.category}>
            <div className="text-[12px] font-bold text-muted uppercase tracking-wide mb-2">{g.category} <span className="text-muted2 font-normal normal-case">· {g.items.length}</span></div>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
              {g.items.map((e) => {
                const n = added[e.name] || 0
                return (
                  <button key={e.name} onClick={() => pick(e.name)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-left transition hover:-translate-y-0.5"
                    style={{ background: n ? 'rgba(43,255,176,.08)' : 'rgba(6,8,15,.4)', border: `1px solid ${n ? 'rgba(43,255,176,.3)' : 'rgba(120,160,255,.12)'}` }}>
                    <ExerciseImage name={e.name} size={40} rounded={9} zoomable={false} />
                    <div className="flex-1 min-w-0">
                      <b className="text-[12.5px] block truncate">{e.name}</b>
                      <span className="text-[10.5px] text-muted">{e.equipment} · {e.def}</span>
                    </div>
                    {n ? <span className="inline-flex items-center gap-0.5 text-green text-[11px] font-bold shrink-0"><Check size={13} />{n > 1 ? `×${n}` : ''}</span>
                      : <Plus size={15} className="text-muted shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && <div className="text-muted2 text-sm py-6 text-center">No exercises match “{q}”.</div>}
      </div>

      <button className="btn btn-primary w-full mt-4" onClick={onClose}>{totalAdded ? `Done · ${totalAdded} added` : 'Done'}</button>
    </Modal>
  )
}
