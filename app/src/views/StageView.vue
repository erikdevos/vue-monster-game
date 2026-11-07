<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import StagePicker from '@/components/StagePicker.vue'
import { stages, type Stage } from '@/data'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()

function choose(stage: Stage) {
  game.chooseStage(stage.id)
  void router.push({ name: 'battle' })
}
</script>

<template>
  <div class="screen">
    <div class="container">
      <h1>Select your stage</h1>
      <StagePicker :stages="stages" @select="choose" />
    </div>
    <BackButton />
  </div>
</template>
