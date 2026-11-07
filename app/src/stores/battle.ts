import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  battleReducer,
  createBattle,
  getActionAvailability,
  getAvailableActions,
  type BattleAction,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  type BattleState,
  type Side,
} from '@/domain/battle'
import type { Monster } from '@/domain/monster'
import { randomSeed } from '@/domain/rng'
import type { Effectiveness } from '@/domain/typeChart'

export interface LogEntry {
  id: number
  actor: Side
  kind: 'attack' | 'specialAttack' | 'heal'
  attackerName: string
  /** Damage dealt, or the rolled heal value (as the legacy log showed). */
  value: number
  /** Present on attacks: a line is only added once its effectiveness is known, so it is complete. */
  effectiveness?: Effectiveness
}

/** What is on screen right now. It trails the engine state: only playback moves it forward. */
export interface DisplaySide {
  monster: Monster
  hp: number
  maxHp: number
  knockedOut: boolean
}

export interface DisplayState {
  player: DisplaySide
  enemy: DisplaySide
}

export interface StartBattleOptions {
  player: Monster
  enemy: Monster
  playerName: string
  seed?: number
}

/**
 * Wraps the pure battle reducer. `state` is the authoritative result of the engine and moves
 * ahead immediately; `display` and `log` are moved along event by event by the playback layer.
 */
export const useBattleStore = defineStore('battle', () => {
  const state = ref<BattleState | null>(null)
  const queue = ref<BattleEvent[]>([])
  const display = ref<DisplayState | null>(null)
  const log = ref<LogEntry[]>([])
  const playerName = ref('')
  const isPlaying = ref(false)
  /** Bumped by every start/reset, so running playback can tell it has been overtaken. */
  const epoch = ref(0)
  let nextLogId = 1

  /** A hit waiting for its `effectiveness` event, so the log gets one complete line per hit. */
  let pendingHit: { actor: Side; kind: 'attack' | 'specialAttack'; value: number } | null = null

  const availableActions = computed(() => (state.value ? getAvailableActions(state.value) : []))
  /** Per action: available, or the reason it is not. `null` without a battle. */
  const availability = computed(() => (state.value ? getActionAvailability(state.value) : null))
  const isEnded = computed(() => state.value?.phase === 'ended')
  const outcome = computed<BattleOutcome | null>(() =>
    state.value?.phase === 'ended' ? state.value.outcome : null,
  )
  /** True while there are events left to play, so the UI can keep controls off. */
  const hasPendingEvents = computed(() => queue.value.length > 0)

  function start(options: StartBattleOptions) {
    reset()
    const { player, enemy, seed = randomSeed() } = options
    const created = createBattle({ player, enemy, seed })
    state.value = created.state
    queue.value = created.events
    playerName.value = options.playerName
    // The player shows as the original monster until a `transformed` event is played.
    display.value = {
      player: {
        monster: player,
        hp: created.state.player.hp,
        maxHp: created.state.player.maxHp,
        knockedOut: false,
      },
      enemy: {
        monster: enemy,
        hp: created.state.enemy.hp,
        maxHp: created.state.enemy.maxHp,
        knockedOut: false,
      },
    }
  }

  /** Runs an action through the reducer and queues the resulting events for playback. */
  function dispatch(action: BattleAction): BattleResult {
    if (!state.value) throw new Error('No battle in progress.')
    const result = battleReducer(state.value, action)
    if (result.ok) {
      state.value = result.state
      queue.value.push(...result.events)
    }
    return result
  }

  function shiftEvent(): BattleEvent | undefined {
    return queue.value.shift()
  }

  function addLog(entry: Omit<LogEntry, 'id' | 'attackerName'>) {
    if (!display.value) return
    const attackerName =
      entry.actor === 'player'
        ? `${playerName.value}'s ${display.value.player.monster.name}`
        : display.value.enemy.monster.name
    log.value.unshift({ id: nextLogId++, attackerName, ...entry })
  }

  /** Moves the on-screen state forward by one event. Called by playback at the right moment. */
  function applyEvent(event: BattleEvent) {
    const shown = display.value
    if (!shown || !state.value) return
    switch (event.type) {
      case 'battleStarted':
        shown.player.maxHp = shown.player.hp = event.playerMaxHp
        shown.enemy.maxHp = shown.enemy.hp = event.enemyMaxHp
        break
      case 'transformed': {
        // A copying Ditto takes over looks, size and (UI choice) the facing of what it copied.
        const copied = state.value.enemy.monster
        shown.player.monster = {
          ...shown.player.monster,
          image: event.into.image,
          size: event.into.size,
          facing: copied.facing,
        }
        shown.player.maxHp = event.into.maxHp
        break
      }
      case 'attack':
      case 'specialAttack':
        shown[event.target].hp = event.targetHpAfter
        pendingHit = { actor: event.actor, kind: event.type, value: event.damage }
        break
      case 'effectiveness':
        if (pendingHit && pendingHit.actor === event.actor) {
          addLog({ ...pendingHit, effectiveness: event.label })
        }
        pendingHit = null
        break
      case 'heal':
        shown[event.actor].hp = event.hpAfter
        addLog({ actor: event.actor, kind: 'heal', value: event.rolled })
        break
      case 'knockedOut':
        shown[event.side].knockedOut = true
        break
      case 'run':
      case 'battleEnded':
        break
    }
  }

  /**
   * Emergency exit for a playback that broke: drops the queued events and makes the screen
   * show the engine's real state (HP, looks, who is knocked out). The log may miss lines.
   */
  function syncDisplayToState() {
    const current = state.value
    if (!current || !display.value) return
    queue.value = []
    pendingHit = null
    const side = (combatant: typeof current.player): DisplaySide => ({
      monster: combatant.monster,
      hp: combatant.hp,
      maxHp: combatant.maxHp,
      knockedOut: combatant.hp <= 0,
    })
    display.value = { player: side(current.player), enemy: side(current.enemy) }
  }

  function reset() {
    epoch.value++
    pendingHit = null
    state.value = null
    queue.value = []
    display.value = null
    log.value = []
    playerName.value = ''
    isPlaying.value = false
  }

  return {
    state,
    queue,
    display,
    log,
    isPlaying,
    epoch,
    availableActions,
    availability,
    isEnded,
    outcome,
    hasPendingEvents,
    start,
    dispatch,
    shiftEvent,
    applyEvent,
    syncDisplayToState,
    reset,
  }
})
