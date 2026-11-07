import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getMonsterById, monsters, stages, trainers } from '@/data'
import { mathRandomRng, type Rng } from '@/domain/rng'
import { readSession, removeSession, writeSession } from './storage'

export const DEFAULT_PLAYER_NAME = 'Trainer'
export const GAME_STORAGE_KEY = 'monster-game-v2:game'
export const MAX_NAME_LENGTH = 20

interface Persisted {
  playerName: string
  trainerId: number | null
  partnerId: number | null
  enemyId: number | null
  stageId: string | null
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

/** A usable name: text, trimmed, not too long; otherwise the default. */
function cleanName(value: unknown): string {
  const name = typeof value === 'string' ? value.trim().slice(0, MAX_NAME_LENGTH).trim() : ''
  return name || DEFAULT_PLAYER_NAME
}

/** Reads what a previous page load saved. Anything unexpected is ignored. */
function load(): Persisted {
  const raw = readSession(GAME_STORAGE_KEY)
  const data = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    playerName: cleanName(data.playerName),
    trainerId:
      isId(data.trainerId) && trainers.some((t) => t.id === data.trainerId) ? data.trainerId : null,
    partnerId: isId(data.partnerId) && getMonsterById(data.partnerId) ? data.partnerId : null,
    enemyId: isId(data.enemyId) && getMonsterById(data.enemyId) ? data.enemyId : null,
    stageId:
      typeof data.stageId === 'string' && stages.some((s) => s.id === data.stageId)
        ? data.stageId
        : null,
  }
}

/** The player's choices on the way to a battle. Survives a refresh via sessionStorage. */
export const useGameStore = defineStore('game', () => {
  const initial = load()
  const playerName = ref(initial.playerName)
  const trainerId = ref(initial.trainerId)
  const partnerId = ref(initial.partnerId)
  const enemyId = ref(initial.enemyId)
  const stageId = ref(initial.stageId)

  const trainer = computed(() => trainers.find((t) => t.id === trainerId.value) ?? null)
  const partner = computed(() =>
    partnerId.value === null ? null : (getMonsterById(partnerId.value) ?? null),
  )
  const enemy = computed(() =>
    enemyId.value === null ? null : (getMonsterById(enemyId.value) ?? null),
  )
  const stage = computed(() => stages.find((s) => s.id === stageId.value) ?? null)

  /** True when everything needed to start a battle has been chosen. */
  const isReadyForBattle = computed(
    () => !!(trainer.value && partner.value && enemy.value && stage.value),
  )

  watch(
    [playerName, trainerId, partnerId, enemyId, stageId],
    () =>
      writeSession(GAME_STORAGE_KEY, {
        playerName: playerName.value,
        trainerId: trainerId.value,
        partnerId: partnerId.value,
        enemyId: enemyId.value,
        stageId: stageId.value,
      } satisfies Persisted),
    { flush: 'sync' },
  )

  function randomMonsterId(rng: Rng): number {
    const index = Math.floor(rng.next() * monsters.length)
    return (monsters[index] ?? monsters[0] ?? { id: 1 }).id
  }

  /** An empty name falls back to the default, as the legacy game did. */
  function setPlayer(name: string, chosenTrainerId: number) {
    playerName.value = cleanName(name)
    trainerId.value = chosenTrainerId
  }

  function choosePartner(choice: number | 'random', rng: Rng = mathRandomRng) {
    partnerId.value = choice === 'random' ? randomMonsterId(rng) : choice
  }

  function chooseEnemy(choice: number | 'random', rng: Rng = mathRandomRng) {
    enemyId.value = choice === 'random' ? randomMonsterId(rng) : choice
  }

  function chooseStage(id: string) {
    stageId.value = id
  }

  function reset() {
    playerName.value = DEFAULT_PLAYER_NAME
    trainerId.value = null
    partnerId.value = null
    enemyId.value = null
    stageId.value = null
    removeSession(GAME_STORAGE_KEY)
  }

  return {
    playerName,
    trainerId,
    partnerId,
    enemyId,
    stageId,
    trainer,
    partner,
    enemy,
    stage,
    isReadyForBattle,
    setPlayer,
    choosePartner,
    chooseEnemy,
    chooseStage,
    reset,
  }
})
