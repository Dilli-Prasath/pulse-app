import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

export function Card({ children, glow = true, className = '' }: { children: ReactNode; glow?: boolean; className?: string }) {
  return <div className={`card ${glow ? 'card-glow' : ''} ${className}`}>{children}</div>
}

export function Stat({ label, value, unit, sub, color = '#e8eefc' }: { label: string; value: ReactNode; unit?: string; sub?: ReactNode; color?: string }) {
  return (
    <Card>
      <div className="h3">{label}</div>
      <div className="text-[34px] font-extrabold leading-none mt-2 tracking-tight" style={{ color }}>
        {value}{unit && <span className="text-sm text-muted font-semibold ml-1">{unit}</span>}
      </div>
      {sub && <div className="text-xs font-bold mt-2">{sub}</div>}
    </Card>
  )
}

export function Ring({ pct, color = '#22e3ff', label, center }: { pct: number; color?: string; label?: string; center?: ReactNode }) {
  const r = 52
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(pct, 100) / 100)
  return (
    <div className="relative w-[120px] h-[120px]">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(120,160,255,.1)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset .7s', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-extrabold">{center}</div>
          {label && <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>}
        </div>
      </div>
    </div>
  )
}

export function Bar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  return (
    <div className="mb-3.5">
      <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
        <span>{label}</span><span className="text-muted">{Math.round(value)} / {target} g</span>
      </div>
      <div className="h-2.5 rounded-full bg-[rgba(120,160,255,.1)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', background: color }} />
      </div>
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-12 overflow-y-auto"
      style={{ background: 'rgba(3,5,12,.72)', backdropFilter: 'blur(7px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[520px] rounded-[20px] p-7 relative animate-pop"
        style={{ background: '#121826', border: '1px solid rgba(120,160,255,.22)', boxShadow: '0 30px 80px rgba(0,0,0,.6)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white"><X size={22} /></button>
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Empty({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="text-center py-10 text-muted2">
      <div className="text-4xl mb-2 opacity-60">{icon}</div>
      <b className="text-txt text-[15px]">{title}</b>
      <div className="mt-1 text-[13px]">{sub}</div>
    </div>
  )
}

export function Tag({ children, color = 'str' }: { children: ReactNode; color?: 'str' | 'cardio' | 'gold' }) {
  const map = {
    str: 'bg-[rgba(139,92,255,.16)] text-[#c4b1ff]',
    cardio: 'bg-[rgba(34,227,255,.14)] text-cyan',
    gold: 'bg-[rgba(255,207,92,.14)] text-amber',
  }
  return <span className={`tag ${map[color]}`}>{children}</span>
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
      <div>
        <h1 className="text-[27px] font-extrabold tracking-tight">{title}</h1>
        {sub && <div className="text-muted text-[13.5px] mt-1">{sub}</div>}
      </div>
      {action}
    </div>
  )
}
