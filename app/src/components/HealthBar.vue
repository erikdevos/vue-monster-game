<script setup lang="ts">
import { computed, ref } from 'vue'
import { healthLevel, healthPercentage } from '@/ui/health'

const props = defineProps<{ hp: number; maxHp: number; label: string }>()

/** The inner bar. Playback animates its width, so it is exposed. */
const bar = ref<HTMLElement | null>(null)
defineExpose({ bar })

const percentage = computed(() => healthPercentage(props.hp, props.maxHp))
const level = computed(() => healthLevel(percentage.value))
</script>

<template>
  <div
    class="healthbar"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="maxHp"
    :aria-valuenow="hp"
    :aria-valuetext="`${hp} of ${maxHp} hp`"
  >
    <div
      ref="bar"
      class="healthbar__value"
      :class="`healthbar__value--${level}`"
      :style="{ width: `${percentage}%` }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.healthbar {
  width: 100%;
  height: 1.5rem;
  margin: 0;
  background: #fde5e5;
  border: solid 2px #fff;
  border-radius: var(--border-radius-s);
  overflow: hidden;
  z-index: 2;
  position: relative;

  @include tablet-down {
    height: 1.3rem;
  }

  @include phone-down {
    height: 1rem;
  }

  &__value {
    background-color: #00a876;
    height: 100%;

    &--warning {
      background-color: orange;
    }

    &--danger {
      background-color: red;
    }
  }
}
</style>
