/**
 * Random number source. `Math.random` is not used in the engine: everything goes through
 * this interface so battles are reproducible from a seed and tests can script the rolls.
 */
export interface Rng {
  /** Next float in [0, 1). */
  next(): number
}

/** An {@link Rng} whose internal state can be read back, so a seed survives in plain state. */
export interface SeededRng extends Rng {
  /** Current internal state (a uint32). Feed it to {@link createRng} to continue the sequence. */
  getState(): number
}

/** mulberry32: small, fast, good enough for a game. Same seed gives the same sequence. */
export function createRng(seed: number): SeededRng {
  let state = seed >>> 0
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    getState() {
      return state
    },
  }
}

/** Wraps `Math.random` for use in the UI (not reproducible). */
export const mathRandomRng: Rng = { next: () => Math.random() }

/** Random integer between `min` and `max`, both inclusive. */
export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng.next() * (max - min + 1)) + min
}

/** A random seed for a new battle, to be created at the edge of the app (UI). */
export function randomSeed(rng: Rng = mathRandomRng): number {
  return Math.floor(rng.next() * 4294967296)
}
