import Konva from 'konva'
import { useEffect, useRef } from 'react'
import { Circle, Group, Text } from 'react-konva'
import { library } from '../../data/library'
import { effectiveSize, sizeAt } from '../../engine/growth'
import { ageAt } from '../../engine/presence'
import type { PlantRecord } from '../../model/plants'
import type { PlacedPlant, Season } from '../../model/project'
import { useStore } from '../../state/store'
import { LAYER_COLOR } from '../plantShared'
import { canopyHitRadius } from './geometry'

const AUTUMN_COLOR = '#c98a3a'
const BARE_COLOR = '#9b8466'

/**
 * How a crown looks in a season. Deciduous plants are bare in mid-winter (matching the
 * leaf-off shading in the engine), turn in autumn and carry thinner new leaves in spring;
 * evergreens and plants whose leaf habit is unknown keep their summer look.
 */
export function canopyLook(color: string, leafHabit: PlantRecord['leafHabit'], season: Season): { fill: string; opacity: number } {
  if (leafHabit !== 'deciduous') return { fill: color, opacity: 0.75 }
  switch (season) {
    case 'midwinter': return { fill: BARE_COLOR, opacity: 0.25 }
    case 'autumn': return { fill: AUTUMN_COLOR, opacity: 0.75 }
    case 'spring': return { fill: color, opacity: 0.5 }
    case 'midsummer': return { fill: color, opacity: 0.75 }
  }
}

export const BADGE_COLOR = { warning: '#d9882b', hint: '#5b87c2' } as const
const BADGE_PX = 8

type Props = { plant: PlacedPlant; year: number; season: Season; selected: boolean; highlighted?: boolean; readOnly: boolean; badge?: 'warning' | 'hint' | null; pxPerM?: number }

/** A placed plant: filled circle at its size in `year`, dashed outline at mature width. Metres. */
export function PlantNode({ plant, year, season, selected, highlighted = false, readOnly, badge = null, pxPerM = 20 }: Props) {
  const select = useStore((s) => s.select)
  const updatePlant = useStore((s) => s.updatePlant)
  const gardenType = useStore((s) => s.project?.gardenType ?? null)
  const rec = library.byId.get(plant.plantId)
  if (!rec) return null
  const size = effectiveSize(plant, rec)
  const age = ageAt({ gardenType }, rec, plant, year)
  const color = LAYER_COLOR[rec.layer]
  const look = canopyLook(color, rec.leafHabit, season)
  const matureR = size.matureWidthM / 2
  const widthM = sizeAt(size, age).widthM
  const onSelect = () => select(plant.id)
  // Alt-drag leaves a copy where the plant was and drags the original.
  const onDragStart = (e: Konva.KonvaEventObject<DragEvent>) => { if (e.evt.altKey) useStore.getState().duplicate(plant.id, 0); onSelect() }
  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    updatePlant(plant.id, { x: e.target.x(), y: e.target.y() })
    // The store may nudge the plant clear of a building; snap the node to where it really is.
    const placed = useStore.getState().project?.plants.find((p) => p.id === plant.id)
    if (placed) e.target.position({ x: placed.x, y: placed.y })
  }
  const notYet = age < 0
  const ring = useRef<Konva.Circle>(null)
  useEffect(() => {
    const node = ring.current
    if (!highlighted || !node) return
    const anim = new Konva.Animation((f) => {
      node.opacity(0.55 + 0.45 * Math.sin((f?.time ?? 0) / 150))
    }, node.getLayer())
    anim.start()
    return () => { anim.stop() }
  }, [highlighted])
  return (
    <Group x={plant.x} y={plant.y} draggable={!readOnly} onClick={onSelect} onTap={onSelect} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {/* hit area near the trunk only: tiny plants stay easy to grab, big crowns don't cover what's beneath */}
      <Circle radius={canopyHitRadius(notYet ? 0 : widthM / 2)} fill="rgba(0,0,0,0.001)" />
      {!notYet && widthM > 0 && (
        <Circle listening={false} radius={widthM / 2} fill={look.fill} opacity={look.opacity} stroke={selected ? '#2f4f8f' : undefined} strokeWidth={selected ? 2 : 0} strokeScaleEnabled={false} />
      )}
      <Circle
        radius={matureR}
        stroke={selected ? '#2f4f8f' : color}
        strokeWidth={1.5}
        dash={[4, 3]}
        strokeScaleEnabled={false}
        opacity={notYet ? 0.35 : 1}
        listening={false}
      />
      {highlighted && (
        <Circle ref={ring} radius={Math.max(matureR, 0.3) + 0.4} stroke="#e0a000" strokeWidth={4} fill="rgba(224,160,0,0.2)" strokeScaleEnabled={false} listening={false} />
      )}
      {badge && (
        <Group x={Math.max(matureR, 0.3) * 0.75} y={-Math.max(matureR, 0.3) * 0.75}>
          <Circle radius={BADGE_PX / pxPerM} fill={BADGE_COLOR[badge]} stroke="#fff" strokeWidth={1.5} strokeScaleEnabled={false} />
          <Text
            text={badge === 'warning' ? '!' : 'i'}
            fontSize={11 / pxPerM}
            fontStyle="bold"
            fill="#fff"
            width={(BADGE_PX * 2) / pxPerM}
            height={(BADGE_PX * 2) / pxPerM}
            offsetX={BADGE_PX / pxPerM}
            offsetY={BADGE_PX / pxPerM}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>
      )}
    </Group>
  )
}
