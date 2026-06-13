import { useEffect, useState } from 'react'
import { exerciseImageUrl, placeholderImage } from '../lib/exerciseApi'

export function ExerciseImage({ name, size = 48, rounded = 12 }: { name: string; size?: number; rounded?: number }) {
  const [src, setSrc] = useState(() => exerciseImageUrl(name))
  // reset when the name changes
  useEffect(() => { setSrc(exerciseImageUrl(name)) }, [name])
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setSrc(placeholderImage(name))}
      style={{ width: size, height: size, borderRadius: rounded, objectFit: 'cover', flexShrink: 0,
        background: 'rgba(120,160,255,.08)', border: '1px solid rgba(120,160,255,.12)' }}
    />
  )
}
