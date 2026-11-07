<script setup lang="ts">
import type { LogEntry } from '@/stores/battle'
import { effectivenessText } from '@/ui/text'

defineProps<{ entries: readonly LogEntry[] }>()

const actionText = (entry: LogEntry) =>
  entry.kind === 'specialAttack' ? 'uses a special attack and deals' : 'attacks and deals'
</script>

<template>
  <section
    class="container battle-log"
    :class="{ 'visually-hidden': entries.length === 0 }"
    aria-labelledby="battle-log-title"
  >
    <!-- Always in the DOM, so a screen reader is already watching the list when the first line
         arrives. Empty, it is visually hidden. Lines are complete when they are added and are
         never re-rendered, so each is announced once. Newest first. -->
    <h2 id="battle-log-title">Battle Log</h2>
    <ul aria-live="polite" aria-relevant="additions">
      <li v-for="entry in entries" :key="entry.id">
        <span :class="entry.actor === 'player' ? 'log--player' : 'log--monster'">{{
          entry.attackerName
        }}</span
        >{{ ' ' }}
        <span v-if="entry.kind === 'heal'"
          >heals itself for <span class="log--heal">{{ entry.value }}</span></span
        >
        <span v-else
          >{{ actionText(entry) }}
          <span class="log--attack"
            ><strong>{{ entry.value }}</strong> damage</span
          >
          <span v-if="entry.effectiveness" class="effectiveness"
            >{{ ' ' }}({{ effectivenessText(entry.effectiveness) }})</span
          ></span
        >
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.battle-log {
  h2 {
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 5rem;
    overflow-x: auto;

    @include phone-down {
      font-size: 0.9rem;
    }
  }

  li {
    margin: 0.5rem 0;
  }

  .log--player {
    color: #7700ff;
  }

  .log--monster {
    color: #8a5a00;
  }

  .log--heal {
    color: green;
  }
}
</style>
