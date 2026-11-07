import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { monsters, stages, trainers } from '@/data'
import type { ActionAvailability, ActionType } from '@/domain/battle'
import type { LogEntry } from '@/stores/battle'
import ActionBar from './ActionBar.vue'
import BattleLog from './BattleLog.vue'
import HealthBar from './HealthBar.vue'
import MonsterGrid from './MonsterGrid.vue'
import StagePicker from './StagePicker.vue'
import TrainerPicker from './TrainerPicker.vue'

const monsterNames = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('.monster-card__name strong').map((el) => el.text())

describe('MonsterGrid', () => {
  const grid = () => mount(MonsterGrid, { props: { monsters } })

  it('renders a Random card plus one real button per monster', () => {
    const wrapper = grid()
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(156)
    expect(wrapper.findAll('li > button')).toHaveLength(156)
    expect(buttons[0]!.text()).toContain('Random')
  })

  it('has a labelled search field', () => {
    const wrapper = grid()
    const input = wrapper.find('input')
    const label = wrapper.find(`label[for="${input.attributes('id')}"]`)
    expect(label.exists()).toBe(true)
    expect(label.text()).toMatch(/search/i)
  })

  it('shows the monsters sorted by number', () => {
    const names = monsterNames(grid())
    expect(names[0]).toBe('Bulbasaur')
    expect(names).toHaveLength(155)
  })

  it('filters on name, type and number, case-insensitively', async () => {
    const wrapper = grid()
    const input = wrapper.find('input')

    await input.setValue('PIKACHU')
    expect(monsterNames(wrapper)).toEqual(['Pikachu'])

    await input.setValue('Fire')
    expect(monsterNames(wrapper)).toContain('Charmander')
    expect(monsterNames(wrapper).length).toBeGreaterThan(5)

    await input.setValue('#0150')
    expect(monsterNames(wrapper)).toEqual(['MewTwo'])
    await input.setValue('0150')
    expect(monsterNames(wrapper)).toEqual(['MewTwo'])
  })

  it('does not throw on regex characters and treats them as text', async () => {
    const wrapper = grid()
    const input = wrapper.find('input')
    for (const query of ['(', '[', '*', '\\', '+', '?', '(abc']) {
      await expect(input.setValue(query)).resolves.not.toThrow()
    }
    expect(wrapper.find('[role=status]').text()).toBe('No monsters found.')
    // The Random card stays available.
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('emits the monster id, or "random"', async () => {
    const wrapper = grid()
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['random'], [1]])
  })

  it('gives each card an accessible name with name and number, and a text for the type', () => {
    const wrapper = grid()
    const first = wrapper.findAll('button')[1]!
    expect(first.text()).toContain('Bulbasaur')
    expect(first.text()).toContain('#0001')
    expect(first.text()).toContain('grass')
  })

  it('lazy loads every image with sizes set', () => {
    const wrapper = grid()
    for (const img of wrapper.findAll('img')) {
      expect(img.attributes('loading')).toBe('lazy')
      expect(img.attributes('width')).toBeTruthy()
      expect(img.attributes('height')).toBeTruthy()
      expect(img.attributes('alt')).toBe('') // decorative: the name is in the button text
    }
  })
})

describe('TrainerPicker', () => {
  it('renders a button with a meaningful name for every trainer', async () => {
    const wrapper = mount(TrainerPicker, { props: { trainers } })
    const images = wrapper.findAll('button img')
    expect(images.map((i) => i.attributes('alt'))).toEqual(
      trainers.map((t) => `Trainer ${t.alias}`),
    )
    for (const img of images) {
      expect(img.attributes('loading')).toBe('lazy')
      expect(img.attributes('width')).toBeTruthy()
    }
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ alias: 'Misty' })
  })
})

describe('StagePicker', () => {
  it('renders a button per stage named after the stage', async () => {
    const wrapper = mount(StagePicker, { props: { stages } })
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.text())).toEqual(stages.map((s) => s.name))
    await buttons[3]!.trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'ocean' })
  })
})

describe('ActionBar', () => {
  const all = { available: true } as const
  const open: Record<ActionType, ActionAvailability> = {
    attack: all,
    specialAttack: all,
    heal: all,
    run: all,
  }
  const buttons = (wrapper: ReturnType<typeof mount>) =>
    Object.fromEntries(wrapper.findAll('button').map((b) => [b.text(), b]))
  const isOff = (button: { attributes: (name: string) => string | undefined }) =>
    button.attributes('aria-disabled') === 'true'

  it('has four real buttons with readable names', () => {
    const wrapper = mount(ActionBar, { props: { availability: open, busy: false } })
    expect(Object.keys(buttons(wrapper))).toEqual(['Attack', 'Special attack', 'Heal', 'Run'])
    expect(wrapper.find('[role=group]').attributes('aria-label')).toBe('Battle actions')
    for (const button of wrapper.findAll('button')) expect(isOff(button)).toBe(false)
  })

  it('switches off exactly what the engine does not allow, and says why', () => {
    const wrapper = mount(ActionBar, {
      props: {
        busy: false,
        availability: {
          ...open,
          specialAttack: { available: false, reason: { code: 'notThisRound', roundsLeft: 2 } },
          heal: { available: false, reason: { code: 'fullHealth' } },
        },
      },
    })
    const b = buttons(wrapper)
    expect(isOff(b.Attack!)).toBe(false)
    expect(isOff(b.Run!)).toBe(false)
    expect(isOff(b['Special attack']!)).toBe(true)
    expect(isOff(b.Heal!)).toBe(true)

    // Visible text, and linked to the button for screen readers.
    const hint = (button: { attributes: (n: string) => string | undefined }) =>
      wrapper.find(`#${button.attributes('aria-describedby')}`).text()
    expect(hint(b['Special attack']!)).toBe('Available in 2 rounds')
    expect(hint(b.Heal!)).toBe('Already at full health')
    expect(b.Attack!.attributes('aria-describedby')).toBeUndefined()
  })

  it('says "next round" for one round to go', () => {
    const wrapper = mount(ActionBar, {
      props: {
        busy: false,
        availability: {
          ...open,
          heal: { available: false, reason: { code: 'notThisRound', roundsLeft: 1 } },
        },
      },
    })
    expect(wrapper.text()).toContain('Available next round')
  })

  it('switches everything off while events are playing, without blaming a reason', () => {
    const wrapper = mount(ActionBar, {
      props: {
        busy: true,
        availability: { ...open, heal: { available: false, reason: { code: 'fullHealth' } } },
      },
    })
    for (const button of wrapper.findAll('button')) expect(isOff(button)).toBe(true)
    expect(wrapper.text()).not.toContain('full health')
  })

  it('keeps the buttons focusable (aria-disabled, not disabled), so focus survives a round', () => {
    const wrapper = mount(ActionBar, { props: { availability: open, busy: true } })
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeUndefined()
    }
  })

  it('emits the chosen action', async () => {
    const wrapper = mount(ActionBar, { props: { availability: open, busy: false } })
    await buttons(wrapper).Attack!.trigger('click')
    await buttons(wrapper).Run!.trigger('click')
    expect(wrapper.emitted('action')).toEqual([['attack'], ['run']])
  })

  it('does not emit for a switched off button', async () => {
    const wrapper = mount(ActionBar, {
      props: {
        busy: false,
        availability: { ...open, heal: { available: false, reason: { code: 'fullHealth' } } },
      },
    })
    await buttons(wrapper).Heal!.trigger('click')
    expect(wrapper.emitted('action')).toBeUndefined()
  })

  it('does not emit anything while busy', async () => {
    const wrapper = mount(ActionBar, { props: { availability: open, busy: true } })
    await buttons(wrapper).Attack!.trigger('click')
    expect(wrapper.emitted('action')).toBeUndefined()
  })
})

describe('HealthBar', () => {
  const level = (hp: number) =>
    mount(HealthBar, { props: { hp, maxHp: 100, label: 'Test hit points' } })

  it('is a progressbar with a name and values', () => {
    const bar = level(40).find('[role=progressbar]')
    expect(bar.attributes('aria-label')).toBe('Test hit points')
    expect(bar.attributes('aria-valuenow')).toBe('40')
    expect(bar.attributes('aria-valuemax')).toBe('100')
  })

  it('is red at 30% or less, orange at 50% or less, green above', () => {
    expect(level(30).find('.healthbar__value').classes()).toContain('healthbar__value--danger')
    expect(level(31).find('.healthbar__value').classes()).toContain('healthbar__value--warning')
    expect(level(50).find('.healthbar__value').classes()).toContain('healthbar__value--warning')
    expect(level(51).find('.healthbar__value').classes()).toContain('healthbar__value--good')
  })

  it('sets the bar width from the hit points, clamped', () => {
    expect(level(40).find('.healthbar__value').attributes('style')).toContain('width: 40%')
    expect(level(0).find('.healthbar__value').attributes('style')).toContain('width: 0%')
  })
})

describe('BattleLog', () => {
  const entries: LogEntry[] = [
    {
      id: 3,
      actor: 'enemy',
      kind: 'attack',
      attackerName: 'Charizard',
      value: 8,
      effectiveness: 'notVeryEffective',
    },
    { id: 2, actor: 'player', kind: 'heal', attackerName: "Ash's Pikachu", value: 30 },
    {
      id: 1,
      actor: 'player',
      kind: 'specialAttack',
      attackerName: "Ash's Pikachu",
      value: 40,
      effectiveness: 'superEffective',
    },
  ]

  it('has its live region in the DOM from the start, hidden for the eye while empty', () => {
    const wrapper = mount(BattleLog, { props: { entries: [] } })
    const list = wrapper.find('ul')
    expect(list.attributes('aria-live')).toBe('polite')
    expect(list.attributes('aria-relevant')).toBe('additions')
    expect(wrapper.classes()).toContain('visually-hidden')
  })

  it('lists entries in the given order with the effectiveness text from the UI layer', () => {
    const wrapper = mount(BattleLog, { props: { entries } })
    const items = wrapper.findAll('li').map((li) => li.text().replace(/\s+/g, ' '))
    expect(items[0]).toBe('Charizard attacks and deals 8 damage (Not very effective..)')
    expect(items[1]).toBe("Ash's Pikachu heals itself for 30")
    expect(items[2]).toBe(
      "Ash's Pikachu uses a special attack and deals 40 damage (Super effective!)",
    )
    expect(wrapper.find('h2').text()).toBe('Battle Log')
    expect(wrapper.classes()).not.toContain('visually-hidden')
  })

  it('announces each new line once: the live region and the old lines stay untouched', async () => {
    const wrapper = mount(BattleLog, { props: { entries: entries.slice(2) } })
    const list = wrapper.find('ul').element
    const firstLine = wrapper.findAll('li')[0]!.element

    await wrapper.setProps({ entries: [entries[1]!, entries[2]!] }) // a heal is added on top
    await wrapper.setProps({ entries })

    expect(wrapper.find('ul').element).toBe(list) // the same live region, never replaced
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.findAll('li')[2]!.element).toBe(firstLine) // existing line: same node, not re-rendered
  })

  it('adds a line complete: the effectiveness is part of it when it appears', async () => {
    const wrapper = mount(BattleLog, { props: { entries: [] } })
    const seen: string[] = []
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if ((node as Element).tagName === 'LI')
            seen.push((node as Element).textContent!.replace(/\s+/g, ' ').trim())
        }
      }
    })
    observer.observe(wrapper.find('ul').element, { childList: true, subtree: true })
    await wrapper.setProps({ entries: entries.slice(0, 1) })
    observer.disconnect()
    expect(seen).toEqual(['Charizard attacks and deals 8 damage (Not very effective..)'])
  })
})
