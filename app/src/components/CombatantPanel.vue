<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  monsterHqUrl,
  monsterThumbUrl,
  MONSTER_HQ_SIZE,
  MONSTER_THUMB_SIZE,
  stageUrl,
  trainerUrl,
} from '@/assets'
import type { Stage } from '@/data/stages'
import type { Trainer } from '@/data/trainers'
import type { Side } from '@/domain/battle'
import type { Monster } from '@/domain/monster'
import { shouldFlip } from '@/ui/facing'
import AppImage from './AppImage.vue'
import HealthBar from './HealthBar.vue'
import TypeDot from './TypeDot.vue'

const props = defineProps<{
  side: Side
  monster: Monster
  hp: number
  maxHp: number
  knockedOut: boolean
  stage: Stage
  /** Player side only. */
  trainer?: Trainer | null
  playerName?: string
}>()

const sprite = ref<HTMLElement | null>(null)
const healthBar = ref<InstanceType<typeof HealthBar> | null>(null)
/** What playback animates: the sprite wrapper and the inner bar. */
defineExpose({ sprite, bar: computed(() => healthBar.value?.bar ?? null) })

const flipMonster = computed(() => shouldFlip(props.side, props.monster.facing))
const flipTrainer = computed(() => !!props.trainer && shouldFlip('trainer', props.trainer.facing))
const title = computed(() =>
  props.side === 'player'
    ? `${props.playerName ?? 'Trainer'} & ${props.monster.name}`
    : props.monster.name,
)
</script>

<template>
  <div
    class="panel"
    :class="`panel--${side}`"
    :style="{ backgroundImage: `url(${stageUrl(stage)})` }"
  >
    <h2 class="panel__title">
      <span class="panel__who">
        <TypeDot :type="monster.type" class="panel__type" />
        <span>{{ title }}</span>
      </span>
      <span class="panel__hp">{{ hp }} hp</span>
    </h2>

    <div class="panel__images">
      <AppImage
        v-if="trainer"
        class="panel__trainer"
        :class="{ 'is-flipped': flipTrainer }"
        :src="trainerUrl(trainer)"
        :alt="`Trainer ${trainer.alias}`"
        :width="trainer.width"
        :height="trainer.height"
      />
      <div
        ref="sprite"
        class="sprite"
        :class="[`size-${monster.size}`, { 'is-knocked-out': knockedOut }]"
      >
        <AppImage
          class="sprite__picture"
          :class="{ 'is-flipped': flipMonster }"
          :src="monsterThumbUrl(monster)"
          :hq-src="monsterHqUrl(monster)"
          :hq-size="MONSTER_HQ_SIZE"
          :alt="monster.name"
          :width="MONSTER_THUMB_SIZE"
          :height="MONSTER_THUMB_SIZE"
        />
      </div>
    </div>

    <HealthBar ref="healthBar" :hp="hp" :max-hp="maxHp" :label="`${monster.name} hit points`" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: var(--border-radius-sm);
  background-color: lightgray;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;

  @include tablet-down {
    padding: 1rem;
  }

  @include phone-down {
    padding: 0.7rem;
    min-height: 16rem;
  }

  &--enemy {
    margin-bottom: 1rem;

    @include phone-down {
      margin-right: 1rem;
      margin-bottom: 0;
    }
  }

  &--player {
    margin-top: 1rem;

    @include phone-down {
      margin-left: 1rem;
      margin-top: 0;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 0 0 1rem;
    font-size: 1.5rem;

    @include phone-down {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      gap: 0.5rem;
    }

    span {
      text-shadow: 1px 1px white;
    }
  }

  &__who {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    gap: 1rem;

    @include phone-down {
      gap: 0.5rem;
    }
  }

  &__type {
    border: solid 2px #fff;
  }

  &__hp {
    font-size: 1rem;
    font-weight: 600;

    @include tablet-down {
      display: none;
    }
  }

  &__images {
    display: flex;
    justify-content: center;
    margin-top: auto;
    margin-bottom: 1rem;
    gap: 1rem;
    z-index: 1;
    position: relative;

    @include phone-down {
      gap: 0.5rem;
    }
  }

  &__trainer {
    width: 5rem;
    height: 100%;
    max-height: 14rem;
    object-fit: contain;
    object-position: bottom;
    margin-top: auto;
    filter: drop-shadow(2px 3px 1px rgb(0 0 0 / 50%));

    @include tablet-down {
      width: 4rem;
      max-height: 9rem;
    }

    &.is-flipped {
      transform: scaleX(-1);
    }
  }
}

.sprite {
  margin-top: auto;
  filter: drop-shadow(2px 3px 1px rgb(0 0 0 / 50%));
  @include monster-sizes;

  &.is-knocked-out {
    opacity: 0;
    visibility: hidden;
  }

  &__picture {
    display: block;
    width: 100%;
    height: 100%;

    &.is-flipped {
      transform: scaleX(-1);
    }

    :deep(img) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
