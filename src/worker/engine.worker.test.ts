import { afterEach, describe, expect, it } from 'vitest'
import { getLang, setLang } from '../strings/lang'
import { api } from './engine.worker'
import { createProject } from '../model/project'

afterEach(() => setLang('en'))

describe('engine worker api', () => {
  it('worker api sets the language before analysing', async () => {
    expect(getLang()).toBe('en')
    await api.analyze(createProject('x'), 'hu')
    expect(getLang()).toBe('hu')
  })
})
