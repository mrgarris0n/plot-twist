import { en } from '../../strings/en'

export type Part = 'early' | 'mid' | 'late'
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const PART_DAY: Record<Part, number> = { early: 5, mid: 15, late: 25 }

/** Day of year (1-365) -> month index (0-11) and early/mid/late (days 1-10, 11-20, 21+). */
export function doyToMonthPart(doy: number): { month: number; part: Part } {
  let left = Math.min(365, Math.max(1, Math.round(doy)))
  for (let m = 0; m < 12; m++) {
    const n = DAYS_IN_MONTH[m]!
    if (left <= n) return { month: m, part: left <= 10 ? 'early' : left <= 20 ? 'mid' : 'late' }
    left -= n
  }
  return { month: 11, part: 'late' }
}

export function monthPartToDoy(month: number, part: Part): number {
  let doy = 0
  for (let m = 0; m < month; m++) doy += DAYS_IN_MONTH[m]!
  return doy + PART_DAY[part]
}

export function describeDoy(doy: number): string {
  const { month, part } = doyToMonthPart(doy)
  return en.climate.when(en.climate.parts[part], en.climate.months[month]!)
}
