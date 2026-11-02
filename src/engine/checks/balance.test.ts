import { describe, expect, it } from 'vitest'
import { createProject } from '../../model/project'
import { fixtureLibrary, fixturePlant } from '../../test/fixtures'
import { balanceHints } from './balance'
import { place } from './test-helpers'

const lib = fixtureLibrary(
  fixturePlant({ id: 'apple', commonNames: ['Apple'], layer: 'canopy' }),
  fixturePlant({ id: 'currant', commonNames: ['Black currant'], layer: 'shrub' }),
  fixturePlant({ id: 'clover', commonNames: ['White clover'], layer: 'ground-cover', roles: ['nitrogen-fixer'] }),
)

describe('balanceHints', () => {
  it('apple + 2 shrubs without a nitrogen fixer → nitrogen hint', () => {
    const p = createProject('t')
    p.plants.push(place('a', 'apple', 5, 5), place('c1', 'currant', 2, 2), place('c2', 'currant', 8, 8))
    const hint = balanceHints(p, lib).find((w) => w.key === 'balance:nitrogen')
    expect(hint).toMatchObject({ type: 'balance', severity: 'hint', plantIds: [], startYear: null, fix: null })
  })
  it('adding white clover removes the nitrogen and ground cover hints', () => {
    const p = createProject('t')
    p.plants.push(place('a', 'apple', 5, 5), place('c1', 'currant', 2, 2), place('c2', 'currant', 8, 8), place('w', 'clover', 5, 6))
    expect(balanceHints(p, lib)).toEqual([])
  })
  it('no hints for fewer than 3 plants or without a tree', () => {
    const p = createProject('t')
    p.plants.push(place('a', 'apple', 5, 5), place('c1', 'currant', 2, 2))
    expect(balanceHints(p, lib)).toEqual([])
    p.plants = [place('c1', 'currant', 2, 2), place('c2', 'currant', 4, 4), place('c3', 'currant', 6, 6)]
    expect(balanceHints(p, lib)).toEqual([])
  })
})
