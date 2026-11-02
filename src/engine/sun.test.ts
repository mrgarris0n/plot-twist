import { describe, expect, it } from 'vitest'
import { dayLightHours, seasonDate, sunSamples, type SunSample } from './sun'

const maxAlt = (s: SunSample[]) => Math.max(...s.map((x) => (Math.asin(x.dir[2]) * 180) / Math.PI))
const highest = (s: SunSample[]) => s.reduce((a, b) => (b.dir[2] > a.dir[2] ? b : a))
const bp = { lat: 47.5, lon: 19 }
const sydney = { lat: -33.9, lon: 151.2 }

describe('sun engine', () => {
  it('refuses a step that would never get through the day', () => {
    const d = new Date(Date.UTC(2026, 5, 21))
    for (const step of [0, -15, NaN]) expect(() => sunSamples({ lat: 47.5, lon: 19 }, d, 0, step)).toThrow(RangeError)
  })
  it('midsummer noon altitude Budapest', () => {
    const s = sunSamples(bp, seasonDate('midsummer', bp.lat), 0)
    expect(Math.abs(maxAlt(s) - 65.9)).toBeLessThanOrEqual(0.7)
  })
  it('day length Budapest midsummer', () => {
    const s = sunSamples(bp, seasonDate('midsummer', bp.lat), 0)
    expect(Math.abs(dayLightHours(s) - 15.9)).toBeLessThanOrEqual(0.35)
  })
  it('southern hemisphere midsummer is December', () => {
    expect(seasonDate('midsummer', -33.9).getUTCMonth()).toBe(11)
  })
  it('noon sun is south in north, north in south', () => {
    const n = highest(sunSamples(bp, seasonDate('midsummer', bp.lat), 0))
    expect(n.dir[1]).toBeGreaterThan(0)
    const s = highest(sunSamples(sydney, seasonDate('midsummer', sydney.lat), 0))
    expect(s.dir[1]).toBeLessThan(0)
  })
  it('rotates with northDeg', () => {
    const n = highest(sunSamples(bp, seasonDate('midsummer', bp.lat), 90))
    expect(n.dir[0]).toBeLessThan(0)
    expect(Math.abs(n.dir[1])).toBeLessThan(0.1)
  })
  it('polar day and night', () => {
    const loc = { lat: 70, lon: 20 }
    const day = sunSamples(loc, seasonDate('midsummer', 70), 0)
    expect(Math.abs(dayLightHours(day) - 24)).toBeLessThanOrEqual(0.01)
    expect(sunSamples(loc, seasonDate('midwinter', 70), 0).length).toBe(0)
  })
})
