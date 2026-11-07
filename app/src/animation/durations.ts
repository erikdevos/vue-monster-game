/**
 * Duration of every battle animation, in milliseconds. The one and only place: the playback
 * layer waits for each animation to finish, it never guesses a time.
 */
export interface AnimationDurations {
  attack: number
  specialAttack: number
  hit: number
  hpBar: number
  heal: number
  knockout: number
  /** Ditto shows as Ditto for this long before it transforms (the legacy game waited 2 seconds). */
  transformDelay: number
  transformOut: number
  transformIn: number
}

export const DEFAULT_DURATIONS: AnimationDurations = {
  attack: 400,
  specialAttack: 600,
  hit: 400,
  hpBar: 500,
  heal: 600,
  knockout: 700,
  transformDelay: 2000,
  transformOut: 300,
  transformIn: 700,
}
