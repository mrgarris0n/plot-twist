import { localizeDecimal } from '../strings/lang'
import type { Units } from './project'

const M_PER_IN = 0.0254
const M_PER_FT = 0.3048
const MINUS = '−'

function trimDecimal(n: number): string {
  return localizeDecimal(String(Math.round(n * 10) / 10))
}

/** Negative lengths keep their sign on the whole figure ("−1 ft 6 in"); a non-number shows as a dash. */
export function formatLength(m: number, units: Units): string {
  if (!Number.isFinite(m)) return '—'
  const a = Math.abs(m)
  if (units === 'metric') return `${m < 0 && Math.round(a * 10) > 0 ? MINUS : ''}${trimDecimal(a)} m`
  const totalIn = Math.round(a / M_PER_IN)
  const sign = m < 0 && totalIn > 0 ? MINUS : ''
  const ft = Math.floor(totalIn / 12)
  const inch = totalIn % 12
  if (ft === 0) return `${sign}${inch} in`
  if (inch === 0) return `${sign}${ft} ft`
  return `${sign}${ft} ft ${inch} in`
}

const NUM = '(\\d+(?:[.,]\\d+)?|[.,]\\d+)'
const METRIC_RE = new RegExp(`^${NUM}\\s*(?:m)?$`, 'i')
const FT_IN_RE = new RegExp(`^(?:${NUM}\\s*(?:ft|')\\s*)?(?:${NUM}\\s*(?:in|")\\s*)?$`, 'i')
const BARE_RE = new RegExp(`^${NUM}$`)
/** "1,000" is an English thousands separator, not a decimal comma: refuse it rather than misread it. */
const THOUSANDS_RE = /\d,\d{3}(?!\d)/
const num = (s: string | undefined): number => Number((s ?? '0').replace(',', '.'))

/** Bare numbers are read in the active unit system (metres or feet). Returns metres. */
export function parseLength(input: string, units: Units): number | null {
  const s = input.trim()
  if (!s) return null
  if (THOUSANDS_RE.test(s)) return null
  const metric = METRIC_RE.exec(s)
  if (metric) {
    if (units === 'metric' || /m$/i.test(s)) return num(metric[1])
  }
  if (units === 'metric') return null
  const bare = BARE_RE.exec(s)
  if (bare) return num(bare[1]) * M_PER_FT
  const m = FT_IN_RE.exec(s)
  if (!m || (m[1] === undefined && m[2] === undefined)) return null
  return num(m[1]) * M_PER_FT + num(m[2]) * M_PER_IN
}

export function formatTemp(c: number, units: Units): string {
  const v = units === 'metric' ? Math.round(c * 10) / 10 : Math.round((c * 9) / 5 + 32)
  const body = localizeDecimal(String(Math.abs(v)))
  return `${v < 0 ? MINUS : ''}${body} ${units === 'metric' ? '°C' : '°F'}`
}

/** An area (stored in m²) to one decimal, in m² or ft². */
export function formatArea(m2: number, units: Units): string {
  return units === 'metric' ? `${trimDecimal(m2)} m²` : `${trimDecimal(m2 / (M_PER_FT * M_PER_FT))} ft²`
}

/** Rainfall (stored in mm) as whole mm or whole inches, or to one decimal with `tenths`. */
export function formatRain(mm: number, units: Units, tenths = false): string {
  const v = units === 'metric' ? mm : mm / 25.4
  return `${tenths ? trimDecimal(v) : Math.round(v)} ${units === 'metric' ? 'mm' : 'in'}`
}
