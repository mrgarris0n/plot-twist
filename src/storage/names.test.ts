import { describe, expect, it } from 'vitest'
import { nameTaken, uniqueName } from './names'

const gardens = [{ id: 'a', name: 'My garden' }, { id: 'b', name: 'Back yard' }, { id: 'c', name: 'My garden 2' }]

describe('garden names', () => {
  it('matches ignoring case and surrounding spaces', () => {
    expect(nameTaken('  back YARD ', gardens)).toBe(true)
    expect(nameTaken('Front yard', gardens)).toBe(false)
  })
  it('lets a garden keep its own name (or change its case)', () => {
    expect(nameTaken('back yard', gardens, 'b')).toBe(false)
    expect(nameTaken('Back yard', gardens, 'a')).toBe(true)
  })
  it('matches composed and decomposed accents', () => {
    expect(nameTaken('Kert Győr'.normalize('NFD'), [{ id: 'x', name: 'Kert Győr' }])).toBe(true)
  })
  it('numbers a taken name, skipping numbers in use', () => {
    expect(uniqueName('Front yard', gardens)).toBe('Front yard')
    expect(uniqueName('My garden', gardens)).toBe('My garden 3')
    expect(uniqueName(' Back yard ', gardens)).toBe('Back yard 2')
  })
})
