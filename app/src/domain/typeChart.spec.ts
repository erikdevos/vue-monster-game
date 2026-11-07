import { describe, expect, it } from 'vitest'
import { MONSTER_TYPES, type MonsterType } from './monster'
import { Effectiveness, getEffectiveness, TYPE_CHART, type Multiplier } from './typeChart'

/**
 * Independent source of truth: the official Gen 6+ type chart, per attacker.
 * Anything not listed is neutral (1).
 */
const OFFICIAL: Record<
  MonsterType,
  { superEffective: MonsterType[]; notVeryEffective: MonsterType[]; immune: MonsterType[] }
> = {
  normal: { superEffective: [], notVeryEffective: ['rock', 'steel'], immune: ['ghost'] },
  fire: {
    superEffective: ['grass', 'ice', 'bug', 'steel'],
    notVeryEffective: ['fire', 'water', 'rock', 'dragon'],
    immune: [],
  },
  water: {
    superEffective: ['fire', 'ground', 'rock'],
    notVeryEffective: ['water', 'grass', 'dragon'],
    immune: [],
  },
  electric: {
    superEffective: ['water', 'flying'],
    notVeryEffective: ['electric', 'grass', 'dragon'],
    immune: ['ground'],
  },
  grass: {
    superEffective: ['water', 'ground', 'rock'],
    notVeryEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
    immune: [],
  },
  ice: {
    superEffective: ['grass', 'ground', 'flying', 'dragon'],
    notVeryEffective: ['fire', 'water', 'ice', 'steel'],
    immune: [],
  },
  fighting: {
    superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'],
    notVeryEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
    immune: ['ghost'],
  },
  poison: {
    superEffective: ['grass', 'fairy'],
    notVeryEffective: ['poison', 'ground', 'rock', 'ghost'],
    immune: ['steel'],
  },
  ground: {
    superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'],
    notVeryEffective: ['grass', 'bug'],
    immune: ['flying'],
  },
  flying: {
    superEffective: ['grass', 'fighting', 'bug'],
    notVeryEffective: ['electric', 'rock', 'steel'],
    immune: [],
  },
  psychic: {
    superEffective: ['fighting', 'poison'],
    notVeryEffective: ['psychic', 'steel'],
    immune: ['dark'],
  },
  bug: {
    superEffective: ['grass', 'psychic', 'dark'],
    notVeryEffective: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    immune: [],
  },
  rock: {
    superEffective: ['fire', 'ice', 'flying', 'bug'],
    notVeryEffective: ['fighting', 'ground', 'steel'],
    immune: [],
  },
  ghost: { superEffective: ['psychic', 'ghost'], notVeryEffective: ['dark'], immune: ['normal'] },
  dragon: { superEffective: ['dragon'], notVeryEffective: ['steel'], immune: ['fairy'] },
  dark: {
    superEffective: ['psychic', 'ghost'],
    notVeryEffective: ['fighting', 'dark', 'fairy'],
    immune: [],
  },
  steel: {
    superEffective: ['ice', 'rock', 'fairy'],
    notVeryEffective: ['fire', 'water', 'electric', 'steel'],
    immune: [],
  },
  fairy: {
    superEffective: ['fighting', 'dragon', 'dark'],
    notVeryEffective: ['fire', 'poison', 'steel'],
    immune: [],
  },
}

function expectedMultiplier(attacker: MonsterType, defender: MonsterType): Multiplier {
  const row = OFFICIAL[attacker]
  if (row.immune.includes(defender)) return 0
  if (row.notVeryEffective.includes(defender)) return 0.5
  if (row.superEffective.includes(defender)) return 2
  return 1
}

const EXPECTED_LABEL: Record<Multiplier, Effectiveness> = {
  0: Effectiveness.Immune,
  0.5: Effectiveness.NotVeryEffective,
  1: Effectiveness.Neutral,
  2: Effectiveness.SuperEffective,
}

describe('type chart', () => {
  it('covers all 18 x 18 combinations', () => {
    expect(Object.keys(TYPE_CHART)).toHaveLength(18)
    for (const attacker of MONSTER_TYPES) {
      expect(Object.keys(TYPE_CHART[attacker])).toHaveLength(18)
    }
  })

  it('matches the official chart for every one of the 324 combinations', () => {
    let compared = 0
    for (const attacker of MONSTER_TYPES) {
      for (const defender of MONSTER_TYPES) {
        const expected = expectedMultiplier(attacker, defender)
        expect(TYPE_CHART[attacker][defender], `${attacker} -> ${defender}`).toBe(expected)
        expect(getEffectiveness(attacker, defender), `${attacker} -> ${defender}`).toEqual({
          multiplier: expected,
          label: EXPECTED_LABEL[expected],
        })
        compared++
      }
    }
    expect(compared).toBe(324)
  })

  it('uses the attacker perspective (spot checks)', () => {
    expect(getEffectiveness('fire', 'grass').label).toBe(Effectiveness.SuperEffective)
    expect(getEffectiveness('grass', 'fire').label).toBe(Effectiveness.NotVeryEffective)
    expect(getEffectiveness('normal', 'ghost').label).toBe(Effectiveness.Immune)
    expect(getEffectiveness('electric', 'electric').label).toBe(Effectiveness.NotVeryEffective)
    expect(getEffectiveness('normal', 'normal').label).toBe(Effectiveness.Neutral)
  })
})
