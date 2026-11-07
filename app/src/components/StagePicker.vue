<script setup lang="ts">
import { stageUrl } from '@/assets'
import type { Stage } from '@/data/stages'
import AppImage from './AppImage.vue'

defineProps<{ stages: readonly Stage[] }>()
defineEmits<{ select: [stage: Stage] }>()
</script>

<template>
  <ul class="stage-list">
    <li v-for="stage in stages" :key="stage.id">
      <button type="button" class="stage-card" @click="$emit('select', stage)">
        <span class="stage-card__name">{{ stage.name }}</span>
        <span class="stage-card__frame">
          <!-- Decorative: the stage name is the button text. -->
          <AppImage
            class="stage-card__image"
            :src="stageUrl(stage)"
            alt=""
            :width="stage.width"
            :height="stage.height"
            loading="lazy"
          />
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.stage-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-height: 30rem;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 3px;

  @include tablet-down {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @include phone-down {
    max-height: 35rem;
  }
}

.stage-card {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  box-shadow: none;
  width: 100%;
  cursor: pointer;
  text-align: center;

  &__name {
    display: block;
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  &__frame {
    display: block;
    overflow: hidden;
    aspect-ratio: 1.5 / 1;
    border: solid 2px var(--color-lightgray);
    border-radius: var(--border-radius-m);
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover,
  &:focus-visible {
    background: none;
    box-shadow: none;
  }

  &:hover &__name,
  &:focus-visible &__name {
    color: var(--color-primary);
  }

  &:hover &__frame,
  &:focus-visible &__frame {
    border-color: var(--color-primary);
  }

  &:hover &__image,
  &:focus-visible &__image {
    transform: scale(1.2);
  }

  &:focus-visible {
    outline: 3px solid #1a73e8;
    outline-offset: 2px;
  }
}
</style>
