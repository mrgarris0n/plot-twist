import { describe, expect, it } from 'vitest'
import { describeDoy, doyToMonthPart, monthPartToDoy } from './climateDates'

describe('climate dates', () => {
  it('words a day of year', () => {
    expect(describeDoy(105)).toBe('mid April') // Apr 15
    expect(describeDoy(300)).toBe('late October') // Oct 27
    expect(describeDoy(1)).toBe('early January')
    expect(describeDoy(365)).toBe('late December')
  })
  it('splits months at day 10 and 20', () => {
    expect(doyToMonthPart(41)).toEqual({ month: 1, part: 'early' }) // Feb 10
    expect(doyToMonthPart(42)).toEqual({ month: 1, part: 'mid' }) // Feb 11
    expect(doyToMonthPart(51)).toEqual({ month: 1, part: 'mid' }) // Feb 20
    expect(doyToMonthPart(52)).toEqual({ month: 1, part: 'late' }) // Feb 21
  })
  it('round-trips month and part', () => {
    for (let m = 0; m < 12; m++) for (const p of ['early', 'mid', 'late'] as const) expect(doyToMonthPart(monthPartToDoy(m, p))).toEqual({ month: m, part: p })
  })
})
