import { describe, expect, it } from 'vitest'
import type { Climate } from '../../model/project'
import { realSunHours } from './cloud'

const c = (cloudWarmPct: number | null | undefined): Climate => ({ source: 'manual', minWinterC: null, lastFrostDoy: null, firstFrostDoy: null, frostFree: false, cloudWarmPct })

describe('realSunHours', () => {
  it('scales clear-sky hours by cloud cover', () => {
    expect(realSunHours(10, c(70))).toBeCloseTo(3)
  })
  it('null when cloud unknown', () => {
    expect(realSunHours(10, null)).toBeNull()
    expect(realSunHours(10, c(null))).toBeNull()
    expect(realSunHours(10, c(undefined))).toBeNull()
  })
})
