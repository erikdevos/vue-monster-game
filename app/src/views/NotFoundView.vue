<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="screen">
    <div class="container">
      <h1>Page not found</h1>
      <p>There is no screen at this address.</p>
      <button type="button" class="button" @click="router.push({ name: 'title' })">
        Back to the start
      </button>
    </div>
  </div>
</template>
