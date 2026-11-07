import { describe, expect, it } from 'vitest'
import { monsters } from '@/data'
import { makeMonster } from '@/test/helpers'
import { shouldFlip } from './facing'
import { filterMonsters } from './filterMonsters'
import { healthLevel, healthPercentage } from './health'
import { effectivenessText } from './text'

describe('filterMonsters', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterMonsters(monsters, '')).toHaveLength(155)
    expect(filterMonsters(monsters, '   ')).toHaveLength(155)
  })

  it('filters on name, case-insensitively', () => {
    expect(filterMonsters(monsters, 'PIKA').map((m) => m.name)).toContain('Pikachu')
    expect(
      filterMonsters(monsters, 'pikachu').every((m) => m.name.toLowerCase().includes('pikachu')),
    ).toBe(true)
  })

  it('filters on type', () => {
    const fire = filterMonsters(monsters, 'FIRE')
    expect(fire.length).toBeGreaterThan(0)
    expect(fire.some((m) => m.type === 'fire')).toBe(true)
  })

  it('filters on number, with or without padding and #', () => {
    expect(filterMonsters(monsters, '0025').map((m) => m.name)).toContain('Pikachu')
    expect(filterMonsters(monsters, '#0025').map((m) => m.name)).toEqual(['Pikachu'])
    expect(filterMonsters(monsters, '#0150').map((m) => m.name)).toEqual(['MewTwo'])
  })

  it('treats the query as plain text, never as a regular expression', () => {
    for (const query of ['(', '[', '*', '\\', '.*', '+', '?', '(abc']) {
      expect(() => filterMonsters(monsters, query)).not.toThrow()
    }
    expect(filterMonsters(monsters, '.*')).toHaveLength(0)
    expect(filterMonsters([makeMonster({ name: 'A(B)' })], '(b)')).toHaveLength(1)
  })
})

describe('health', () => {
  it('calculates a clamped percentage', () => {
    expect(healthPercentage(50, 100)).toBe(50)
    expect(healthPercentage(150, 100)).toBe(100)
    expect(healthPercentage(-5, 100)).toBe(0)
    expect(healthPercentage(10, 0)).toBe(0)
  })

  it('uses the legacy thresholds: red at 30% or less, orange at 50% or less', () => {
    expect(healthLevel(100)).toBe('good')
    expect(healthLevel(51)).toBe('good')
    expect(healthLevel(50)).toBe('warning')
    expect(healthLevel(31)).toBe('warning')
    expect(healthLevel(30)).toBe('danger')
    expect(healthLevel(0)).toBe('danger')
  })
})

describe('shouldFlip (legacy facing rules)', () => {
  it('flips an enemy only when it faces left', () => {
    expect(shouldFlip('enemy', 'left')).toBe(true)
    expect(shouldFlip('enemy', 'right')).toBe(false)
    expect(shouldFlip('enemy', 'center')).toBe(false)
    expect(shouldFlip('enemy', undefined)).toBe(false)
  })

  it('flips a player monster and a trainer only when they face right', () => {
    for (const role of ['player', 'trainer'] as const) {
      expect(shouldFlip(role, 'right')).toBe(true)
      expect(shouldFlip(role, 'left')).toBe(false)
      expect(shouldFlip(role, 'center')).toBe(false)
      expect(shouldFlip(role, undefined)).toBe(false)
    }
  })
})

describe('effectivenessText', () => {
  it('keeps the legacy texts', () => {
    expect(effectivenessText('immune')).toBe('No effect..')
    expect(effectivenessText('notVeryEffective')).toBe('Not very effective..')
    expect(effectivenessText('neutral')).toBe('Neutral effectiveness')
    expect(effectivenessText('superEffective')).toBe('Super effective!')
  })
})
