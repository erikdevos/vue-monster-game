import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { DEFAULT_DURATIONS } from '@/animation/durations'
import type { Side } from '@/domain/battle'
import { useBattleStore } from '@/stores/battle'
import { installAnimateStub, makeMonster } from '@/test/helpers'
import { useBattlePlayback } from './useBattlePlayback'

const sprites = { player: document.createElement('div'), enemy: document.createElement('div') }
const bars = { player: document.createElement('div'), enemy: document.createElement('div') }
const targets = { sprite: (side: Side) => sprites[side], bar: (side: Side) => bars[side] }

/** Which element an animation ran on, e.g. `sprite:player` or `bar:enemy`. */
function target(call: { element: Element }): string {
  for (const side of ['player', 'enemy'] as const) {
    if (call.element === sprites[side]) return `sprite:${side}`
    if (call.element === bars[side]) return `bar:${side}`
  }
  return 'unknown'
}

function setup(
  options: Parameters<typeof useBattlePlayback>[2] = {},
  monsters: {
    player?: Parameters<typeof makeMonster>[0]
    enemy?: Parameters<typeof makeMonster>[0]
  } = {},
) {
  const store = useBattleStore()
  store.start({
    player: makeMonster({ name: 'Mine', ...monsters.player }),
    enemy: makeMonster({ id: 2, name: 'Theirs', image: '002.png', ...monsters.enemy }),
    playerName: 'Ash',
    seed: 3,
  })
  const scope = effectScope()
  const playback = scope.run(() => useBattlePlayback(store, targets, options))!
  return { store, scope, playback }
}

let stub: ReturnType<typeof installAnimateStub>

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  stub?.restore()
  vi.restoreAllMocks()
})

describe('useBattlePlayback', () => {
  it('plays the events in order and moves the on-screen HP along per event', async () => {
    stub = installAnimateStub('manual')
    const { store, playback } = setup()
    // Opening events first.
    const opening = playback.play()
    await opening
    expect(stub.calls).toHaveLength(0)

    store.dispatch({ type: 'attack' })
    const finalEnemyHp = store.state!.enemy.hp
    const finalPlayerHp = store.state!.player.hp
    const playing = playback.play()
    await flushPromises()

    // 1. The player lunges; nothing has changed on screen yet.
    expect(stub.calls.map(target)).toEqual(['sprite:player'])
    expect(store.display!.enemy.hp).toBe(500)
    expect(store.log).toHaveLength(0)
    stub.calls[0]!.finish()
    await flushPromises()

    // 2. The hit lands: the enemy's HP moves, it flashes and its bar slides.
    expect(stub.calls.slice(1).map(target).sort()).toEqual(['bar:enemy', 'sprite:enemy'])
    expect(store.display!.enemy.hp).toBe(finalEnemyHp)
    expect(store.display!.player.hp).toBe(500)
    expect(store.log).toHaveLength(0) // a log line is added complete, once its effectiveness is known
    const barCall = stub.calls.find((c) => c.element === bars.enemy)!
    expect(barCall.keyframes).toEqual([
      { width: '100%' },
      { width: `${(finalEnemyHp / 500) * 100}%` },
    ])
    stub.calls.slice(1).forEach((c) => c.finish())
    await flushPromises()

    // 3. The log line is added, and only now the enemy strikes back.
    expect(store.log).toHaveLength(1)
    expect(stub.calls.slice(3).map(target)).toEqual(['sprite:enemy'])
    expect(store.display!.player.hp).toBe(500)
    stub.calls[3]!.finish()
    await flushPromises()
    stub.calls.slice(4).forEach((c) => c.finish())

    expect(await playing).toBe('completed')
    expect(store.display!.player.hp).toBe(finalPlayerHp)
    expect(store.log).toHaveLength(2)
    expect(store.log[0]?.effectiveness).toBe('neutral')
  })

  it('waits for the end of an animation, not for an estimated time', async () => {
    stub = installAnimateStub('manual')
    const { store, playback } = setup()
    await playback.play()
    store.dispatch({ type: 'attack' })
    const playing = playback.play()
    let settled = false
    void playing.then(() => (settled = true))

    await flushPromises()
    await flushPromises()
    expect(settled).toBe(false) // still waiting for the first animation
    expect(store.isPlaying).toBe(true)

    // Finishing every animation as it appears completes the playback.
    for (let i = 0; i < 10 && !settled; i++) {
      stub.calls.forEach((c) => c.finish())
      await flushPromises()
    }
    expect(settled).toBe(true)
    expect(store.isPlaying).toBe(false)
  })

  it('does not use timers to sequence anything', async () => {
    stub = installAnimateStub('instant')
    const timeout = vi.spyOn(globalThis, 'setTimeout')
    const interval = vi.spyOn(globalThis, 'setInterval')
    const { store, playback } = setup()
    store.dispatch({ type: 'attack' })
    await playback.play()
    expect(timeout).not.toHaveBeenCalled()
    expect(interval).not.toHaveBeenCalled()
    expect(store.display!.enemy.hp).toBe(store.state!.enemy.hp)
  })

  it('stops at once and cancels the running animation when the component goes away', async () => {
    stub = installAnimateStub('manual')
    const { store, scope, playback } = setup()
    await playback.play()
    store.dispatch({ type: 'attack' })
    const playing = playback.play()
    await flushPromises()
    expect(stub.calls).toHaveLength(1)

    scope.stop() // the player left the route

    expect(await playing).toBe('aborted')
    expect(stub.calls[0]!.cancelled).toBe(true)
    // Nothing fires after leaving: no new animation, no HP change, no log entry.
    await flushPromises()
    expect(stub.calls).toHaveLength(1)
    expect(store.display!.enemy.hp).toBe(500)
    expect(store.log).toHaveLength(0)
  })

  it('stops when the battle is reset', async () => {
    stub = installAnimateStub('manual')
    const { store, playback } = setup()
    await playback.play()
    store.dispatch({ type: 'attack' })
    const playing = playback.play()
    await flushPromises()

    store.reset()

    expect(await playing).toBe('aborted')
    expect(stub.calls[0]!.cancelled).toBe(true)
    await flushPromises()
    expect(stub.calls).toHaveLength(1)
  })

  it('skips animations with prefers-reduced-motion but still applies every event', async () => {
    stub = installAnimateStub('manual')
    const { store, playback } = setup({ reducedMotion: () => true })
    store.dispatch({ type: 'attack' })
    expect(await playback.play()).toBe('completed')
    expect(stub.calls).toHaveLength(0)
    expect(store.display!.enemy.hp).toBe(store.state!.enemy.hp)
    expect(store.display!.player.hp).toBe(store.state!.player.hp)
    expect(store.log).toHaveLength(2)
  })

  it('reads prefers-reduced-motion from matchMedia by default', async () => {
    stub = installAnimateStub('manual')
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) => ({ matches: query.includes('reduce') }) as MediaQueryList,
    )
    const { store, playback } = setup()
    store.dispatch({ type: 'attack' })
    expect(await playback.play()).toBe('completed')
    expect(stub.calls).toHaveLength(0)
  })

  it('keeps the control state in the store: playing while events run, not after', async () => {
    stub = installAnimateStub('manual')
    const { store, playback } = setup()
    store.dispatch({ type: 'attack' })
    expect(store.hasPendingEvents).toBe(true)
    const playing = playback.play()
    await flushPromises()
    expect(store.isPlaying).toBe(true)
    for (let i = 0; i < 10; i++) {
      stub.calls.forEach((c) => c.finish())
      await flushPromises()
    }
    await playing
    expect(store.isPlaying).toBe(false)
    expect(store.hasPendingEvents).toBe(false)
  })

  it('returns the run in progress when play() is called twice', async () => {
    stub = installAnimateStub('instant')
    const { store, playback } = setup()
    store.dispatch({ type: 'attack' })
    const first = playback.play()
    expect(playback.play()).toBe(first)
    await first
    expect(store.log).toHaveLength(2) // no event was played twice
  })

  it('can play again after a run that finished synchronously', async () => {
    stub = installAnimateStub('instant')
    const { store, playback } = setup()
    await playback.play() // opening events, no animation
    store.dispatch({ type: 'attack' })
    await playback.play()
    expect(store.log).toHaveLength(2)
  })

  it('fades a knocked out combatant and marks it afterwards', async () => {
    stub = installAnimateStub('manual')
    const { store, playback } = setup({}, { enemy: { health: 1 } })
    await playback.play()
    store.dispatch({ type: 'attack' }) // 1 HP: a knockout whatever the roll
    const playing = playback.play()

    let seenFading = false
    for (let i = 0; i < 10; i++) {
      await flushPromises()
      const fade = stub.calls.find((c) => c.options.fill === 'forwards' && !seenFading)
      if (fade) {
        seenFading = true
        expect(fade.element).toBe(sprites.enemy)
        expect(store.display!.enemy.knockedOut).toBe(false) // still fading
      }
      stub.calls.forEach((c) => c.finish())
    }
    expect(seenFading).toBe(true)
    expect(await playing).toBe('completed')
    expect(store.display!.enemy.knockedOut).toBe(true)
    expect(store.isEnded).toBe(true)
  })

  it('plays Ditto transformation: delay, shrink, swap the looks, pop back', async () => {
    stub = installAnimateStub('manual')
    const store = useBattleStore()
    store.start({
      player: makeMonster({
        id: 132,
        name: 'Ditto',
        image: '132.png',
        health: 80,
        ability: 'copy',
      }),
      enemy: makeMonster({ id: 6, name: 'Charizard', image: '006.png', health: 180, size: 'xl' }),
      playerName: 'Ash',
      seed: 1,
    })
    const scope = effectScope()
    const playback = scope.run(() => useBattlePlayback(store, targets))!
    const playing = playback.play()
    await flushPromises()

    const out = stub.calls[0]!
    expect(out.element).toBe(sprites.player)
    expect(out.options.delay).toBe(DEFAULT_DURATIONS.transformDelay) // WAAPI delay, not a timer
    expect(store.display!.player.monster.image).toBe('132.png')
    out.finish()
    await flushPromises()

    expect(store.display!.player.monster.image).toBe('006.png') // swapped between the two animations
    const back = stub.calls[1]!
    expect(back.options.duration).toBe(DEFAULT_DURATIONS.transformIn)
    back.finish()
    expect(await playing).toBe('completed')
  })

  describe('when animations misbehave', () => {
    it('plays the whole round when element.animate throws', async () => {
      stub = installAnimateStub('instant')
      Element.prototype.animate = () => {
        throw new DOMException('not supported', 'NotSupportedError')
      }
      const { store, playback } = setup()
      store.dispatch({ type: 'attack' })
      expect(await playback.play()).toBe('completed')
      expect(store.display!.enemy.hp).toBe(store.state!.enemy.hp)
      expect(store.log).toHaveLength(2)
      expect(store.isPlaying).toBe(false)
      expect(store.hasPendingEvents).toBe(false)
    })

    it('plays on when a sprite or bar element is missing', async () => {
      stub = installAnimateStub('manual')
      const store = useBattleStore()
      store.start({
        player: makeMonster(),
        enemy: makeMonster({ id: 2 }),
        playerName: 'Ash',
        seed: 3,
      })
      const scope = effectScope()
      const playback = scope.run(() =>
        useBattlePlayback(store, { sprite: () => null, bar: () => undefined }),
      )!
      store.dispatch({ type: 'attack' })
      expect(await playback.play()).toBe('completed')
      expect(stub.calls).toHaveLength(0)
      expect(store.log).toHaveLength(2)
    })

    it('shows the end state of what is left, and reports the error, when an event fails to apply', async () => {
      stub = installAnimateStub('instant')
      const { store, playback } = setup()
      await playback.play()
      store.dispatch({ type: 'attack' })
      const finalHp = store.state!.enemy.hp
      const apply = store.applyEvent
      let calls = 0
      store.applyEvent = (event) => {
        if (calls++ === 0) throw new Error('boom')
        apply(event)
      }
      await expect(playback.play()).rejects.toThrow('boom')
      // Nothing is left half way: no queue, controls not stuck, the screen shows where we are.
      expect(store.hasPendingEvents).toBe(false)
      expect(store.isPlaying).toBe(false)
      expect(store.display!.enemy.hp).toBe(finalHp)
    })

    it('does not wait for a running animation once reduced motion is switched on', async () => {
      stub = installAnimateStub('manual')
      let reduced = false
      const listeners = new Set<() => void>()
      const { store, playback } = setup({
        reducedMotion: () => reduced,
        watchReducedMotion: (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
      })
      await playback.play()
      store.dispatch({ type: 'attack' })
      const playing = playback.play()
      await flushPromises()
      expect(stub.calls).toHaveLength(1) // the lunge is running

      reduced = true // the OS setting changes mid-round
      listeners.forEach((listener) => listener())
      await flushPromises()

      expect(stub.calls[0]!.finishedEarly).toBe(true)
      expect(await playing).toBe('completed') // everything after it is skipped
      expect(stub.calls).toHaveLength(1)
      expect(store.log).toHaveLength(2)
      expect(listeners.size).toBe(0) // no listener left behind
    })

    it('leaves no listeners behind after an abort or after the component goes away', async () => {
      stub = installAnimateStub('manual')
      const listeners = new Set<() => void>()
      const { store, scope, playback } = setup({
        reducedMotion: () => false,
        watchReducedMotion: (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
      })
      await playback.play()
      store.dispatch({ type: 'attack' })
      const playing = playback.play()
      await flushPromises()
      expect(listeners.size).toBe(1)
      scope.stop()
      await playing
      expect(listeners.size).toBe(0)
    })
  })
})
