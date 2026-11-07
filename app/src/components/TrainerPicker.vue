<script setup lang="ts">
import { trainerUrl } from '@/assets'
import type { Trainer } from '@/data/trainers'
import AppImage from './AppImage.vue'

defineProps<{ trainers: readonly Trainer[] }>()
defineEmits<{ select: [trainer: Trainer] }>()
</script>

<template>
  <ul class="trainer-list">
    <li v-for="trainer in trainers" :key="trainer.id">
      <button type="button" class="trainer-card" @click="$emit('select', trainer)">
        <AppImage
          class="trainer-card__image"
          :src="trainerUrl(trainer)"
          :alt="`Trainer ${trainer.alias}`"
          :width="trainer.width"
          :height="trainer.height"
          loading="lazy"
        />
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.trainer-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: center;
  gap: 1rem;
  max-height: 28rem;
  overflow-x: auto;
  padding: 3px;

  @include tablet-down {
    grid-template-columns: repeat(3, 1fr);
  }

  @include phone-down {
    grid-template-columns: repeat(2, 1fr);
  }
}

.trainer-card {
  @include card-button;
  padding: 1rem 2rem 0.25rem;
  display: grid;
  justify-content: center;

  &__image {
    display: block;
    object-fit: contain;
    width: 100%;
    height: 100%;
    max-width: 4rem;
    max-height: 8rem;
    transition: transform 0.4s ease;
    filter: drop-shadow(3px 2px 2px rgb(0 0 0 / 40%));
  }

  &:hover &__image,
  &:focus-visible &__image {
    transform: scale(1.1);

    @include phone-down {
      transform: scale(1.05);
    }
  }
}
</style>
