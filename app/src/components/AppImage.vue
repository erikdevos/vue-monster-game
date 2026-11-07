<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * An image that survives failing to load: it is replaced by a placeholder of the same shape,
 * so the layout does not collapse and the screen stays usable. Classes land on whichever
 * element is rendered (img, picture or placeholder).
 */
const props = defineProps<{
  src: string
  /** Empty for decorative images (the text next to them already says what it is). */
  alt: string
  width: number
  height: number
  loading?: 'lazy' | 'eager'
  /** Larger version for wide screens (`<picture>`). */
  hqSrc?: string
  hqMedia?: string
  hqSize?: number
}>()

const failed = ref(false)
watch(
  () => [props.src, props.hqSrc],
  () => {
    failed.value = false
  },
)
</script>

<template>
  <span
    v-if="failed"
    class="image-fallback"
    :role="alt ? 'img' : undefined"
    :aria-label="alt || undefined"
    :aria-hidden="alt ? undefined : 'true'"
    :style="{ aspectRatio: `${width} / ${height}` }"
  ></span>
  <picture v-else-if="hqSrc">
    <source
      :media="hqMedia ?? '(min-width: 480px)'"
      :srcset="hqSrc"
      :width="hqSize ?? width"
      :height="hqSize ?? height"
    />
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      @error="failed = true"
    />
  </picture>
  <img
    v-else
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    @error="failed = true"
  />
</template>

<style lang="scss">
.image-fallback {
  display: block;
  background-color: rgb(0 0 0 / 8%);
  border-radius: var(--border-radius-m);

  &::after {
    content: '?';
    display: grid;
    place-items: center;
    height: 100%;
    min-height: 2rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: rgb(0 0 0 / 35%);
  }
}
</style>
