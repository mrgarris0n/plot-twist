import { getPosition } from 'suncalc'
import type { LatLon, Season } from '../model/project'

export type Vec3 = [number, number, number] // plot frame: x right, y down, z up; unit vector pointing TOWARD the sun
export type SunSample = { dir: Vec3; hours: number }

const NORTH_DATES: Record<Season, [number, number]> = {
  spring: [2, 20],
  midsummer: [5, 21],
  autumn: [8, 22],
  midwinter: [11, 21],
}
const SWAP: Record<Season, Season> = { spring: 'autumn', midsummer: 'midwinter', autumn: 'spring', midwinter: 'midsummer' }
const REF_YEAR = 2025

export function seasonDate(season: Season, lat: number): Date {
  const [m, d] = NORTH_DATES[lat < 0 ? SWAP[season] : season]
  return new Date(Date.UTC(REF_YEAR, m, d))
}

export function sunSamples(loc: LatLon, date: Date, northDeg: number, stepMin = 15): SunSample[] {
  // A zero or negative step would never get through the day.
  if (!(stepMin > 0 && stepMin <= 1440)) throw new RangeError(`sunSamples: stepMin must be in (0, 1440], got ${stepMin}`)
  const start = date.getTime() - (loc.lon / 15) * 3600_000
  const n = Math.round(1440 / stepMin)
  const out: SunSample[] = []
  for (let i = 0; i < n; i++) {
    const t = new Date(start + i * stepMin * 60_000)
    const { azimuth, altitude } = getPosition(t, loc.lat, loc.lon)
    if (!(altitude > 0)) continue
    const alt = (altitude * Math.PI) / 180
    const a = ((azimuth + northDeg) * Math.PI) / 180
    const c = Math.cos(alt)
    out.push({ dir: [c * Math.sin(a), -c * Math.cos(a), Math.sin(alt)], hours: stepMin / 60 })
  }
  return out
}

export function dayLightHours(samples: readonly SunSample[]): number {
  return samples.reduce((sum, s) => sum + s.hours, 0)
}
