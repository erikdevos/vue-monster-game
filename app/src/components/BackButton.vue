<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isStepName, previousStep } from '@/router/steps'

const route = useRoute()
const router = useRouter()

const previous = computed(() => (isStepName(route.name) ? previousStep(route.name) : null))

/** Uses real history when there is some, so the browser back button and this one agree. */
function goBack() {
  if (router.options.history.state.back) router.back()
  else if (previous.value) void router.push({ name: previous.value })
}
</script>

<template>
  <button v-if="previous" type="button" class="button back-button" @click="goBack">Back</button>
</template>

<style scoped lang="scss">
.back-button {
  align-self: center;
  margin: 0 auto 1rem;
  display: block;
}
</style>
