export type HealthLevel = 'good' | 'warning' | 'danger'

/** Percentage of health left, clamped to 0..100. */
export function healthPercentage(hp: number, maxHp: number): number {
  if (maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (hp / maxHp) * 100))
}

/** Same thresholds as the legacy game: red at 30% or less, orange at 50% or less. */
export function healthLevel(percentage: number): HealthLevel {
  if (percentage <= 30) return 'danger'
  if (percentage <= 50) return 'warning'
  return 'good'
}
