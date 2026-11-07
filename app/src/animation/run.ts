/** Shared by the playback layer: how animations are run, awaited and cancelled. */
export interface AnimationContext {
  signal: AbortSignal
  /** True when the user prefers reduced motion: animations are skipped (duration zero). */
  reducedMotion: () => boolean
  /** Calls `listener` when the preference changes. Returns the function that stops listening. */
  watchReducedMotion?: (listener: () => void) => () => void
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  } catch {
    return false
  }
}

/** Live changes of the OS setting while a battle is on. */
export function watchReducedMotion(listener: () => void): () => void {
  try {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  } catch {
    return () => {}
  }
}

/**
 * Runs a Web Animation and resolves when it has really finished (not after a guessed time).
 *
 * - Throws the abort reason when the signal fires; the animation is cancelled then.
 * - Never blocks a battle on an animation that cannot run: no element, no `animate`, or an
 *   `animate` that throws all count as "skipped".
 * - When reduced motion is switched on while the animation runs, it jumps to its end at once.
 */
export async function runAnimation(
  element: Element | null | undefined,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
  context: AnimationContext,
): Promise<void> {
  context.signal.throwIfAborted()
  if (!element || context.reducedMotion() || typeof element.animate !== 'function') return

  let animation: Animation
  try {
    animation = element.animate(keyframes, options)
  } catch {
    return
  }

  const cancel = () => animation.cancel()
  const finishNow = () => {
    if (!context.reducedMotion()) return
    try {
      animation.finish()
    } catch {
      animation.cancel()
    }
  }
  context.signal.addEventListener('abort', cancel, { once: true })
  const stopWatching = context.watchReducedMotion?.(finishNow)
  try {
    await animation.finished
  } catch {
    // A cancelled animation rejects `finished`; the abort check below decides what that means.
  } finally {
    context.signal.removeEventListener('abort', cancel)
    stopWatching?.()
  }
  context.signal.throwIfAborted()
}

/** Removes animations that were left running or holding their end state (fill) on an element. */
export function clearAnimations(element: Element | null | undefined): void {
  if (element && typeof element.getAnimations === 'function') {
    for (const animation of element.getAnimations()) animation.cancel()
  }
}
