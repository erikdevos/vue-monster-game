import { useRouter } from 'vue-router'
import { clearError } from './errors'
import { useBattleStore } from './stores/battle'
import { useGameStore } from './stores/game'

/**
 * Starts over: everything is forgotten (both stores, which also aborts battle playback, and
 * sessionStorage) and the player is back on the title screen.
 */
export function useStartAgain() {
  const router = useRouter()
  const game = useGameStore()
  const battle = useBattleStore()

  return async function startAgain(): Promise<void> {
    battle.reset()
    game.reset()
    clearError()
    await router.push({ name: 'title' })
  }
}
