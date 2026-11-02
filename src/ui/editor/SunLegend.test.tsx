import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { en } from '../../strings/en'
import { SunLegend } from './SunOverlay'

it('explains cloud loss when cloud is known', () => {
  render(<SunLegend cloudWarmPct={70} view="hours" slopeNote={null} />)
  const t = screen.getByRole('list').textContent ?? ''
  expect(t).toContain('70%')
  expect(t).toContain('30%')
})

it('has no cloud line when cloud is unknown', () => {
  render(<SunLegend cloudWarmPct={null} view="hours" slopeNote={null} />)
  expect(screen.getByRole('list').textContent).not.toMatch(/Clouds/)
})

it('strength view lists the four bands and the note', () => {
  render(<SunLegend cloudWarmPct={70} view="strength" slopeNote={null} />)
  const t = screen.getByRole('list').textContent ?? ''
  for (const b of Object.values(en.overlay.strength)) expect(t).toContain(b)
  expect(t).toContain(en.overlay.strengthNote)
  expect(t).not.toContain(en.overlay.full)
})

it('hours view unchanged', () => {
  render(<SunLegend cloudWarmPct={null} view="hours" slopeNote={null} />)
  const t = screen.getByRole('list').textContent ?? ''
  expect(t).toContain(en.overlay.full)
  expect(t).not.toContain(en.overlay.strengthNote)
})

it('slope note shows percent more for a south slope', () => {
  const note = en.overlay.slopeGain('strong', 'south', 8, true)
  render(<SunLegend cloudWarmPct={null} view="hours" slopeNote={note} />)
  expect(screen.getByRole('list').textContent).toContain('Your strong south-facing slope catches about 8% more sun than flat ground here.')
})
