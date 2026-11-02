import { ChevronRight, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ShadeKind } from '../model/project'
import { useDraft } from '../state/polygonDraft'
import { SHADE_DEFAULTS, setupComplete, useStore } from '../state/store'
import { en } from '../strings/en'
import { useAddShadeObject } from './editor/useAddShadeObject'
import { useDismiss } from './useDismiss'

const ALL_KINDS = Object.keys(SHADE_DEFAULTS) as ShadeKind[]
/** Beds are offered only in veggie-beds gardens, so the food-forest menu is unchanged. */
export const kindsFor = (veggie: boolean): ShadeKind[] => (veggie ? ALL_KINDS : ALL_KINDS.filter((k) => k !== 'bed'))

/** Plus button in the bottom bar; opens upward with Plants (the plant sheet) and Objects, a side menu of buildings and shade objects. */
export function AddMenu({ readOnly, onPlants, onExpand }: { readOnly: boolean; onPlants: () => void; onExpand: () => void }) {
  const add = useAddShadeObject()
  const veggie = useStore((s) => s.project?.gardenType === 'veggie-beds')
  const ready = useStore((s) => s.project !== null && setupComplete(s.project))
  const drawing = useDraft((s) => s.draft !== null)
  const [open, setOpenState] = useState(false)
  const [objectsOpen, setObjectsOpen] = useState(false)
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => { setOpenState(next); setObjectsOpen(false) }
  const disabled = readOnly || drawing
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))
  return (
    <div className="bar-menu" ref={ref}>
      <button
        type="button"
        className={open ? 'icon-button' : 'icon-button tip'}
        aria-label={en.editor.addMenu}
        data-tip={en.editor.addMenu}
        aria-expanded={open && !disabled}
        aria-controls="add-menu-items"
        disabled={disabled}
        onClick={() => { if (!open) onExpand(); setOpen((o) => !o) }}
      >
        <Plus aria-hidden="true" size={18} />
      </button>
      {open && !disabled && (
        <div id="add-menu-items" className="bar-menu-items" role="group" aria-label={en.editor.addMenu}>
          <button type="button" disabled={!ready} onClick={() => { onPlants(); setOpen(false) }}>{en.palette.title}</button>
          <button type="button" className="add-menu-sub-toggle" aria-expanded={objectsOpen} aria-controls="add-menu-objects" onClick={() => setObjectsOpen((o) => !o)}>
            {en.editor.objects} <ChevronRight aria-hidden="true" size={14} />
          </button>
          {objectsOpen && (
            <div id="add-menu-objects" className="bar-menu-items add-menu-sub" role="group" aria-label={en.editor.objects}>
              {kindsFor(veggie).map((k) => (
                <button key={k} type="button" onClick={() => { add(k); setOpen(false) }}>
                  {en.editor.add[k]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
