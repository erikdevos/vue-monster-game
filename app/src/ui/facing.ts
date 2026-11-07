import type { Facing } from '@/domain/monster'

export type FlipRole = 'enemy' | 'player' | 'trainer'

/**
 * Whether artwork has to be mirrored so everyone faces the middle. Legacy rules (see {@link Facing}):
 * enemy only when 'left', player monster and trainer only when 'right'. Undefined and 'center' never flip.
 */
export function shouldFlip(role: FlipRole, facing: Facing | undefined): boolean {
  return role === 'enemy' ? facing === 'left' : facing === 'right'
}
