import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, type Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import { reportError } from '@/errors'
import { createRng } from '@/domain/rng'
import { createAppRouter } from '@/router'
import { useBattleStore } from '@/stores/battle'
import { useGameStore } from '@/stores/game'
import { installAnimateStub } from '@/test/helpers'

let wrapper: VueWrapper | undefined
let stub: ReturnType<typeof installAnimateStub>

async function launch(path = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()
  wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { router, game: useGameStore(), battle: useBattleStore() }
}

/** Screens load on first visit (lazy chunks), so a route change takes a moment. */
const arrivedAt = (router: Router, name: string) =>
  vi.waitFor(() => expect(router.currentRoute.value.name).toBe(name))

const buttonByText = (text: string) => {
  const found = wrapper!.findAll('button').find((b) => b.text().includes(text))
  if (!found) throw new Error(`No button "${text}"`)
  return found
}

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  stub?.restore()
  vi.restoreAllMocks()
})

describe('App', () => {
  it('mounts with a memory router and shows the title screen', async () => {
    stub = installAnimateStub()
    await launch()
    expect(wrapper!.find('h1').text()).toBe('Pocket Monsters')
    expect(buttonByText('Press to start').exists()).toBe(true)
    expect(wrapper!.find('header').exists()).toBe(false) // the title screen has no header
  })

  it('plays a whole game, title to result, with a seeded RNG and zero-duration animations', async () => {
    stub = installAnimateStub('instant')
    const rng = createRng(42)
    vi.spyOn(Math, 'random').mockImplementation(() => rng.next())
    const { router, game, battle } = await launch()

    await buttonByText('Press to start').trigger('click')
    await arrivedAt(router, 'trainer')
    await flushPromises()
    expect(wrapper!.find('header').exists()).toBe(true)

    await wrapper!.find('input#player-name').setValue('Ash')
    await wrapper!.find('img[alt="Trainer Red"]').trigger('click')
    await arrivedAt(router, 'partner')
    await flushPromises()
    expect(game.playerName).toBe('Ash')

    await wrapper!.find('input[type=search]').setValue('pikachu')
    await buttonByText('Pikachu').trigger('click')
    await arrivedAt(router, 'enemy')
    await flushPromises()

    await buttonByText('Random').trigger('click') // seeded through Math.random
    await arrivedAt(router, 'stage')
    await flushPromises()
    expect(game.enemy).not.toBeNull()

    await buttonByText('Ocean').trigger('click')
    await arrivedAt(router, 'battle')
    await flushPromises()
    expect(wrapper!.text()).toContain('Ash & Pikachu')

    for (let turn = 0; turn < 200 && router.currentRoute.value.name === 'battle'; turn++) {
      await buttonByText('Attack').trigger('click')
      await flushPromises()
    }

    await arrivedAt(router, 'result')
    await flushPromises()
    expect(battle.isEnded).toBe(true)
    const expected = battle.outcome?.winner === 'player' ? 'You won!' : 'You lost!'
    expect(wrapper!.find('h1').text()).toBe(expected)
    expect(wrapper!.find('.battle-log').exists()).toBe(true)

    await buttonByText('Start again!').trigger('click')
    await arrivedAt(router, 'title')
    await flushPromises()
    expect(game.trainer).toBeNull()
    expect(game.partner).toBeNull()
    expect(battle.state).toBeNull()
  })

  it('is deterministic: the same seed gives the same game', async () => {
    const run = async () => {
      stub = installAnimateStub('instant')
      const rng = createRng(7)
      vi.spyOn(Math, 'random').mockImplementation(() => rng.next())
      const { router, game, battle } = await launch('/')
      game.setPlayer('Ash', 1)
      game.choosePartner(25)
      game.chooseEnemy(6)
      game.chooseStage('field')
      await router.push('/battle')
      await flushPromises()
      for (let turn = 0; turn < 200 && router.currentRoute.value.name === 'battle'; turn++) {
        await buttonByText('Attack').trigger('click')
        await flushPromises()
      }
      const result = { log: battle.log.map((entry) => entry.value), outcome: battle.outcome }
      wrapper?.unmount()
      stub.restore()
      vi.restoreAllMocks()
      return result
    }
    const first = await run()
    const second = await run()
    expect(first.log.length).toBeGreaterThan(2)
    expect(second).toEqual(first)
  })

  it('keeps the action buttons off while a round is playing and back on afterwards', async () => {
    stub = installAnimateStub('manual')
    const { game, battle } = await launch('/')
    game.setPlayer('Ash', 1)
    game.choosePartner(25)
    game.chooseEnemy(6)
    game.chooseStage('field')
    const { router } = { router: wrapper!.vm.$router }
    await router.push('/battle')
    await flushPromises()

    const allDisabled = () =>
      wrapper!.findAll('.actions button').every((b) => b.attributes('aria-disabled') === 'true')
    const attack = () => wrapper!.findAll('.actions button')[0]!

    // The opening events (nothing to animate) are done: Attack is ready.
    expect(attack().attributes('aria-disabled')).toBe('false')

    await attack().trigger('click')
    await flushPromises()
    expect(allDisabled()).toBe(true)

    for (let i = 0; i < 12 && allDisabled(); i++) {
      stub.calls.forEach((call) => call.finish())
      await flushPromises()
    }
    expect(allDisabled()).toBe(false)
    expect(battle.isPlaying).toBe(false)
  })

  it('stops all playback when the route is left mid-animation', async () => {
    stub = installAnimateStub('manual')
    const { game, battle, router } = await launch('/')
    game.setPlayer('Ash', 1)
    game.choosePartner(25)
    game.chooseEnemy(6)
    game.chooseStage('field')
    await router.push('/battle')
    await flushPromises()

    await wrapper!.findAll('.actions button')[0]!.trigger('click')
    await flushPromises()
    expect(stub.calls).toHaveLength(1)

    await router.push('/stage') // browser back, effectively
    await flushPromises()

    const count = stub.calls.length
    expect(stub.calls.every((call) => call.cancelled)).toBe(true)
    stub.calls.forEach((call) => call.finish())
    await flushPromises()
    expect(stub.calls).toHaveLength(count) // nothing fired after leaving
    expect(battle.state).toBeNull()
    expect(battle.log).toHaveLength(0)
  })

  it('plays the Ditto transformation when a battle opens with Ditto as partner', async () => {
    stub = installAnimateStub('manual')
    const { game, router } = await launch('/')
    game.setPlayer('Ash', 1)
    game.choosePartner(132) // Ditto
    game.chooseEnemy(6) // Charizard
    game.chooseStage('field')
    await router.push('/battle')
    await flushPromises()

    const playerImage = () => wrapper!.find('.panel--player .sprite img').attributes('src')
    expect(playerImage()).toContain('132.png')
    expect(wrapper!.find('.actions button').attributes('aria-disabled')).toBe('true') // still playing

    for (let i = 0; i < 6 && !playerImage()!.includes('006.png'); i++) {
      stub.calls.forEach((call) => call.finish())
      await flushPromises()
    }
    expect(playerImage()).toContain('006.png') // took over the looks of the enemy
    stub.calls.forEach((call) => call.finish())
    await flushPromises()
    expect(wrapper!.find('.actions button').attributes('aria-disabled')).toBe('false')
  })

  it('restarts the battle after a refresh on /battle (selection restored, fight not)', async () => {
    stub = installAnimateStub('instant')
    const first = await launch('/')
    first.game.setPlayer('Ash', 1)
    first.game.choosePartner(25)
    first.game.chooseEnemy(6)
    first.game.chooseStage('field')
    wrapper?.unmount()

    // "Refresh": new stores and router, same sessionStorage.
    const { router, battle } = await launch('/battle')
    expect(router.currentRoute.value.name).toBe('battle')
    expect(battle.state?.phase).toBe('awaitingPlayer')
    expect(battle.log).toHaveLength(0)
  })

  it('sends /battle without a selection back to the first missing step', async () => {
    stub = installAnimateStub('instant')
    const { router } = await launch('/battle')
    expect(router.currentRoute.value.name).toBe('trainer')
    expect(wrapper!.find('h1').text()).toBe("What's your name?")
  })

  it('moves focus to the heading of the new screen', async () => {
    stub = installAnimateStub('instant')
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createAppRouter(createMemoryHistory())
    await router.push('/')
    await router.isReady()
    wrapper = mount(App, {
      global: { plugins: [pinia, router], stubs: { transition: false } },
      attachTo: document.body,
    })
    await flushPromises()
    await router.push('/trainer')
    await vi.waitFor(() => expect(document.activeElement?.tagName).toBe('H1'))
    expect(document.activeElement?.textContent).toContain("What's your name?")
  })

  describe('trying to break it', () => {
    async function inBattle(mode: 'instant' | 'manual' = 'manual') {
      stub = installAnimateStub(mode)
      const launched = await launch('/')
      launched.game.setPlayer('Ash', 1)
      launched.game.choosePartner(25)
      launched.game.chooseEnemy(6)
      launched.game.chooseStage('field')
      await launched.router.push('/battle')
      await flushPromises()
      return launched
    }
    const button = (label: string) =>
      wrapper!.findAll('.actions button').find((b) => b.text() === label)!
    const click = (label: string) => (button(label).element as HTMLButtonElement).click()
    const finishAll = async () => {
      for (let i = 0; i < 15; i++) {
        stub.calls.forEach((call) => call.finish())
        await flushPromises()
      }
    }

    it('takes a double click on Attack as one attack', async () => {
      const { battle } = await inBattle()
      const attack = button('Attack').element as HTMLButtonElement
      attack.click()
      attack.click() // the second click lands before the screen has updated
      await finishAll()
      expect(battle.state?.round).toBe(1)
      expect(battle.log).toHaveLength(2) // one attack and one counter-attack, not two rounds
    })

    it('ignores every other action while a round is playing, Run included', async () => {
      const { battle } = await inBattle()
      click('Attack')
      await flushPromises()
      for (const label of ['Run', 'Special attack', 'Heal', 'Attack']) click(label)
      await finishAll()
      expect(battle.state?.phase).toBe('awaitingPlayer') // Run did not end it
      expect(battle.state?.round).toBe(1)
    })

    it('keeps the focus on the button that was pressed while a round plays', async () => {
      await inBattle()
      const attack = button('Attack').element as HTMLButtonElement
      attack.focus()
      attack.click()
      await flushPromises()
      expect(attack.getAttribute('aria-disabled')).toBe('true')
      expect(attack.hasAttribute('disabled')).toBe(false)
      expect(document.activeElement).toBe(attack)
      await finishAll()
      expect(document.activeElement).toBe(attack)
      expect(attack.getAttribute('aria-disabled')).toBe('false')
    })

    it('shows why Heal and Special attack are off, as text tied to the buttons', async () => {
      await inBattle('instant')
      await flushPromises()
      expect(button('Heal').attributes('aria-disabled')).toBe('true') // full health
      const hint = wrapper!.find(`#${button('Heal').attributes('aria-describedby')}`)
      expect(hint.text()).toBe('Already at full health')

      await button('Attack').trigger('click')
      await flushPromises()
      expect(button('Special attack').attributes('aria-disabled')).toBe('true')
      expect(
        wrapper!.find(`#${button('Special attack').attributes('aria-describedby')}`).text(),
      ).toBe('Available in 2 rounds')
    })

    it('does nothing when a switched off action is clicked', async () => {
      const { battle } = await inBattle('instant')
      await button('Heal').trigger('click')
      await flushPromises()
      expect(battle.state?.round).toBe(0)
      expect(battle.log).toHaveLength(0)
    })

    it('goes to the result when the enemy falls in the first blow, with no counter-attack', async () => {
      const { battle, router } = await inBattle('instant')
      battle.state!.enemy.hp = 1
      await button('Attack').trigger('click')
      await arrivedAt(router, 'result')
      await flushPromises()
      expect(battle.log).toHaveLength(1) // only our own hit
      expect(battle.state?.player.hp).toBe(battle.state?.player.maxHp)
      expect(wrapper!.find('h1').text()).toBe('You won!')
    })

    it('shows "You lost!" when the player falls', async () => {
      const { battle, router } = await inBattle('instant')
      battle.state!.player.hp = 1
      await button('Attack').trigger('click')
      await arrivedAt(router, 'result')
      await flushPromises()
      expect(wrapper!.find('h1').text()).toBe('You lost!')
    })

    it('puts focus on the result heading when the battle ends', async () => {
      stub = installAnimateStub('instant')
      const pinia = createPinia()
      setActivePinia(pinia)
      const router = createAppRouter(createMemoryHistory())
      const game = useGameStore()
      game.setPlayer('Ash', 1)
      game.choosePartner(25)
      game.chooseEnemy(6)
      game.chooseStage('field')
      await router.push('/battle')
      await router.isReady()
      wrapper = mount(App, {
        global: { plugins: [pinia, router], stubs: { transition: false } },
        attachTo: document.body,
      })
      await flushPromises()
      await button('Run').trigger('click')
      await arrivedAt(router, 'result')
      await vi.waitFor(() => expect(document.activeElement?.tagName).toBe('H1'))
      expect(document.activeElement?.textContent).toBe('You lost!')
    })

    it('goes straight to the first missing step for /result and /battle typed in by hand', async () => {
      stub = installAnimateStub('instant')
      for (const path of ['/result', '/battle', '/stage', '/enemy', '/partner']) {
        window.sessionStorage.clear()
        const { router } = await launch(path)
        expect(router.currentRoute.value.name, path).toBe('trainer')
        wrapper?.unmount()
      }
    })

    it('sends /result to a fresh battle when a selection survived a refresh', async () => {
      stub = installAnimateStub('instant')
      const first = await launch('/')
      first.game.setPlayer('Ash', 1)
      first.game.choosePartner(25)
      first.game.chooseEnemy(6)
      first.game.chooseStage('field')
      wrapper?.unmount()
      const { router, battle } = await launch('/result')
      expect(router.currentRoute.value.name).toBe('battle')
      expect(battle.isEnded).toBe(false)
    })

    it('starts a fresh fight when going back from the result to the battle', async () => {
      const { router, battle } = await inBattle('instant')
      await button('Run').trigger('click')
      await arrivedAt(router, 'result')
      await flushPromises()
      await router.push('/battle')
      await flushPromises()
      expect(battle.isEnded).toBe(false)
      expect(battle.log).toHaveLength(0)
      expect(button('Attack').attributes('aria-disabled')).toBe('false')
    })

    it('"Start again" on the result screen forgets everything, sessionStorage included', async () => {
      const { router, game, battle } = await inBattle('instant')
      await button('Run').trigger('click')
      await arrivedAt(router, 'result')
      await flushPromises()
      await buttonByText('Start again!').trigger('click')
      await arrivedAt(router, 'title')
      await flushPromises()
      expect(game.partner).toBeNull()
      expect(battle.state).toBeNull()
      expect(window.sessionStorage.getItem('monster-game-v2:game')).toBeNull()
      expect(wrapper!.find('h1').text()).toBe('Pocket Monsters')
      await router.push('/battle')
      expect(router.currentRoute.value.name).toBe('trainer')
    })

    it('shows an alert with a way out when something unexpected goes wrong', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { battle, router, game } = await inBattle('instant')
      wrapper!.vm.$.appContext.config.errorHandler = (error, _instance, info) =>
        reportError(error, info)
      vi.spyOn(battle, 'dispatch').mockImplementation(() => {
        throw new Error('engine exploded')
      })
      await button('Attack').trigger('click')
      await flushPromises()

      const alert = wrapper!.find('[role=alert]')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Something went wrong')

      await alert.findAll('button')[0]!.trigger('click') // Start again
      await arrivedAt(router, 'title')
      await flushPromises()
      expect(wrapper!.find('[role=alert]').exists()).toBe(false)
      expect(game.partner).toBeNull()
    })

    it('shows the not-found screen for an unknown address', async () => {
      stub = installAnimateStub('instant')
      const { router } = await launch('/does/not/exist')
      expect(router.currentRoute.value.name).toBe('notFound')
      expect(wrapper!.find('h1').text()).toBe('Page not found')
    })
  })
})
