<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { appError } from '@/errors'
import { useStartAgain } from '@/session'

const route = useRoute()
const startAgain = useStartAgain()
const showHeader = computed(() => route.name !== 'title')

function reload() {
  window.location.reload()
}

/** After a screen change, keyboard and screen reader users land on the new screen's heading. */
function focusHeading(element: Element) {
  const heading = element.querySelector<HTMLElement>('h1')
  if (!heading) return
  heading.setAttribute('tabindex', '-1')
  heading.focus({ preventScroll: true })
}
</script>

<template>
  <div class="app">
    <header v-if="showHeader" class="app-header">
      <p class="app-header__brand">Pocket Monsters</p>
    </header>
    <div v-if="appError" class="app-error container" role="alert">
      <p>Something went wrong. You can start again, or reload the page.</p>
      <div class="app-error__actions">
        <button type="button" class="button" @click="startAgain">Start again</button>
        <button type="button" class="button" @click="reload">Reload page</button>
      </div>
    </div>
    <main class="app-main">
      <RouterView v-slot="{ Component, route: current }">
        <Transition name="screen-fade" mode="out-in" @after-enter="focusHeading">
          <component :is="Component" :key="current.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style lang="scss">
@use '@/styles/mixins' as *;

.app {
  display: flex;
  flex-direction: column;
  min-height: 90vh;
}

.app-main {
  display: flex;
  flex-direction: column;
  flex: 1;

  h1:focus {
    outline: none;
  }
}

.app-error {
  width: 90%;
  max-width: 40rem;
  margin: 0 auto 1rem;

  p {
    margin-top: 0;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.app-header {
  box-shadow: var(--box-shadow);
  padding: 0.5rem;
  background-color: var(--color-primary);
  color: white;
  text-align: center;
  margin-bottom: 1.5rem;

  @include phone-down {
    margin-bottom: 1rem;
  }

  &__brand {
    margin: 0;
    font-family: impact, sans-serif;
    font-size: 1.5rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;

    @include phone-down {
      font-size: 1.3rem;
    }
  }
}
</style>
