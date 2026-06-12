import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'

export interface Point { label: string; value: number }

export function LineArea({ data, color = '#22e3ff', goal, height = 200, unit = '' }:
  { data: Point[]; color?: string; goal?: number; height?: number; unit?: string }) {
  if (!data.length) return <div className="text-center py-10 text-muted2 text-sm">No data yet</div>
  const id = 'grad-' + color.replace('#', '')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(120,160,255,.08)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#566184', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={18} />
        <YAxis tick={{ fill: '#566184', fontSize: 10 }} axisLine={false} tickLine={false} width={42} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: '#121826', border: '1px solid rgba(120,160,255,.22)', borderRadius: 12, color: '#e8eefc', fontSize: 12 }}
          formatter={(v: number) => [`${v}${unit}`, '']} labelStyle={{ color: '#7d89a8' }} />
        {goal != null && <ReferenceLine y={goal} stroke="#2bffb0" strokeDasharray="4 4" strokeOpacity={0.7}
          label={{ value: 'goal', fill: '#2bffb0', fontSize: 10, position: 'right' }} />}
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.4} fill={`url(#${id})`}
          dot={{ r: 2.6, fill: color }} activeDot={{ r: 5 }} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
