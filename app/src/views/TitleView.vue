<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="title-screen">
    <h1 class="title-screen__title">Pocket Monsters</h1>
    <button
      type="button"
      class="button button--white title-screen__start"
      @click="router.push({ name: 'trainer' })"
    >
      Press to start
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.title-screen {
  background-color: var(--color-primary);
  background-image: var(--asset-start-screen-lg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  min-height: 80vh;
  width: 100%;
  max-width: 80vw;
  margin: 0 auto;
  padding: 3rem;
  border-radius: var(--border-radius-m);
  overflow: hidden;
  box-shadow: var(--box-shadow);

  @include tablet-down {
    max-width: 90vw;
    padding: 2rem;
  }

  @include phone-down {
    background-image: var(--asset-start-screen-sm);
  }

  &__title {
    font-family: impact, sans-serif;
    font-size: 6rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    animation: title-drop 1.2s ease-out both;

    @include tablet-down {
      font-size: 3rem;
    }

    @include phone-down {
      font-size: 3rem;
    }
  }

  &__start {
    align-self: center;
    margin-top: auto;
    border: solid 3px transparent;
    text-transform: uppercase;
    animation: start-pulse 2s ease-in-out infinite;

    &:hover,
    &:focus-visible {
      border-color: var(--color-white);
      background: var(--color-primary);
      color: var(--color-white);
    }
  }
}

// Decorative entrance and idle pulse (legacy: animate.css bounceInDown / pulse).
@keyframes title-drop {
  0% {
    opacity: 0;
    transform: translate3d(0, -60vh, 0);
  }

  60% {
    opacity: 1;
    transform: translate3d(0, 1.5rem, 0);
  }

  80% {
    transform: translate3d(0, -0.5rem, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes start-pulse {
  50% {
    transform: scale3d(1.05, 1.05, 1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .title-screen__title,
  .title-screen__start {
    animation: none;
  }
}
</style>
