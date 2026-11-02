import { lazy, Suspense, useEffect, useState } from 'react'
import { GeocodeUnavailable, searchPlaces, type Place } from '../../services/geocode'
import { useStore } from '../../state/store'
import { en } from '../../strings/en'
import { formatNumber } from '../../strings/lang'
import { ClimateSection } from './ClimateSection'
// maplibre is large; load it only when the location drawer opens.
const LocationMap = lazy(() => import('./LocationMap').then((m) => ({ default: m.LocationMap })))

const DEBOUNCE_MS = 400

export function LocationPanel() {
  const location = useStore((s) => s.project?.location ?? null)
  const setLocation = useStore((s) => s.setLocation)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [status, setStatus] = useState<'idle' | 'busy' | 'down'>('idle')

  useEffect(() => {
    if (q.trim().length < 3) { setResults([]); setStatus('idle'); return }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      setStatus('busy')
      searchPlaces(q, ctrl.signal).then(
        (r) => {
          if (ctrl.signal.aborted) return
          setResults(r)
          setStatus('idle')
        },
        (e: unknown) => {
          if (ctrl.signal.aborted) return
          setResults([])
          setStatus(e instanceof GeocodeUnavailable ? 'down' : 'idle')
        },
      )
    }, DEBOUNCE_MS)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  const searched = q.trim().length >= 3 && status === 'idle'
  return (
    <div className="stack">
      <p className="hint">{en.location.why}</p>
      <label className="field">
        <span>{en.location.searchLabel}</span>
        <input type="text" value={q} placeholder={en.location.searchPlaceholder} onChange={(e) => setQ(e.target.value)} />
      </label>
      {status === 'busy' && <p className="hint" role="status">{en.location.searching}</p>}
      {status === 'down' && <p className="field-error" role="alert">{en.location.searchDown}</p>}
      {searched && results.length === 0 && <p className="hint">{en.location.noResults}</p>}
      {results.length > 0 && (
        <ul className="results">
          {results.map((r, i) => (
            <li key={`${r.lat},${r.lon},${i}`}>
              <button type="button" onClick={() => { setLocation({ lat: r.lat, lon: r.lon }); setResults([]); setQ('') }}>{r.label}</button>
            </li>
          ))}
        </ul>
      )}
      <p className="hint">{en.location.mapHint}</p>
      <Suspense fallback={null}>
        <LocationMap location={location} onPick={setLocation} />
      </Suspense>
      {location && <p className="hint">{en.location.chosen(formatNumber(location.lat, 3), formatNumber(location.lon, 3))}</p>}
      <ClimateSection />
    </div>
  )
}
