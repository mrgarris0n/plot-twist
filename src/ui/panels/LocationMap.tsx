import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useRef, useState } from 'react'
import type { LatLon } from '../../model/project'
import { en } from '../../strings/en'

// Vite pre-bundles maplibre-gl in dev, which breaks its default worker lookup; point it at the worker file explicitly.
maplibregl.setWorkerUrl(workerUrl)

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

type Props = { location: LatLon | null; onPick(l: LatLon): void }

export function LocationMap({ location, onPick }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const marker = useRef<maplibregl.Marker | null>(null)
  const pick = useRef(onPick)
  pick.current = onPick
  const initial = useRef(location)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!box.current) return
    let m: maplibregl.Map
    try {
      const start = initial.current
      m = new maplibregl.Map({
        container: box.current,
        style: STYLE,
        center: start ? [start.lon, start.lat] : [10, 30],
        zoom: start ? 11 : 1.5,
        attributionControl: { compact: true },
        locale: { 'AttributionControl.ToggleAttribution': en.location.attributionToggle, 'Map.Title': en.location.mapTitle },
      })
    } catch {
      setFailed(true)
      return
    }
    map.current = m
    m.on('click', (e) => pick.current({ lat: e.lngLat.lat, lon: ((e.lngLat.lng + 540) % 360) - 180 }))
    return () => { m.remove(); map.current = null; marker.current = null }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m || !location) return
    if (!marker.current) marker.current = new maplibregl.Marker().setLngLat([location.lon, location.lat]).addTo(m)
    else marker.current.setLngLat([location.lon, location.lat])
    m.easeTo({ center: [location.lon, location.lat], zoom: Math.max(m.getZoom(), 11) })
  }, [location])

  if (failed) return <p className="hint">{en.location.mapUnavailable}</p>
  return <div ref={box} className="location-map" role="region" aria-label={en.location.mapLabel} />
}
