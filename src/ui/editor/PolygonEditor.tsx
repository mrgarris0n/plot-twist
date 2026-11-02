import type Konva from 'konva'
import { Circle, Layer, Line } from 'react-konva'
import { polygonValid, snapPoint } from './polygon'
import { useDraft } from '../../state/polygonDraft'

const CLOSE_RADIUS_M = 0.5
const STROKE = '#3f6a30'

export { CLOSE_RADIUS_M }

/** In-progress outline with draggable corner handles. Handle size stays constant on screen. */
export function PolygonEditor({ pxPerM }: { pxPerM: number }) {
  const draft = useDraft((s) => s.draft)
  const movePoint = useDraft((s) => s.movePoint)
  const close = useDraft((s) => s.close)
  if (!draft) return null
  const { points, closed } = draft
  const bad = closed && !polygonValid(points)
  const r = 7 / pxPerM
  const flat = points.flatMap((p) => [p.x, p.y])
  return (
    <Layer name="polygon-editor">
      <Line points={flat} closed={closed} fill={closed ? (bad ? 'rgba(200,60,40,0.18)' : 'rgba(63,154,74,0.2)') : undefined}
        stroke={bad ? '#c83c28' : STROKE} strokeWidth={2} strokeScaleEnabled={false} dash={closed ? undefined : [6, 4]} listening={false} />
      {points.map((p, i) => (
        <Circle
          key={i}
          x={p.x}
          y={p.y}
          radius={i === 0 && !closed && points.length >= 3 ? r * 1.4 : r}
          fill={i === 0 ? STROKE : '#fff'}
          stroke={STROKE}
          strokeWidth={2}
          strokeScaleEnabled={false}
          draggable
          onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => { e.cancelBubble = true }}
          onTouchStart={(e: Konva.KonvaEventObject<TouchEvent>) => { e.cancelBubble = true }}
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
            e.cancelBubble = true
            if (i === 0 && !closed) close()
          }}
          onTap={(e: Konva.KonvaEventObject<Event>) => {
            e.cancelBubble = true
            if (i === 0 && !closed) close()
          }}
          onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
            const s = snapPoint({ x: e.target.x(), y: e.target.y() })
            e.target.position(s)
            movePoint(i, s)
          }}
          onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => { e.cancelBubble = true }}
        />
      ))}
    </Layer>
  )
}
