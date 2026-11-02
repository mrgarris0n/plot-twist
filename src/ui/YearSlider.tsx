import { Hourglass } from 'lucide-react'
import { useStore } from '../state/store'
import { en } from '../strings/en'

/** "Years from now" slider, 0 to 20. Plants and the sun view follow settings.year. */
export function YearSlider() {
  const year = useStore((s) => s.project?.settings.year)
  const setYear = useStore((s) => s.setYear)
  if (year === undefined) return null
  const text = en.year.value(year)
  return (
    <label className="year-slider tip" data-tip={en.year.label}>
      <Hourglass aria-hidden="true" size={18} />
      <input type="range" min={0} max={20} step={1} value={year} aria-label={en.year.label} aria-valuetext={text} onChange={(e) => setYear(Number(e.target.value))} />
      <span className="year-value">{text}</span>
    </label>
  )
}
