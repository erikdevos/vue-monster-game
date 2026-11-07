import { formatNumber, type Monster } from '@/domain/monster'

/**
 * Live search. The query is plain text (never a regular expression), case-insensitive, and
 * matches the name, the type and the number ("25", "0025" and "#0025" all work).
 */
export function filterMonsters(list: readonly Monster[], query: string): Monster[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return list.slice()
  return list.filter((monster) => {
    const padded = String(monster.id).padStart(4, '0')
    return (
      monster.name.toLowerCase().includes(needle) ||
      monster.type.includes(needle) ||
      padded.includes(needle) ||
      formatNumber(monster.id).includes(needle)
    )
  })
}
