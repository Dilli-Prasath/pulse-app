import { Modal, Tag } from './ui'
import { ExerciseImage } from './ExerciseImage'
import { EXERCISE_LIBRARY } from '../lib/exerciseLibrary'

/**
 * Full exercise overview from STATIC data only (no API). Looks the exercise up
 * in the curated library; if it isn't there, still shows the image + name.
 */
export function ExerciseDetail({ name, onClose, onAdd }: { name: string; onClose: () => void; onAdd?: () => void }) {
  const e = EXERCISE_LIBRARY.find((x) => x.name.toLowerCase() === name.toLowerCase())
  return (
    <Modal title={name} onClose={onClose}>
      <div className="mt-2">
        <div className="flex justify-center mb-4"><ExerciseImage name={name} size={240} rounded={16} /></div>
        {e ? (
          <>
            <div className="flex gap-2 flex-wrap justify-center mb-3">
              <Tag color={e.level === 'Advanced' ? 'gold' : e.level === 'Intermediate' ? 'cardio' : 'str'}>{e.level}</Tag>
              <span className="tag bg-[rgba(120,160,255,.12)] text-muted">{e.muscle}</span>
              <span className="tag bg-[rgba(120,160,255,.12)] text-muted">{e.equipment}</span>
            </div>
            <div className="h3 mb-1.5">How to perform</div>
            <p className="text-sm text-muted leading-relaxed">{e.howto}</p>
          </>
        ) : (
          <p className="text-sm text-muted text-center">Tap the image to enlarge.</p>
        )}
        <div className="text-[11px] text-muted2 mt-3 text-center">Tap the image to enlarge · static guide, works offline</div>
        {onAdd && <button className="btn btn-primary w-full mt-4" onClick={onAdd}>Add to today's workout</button>}
      </div>
    </Modal>
  )
}
