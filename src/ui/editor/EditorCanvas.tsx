import type Konva from 'konva'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Circle, Group, Layer, Line, Rect, Shape, Stage } from 'react-konva'
import { plotBounds, type PlotShape } from '../../model/project'
import { useStore, type SetupItem } from '../../state/store'
import { library } from '../../data/library'
import { effectiveSize } from '../../engine/growth'
import { layoutOf } from '../../engine/presence'
import { en } from '../../strings/en'
import { centerOn, fitView, gridStep, isVisible, plotToScreen, screenToPlot, zoomAt, type View } from './geometry'
import { Palette } from '../Palette'
import { PLANT_DRAG_TYPE } from '../plantShared'
import { PlantNode } from './PlantNode'
import { NorthArrow } from './NorthArrow'
import { Toolbar } from '../Toolbar'
import { WarningCallout } from '../WarningCallout'
import { WarningsList } from '../WarningsList'
import type { Warning } from '../../engine/checks/types'
import { useWarnings } from './useWarnings'
import { SunCells, useSunGrid, type SunView } from './SunOverlay'
import { GardenContents } from '../GardenContents'
import { ShadeObjectNode, ShadeTransformer } from './ShadeObjectNode'
import { GhostLayer } from '../GhostLayer'
import { ArrangeBar } from '../ArrangeBar'
import { CLOSE_RADIUS_M, PolygonEditor } from './PolygonEditor'
import { snapPoint } from './polygon'
import { useDraft } from '../../state/polygonDraft'
import { useHotkeys } from './useHotkeys'
import { useLangCarriedRef, useLangCarriedState } from '../useLangCarried'

const SOIL = '#e9dcc3'
const GRID = 'rgba(120,100,60,0.18)'

function PlotGrid({ plot, pxPerM }: { plot: PlotShape; pxPerM: number }) {
  const { widthM, lengthM } = plotBounds(plot)
  const step = gridStep(pxPerM)
  const clip =
    plot.kind === 'polygon'
      ? (ctx: Konva.Context) => {
          ctx.beginPath()
          plot.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
          ctx.closePath()
        }
      : undefined
  return (
    <Group clipFunc={clip} listening={false}>
      {/* One shape for every line: a big plot would otherwise be thousands of Konva nodes. */}
      <Shape
        stroke={GRID}
        strokeWidth={1}
        strokeScaleEnabled={false}
        sceneFunc={(ctx, shape) => {
          ctx.beginPath()
          for (let x = step; x < widthM; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, lengthM) }
          for (let y = step; y < lengthM; y += step) { ctx.moveTo(0, y); ctx.lineTo(widthM, y) }
          ctx.strokeShape(shape)
        }}
      />
    </Group>
  )
}

type Props = { readOnly: boolean; onToggleCalendar: () => void; onOpenSetup: (item: SetupItem) => void; onOpenGardens: () => void; onCloseDrawer: () => void }

export function EditorCanvas({ readOnly, onToggleCalendar, onOpenSetup, onOpenGardens, onCloseDrawer }: Props) {
  const project = useStore((s) => s.project)
  const selectedId = useStore((s) => s.selectedId)
  const highlightId = useStore((s) => s.highlightId)
  const select = useStore((s) => s.select)
  const ghosts = useStore((s) => s.ghosts)
  const [pickedGhost, setPickedGhost] = useLangCarriedState<string | null>('canvas.pickedGhost', null)
  useEffect(() => {
    if (selectedId !== null) setPickedGhost(null) // selecting a real plant or object ends the ghost pick
  }, [selectedId])
  const [showSun, setShowSun] = useLangCarriedState('canvas.showSun', false)
  const [sunView, setSunView] = useLangCarriedState<SunView>('canvas.sunView', 'hours')
  const grid = useSunGrid(project, showSun)
  const { warnings, current: warningsCurrent } = useWarnings(project)
  const [sidePanel, setSidePanel] = useLangCarriedState<'warnings' | 'contents' | null>('canvas.sidePanel', null)
  const toggleSide = (p: 'warnings' | 'contents') => setSidePanel((cur) => (cur === p ? null : p))
  const [plantsOpen, setPlantsOpen] = useLangCarriedState('canvas.plantsOpen', false)
  const closePlants = useCallback(() => setPlantsOpen(false), [])
  /** Any other bar action (a menu, a drawer or a side list) closes the plant sheet first. */
  const thenClosePlants = <A extends unknown[]>(f: (...a: A) => void) => (...a: A) => { closePlants(); f(...a) }

  const drawing = useDraft((s) => s.draft !== null)
  useHotkeys(!readOnly && !drawing)
  useEffect(() => {
    if (!drawing) return
    const onKey = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'Escape') useDraft.getState().cancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawing])

  const boxRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  // Publish the bottom bar's height so the setup drawer (a sibling in .editor-body) can stop above it.
  useEffect(() => {
    const bar = barRef.current
    const body = bar?.closest<HTMLElement>('.editor-body')
    if (!bar || !body) return
    const ro = new ResizeObserver(() => body.style.setProperty('--bottom-bar-h', `${bar.offsetHeight}px`))
    ro.observe(bar)
    return () => { ro.disconnect(); body.style.removeProperty('--bottom-bar-h') }
  }, [project !== null])
  const stageRef = useRef<Konva.Stage>(null)
  const placePlant = useStore((s) => s.placePlant)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [view, setView] = useLangCarriedState<View>('canvas.view', { pxPerM: 20, offsetX: 0, offsetY: 0 })
  const fittedFor = useLangCarriedRef<string | null>('canvas.fittedFor', null)
  const userMoved = useLangCarriedRef('canvas.userMoved', false)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      setSize({ w: Math.floor(entry.contentRect.width), h: Math.floor(entry.contentRect.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const projectId = project?.id ?? null
  const plot = project?.plot
  useLayoutEffect(() => {
    if (!plot || size.w === 0 || size.h === 0) return
    if (fittedFor.current === projectId && userMoved.current) return
    if (fittedFor.current !== projectId) userMoved.current = false
    fittedFor.current = projectId
    setView(fitView(plot, size.w, size.h))
  }, [plot, projectId, size.w, size.h])

  const onWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    userMoved.current = true
    const factor = e.evt.deltaY < 0 ? 1.1 : 1 / 1.1
    setView((v) => zoomAt(v, pos, factor))
  }, [])

  if (!project) return null
  const badgeFor = (plantId: string): 'warning' | 'hint' | null => {
    const mine = warnings.filter((w) => w.plantIds.includes(plantId))
    return mine.length === 0 ? null : mine.some((w) => w.severity === 'warning') ? 'warning' : 'hint'
  }
  const yearPlants = layoutOf(project, library).plants // the plants that exist in the year being viewed
  const selectedPlant = yearPlants.find((p) => p.id === selectedId)
  const selectedWarnings = selectedPlant ? warnings.filter((w) => w.plantIds.includes(selectedPlant.id)) : []
  const spots = !warningsCurrent ? [] : selectedWarnings.flatMap((w) => w.fix?.spots ?? [])
  const pickItem = (item: { id: string; x: number; y: number }) => {
    select(item.id)
    if (!isVisible(item, view, size.w, size.h)) {
      userMoved.current = true
      setView(centerOn(item, view, size.w, size.h))
    }
  }
  const pickWarning = (w: Warning) => {
    // The first warned plant that is on the plan this year.
    const plant = w.plantIds.map((id) => yearPlants.find((p) => p.id === id)).find((p) => p !== undefined)
    if (plant) pickItem(plant)
  }
  const calloutPos = selectedPlant ? plotToScreen(selectedPlant, view) : null
  const { widthM, lengthM } = plotBounds(project.plot)
  const selectedObject = project.shadeObjects.find((o) => o.id === selectedId)
  // Biggest crowns first, so smaller plants draw (and take clicks) on top of them.
  const matureWidth = (pl: (typeof project.plants)[number]) => {
    const rec = library.byId.get(pl.plantId)
    return rec ? effectiveSize(pl, rec).matureWidthM : 0
  }
  const plantsBySize = [...yearPlants].sort((a, b) => matureWidth(b) - matureWidth(a))

  const onStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) return
    userMoved.current = true
    const { x, y } = e.target.position()
    setView((v) => ({ ...v, offsetX: x, offsetY: y }))
  }
  const deselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const t = e.target
    if (t === t.getStage()) {
      select(null)
      setPickedGhost(null)
    }
  }

  const onDrawClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { draft, addPoint, close } = useDraft.getState()
    if (!draft || draft.closed || readOnly || e.target !== e.target.getStage()) return
    const pos = e.target.getStage()?.getPointerPosition()
    if (!pos) return
    const raw = screenToPlot(pos, view)
    const first = draft.points[0]
    if (first && draft.points.length >= 3 && Math.hypot(raw.x - first.x, raw.y - first.y) <= CLOSE_RADIUS_M) close()
    else addPoint(snapPoint(raw))
  }

  const onDragOver = (e: React.DragEvent) => {
    if (readOnly || drawing || !e.dataTransfer.types.includes(PLANT_DRAG_TYPE)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  const onDrop = (e: React.DragEvent) => {
    const plantId = e.dataTransfer.getData(PLANT_DRAG_TYPE)
    const stage = stageRef.current
    if (readOnly || drawing || !plantId || !stage) return
    e.preventDefault()
    stage.setPointersPositions(e.nativeEvent)
    const pos = stage.getPointerPosition()
    if (!pos) return
    // getPointerPosition is in stage-container pixels; screenToPlot undoes the view transform.
    select(placePlant(plantId, screenToPlot(pos, view)))
  }

  return (
    <div className="canvas-wrap" ref={boxRef} role="application" aria-label={en.editor.canvasLabel} onDragOver={onDragOver} onDrop={onDrop}>
      {size.w > 0 && size.h > 0 && (
        <Stage
          ref={stageRef}
          width={size.w}
          height={size.h}
          x={view.offsetX}
          y={view.offsetY}
          scaleX={view.pxPerM}
          scaleY={view.pxPerM}
          draggable
          onWheel={onWheel}
          onDragEnd={onStageDragEnd}
          onMouseDown={deselect}
          onTouchStart={deselect}
          onClick={onDrawClick}
          onTap={onDrawClick}
        >
          <Layer listening={false}>
            {project.plot.kind === 'rect' ? (
              <Rect width={widthM} height={lengthM} fill={SOIL} stroke="#8a7f66" strokeWidth={2} strokeScaleEnabled={false} />
            ) : (
              <Line points={project.plot.points.flatMap((p) => [p.x, p.y])} closed fill={SOIL} stroke="#8a7f66" strokeWidth={2} strokeScaleEnabled={false} />
            )}
            <PlotGrid plot={project.plot} pxPerM={view.pxPerM} />
            {grid && <SunCells grid={grid} view={sunView} />}
          </Layer>
          <Layer name="shade" listening={!drawing}>
            {project.shadeObjects.map((o) => (
              <ShadeObjectNode key={o.id} object={o} selected={o.id === selectedId} readOnly={readOnly} />
            ))}
            {selectedObject && !readOnly && <ShadeTransformer object={selectedObject} />}
          </Layer>
          <Layer name="plants" listening={!drawing}>
            {plantsBySize.map((pl) => (
              <PlantNode key={pl.id} plant={pl} year={project.settings.year} season={project.settings.season} selected={pl.id === selectedId} highlighted={pl.id === highlightId} readOnly={readOnly} badge={badgeFor(pl.id)} pxPerM={view.pxPerM} />
            ))}
            {/* fix-spot rings share this layer: Konva slows down past five layers */}
            <Group listening={false}>
              {spots.map((p, i) => (
                <Circle key={i} x={p.x} y={p.y} radius={0.5} stroke="#3f9a4a" strokeWidth={2.5} strokeScaleEnabled={false} fill="rgba(63,154,74,0.18)" />
              ))}
            </Group>
          </Layer>
          <GhostLayer ghosts={ghosts} year={project.settings.year} pickedId={pickedGhost} onPick={(id) => { select(null); setPickedGhost(id) }} />
          <PolygonEditor pxPerM={view.pxPerM} />
        </Stage>
      )}
      <div className="sun-controls" ref={barRef}>
        <Toolbar
          readOnly={readOnly}
          showSun={showSun}
          sunView={sunView}
          onSunView={setSunView}
          onToggleSun={setShowSun}
          onToggleCalendar={thenClosePlants(onToggleCalendar)}
          onOpenPlants={() => setPlantsOpen(true)}
          onOpenSetup={thenClosePlants(onOpenSetup)}
          onOpenGardens={thenClosePlants(onOpenGardens)}
          onCloseDrawer={thenClosePlants(onCloseDrawer)}
          warningCount={warnings.length}
          onToggleWarnings={thenClosePlants(() => toggleSide('warnings'))}
          contentsCount={yearPlants.length + project.shadeObjects.length}
          onToggleContents={thenClosePlants(() => toggleSide('contents'))}
          notices={showSun && !project.location ? [en.overlay.needLocation] : []}
        />
      </div>
      {selectedPlant && calloutPos && selectedWarnings.length > 0 && (
        <WarningCallout
          warnings={selectedWarnings}
          plantId={selectedPlant.id}
          readOnly={readOnly}
          actions={warningsCurrent}
          anchor={calloutPos}
          bounds={size}
        />
      )}
      {sidePanel === 'warnings' && <WarningsList warnings={warnings} onPick={pickWarning} onClose={() => setSidePanel(null)} />}
      {sidePanel === 'contents' && (
        <GardenContents plants={yearPlants} objects={project.shadeObjects} selectedId={selectedId} onPick={pickItem} onClose={() => setSidePanel(null)} />
      )}
      {plantsOpen && !readOnly && <Palette readOnly={readOnly} onClose={closePlants} />}
      <ArrangeBar pickedId={pickedGhost} readOnly={readOnly} />
      <NorthArrow northDeg={project.northDeg} />
    </div>
  )
}
