# Vue monster game

Monster game made in Vue JS.

Original concept based on an assignment from the Udemy Course "Vue - The Complete Guide" by Maximilian Schwarzmüller.

Try the latest version here: https://erikdevos.github.io/vue-monster-game/

## Features added outside of base game mechanics

### Visual:

- Global styling
- Battle stage backgrounds
- Animating health bars
- Animating attacks / healing / losing
- Display characters for player monster & enemy monster
- Display monster type as color in several places
- Delay between attack & counter-attack / animations
- Changing monster size based on stats (s-m-l-xl)
- Flipping monster images to face each other in battle based on player vs enemy role and original orientation
- Showing a selectable player Trainer character

### Functionality:

- HP (health) display
- Monster number (#0001) display
- Player (trainer) name input & Display
- Delay between attack & counter-attack
- Monster visual scaling based on stats (s-m-l-xl)
- Enemy monster selection screen
- Player monster selection screen
- Random monster selection option (player&enemy)
- Dynamic image paths (thumb/full size)
- Live search and filtering in monsters list (name/type/number)
- Monster types (fire/water/grass etc)
- Monster type damage multiplier (0.5x - 2x)
- Damage multiplier effectiveness in logging ('Super Effective!')
- Stage selection screen & display in battle.
- Select player Trainer character screen

## Version 2 (work in progress)

A rebuild of the game lives in [`app/`](app/): Vue 3 (Composition API, `<script setup>`), Vite, TypeScript (strict), Pinia, Vue Router (hash mode, for GitHub Pages), Vitest, ESLint and Prettier. It is built in phases. Phases 1 to 3 are in place: tooling, the game rules as pure TypeScript (`app/src/domain`, `app/src/data`), and the screens as router routes with event-driven battle animations. Images are still served from the legacy `resources/` folder (temporary, see `publicDir` in `app/vite.config.ts` and `app/src/assets.ts`) until phase 4.

The legacy version (`index.html`, `scripting/`, `style/`, `resources/` in the repo root) is untouched and stays live until v2 has feature parity.

Run these from `app/` (Node 22, see `app/.nvmrc`):

```bash
npm ci               # install dependencies
npm run dev          # dev server
npm run build        # production build
npm run preview      # preview the production build
npm run typecheck    # vue-tsc
npm run lint         # ESLint (lint:fix to auto-fix)
npm run format:check # Prettier (format to write)
npm test             # Vitest, single run (test:watch for watch mode, test:coverage for coverage)
```

Phases:

1. Foundation: tooling, lint/format, tests, CI (done)
2. Data and engine: game rules as pure TypeScript functions and a state machine, separate from the UI (done)
3. Screens as router routes, plus animations driven by game events (done)
4. Assets: convert images to WebP. Postponed. Until then images are served from the legacy `resources/` folder: all URLs are built in `app/src/assets.ts` and `publicDir: '../resources'` in `app/vite.config.ts` is the temporary solution
5. Optional gameplay extensions

See [`app/ARCHITECTURE.md`](app/ARCHITECTURE.md) for the layers, the data flow from click to played event, and the main design decisions. `npm run test:coverage` (in `app/`) prints a coverage report.
