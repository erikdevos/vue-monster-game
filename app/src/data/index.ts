import type { Monster } from '@/domain/monster'
import { monsters } from './monsters'

export { monsters } from './monsters'
export { stages, type Stage } from './stages'
export { trainers, type Trainer } from './trainers'

const monstersById = new Map(monsters.map((monster) => [monster.id, monster]))

export function getMonsterById(id: number): Monster | undefined {
  return monstersById.get(id)
}
