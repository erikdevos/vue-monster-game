import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compile } from 'sass'
import { describe, expect, it } from 'vitest'
import { MONSTER_TYPES } from '@/domain/monster'

const css = compile(resolve(import.meta.dirname, 'main.scss')).css

describe('design tokens', () => {
  it('has a color token for every one of the 18 monster types', () => {
    for (const type of MONSTER_TYPES) {
      expect(css, `--type-${type}`).toMatch(new RegExp(`--type-${type}:\\s*#[0-9a-fA-F]{3,8}`))
    }
  })

  it('has colors for dark and steel too (the legacy mixin had none)', () => {
    expect(css).toContain('--type-dark: #754')
    expect(css).toContain('--type-steel: #aab')
  })

  it('has the base tokens', () => {
    for (const token of ['--color-primary', '--border-radius-m', '--box-shadow']) {
      expect(css).toContain(token)
    }
  })

  it('uses @use only, never the deprecated @import, in any stylesheet or component', () => {
    const files = (readdirSync(resolve(import.meta.dirname, '..'), { recursive: true }) as string[])
      .filter((file) => /\.(scss|vue)$/.test(file))
      .map((file) => resolve(import.meta.dirname, '..', file))
    expect(files.length).toBeGreaterThan(10)
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/^\s*@import\b/m)
    }
  })
})
