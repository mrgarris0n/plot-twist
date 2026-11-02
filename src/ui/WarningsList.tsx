import type { Warning } from '../engine/checks/types'
import { en } from '../strings/en'
import { CloseButton } from './CloseButton'
import { useEscape } from './useEscape'

type Props = { warnings: Warning[]; onPick(w: Warning): void; onClose(): void }

/** Every warning and hint in the plan; picking one with a plant selects it and brings it into view. */
export function WarningsList({ warnings, onPick, onClose }: Props) {
  useEscape(onClose)
  return (
    <section className="warnings-list" aria-label={en.warningsUi.listTitle}>
      <header className="drawer-head">
        <h2>{en.warningsUi.listTitle}</h2>
        <CloseButton label={en.warningsUi.close} onClick={onClose} />
      </header>
      {warnings.length === 0 ? (
        <p className="hint">{en.warningsUi.listEmpty}</p>
      ) : (
        <ul>
          {warnings.map((w) => (
            <li key={w.key} className={`list-item ${w.severity}`}>
              {w.plantIds.length > 0 ? (
                <button type="button" onClick={() => onPick(w)}>{w.message}</button>
              ) : (
                <p>{w.message}</p>
              )}
              <details>
                <summary>{en.details.title}</summary>
                <p>{w.detail}</p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
