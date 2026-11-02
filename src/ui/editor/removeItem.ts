import { bedAt, bedName } from '../../engine/beds'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'

/** Deletes a placed plant or object; a bed that holds plants asks first, since its plants go with it. */
export function removeItem(id: string): void {
  const { project, removePlant, removeShadeObject } = useStore.getState()
  if (!project) return
  if (project.plants.some((pl) => pl.id === id)) return removePlant(id)
  const o = project.shadeObjects.find((s) => s.id === id)
  if (!o) return
  const count = o.kind === 'bed' ? project.plants.filter((pl) => bedAt(project, pl)?.id === o.id).length : 0
  if (count > 0 && !window.confirm(en.beds.confirmDelete(bedName(o) ?? en.editor.kind.bed, count))) return
  removeShadeObject(id)
}
