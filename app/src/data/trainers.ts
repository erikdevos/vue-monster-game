import type { Facing } from '@/domain/monster'

export interface Trainer {
  id: number
  alias: string
  /** File name in resources/trainers/. */
  image: string
  /** Intrinsic image size in pixels (for width/height attributes). */
  width: number
  height: number
  /** Artwork orientation, see {@link Facing}. Legacy: mirrored only when 'right'. */
  facing: Facing
}

// Legacy id 3 (Alice, trainer-female.webp) was commented out in the original and stays out.
export const trainers: readonly Trainer[] = [
  { id: 1, alias: 'Red', image: 'trainer-male.webp', width: 800, height: 1589, facing: 'left' },
  { id: 2, alias: 'Misty', image: 'trainer-misty.webp', width: 216, height: 461, facing: 'left' },
  { id: 4, alias: 'Gary', image: 'trainer-gary.webp', width: 277, height: 1005, facing: 'left' },
  {
    id: 5,
    alias: 'Black/White',
    image: 'trainer-black-white.webp',
    width: 584,
    height: 1204,
    facing: 'right',
  },
  {
    id: 6,
    alias: 'Hilbert',
    image: 'trainer-hilbert.webp',
    width: 458,
    height: 1080,
    facing: 'left',
  },
  { id: 7, alias: 'Rosa', image: 'trainer-rosa.webp', width: 455, height: 1100, facing: 'right' },
  {
    id: 8,
    alias: 'Gladion',
    image: 'trainer-gladion.webp',
    width: 148,
    height: 439,
    facing: 'left',
  },
]
