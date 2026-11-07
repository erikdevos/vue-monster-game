import type { Monster } from '@/domain/monster'

export function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return {
    id: 1,
    name: 'Testmon',
    image: '001.png',
    health: 500,
    size: 'm',
    type: 'normal',
    ...overrides,
  }
}

export interface AnimateCall {
  element: Element
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
  cancelled: boolean
  /** Set when the code finished it on purpose (`animation.finish()`). */
  finishedEarly: boolean
  /** Finishes the animation (manual mode only). */
  finish: () => void
}

/**
 * Replaces `Element.prototype.animate`. In `instant` mode animations finish at once (a
 * zero-duration run); in `manual` mode a test decides when each one ends.
 */
export function installAnimateStub(mode: 'instant' | 'manual' = 'instant') {
  const calls: AnimateCall[] = []
  const original = Element.prototype.animate

  Element.prototype.animate = function (
    this: Element,
    keyframes: Keyframe[],
    options?: number | KeyframeAnimationOptions,
  ): Animation {
    let finish = () => {}
    let fail: (reason: unknown) => void = () => {}
    const finished =
      mode === 'instant'
        ? Promise.resolve()
        : new Promise<void>((resolve, reject) => {
            finish = resolve
            fail = reject
          })
    const call: AnimateCall = {
      element: this,
      keyframes,
      options: typeof options === 'object' ? options : {},
      cancelled: false,
      finishedEarly: false,
      finish: () => finish(),
    }
    calls.push(call)
    return {
      finished,
      finish: () => {
        call.finishedEarly = true
        finish()
      },
      cancel: () => {
        call.cancelled = true
        fail(new DOMException('The animation was cancelled', 'AbortError'))
      },
    } as unknown as Animation
  } as typeof Element.prototype.animate

  return {
    calls,
    restore() {
      Element.prototype.animate = original
    },
  }
}
