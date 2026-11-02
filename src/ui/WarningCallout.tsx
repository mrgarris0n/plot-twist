import { useLayoutEffect, useRef, useState } from 'react'
import type { Warning } from '../engine/checks/types'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { placeCallout, type Box, type Pt, type Rect } from './placeCallout'

type Props = { warnings: Warning[]; plantId: string; readOnly: boolean; actions: boolean; anchor: Pt; bounds: Box }

/** Plain-words explanation beside a warned plant, with the one-click fix and "Keep here". */
export function WarningCallout({ warnings, plantId, readOnly, actions, anchor, bounds }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Box>({ w: 0, h: 0 }) // measured in the layout effect, before the first paint
  const [avoid, setAvoid] = useState<Rect[]>([])
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return
    // Toolbars and open side drawers (warnings list, garden contents) are kept clear of the callout.
    const avoidEls = () => [...parent.querySelectorAll<HTMLElement>('.toolbar, .sun-controls, .warnings-list')]
    const measure = () => {
      setSize((s) => (s.w === el.offsetWidth && s.h === el.offsetHeight ? s : { w: el.offsetWidth, h: el.offsetHeight }))
      const origin = parent.getBoundingClientRect()
      const rects = avoidEls().map((n) => {
        const r = n.getBoundingClientRect()
        return { left: r.left - origin.left, top: r.top - origin.top, w: r.width, h: r.height }
      })
      setAvoid((prev) => (JSON.stringify(prev) === JSON.stringify(rects) ? prev : rects))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    const observeAll = () => {
      ro.disconnect()
      for (const n of [el, parent, ...avoidEls()]) ro.observe(n)
    }
    observeAll()
    // A drawer opening or closing adds or removes a child of the canvas wrapper.
    const mo = new MutationObserver(() => { observeAll(); measure() })
    mo.observe(parent, { childList: true })
    return () => { ro.disconnect(); mo.disconnect() }
  }, [bounds.w, bounds.h])
  const style = placeCallout(anchor, size, bounds, avoid)
  const updatePlant = useStore((s) => s.updatePlant)
  const dismissWarning = useStore((s) => s.dismissWarning)
  return (
    <div ref={ref} className="warning-callout" style={style} role="dialog" aria-label={en.warningsUi.calloutLabel}>
      {warnings.map((w) => {
        const spot = w.fix?.spots[0]
        return (
          <div key={w.key} className={`callout-item ${w.severity}`}>
            <p>{w.message}</p>
            <details>
              <summary>{en.details.title}</summary>
              <p>{w.detail}</p>
            </details>
            {actions && (
              <div className="callout-actions">
                {spot && (
                  <button type="button" disabled={readOnly} onClick={() => updatePlant(plantId, spot)}>
                    {en.warningsUi.moveToSunnier}
                  </button>
                )}
                <button type="button" disabled={readOnly} onClick={() => dismissWarning(w.key)}>
                  {en.warningsUi.keepHere}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
