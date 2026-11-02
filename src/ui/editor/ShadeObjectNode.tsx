import type Konva from 'konva'
import { useEffect, useRef } from 'react'
import { Circle, Rect, Text, Transformer } from 'react-konva'
import { MAX_SIZE_M, type ShadeKind, type ShadeObject } from '../../model/project'
import { useStore } from '../../state/store'
import { canopyHitRadius } from './geometry'

const MIN_SIZE_M = 0.05

const STYLE: Record<ShadeKind, { fill: string; stroke: string }> = {
  house: { fill: '#c9a98a', stroke: '#7d5f45' },
  shed: { fill: '#d4b98c', stroke: '#8a7048' },
  wall: { fill: '#b9b2a6', stroke: '#6f6a60' },
  fence: { fill: '#a98d64', stroke: '#6b5632' },
  hedge: { fill: '#6f9a58', stroke: '#3f6a30' },
  tree: { fill: 'rgba(92,140,70,0.55)', stroke: '#3f6a30' },
  bed: { fill: '#6b4f36', stroke: '#b98a50' }, // dark soil, wooden edge
}

type Props = { object: ShadeObject; selected: boolean; readOnly: boolean }

const bedFontSize = (widthM: number) => Math.min(0.4, widthM / 6)

/** One shade object. Coordinates are metres (the Stage is scaled to pixels). */
export function ShadeObjectNode({ object: o, selected, readOnly }: Props) {
  const select = useStore((s) => s.select)
  const updateShadeObject = useStore((s) => s.updateShadeObject)
  const shapeRef = useRef<Konva.Shape>(null)
  const textRef = useRef<Konva.Text>(null)
  const isTree = o.kind === 'tree'
  const isBed = o.kind === 'bed'

  const onSelect = () => select(o.id)
  // Alt-drag leaves a copy where the object was and drags the original.
  const onDragStart = (e: Konva.KonvaEventObject<DragEvent>) => { if (e.evt.altKey) useStore.getState().duplicate(o.id, 0); onSelect() }
  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    updateShadeObject(o.id, { x: e.target.x(), y: e.target.y() })
    // The store may stop the object short of a plant crown; snap the node to where it really is.
    const placed = useStore.getState().project?.shadeObjects.find((s) => s.id === o.id)
    if (placed) e.target.position({ x: placed.x, y: placed.y })
  }
  // The bed name follows the rectangle live while it is dragged, resized or rotated.
  const followLabel = (e: Konva.KonvaEventObject<Event>) => {
    const n = e.target
    const w = n.width() * n.scaleX()
    const l = n.height() * n.scaleY()
    textRef.current?.setAttrs({ x: n.x(), y: n.y(), rotation: n.rotation(), width: w, height: l, offsetX: w / 2, offsetY: l / 2, fontSize: bedFontSize(w) })
  }
  const onTransformEnd = () => {
    const node = shapeRef.current
    if (!node) return
    const w = Math.min(MAX_SIZE_M, Math.max(MIN_SIZE_M, node.width() * node.scaleX()))
    const l = Math.min(MAX_SIZE_M, Math.max(MIN_SIZE_M, node.height() * node.scaleY()))
    node.scaleX(1)
    node.scaleY(1)
    const rotationDeg = ((node.rotation() % 360) + 360) % 360
    updateShadeObject(o.id, { x: node.x(), y: node.y(), widthM: w, lengthM: isTree ? w : l, rotationDeg })
  }

  const common = {
    x: o.x,
    y: o.y,
    draggable: !readOnly,
    onClick: onSelect,
    onTap: onSelect,
    onDragStart,
    onDragEnd,
    onTransformEnd,
    ...(isBed ? { dash: o.perennial ? [8, 5] : undefined, onDragMove: followLabel, onTransform: followLabel } : {}),
    fill: STYLE[o.kind].fill,
    stroke: selected ? '#2f5d8a' : STYLE[o.kind].stroke,
    strokeWidth: selected ? 2 : 1,
    strokeScaleEnabled: false,
    name: 'shade-object',
    id: o.id,
  }

  return isTree ? (
    <Circle
      {...common}
      ref={shapeRef as React.RefObject<Konva.Circle>}
      width={o.widthM}
      height={o.widthM}
      hitFunc={(ctx, shape) => {
        ctx.beginPath()
        ctx.arc(0, 0, canopyHitRadius(o.widthM / 2), 0, Math.PI * 2)
        ctx.closePath()
        ctx.fillStrokeShape(shape)
      }}
    />
  ) : (
    <>
    <Rect
      {...common}
      ref={shapeRef as React.RefObject<Konva.Rect>}
      width={o.widthM}
      height={o.lengthM}
      offsetX={o.widthM / 2}
      offsetY={o.lengthM / 2}
      rotation={o.rotationDeg}
    />
    {isBed && (
      <Text
        ref={textRef}
        x={o.x}
        y={o.y}
        width={o.widthM}
        height={o.lengthM}
        offsetX={o.widthM / 2}
        offsetY={o.lengthM / 2}
        rotation={o.rotationDeg}
        text={o.name ?? ''}
        fontSize={bedFontSize(o.widthM)}
        fill="#f3e9d8"
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    )}
    </>
  )
}

/** Single Transformer, rendered after all shapes so its handles draw on top. */
export function ShadeTransformer({ object: o }: { object: ShadeObject }) {
  const trRef = useRef<Konva.Transformer>(null)
  const isTree = o.kind === 'tree'
  useEffect(() => {
    const tr = trRef.current
    const node = tr?.getLayer()?.findOne(`#${o.id}`)
    if (tr && node) {
      tr.nodes([node])
      tr.getLayer()?.batchDraw()
    }
  }, [o.id, isTree])
  return (
    <Transformer
      ref={trRef}
      rotateEnabled={!isTree}
      keepRatio={isTree}
      enabledAnchors={
        isTree
          ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
          : ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
      }
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      rotationSnapTolerance={4}
      anchorSize={9}
      borderStroke="#2f5d8a"
      anchorStroke="#2f5d8a"
      boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 3 || Math.abs(newBox.height) < 3 ? oldBox : newBox)}
    />
  )
}
