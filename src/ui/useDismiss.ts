import { useEffect, type RefObject } from 'react'

/**
 * Closes an open popover when the pointer goes down outside `ref` or Escape is pressed. Escape from inside the
 * popover puts focus back on its toggle (the first button or summary in `ref`), so keyboard users don't lose their place.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose() }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const inside = ref.current?.contains(document.activeElement) ?? false
      onClose()
      if (inside) ref.current?.querySelector<HTMLElement>('button, summary')?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, onClose])
}
