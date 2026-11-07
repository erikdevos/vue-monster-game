import { describe, expect, it } from 'vitest'
import { monsters } from '@/data'
import {
  battleReducer,
  createBattle,
  getActionAvailability,
  getAvailableActions,
  type BattleAction,
  type BattleEvent,
  type BattleState,
} from './battle'
import { DEFAULT_BATTLE_CONFIG, LEGACY_BATTLE_CONFIG, type BattleConfig } from './config'
import type { Monster } from './monster'

/** Every roll has a single possible value, so scenarios are exact. */
const FIXED: BattleConfig = {
  ...DEFAULT_BATTLE_CONFIG,
  playerAttack: { min: 20, max: 20 },
  enemyAttack: { min: 10, max: 10 },
  specialAttack: { min: 25, max: 25, every: 3 },
  heal: { min: 30, max: 30, every: 2, allowAtFullHealth: false },
}

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return {
    id: 1,
    name: 'Testmon',
    image: '001.png',
    health: 100,
    size: 'm',
    type: 'normal',
    ...overrides,
  }
}

function start(
  overrides: { player?: Partial<Monster>; enemy?: Partial<Monster>; seed?: number } = {},
  config: BattleConfig = FIXED,
) {
  return createBattle({
    player: makeMonster({ name: 'Player', ...overrides.player }),
    enemy: makeMonster({ id: 2, name: 'Enemy', image: '002.png', ...overrides.enemy }),
    seed: overrides.seed ?? 1,
    config,
  })
}

/** Applies an action and asserts it was accepted. */
function act(state: BattleState, action: BattleAction) {
  const result = battleReducer(state, action)
  if (!result.ok) throw new Error(`rejected: ${result.error.message}`)
  return result
}

function withHp(state: BattleState, side: 'player' | 'enemy', hp: number): BattleState {
  return { ...state, [side]: { ...state[side], hp } }
}

const types = (events: BattleEvent[]) => events.map((e) => e.type)

describe('createBattle', () => {
  it('starts awaiting the player at round 0 with full HP', () => {
    const { state, events } = start({ player: { health: 80 }, enemy: { health: 120 } })
    expect(state).toMatchObject({ phase: 'awaitingPlayer', round: 0 })
    expect(state.player).toMatchObject({ hp: 80, maxHp: 80 })
    expect(state.enemy).toMatchObject({ hp: 120, maxHp: 120 })
    expect(events).toEqual([{ type: 'battleStarted', playerMaxHp: 80, enemyMaxHp: 120 }])
  })

  it('lets Ditto copy the enemy HP and looks, and nothing else', () => {
    const ditto = monsters.find((m) => m.ability === 'copy')!
    const enemy = monsters.find((m) => m.name === 'Charizard')!
    const { state, events } = createBattle({ player: ditto, enemy, seed: 1 })

    expect(state.player).toMatchObject({ hp: enemy.health, maxHp: enemy.health })
    expect(state.player.monster).toMatchObject({
      id: ditto.id,
      name: 'Ditto',
      type: ditto.type,
      image: enemy.image,
      size: enemy.size,
    })
    expect(types(events)).toEqual(['battleStarted', 'transformed'])
    expect(events[1]).toEqual({
      type: 'transformed',
      side: 'player',
      into: { image: enemy.image, size: enemy.size, maxHp: enemy.health },
    })
  })

  it('does not copy when the player monster has no copy ability', () => {
    const { events, state } = start()
    expect(types(events)).not.toContain('transformed')
    expect(state.player.monster.image).toBe('001.png')
  })

  it('copies the max HP of the enemy that is chosen, whatever it is', () => {
    const ditto = monsters.find((m) => m.ability === 'copy')!
    const { state } = createBattle({ player: ditto, enemy: makeMonster({ health: 33 }), seed: 1 })
    expect(state.player.maxHp).toBe(33)
  })
})

describe('attack', () => {
  it('deals damage, then the enemy strikes back', () => {
    const result = act(start().state, { type: 'attack' })
    expect(result.state).toMatchObject({ phase: 'awaitingPlayer', round: 1 })
    expect(result.state.enemy.hp).toBe(80)
    expect(result.state.player.hp).toBe(90)
    expect(types(result.events)).toEqual(['attack', 'effectiveness', 'attack', 'effectiveness'])
    expect(result.events[0]).toEqual({
      type: 'attack',
      actor: 'player',
      target: 'enemy',
      baseDamage: 20,
      multiplier: 1,
      damage: 20,
      targetHpBefore: 100,
      targetHpAfter: 80,
    })
    expect(result.events[2]).toMatchObject({ type: 'attack', actor: 'enemy', damage: 10 })
  })

  it('applies the type multiplier in both directions', () => {
    const { state } = start({ player: { type: 'fire' }, enemy: { type: 'grass' } })
    const result = act(state, { type: 'attack' })
    // fire -> grass is super effective (x2); grass -> fire is not very effective (x0.5)
    expect(result.state.enemy.hp).toBe(100 - 40)
    expect(result.state.player.hp).toBe(100 - 5)
    expect(result.events[1]).toMatchObject({ type: 'effectiveness', label: 'superEffective' })
    expect(result.events[3]).toMatchObject({ type: 'effectiveness', label: 'notVeryEffective' })
  })

  it('deals no damage to an immune target', () => {
    const { state } = start({ player: { type: 'normal' }, enemy: { type: 'ghost' } })
    const result = act(state, { type: 'attack' })
    expect(result.state.enemy.hp).toBe(100)
    expect(result.events[1]).toMatchObject({ label: 'immune', multiplier: 0 })
  })

  it('rounds fractional damage to a whole number (gameplay change: legacy gave 6.5)', () => {
    const config = { ...FIXED, playerAttack: { min: 13, max: 13 } }
    const { state } = start({ player: { type: 'fire' }, enemy: { type: 'water' } }, config)
    const result = act(state, { type: 'attack' })
    expect(result.state.enemy.hp).toBe(100 - 7) // 13 x 0.5 = 6.5, rounded up
    expect(Number.isInteger(result.state.enemy.hp)).toBe(true)
  })

  it('keeps fractions with the legacy config', () => {
    const config = { ...LEGACY_BATTLE_CONFIG, playerAttack: { min: 13, max: 13 } }
    const { state } = start({ player: { type: 'fire' }, enemy: { type: 'water' } }, config)
    expect(act(state, { type: 'attack' }).state.enemy.hp).toBe(100 - 6.5)
  })

  it('always shows whole numbers in HP and events over many seeds', () => {
    for (let seed = 0; seed < 100; seed++) {
      const { state } = start(
        { seed, player: { type: 'fire' }, enemy: { type: 'water' } },
        DEFAULT_BATTLE_CONFIG,
      )
      const result = act(state, { type: 'attack' })
      expect(Number.isInteger(result.state.enemy.hp)).toBe(true)
      expect(Number.isInteger(result.state.player.hp)).toBe(true)
      for (const event of result.events) {
        if (event.type === 'attack') expect(Number.isInteger(event.damage)).toBe(true)
      }
    }
  })
})

describe('winning and losing', () => {
  it('ends with a player win and no counter-attack when the enemy is knocked out', () => {
    const { state } = start()
    const result = act(withHp(state, 'enemy', 20), { type: 'attack' })

    expect(result.state.phase).toBe('ended')
    expect(result.state.enemy.hp).toBe(0)
    expect(result.state.player.hp).toBe(100)
    expect(types(result.events)).toEqual(['attack', 'effectiveness', 'knockedOut', 'battleEnded'])
    expect(result.events.at(-1)).toEqual({
      type: 'battleEnded',
      winner: 'player',
      reason: 'knockout',
    })
    expect(result.state).toMatchObject({ outcome: { winner: 'player', reason: 'knockout' } })
  })

  it('never lets HP drop below 0 (overkill)', () => {
    const { state } = start()
    const result = act(withHp(state, 'enemy', 5), { type: 'attack' })
    expect(result.state.enemy.hp).toBe(0)
    expect(result.events[0]).toMatchObject({ damage: 20, targetHpBefore: 5, targetHpAfter: 0 })
  })

  it('ends with an enemy win when the player is knocked out by the counter-attack', () => {
    const { state } = start()
    const result = act(withHp(state, 'player', 10), { type: 'attack' })

    expect(result.state.phase).toBe('ended')
    expect(result.state.player.hp).toBe(0)
    expect(types(result.events)).toEqual([
      'attack',
      'effectiveness',
      'attack',
      'effectiveness',
      'knockedOut',
      'battleEnded',
    ])
    expect(result.events.at(-1)).toEqual({
      type: 'battleEnded',
      winner: 'enemy',
      reason: 'knockout',
    })
  })

  it('cannot end in a draw: the player strikes first and a dead enemy does not strike back', () => {
    const { state } = start()
    const both = withHp(withHp(state, 'player', 1), 'enemy', 1)
    const result = act(both, { type: 'attack' })
    expect(result.state).toMatchObject({ outcome: { winner: 'player' } })
    expect(result.state.player.hp).toBe(1)
  })

  it('plays a whole battle to a finish', () => {
    let state = start().state
    let guard = 0
    while (state.phase !== 'ended' && guard++ < 50) {
      state = act(state, { type: 'attack' }).state
    }
    // Player deals 20 per hit against 100 HP, enemy 10 per hit: player wins in 5 rounds.
    expect(state).toMatchObject({ phase: 'ended', round: 5, outcome: { winner: 'player' } })
    expect(state.player.hp).toBe(60)
  })
})

describe('special attack availability and damage', () => {
  it('is available in round 0, not in rounds 1 and 2, and again in round 3', () => {
    let state = start().state
    const availability: boolean[] = []
    for (let i = 0; i < 4; i++) {
      availability.push(getAvailableActions(state).includes('specialAttack'))
      state = act(state, { type: 'attack' }).state
    }
    expect(availability).toEqual([true, false, false, true])
  })

  it('deals special damage and then the enemy strikes back', () => {
    const result = act(start().state, { type: 'specialAttack' })
    expect(types(result.events)).toEqual([
      'specialAttack',
      'effectiveness',
      'attack',
      'effectiveness',
    ])
    expect(result.events[0]).toMatchObject({ type: 'specialAttack', baseDamage: 25, damage: 25 })
    expect(result.state.enemy.hp).toBe(75)
    expect(result.state.round).toBe(1)
  })

  it('is rejected in the wrong round, leaving the state untouched', () => {
    const afterOne = act(start().state, { type: 'attack' }).state
    const result = battleReducer(afterOne, { type: 'specialAttack' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('specialAttackUnavailable')
      expect(result.error.reason).toEqual({ code: 'notThisRound', roundsLeft: 2 })
      expect(result.error.message).toContain('round')
    }
    expect(result.state).toBe(afterOne)
  })

  it('wins the battle when it knocks the enemy out', () => {
    const { state } = start()
    const result = act(withHp(state, 'enemy', 25), { type: 'specialAttack' })
    expect(result.state).toMatchObject({ phase: 'ended', outcome: { winner: 'player' } })
    expect(result.state.player.hp).toBe(100)
  })
})

describe('heal', () => {
  it('is available in even rounds, when there is something to heal', () => {
    let state = start().state
    const availability: boolean[] = []
    for (let i = 0; i < 4; i++) {
      availability.push(getAvailableActions(state).includes('heal'))
      state = act(state, { type: 'attack' }).state
    }
    // Round 0: full health (not allowed, gameplay change). Round 1 and 3: odd. Round 2: even and hurt.
    expect(availability).toEqual([false, false, true, false])
  })

  it('restores HP, then the enemy strikes back', () => {
    const { state } = start()
    const result = act(withHp(state, 'player', 50), { type: 'heal' })
    expect(result.events[0]).toEqual({
      type: 'heal',
      actor: 'player',
      rolled: 30,
      healed: 30,
      hpBefore: 50,
      hpAfter: 80,
    })
    expect(types(result.events)).toEqual(['heal', 'attack', 'effectiveness'])
    expect(result.state.player.hp).toBe(80 - 10)
    expect(result.state.enemy.hp).toBe(100)
    expect(result.state.round).toBe(1)
  })

  it('is capped at max HP but reports the roll', () => {
    const { state } = start()
    const result = act(withHp(state, 'player', 90), { type: 'heal' })
    expect(result.events[0]).toMatchObject({ rolled: 30, healed: 10, hpAfter: 100 })
    expect(result.state.player.hp).toBe(100 - 10)
  })

  it('is not possible at full health (gameplay change), with the reason', () => {
    const { state } = start()
    const result = battleReducer(state, { type: 'heal' })
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'healUnavailable', reason: { code: 'fullHealth' } },
    })
    expect(result.state).toBe(state)
  })

  it('is allowed at full health in round 0 with the legacy config and restores nothing', () => {
    const { state } = start(
      {},
      { ...LEGACY_BATTLE_CONFIG, heal: { ...FIXED.heal, allowAtFullHealth: true } },
    )
    const result = act(state, { type: 'heal' })
    expect(result.events[0]).toMatchObject({ type: 'heal', healed: 0, hpBefore: 100, hpAfter: 100 })
  })

  it('is rejected in odd rounds', () => {
    const afterOne = act(start().state, { type: 'attack' }).state
    const result = battleReducer(afterOne, { type: 'heal' })
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'healUnavailable', reason: { code: 'notThisRound', roundsLeft: 1 } },
    })
    expect(result.state).toBe(afterOne)
  })

  it('heals a copying Ditto up to the copied max HP', () => {
    const ditto = monsters.find((m) => m.ability === 'copy')!
    const { state } = createBattle({
      player: ditto,
      enemy: makeMonster({ health: 200 }),
      seed: 1,
      config: FIXED,
    })
    const result = act(withHp(state, 'player', 190), { type: 'heal' })
    expect(result.events[0]).toMatchObject({ healed: 10, hpAfter: 200 })
  })
})

describe('run', () => {
  it('ends the battle as a loss with its own reason', () => {
    const result = act(start().state, { type: 'run' })
    expect(types(result.events)).toEqual(['run', 'battleEnded'])
    expect(result.events[1]).toEqual({ type: 'battleEnded', winner: 'enemy', reason: 'run' })
    expect(result.state).toMatchObject({
      phase: 'ended',
      outcome: { winner: 'enemy', reason: 'run' },
    })
  })

  it('is always available while the battle is on', () => {
    const afterOne = act(start().state, { type: 'attack' }).state
    expect(getAvailableActions(afterOne)).toContain('run')
    expect(act(afterOne, { type: 'run' }).state.phase).toBe('ended')
  })
})

describe('actions after the end', () => {
  it.each<BattleAction>([
    { type: 'attack' },
    { type: 'specialAttack' },
    { type: 'heal' },
    { type: 'run' },
  ])('rejects %j', (action) => {
    const ended = act(start().state, { type: 'run' }).state
    const result = battleReducer(ended, action)
    expect(result).toMatchObject({ ok: false, error: { code: 'battleEnded' } })
    expect(result.state).toBe(ended)
  })

  it('offers no actions', () => {
    const ended = act(start().state, { type: 'run' }).state
    expect(getAvailableActions(ended)).toEqual([])
  })
})

describe('determinism and purity', () => {
  function play(seed: number) {
    let state = start({ seed }, DEFAULT_BATTLE_CONFIG).state
    const log: BattleEvent[] = []
    for (let i = 0; i < 30 && state.phase !== 'ended'; i++) {
      const [first] = getAvailableActions(state)
      const result = act(state, { type: first ?? 'attack' })
      state = result.state
      log.push(...result.events)
    }
    return { state, log }
  }

  it('gives identical results for the same seed', () => {
    expect(play(2024)).toEqual(play(2024))
  })

  it('gives different results for different seeds', () => {
    expect(play(1).log).not.toEqual(play(2).log)
  })

  it('does not mutate the state it is given', () => {
    const { state } = start()
    const snapshot = structuredClone(state)
    act(state, { type: 'attack' })
    expect(state).toEqual(snapshot)
  })

  it('stays within the configured roll ranges over many seeds', () => {
    for (let seed = 0; seed < 200; seed++) {
      const { events } = act(start({ seed }, DEFAULT_BATTLE_CONFIG).state, { type: 'attack' })
      const [playerHit, , enemyHit] = events
      if (playerHit?.type !== 'attack' || enemyHit?.type !== 'attack') throw new Error('no hits')
      expect(playerHit.baseDamage).toBeGreaterThanOrEqual(12)
      expect(playerHit.baseDamage).toBeLessThanOrEqual(20)
      expect(enemyHit.baseDamage).toBeGreaterThanOrEqual(18)
      expect(enemyHit.baseDamage).toBeLessThanOrEqual(25)
    }
  })

  it('stays within the configured special attack and heal ranges over many seeds', () => {
    for (let seed = 0; seed < 200; seed++) {
      const special = act(start({ seed }, DEFAULT_BATTLE_CONFIG).state, { type: 'specialAttack' })
      expect(special.events[0]).toMatchObject({ type: 'specialAttack' })
      const hit = special.events[0]
      if (hit?.type !== 'specialAttack') throw new Error('no special attack')
      expect(hit.baseDamage).toBeGreaterThanOrEqual(15)
      expect(hit.baseDamage).toBeLessThanOrEqual(25)

      const damaged = withHp(start({ seed }, DEFAULT_BATTLE_CONFIG).state, 'player', 10)
      const healed = act(damaged, { type: 'heal' })
      const heal = healed.events[0]
      if (heal?.type !== 'heal') throw new Error('no heal')
      expect(heal.rolled).toBeGreaterThanOrEqual(25)
      expect(heal.rolled).toBeLessThanOrEqual(35)
    }
  })

  it('keeps HP within 0..maxHp through random playouts', () => {
    for (let seed = 0; seed < 100; seed++) {
      let state = start(
        { seed, player: { type: 'fire' }, enemy: { type: 'water' } },
        DEFAULT_BATTLE_CONFIG,
      ).state
      for (let i = 0; i < 100 && state.phase !== 'ended'; i++) {
        const actions = getAvailableActions(state).filter((a) => a !== 'run')
        const pick = actions[seed % actions.length] ?? 'attack'
        state = act(state, { type: pick }).state
        for (const side of [state.player, state.enemy]) {
          expect(side.hp).toBeGreaterThanOrEqual(0)
          expect(side.hp).toBeLessThanOrEqual(side.maxHp)
        }
      }
    }
  })
})

describe('availability with reasons', () => {
  it('reports every action as available or with a reason', () => {
    const { state } = start()
    expect(getActionAvailability(state)).toEqual({
      attack: { available: true },
      run: { available: true },
      specialAttack: { available: true }, // round 0
      heal: { available: false, reason: { code: 'fullHealth' } },
    })
  })

  it('counts the rounds until a gated action is available again', () => {
    let state = start().state
    state = act(state, { type: 'attack' }).state // round 1
    expect(getActionAvailability(state).specialAttack).toEqual({
      available: false,
      reason: { code: 'notThisRound', roundsLeft: 2 },
    })
    expect(getActionAvailability(state).heal).toEqual({
      available: false,
      reason: { code: 'notThisRound', roundsLeft: 1 },
    })
    state = act(state, { type: 'attack' }).state // round 2
    expect(getActionAvailability(state).specialAttack).toEqual({
      available: false,
      reason: { code: 'notThisRound', roundsLeft: 1 },
    })
    expect(getActionAvailability(state).heal).toEqual({ available: true })
    state = act(state, { type: 'attack' }).state // round 3
    expect(getActionAvailability(state).specialAttack).toEqual({ available: true })
  })

  it('is a schedule on the round number, not a cooldown after use', () => {
    let state = start().state
    state = act(state, { type: 'specialAttack' }).state // used in round 0 ...
    state = act(state, { type: 'attack' }).state // round 2
    state = act(state, { type: 'attack' }).state // round 3: available again, as before
    expect(getActionAvailability(state).specialAttack.available).toBe(true)
  })

  it('names the full health reason before the round, because waiting will not help', () => {
    const { state } = start()
    const round1 = { ...state, round: 1 }
    expect(getActionAvailability(round1).heal).toEqual({
      available: false,
      reason: { code: 'fullHealth' },
    })
  })

  it('offers nothing but a reason once the battle has ended', () => {
    const ended = act(start().state, { type: 'run' }).state
    for (const availability of Object.values(getActionAvailability(ended))) {
      expect(availability).toEqual({ available: false, reason: { code: 'battleEnded' } })
    }
  })

  it('follows the round schedule from the config', () => {
    const config = { ...FIXED, specialAttack: { ...FIXED.specialAttack, every: 2 } }
    let state = start({}, config).state
    state = act(state, { type: 'attack' }).state
    expect(getActionAvailability(state).specialAttack).toEqual({
      available: false,
      reason: { code: 'notThisRound', roundsLeft: 1 },
    })
  })
})

describe('odd matchups', () => {
  it('lets Ditto copy a Ditto', () => {
    const ditto = monsters.find((m) => m.ability === 'copy')!
    const { state, events } = createBattle({ player: ditto, enemy: ditto, seed: 1, config: FIXED })
    expect(state.player).toMatchObject({ hp: 80, maxHp: 80 })
    expect(events.map((e) => e.type)).toEqual(['battleStarted', 'transformed'])
    const result = act(state, { type: 'attack' })
    expect(result.state.enemy.hp).toBe(80 - 20)
    expect(result.state.player.hp).toBe(80 - 10)
  })

  it('handles the same monster on both sides', () => {
    const pikachu = monsters.find((m) => m.name === 'Pikachu')!
    let { state } = createBattle({ player: pikachu, enemy: pikachu, seed: 5 })
    for (let i = 0; i < 50 && state.phase !== 'ended'; i++)
      state = act(state, { type: 'attack' }).state
    expect(state.phase).toBe('ended')
    // Electric against electric is not very effective, and the minimum damage still applies.
    expect(state.player.hp).toBeGreaterThanOrEqual(0)
    expect(state.enemy.hp).toBeGreaterThanOrEqual(0)
  })

  it('applies the minimum damage to a not very effective hit but never to an immune one', () => {
    const config = {
      ...FIXED,
      playerAttack: { min: 1, max: 1 },
      damage: { rounding: 'floor' as const, minimumDamage: 1 },
    }
    const resisted = act(
      start({ player: { type: 'fire' }, enemy: { type: 'water' } }, config).state,
      {
        type: 'attack',
      },
    )
    expect(resisted.state.enemy.hp).toBe(99) // 1 x 0.5 floors to 0, minimum 1
    const immune = act(
      start({ player: { type: 'normal' }, enemy: { type: 'ghost' } }, config).state,
      {
        type: 'attack',
      },
    )
    expect(immune.state.enemy.hp).toBe(100)
  })
})
