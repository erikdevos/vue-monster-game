import { describe, expect, it } from 'vitest'
import { createRng, randomInt, randomSeed } from './rng'

function sequence(seed: number, length: number): number[] {
  const rng = createRng(seed)
  return Array.from({ length }, () => rng.next())
}

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    expect(sequence(42, 20)).toEqual(sequence(42, 20))
  })

  it('gives different sequences for different seeds', () => {
    expect(sequence(1, 10)).not.toEqual(sequence(2, 10))
  })

  it('stays within [0, 1)', () => {
    for (const value of sequence(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('can continue a sequence from its saved state', () => {
    const first = createRng(99)
    first.next()
    first.next()
    const resumed = createRng(first.getState())
    expect(resumed.next()).toBe(first.next())
  })
})

describe('randomInt', () => {
  it('reaches both bounds and never leaves them', () => {
    const rng = createRng(123)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(randomInt(rng, 12, 20))
    expect(Math.min(...seen)).toBe(12)
    expect(Math.max(...seen)).toBe(20)
    expect(seen.size).toBe(9)
  })

  it('returns the bound when min equals max', () => {
    expect(randomInt(createRng(1), 5, 5)).toBe(5)
  })

  it('maps the extremes of a scripted rng to min and max', () => {
    expect(randomInt({ next: () => 0 }, 3, 7)).toBe(3)
    expect(randomInt({ next: () => 0.999999 }, 3, 7)).toBe(7)
  })
})

describe('randomSeed', () => {
  it('turns a rng value into a uint32 seed', () => {
    expect(randomSeed({ next: () => 0.5 })).toBe(2147483648)
  })
})
