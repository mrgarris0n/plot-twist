import { useStore } from '../state/store'
import { en } from '../strings/en'

type Props = { pickedId: string | null; readOnly: boolean }

/** Floats while suggested plants are shown: accept them all, one picked one, or throw them away. */
export function ArrangeBar({ pickedId, readOnly }: Props) {
  const ghosts = useStore((s) => s.ghosts)
  const acceptGhost = useStore((s) => s.acceptGhost)
  const acceptAllGhosts = useStore((s) => s.acceptAllGhosts)
  const discardGhosts = useStore((s) => s.discardGhosts)
  if (ghosts.length === 0) return null
  const picked = pickedId !== null && ghosts.some((g) => g.id === pickedId) ? pickedId : null
  return (
    <div className="arrange-bar" role="group" aria-label={en.arrange.barLabel}>
      {picked && (
        <button type="button" disabled={readOnly} onClick={() => acceptGhost(picked)}>{en.arrange.addOne}</button>
      )}
      <button type="button" disabled={readOnly} onClick={acceptAllGhosts}>{en.arrange.acceptAll}</button>
      <button type="button" onClick={discardGhosts}>{en.arrange.discard}</button>
    </div>
  )
}
