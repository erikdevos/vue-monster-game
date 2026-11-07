import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { createAppRouter } from '@/router'
import { useBattleStore } from '@/stores/battle'
import { makeMonster } from '@/test/helpers'
import NotFoundView from './NotFoundView.vue'
import ResultView from './ResultView.vue'

async function setup() {
  window.sessionStorage.clear()
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createAppRouter(createMemoryHistory())
  await router.push('/')
  await router.isReady()
  return { pinia, router, battle: useBattleStore() }
}

function finishedBattle(battle: ReturnType<typeof useBattleStore>, kind: 'won' | 'run') {
  battle.start({
    player: makeMonster({ name: 'Mine' }),
    enemy: makeMonster({ id: 2, name: 'Theirs', health: kind === 'won' ? 1 : 500 }),
    playerName: 'Ash',
    seed: 1,
  })
  battle.dispatch({ type: kind === 'won' ? 'attack' : 'run' })
  for (let event = battle.shiftEvent(); event; event = battle.shiftEvent()) battle.applyEvent(event)
}

describe('ResultView', () => {
  it('says "You won!" with the log', async () => {
    const { pinia, router, battle } = await setup()
    finishedBattle(battle, 'won')
    const wrapper = mount(ResultView, { global: { plugins: [pinia, router] } })
    expect(wrapper.find('h1').text()).toBe('You won!')
    expect(wrapper.findAll('.battle-log li').length).toBeGreaterThan(0)
  })

  it('counts running away as a loss', async () => {
    const { pinia, router, battle } = await setup()
    finishedBattle(battle, 'run')
    const wrapper = mount(ResultView, { global: { plugins: [pinia, router] } })
    expect(wrapper.find('h1').text()).toBe('You lost!')
  })

  it('keeps showing the result while "Start again" empties the store (it fades out for a moment)', async () => {
    const { pinia, router, battle } = await setup()
    finishedBattle(battle, 'won')
    const wrapper = mount(ResultView, { global: { plugins: [pinia, router] } })
    const lines = wrapper.findAll('.battle-log li').length

    battle.reset() // what "Start again" does, before the screen is gone

    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('You won!') // not flipped to "You lost!"
    expect(wrapper.findAll('.battle-log li')).toHaveLength(lines)
  })
})

describe('NotFoundView', () => {
  it('explains and offers a way back to the start', async () => {
    const { pinia, router } = await setup()
    await router.push('/nowhere')
    const wrapper = mount(NotFoundView, { global: { plugins: [pinia, router] } })
    expect(wrapper.find('h1').text()).toBe('Page not found')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('title')
  })
})
