import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, type RouteLocationNormalized } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useBattleStore } from '@/stores/battle'
import { useGameStore } from '@/stores/game'
import { makeMonster } from '@/test/helpers'
import { createAppRouter } from '.'
import { STEPS, STEP_PATHS } from './steps'

function setup() {
  window.sessionStorage.clear()
  setActivePinia(createPinia())
  return {
    router: createAppRouter(createMemoryHistory()),
    game: useGameStore(),
    battle: useBattleStore(),
  }
}

const choose = (
  game: ReturnType<typeof useGameStore>,
  upTo: 'trainer' | 'partner' | 'enemy' | 'stage',
) => {
  const order = ['trainer', 'partner', 'enemy', 'stage'] as const
  const steps = order.slice(0, order.indexOf(upTo) + 1)
  if (steps.includes('trainer')) game.setPlayer('Ash', 1)
  if (steps.includes('partner')) game.choosePartner(25)
  if (steps.includes('enemy')) game.chooseEnemy(6)
  if (steps.includes('stage')) game.chooseStage('field')
}

describe('routes', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('has one route per screen', () => {
    const { router } = setup()
    for (const step of STEPS) {
      expect(router.resolve({ name: step }).path).toBe(STEP_PATHS[step])
    }
    expect(Object.values(STEP_PATHS)).toEqual([
      '/',
      '/trainer',
      '/partner',
      '/enemy',
      '/stage',
      '/battle',
      '/result',
    ])
  })

  it('uses hash history by default', () => {
    setActivePinia(createPinia())
    expect(createAppRouter().options.history.base).toBe('/#')
  })

  it('shows a not-found screen for unknown paths, not a silent redirect', async () => {
    const { router } = setup()
    await router.push('/nonsense')
    expect(router.currentRoute.value.name).toBe('notFound')
    expect(router.currentRoute.value.fullPath).toBe('/nonsense')
    expect(document.title).toBe('Page not found - Pocket Monsters')
  })

  it('scrolls to the top on a new screen and restores the position on back', () => {
    const { router } = setup()
    const scroll = router.options.scrollBehavior!
    const to = router.resolve('/partner') as unknown as RouteLocationNormalized
    const from = router.resolve('/trainer') as unknown as RouteLocationNormalized
    expect(scroll(to, from, null)).toEqual({ top: 0 })
    expect(scroll(to, from, { left: 0, top: 300 })).toEqual({ left: 0, top: 300 })
  })

  it('sets a document title per screen', async () => {
    const { router, game } = setup()
    await router.push('/')
    expect(document.title).toBe('Pocket Monsters')
    await router.push('/trainer')
    expect(document.title).toBe('Choose your trainer - Pocket Monsters')
    choose(game, 'trainer')
    await router.push('/partner')
    expect(document.title).toBe('Select your partner - Pocket Monsters')
  })
})

describe('navigation guards', () => {
  it('always allows the title and the trainer screen', async () => {
    const { router } = setup()
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('title')
    await router.push('/trainer')
    expect(router.currentRoute.value.name).toBe('trainer')
  })

  it.each(['/partner', '/enemy', '/stage', '/battle', '/result'])(
    'redirects %s to the trainer screen when nothing is chosen',
    async (path) => {
      const { router } = setup()
      await router.push(path)
      expect(router.currentRoute.value.name).toBe('trainer')
    },
  )

  it('redirects to the first missing step', async () => {
    const { router, game } = setup()

    choose(game, 'trainer')
    await router.push('/battle')
    expect(router.currentRoute.value.name).toBe('partner')

    choose(game, 'partner')
    await router.push('/stage')
    expect(router.currentRoute.value.name).toBe('enemy')

    choose(game, 'enemy')
    await router.push('/battle')
    expect(router.currentRoute.value.name).toBe('stage')
  })

  it('allows the battle once everything is chosen, but not the result before it has ended', async () => {
    const { router, game } = setup()
    choose(game, 'stage')
    await router.push('/battle')
    expect(router.currentRoute.value.name).toBe('battle')
    await router.push('/result')
    expect(router.currentRoute.value.name).toBe('battle')
  })

  it('allows the result once the battle has ended', async () => {
    const { router, game, battle } = setup()
    choose(game, 'stage')
    battle.start({
      player: makeMonster(),
      enemy: makeMonster({ id: 2 }),
      playerName: 'Ash',
      seed: 1,
    })
    battle.dispatch({ type: 'run' })
    await router.push('/result')
    expect(router.currentRoute.value.name).toBe('result')
  })

  it('lets the browser back button return to earlier screens', async () => {
    const { router, game } = setup()
    choose(game, 'stage')
    for (const path of ['/', '/trainer', '/partner', '/enemy', '/stage']) await router.push(path)
    router.back()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(router.currentRoute.value.name).toBe('enemy')
    router.back()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(router.currentRoute.value.name).toBe('partner')
  })

  it('restores the player from sessionStorage after a refresh', async () => {
    const first = setup()
    choose(first.game, 'stage')

    setActivePinia(createPinia()) // refresh: new stores, same sessionStorage
    const router = createAppRouter(createMemoryHistory())
    await router.push('/battle')
    expect(router.currentRoute.value.name).toBe('battle')
  })

  it('loads screens lazily, except the title screen (own chunk per screen)', () => {
    const { router } = setup()
    for (const step of STEPS) {
      const component = router.getRoutes().find((r) => r.name === step)!.components!.default
      if (step === 'title') expect(typeof component).not.toBe('function')
      else expect(typeof component, step).toBe('function')
    }
  })

  it('still guards a lazy screen: the chunk is not even needed for a blocked route', async () => {
    const { router } = setup()
    await router.push('/result')
    expect(router.currentRoute.value.name).toBe('trainer')
  })

  it('reports a screen that fails to load instead of hanging', async () => {
    const { router, game } = setup()
    choose(game, 'stage')
    const errors: unknown[] = []
    router.onError((error) => errors.push(error))
    const battle = router.getRoutes().find((r) => r.name === 'battle')!
    battle.components!.default = () => Promise.reject(new Error('Failed to fetch module'))
    await router.push('/battle').catch(() => {})
    expect(errors).toHaveLength(1)
    expect(router.currentRoute.value.name).not.toBe('battle')
  })
})
