export interface Stage {
  /** Slug, new in v2 (the legacy stages had no id). */
  id: string
  name: string
  /** File name in resources/stages/. */
  image: string
  /** Intrinsic image size in pixels (for width/height attributes). */
  width: number
  height: number
}

// The legacy `type` field was never used and has been dropped.
export const stages: readonly Stage[] = [
  { id: 'field', name: 'Field', image: 'battle-background.webp', width: 1024, height: 642 },
  { id: 'volcano', name: 'Volcano', image: 'background-fire.webp', width: 800, height: 600 },
  { id: 'forest', name: 'Forest', image: 'background-grass.webp', width: 800, height: 600 },
  { id: 'ocean', name: 'Ocean', image: 'background-water.webp', width: 800, height: 560 },
  { id: 'stadium', name: 'Stadium', image: 'background-stadium.webp', width: 1000, height: 465 },
]
