<script setup lang="ts">
import { monsterThumbUrl, MONSTER_THUMB_SIZE } from '@/assets'
import { formatNumber, type Monster } from '@/domain/monster'
import AppImage from './AppImage.vue'
import TypeDot from './TypeDot.vue'

defineProps<{ monster: Monster }>()
defineEmits<{ select: [monster: Monster] }>()
</script>

<template>
  <button type="button" class="monster-card" @click="$emit('select', monster)">
    <span class="monster-card__name">
      <strong>{{ monster.name }}</strong>
      <span class="monster-card__number">{{ formatNumber(monster.id) }}</span>
    </span>
    <TypeDot class="monster-card__type" :type="monster.type" />
    <!-- Decorative: the name is already in the button text. -->
    <AppImage
      class="monster-card__image"
      :src="monsterThumbUrl(monster)"
      alt=""
      :width="MONSTER_THUMB_SIZE"
      :height="MONSTER_THUMB_SIZE"
      loading="lazy"
    />
  </button>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.monster-card {
  @include card-button;
  position: relative;
  padding: 0.7rem 0.7rem 0.25rem;
  overflow: hidden;

  @include tablet-down {
    padding: 0.5rem;
  }

  &__name {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;

    @include phone-down {
      font-size: 1rem;
    }
  }

  &__number {
    font-weight: normal;
    font-style: italic;
    font-size: 0.8rem;

    @include phone-down {
      font-size: 0.7rem;
    }
  }

  &__type {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    z-index: 3;
  }

  &__image {
    display: block;
    margin: 0 auto;
    max-width: 8rem;
    max-height: 8rem;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.4s ease;
    filter: drop-shadow(3px 2px 2px rgb(0 0 0 / 40%));

    @include phone-down {
      max-width: 9rem;
      max-height: 7rem;
    }
  }

  &:hover &__image,
  &:focus-visible &__image {
    transform: scale(1.1);

    @include phone-down {
      transform: scale(1.05);
    }
  }

  &:hover &__name,
  &:focus-visible &__name {
    color: var(--color-primary);
  }
}
</style>
