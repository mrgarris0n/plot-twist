import { useMemo, useState } from 'react'
import { bedAt, bedName } from '../../engine/beds'
import { companions } from '../../data/companions'
import { companionReason, companionsOf } from '../../model/companions'
import { library, plantName, variantLabel, variantOf } from '../../data/library'
import { effectiveSize, sizeAt } from '../../engine/growth'
import { ageAt, layoutOf } from '../../engine/presence'
import { MAX_SIZE_M, type Climate, type PlacedPlant, type ShadeObject, type Units } from '../../model/project'
import { grownAsAnnual } from '../../engine/checks/climate'
import { realSunHours } from '../../engine/checks/cloud'
import { LIGHT_Z_FRACTION } from '../../engine/checks/light'
import { growingSeasonHours, growingSeasonStrength } from '../../engine/scene'
import { formatLength, formatRain, formatTemp, parseLength } from '../../model/units'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { localizeDecimal } from '../../strings/lang'
import { removeItem } from '../editor/removeItem'

/** Planting-year input: the box can be cleared while typing; leaving it empty or invalid shows the stored year again. */
export function PlantedYearField({ year, disabled, onCommit }: { year: number; disabled: boolean; onCommit(y: number): void }) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <label className="field">
      <span>{en.plant.plantedYear}</span>
      <input
        type="number"
        min={0}
        max={20}
        step={1}
        value={draft ?? year}
        disabled={disabled}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = Math.round(Number(e.target.value))
          if (e.target.value !== '' && Number.isFinite(n)) onCommit(Math.min(20, Math.max(0, n)))
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  )
}

type FieldProps = { label: string; valueM: number; units: Units; disabled: boolean; onCommit(m: number): void }

/** Length input: shows the stored value; invalid text shows an error and leaves the value unchanged. */
export function LengthField({ label, valueM, units, disabled, onCommit }: FieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const commit = (revertIfInvalid: boolean) => {
    if (draft === null) return
    const m = parseLength(draft, units)
    if (m === null || m <= 0 || m > MAX_SIZE_M) {
      setError(true)
      if (revertIfInvalid) setDraft(null)
      return
    }
    setError(false)
    setDraft(null)
    onCommit(m)
  }
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        value={draft ?? formatLength(valueM, units)}
        disabled={disabled}
        aria-invalid={error}
        onChange={(e) => { setDraft(e.target.value); setError(false) }}
        onBlur={() => commit(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(false) }}
      />
      {error && <span className="field-error" role="alert">{en.selection.invalidLength}</span>}
    </label>
  )
}

function Editor({ o, units, readOnly }: { o: ShadeObject; units: Units; readOnly: boolean }) {
  const update = useStore((s) => s.updateShadeObject)
  const isTree = o.kind === 'tree'
  const isBed = o.kind === 'bed'
  const onRemove = () => removeItem(o.id)
  return (
    <div className="selection">
      <h2>{en.selection.title(isBed ? (bedName(o) ?? en.editor.kind.bed) : en.editor.kind[o.kind])}</h2>
      {isBed && (
        <>
          <label className="field">
            <span>{en.beds.name}</span>
            <input type="text" value={o.name ?? ''} disabled={readOnly} onChange={(e) => update(o.id, { name: e.target.value })} />
          </label>
          <label className="field">
            <input type="checkbox" checked={o.perennial === true} disabled={readOnly} onChange={(e) => update(o.id, { perennial: e.target.checked })} /> {en.beds.perennial}
          </label>
        </>
      )}
      {isTree ? (
        <LengthField label={en.selection.crownWidth} valueM={o.widthM} units={units} disabled={readOnly} onCommit={(m) => update(o.id, { widthM: m, lengthM: m })} />
      ) : (
        <>
          <LengthField label={en.selection.width} valueM={o.widthM} units={units} disabled={readOnly} onCommit={(m) => update(o.id, { widthM: m })} />
          <LengthField label={en.selection.length} valueM={o.lengthM} units={units} disabled={readOnly} onCommit={(m) => update(o.id, { lengthM: m })} />
        </>
      )}
      <LengthField label={en.selection.height} valueM={o.heightM} units={units} disabled={readOnly} onCommit={(m) => update(o.id, { heightM: m })} />
      {isTree && (
        <fieldset className="field" disabled={readOnly}>
          <legend>{en.selection.canopy}</legend>
          <label>
            <input type="radio" name={`canopy-${o.id}`} checked={o.canopy === 'dense'} onChange={() => update(o.id, { canopy: 'dense' })} />
            {en.selection.canopyDense}
          </label>
          <label>
            <input type="radio" name={`canopy-${o.id}`} checked={o.canopy === 'light'} onChange={() => update(o.id, { canopy: 'light' })} />
            {en.selection.canopyLight}
          </label>
          <label>
            <input type="checkbox" checked={o.leafOff === true} onChange={(e) => update(o.id, { leafOff: e.target.checked })} />
            {en.selection.leafOff}
          </label>
        </fieldset>
      )}
      <button type="button" className="danger" disabled={readOnly} onClick={onRemove}>
        {en.selection.remove}
      </button>
    </div>
  )
}

function PlantEditor({ pp, units, climate, readOnly }: { pp: PlacedPlant; units: Units; climate: Climate | null; readOnly: boolean }) {
  const update = useStore((st) => st.updatePlant)
  const remove = useStore((st) => st.removePlant)
  const rec = library.byId.get(pp.plantId)
  const project = useStore((st) => st.project)
  const year = useStore((st) => st.project?.settings.year ?? 0)
  const hasLocation = !!project?.location
  const cloudKnown = climate?.cloudWarmPct != null
  // The sun figures trace rays through the whole scene: only while Details is open, and only when something
  // that casts or catches light changes (not season, units or other view settings).
  const [detailsOpen, setDetailsOpen] = useState(false)
  const sceneDeps = [project?.location, project?.plot, project?.northDeg, project?.slope, project?.shadeObjects, project?.plants, project?.gardenType]
  const clearSkyHours = useMemo(() => {
    if (!detailsOpen || !rec || !project || !hasLocation || !cloudKnown) return null
    const age = Math.max(0, ageAt(project, rec, pp, year))
    const z = LIGHT_Z_FRACTION * sizeAt(effectiveSize(pp, rec), age).heightM
    return growingSeasonHours(project, library, pp, z, Math.max(year, pp.plantedYear), pp.id)
  }, [detailsOpen, rec, pp, year, hasLocation, cloudKnown, ...sceneDeps])
  const strength = useMemo(() => {
    if (!detailsOpen || !rec || !project || !hasLocation) return null
    const age = Math.max(0, ageAt(project, rec, pp, year))
    const z = LIGHT_Z_FRACTION * sizeAt(effectiveSize(pp, rec), age).heightM
    return growingSeasonStrength(project, library, pp, z, Math.max(year, pp.plantedYear), pp.id)
  }, [detailsOpen, rec, pp, year, hasLocation, ...sceneDeps])
  if (!rec) return null
  const realSun = clearSkyHours === null ? null : realSunHours(clearSkyHours, climate)
  const water = rec.water
  const waterText = water ? ('minRainMm' in water ? en.details.waterUsda(formatRain(water.minRainMm, units)) : en.details.waterLevel[water.level]) : en.details.waterUnknown
  const unknown = en.details.unknown
  const size = effectiveSize(pp, rec)
  const v = variantOf(rec, pp.variantId)
  const ph = rec.phMin !== null && rec.phMax !== null ? en.details.phRange(localizeDecimal(String(rec.phMin)), localizeDecimal(String(rec.phMax))) : unknown
  return (
    <div className="selection">
      <h2>{en.selection.title(plantName(rec))}</h2>
      <label className="field">
        <span>{en.plant.variant}</span>
        <select
          value={v.id}
          disabled={readOnly}
          onChange={(e) => update(pp.id, { variantId: e.target.value, heightOverrideM: null, widthOverrideM: null })}
        >
          {rec.variants.map((x) => <option key={x.id} value={x.id}>{variantLabel(x)}</option>)}
        </select>
      </label>
      <LengthField label={en.plant.height} valueM={size.matureHeightM} units={units} disabled={readOnly} onCommit={(m) => update(pp.id, { heightOverrideM: m })} />
      {pp.heightOverrideM !== null && (
        <button type="button" disabled={readOnly} onClick={() => update(pp.id, { heightOverrideM: null })}>{en.plant.reset}</button>
      )}
      <LengthField label={en.plant.width} valueM={size.matureWidthM} units={units} disabled={readOnly} onCommit={(m) => update(pp.id, { widthOverrideM: m })} />
      {pp.widthOverrideM !== null && (
        <button type="button" disabled={readOnly} onClick={() => update(pp.id, { widthOverrideM: null })}>{en.plant.reset}</button>
      )}
      {!size.growthKnown && <p className="hint">{en.plant.growthTypical(en.layers[rec.layer])}</p>}
      {grownAsAnnual(rec, climate) && <p className="hint">{en.plant.grownAsAnnual}</p>}
      {project?.gardenType === 'veggie-beds' && !bedAt(project, pp) && <p className="hint">{en.beds.notInBed}</p>}
      <PlantedYearField year={pp.plantedYear} disabled={readOnly} onCommit={(y) => update(pp.id, { plantedYear: y })} />
      <button type="button" className="danger" disabled={readOnly} onClick={() => remove(pp.id)}>
        {en.selection.remove}
      </button>
      <details className="plant-details" open={detailsOpen} onToggle={(e) => setDetailsOpen(e.currentTarget.open)}>
        <summary>{en.details.title}</summary>
        <dl>
          <dt>{en.details.latin}</dt><dd>{rec.latinName}</dd>
          <dt>{en.details.family}</dt><dd>{rec.family ?? unknown}</dd>
          <dt>{en.details.ph}</dt><dd>{ph}</dd>
          <dt>{en.details.waterNeed}</dt><dd>{waterText}</dd>
          {(realSun !== null || strength !== null) && <dt>{en.details.realSunLabel}</dt>}
          {realSun !== null && <dd>{en.details.realSun(realSun)}</dd>}
          {strength !== null && <dd>{en.details.sunStrength(Math.round(strength * 100))}</dd>}
          {rec.annual ? (
            <><dt>{en.details.lifeCycle}</dt><dd>{en.details.annual}</dd></>
          ) : (
            <><dt>{en.details.hardiness}</dt><dd>{en.details.hardinessTo(formatTemp(rec.minWinterC, units))}</dd></>
          )}
        </dl>
        {project?.gardenType === 'veggie-beds' && (['good', 'bad'] as const).map((effect) => {
          const pairs = companionsOf(companions, rec.id).filter((c) => c.effect === effect)
          if (!pairs.length) return null
          return (
            <div key={effect}>
              <h3>{effect === 'good' ? en.details.goodNeighbours : en.details.keepApart}</h3>
              <ul>
                {pairs.map((c) => {
                  const other = library.byId.get(c.a === rec.id ? c.b : c.a)
                  return (
                    <li key={`${c.a}:${c.b}`}>
                      {other ? plantName(other) : ''}: {companionReason(c)}{' '}
                      {c.sources.map((s, i) => <span key={s.id}>{i > 0 && en.details.sourceSeparator}<a href={s.url} target="_blank" rel="noopener">{s.title}</a></span>)}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
        <h3>{en.details.sources}</h3>
        <ul>
          {rec.sources.map((src) => (
            <li key={src.id}><a href={src.url} target="_blank" rel="noopener">{src.title}</a></li>
          ))}
        </ul>
        {rec.pfafUrl && <p><a href={rec.pfafUrl} target="_blank" rel="noopener">{en.details.pfaf}</a></p>}
      </details>
    </div>
  )
}

export function SelectionPanel({ readOnly }: { readOnly: boolean }) {
  const project = useStore((s) => s.project)
  const selectedId = useStore((s) => s.selectedId)
  const o = project?.shadeObjects.find((s) => s.id === selectedId)
  const pp = project ? layoutOf(project, library).plants.find((p) => p.id === selectedId) : undefined // only plants that exist in the viewed year
  return (
    <aside className="side-panel">
      {project && pp ? (
        <PlantEditor key={pp.id} pp={pp} units={project.settings.units} climate={project.climate} readOnly={readOnly} />
      ) : project && o ? (
        <Editor key={o.id} o={o} units={project.settings.units} readOnly={readOnly} />
      ) : (
        <p className="hint">{en.selection.nothing}</p>
      )}
    </aside>
  )
}
