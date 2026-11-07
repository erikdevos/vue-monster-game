<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import MonsterGrid from '@/components/MonsterGrid.vue'
import { monsters } from '@/data'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const router = useRouter()

function choose(choice: number | 'random') {
  game.choosePartner(choice)
  void router.push({ name: 'enemy' })
}
</script>

<template>
  <div class="screen">
    <div class="container">
      <h1>Select your partner</h1>
      <MonsterGrid :monsters="monsters" @select="choose" />
    </div>
    <BackButton />
  </div>
</template>
