import { onScopeDispose, watch } from 'vue'
import { DEFAULT_DURATIONS, type AnimationDurations } from '@/animation/durations'
import * as keyframes from '@/animation/keyframes'
import {
  clearAnimations,
  prefersReducedMotion,
  runAnimation,
  watchReducedMotion,
  type AnimationContext,
} from '@/animation/run'
import type { BattleEvent, Side } from '@/domain/battle'
import type { useBattleStore } from '@/stores/battle'
import { healthPercentage } from '@/ui/health'

/** The elements playback animates. Provided by the battle screen. */
export interface PlaybackTargets {
  /** The sprite wrapper of a combatant (the thing that lunges, flashes, fades). */
  sprite(side: Side): Element | null | undefined
  /** The inner bar of a combatant's health bar (the thing whose width slides). */
  bar(side: Side): Element | null | undefined
}

export interface PlaybackOptions {
  durations?: AnimationDurations
  /** Defaults to the OS setting via matchMedia, read again for every animation. */
  reducedMotion?: () => boolean
  /** Defaults to listening to the matchMedia change event. */
  watchReducedMotion?: (listener: () => void) => () => void
}

export type PlaybackResult = 'completed' | 'aborted'

/**
 * Plays the events the battle reducer produced, one at a time. Every step awaits the end of
 * its animation (Web Animations API), so there are no timers and no guessed durations.
 * Playback stops at once when the component is torn down or the battle is reset.
 */
export function useBattlePlayback(
  store: ReturnType<typeof useBattleStore>,
  targets: PlaybackTargets,
  options: PlaybackOptions = {},
) {
  const durations = options.durations ?? DEFAULT_DURATIONS
  const reducedMotion = options.reducedMotion ?? prefersReducedMotion
  const watchMotion =
    options.watchReducedMotion ?? (options.reducedMotion ? undefined : watchReducedMotion)
  let controller: AbortController | null = null
  let running: Promise<PlaybackResult> | null = null

  function abort() {
    controller?.abort()
  }

  function percentageOf(side: Side): number {
    const shown = store.display?.[side]
    return shown ? healthPercentage(shown.hp, shown.maxHp) : 0
  }

  async function playEvent(event: BattleEvent, context: AnimationContext): Promise<void> {
    const animate = (
      side: Side,
      frames: Keyframe[],
      duration: number,
      extra: KeyframeAnimationOptions = {},
    ) =>
      runAnimation(
        targets.sprite(side),
        frames,
        { duration, easing: 'ease-in-out', ...extra },
        context,
      )

    // The bar's reactive width already shows the new value; this animates from the old one.
    const slideBar = (side: Side, fromPercent: number) =>
      runAnimation(
        targets.bar(side),
        keyframes.barSlide(fromPercent, percentageOf(side)),
        { duration: durations.hpBar, easing: 'ease-in-out' },
        context,
      )

    switch (event.type) {
      case 'attack':
      case 'specialAttack': {
        const special = event.type === 'specialAttack'
        await animate(
          event.actor,
          keyframes.lunge(event.actor, special ? 1.25 : 1),
          special ? durations.specialAttack : durations.attack,
        )
        const from = percentageOf(event.target)
        store.applyEvent(event)
        await Promise.all([
          animate(event.target, keyframes.hitFlash, durations.hit),
          slideBar(event.target, from),
        ])
        break
      }
      case 'heal': {
        const from = percentageOf(event.actor)
        store.applyEvent(event)
        await Promise.all([
          animate(event.actor, keyframes.healPulse, durations.heal),
          slideBar(event.actor, from),
        ])
        break
      }
      case 'transformed':
        // Shrink (after the delay), swap the looks at the smallest point, pop back as the copy.
        await animate(event.side, keyframes.transformOut, durations.transformOut, {
          delay: durations.transformDelay,
          fill: 'forwards',
        })
        store.applyEvent(event)
        clearAnimations(targets.sprite(event.side))
        await animate(event.side, keyframes.transformIn, durations.transformIn)
        break
      case 'knockedOut':
        await animate(event.side, keyframes.knockOut, durations.knockout, { fill: 'forwards' })
        store.applyEvent(event)
        break
      default:
        store.applyEvent(event)
    }
  }

  async function run(own: AbortController): Promise<PlaybackResult> {
    const context: AnimationContext = {
      signal: own.signal,
      reducedMotion,
      watchReducedMotion: watchMotion,
    }
    store.isPlaying = true
    try {
      for (let event = store.shiftEvent(); event; event = store.shiftEvent()) {
        await playEvent(event, context)
      }
      return 'completed'
    } catch (error) {
      if (own.signal.aborted) return 'aborted'
      // Unexpected: put the screen in line with the engine's state at once, so the battle stays
      // playable, and let the error reach the app's error handler.
      store.syncDisplayToState()
      throw error
    } finally {
      if (controller === own) store.isPlaying = false
    }
  }

  /** Plays everything queued. Calling it while playing returns the run already in progress. */
  function play(): Promise<PlaybackResult> {
    if (running) return running
    const own = new AbortController()
    controller = own
    const current = run(own)
    running = current
    // Cleared after the run settled (not inside it, which can finish synchronously).
    const cleanup = () => {
      if (running === current) running = null
      if (controller === own) controller = null
    }
    current.then(cleanup, cleanup)
    return current
  }

  // Sync: a reset (which start() does first) must stop old playback before new playback begins.
  watch(() => store.epoch, abort, { flush: 'sync' })
  onScopeDispose(abort)

  return { play, abort }
}
