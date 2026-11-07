import { DEFAULT_BATTLE_CONFIG, type BattleConfig, type DamageRules } from './config'
import { applyDamage, applyHeal, calculateDamage, rollInRange } from './damage'
import type { Monster, MonsterSize } from './monster'
import { createRng, type Rng } from './rng'
import { getEffectiveness, type EffectivenessResult, type Multiplier } from './typeChart'

export type Side = 'player' | 'enemy'

export interface Combatant {
  /** The monster as it fights. For a Ditto that copied its opponent, image and size are the opponent's. */
  monster: Monster
  hp: number
  maxHp: number
}

interface BattleBase {
  player: Combatant
  enemy: Combatant
  /** Number of player actions taken so far. Starts at 0. Gates special attack and heal. */
  round: number
  /** Internal state of the seeded RNG; makes the whole battle replayable and serializable. */
  rngState: number
  config: BattleConfig
}

export type BattleOutcome = {
  winner: Side
  /**
   * `knockout`: a monster ran out of hit points.
   * `run`: the player ran away. Counts as a loss (as in the legacy game) but is a distinct reason.
   *
   * A draw does not exist: the enemy only strikes back when it is still standing after the
   * player's action, so both can never reach 0 hit points. (In the legacy game the draw branches
   * were dead code.)
   */
  reason: 'knockout' | 'run'
}

export type BattleState =
  | (BattleBase & { phase: 'awaitingPlayer' })
  | (BattleBase & { phase: 'ended'; outcome: BattleOutcome })

export type BattleAction =
  { type: 'attack' } | { type: 'specialAttack' } | { type: 'heal' } | { type: 'run' }

/** Plain data describing what happened, for the UI to play back (log, animations). */
export type BattleEvent =
  | { type: 'battleStarted'; playerMaxHp: number; enemyMaxHp: number }
  | {
      /** Ditto's `copy` ability: HP and looks are copied from the opponent. */
      type: 'transformed'
      side: Side
      into: { image: string; size: MonsterSize; maxHp: number }
    }
  | ({ type: 'attack' | 'specialAttack' } & DamageDetails)
  | ({ type: 'effectiveness'; actor: Side; target: Side } & EffectivenessResult)
  | {
      type: 'heal'
      actor: Side
      /** The roll. Can exceed `healed` when the heal was capped at max HP (the legacy log showed this value). */
      rolled: number
      /** Hit points actually restored (0 at full health). */
      healed: number
      hpBefore: number
      hpAfter: number
    }
  | { type: 'knockedOut'; side: Side }
  | { type: 'run'; actor: Side }
  | ({ type: 'battleEnded' } & BattleOutcome)

interface DamageDetails {
  actor: Side
  target: Side
  baseDamage: number
  multiplier: Multiplier
  damage: number
  targetHpBefore: number
  targetHpAfter: number
}

export type BattleErrorCode = 'battleEnded' | 'specialAttackUnavailable' | 'healUnavailable'

/** Why an action cannot be chosen right now. Texts for the player belong in the UI layer. */
export type UnavailableReason =
  | { code: 'battleEnded' }
  /** Not this round. A schedule on the round number, not a cooldown after use. */
  | { code: 'notThisRound'; roundsLeft: number }
  | { code: 'fullHealth' }

export type ActionAvailability =
  { available: true } | { available: false; reason: UnavailableReason }

export interface BattleError {
  code: BattleErrorCode
  message: string
  reason: UnavailableReason
}

/** Result of the reducer. A rejected action returns the unchanged state and an error. */
export type BattleResult =
  | { ok: true; state: BattleState; events: BattleEvent[] }
  | { ok: false; state: BattleState; error: BattleError }

export interface CreateBattleOptions {
  player: Monster
  enemy: Monster
  seed: number
  config?: BattleConfig
}

/** Sets up a battle. Applies the `copy` ability (Ditto) when the player monster has it. */
export function createBattle(options: CreateBattleOptions): {
  state: BattleState
  events: BattleEvent[]
} {
  const { player, enemy, seed, config = DEFAULT_BATTLE_CONFIG } = options
  const events: BattleEvent[] = []

  let playerMonster = player
  let playerMaxHp = player.health
  if (player.ability === 'copy') {
    playerMonster = { ...player, image: enemy.image, size: enemy.size }
    playerMaxHp = enemy.health
  }

  const state: BattleState = {
    phase: 'awaitingPlayer',
    player: { monster: playerMonster, hp: playerMaxHp, maxHp: playerMaxHp },
    enemy: { monster: enemy, hp: enemy.health, maxHp: enemy.health },
    round: 0,
    rngState: createRng(seed).getState(),
    config,
  }

  events.push({ type: 'battleStarted', playerMaxHp, enemyMaxHp: enemy.health })
  if (player.ability === 'copy') {
    events.push({
      type: 'transformed',
      side: 'player',
      into: { image: enemy.image, size: enemy.size, maxHp: enemy.health },
    })
  }
  return { state, events }
}

export type ActionType = BattleAction['type']

const AVAILABLE: ActionAvailability = { available: true }

function unavailable(reason: UnavailableReason): ActionAvailability {
  return { available: false, reason }
}

/** Rounds until `round % every === 0` again (0 when it is that round already). */
function roundsUntil(round: number, every: number): number {
  const rest = round % every
  return rest === 0 ? 0 : every - rest
}

/** For every action: whether it can be chosen, and if not, why. */
export function getActionAvailability(state: BattleState): Record<ActionType, ActionAvailability> {
  if (state.phase === 'ended') {
    const ended = unavailable({ code: 'battleEnded' })
    return { attack: ended, specialAttack: ended, heal: ended, run: ended }
  }

  const { specialAttack, heal } = state.config
  const specialWait = roundsUntil(state.round, specialAttack.every)
  const healWait = roundsUntil(state.round, heal.every)
  const atFullHealth = state.player.hp >= state.player.maxHp

  return {
    attack: AVAILABLE,
    run: AVAILABLE,
    specialAttack:
      specialWait === 0
        ? AVAILABLE
        : unavailable({ code: 'notThisRound', roundsLeft: specialWait }),
    heal:
      atFullHealth && !heal.allowAtFullHealth
        ? unavailable({ code: 'fullHealth' })
        : healWait === 0
          ? AVAILABLE
          : unavailable({ code: 'notThisRound', roundsLeft: healWait }),
  }
}

/** Which actions the player may choose right now. Empty when the battle has ended. */
export function getAvailableActions(state: BattleState): ActionType[] {
  const availability = getActionAvailability(state)
  return (['attack', 'specialAttack', 'heal', 'run'] as const).filter(
    (type) => availability[type].available,
  )
}

export function isSpecialAttackAvailable(state: BattleState): boolean {
  return getActionAvailability(state).specialAttack.available
}

export function isHealAvailable(state: BattleState): boolean {
  return getActionAvailability(state).heal.available
}

function describe(reason: UnavailableReason, state: BattleState, action: string): string {
  switch (reason.code) {
    case 'battleEnded':
      return 'The battle has already ended.'
    case 'fullHealth':
      return 'Heal is not possible at full health.'
    case 'notThisRound':
      return `${action} is not available this round (round ${state.round}, available in ${reason.roundsLeft}).`
  }
}

function reject(
  state: BattleState,
  code: BattleErrorCode,
  reason: UnavailableReason,
  action: string,
): BattleResult {
  return { ok: false, state, error: { code, reason, message: describe(reason, state, action) } }
}

/**
 * The battle state machine. One call is one atomic step: a player action plus, when the enemy
 * is still standing, its counter-attack. No timers: the UI decides when to play the events.
 */
export function battleReducer(state: BattleState, action: BattleAction): BattleResult {
  const availability = getActionAvailability(state)[action.type]
  if (!availability.available) {
    const code: BattleErrorCode =
      availability.reason.code === 'battleEnded'
        ? 'battleEnded'
        : action.type === 'heal'
          ? 'healUnavailable'
          : 'specialAttackUnavailable'
    return reject(
      state,
      code,
      availability.reason,
      action.type === 'heal' ? 'Heal' : 'Special attack',
    )
  }
  if (state.phase === 'ended') return reject(state, 'battleEnded', { code: 'battleEnded' }, '')

  const rng = createRng(state.rngState)
  const events: BattleEvent[] = []

  if (action.type === 'run') {
    events.push({ type: 'run', actor: 'player' })
    return finish(state, state.round, rng, events, { winner: 'enemy', reason: 'run' })
  }

  const round = state.round + 1
  let player = state.player
  let enemy = state.enemy

  if (action.type === 'heal') {
    const rolled = rollInRange(rng, state.config.heal)
    const hpAfter = applyHeal(player.hp, player.maxHp, rolled)
    events.push({
      type: 'heal',
      actor: 'player',
      rolled,
      healed: hpAfter - player.hp,
      hpBefore: player.hp,
      hpAfter,
    })
    player = { ...player, hp: hpAfter }
  } else {
    const range = action.type === 'attack' ? state.config.playerAttack : state.config.specialAttack
    const hit = strike(rng, 'player', player, enemy, range, action.type, state.config.damage)
    events.push(...hit.events)
    enemy = { ...enemy, hp: hit.targetHp }
  }

  const afterPlayer: BattleState = { ...state, player, enemy, round }
  if (enemy.hp <= 0) {
    events.push({ type: 'knockedOut', side: 'enemy' })
    return finish(afterPlayer, round, rng, events, { winner: 'player', reason: 'knockout' })
  }

  // The enemy only strikes back when it is still standing.
  const counter = strike(
    rng,
    'enemy',
    enemy,
    player,
    state.config.enemyAttack,
    'attack',
    state.config.damage,
  )
  events.push(...counter.events)
  player = { ...player, hp: counter.targetHp }

  const afterEnemy: BattleState = { ...afterPlayer, player }
  if (player.hp <= 0) {
    events.push({ type: 'knockedOut', side: 'player' })
    return finish(afterEnemy, round, rng, events, { winner: 'enemy', reason: 'knockout' })
  }

  return {
    ok: true,
    state: { ...afterEnemy, phase: 'awaitingPlayer', rngState: rng.getState() },
    events,
  }
}

function strike(
  rng: Rng,
  actor: Side,
  attacker: Combatant,
  target: Combatant,
  range: { min: number; max: number },
  type: 'attack' | 'specialAttack',
  rules: DamageRules,
): { events: BattleEvent[]; targetHp: number } {
  const targetSide: Side = actor === 'player' ? 'enemy' : 'player'
  const baseDamage = rollInRange(rng, range)
  const effectiveness = getEffectiveness(attacker.monster.type, target.monster.type)
  const damage = calculateDamage(baseDamage, effectiveness.multiplier, rules)
  const targetHp = applyDamage(target.hp, damage)
  return {
    targetHp,
    events: [
      {
        type,
        actor,
        target: targetSide,
        baseDamage,
        multiplier: effectiveness.multiplier,
        damage,
        targetHpBefore: target.hp,
        targetHpAfter: targetHp,
      },
      { type: 'effectiveness', actor, target: targetSide, ...effectiveness },
    ],
  }
}

function finish(
  state: BattleState,
  round: number,
  rng: { getState(): number },
  events: BattleEvent[],
  outcome: BattleOutcome,
): BattleResult {
  events.push({ type: 'battleEnded', ...outcome })
  return {
    ok: true,
    state: { ...state, round, rngState: rng.getState(), phase: 'ended', outcome },
    events,
  }
}
