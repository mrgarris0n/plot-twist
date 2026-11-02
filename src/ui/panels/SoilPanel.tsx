import { useEffect, useId, useState } from 'react'
import { ACIDITY_RANGES, describeSoil, lookupSoil } from '../../services/soil'
import type { Drainage, Soil, SoilTexture } from '../../model/project'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { onRadioKeyDown, radioTabIndex } from '../radioGroup'

type Phase = 'looking' | 'found' | 'failed' | 'idle'
type Acidity = keyof typeof ACIDITY_RANGES

const TEXTURES: SoilTexture[] = ['sandy', 'loamy', 'clay', 'silty']
const ACIDITIES: Acidity[] = ['acidic', 'neutral', 'alkaline']
const DRAINAGES: Drainage[] = ['fast', 'normal', 'wet']

function acidityOf(s: Soil | null): Acidity | null {
  if (!s || s.phMin === null || s.phMax === null) return null
  return ACIDITIES.find((a) => ACIDITY_RANGES[a].phMin === s.phMin && ACIDITY_RANGES[a].phMax === s.phMax) ?? null
}

export function SoilPanel() {
  const location = useStore((s) => s.project?.location ?? null)
  const soil = useStore((s) => s.project?.soil ?? null)
  const setSoil = useStore((s) => s.setSoil)
  // A lookup result belongs to the place it was made for, so a moved pin never shows the old one.
  const [result, setResult] = useState<{ at: string; phase: 'found' | 'failed'; soil: Soil | null } | null>(null)
  const [manual, setManual] = useState(false)
  const textureId = useId()
  const acidityId = useId()
  const drainageId = useId()
  const lat = location?.lat
  const lon = location?.lon
  const at = `${lat},${lon}`
  const hasSoil = soil !== null

  useEffect(() => {
    if (lat === undefined || lon === undefined || hasSoil) return
    const ctrl = new AbortController()
    lookupSoil({ lat, lon }, ctrl.signal).then((r) => {
      if (ctrl.signal.aborted) return
      setResult({ at: `${lat},${lon}`, phase: r ? 'found' : 'failed', soil: r })
    })
    return () => ctrl.abort()
  }, [lat, lon, hasSoil])

  const current = result?.at === at ? result : null
  const phase: Phase = !location || hasSoil ? 'idle' : current ? current.phase : 'looking'
  const found = current?.soil ?? null

  const base: Soil = soil ?? { source: 'manual', phMin: null, phMax: null, texture: null, drainage: null }
  const edit = (patch: Partial<Soil>) => {
    // Re-picking the value already shown isn't an edit, so looked-up soil keeps its source and credit.
    if (soil && Object.entries(patch).every(([k, v]) => soil[k as keyof Soil] === v)) return
    setSoil({ ...base, source: 'manual', ...patch })
  }
  const showManual = manual || phase === 'failed' || hasSoil || !location
  const acidity = acidityOf(soil)

  return (
    <div className="stack">
      {!location && !hasSoil && <p className="hint">{en.soil.needLocation}</p>}
      {phase === 'looking' && !hasSoil && <p className="hint" role="status">{en.soil.looking}</p>}
      {phase === 'failed' && !hasSoil && <p className="hint">{en.soil.lookupFailed}</p>}
      {phase === 'found' && found && !hasSoil && (
        <div className="stack">
          <p>{en.soil.found(describeSoil(found))}</p>
          <button type="button" onClick={() => setSoil(found)}>{en.soil.use}</button>
          {!manual && <button type="button" onClick={() => setManual(true)}>{en.soil.describe}</button>}
          <p className="hint">{en.credits.soil}</p>
        </div>
      )}
      {soil && (
        <>
          <p>{en.soil.current(describeSoil(soil))}</p>
          {soil.source === 'lookup' && <p className="hint">{en.credits.soil}</p>}
        </>
      )}
      {showManual && (
        <>
          <div role="radiogroup" aria-labelledby={textureId} className="stack" onKeyDown={onRadioKeyDown}>
            <span id={textureId}>{en.soil.textureLabel}</span>
            {TEXTURES.map((t, i) => (
              <button key={t} type="button" role="radio" aria-checked={soil?.texture === t} tabIndex={radioTabIndex(soil?.texture === t, i === 0, !!soil?.texture)} onClick={() => edit({ texture: t })}>{en.soil.texture[t]}</button>
            ))}
          </div>
          <div role="radiogroup" aria-labelledby={acidityId} className="stack" onKeyDown={onRadioKeyDown}>
            <span id={acidityId}>{en.soil.acidityLabel}</span>
            {ACIDITIES.map((a, i) => (
              <button key={a} type="button" role="radio" aria-checked={acidity === a} tabIndex={radioTabIndex(acidity === a, i === 0, acidity !== null)} onClick={() => edit({ ...ACIDITY_RANGES[a] })}>{en.soil.acidity[a]}</button>
            ))}
          </div>
          <div role="radiogroup" aria-labelledby={drainageId} className="stack" onKeyDown={onRadioKeyDown}>
            <span id={drainageId}>{en.soil.drainageLabel}</span>
            {DRAINAGES.map((d, i) => (
              <button key={d} type="button" role="radio" aria-checked={soil?.drainage === d} tabIndex={radioTabIndex(soil?.drainage === d, i === 0, !!soil?.drainage)} onClick={() => edit({ drainage: d })}>{en.soil.drainage[d]}</button>
            ))}
          </div>
          <details>
            <summary>{en.details.title}</summary>
            <label className="field">
              <span>{en.soil.haveTest}: {en.details.soilTestLabel}</span>
              <input
                type="number" step="0.1" min="3" max="10"
                value={soil?.source === 'test' && soil.phMin !== null ? soil.phMin : ''}
                onChange={(e) => {
                  const v = e.target.valueAsNumber
                  if (Number.isFinite(v)) setSoil({ ...base, source: 'test', phMin: v, phMax: v })
                }}
              />
            </label>
          </details>
        </>
      )}
    </div>
  )
}
