<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import ActionBar from '@/components/ActionBar.vue'
import BattleLog from '@/components/BattleLog.vue'
import CombatantPanel from '@/components/CombatantPanel.vue'
import { useBattlePlayback } from '@/composables/useBattlePlayback'
import type { ActionType, Side } from '@/domain/battle'
import { useBattleStore } from '@/stores/battle'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const battle = useBattleStore()
const router = useRouter()

const panels = {
  player: ref<InstanceType<typeof CombatantPanel> | null>(null),
  enemy: ref<InstanceType<typeof CombatantPanel> | null>(null),
}
const sideRef = (side: Side) => panels[side]

const playback = useBattlePlayback(battle, {
  sprite: (side) => sideRef(side).value?.sprite,
  bar: (side) => sideRef(side).value?.bar,
})

/** Controls stay off while events play, and until the opening events have played. */
const busy = computed(() => battle.isPlaying || battle.hasPendingEvents)

async function playAll() {
  const result = await playback.play()
  if (result === 'completed' && battle.isEnded) await router.push({ name: 'result' })
}

async function onAction(type: ActionType) {
  if (busy.value) return
  const result = battle.dispatch({ type })
  if (result.ok) await playAll()
}

// Async hooks and handlers: an error thrown while playing reaches app.config.errorHandler.
onMounted(async () => {
  // Always a fresh battle: a refresh or returning from the result screen restarts the fight.
  if (!game.partner || !game.enemy) return
  battle.start({ player: game.partner, enemy: game.enemy, playerName: game.playerName })
  await playAll()
})

// Leaving for anywhere but the result screen drops the battle and stops all playback.
onBeforeRouteLeave((to) => {
  if (to.name !== 'result') battle.reset()
})
</script>

<template>
  <div class="screen battle-screen">
    <h1 class="visually-hidden">Battle</h1>
    <section
      v-if="battle.display && game.stage"
      class="container battle-stage"
      aria-label="Battle stage"
    >
      <CombatantPanel
        :ref="(el) => (panels.enemy.value = el as InstanceType<typeof CombatantPanel> | null)"
        side="enemy"
        :monster="battle.display.enemy.monster"
        :hp="battle.display.enemy.hp"
        :max-hp="battle.display.enemy.maxHp"
        :knocked-out="battle.display.enemy.knockedOut"
        :stage="game.stage"
      />
      <CombatantPanel
        :ref="(el) => (panels.player.value = el as InstanceType<typeof CombatantPanel> | null)"
        side="player"
        :monster="battle.display.player.monster"
        :hp="battle.display.player.hp"
        :max-hp="battle.display.player.maxHp"
        :knocked-out="battle.display.player.knockedOut"
        :stage="game.stage"
        :trainer="game.trainer"
        :player-name="game.playerName"
      />
    </section>

    <ActionBar
      v-if="battle.availability"
      :availability="battle.availability"
      :busy="busy"
      @action="onAction"
    />
    <BattleLog :entries="battle.log" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.battle-screen {
  max-width: 70rem;
}

.battle-stage {
  display: flex;
  gap: 1.5rem;
  row-gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  @include phone-down {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
