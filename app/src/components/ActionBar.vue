<script setup lang="ts">
import { computed, useId } from 'vue'
import type { ActionAvailability, ActionType } from '@/domain/battle'
import { unavailableText } from '@/ui/text'

const props = defineProps<{
  /** What the engine says about each action, with the reason when it is not possible. */
  availability: Record<ActionType, ActionAvailability>
  /** True while events are being played: nothing can be chosen then. */
  busy: boolean
}>()
const emit = defineEmits<{ action: [type: ActionType] }>()

const baseId = useId()
const actions: { type: ActionType; label: string }[] = [
  { type: 'attack', label: 'Attack' },
  { type: 'specialAttack', label: 'Special attack' },
  { type: 'heal', label: 'Heal' },
  { type: 'run', label: 'Run' },
]

const rows = computed(() =>
  actions.map((action) => {
    const availability = props.availability[action.type]
    const blocked = !availability.available
    return {
      ...action,
      hintId: `${baseId}-${action.type}`,
      disabled: props.busy || blocked,
      // Why, as text next to the button. Not while a round is playing: that is just waiting.
      hint: !props.busy && !availability.available ? unavailableText(availability.reason) : '',
    }
  }),
)

function choose(row: { type: ActionType; disabled: boolean }) {
  if (!row.disabled) emit('action', row.type)
}
</script>

<template>
  <div class="actions" role="group" aria-label="Battle actions">
    <div v-for="row in rows" :key="row.type" class="actions__item">
      <!-- aria-disabled instead of disabled: the button keeps keyboard focus while a round
           plays, and screen readers can still reach it and read why it is off. -->
      <button
        type="button"
        class="button actions__button"
        :aria-disabled="row.disabled"
        :aria-describedby="row.hint ? row.hintId : undefined"
        @click="choose(row)"
      >
        {{ row.label }}
      </button>
      <span :id="row.hintId" class="actions__hint">{{ row.hint }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.actions {
  width: 90%;
  max-width: 30rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1.5rem;
  align-items: start;
  justify-content: center;
  margin: 0 auto 1.5rem;

  @include phone-down {
    width: calc(100% - 1.4rem);
    max-width: none;
    gap: 0.3rem 0.7rem;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
  }

  &__button {
    width: 100%;
    font-weight: bold;
    text-transform: uppercase;
  }

  &__hint {
    min-height: 1.1em; // reserved, so the layout does not jump when a hint appears
    font-size: 0.85rem;
    text-align: center;
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 60%);
  }
}
</style>
