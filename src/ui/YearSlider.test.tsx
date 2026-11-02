import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { YearSlider } from './YearSlider'

beforeEach(() => {
  useStore.getState().openProject(createProject('Test'))
})

describe('YearSlider', () => {
  it('is a 0-20 range named "Years from now", labelled Now at 0', () => {
    render(<YearSlider />)
    const s = screen.getByRole('slider', { name: en.year.label })
    expect(en.year.label).toBe('Years from now')
    expect(s).toHaveAttribute('min', '0')
    expect(s).toHaveAttribute('max', '20')
    expect(s).toHaveAttribute('aria-valuetext', 'Now')
    expect(screen.getByText('Now')).toBeInTheDocument()
  })
  it('labels year 5 as "Year 5"', () => {
    useStore.getState().setYear(5)
    render(<YearSlider />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Year 5')
    expect(screen.getByText('Year 5')).toBeInTheDocument()
  })
  // jsdom does not step a native range on ArrowRight, so the browser's keyboard/drag change is simulated with a change event.
  it('changing the value to 1 sets the year to 1', () => {
    render(<YearSlider />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    expect(useStore.getState().project?.settings.year).toBe(1)
  })
})
