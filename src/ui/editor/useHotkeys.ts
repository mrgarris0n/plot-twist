import { useEffect } from 'react'
import { useStore } from '../../state/store'
import { removeItem } from './removeItem'

/** Plot-space direction per arrow key; the plan's y grows downward. */
const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
const NUDGE_M = 0.1
const NUDGE_BIG_M = 1

/** Keys typed into a field, or a popup on top (About), are not plan shortcuts. */
function ignored(e: KeyboardEvent): boolean {
  const t = e.target
  if (t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return true
  return document.querySelector('dialog[open]') !== null
}

function nudge(id: string, dx: number, dy: number): void {
  const { project, updatePlant, updateShadeObject } = useStore.getState()
  const item = project?.plants.find((p) => p.id === id) ?? project?.shadeObjects.find((o) => o.id === id)
  if (!item) return
  const at = { x: item.x + dx, y: item.y + dy }
  if (project!.plants.some((p) => p.id === id)) updatePlant(id, at)
  else updateShadeObject(id, at)
}

/**
 * Plan shortcuts for the selected plant or object: Delete/Backspace removes it, Ctrl/Cmd+D duplicates it, arrows
 * nudge it (Shift: further), Escape deselects. Off when `enabled` is false (phone view, outline drawing).
 */
export function useHotkeys(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (ignored(e)) return
      const { selectedId, select, duplicate } = useStore.getState()
      if (!selectedId) return
      if (e.key === 'Escape') return select(null)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        return removeItem(selectedId)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault() // the browser's bookmark shortcut
        const copy = duplicate(selectedId)
        if (copy) select(copy)
        return
      }
      const dir = ARROWS[e.key]
      if (dir && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        const step = e.shiftKey ? NUDGE_BIG_M : NUDGE_M
        nudge(selectedId, dir[0] * step, dir[1] * step)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
