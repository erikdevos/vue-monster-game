import type { Side } from '@/domain/battle'

/** Own keyframes for the Web Animations API (no animate.css). Durations live in durations.ts. */

/** Lunge towards the opponent: a small wind-up, then a strike (legacy attackLeft / attackRight). */
export function lunge(side: Side, strength = 1): Keyframe[] {
  // Legacy: the player strikes left (-4rem), the enemy right (+4rem).
  const direction = side === 'player' ? -1 : 1
  return [
    { transform: 'translateZ(0)', offset: 0 },
    { transform: `translate3d(${-direction * 1 * strength}rem, 0, 0)`, offset: 0.2 },
    { transform: `translate3d(${direction * 4 * strength}rem, 0, 0)`, offset: 0.4 },
    { transform: 'translateZ(0)', offset: 1 },
  ]
}

/** Flash on a hit (legacy animate.css `flash`). */
export const hitFlash: Keyframe[] = [
  { opacity: 1, offset: 0 },
  { opacity: 0, offset: 0.25 },
  { opacity: 1, offset: 0.5 },
  { opacity: 0, offset: 0.75 },
  { opacity: 1, offset: 1 },
]

/** Pulse while healing (legacy animate.css `pulse`). */
export const healPulse: Keyframe[] = [
  { transform: 'scale3d(1, 1, 1)', filter: 'brightness(1)', offset: 0 },
  { transform: 'scale3d(1.12, 1.12, 1.12)', filter: 'brightness(1.4)', offset: 0.5 },
  { transform: 'scale3d(1, 1, 1)', filter: 'brightness(1)', offset: 1 },
]

/** Knocked out: sink and fade (legacy animate.css `fadeOutDown`). */
export const knockOut: Keyframe[] = [
  { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  { opacity: 0, transform: 'translate3d(0, 4rem, 0)' },
]

/** Ditto: shrink away before the swap ... */
export const transformOut: Keyframe[] = [
  { transform: 'scale3d(1, 1, 1)', filter: 'brightness(1)' },
  { transform: 'scale3d(0.2, 0.2, 0.2)', filter: 'brightness(2)' },
]

/** ... and pop back as the copy (legacy animate.css `rubberBand`). */
export const transformIn: Keyframe[] = [
  { transform: 'scale3d(0.2, 0.2, 0.2)', filter: 'brightness(2)', offset: 0 },
  { transform: 'scale3d(1.25, 0.75, 1)', filter: 'brightness(1.4)', offset: 0.3 },
  { transform: 'scale3d(0.75, 1.25, 1)', offset: 0.4 },
  { transform: 'scale3d(1.15, 0.85, 1)', offset: 0.5 },
  { transform: 'scale3d(0.95, 1.05, 1)', offset: 0.65 },
  { transform: 'scale3d(1.05, 0.95, 1)', offset: 0.75 },
  { transform: 'scale3d(1, 1, 1)', filter: 'brightness(1)', offset: 1 },
]

/** Health bar sliding between two percentages. */
export function barSlide(fromPercent: number, toPercent: number): Keyframe[] {
  return [{ width: `${fromPercent}%` }, { width: `${toPercent}%` }]
}
