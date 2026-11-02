import { describe, expect, it } from 'vitest'
import { createProject } from '../model/project'
import { en } from '../strings/en'
import { exportProject, parseProjectFile, slug } from './file'

describe('project files', () => {
  it('round-trips except id', async () => {
    const p = createProject('Back yard')
    const { filename, blob } = exportProject(p)
    expect(filename).toBe('back-yard.plottwist.json')
    const r = parseProjectFile(await blob.text())
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.project.id).not.toBe(p.id)
      expect({ ...r.project, id: p.id }).toEqual(p)
    }
  })
  it('slug', () => {
    expect(slug('  Ünï!! ')).toBe('uni')
    expect(slug('Kert Győr')).toBe('kert-gyor')
    expect(slug('我的花园')).toBe('我的花园')
    expect(slug('###')).toBe('garden')
  })
  it('rejects non-JSON and schema failures', () => {
    expect(parseProjectFile('nope')).toEqual({ ok: false, error: en.import.notJson })
    expect(parseProjectFile('{"a":1}')).toEqual({ ok: false, error: en.import.notJson })
    expect(parseProjectFile('null')).toEqual({ ok: false, error: en.import.notJson })
  })
  it('rejects oversized', () => {
    expect(parseProjectFile(' '.repeat(5 * 1024 * 1024 + 1))).toEqual({ ok: false, error: en.import.notJson })
  })
  it('newer schema version', () => {
    const text = JSON.stringify({ ...createProject('x'), schemaVersion: 2 })
    expect(parseProjectFile(text)).toEqual({ ok: false, error: en.import.newer })
  })
  it('same file twice gives different ids', () => {
    const text = JSON.stringify(createProject('x'))
    const a = parseProjectFile(text)
    const b = parseProjectFile(text)
    expect(a.ok && b.ok && a.project.id !== b.project.id).toBe(true)
  })
})
