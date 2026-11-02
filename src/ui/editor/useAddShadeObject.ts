import { plotBounds, type ShadeKind } from '../../model/project'
import { useStore } from '../../state/store'

/** Adds a shade object at the plot centre and selects it. Shared by the toolbar and the setup drawer. */
export function useAddShadeObject(): (kind: ShadeKind) => void {
  const addShadeObject = useStore((s) => s.addShadeObject)
  const select = useStore((s) => s.select)
  const plot = useStore((s) => s.project?.plot)
  return (kind) => {
    if (!plot) return
    const { widthM, lengthM } = plotBounds(plot)
    select(addShadeObject(kind, { x: widthM / 2, y: lengthM / 2 }))
  }
}
