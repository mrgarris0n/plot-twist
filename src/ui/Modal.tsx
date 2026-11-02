import { useEffect, useRef, type ReactNode } from 'react'

/** A modal popup: opens on mount, closes on Escape or a click on the backdrop, and focuses the element marked `data-autofocus` (else the first input, button or link). */
export function Modal({ labelledBy, className, onClose, children }: { labelledBy: string; className?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    const first = d?.querySelector<HTMLElement>('[data-autofocus]') ?? d?.querySelector<HTMLElement>('input, button, a[href]')
    first?.focus()
    return () => {
      if (d?.open) d.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      className={['modal', className].filter(Boolean).join(' ')}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself, outside its box.
        if (e.target !== e.currentTarget) return
        const r = e.currentTarget.getBoundingClientRect()
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
