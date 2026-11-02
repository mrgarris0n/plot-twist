import { afterEach, describe, expect, it } from 'vitest'
import { setLang, formatNumber } from '../strings/lang'
import { formatLength, formatRain, formatTemp, parseLength } from './units'

describe('formatLength', () => {
  it('formats metric', () => {
    expect(formatLength(4, 'metric')).toBe('4 m')
    expect(formatLength(0.5, 'metric')).toBe('0.5 m')
    expect(formatLength(2.349, 'metric')).toBe('2.3 m')
    expect(formatLength(3.96, 'metric')).toBe('4 m')
  })
  it('formats imperial', () => {
    expect(formatLength(0.508, 'imperial')).toBe('1 ft 8 in')
    expect(formatLength(3.048, 'imperial')).toBe('10 ft')
    expect(formatLength(0.2032, 'imperial')).toBe('8 in')
    expect(formatLength(0, 'imperial')).toBe('0 in')
  })
})

describe('parseLength', () => {
  it('parses metric', () => {
    expect(parseLength('4', 'metric')).toBe(4)
    expect(parseLength('4.5', 'metric')).toBe(4.5)
    expect(parseLength('4 m', 'metric')).toBe(4)
  })
  it('parses imperial', () => {
    expect(parseLength('13 ft', 'imperial')).toBeCloseTo(3.962, 3)
    expect(parseLength('1 ft 8 in', 'imperial')).toBeCloseTo(0.508, 3)
    expect(parseLength('20 in', 'imperial')).toBeCloseTo(0.508, 3)
    expect(parseLength('13', 'imperial')).toBeCloseTo(3.962, 3)
  })
  it('returns null for junk', () => {
    expect(parseLength('abc', 'metric')).toBeNull()
    expect(parseLength('', 'metric')).toBeNull()
    expect(parseLength('-3', 'metric')).toBeNull()
  })
})

describe('formatTemp', () => {
  it('uses true minus sign and converts', () => {
    expect(formatTemp(-15, 'metric')).toBe('−15 °C')
    expect(formatTemp(-15, 'imperial')).toBe('5 °F')
    expect(formatTemp(20, 'imperial')).toBe('68 °F')
  })
})

describe('formatLength edge cases', () => {
  it('keeps the sign on the whole figure', () => {
    expect(formatLength(-2.5, 'metric')).toBe('−2.5 m')
    expect(formatLength(-0.4572, 'imperial')).toBe('−1 ft 6 in')
    expect(formatLength(-0.01, 'metric')).toBe('0 m')
    expect(formatLength(-0.001, 'imperial')).toBe('0 in')
  })
  it('shows a dash for a non-number', () => {
    expect(formatLength(NaN, 'metric')).toBe('—')
    expect(formatLength(Infinity, 'imperial')).toBe('—')
  })
})

describe('formatRain', () => {
  it('shows mm or whole inches', () => {
    expect(formatRain(640, 'metric')).toBe('640 mm')
    expect(formatRain(640, 'imperial')).toBe('25 in')
  })
})

describe('Hungarian formats', () => {
  afterEach(() => setLang('en'))
  it('uses a decimal comma only in Hungarian', () => {
    expect(formatLength(2.5, 'metric')).toBe('2.5 m')
    setLang('hu')
    expect(formatLength(2.5, 'metric')).toBe('2,5 m')
    expect(formatLength(4, 'metric')).toBe('4 m')
    expect(formatTemp(-3.5, 'metric')).toBe('−3,5 °C')
    expect(formatRain(612.4, 'metric')).toBe('612 mm')
  })
  it('formatNumber follows the language', () => {
    expect(formatNumber(4.26, 1)).toBe('4.3')
    setLang('hu')
    expect(formatNumber(4.26, 1)).toBe('4,3')
    expect(formatNumber(12345.6, 3)).toBe('12345,600')
  })
  it('parseLength accepts a decimal comma', () => {
    expect(parseLength('2,5', 'metric')).toBe(2.5)
    expect(parseLength('2.5', 'metric')).toBe(2.5)
    expect(parseLength('2,5 m', 'imperial')).toBe(2.5)
    expect(parseLength('1,5', 'imperial')).toBeCloseTo(1.5 * 0.3048)
    expect(parseLength('1,5 ft 2,5 in', 'imperial')).toBeCloseTo(1.5 * 0.3048 + 2.5 * 0.0254)
    setLang('hu')
    expect(parseLength('2,5', 'metric')).toBe(2.5)
  })
  it('rejects a comma followed by exactly three digits (English thousands separator)', () => {
    for (const bad of ['1,000', '1,250', '1,250 m'])
      for (const u of ['metric', 'imperial'] as const) expect(parseLength(bad, u)).toBeNull()
    expect(parseLength('2,25', 'metric')).toBe(2.25)
    expect(parseLength('1,0', 'metric')).toBe(1)
  })
})
