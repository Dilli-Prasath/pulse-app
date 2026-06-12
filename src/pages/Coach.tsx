import { useStore } from '../lib/store'
import { Card, PageHeader, Stat } from '../components/ui'
import { coachInsights } from '../lib/insights'
import { calorieTarget, proteinTarget, weeksToGoal, tdee, bmr } from '../lib/calcs'

const TONE: Record<string, { border: string; bg: string }> = {
  good: { border: '#2bffb0', bg: 'rgba(43,255,176,.07)' },
  warn: { border: '#ffcf5c', bg: 'rgba(255,207,92,.07)' },
  info: { border: '#22e3ff', bg: 'rgba(34,227,255,.06)' },
}

export default function Coach() {
  const d = useStore((s) => s.data)
  const insights = coachInsights(d)

  return (
    <>
      <PageHeader title="AI Coach" sub="Smart, adaptive guidance based on your real data" />

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
        <Stat label="Daily Target" value={calorieTarget(d)} unit="kcal" color="#2bffb0" />
        <Stat label="Maintenance" value={Math.round(tdee(d))} unit="kcal" color="#8b5cff" />
        <Stat label="Protein Goal" value={proteinTarget(d)} unit="g" color="#22e3ff" />
        <Stat label="Time to Goal" value={weeksToGoal(d)} unit="wks" color="#ff4fd8" />
      </div>

      <div className="grid gap-3.5 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
        {insights.map((ins, i) => (
          <div key={i} className="rounded-2xl p-4 flex gap-3.5" style={{ background: TONE[ins.tone].bg, border: `1px solid ${TONE[ins.tone].border}33` }}>
            <div className="text-2xl shrink-0">{ins.icon}</div>
            <div><b className="text-[14.5px]" style={{ color: TONE[ins.tone].border }}>{ins.title}</b>
              <p className="text-[13px] text-muted mt-1 leading-relaxed">{ins.body}</p></div>
          </div>
        ))}
      </div>

      <Card className="mt-4"><div className="h3 mb-2">How your numbers are calculated</div>
        <p className="text-[13px] text-muted leading-relaxed">
          Your BMR ({Math.round(bmr(d))} kcal) uses the Mifflin–St Jeor equation from your height, weight, age and sex.
          Multiplied by your activity level it gives maintenance ({Math.round(tdee(d))} kcal). Your daily target subtracts
          a deficit equal to {d.profile.goalRate} kg/week (≈{Math.round((d.profile.goalRate * 7700) / 7)} kcal/day).
          Adjust any of these on the Profile page and every recommendation updates instantly.
        </p></Card>
    </>
  )
}
