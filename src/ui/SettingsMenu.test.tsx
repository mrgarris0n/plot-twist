import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { getLang, setLang } from '../strings/lang'
import { SettingsMenu } from './SettingsMenu'

beforeEach(() => {
  localStorage.clear()
  setLang('en')
  useStore.getState().closeProject()
})
afterEach(() => {
  setLang('en')
  localStorage.clear()
})

it('language radios switch the language', () => {
  render(<SettingsMenu showUnits={false} />)
  expect(screen.getByRole('radio', { name: en.settings.langNames.en })).toBeChecked()
  fireEvent.click(screen.getByRole('radio', { name: en.settings.langNames.hu }))
  expect(getLang()).toBe('hu')
  expect(localStorage.getItem('plottwist.lang')).toBe('hu')
})

it('without units, only the language section shows, even with no open garden', () => {
  render(<SettingsMenu showUnits={false} />)
  expect(screen.getByText(en.settings.language)).toBeInTheDocument()
  expect(screen.queryByText(en.settings.units)).toBeNull()
})

it('editor settings still show units and language', () => {
  useStore.getState().openProject(createProject('G'))
  render(<SettingsMenu />)
  expect(screen.getByText(en.settings.units)).toBeInTheDocument()
  expect(screen.getByText(en.settings.language)).toBeInTheDocument()
})

it('renders nothing without a garden when units are wanted', () => {
  const { container } = render(<SettingsMenu />)
  expect(container).toBeEmptyDOMElement()
})
