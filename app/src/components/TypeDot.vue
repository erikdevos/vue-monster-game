<script setup lang="ts">
import type { MonsterType } from '@/domain/monster'

defineProps<{ type: MonsterType }>()
</script>

<template>
  <span class="type-dot" :style="{ backgroundColor: `var(--type-${type})` }">
    <span class="visually-hidden">{{ type }}</span>
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.type-dot {
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 100%;
  background-color: #fff;
  display: inline-block;

  @include tablet-down {
    width: 1rem;
    height: 1rem;
  }
}
</style>
