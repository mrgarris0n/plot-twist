import { en } from '../../strings/en'

/** Compass arrow pinned to the top-right of the canvas; points to north. */
export function NorthArrow({ northDeg }: { northDeg: number }) {
  return (
    <div className="north-arrow" title={en.editor.northTitle} aria-label={en.editor.northTitle}>
      <svg width="40" height="40" viewBox="-20 -20 40 40" style={{ transform: `rotate(${northDeg}deg)` }}>
        <circle r="18" fill="rgba(255,255,255,0.8)" stroke="#8a7f66" />
        <path d="M0 -14 L6 6 L0 2 L-6 6 Z" fill="#4f7a3a" />
      </svg>
      <span>{en.editor.northLabel}</span>
    </div>
  )
}
