<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { randomIconUrl, RANDOM_ICON_SIZE } from '@/assets'
import { sortById, type Monster } from '@/domain/monster'
import { filterMonsters } from '@/ui/filterMonsters'
import AppImage from './AppImage.vue'
import MonsterCard from './MonsterCard.vue'

const props = defineProps<{ monsters: readonly Monster[] }>()
const emit = defineEmits<{ select: [choice: number | 'random'] }>()

const searchId = useId()
const query = ref('')
const visible = computed(() => filterMonsters(sortById(props.monsters), query.value))
</script>

<template>
  <div class="monster-grid">
    <div class="monster-grid__filter">
      <label :for="searchId" class="visually-hidden">Search by name, type or number</label>
      <input :id="searchId" v-model="query" type="search" placeholder="Search" autocomplete="off" />
    </div>
    <ul class="monster-grid__list">
      <li>
        <button type="button" class="random-card" @click="emit('select', 'random')">
          <span class="random-card__name"><strong>Random</strong><span>&nbsp;</span></span>
          <AppImage
            class="random-card__image"
            :src="randomIconUrl()"
            alt=""
            :width="RANDOM_ICON_SIZE.width"
            :height="RANDOM_ICON_SIZE.height"
            loading="lazy"
          />
        </button>
      </li>
      <li v-for="monster in visible" :key="monster.id">
        <MonsterCard :monster="monster" @select="emit('select', monster.id)" />
      </li>
    </ul>
    <p v-if="visible.length === 0" class="monster-grid__empty" role="status">No monsters found.</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.monster-grid {
  &__filter {
    margin-bottom: 1.5rem;

    input {
      @include phone-down {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        width: 100%;
      }
    }
  }

  &__list {
    padding: 3px 1rem 3px 3px;
    max-height: 28rem;
    overflow-x: auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    row-gap: 1.5rem;

    @include tablet-down {
      grid-template-columns: repeat(2, 1fr);
      row-gap: 1rem;
    }
  }

  &__empty {
    margin: 1rem 0 0;
  }
}

.random-card {
  @include card-button;
  padding: 0.7rem 0.7rem 0.25rem;
  height: 100%;

  @include tablet-down {
    padding: 0.5rem;
  }

  &__name {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
  }

  &__image {
    display: block;
    margin: 0 auto;
    max-width: 8rem;
    max-height: 8rem;
    width: 100%;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(3px 2px 2px rgb(0 0 0 / 40%));
  }

  &:hover &__name,
  &:focus-visible &__name {
    color: var(--color-primary);
  }
}
</style>
