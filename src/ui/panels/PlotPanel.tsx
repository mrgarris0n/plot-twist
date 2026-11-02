import { useEffect, useId } from 'react'
import { plotBounds, type Facing, type Steepness } from '../../model/project'
import { useDraft } from '../../state/polygonDraft'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { formatArea } from '../../model/units'
import { MIN_AREA_M2, normalizeWithOffset, polygonProblem } from '../editor/polygon'
import { LengthField } from './SelectionPanel'
import { onRadioKeyDown, radioTabIndex } from '../radioGroup'

const STEEPNESSES: Steepness[] = ['flat', 'gentle', 'moderate', 'strong', 'veryStrong']
// Compass layout, row by row; null is the empty centre.
const COMPASS: (Facing | null)[] = ['NW', 'N', 'NE', 'W', null, 'E', 'SW', 'S', 'SE']
/** Arrow keys go round the compass clockwise from north. */
const CLOCKWISE: Facing[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function PlotPanel({ readOnly }: { readOnly: boolean }) {
  const project = useStore((s) => s.project)
  const setPlot = useStore((s) => s.setPlot)
  const setPlotShape = useStore((s) => s.setPlotShape)
  const setNorth = useStore((s) => s.setNorth)
  const setSlope = useStore((s) => s.setSlope)
  const draft = useDraft((s) => s.draft)
  const steepId = useId()
  const facingId = useId()
  const { start, cancel, removeLast } = useDraft.getState()
  // Done and Cancel live here, so an outline never outlives this panel (closed drawer, language switch,
  // phone width, leaving the editor) or the garden it was started in.
  useEffect(() => () => useDraft.getState().cancel(), [project?.id])
  if (!project) return null
  const { plot, northDeg, plotConfirmed } = project
  const units = project.settings.units
  const steepness = project.slope?.steepness ?? 'flat'
  const facing = project.slope?.facing ?? null

  const toRect = () => {
    if (plot.kind === 'rect') return
    const { widthM, lengthM } = plotBounds(plot)
    setPlot({ kind: 'rect', widthM, lengthM }) // polygon points are normalized, so nothing moves
  }
  const problem = draft ? polygonProblem(draft.points) : null
  const apply = () => {
    if (!draft || !draft.closed || problem) return
    const { points, shift } = normalizeWithOffset(draft.points)
    setPlotShape({ kind: 'polygon', points }, shift)
    cancel()
  }
  // While corners are still being placed, only a crossing is worth flagging.
  const message = !draft ? null : problem === 'crossing' ? en.plot.invalidShape : draft.closed && problem === 'small' ? en.plot.tooSmall(formatArea(MIN_AREA_M2, units)) : null

  return (
    <div className="stack">
      <div role="group" aria-label={en.plot.shapeTitle} className="row">
        <button type="button" aria-pressed={plot.kind === 'rect' && !draft} disabled={readOnly || (!draft && plot.kind === 'rect')} onClick={() => { cancel(); toRect() }}>
          {en.plot.rectangle}
        </button>
        <button type="button" aria-pressed={plot.kind === 'polygon' || !!draft} disabled={readOnly || !!draft}
          onClick={() => start(plot.kind === 'polygon' ? plot.points.map((p) => ({ ...p })) : [])}>
          {plot.kind === 'polygon' ? en.plot.editShape : en.plot.drawShape}
        </button>
      </div>
      {draft ? (
        <div className="stack" aria-label={en.plot.drawLabel}>
          <p className="hint">{draft.closed ? en.plot.editHelp : en.plot.drawHelp}</p>
          <p className="hint" aria-live="polite">{en.plot.drawCorners(draft.points.length)}</p>
          {message && <p role="alert" className="hint">{message}</p>}
          <div className="row">
            {!draft.closed && draft.points.length > 0 && (
              <button type="button" onClick={removeLast}>{en.plot.undoCorner}</button>
            )}
            <button type="button" disabled={!draft.closed || problem !== null} onClick={apply}>{en.plot.done}</button>
            <button type="button" onClick={cancel}>{en.plot.cancel}</button>
          </div>
        </div>
      ) : plot.kind === 'rect' ? (
        <>
          <LengthField label={en.plot.width} valueM={plot.widthM} units={units} disabled={readOnly}
            onCommit={(m) => setPlot({ ...plot, widthM: m })} />
          <LengthField label={en.plot.length} valueM={plot.lengthM} units={units} disabled={readOnly}
            onCommit={(m) => setPlot({ ...plot, lengthM: m })} />
        </>
      ) : (
        <p className="hint">{en.plot.polygonNote}</p>
      )}
      <label className="field">
        <span>{en.plot.northTitle}</span>
        <input
          type="range" min={0} max={359} step={1} value={Math.round(northDeg) % 360}
          disabled={readOnly}
          aria-label={en.plot.northLabel}
          aria-valuetext={en.plot.northDeg(Math.round(northDeg) % 360)}
          onChange={(e) => setNorth(Number(e.target.value))}
        />
        <span className="hint">{en.plot.northHelp}</span>
      </label>
      <div className="stack">
        <h3 className="slope-heading">{en.plot.slopeHeading}</h3>
        <div role="radiogroup" aria-labelledby={steepId} className="stack" onKeyDown={onRadioKeyDown}>
          <span id={steepId}>{en.plot.steepLabel}</span>
          {STEEPNESSES.map((st, i) => (
            <button key={st} type="button" role="radio" aria-checked={steepness === st} tabIndex={radioTabIndex(steepness === st, i === 0, true)} disabled={readOnly} onClick={() => setSlope(st)}>
              {en.plot.steepness[st]}
            </button>
          ))}
        </div>
        {steepness !== 'flat' && (
          <div className="stack">
            <span id={facingId}>{en.plot.facingLabel}</span>
            <div className="compass" role="radiogroup" aria-labelledby={facingId} onKeyDown={onRadioKeyDown}>
              {COMPASS.map((f, i) => f ? (
                <button key={f} type="button" role="radio" aria-label={en.plot.facing[f]} aria-checked={facing === f} data-order={CLOCKWISE.indexOf(f)}
                  tabIndex={radioTabIndex(facing === f, f === 'N', facing !== null)} disabled={readOnly} onClick={() => setSlope(steepness, f)}>
                  {f}
                </button>
              ) : <span key={i} aria-hidden="true" />)}
            </div>
          </div>
        )}
      </div>
      <button type="button" disabled={readOnly || plotConfirmed} onClick={() => setPlot(plot)}>
        {plotConfirmed ? en.plot.confirmed : en.plot.confirm}
      </button>
    </div>
  )
}
