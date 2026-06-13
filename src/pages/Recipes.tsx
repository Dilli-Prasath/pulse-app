import { useState } from 'react'
import { Card, PageHeader, Modal, Empty } from '../components/ui'
import { searchRecipes, NinjaRecipe, ninjaConfigured } from '../lib/apiNinjas'
import { Search, Loader2, Soup } from 'lucide-react'

export default function Recipes() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<NinjaRecipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [detail, setDetail] = useState<NinjaRecipe | null>(null)

  async function run() {
    if (!q.trim()) return
    setLoading(true); setSearched(true)
    const r = await searchRecipes(q.trim())
    setResults(r); setLoading(false)
  }

  const splitList = (s: string) => s.split(/\|/).map((x) => x.trim()).filter(Boolean)

  return (
    <>
      <PageHeader title="Recipes" sub="Search 200,000+ recipes for meal ideas" />

      {!ninjaConfigured && (
        <Card className="mb-4"><div className="text-sm text-muted">
          Recipes use API Ninjas via your Supabase Edge Function. Enable cloud + deploy the <code className="text-cyan">api-ninjas</code> function (see README) to use this.
        </div></Card>
      )}

      <Card>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input className="input pl-9" placeholder="e.g. chicken curry, oatmeal, salad…" value={q}
              onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} />
          </div>
          <button className="btn btn-primary shrink-0" onClick={run} disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </Card>

      <div className="grid gap-3.5 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {results.map((r, i) => (
          <Card key={i} glow={false}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0" style={{ background: 'rgba(120,160,255,.08)' }}><Soup size={20} className="text-cyan" /></div>
              <b className="text-[15px] leading-tight">{r.title}</b>
            </div>
            {r.servings && <div className="text-muted text-xs mb-2">{r.servings}</div>}
            <div className="text-[12.5px] text-muted line-clamp-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {splitList(r.ingredients).slice(0, 4).join(' · ')}
            </div>
            <button className="btn btn-sm w-full mt-3" onClick={() => setDetail(r)}>View recipe</button>
          </Card>
        ))}
      </div>

      {searched && !loading && results.length === 0 && (
        <Card className="mt-4"><Empty icon="🍲" title="No recipes found"
          sub="Try another search. Note: the Recipe endpoint may require an API Ninjas premium key." /></Card>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <div className="mt-3">
            {detail.servings && <div className="text-muted text-sm mb-3">{detail.servings}</div>}
            <div className="h3 mb-2">Ingredients</div>
            <ul className="text-sm text-muted leading-relaxed mb-4 list-disc pl-5">
              {splitList(detail.ingredients).map((x, i) => <li key={i}>{x}</li>)}
            </ul>
            <div className="h3 mb-2">Instructions</div>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{detail.instructions}</p>
          </div>
        </Modal>
      )}
    </>
  )
}
