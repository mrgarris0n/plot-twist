import { describe, expect, it } from 'vitest'
import { createProject, type ShadeKind, type ShadeObject } from '../model/project'
import { bedAt, bedName, nextBedName } from './beds'

const obj = (over: Partial<ShadeObject> & { id: string }): ShadeObject => ({ kind: 'bed' as ShadeKind, x: 5, y: 5, widthM: 1.2, lengthM: 2.4, rotationDeg: 0, heightM: 0.3, canopy: null, ...over })
const withObjects = (...shadeObjects: ShadeObject[]) => ({ ...createProject('t'), shadeObjects })

describe('beds', () => {
  it('bedAt finds the containing bed', () => {
    const p = withObjects(obj({ id: 'a' }), obj({ id: 'b', x: 9 }))
    expect(bedAt(p, { x: 5.3, y: 6 })?.id).toBe('a')
    expect(bedAt(p, { x: 9, y: 5 })?.id).toBe('b')
    expect(bedAt(p, { x: 7, y: 5 })).toBeNull()
  })
  it('bedAt picks the bed drawn on top (the later one) where beds overlap', () => {
    const p = withObjects(obj({ id: 'under' }), obj({ id: 'over', x: 5.5 }))
    expect(bedAt(p, { x: 5.2, y: 5 })?.id).toBe('over')
    expect(bedAt(p, { x: 4.5, y: 5 })?.id).toBe('under')
  })
  it('bedAt honours bed rotation', () => {
    const p = withObjects(obj({ id: 'a', widthM: 1, lengthM: 3, rotationDeg: 90 }))
    expect(bedAt(p, { x: 6.4, y: 5 })?.id).toBe('a')
    expect(bedAt(p, { x: 5, y: 6.4 })).toBeNull()
  })
  it('bedAt ignores non-bed objects', () => {
    const p = withObjects(obj({ id: 'h', kind: 'house' }))
    expect(bedAt(p, { x: 5, y: 5 })).toBeNull()
  })
  it('bedName ignores a missing, empty or blank name', () => {
    expect(bedName(obj({ id: 'a', name: ' Bed A ' }))).toBe('Bed A')
    expect(bedName(obj({ id: 'a' }))).toBeNull()
    expect(bedName(obj({ id: 'a', name: '' }))).toBeNull()
    expect(bedName(obj({ id: 'a', name: '   ' }))).toBeNull()
  })
  it('nextBedName skips used names', () => {
    expect(nextBedName(withObjects())).toBe('Bed A')
    expect(nextBedName(withObjects(obj({ id: 'a', name: 'Bed A' }), obj({ id: 'c', name: 'Bed C' })))).toBe('Bed B')
  })
  it('nextBedName continues with numbers after Z', () => {
    const all = Array.from({ length: 26 }, (_, i) => obj({ id: `b${i}`, name: `Bed ${String.fromCharCode(65 + i)}` }))
    expect(nextBedName(withObjects(...all))).toBe('Bed 27')
  })
})
