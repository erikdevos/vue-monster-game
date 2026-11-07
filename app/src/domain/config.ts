/** Inclusive range for a random roll. */
export interface RollRange {
  min: number
  max: number
}

/**
 * A range that is only usable in certain rounds.
 *
 * The rule (legacy, kept): the action is available when `round % every === 0`, where `round`
 * is the number of player actions taken so far. It is a fixed schedule on the round number,
 * NOT a cooldown after use: using the action does not reset anything, and it is available
 * right away in round 0 (before the first action). Taking a different action in between
 * still moves the schedule along.
 */
export interface GatedRollRange extends RollRange {
  every: number
}

/** How damage (base roll times type multiplier) becomes a whole number. */
export type DamageRounding = 'none' | 'round' | 'floor' | 'ceil'

export interface DamageRules {
  /** `none` keeps fractions (legacy: a 0.5 multiplier on an odd roll gave 6.5). */
  rounding: DamageRounding
  /** Smallest damage of a hit that is not immune (multiplier 0). Use 0 to switch off. */
  minimumDamage: number
}

export interface HealRules extends GatedRollRange {
  /** Legacy allowed healing at full health (it restored nothing but still cost the round). */
  allowAtFullHealth: boolean
}

/**
 * All balance numbers and switches in one place. Every GAMEPLAY CHANGE with respect to the
 * legacy game is a value here, so it can be switched back one by one (see LEGACY_BATTLE_CONFIG).
 */
export interface BattleConfig {
  playerAttack: RollRange
  enemyAttack: RollRange
  /** Special attack: available every third round (round % 3 === 0), including round 0. */
  specialAttack: GatedRollRange
  /** Heal: available every second round (round % 2 === 0), including round 0. */
  heal: HealRules
  damage: DamageRules
}

export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  playerAttack: { min: 12, max: 20 },
  enemyAttack: { min: 18, max: 25 },
  specialAttack: { min: 15, max: 25, every: 3 },
  heal: { min: 25, max: 35, every: 2, allowAtFullHealth: false }, // gameplay change: was true
  damage: { rounding: 'round', minimumDamage: 1 }, // gameplay change: was 'none' / 0
}

/** The rules exactly as the legacy game had them. */
export const LEGACY_BATTLE_CONFIG: BattleConfig = {
  ...DEFAULT_BATTLE_CONFIG,
  heal: { ...DEFAULT_BATTLE_CONFIG.heal, allowAtFullHealth: true },
  damage: { rounding: 'none', minimumDamage: 0 },
}
