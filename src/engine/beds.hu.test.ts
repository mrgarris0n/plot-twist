import { afterEach, describe, expect, it } from 'vitest'
import { createProject, type ShadeObject } from '../model/project'
import { setLang } from '../strings/lang'
import { nextBedName } from './beds'

const bed = (id: string, name: string): ShadeObject => ({ id, kind: 'bed', name, x: 5, y: 5, widthM: 1.2, lengthM: 2.4, rotationDeg: 0, heightM: 0.3, canopy: null })
const withObjects = (...shadeObjects: ShadeObject[]) => ({ ...createProject('t'), shadeObjects })

afterEach(() => setLang('en'))

describe('nextBedName in Hungarian', () => {
  it('names new beds Ágyás A, then Ágyás B', () => {
    setLang('hu')
    expect(nextBedName(withObjects())).toBe('Ágyás A')
    expect(nextBedName(withObjects(bed('a', 'Ágyás A')))).toBe('Ágyás B')
  })

  it('leaves saved English names alone and checks the Hungarian format', () => {
    setLang('hu')
    expect(nextBedName(withObjects(bed('a', 'Bed A')))).toBe('Ágyás A')
  })
})
