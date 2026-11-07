<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import TrainerPicker from '@/components/TrainerPicker.vue'
import { trainers, type Trainer } from '@/data'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()
const name = ref(game.playerName)

function choose(trainer: Trainer) {
  game.setPlayer(name.value, trainer.id)
  void router.push({ name: 'partner' })
}
</script>

<template>
  <div class="screen">
    <div class="container">
      <h1><label for="player-name">What's your name?</label></h1>
      <input
        id="player-name"
        v-model="name"
        type="text"
        maxlength="20"
        autocomplete="nickname"
        class="name-input"
      />
    </div>
    <div class="container">
      <h2>Select your avatar</h2>
      <TrainerPicker :trainers="trainers" @select="choose" />
    </div>
    <BackButton />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.name-input {
  text-align: center;

  @include tablet-down {
    width: 100%;
  }
}
</style>
