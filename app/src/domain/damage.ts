import { DEFAULT_BATTLE_CONFIG, type DamageRules, type RollRange } from './config'
import { randomInt, type Rng } from './rng'
import type { Multiplier } from './typeChart'

/** Rolls a base value (damage or healing) within an inclusive range. */
export function rollInRange(rng: Rng, range: RollRange): number {
  return randomInt(rng, range.min, range.max)
}

const ROUNDERS = {
  none: (value: number) => value,
  round: Math.round, // halves go up: 6.5 becomes 7
  floor: Math.floor,
  ceil: Math.ceil,
} as const

/**
 * Damage is the base roll times the type multiplier, made a whole number by the rounding
 * rule. An immune target (multiplier 0) always takes 0; any other hit does at least
 * `minimumDamage`.
 */
export function calculateDamage(
  baseDamage: number,
  multiplier: Multiplier,
  rules: DamageRules = DEFAULT_BATTLE_CONFIG.damage,
): number {
  if (multiplier === 0) return 0
  const rounded = ROUNDERS[rules.rounding](baseDamage * multiplier)
  return Math.max(rules.minimumDamage, rounded)
}

/** Hit points after taking damage; never below 0. */
export function applyDamage(hp: number, damage: number): number {
  return Math.max(hp - damage, 0)
}

/** Hit points after healing; never above `maxHp`. */
export function applyHeal(hp: number, maxHp: number, amount: number): number {
  return Math.min(hp + amount, maxHp)
}
