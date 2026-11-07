/** The 18 monster types (official order). Dark and steel have no monsters yet. */
export const MONSTER_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const

export type MonsterType = (typeof MONSTER_TYPES)[number]

/** Visual size class (drives the on-screen sprite size in the UI). */
export const MONSTER_SIZES = ['s', 'm', 'l', 'xl'] as const

export type MonsterSize = (typeof MONSTER_SIZES)[number]

/**
 * Which way the artwork faces in the source image. Purely presentational.
 *
 * Legacy behaviour, to be kept by the UI for parity (undefined and 'center' never flip):
 * - enemy monster: mirrored only when facing is 'left'
 * - player monster: mirrored only when facing is 'right'
 * - trainer: mirrored only when facing is 'right'
 *
 * Deliberately no default value: 65 of the 155 monsters have no facing in the source data.
 */
export type Facing = 'left' | 'right' | 'center'

/** Special abilities a monster can have. `copy`: Ditto transforms into its opponent. */
export type MonsterAbility = 'copy'

export interface Monster {
  /** Pokédex number. Display with {@link formatNumber}. */
  id: number
  name: string
  /** File name (e.g. `001.png`), the same in the thumbs and hq image folders. */
  image: string
  /** Maximum hit points. */
  health: number
  size: MonsterSize
  type: MonsterType
  facing?: Facing
  ability?: MonsterAbility
}

/** `150` becomes `#0150`. */
export function formatNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}

/** Numeric comparator: 9 sorts before 10 (unlike a string comparison). */
export function compareById(a: Pick<Monster, 'id'>, b: Pick<Monster, 'id'>): number {
  return a.id - b.id
}

export function sortById<T extends Pick<Monster, 'id'>>(list: readonly T[]): T[] {
  return list.slice().sort(compareById)
}
