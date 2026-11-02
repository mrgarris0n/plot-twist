import type { ShadeKind } from '../../model/project'
import { SHADE_DEFAULTS, useStore } from '../../state/store'
import { en } from '../../strings/en'
import { useAddShadeObject } from '../editor/useAddShadeObject'

const ALL_KINDS = Object.keys(SHADE_DEFAULTS) as ShadeKind[]

export function ShadeObjectsPanel({ readOnly }: { readOnly: boolean }) {
  const add = useAddShadeObject()
  const confirm = useStore((s) => s.confirmShadeObjects)
  const confirmed = useStore((s) => s.project?.shadeObjectsConfirmed ?? false)
  const veggie = useStore((s) => s.project?.gardenType === 'veggie-beds')
  const count = useStore((s) => s.project?.shadeObjects.length ?? 0)
  return (
    <div className="stack">
      <p className="hint">{en.shadeObjects.intro}</p>
      <div className="button-row">
        {ALL_KINDS.filter((k) => k !== 'bed').map((k) => (
          <button key={k} type="button" disabled={readOnly} onClick={() => add(k)}>{en.editor.add[k]}</button>
        ))}
      </div>
      {veggie && (
        <>
          <h3>{en.shadeObjects.beds}</h3>
          <div className="button-row">
            <button type="button" disabled={readOnly} onClick={() => add('bed')}>{en.editor.add.bed}</button>
          </div>
        </>
      )}
      {count === 0 && (
        <button type="button" disabled={readOnly || confirmed} onClick={confirm}>
          {confirmed ? en.shadeObjects.noneDone : en.shadeObjects.none}
        </button>
      )}
    </div>
  )
}
