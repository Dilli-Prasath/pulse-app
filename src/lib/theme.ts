import { Accent } from './types'

export interface AccentDef { label: string; grad: string; glow: string; swatch: string }

export const ACCENTS: Record<Accent, AccentDef> = {
  aurora: { label: 'Aurora', grad: 'linear-gradient(135deg,#22e3ff,#8b5cff 55%,#ff4fd8)', glow: 'rgba(139,92,255,.45)', swatch: 'linear-gradient(135deg,#22e3ff,#8b5cff,#ff4fd8)' },
  cyan: { label: 'Ice', grad: 'linear-gradient(135deg,#22e3ff,#2bffb0)', glow: 'rgba(34,227,255,.5)', swatch: 'linear-gradient(135deg,#22e3ff,#2bffb0)' },
  violet: { label: 'Nebula', grad: 'linear-gradient(135deg,#8b5cff,#ff4fd8)', glow: 'rgba(139,92,255,.5)', swatch: 'linear-gradient(135deg,#8b5cff,#ff4fd8)' },
  sunset: { label: 'Sunset', grad: 'linear-gradient(135deg,#ffcf5c,#ff4fd8)', glow: 'rgba(255,79,216,.45)', swatch: 'linear-gradient(135deg,#ffcf5c,#ff4fd8)' },
  emerald: { label: 'Matrix', grad: 'linear-gradient(135deg,#2bffb0,#22e3ff)', glow: 'rgba(43,255,176,.45)', swatch: 'linear-gradient(135deg,#2bffb0,#22e3ff)' },
}

export function applyAccent(accent: Accent) {
  const a = ACCENTS[accent] || ACCENTS.aurora
  const root = document.documentElement
  root.style.setProperty('--grad', a.grad)
  root.style.setProperty('--glow', a.glow)
}
