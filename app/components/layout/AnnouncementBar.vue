<script setup lang="ts">
import { ref } from 'vue'
import { storefront } from '~/config/storefront'

const isVisible = ref(true)
</script>

<template>
  <div
    v-if="isVisible"
    class="bg-campus-emerald text-white"
    role="region"
    aria-label="CampusCart announcement"
  >
    <div class="cc-container flex min-h-10 items-center justify-between gap-3 py-2">
      <p class="flex-1 text-center text-xs font-medium sm:text-sm">
        {{ storefront.announcement }}
      </p>
      <button
        type="button"
        aria-label="Dismiss announcement"
        class="shrink-0 cursor-pointer rounded px-2 py-1 text-sm hover:bg-white/15"
        @click="isVisible = false"
      >
        ✕
      </button>
    </div>
  </div>
</template>
