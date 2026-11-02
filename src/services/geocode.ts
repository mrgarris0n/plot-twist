export type Place = { label: string; lat: number; lon: number }

export class GeocodeUnavailable extends Error {
  constructor(message = 'Place search is unavailable') {
    super(message)
    this.name = 'GeocodeUnavailable'
  }
}

const ENDPOINT = 'https://photon.komoot.io/api/'
const MIN_QUERY = 3

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: { name?: string; city?: string; state?: string; country?: string }
}

/** "Name, city, state, country", skipping missing and repeated parts, so same-named places can be told apart. */
function labelOf(p: NonNullable<PhotonFeature['properties']>): string {
  const parts: string[] = []
  for (const s of [p.name, p.city, p.state, p.country]) if (s && !parts.includes(s)) parts.push(s)
  return parts.join(', ')
}

export async function searchPlaces(q: string, signal?: AbortSignal): Promise<Place[]> {
  const query = q.trim()
  if (query.length < MIN_QUERY) return []
  let res: Response
  try {
    res = await fetch(`${ENDPOINT}?${new URLSearchParams({ q: query, limit: '5' })}`, { signal })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new GeocodeUnavailable()
  }
  if (!res.ok) throw new GeocodeUnavailable()
  let body: { features?: PhotonFeature[] }
  try {
    body = await res.json()
  } catch {
    throw new GeocodeUnavailable()
  }
  const out: Place[] = []
  for (const f of body.features ?? []) {
    const c = f.geometry?.coordinates
    if (!c || !f.properties || !Number.isFinite(c[0]) || !Number.isFinite(c[1]) || Math.abs(c[1]) > 90 || Math.abs(c[0]) > 180) continue
    const label = labelOf(f.properties)
    if (label) out.push({ label, lat: c[1], lon: c[0] })
  }
  return out
}
