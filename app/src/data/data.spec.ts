import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MONSTER_SIZES, MONSTER_TYPES } from '@/domain/monster'
import { getMonsterById, monsters, stages, trainers } from '.'

// The image folders live in the legacy root for now. This path changes in phase 4 (assets).
const resource = (path: string) => resolve(import.meta.dirname, '../../../resources', path)

describe('monsters', () => {
  it('has 155 monsters', () => {
    expect(monsters).toHaveLength(155)
  })

  it('has all required fields with the right types', () => {
    for (const m of monsters) {
      expect(typeof m.id, m.name).toBe('number')
      expect(Number.isInteger(m.id), m.name).toBe(true)
      expect(m.name.length, `id ${m.id}`).toBeGreaterThan(0)
      expect(m.image, m.name).toMatch(/^\d{3}\.png$/)
      expect(typeof m.health, m.name).toBe('number')
      expect(Number.isFinite(m.health) && m.health > 0, `${m.name} health`).toBe(true)
    }
  })

  it('has unique ids and names', () => {
    expect(new Set(monsters.map((m) => m.id)).size).toBe(monsters.length)
    expect(new Set(monsters.map((m) => m.name)).size).toBe(monsters.length)
    expect(new Set(monsters.map((m) => m.image)).size).toBe(monsters.length)
  })

  it('uses allowed types, sizes and facings', () => {
    for (const m of monsters) {
      expect(MONSTER_TYPES, m.name).toContain(m.type)
      expect(MONSTER_SIZES, m.name).toContain(m.size)
      if (m.facing !== undefined) expect(['left', 'right', 'center'], m.name).toContain(m.facing)
    }
  })

  it('keeps facing optional without inventing a default', () => {
    expect(monsters.filter((m) => m.facing === undefined)).toHaveLength(65)
    expect(monsters.filter((m) => m.facing === 'center')).toHaveLength(1)
  })

  it('has an id that matches the image file name', () => {
    for (const m of monsters) {
      expect(Number(m.image.slice(0, 3)), m.name).toBe(m.id)
    }
  })

  it('is sorted by id', () => {
    const ids = monsters.map((m) => m.id)
    expect(ids).toEqual([...ids].sort((a, b) => a - b))
  })

  it('has an image as thumb and as hq', () => {
    for (const m of monsters) {
      expect(existsSync(resource(`monster-images/thumbs/${m.image}`)), `thumb ${m.image}`).toBe(
        true,
      )
      expect(existsSync(resource(`monster-images/hq/${m.image}`)), `hq ${m.image}`).toBe(true)
    }
  })

  it('finds monsters by id', () => {
    expect(getMonsterById(25)?.name).toBe('Pikachu')
    expect(getMonsterById(9999)).toBeUndefined()
  })

  describe('regressions for known legacy data errors', () => {
    it('gives Kabuto 160 health', () => {
      expect(monsters.find((m) => m.name === 'Kabuto')?.health).toBe(160)
    })

    it('has MewTwo at id 150 / 150.png and Mew at id 151 / 151.png', () => {
      expect(getMonsterById(150)).toMatchObject({ name: 'MewTwo', image: '150.png' })
      expect(getMonsterById(151)).toMatchObject({ name: 'Mew', image: '151.png' })
    })
  })

  it('marks Ditto with the copy ability, and only Ditto', () => {
    expect(monsters.filter((m) => m.ability === 'copy').map((m) => m.name)).toEqual(['Ditto'])
    expect(getMonsterById(132)?.name).toBe('Ditto')
  })
})

describe('trainers', () => {
  it('has unique ids and aliases and an existing image', () => {
    expect(new Set(trainers.map((t) => t.id)).size).toBe(trainers.length)
    expect(new Set(trainers.map((t) => t.alias)).size).toBe(trainers.length)
    for (const t of trainers) {
      expect(existsSync(resource(`trainers/${t.image}`)), t.image).toBe(true)
      expect(['left', 'right']).toContain(t.facing)
    }
  })
})

describe('stages', () => {
  it('has unique ids and an existing image', () => {
    expect(stages).toHaveLength(5)
    expect(new Set(stages.map((s) => s.id)).size).toBe(stages.length)
    for (const s of stages) {
      expect(existsSync(resource(`stages/${s.image}`)), s.image).toBe(true)
    }
  })
})
