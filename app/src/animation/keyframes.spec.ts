import { describe, expect, it } from 'vitest'
import { DEFAULT_DURATIONS } from './durations'
import {
  barSlide,
  healPulse,
  hitFlash,
  knockOut,
  lunge,
  transformIn,
  transformOut,
} from './keyframes'

const offsets = (frames: Keyframe[]) => frames.map((f) => f.offset).filter((o) => o !== undefined)

describe('keyframes', () => {
  it('lunges towards the opponent: the player to the left, the enemy to the right (legacy)', () => {
    const player = lunge('player')
    const enemy = lunge('enemy')
    expect(player[1]!.transform).toBe('translate3d(1rem, 0, 0)') // wind-up
    expect(player[2]!.transform).toBe('translate3d(-4rem, 0, 0)') // strike
    expect(enemy[1]!.transform).toBe('translate3d(-1rem, 0, 0)')
    expect(enemy[2]!.transform).toBe('translate3d(4rem, 0, 0)')
  })

  it('lunges further for a special attack and always returns to rest', () => {
    expect(lunge('player', 1.25)[2]!.transform).toBe('translate3d(-5rem, 0, 0)')
    expect(lunge('enemy').at(-1)!.transform).toBe('translateZ(0)')
  })

  it('has offsets that only go up and end at 1', () => {
    for (const frames of [lunge('player'), lunge('enemy'), hitFlash, healPulse, transformIn]) {
      const list = offsets(frames)
      expect(list).toEqual([...list].sort((a, b) => (a ?? 0) - (b ?? 0)))
      expect(list.at(-1)).toBe(1)
    }
  })

  it('flashes back to fully visible, pulses back to normal size, fades out for a knockout', () => {
    expect(hitFlash.at(-1)!.opacity).toBe(1)
    expect(healPulse.at(-1)!.transform).toBe('scale3d(1, 1, 1)')
    expect(knockOut.at(-1)!.opacity).toBe(0)
  })

  it('shrinks away and pops back from the same size (so the swap is seamless)', () => {
    expect(transformOut.at(-1)!.transform).toBe(transformIn[0]!.transform)
  })

  it('slides a bar between two percentages', () => {
    expect(barSlide(100, 40)).toEqual([{ width: '100%' }, { width: '40%' }])
  })
})

describe('durations', () => {
  it('are positive numbers in one place', () => {
    for (const value of Object.values(DEFAULT_DURATIONS)) {
      expect(value).toBeGreaterThan(0)
    }
  })
})
