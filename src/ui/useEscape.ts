import { useEffect } from 'react'

/** Calls `onClose` when Escape is pressed anywhere: for panels that stay open until closed (sheet, side lists). */
export function useEscape(onClose: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}
