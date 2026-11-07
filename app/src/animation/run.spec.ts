import { afterEach, describe, expect, it, vi } from 'vitest'
import { installAnimateStub } from '@/test/helpers'
import {
  clearAnimations,
  prefersReducedMotion,
  runAnimation,
  watchReducedMotion,
  type AnimationContext,
} from './run'

const frames: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }]
const options: KeyframeAnimationOptions = { duration: 100 }

function context(overrides: Partial<AnimationContext> = {}) {
  const controller = new AbortController()
  const ctx: AnimationContext = {
    signal: controller.signal,
    reducedMotion: () => false,
    ...overrides,
  }
  return { controller, ctx }
}

let stub: ReturnType<typeof installAnimateStub> | undefined

afterEach(() => {
  stub?.restore()
  stub = undefined
  vi.restoreAllMocks()
})

describe('runAnimation', () => {
  it('resolves when the animation has finished, not before', async () => {
    stub = installAnimateStub('manual')
    const element = document.createElement('div')
    let done = false
    const running = runAnimation(element, frames, options, context().ctx).then(() => (done = true))
    await Promise.resolve()
    expect(done).toBe(false)
    stub.calls[0]!.finish()
    await running
    expect(done).toBe(true)
    expect(stub.calls[0]!.options).toEqual(options)
  })

  it('skips without an element', async () => {
    stub = installAnimateStub('manual')
    await runAnimation(null, frames, options, context().ctx)
    await runAnimation(undefined, frames, options, context().ctx)
    expect(stub.calls).toHaveLength(0)
  })

  it('skips when the browser has no element.animate', async () => {
    const element = document.createElement('div')
    Object.defineProperty(element, 'animate', { value: undefined })
    await expect(runAnimation(element, frames, options, context().ctx)).resolves.toBeUndefined()
  })

  it('skips when animate throws (bad keyframes, odd browser): a battle never waits on it', async () => {
    const element = document.createElement('div')
    element.animate = () => {
      throw new TypeError('Failed to execute animate')
    }
    await expect(runAnimation(element, frames, options, context().ctx)).resolves.toBeUndefined()
  })

  it('does not hang when `finished` rejects for another reason than a cancel', async () => {
    const element = document.createElement('div')
    element.animate = () =>
      ({
        finished: Promise.reject(new Error('boom')),
        cancel() {},
        finish() {},
      }) as unknown as Animation
    await expect(runAnimation(element, frames, options, context().ctx)).resolves.toBeUndefined()
  })

  it('skips with reduced motion', async () => {
    stub = installAnimateStub('manual')
    await runAnimation(
      document.createElement('div'),
      frames,
      options,
      context({ reducedMotion: () => true }).ctx,
    )
    expect(stub.calls).toHaveLength(0)
  })

  it('throws the abort reason and cancels the animation when aborted', async () => {
    stub = installAnimateStub('manual')
    const { controller, ctx } = context()
    const running = runAnimation(document.createElement('div'), frames, options, ctx)
    controller.abort()
    await expect(running).rejects.toBeDefined()
    expect(stub.calls[0]!.cancelled).toBe(true)
  })

  it('throws at once when already aborted, without starting anything', async () => {
    stub = installAnimateStub('manual')
    const { controller, ctx } = context()
    controller.abort()
    await expect(
      runAnimation(document.createElement('div'), frames, options, ctx),
    ).rejects.toBeDefined()
    expect(stub.calls).toHaveLength(0)
  })

  it('jumps to the end when reduced motion is switched on while it runs', async () => {
    stub = installAnimateStub('manual')
    let reduced = false
    let notify = () => {}
    const unsubscribe = vi.fn()
    const { ctx } = context({
      reducedMotion: () => reduced,
      watchReducedMotion: (listener) => {
        notify = listener
        return unsubscribe
      },
    })
    const running = runAnimation(document.createElement('div'), frames, options, ctx)
    await Promise.resolve()

    notify() // a change event, but the preference is still "no": nothing happens
    expect(stub.calls[0]!.finishedEarly).toBe(false)

    reduced = true
    notify()
    await running // resolves without anyone finishing it by hand
    expect(stub.calls[0]!.finishedEarly).toBe(true)
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  describe('cleans up its listeners', () => {
    const watched = () => {
      const controller = new AbortController()
      const add = vi.spyOn(controller.signal, 'addEventListener')
      const remove = vi.spyOn(controller.signal, 'removeEventListener')
      const unsubscribe = vi.fn()
      const ctx: AnimationContext = {
        signal: controller.signal,
        reducedMotion: () => false,
        watchReducedMotion: () => unsubscribe,
      }
      return { controller, ctx, add, remove, unsubscribe }
    }

    it('after finishing', async () => {
      stub = installAnimateStub('manual')
      const { ctx, add, remove, unsubscribe } = watched()
      const running = runAnimation(document.createElement('div'), frames, options, ctx)
      stub.calls[0]!.finish()
      await running
      expect(add).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledTimes(1)
      expect(remove.mock.calls[0]![1]).toBe(add.mock.calls[0]![1]) // the very same listener
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    it('after an abort', async () => {
      stub = installAnimateStub('manual')
      const { controller, ctx, add, remove, unsubscribe } = watched()
      const running = runAnimation(document.createElement('div'), frames, options, ctx)
      controller.abort()
      await expect(running).rejects.toBeDefined()
      expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0]![1])
      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })

    it('never adds any when the animation is skipped', async () => {
      const { ctx, add, unsubscribe } = watched()
      await runAnimation(null, frames, options, ctx)
      await runAnimation(document.createElement('div'), frames, options, {
        ...ctx,
        reducedMotion: () => true,
      })
      expect(add).not.toHaveBeenCalled()
      expect(unsubscribe).not.toHaveBeenCalled()
    })
  })
})

describe('reduced motion helpers', () => {
  const fakeQuery = (matches: boolean) => {
    const listeners = new Set<() => void>()
    return {
      query: {
        matches,
        addEventListener: (_: string, l: () => void) => listeners.add(l),
        removeEventListener: (_: string, l: () => void) => listeners.delete(l),
      } as unknown as MediaQueryList,
      listeners,
    }
  }

  it('reads prefers-reduced-motion from matchMedia', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue(fakeQuery(true).query)
    expect(prefersReducedMotion()).toBe(true)
    expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('treats a failing matchMedia as "no preference"', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(() => {
      throw new Error('unsupported')
    })
    expect(prefersReducedMotion()).toBe(false)
    expect(() => watchReducedMotion(() => {})()).not.toThrow()
  })

  it('subscribes to the change event and unsubscribes again', () => {
    const { query, listeners } = fakeQuery(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(query)
    const listener = vi.fn()
    const stop = watchReducedMotion(listener)
    expect(listeners.size).toBe(1)
    stop()
    expect(listeners.size).toBe(0)
  })
})

describe('clearAnimations', () => {
  it('cancels everything on the element', () => {
    const cancel = vi.fn()
    const element = document.createElement('div')
    element.getAnimations = () => [{ cancel }, { cancel }] as unknown as Animation[]
    clearAnimations(element)
    expect(cancel).toHaveBeenCalledTimes(2)
  })

  it('copes with a missing element or a browser without getAnimations', () => {
    expect(() => clearAnimations(null)).not.toThrow()
    const element = document.createElement('div')
    Object.defineProperty(element, 'getAnimations', { value: undefined })
    expect(() => clearAnimations(element)).not.toThrow()
  })
})
