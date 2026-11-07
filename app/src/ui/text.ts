import type { UnavailableReason } from '@/domain/battle'
import type { Effectiveness } from '@/domain/typeChart'

/** Display texts for effectiveness. They live in the UI layer, not in the engine. */
export const EFFECTIVENESS_TEXT: Record<Effectiveness, string> = {
  immune: 'No effect..',
  notVeryEffective: 'Not very effective..',
  neutral: 'Neutral effectiveness',
  superEffective: 'Super effective!',
}

export function effectivenessText(label: Effectiveness): string {
  return EFFECTIVENESS_TEXT[label]
}

/** Texts for why an action is switched off (shown next to the button and read by screen readers). */
export function unavailableText(reason: UnavailableReason): string {
  switch (reason.code) {
    case 'notThisRound':
      return reason.roundsLeft === 1
        ? 'Available next round'
        : `Available in ${reason.roundsLeft} rounds`
    case 'fullHealth':
      return 'Already at full health'
    case 'battleEnded':
      return 'The battle is over'
  }
}
