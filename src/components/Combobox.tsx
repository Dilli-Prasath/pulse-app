import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

/**
 * Searchable dropdown (combobox). Type to filter options (DOM text search),
 * click to pick. With allowCustom, the typed value is also accepted so users
 * can enter anything not in the list.
 */
export function Combobox({
  value, onChange, options, placeholder = 'Select…', allowCustom = true, icon = true,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  allowCustom?: boolean
  icon?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filter = (open ? q : '').trim().toLowerCase()
  const filtered = filter ? options.filter((o) => o.toLowerCase().includes(filter)) : options

  return (
    <div className="relative" ref={wrap}>
      <div className="relative">
        {icon && <Search size={14} className="absolute left-2.5 top-3 text-muted pointer-events-none" />}
        <input
          className={`input ${icon ? 'pl-8' : ''} pr-7`}
          value={open ? q : value}
          placeholder={placeholder}
          onFocus={() => { setQ(value); setOpen(true) }}
          onChange={(e) => { setQ(e.target.value); setOpen(true); if (allowCustom) onChange(e.target.value) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setOpen(false) } if (e.key === 'Escape') setOpen(false) }}
        />
        <ChevronDown size={15} className="absolute right-2 top-3 text-muted pointer-events-none" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-[200px] overflow-y-auto rounded-xl py-1"
          style={{ background: '#121826', border: '1px solid rgba(120,160,255,.22)', boxShadow: '0 16px 40px rgba(0,0,0,.5)' }}>
          {filtered.map((o) => (
            <button key={o} type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-[rgba(120,160,255,.1)] transition"
              style={{ color: o === value ? '#22e3ff' : '#e8eefc' }}
              onClick={() => { onChange(o); setQ(o); setOpen(false) }}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
