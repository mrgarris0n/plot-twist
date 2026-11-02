import { Circle, Group, Layer } from 'react-konva'
import { library } from '../data/library'
import { effectiveSize, sizeAt } from '../engine/growth'
import type { PlacedPlant } from '../model/project'
import { canopyHitRadius } from './editor/geometry'
import { LAYER_COLOR } from './plantShared'

type Props = { ghosts: PlacedPlant[]; year: number; pickedId: string | null; onPick: (id: string) => void }

/** Suggested (not yet accepted) plants: faint circles at their size in `year` with a dashed edge. Metres. */
export function GhostLayer({ ghosts, year, pickedId, onPick }: Props) {
  return (
    <Layer name="ghosts">
      {ghosts.map((g) => {
        const rec = library.byId.get(g.plantId)
        if (!rec) return null
        const r = sizeAt(effectiveSize(g, rec), year - g.plantedYear).widthM / 2
        const color = LAYER_COLOR[rec.layer]
        const picked = g.id === pickedId
        const pick = () => onPick(g.id)
        return (
          <Group key={g.id} x={g.x} y={g.y} opacity={0.4} onClick={pick} onTap={pick}>
            {/* hit area near the trunk only, as for placed plants, so a ghost doesn't block clicks on plants under it */}
            <Circle radius={canopyHitRadius(r)} fill="rgba(0,0,0,0.001)" />
            <Circle
              listening={false}
              radius={Math.max(r, canopyHitRadius(0))}
              fill={color}
              stroke={picked ? '#2f4f8f' : color}
              strokeWidth={picked ? 3 : 1.5}
              dash={[4, 3]}
              strokeScaleEnabled={false}
            />
          </Group>
        )
      })}
    </Layer>
  )
}
