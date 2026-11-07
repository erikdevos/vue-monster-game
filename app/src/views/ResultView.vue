<script setup lang="ts">
import BattleLog from '@/components/BattleLog.vue'
import { useStartAgain } from '@/session'
import { useBattleStore } from '@/stores/battle'

const battle = useBattleStore()
const startAgain = useStartAgain()

// A snapshot: "Start again" empties the store while this screen is still fading out, and the
// screen must not flip to "You lost!" or lose its log in that moment.
// Running away counts as a loss, as in the legacy game.
const won = battle.outcome?.winner === 'player'
const entries = battle.log.slice()
</script>

<template>
  <div class="screen">
    <div class="container">
      <h1>{{ won ? 'You won!' : 'You lost!' }}</h1>
      <button type="button" class="button" @click="startAgain">Start again!</button>
    </div>
    <BattleLog :entries="entries" />
  </div>
</template>
