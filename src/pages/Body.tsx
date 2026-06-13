import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Stat, Modal, PageHeader, Empty } from '../components/ui'
import { LineArea } from '../components/charts'
import { latestWeight, bmi, bmiLabel, totalLost, fmtDate } from '../lib/calcs'
import { dispWeight, toKg, wLabel } from '../lib/units'
import { today, uid } from '../lib/seed'
import { InBodyEntry } from '../lib/types'
import { Trash2, Upload, Download } from 'lucide-react'

export default function Body() {
  const d = useStore((s) => s.data)
  const [tab, setTab] = useState<'weight' | 'inbody'>('weight')

  return (
    <>
      <PageHeader title="Body" sub="Weight, BMI and full body-composition tracking" />
      <div className="flex gap-2 mb-5">
        <span className={`chip ${tab === 'weight' ? 'chip-on' : ''}`} onClick={() => setTab('weight')}>⚖️ Weight & BMI</span>
        <span className={`chip ${tab === 'inbody' ? 'chip-on' : ''}`} onClick={() => setTab('inbody')}>🧬 InBody</span>
      </div>
      {tab === 'weight' ? <WeightTab d={d} /> : <InBodyTab d={d} />}
    </>
  )
}

/* ----------------------------- Weight tab ----------------------------- */
function WeightTab({ d }: { d: ReturnType<typeof useStore.getState>['data'] }) {
  const logWeight = useStore((s) => s.logWeight)
  const showToast = useStore((s) => s.showToast)
  const unit = useStore((s) => s.data.settings.weightUnit)
  const [open, setOpen] = useState(false)
  const w = latestWeight(d)
  const b = bmi(d)
  const [bl, bc] = bmiLabel(b)
  const data = d.weights.map((p) => ({ label: fmtDate(p.date), value: dispWeight(p.kg, unit) }))
  const log = [...d.weights].reverse()

  return (
    <>
      <div className="flex justify-end mb-4"><button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Weight</button></div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
        <Stat label="Current" value={dispWeight(w, unit).toFixed(1)} unit={wLabel(unit)} />
        <Stat label="BMI" value={b.toFixed(1)} color={bc} sub={<span style={{ color: bc }}>{bl}</span>} />
        <Stat label="Total Lost" value={dispWeight(totalLost(d), unit)} unit={wLabel(unit)} color="#2bffb0" />
        <Stat label="To Goal" value={dispWeight(w - d.profile.targetWeight, unit).toFixed(1)} unit={wLabel(unit)} color="#8b5cff" />
      </div>

      <Card className="mt-4"><div className="h3 mb-2">Weight History</div>
        {data.length ? <LineArea data={data} color="#22e3ff" goal={dispWeight(d.profile.targetWeight, unit)} height={260} unit={` ${wLabel(unit)}`} />
          : <Empty icon="⚖️" title="No weigh-ins yet" sub="Log your weight to see the trend" />}</Card>

      <Card className="mt-4"><div className="h3 mb-3">Log</div>
        {log.length ? (
          <div className="flex flex-col gap-2.5">
            {log.map((p, i) => {
              const prev = log[i + 1]
              const diff = prev ? p.kg - prev.kg : 0
              return (
                <div key={p.date} className="flex items-center gap-3.5 p-3 rounded-xl"
                  style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                  <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0" style={{ background: 'rgba(120,160,255,.08)' }}>⚖️</div>
                  <div className="flex-1"><b className="text-[14.5px]">{dispWeight(p.kg, unit)} {wLabel(unit)}</b><span className="block text-xs text-muted">{fmtDate(p.date)}</span></div>
                  <div className="font-extrabold text-right" style={{ color: diff < 0 ? '#2bffb0' : diff > 0 ? '#ffcf5c' : '#7d89a8' }}>
                    {diff > 0 ? '+' : ''}{dispWeight(diff, unit).toFixed(1)}<span className="block text-[11px] text-muted font-semibold">{wLabel(unit)}</span></div>
                </div>
              )
            })}
          </div>
        ) : <Empty icon="📉" title="Nothing logged" sub="Add your first weigh-in" />}
      </Card>

      {open && <WeightModal current={w || 80} unit={unit} onClose={() => setOpen(false)} onSave={(e) => { logWeight(e); showToast('Weight logged ⚖️'); setOpen(false) }} />}
    </>
  )
}

function WeightModal({ current, unit, onClose, onSave }: { current: number; unit: 'kg' | 'lb'; onClose: () => void; onSave: (e: { date: string; kg: number }) => void }) {
  const [val, setVal] = useState(String(dispWeight(current, unit)))
  const [date, setDate] = useState(today())
  return (
    <Modal title="Log Weight" onClose={onClose}>
      <div className="mt-4">
        <div className="mb-3.5"><label className="label">Weight ({wLabel(unit)})</label>
          <input className="input" type="number" step="0.1" value={val} onChange={(e) => setVal(e.target.value)} /></div>
        <div className="mb-1"><label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <button className="btn btn-primary w-full mt-4" onClick={() => {
          const v = +val; if (!v) return alert('Enter a weight'); onSave({ date, kg: +toKg(v, unit).toFixed(2) })
        }}>Save</button>
      </div>
    </Modal>
  )
}

/* ----------------------------- InBody tab ----------------------------- */
function InBodyTab({ d }: { d: ReturnType<typeof useStore.getState>['data'] }) {
  const addInbody = useStore((s) => s.addInbody)
  const delInbody = useStore((s) => s.delInbody)
  const importInbody = useStore((s) => s.importInbody)
  const showToast = useStore((s) => s.showToast)
  const [open, setOpen] = useState(false)

  const list = [...d.inbody].reverse()
  const latest = d.inbody[d.inbody.length - 1]
  const fatData = d.inbody.filter((e) => e.bodyFatPct != null).map((e) => ({ label: fmtDate(e.date), value: e.bodyFatPct! }))
  const smmData = d.inbody.filter((e) => e.skeletalMuscleMass != null).map((e) => ({ label: fmtDate(e.date), value: e.skeletalMuscleMass! }))

  function onFile(file: File) {
    const r = new FileReader()
    r.onload = () => {
      const rows = parseInbodyCsv(String(r.result))
      if (!rows.length) { showToast('No valid rows found in CSV'); return }
      importInbody(rows)
      showToast(`Imported ${rows.length} InBody record${rows.length > 1 ? 's' : ''} ✅`)
    }
    r.readAsText(file)
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <button className="btn" onClick={downloadTemplate}><Download size={15} /> CSV template</button>
        <label className="btn cursor-pointer"><Upload size={15} /> Import CSV
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = '' }} /></label>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Scan</button>
      </div>

      {latest ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
          <Stat label="Body Fat" value={latest.bodyFatPct ?? '—'} unit={latest.bodyFatPct != null ? '%' : ''} color="#ff4fd8" />
          <Stat label="Muscle (SMM)" value={latest.skeletalMuscleMass ?? '—'} unit={latest.skeletalMuscleMass != null ? 'kg' : ''} color="#22e3ff" />
          <Stat label="Visceral Fat" value={latest.visceralFat ?? '—'} color="#ffcf5c" />
          <Stat label="Body Water" value={latest.bodyWaterPct ?? '—'} unit={latest.bodyWaterPct != null ? '%' : ''} color="#8b5cff" />
          <Stat label="InBody Score" value={latest.inbodyScore ?? '—'} color="#2bffb0" />
        </div>
      ) : (
        <Card><Empty icon="🧬" title="No InBody scans yet" sub="Add a scan manually or import a CSV from your InBody report" /></Card>
      )}

      {(fatData.length > 0 || smmData.length > 0) && (
        <div className="grid gap-4 mt-4 grid-cols-1 lg:grid-cols-2">
          <Card><div className="h3 mb-2">Body Fat %</div><LineArea data={fatData} color="#ff4fd8" height={200} unit=" %" /></Card>
          <Card><div className="h3 mb-2">Skeletal Muscle Mass</div><LineArea data={smmData} color="#22e3ff" height={200} unit=" kg" /></Card>
        </div>
      )}

      {list.length > 0 && (
        <Card className="mt-4"><div className="h3 mb-3">Scan History</div>
          <div className="flex flex-col gap-2.5">
            {list.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl flex-wrap"
                style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0" style={{ background: 'rgba(120,160,255,.08)' }}>🧬</div>
                <div className="flex-1 min-w-[120px]"><b className="text-[14px]">{fmtDate(e.date)}</b>
                  <span className="block text-xs text-muted">
                    {[e.bodyFatPct != null && `${e.bodyFatPct}% fat`, e.skeletalMuscleMass != null && `${e.skeletalMuscleMass}kg SMM`,
                      e.visceralFat != null && `VF ${e.visceralFat}`, e.inbodyScore != null && `Score ${e.inbodyScore}`]
                      .filter(Boolean).join(' · ')}</span></div>
                <button className="btn btn-sm btn-danger shrink-0" onClick={() => delInbody(e.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div></Card>
      )}

      {open && <InBodyModal onClose={() => setOpen(false)} onSave={(e) => { addInbody(e); showToast('Scan saved 🧬'); setOpen(false) }} />}
    </>
  )
}

function InBodyModal({ onClose, onSave }: { onClose: () => void; onSave: (e: Omit<InBodyEntry, 'id'>) => void }) {
  const [v, setV] = useState({ date: today(), weight: '', bodyFatPct: '', skeletalMuscleMass: '', visceralFat: '', bodyWaterPct: '', bmr: '', inbodyScore: '' })
  const set = (k: keyof typeof v, val: string) => setV({ ...v, [k]: val })
  const numOrU = (s: string) => (s.trim() === '' ? undefined : +s)
  return (
    <Modal title="Add InBody Scan" onClose={onClose}>
      <div className="mt-4">
        <div className="mb-3.5"><label className="label">Scan Date</label>
          <input className="input" type="date" value={v.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3.5">
          <div><label className="label">Weight (kg)</label><input className="input" type="number" step="0.1" value={v.weight} onChange={(e) => set('weight', e.target.value)} /></div>
          <div><label className="label">Body Fat (%)</label><input className="input" type="number" step="0.1" value={v.bodyFatPct} onChange={(e) => set('bodyFatPct', e.target.value)} /></div>
          <div><label className="label">Skeletal Muscle (kg)</label><input className="input" type="number" step="0.1" value={v.skeletalMuscleMass} onChange={(e) => set('skeletalMuscleMass', e.target.value)} /></div>
          <div><label className="label">Visceral Fat (level)</label><input className="input" type="number" value={v.visceralFat} onChange={(e) => set('visceralFat', e.target.value)} /></div>
          <div><label className="label">Body Water (%)</label><input className="input" type="number" step="0.1" value={v.bodyWaterPct} onChange={(e) => set('bodyWaterPct', e.target.value)} /></div>
          <div><label className="label">BMR (kcal)</label><input className="input" type="number" value={v.bmr} onChange={(e) => set('bmr', e.target.value)} /></div>
          <div><label className="label">InBody Score</label><input className="input" type="number" value={v.inbodyScore} onChange={(e) => set('inbodyScore', e.target.value)} /></div>
        </div>
        <button className="btn btn-primary w-full mt-4" onClick={() => onSave({
          date: v.date || today(), weight: numOrU(v.weight), bodyFatPct: numOrU(v.bodyFatPct),
          skeletalMuscleMass: numOrU(v.skeletalMuscleMass), visceralFat: numOrU(v.visceralFat),
          bodyWaterPct: numOrU(v.bodyWaterPct), bmr: numOrU(v.bmr), inbodyScore: numOrU(v.inbodyScore),
        })}>Save Scan</button>
      </div>
    </Modal>
  )
}

/* ----------------------------- CSV helpers ----------------------------- */
const TEMPLATE_HEADERS = ['date', 'weight', 'bodyFatPct', 'skeletalMuscleMass', 'visceralFat', 'bodyWaterPct', 'bmr', 'inbodyScore']

function downloadTemplate() {
  const csv = TEMPLATE_HEADERS.join(',') + '\n' + ['2026-06-01', '110', '32.5', '38.2', '14', '52.1', '2140', '72'].join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = 'inbody-template.csv'; a.click()
}

/** Tolerant InBody CSV parser — maps common column-name synonyms. */
function parseInbodyCsv(text: string): Omit<InBodyEntry, 'id'>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const idx = (names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)))
  const di = idx(['date'])
  const wi = idx(['weight'])
  const fi = idx(['fat', 'pbf'])
  const si = idx(['skeletal', 'smm', 'muscle'])
  const vi = idx(['visceral', 'vfa'])
  const bwi = idx(['water', 'tbw'])
  const bri = idx(['bmr', 'basal'])
  const sci = idx(['score', 'inbody score'])
  const out: Omit<InBodyEntry, 'id'>[] = []
  for (let r = 1; r < lines.length; r++) {
    const c = lines[r].split(',').map((x) => x.trim())
    const numAt = (i: number) => (i >= 0 && c[i] !== undefined && c[i] !== '' && !isNaN(+c[i]) ? +c[i] : undefined)
    const date = di >= 0 && c[di] ? normalizeDate(c[di]) : today()
    const entry: Omit<InBodyEntry, 'id'> = {
      date, weight: numAt(wi), bodyFatPct: numAt(fi), skeletalMuscleMass: numAt(si),
      visceralFat: numAt(vi), bodyWaterPct: numAt(bwi), bmr: numAt(bri), inbodyScore: numAt(sci),
    }
    // keep only rows that carry at least one metric
    if ([entry.weight, entry.bodyFatPct, entry.skeletalMuscleMass, entry.visceralFat, entry.bodyWaterPct, entry.bmr, entry.inbodyScore].some((x) => x != null))
      out.push(entry)
  }
  return out
}

function normalizeDate(s: string): string {
  const t = s.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10)
  const dt = new Date(t)
  return isNaN(dt.getTime()) ? today() : dt.toISOString().slice(0, 10)
}
