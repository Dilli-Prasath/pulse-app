import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { exerciseImageUrl, placeholderImage } from '../lib/exerciseApi'
import { X } from 'lucide-react'

export function ExerciseImage({ name, size = 48, rounded = 12, zoomable = true }:
  { name: string; size?: number; rounded?: number; zoomable?: boolean }) {
  const [src, setSrc] = useState(() => exerciseImageUrl(name))
  const [zoom, setZoom] = useState(false)
  useEffect(() => { setSrc(exerciseImageUrl(name)) }, [name])

  return (
    <>
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setSrc(placeholderImage(name))}
        onClick={zoomable ? () => setZoom(true) : undefined}
        title={zoomable ? 'Tap to enlarge' : undefined}
        style={{
          width: size, height: size, borderRadius: rounded, objectFit: 'cover', flexShrink: 0,
          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(120,160,255,.12)',
          cursor: zoomable ? 'zoom-in' : 'default',
        }}
      />
      {zoom && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-5"
          style={{ background: 'rgba(3,5,12,.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setZoom(false)}>
          <button className="absolute top-5 right-5 btn btn-sm" onClick={() => setZoom(false)}><X size={18} /></button>
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <img src={src} alt={name} onError={() => setSrc(placeholderImage(name))}
              style={{ maxWidth: 'min(92vw, 720px)', maxHeight: '80vh', borderRadius: 18, objectFit: 'contain', background: '#fff' }} />
            <div className="mt-3 text-lg font-bold">{name}</div>
            <div className="text-muted text-xs">Tap anywhere to close</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
