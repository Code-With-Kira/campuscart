<script setup lang="ts">
import { ref } from 'vue'
import { storefront } from '~/config/storefront'

withDefaults(defineProps<{ footer?: boolean }>(), { footer: false })
const imageFailed = ref(false)
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <img
      v-if="storefront.brand.logoSrc && !imageFailed"
      :src="storefront.brand.logoSrc"
      :alt="storefront.brand.logoAlt"
      class="max-h-10 w-auto max-w-40 object-contain"
      width="160" height="40"
      @error="imageFailed = true"
    >
    <span v-else>{{ storefront.brand.wordmarkPrimary }}<span :class="footer ? 'text-campus-gold' : 'text-campus-green'">{{ storefront.brand.wordmarkAccent }}</span></span>
  </span>
</template>
