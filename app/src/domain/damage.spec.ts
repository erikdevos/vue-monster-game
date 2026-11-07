import { describe, expect, it } from 'vitest'
import { applyDamage, applyHeal, calculateDamage, rollInRange } from './damage'

describe('calculateDamage', () => {
  it('multiplies the base damage by the type multiplier', () => {
    expect(calculateDamage(20, 2)).toBe(40)
    expect(calculateDamage(20, 1)).toBe(20)
    expect(calculateDamage(20, 0.5)).toBe(10)
    expect(calculateDamage(20, 0)).toBe(0)
  })

  it('rounds to a whole number by default (halves go up)', () => {
    expect(calculateDamage(13, 0.5)).toBe(7)
    expect(calculateDamage(15, 0.5)).toBe(8)
    expect(Number.isInteger(calculateDamage(17, 0.5))).toBe(true)
  })

  it('keeps fractions with rounding none (legacy)', () => {
    expect(calculateDamage(13, 0.5, { rounding: 'none', minimumDamage: 0 })).toBe(6.5)
  })

  it('supports floor and ceil', () => {
    expect(calculateDamage(13, 0.5, { rounding: 'floor', minimumDamage: 0 })).toBe(6)
    expect(calculateDamage(13, 0.5, { rounding: 'ceil', minimumDamage: 0 })).toBe(7)
  })

  it('applies a minimum damage except against immunity', () => {
    const rules = { rounding: 'floor', minimumDamage: 1 } as const
    expect(calculateDamage(1, 0.5, rules)).toBe(1)
    expect(calculateDamage(20, 0, rules)).toBe(0)
    expect(calculateDamage(20, 0, { rounding: 'none', minimumDamage: 5 })).toBe(0)
  })
})

describe('applyDamage', () => {
  it('subtracts damage', () => {
    expect(applyDamage(100, 30)).toBe(70)
  })

  it('never goes below 0', () => {
    expect(applyDamage(10, 50)).toBe(0)
    expect(applyDamage(0, 5)).toBe(0)
  })
})

describe('applyHeal', () => {
  it('adds healing', () => {
    expect(applyHeal(50, 100, 30)).toBe(80)
  })

  it('is capped at max HP', () => {
    expect(applyHeal(90, 100, 30)).toBe(100)
    expect(applyHeal(100, 100, 30)).toBe(100)
  })
})

describe('rollInRange', () => {
  it('stays within the inclusive range', () => {
    expect(rollInRange({ next: () => 0 }, { min: 12, max: 20 })).toBe(12)
    expect(rollInRange({ next: () => 0.999999 }, { min: 12, max: 20 })).toBe(20)
  })
})
