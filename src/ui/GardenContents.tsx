import { library, plantName } from '../data/library'
import type { PlacedPlant, ShadeObject } from '../model/project'
import { en } from '../strings/en'
import { CloseButton } from './CloseButton'
import { useEscape } from './useEscape'

type Props = { plants: PlacedPlant[]; objects: ShadeObject[]; selectedId: string | null; onPick(item: PlacedPlant | ShadeObject): void; onClose(): void }

/** A placed plant's display name; its id when the library does not know it. */
const nameOf = (plantId: string) => {
  const r = library.byId.get(plantId)
  return r ? plantName(r) : plantId
}

/** Everything already in the garden; picking one selects it and brings it into view. */
export function GardenContents({ plants, objects, selectedId, onPick, onClose }: Props) {
  useEscape(onClose)
  const item = (id: string, label: string, onClick: () => void) => (
    <li key={id}>
      <button type="button" aria-current={id === selectedId ? 'true' : undefined} onClick={onClick}>{label}</button>
    </li>
  )
  return (
    <section className="warnings-list garden-contents" aria-label={en.contents.title}>
      <header className="drawer-head">
        <h2>{en.contents.title}</h2>
        <CloseButton label={en.contents.close} onClick={onClose} />
      </header>
      {plants.length === 0 && objects.length === 0 && <p className="hint">{en.contents.empty}</p>}
      {plants.length > 0 && (
        <>
          <h3>{en.contents.plants}</h3>
          <ul>{plants.map((p) => item(p.id, nameOf(p.plantId), () => onPick(p)))}</ul>
        </>
      )}
      {objects.length > 0 && (
        <>
          <h3>{en.contents.objects}</h3>
          <ul>{objects.map((o) => item(o.id, en.editor.kind[o.kind], () => onPick(o)))}</ul>
        </>
      )}
    </section>
  )
}
