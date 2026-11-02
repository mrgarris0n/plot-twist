import { X } from 'lucide-react'

/** The × that closes a panel, drawer or popup; `label` is its accessible name. `autoFocus` marks it for Modal. */
export function CloseButton({ label, onClick, autoFocus = false }: { label: string; onClick: () => void; autoFocus?: boolean }) {
  return (
    <button type="button" className="icon-button close-button" aria-label={label} data-autofocus={autoFocus ? '' : undefined} onClick={onClick}>
      <X aria-hidden="true" size={16} />
    </button>
  )
}
