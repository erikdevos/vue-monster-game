import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { createMemoryHistory } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { appError, reportError } from './errors'
import { createAppRouter } from './router'
import { useStartAgain } from './session'
import { useBattleStore } from './stores/battle'
import { GAME_STORAGE_KEY, useGameStore } from './stores/game'
import { makeMonster } from './test/helpers'

describe('useStartAgain', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
  beforeEach(() => window.sessionStorage.clear())

  it('forgets everything and goes back to the title screen', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createAppRouter(createMemoryHistory())
    const game = useGameStore()
    const battle = useBattleStore()

    game.setPlayer('Ash', 2)
    game.choosePartner(25)
    game.chooseEnemy(6)
    game.chooseStage('ocean')
    battle.start({
      player: makeMonster(),
      enemy: makeMonster({ id: 2 }),
      playerName: 'Ash',
      seed: 1,
    })
    battle.dispatch({ type: 'run' })
    reportError(new Error('earlier problem'))
    await router.push('/battle')
    expect(window.sessionStorage.getItem(GAME_STORAGE_KEY)).not.toBeNull()
    const epoch = battle.epoch

    let startAgain!: () => Promise<void>
    const Probe = defineComponent({
      setup() {
        startAgain = useStartAgain()
        return () => null
      },
    })
    mount(Probe, { global: { plugins: [pinia, router] } })
    await startAgain()
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('title')
    expect(game.playerName).toBe('Trainer')
    expect(game.trainer).toBeNull()
    expect(game.partner).toBeNull()
    expect(game.enemy).toBeNull()
    expect(game.stage).toBeNull()
    expect(battle.state).toBeNull()
    expect(battle.display).toBeNull()
    expect(battle.queue).toEqual([])
    expect(battle.log).toEqual([])
    expect(battle.isPlaying).toBe(false)
    expect(battle.epoch).toBeGreaterThan(epoch) // running playback is told to stop
    expect(window.sessionStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
    expect(appError.value).toBeNull()

    // And it stays forgotten: every later screen asks for the start again.
    await router.push('/result')
    expect(router.currentRoute.value.name).toBe('trainer')
  })
})
