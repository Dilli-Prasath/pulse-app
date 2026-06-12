import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Stat, Modal, PageHeader } from '../components/ui'
import { LineArea } from '../components/charts'
import { latestWeight, bmi, bmiLabel, totalLost, fmtDate } from '../lib/calcs'
import { today } from '../lib/seed'

export default function Body() {
  const d = useStore((s) => s.data)
  const logWeight = useStore((s) => s.logWeight)
  const showToast = useStore((s) => s.showToast)
  const [open, setOpen] = useState(false)

  const w = latestWeight(d)
  const b = bmi(d)
  const [bl, bc] = bmiLabel(b)
  const data = d.weights.map((p) => ({ label: fmtDate(p.date), value: p.kg }))
  const log = [...d.weights].reverse()

  return (
    <>
      <PageHeader title="Body" sub={`Track weight, BMI and progress to ${d.profile.targetWeight} kg`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Weight</button>} />

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
        <Stat label="Current" value={w.toFixed(1)} unit="kg" />
        <Stat label="BMI" value={b.toFixed(1)} color={bc} sub={<span style={{ color: bc }}>{bl}</span>} />
        <Stat label="Total Lost" value={totalLost(d)} unit="kg" color="#2bffb0" />
        <Stat label="To Goal" value={(w - d.profile.targetWeight).toFixed(1)} unit="kg" color="#8b5cff" />
      </div>

      <Card className="mt-4"><div className="h3 mb-2">Weight History</div>
        <LineArea data={data} color="#22e3ff" goal={d.profile.targetWeight} height={260} unit=" kg" /></Card>

      <Card className="mt-4"><div className="h3 mb-3">Log</div>
        <div className="flex flex-col gap-2.5">
          {log.map((p, i) => {
            const prev = log[i + 1]
            const diff = prev ? p.kg - prev.kg : 0
            return (
              <div key={p.date} className="flex items-center gap-3.5 p-3 rounded-xl"
                style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-lg" style={{ background: 'rgba(120,160,255,.08)' }}>⚖️</div>
                <div className="flex-1"><b className="text-[14.5px]">{p.kg} kg</b><span className="block text-xs text-muted">{fmtDate(p.date)}</span></div>
                <div className="font-extrabold text-right" style={{ color: diff < 0 ? '#2bffb0' : diff > 0 ? '#ffcf5c' : '#7d89a8' }}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}<span className="block text-[11px] text-muted font-semibold">kg</span></div>
              </div>
            )
          })}
        </div></Card>

      {open && <WeightModal current={w} onClose={() => setOpen(false)} onSave={(e) => { logWeight(e); showToast('Weight logged ⚖️'); setOpen(false) }} />}
    </>
  )
}

function WeightModal({ current, onClose, onSave }: { current: number; onClose: () => void; onSave: (e: { date: string; kg: number }) => void }) {
  const [kg, setKg] = useState(String(current))
  const [date, setDate] = useState(today())
  return (
    <Modal title="Log Weight" onClose={onClose}>
      <div className="mt-4">
        <div className="mb-3.5"><label className="label">Weight (kg)</label>
          <input className="input" type="number" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} /></div>
        <div className="mb-1"><label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <button className="btn btn-primary w-full mt-4" onClick={() => {
          const v = +kg; if (!v) return alert('Enter a weight'); onSave({ date, kg: v })
        }}>Save</button>
      </div>
    </Modal>
  )
}
