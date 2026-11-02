import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { en, english } from './en'
import { hungarian } from './hu'
import { setLang } from './lang'

afterEach(() => setLang('en'))

describe('live strings', () => {
  it('en reads the active language', () => {
    expect(en.settings.button).toBe(english.settings.button)
    setLang('hu')
    expect(en.settings.button).toBe(hungarian.settings.button)
    expect(en.warnings).toBe(hungarian.warnings)
    expect(Object.keys(en.layers)).toEqual(Object.keys(hungarian.layers))
  })
})

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'strings' ? [] : sourceFiles(path)
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe('module-level string captures', () => {
  it('no module-level string captures', () => {
    // A top-level statement starts at column 0 and ends when brackets balance. Statements that define
    // functions or components read `en.` lazily, so they are skipped; type and import lines have no reads.
    const bad: string[] = []
    for (const file of sourceFiles('src')) {
      let depth = 0
      let stmt: { line: number; text: string } | null = null
      const check = () => {
        const t = stmt!.text.replace(/Object\.keys\(en\./g, '')
        if (/\ben\./.test(t) && !/=>|\bfunction\b|\bclass\b|^(import|export type|type|interface)\b/.test(t)) bad.push(`${file}:${stmt!.line}: ${t.split('\n')[0].trim()}`)
        stmt = null
      }
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, '')
        if (depth === 0 && /^\S/.test(code) && !/^[})\]]/.test(code)) stmt = { line: i + 1, text: '' }
        if (stmt) stmt.text += code + '\n'
        for (const ch of code) depth += ch === '{' || ch === '(' || ch === '[' ? 1 : ch === '}' || ch === ')' || ch === ']' ? -1 : 0
        if (stmt && depth === 0) check()
      })
    }
    expect(bad).toEqual([])
  })
})
