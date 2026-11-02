import { useRef, useState } from 'react'
import { SETUP_ITEMS, setupStatus, useStore, type SetupItem } from '../state/store'
import { en } from '../strings/en'
import { useDismiss } from './useDismiss'

/** Setup button in the bottom bar with its progress; opens the five setup steps upward, each ticked when done. */
export function SetupMenu({ onOpen, onExpand }: { onOpen(item: SetupItem): void; onExpand(): void }) {
  const project = useStore((s) => s.project)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))
  if (!project) return null
  const status = setupStatus(project)
  const done = SETUP_ITEMS.filter((i) => status[i]).length
  return (
    <div className="bar-menu" ref={ref}>
      <button type="button" className="setup-button" aria-expanded={open} aria-controls="setup-menu-items" onClick={() => { if (!open) onExpand(); setOpen((o) => !o) }}>
        {done === SETUP_ITEMS.length ? <><span aria-hidden="true" className="checklist-tick">{en.setup.doneMark}</span> {en.setup.button}</> : en.setup.progress(done, SETUP_ITEMS.length)}
      </button>
      {open && (
        <div id="setup-menu-items" className="bar-menu-items" role="group" aria-label={en.setup.title}>
          {SETUP_ITEMS.map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`${en.setup[i]} (${status[i] ? en.setup.done : en.setup.todo})`}
              className="checklist-item"
              onClick={() => { onOpen(i); setOpen(false) }}
            >
              <span aria-hidden="true" className="checklist-tick">{status[i] ? en.setup.doneMark : en.setup.todoMark}</span>
              {en.setup[i]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
