import { render, screen } from '@testing-library/react'
import { clear } from 'idb-keyval'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { createProject } from '../model/project'
import { useStore } from '../state/store'
import { saveProject } from '../storage/db'
import { setLang } from '../strings/lang'
import { GardensDialog } from './GardensDialog'

beforeEach(async () => {
  await clear()
  useStore.getState().closeProject()
  await saveProject(createProject('My garden'))
})
afterEach(() => setLang('en'))

it('gardens list date in Hungarian format', async () => {
  setLang('hu')
  render(<GardensDialog onClose={() => {}} />)
  const hint = (await screen.findByText('My garden')).parentElement!.querySelector('.hint')!
  expect(hint.textContent).toMatch(/\d{4}\. \d{2}\. \d{2}\.$/)
})

it('gardens list date keeps the default locale in English', async () => {
  render(<GardensDialog onClose={() => {}} />)
  const hint = (await screen.findByText('My garden')).parentElement!.querySelector('.hint')!
  expect(hint.textContent).toContain(new Date().toLocaleDateString())
})
