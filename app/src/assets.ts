import type { Monster } from '@/domain/monster'
import type { Stage } from '@/data/stages'
import type { Trainer } from '@/data/trainers'

/**
 * The single place where image URLs are built.
 *
 * TEMPORARY: images are served from the legacy ../resources folder (see `publicDir` in
 * vite.config.ts), so paths mirror that folder. Phase 4 (WebP, srcset) only has to change this file.
 */
const base = () => import.meta.env.BASE_URL

export const assetUrl = (path: string): string => `${base()}${path}`

export const monsterThumbUrl = (monster: Pick<Monster, 'image'>) =>
  assetUrl(`monster-images/thumbs/${monster.image}`)

export const monsterHqUrl = (monster: Pick<Monster, 'image'>) =>
  assetUrl(`monster-images/hq/${monster.image}`)

export const trainerUrl = (trainer: Pick<Trainer, 'image'>) => assetUrl(`trainers/${trainer.image}`)

export const stageUrl = (stage: Pick<Stage, 'image'>) => assetUrl(`stages/${stage.image}`)

export const randomIconUrl = () => assetUrl('icon-random.png')

/** Intrinsic sizes (px) of the monster images, for width/height attributes. */
export const MONSTER_THUMB_SIZE = 215
export const MONSTER_HQ_SIZE = 475
export const RANDOM_ICON_SIZE = { width: 469, height: 512 }

/**
 * CSS cannot call the helpers above, so the few background images used in stylesheets are
 * exposed as custom properties (set once at startup).
 */
export function applyAssetCssVariables(root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--asset-global-background', `url('${assetUrl('global-background.png')}')`)
  root.style.setProperty('--asset-start-screen-lg', `url('${assetUrl('start-screen-lg.jpg')}')`)
  root.style.setProperty('--asset-start-screen-sm', `url('${assetUrl('start-screen-sm.webp')}')`)
}
