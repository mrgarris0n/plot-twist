import { describe, expect, it } from 'vitest'
import { createProject, type Facing, type Steepness } from '../../model/project'
import { en } from '../../strings/en'
import { slopeNoteOf, strengthClass, sunClass } from './SunOverlay'

describe('sunClass', () => {
  it('splits at 6 and 3 hours', () => {
    expect(sunClass(6)).toBe('full')
    expect(sunClass(5.9)).toBe('part')
    expect(sunClass(3)).toBe('part')
    expect(sunClass(2.9)).toBe('shade')
  })
})

describe('strengthClass', () => {
  it('splits at 1.10, 0.90 and 0.50', () => {
    expect(strengthClass(1.1)).toBe('same')
    expect(strengthClass(1.1001)).toBe('more')
    expect(strengthClass(0.9)).toBe('same')
    expect(strengthClass(0.5)).toBe('less')
    expect(strengthClass(0.4999)).toBe('low')
  })
})

describe('slopeNoteOf', () => {
  const proj = (steepness: Steepness, facing: Facing | null, located = true) => {
    const p = createProject('t')
    if (located) p.location = { lat: 51, lon: 0 }
    p.slope = { steepness, facing }
    return p
  }
  it('is null on flat ground', () => {
    expect(slopeNoteOf(proj('flat', null))).toBeNull()
    expect(slopeNoteOf(createProject('t'))).toBeNull()
  })
  it('is null without a location', () => {
    expect(slopeNoteOf(proj('strong', 'S', false))).toBeNull()
  })
  it('says more for a strong south slope', () => {
    const note = slopeNoteOf(proj('strong', 'S'))
    expect(note).toMatch(/more sun/)
    expect(note).toContain('south-facing')
  })
  it('says less for a strong north slope', () => {
    const note = slopeNoteOf(proj('strong', 'N'))
    expect(note).toMatch(/less sun/)
    expect(note).toContain('north-facing')
  })
  it('says about the same when the change rounds to 0%', () => {
    const note = slopeNoteOf(proj('gentle', 'E'))
    expect(note).toBe(en.overlay.slopeSame('gentle', 'east'))
  })
})
