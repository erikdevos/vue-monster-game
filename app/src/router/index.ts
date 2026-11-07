import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import { useBattleStore } from '@/stores/battle'
import { useGameStore } from '@/stores/game'
import TitleView from '@/views/TitleView.vue'
import { STEPS, STEP_PATHS, STEP_TITLES, isStepName, type StepName } from './steps'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
  }
}

// The title screen is in the main bundle (first paint, no extra request); the others load on
// first visit, so each screen is its own chunk.
const components = {
  title: TitleView,
  trainer: () => import('@/views/TrainerView.vue'),
  partner: () => import('@/views/PartnerView.vue'),
  enemy: () => import('@/views/EnemyView.vue'),
  stage: () => import('@/views/StageView.vue'),
  battle: () => import('@/views/BattleView.vue'),
  result: () => import('@/views/ResultView.vue'),
}

export const routes: RouteRecordRaw[] = [
  ...STEPS.map((step) => ({
    path: STEP_PATHS[step],
    name: step,
    component: components[step],
    meta: { title: STEP_TITLES[step] },
  })),
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

/**
 * The furthest screen the player may be on right now, based on what has been chosen.
 * Going back is always fine; going further than this is not.
 */
export function furthestAllowedStep(): StepName {
  const game = useGameStore()
  const battle = useBattleStore()
  if (!game.trainer) return 'trainer'
  if (!game.partner) return 'partner'
  if (!game.enemy) return 'enemy'
  if (!game.stage) return 'stage'
  return battle.isEnded ? 'result' : 'battle'
}

/** Sends the player back to the first missing step instead of showing a broken screen. */
export function installGuards(router: Router): void {
  router.beforeEach((to) => {
    if (!isStepName(to.name)) return true
    const allowed = furthestAllowedStep()
    if (STEPS.indexOf(to.name) > STEPS.indexOf(allowed)) return { name: allowed, replace: true }
    return true
  })

  router.afterEach((to) => {
    document.title = to.name === 'title' ? to.meta.title : `${to.meta.title} - Pocket Monsters`
  })
}

// Hash mode keeps deep links working on GitHub Pages (no server-side fallback).
export function createAppRouter(history: RouterHistory = createWebHashHistory()): Router {
  const router = createRouter({
    history,
    routes,
    // Every screen starts at the top; back/forward restores where you were.
    scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
  })
  installGuards(router)
  return router
}
