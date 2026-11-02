import { describe, expect, it } from 'vitest'
import { article } from './article'

describe('article', () => {
  it('uses az before a vowel, case-insensitively', () => {
    expect(article('alma')).toBe('az')
    expect(article('Ágyás A')).toBe('az')
    expect(article('őszibarack')).toBe('az')
  })

  it('uses a before a consonant', () => {
    expect(article('paradicsom')).toBe('a')
    expect(article('Ribiszke')).toBe('a')
  })

  it('reads numbers aloud: egy and öt take az', () => {
    expect(article('5 m')).toBe('az')
    expect(article('1 m')).toBe('az')
    expect(article('3 m')).toBe('a')
  })

  it('reads the leading digit group of longer numbers', () => {
    expect(article('10')).toBe('a') // tíz
    expect(article('12')).toBe('a') // tizenkettő
    expect(article('150')).toBe('a') // százötven
    expect(article('50')).toBe('az') // ötven
    expect(article('500')).toBe('az') // ötszáz
    expect(article('1500')).toBe('az') // ezerötszáz
    expect(article('1,5 m')).toBe('az') // egy egész öt
  })
})
