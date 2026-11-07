# Architecture

Monster Game v2 is a Vue 3 app in which the game rules know nothing about the screen. The
rules produce plain data (events); the screen plays that data back.

## Layers

| Layer                | Where                                                   | What it does                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data                 | `src/data`                                              | The 155 monsters, trainers and stages as typed TypeScript. No logic.                                                                                                                              |
| Domain / engine      | `src/domain`                                            | Pure functions: type chart, damage, seedable RNG, and the battle reducer `(state, action) => { state, events }`. All balance numbers and switches live in `config.ts`. No Vue, no DOM, no timers. |
| Stores               | `src/stores`                                            | Pinia. `game` holds the player's choices (and survives a refresh in `sessionStorage`). `battle` wraps the reducer and keeps the event queue, what is on screen, and the log.                      |
| Animation / playback | `src/animation`, `src/composables/useBattlePlayback.ts` | Plays the queued events one at a time with the Web Animations API, and waits for each animation to end.                                                                                           |
| Router               | `src/router`                                            | One route per screen, hash mode, guards that send you to the first missing step.                                                                                                                  |
| Views / components   | `src/views`, `src/components`                           | Screens and their parts. Real buttons, no game rules.                                                                                                                                             |
| Assets               | `src/assets.ts`                                         | The only place that builds image URLs. Images are served from `../resources` (`publicDir`), a temporary arrangement.                                                                              |

Dependencies only point downwards: components use stores, stores use the engine, the engine
uses nothing. `src/ui` holds small display helpers (texts, filtering, health colors, mirroring).

## From click to played event

1. The player presses **Attack** in `ActionBar`. `BattleView.onAction` ignores the click when a
   round is still playing.
2. `battle.dispatch(action)` runs the pure reducer. It returns the new state at once and a list of
   **events** (`attack`, `effectiveness`, `heal`, `knockedOut`, `battleEnded`, ...), which go into
   the store's queue. An invalid action comes back as an error with a reason; the state does not
   change.
3. `useBattlePlayback.play()` takes the events one by one. For each it runs the matching
   animation (`element.animate(...)`), **awaits `animation.finished`**, and only then moves the
   on-screen state (`display`: HP, log) forward with `battle.applyEvent(event)`. The engine state
   is ahead; the screen follows.
4. When the queue is empty the buttons come back. After `battleEnded` the view goes to `/result`.

Playback stops (an `AbortController`) when the player leaves the screen or the battle is reset;
nothing fires afterwards. With `prefers-reduced-motion` animations are skipped, also when the
setting changes while a round plays. An animation that cannot run (no element, `animate`
throws) counts as skipped, so a battle never waits on it.

## Main design decisions

- **Routes instead of a step counter.** The legacy game showed and hid screens with `v-if` on a
  counter. Routes give a working back button, deep links, per-screen titles and focus handling,
  and guards that replace the counter's "which step am I on" bookkeeping. The selection a
  screen needs is checked in one place (`router/index.ts`).
- **Event-driven animation instead of timers.** The legacy game chained `setTimeout`s with fixed
  times next to CSS durations, so the two could drift apart. Here the engine says _what happened_,
  the playback layer says _how it looks_, and it waits for the real end of every animation. Durations
  are in one file (`animation/durations.ts`).
- **A pure, seedable engine.** The reducer takes its random numbers from a seed kept in the state,
  so a battle can be replayed exactly and tested without mocks.
- **Gameplay changes are switches.** Everything that differs from the legacy rules (whole-number
  damage, no heal at full health) is a value in `domain/config.ts`; `LEGACY_BATTLE_CONFIG` brings
  the old behaviour back.
- **Buttons stay focusable.** Unavailable actions use `aria-disabled` plus a visible reason text
  (linked with `aria-describedby`), so keyboard focus survives a round and screen readers learn why.
- **Lazy screens.** Every screen except the title is its own chunk.

## Tests

`npm test` runs Vitest. Files that never touch the DOM run in Node, the rest in happy-dom; every
file keeps its own worker (isolation intact). `npm run test:coverage` adds a V8 coverage report.
