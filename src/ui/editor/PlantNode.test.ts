import { describe, expect, it } from 'vitest'
import { canopyLook } from './PlantNode'

describe('canopyLook', () => {
  it('shows deciduous crowns bare in mid-winter and turned in autumn', () => {
    const summer = canopyLook('#4f7f45', 'deciduous', 'midsummer')
    expect(summer).toEqual({ fill: '#4f7f45', opacity: 0.75 })
    expect(canopyLook('#4f7f45', 'deciduous', 'midwinter').opacity).toBeLessThan(summer.opacity)
    expect(canopyLook('#4f7f45', 'deciduous', 'autumn').fill).not.toBe('#4f7f45')
    expect(canopyLook('#4f7f45', 'deciduous', 'spring').opacity).toBeLessThan(summer.opacity)
  })

  it('keeps evergreens and unknown leaf habit the same all year', () => {
    for (const season of ['spring', 'midsummer', 'autumn', 'midwinter'] as const) {
      expect(canopyLook('#4f7f45', 'evergreen', season)).toEqual({ fill: '#4f7f45', opacity: 0.75 })
      expect(canopyLook('#4f7f45', null, season)).toEqual({ fill: '#4f7f45', opacity: 0.75 })
    }
  })
})
