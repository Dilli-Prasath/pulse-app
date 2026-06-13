import { useState } from 'react'
import { Card, PageHeader, Modal, Empty } from '../components/ui'
import { searchRecipes, Recipe } from '../lib/recipeApi'
import { Search, Loader2 } from 'lucide-react'

export default function Recipes() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [detail, setDetail] = useState<Recipe | null>(null)

  async function run() {
    if (!q.trim()) return
    setLoading(true); setSearched(true)
    setResults(await searchRecipes(q.trim()))
    setLoading(false)
  }

  return (
    <>
      <PageHeader title="Recipes" sub="Search thousands of recipes with photos for meal ideas" />

      <Card>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input className="input pl-9" placeholder="e.g. chicken, paneer, salad, pasta…" value={q}
              onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} autoFocus />
          </div>
          <button className="btn btn-primary shrink-0" onClick={run} disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </Card>

      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
        {results.map((r) => (
          <button key={r.id} onClick={() => setDetail(r)} className="text-left rounded-2xl overflow-hidden transition hover:-translate-y-1"
            style={{ background: 'rgba(18,24,42,.66)', border: '1px solid rgba(120,160,255,.12)' }}>
            {r.image && <img src={r.image} alt={r.title} loading="lazy" className="w-full h-40 object-cover" />}
            <div className="p-3">
              <b className="text-[14.5px] leading-tight block">{r.title}</b>
              <div className="text-muted text-xs mt-1">{[r.category, r.area].filter(Boolean).join(' · ')}</div>
            </div>
          </button>
        ))}
      </div>

      {searched && !loading && results.length === 0 && (
        <Card className="mt-4"><Empty icon="🍲" title="No recipes found" sub="Try another search term" /></Card>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <div className="mt-2 max-h-[72vh] overflow-y-auto pr-1">
            {detail.image && <img src={detail.image} alt={detail.title} className="w-full h-48 object-cover rounded-xl mb-3" />}
            <div className="text-muted text-xs mb-3">{[detail.category, detail.area].filter(Boolean).join(' · ')}</div>
            <div className="h3 mb-2">Ingredients</div>
            <ul className="text-sm text-muted leading-relaxed mb-4 list-disc pl-5">
              {detail.ingredients.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
            <div className="h3 mb-2">Instructions</div>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{detail.instructions}</p>
            {detail.youtube && <a href={detail.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full mt-4">▶ Watch on YouTube</a>}
          </div>
        </Modal>
      )}
    </>
  )
}
