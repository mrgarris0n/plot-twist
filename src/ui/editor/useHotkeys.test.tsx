import { fireEvent, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../model/project'
import { useStore } from '../../state/store'
import { useHotkeys } from './useHotkeys'

const key = (k: string, opts: Partial<KeyboardEventInit> = {}, target: Element | Window = window) => fireEvent.keyDown(target, { key: k, ...opts })
const s = () => useStore.getState()
let plant = ''

beforeEach(() => {
  s().openProject(createProject('t'))
  plant = s().placePlant('apple', { x: 5, y: 5 })
  s().select(plant)
})

describe('useHotkeys', () => {
  it('Delete removes the selected plant', () => {
    renderHook(() => useHotkeys(true))
    key('Delete')
    expect(s().project!.plants).toEqual([])
    expect(s().selectedId).toBeNull()
  })

  it('Ctrl+D duplicates 1 m away and selects the copy', () => {
    renderHook(() => useHotkeys(true))
    key('d', { ctrlKey: true })
    const [a, b] = s().project!.plants
    expect([b!.x - a!.x, b!.y - a!.y]).toEqual([1, 1])
    expect(s().selectedId).toBe(b!.id)
  })

  it('arrows nudge 10 cm, Shift 1 m; up is towards the top of the plan', () => {
    renderHook(() => useHotkeys(true))
    key('ArrowRight')
    key('ArrowUp', { shiftKey: true })
    const p = s().project!.plants[0]!
    expect(p.x).toBeCloseTo(5.1)
    expect(p.y).toBeCloseTo(4)
  })

  it('Escape deselects', () => {
    renderHook(() => useHotkeys(true))
    key('Escape')
    expect(s().selectedId).toBeNull()
  })

  it('ignores keys while typing and when disabled', () => {
    const input = document.body.appendChild(document.createElement('input'))
    const { rerender } = renderHook(({ on }) => useHotkeys(on), { initialProps: { on: true } })
    key('Delete', {}, input)
    expect(s().project!.plants).toHaveLength(1)
    rerender({ on: false })
    key('Delete')
    expect(s().project!.plants).toHaveLength(1)
    input.remove()
  })

  it('Delete on a bed with plants asks first', () => {
    s().update((p) => { p.gardenType = 'veggie-beds' })
    const bed = s().addShadeObject('bed', { x: 5, y: 5 })
    s().select(bed)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderHook(() => useHotkeys(true))
    key('Backspace')
    expect(confirm).toHaveBeenCalledOnce()
    expect(s().project!.shadeObjects).toHaveLength(1)
    confirm.mockRestore()
  })
})

describe('duplicate', () => {
  it('copies a bed with a new name and no plants', () => {
    s().update((p) => { p.gardenType = 'veggie-beds' })
    const bed = s().addShadeObject('bed', { x: 5, y: 5 })
    const copy = s().duplicate(bed, 0)!
    const [a, b] = s().project!.shadeObjects
    expect(b!.id).toBe(copy)
    expect([b!.x, b!.y, b!.widthM]).toEqual([a!.x, a!.y, a!.widthM])
    expect(b!.name).not.toBe(a!.name)
    expect(s().project!.plants).toHaveLength(1)
  })
})
