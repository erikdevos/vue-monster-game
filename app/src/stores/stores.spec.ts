import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { monsters } from '@/data'
import { createRng } from '@/domain/rng'
import { makeMonster } from '@/test/helpers'
import { useBattleStore } from './battle'
import { DEFAULT_PLAYER_NAME, GAME_STORAGE_KEY, MAX_NAME_LENGTH, useGameStore } from './game'

beforeEach(() => {
  window.sessionStorage.clear()
  setActivePinia(createPinia())
})

describe('game store', () => {
  it('starts empty with the default name', () => {
    const game = useGameStore()
    expect(game.playerName).toBe(DEFAULT_PLAYER_NAME)
    expect(game.trainer).toBeNull()
    expect(game.partner).toBeNull()
    expect(game.enemy).toBeNull()
    expect(game.stage).toBeNull()
    expect(game.isReadyForBattle).toBe(false)
  })

  it('stores the player, partner, enemy and stage', () => {
    const game = useGameStore()
    game.setPlayer('  Ash ', 2)
    game.choosePartner(25)
    game.chooseEnemy(6)
    game.chooseStage('ocean')
    expect(game.playerName).toBe('Ash')
    expect(game.trainer?.alias).toBe('Misty')
    expect(game.partner?.name).toBe('Pikachu')
    expect(game.enemy?.name).toBe('Charizard')
    expect(game.stage?.name).toBe('Ocean')
    expect(game.isReadyForBattle).toBe(true)
  })

  it('falls back to the default name for an empty name', () => {
    const game = useGameStore()
    game.setPlayer('   ', 1)
    expect(game.playerName).toBe(DEFAULT_PLAYER_NAME)
  })

  it('picks a random monster with the injected rng', () => {
    const game = useGameStore()
    game.choosePartner('random', { next: () => 0 })
    expect(game.partner?.id).toBe(1)
    game.chooseEnemy('random', { next: () => 0.999999 })
    expect(game.enemy?.id).toBe(890)

    const a = useGameStore()
    a.choosePartner('random', createRng(5))
    const first = a.partnerId
    a.choosePartner('random', createRng(5))
    expect(a.partnerId).toBe(first)
  })

  it('persists in sessionStorage and restores after a refresh', () => {
    const game = useGameStore()
    game.setPlayer('Ash', 4)
    game.choosePartner(25)
    game.chooseEnemy(6)
    game.chooseStage('forest')

    setActivePinia(createPinia()) // a new page load
    const restored = useGameStore()
    expect(restored.playerName).toBe('Ash')
    expect(restored.trainerId).toBe(4)
    expect(restored.partnerId).toBe(25)
    expect(restored.enemyId).toBe(6)
    expect(restored.stageId).toBe('forest')
  })

  it('ignores unusable persisted data', () => {
    window.sessionStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        playerName: 5,
        trainerId: 999,
        partnerId: 99999,
        enemyId: 'x',
        stageId: 'moon',
      }),
    )
    const game = useGameStore()
    expect(game.playerName).toBe(DEFAULT_PLAYER_NAME)
    expect(game.trainerId).toBeNull()
    expect(game.partnerId).toBeNull()
    expect(game.enemyId).toBeNull()
    expect(game.stageId).toBeNull()

    window.sessionStorage.setItem(GAME_STORAGE_KEY, '{not json')
    setActivePinia(createPinia())
    expect(useGameStore().trainerId).toBeNull()
  })

  it('keeps working when sessionStorage throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const game = useGameStore()
    expect(() => game.setPlayer('Ash', 1)).not.toThrow()
    expect(game.trainerId).toBe(1)
    getItem.mockRestore()
    setItem.mockRestore()
  })

  it('reset() clears everything, also in storage', () => {
    const game = useGameStore()
    game.setPlayer('Ash', 4)
    game.choosePartner(25)
    game.reset()
    expect(game.playerName).toBe(DEFAULT_PLAYER_NAME)
    expect(game.trainer).toBeNull()
    expect(game.partner).toBeNull()
    expect(window.sessionStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
  })
})

describe('game store with broken or outdated sessionStorage', () => {
  const load = (value: unknown) => {
    window.sessionStorage.setItem(
      GAME_STORAGE_KEY,
      typeof value === 'string' ? value : JSON.stringify(value),
    )
    setActivePinia(createPinia())
    return useGameStore()
  }

  it.each([
    ['null', 'null'],
    ['an array', '[1,2,3]'],
    ['a number', '42'],
    ['a string', '"hello"'],
    ['an empty object', '{}'],
    ['broken JSON', '{"partnerId": 25'],
    ['an empty string', ''],
  ])('starts empty for %s', (_name, raw) => {
    const game = load(raw)
    expect(game.playerName).toBe(DEFAULT_PLAYER_NAME)
    expect(game.isReadyForBattle).toBe(false)
    expect(game.trainer).toBeNull()
  })

  it('keeps what is valid and drops what is not (partly missing or wrong fields)', () => {
    const game = load({
      playerName: 'Ash',
      trainerId: 2,
      partnerId: 25,
      enemyId: 'six',
      stageId: null,
    })
    expect(game.playerName).toBe('Ash')
    expect(game.trainer?.alias).toBe('Misty')
    expect(game.partner?.name).toBe('Pikachu')
    expect(game.enemy).toBeNull()
    expect(game.stage).toBeNull()
  })

  it.each([
    ['unknown ids', { partnerId: 9999, enemyId: -1, trainerId: 3 }], // 3 = the removed trainer Alice
    ['fractions', { partnerId: 25.5, enemyId: 6.1 }],
    ['wrong types', { partnerId: [25], enemyId: { id: 6 }, trainerId: '1', stageId: 5 }],
    ['not-a-number values', { partnerId: null, enemyId: NaN, trainerId: Infinity }],
  ])('ignores %s', (_name, saved) => {
    const game = load(saved)
    expect(game.partner).toBeNull()
    expect(game.enemy).toBeNull()
    expect(game.trainer).toBeNull()
    expect(game.stage).toBeNull()
  })

  it('caps a very long or blank saved name', () => {
    expect(load({ playerName: 'x'.repeat(5000) }).playerName).toHaveLength(MAX_NAME_LENGTH)
    expect(load({ playerName: '    ' }).playerName).toBe(DEFAULT_PLAYER_NAME)
    expect(load({ playerName: 12 }).playerName).toBe(DEFAULT_PLAYER_NAME)
  })

  it('caps a long name typed in as well', () => {
    const game = useGameStore()
    game.setPlayer('y'.repeat(100), 1)
    expect(game.playerName).toHaveLength(MAX_NAME_LENGTH)
  })

  it('does not trust a stage that no longer exists', () => {
    expect(load({ stageId: 'moon' }).stage).toBeNull()
  })
})

describe('battle store', () => {
  const start = (seed = 1) => {
    const battle = useBattleStore()
    battle.start({
      player: makeMonster({ name: 'Mine' }),
      enemy: makeMonster({ id: 2, name: 'Theirs', image: '002.png' }),
      playerName: 'Ash',
      seed,
    })
    return battle
  }

  it('starts with the opening event queued and the display at full health', () => {
    const battle = start()
    expect(battle.state?.phase).toBe('awaitingPlayer')
    expect(battle.queue.map((e) => e.type)).toEqual(['battleStarted'])
    expect(battle.display?.player).toMatchObject({ hp: 500, maxHp: 500, knockedOut: false })
    expect(battle.availableActions).toContain('attack')
  })

  it('queues the events of an action without moving the display', () => {
    const battle = start()
    battle.queue = []
    const result = battle.dispatch({ type: 'attack' })
    expect(result.ok).toBe(true)
    expect(battle.queue.map((e) => e.type)).toEqual([
      'attack',
      'effectiveness',
      'attack',
      'effectiveness',
    ])
    expect(battle.display?.enemy.hp).toBe(500)
    expect(battle.state?.enemy.hp).toBeLessThan(500)
  })

  it('moves the display and the log forward event by event', () => {
    const battle = start()
    battle.queue = []
    battle.dispatch({ type: 'attack' })
    const hpAfter = battle.state!.enemy.hp
    for (let event = battle.shiftEvent(); event; event = battle.shiftEvent())
      battle.applyEvent(event)

    expect(battle.display?.enemy.hp).toBe(hpAfter)
    expect(battle.log).toHaveLength(2)
    // Newest first: the enemy's counter-attack on top.
    expect(battle.log[0]).toMatchObject({
      actor: 'enemy',
      attackerName: 'Theirs',
      effectiveness: 'neutral',
    })
    expect(battle.log[1]).toMatchObject({
      actor: 'player',
      attackerName: "Ash's Mine",
      effectiveness: 'neutral',
    })
  })

  it('rejects invalid actions without touching the queue', () => {
    const battle = start()
    battle.queue = []
    battle.dispatch({ type: 'attack' })
    battle.queue = []
    const result = battle.dispatch({ type: 'specialAttack' }) // round 1: not available
    expect(result.ok).toBe(false)
    expect(battle.queue).toHaveLength(0)
  })

  it('knows when the battle has ended and who won', () => {
    const battle = start()
    battle.queue = []
    battle.dispatch({ type: 'run' })
    expect(battle.isEnded).toBe(true)
    expect(battle.outcome).toEqual({ winner: 'enemy', reason: 'run' })
    expect(battle.availableActions).toEqual([])
  })

  it('reset() clears everything and bumps the epoch', () => {
    const battle = start()
    const epoch = battle.epoch
    battle.reset()
    expect(battle.state).toBeNull()
    expect(battle.display).toBeNull()
    expect(battle.queue).toEqual([])
    expect(battle.log).toEqual([])
    expect(battle.epoch).toBeGreaterThan(epoch)
  })

  it('shows a copying Ditto as Ditto until the transformed event is applied', () => {
    const battle = useBattleStore()
    battle.start({
      player: makeMonster({
        id: 132,
        name: 'Ditto',
        image: '132.png',
        health: 80,
        ability: 'copy',
        facing: 'left',
      }),
      enemy: makeMonster({
        id: 6,
        name: 'Charizard',
        image: '006.png',
        health: 180,
        size: 'xl',
        facing: 'right',
      }),
      playerName: 'Ash',
      seed: 1,
    })
    expect(battle.display?.player.monster.image).toBe('132.png')
    for (let event = battle.shiftEvent(); event; event = battle.shiftEvent()) {
      battle.applyEvent(event)
      if (event.type === 'battleStarted')
        expect(battle.display?.player.monster.image).toBe('132.png')
    }
    expect(battle.display?.player.monster).toMatchObject({
      name: 'Ditto',
      image: '006.png',
      size: 'xl',
      facing: 'right', // the copied monster's facing, not Ditto's own
    })
    expect(battle.display?.player.maxHp).toBe(180)
  })

  it('shows the engine state when playback is cut short (syncDisplayToState)', () => {
    const battle = start()
    battle.queue = []
    battle.dispatch({ type: 'attack' })
    battle.syncDisplayToState()
    expect(battle.queue).toEqual([])
    expect(battle.display?.enemy.hp).toBe(battle.state!.enemy.hp)
    expect(battle.display?.player.hp).toBe(battle.state!.player.hp)
  })

  it('marks a knocked out side when syncing', () => {
    const battle = useBattleStore()
    battle.start({
      player: makeMonster(),
      enemy: makeMonster({ id: 2, health: 1 }),
      playerName: 'Ash',
      seed: 1,
    })
    battle.dispatch({ type: 'attack' })
    battle.syncDisplayToState()
    expect(battle.display?.enemy).toMatchObject({ hp: 0, knockedOut: true })
    expect(battle.display?.player.knockedOut).toBe(false)
  })

  it('gives one complete log line per hit, after its effectiveness is known', () => {
    const battle = start()
    battle.queue = []
    battle.dispatch({ type: 'attack' })
    const [attack, effectiveness] = [battle.shiftEvent()!, battle.shiftEvent()!]
    battle.applyEvent(attack)
    expect(battle.log).toHaveLength(0) // not yet: the line would be incomplete
    battle.applyEvent(effectiveness)
    expect(battle.log).toHaveLength(1)
    expect(battle.log[0]?.effectiveness).toBe('neutral')
  })

  it('lets Ditto face a Ditto, and the same monster face itself', () => {
    const ditto = monsters.find((m) => m.ability === 'copy')!
    const battle = useBattleStore()
    battle.start({ player: ditto, enemy: ditto, playerName: 'Ash', seed: 1 })
    for (let event = battle.shiftEvent(); event; event = battle.shiftEvent())
      battle.applyEvent(event)
    expect(battle.display?.player).toMatchObject({ hp: 80, maxHp: 80 })
    expect(battle.display?.player.monster.name).toBe('Ditto')
    expect(battle.display?.enemy.monster.name).toBe('Ditto')
    battle.dispatch({ type: 'attack' })
    expect(battle.state?.phase).toBeDefined()
  })

  it('has the availability with reasons for the UI', () => {
    const battle = start()
    expect(battle.availability?.heal).toEqual({ available: false, reason: { code: 'fullHealth' } })
    expect(battle.availability?.attack).toEqual({ available: true })
    battle.reset()
    expect(battle.availability).toBeNull()
  })
})
