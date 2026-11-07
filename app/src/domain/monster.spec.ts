import { describe, expect, it } from 'vitest'
import { compareById, formatNumber, MONSTER_TYPES, sortById } from './monster'

describe('formatNumber', () => {
  it('pads to four digits with a leading #', () => {
    expect(formatNumber(1)).toBe('#0001')
    expect(formatNumber(150)).toBe('#0150')
    expect(formatNumber(890)).toBe('#0890')
  })
})

describe('sortById', () => {
  it('sorts numerically, not as strings', () => {
    const sorted = sortById([{ id: 100 }, { id: 20 }, { id: 3 }])
    expect(sorted.map((m) => m.id)).toEqual([3, 20, 100])
    expect(compareById({ id: 9 }, { id: 10 })).toBeLessThan(0)
  })

  it('does not mutate its input', () => {
    const input = [{ id: 2 }, { id: 1 }]
    sortById(input)
    expect(input.map((m) => m.id)).toEqual([2, 1])
  })
})

describe('MONSTER_TYPES', () => {
  it('lists the 18 unique types', () => {
    expect(MONSTER_TYPES).toHaveLength(18)
    expect(new Set(MONSTER_TYPES).size).toBe(18)
  })
})
