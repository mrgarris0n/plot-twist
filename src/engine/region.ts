import type { PlantRecord } from '../model/plants'
import type { LatLon } from '../model/project'

// Rough outline of Europe (lon, lat): Iceland and the Atlantic isles to the Urals, the Mediterranean
// islands down to Malta and Crete, Turkey and North Africa outside. Good enough to tell a European garden.
const EUROPE: [number, number][] = [
  [-25, 63], [-25, 67], [-10, 72], [30, 72], [60, 70], [60, 51], [53, 47], [47, 45], [42, 43], [40, 41],
  [29, 41], [26, 39.5], [26, 35], [20, 34.5], [15, 35.6], [11, 37.5], [8, 38.5], [-1, 36], [-6, 35.9], [-10, 36], [-10, 44], [-12, 52], [-25, 63],
]

function inPolygon(lon: number, lat: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!
    const [xj, yj] = poly[j]!
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function inEurope(loc: LatLon): boolean {
  return inPolygon(loc.lon, loc.lat, EUROPE)
}

const AMERICAS = new Set(['north-america', 'south-america'])

/**
 * False when the garden is in Europe and the plant is native only to the Americas with no source
 * documenting it as a European garden plant (keeps potato, runner bean, blueberry; drops e.g. New
 * Jersey tea). Unknown location or unknown origin never hides a plant; other regions aren't filtered yet.
 */
export function suitsRegion(rec: PlantRecord, loc: LatLon | null): boolean {
  if (!loc || !inEurope(loc) || !rec.origin) return true
  if (!rec.origin.every((r) => AMERICAS.has(r))) return true
  return rec.grownIn?.includes('europe') ?? false
}
