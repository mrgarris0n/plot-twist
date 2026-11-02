import { useEffect, useState } from 'react'
import type { Climate } from '../../model/project'
import { formatRain, formatTemp } from '../../model/units'
import { loadClimate } from '../../services/climate'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { storeLookedUpClimate } from '../useClimateRefresh'
import { describeDoy, doyToMonthPart, monthPartToDoy, type Part } from './climateDates'

const PARTS: Part[] = ['early', 'mid', 'late']
const EMPTY: Climate = { source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false, rainYearMm: null, rainWarmMm: null, cloudWarmPct: null }

function DateField({ label, doy, disabled, onChange }: { label: string; doy: number | null; disabled: boolean; onChange: (doy: number | null) => void }) {
  const mp = doy === null ? null : doyToMonthPart(doy)
  const set = (month: number | null, part: Part | null) => onChange(month === null ? null : monthPartToDoy(month, part ?? 'mid'))
  return (
    <fieldset className="field" disabled={disabled}>
      <legend>{label}</legend>
      <select aria-label={`${label}: ${en.climate.monthLabel}`} value={mp?.month ?? ''} onChange={(e) => set(e.target.value === '' ? null : Number(e.target.value), mp?.part ?? null)}>
        <option value="">{en.climate.notSet}</option>
        {en.climate.months.map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>
      <select aria-label={`${label}: ${en.climate.partLabel}`} value={mp?.part ?? ''} disabled={mp === null} onChange={(e) => set(mp!.month, e.target.value as Part)}>
        {PARTS.map((p) => <option key={p} value={p}>{en.climate.parts[p]}</option>)}
      </select>
    </fieldset>
  )
}

function TempField({ climate, units, onChange }: { climate: Climate; units: 'metric' | 'imperial'; onChange: (c: number | null) => void }) {
  const toDisplay = (c: number) => (units === 'metric' ? Math.round(c * 10) / 10 : Math.round((c * 9) / 5 + 32))
  const [text, setText] = useState(climate.minWinterC === null ? '' : String(toDisplay(climate.minWinterC)))
  return (
    <label className="field">
      <span>{en.climate.winterLowLabel} ({units === 'metric' ? '°C' : '°F'})</span>
      <input
        type="number" step="1" value={text}
        onChange={(e) => {
          setText(e.target.value)
          const v = e.target.valueAsNumber
          if (e.target.value === '') onChange(null)
          else if (Number.isFinite(v)) onChange(units === 'metric' ? v : ((v - 32) * 5) / 9)
        }}
      />
    </label>
  )
}

export function ClimateSection() {
  const location = useStore((s) => s.project?.location ?? null)
  const climate = useStore((s) => s.project?.climate ?? null)
  const units = useStore((s) => s.project?.settings.units ?? 'metric')
  const setClimate = useStore((s) => s.setClimate)
  const [phase, setPhase] = useState<'idle' | 'looking' | 'failed'>('idle')
  const [editing, setEditing] = useState(false)
  const lat = location?.lat
  const lon = location?.lon
  const isManual = climate?.source === 'manual'

  useEffect(() => {
    if (lat === undefined || lon === undefined || isManual) return
    let stale = false
    setPhase('looking')
    loadClimate({ lat, lon }).then((c) => {
      if (stale) return
      if (c) {
        storeLookedUpClimate(c)
        setPhase('idle'); setEditing(false)
      } else { setPhase('failed'); setEditing(true) }
    })
    return () => { stale = true }
  }, [lat, lon, isManual, setClimate])

  if (!location && !climate) return null
  const manualForm = editing
  const base = climate ?? EMPTY
  const edit = (patch: Partial<Climate>) => setClimate({ ...base, source: 'manual', ...patch })
  // Gardens saved before rain was looked up have no rain fields yet; the lookup above is about to add them.
  const rainPending = climate?.source === 'lookup' && climate.rainYearMm === undefined && phase !== 'failed'
  // Rain and cloud can't be edited by hand, so they stay looked-up figures after a manual edit.
  const lookedUpFigures = climate?.source === 'lookup' || climate?.rainYearMm != null || climate?.cloudWarmPct != null

  return (
    <div className="stack">
      {phase === 'looking' && !climate && <p className="hint" role="status">{en.climate.looking}</p>}
      {phase === 'failed' && !climate && <p className="hint">{en.climate.lookupFailed}</p>}
      {climate && (
        <div className="stack">
          <p>{en.climate.winterLow(climate.minWinterC === null ? en.climate.unknown : formatTemp(units === 'metric' ? Math.round(climate.minWinterC) : climate.minWinterC, units))}</p>
          {climate.frostFree ? (
            <p>{en.climate.frostFree}</p>
          ) : (
            <>
              <p>{en.climate.lastFrost(climate.lastFrostDoy === null ? en.climate.unknown : describeDoy(climate.lastFrostDoy))}</p>
              <p>{en.climate.firstFrost(climate.firstFrostDoy === null ? en.climate.unknown : describeDoy(climate.firstFrostDoy))}</p>
            </>
          )}
          {climate.rainYearMm != null && climate.rainWarmMm != null
            ? <p>{en.climate.rain(formatRain(climate.rainYearMm, units), formatRain(climate.rainWarmMm, units))}</p>
            : !rainPending && <p>{en.climate.rainUnknown}</p>}
          {climate.cloudWarmPct != null && <p>{en.climate.cloud(Math.round(climate.cloudWarmPct))}</p>}
          {climate.source === 'lookup' && <p className="hint">{en.climate.typical}</p>}
          {lookedUpFigures && <p className="hint">{en.credits.climate}</p>}
        </div>
      )}
      {!manualForm && climate && <button type="button" onClick={() => setEditing(true)}>{en.climate.edit}</button>}
      {manualForm && (
        <div className="stack">
          <TempField key={units} climate={base} units={units} onChange={(c) => edit({ minWinterC: c })} />
          <label className="field">
            <input type="checkbox" checked={base.frostFree} onChange={(e) => edit({ frostFree: e.target.checked, ...(e.target.checked ? { lastFrostDoy: null, firstFrostDoy: null } : {}) })} />
            <span>{en.climate.frostFreeLabel}</span>
          </label>
          <DateField label={en.climate.lastFrostLabel} doy={base.lastFrostDoy} disabled={base.frostFree} onChange={(d) => edit({ lastFrostDoy: d })} />
          <DateField label={en.climate.firstFrostLabel} doy={base.firstFrostDoy} disabled={base.frostFree} onChange={(d) => edit({ firstFrostDoy: d })} />
          {climate && <button type="button" onClick={() => setEditing(false)}>{en.climate.done}</button>}
        </div>
      )}
    </div>
  )
}
