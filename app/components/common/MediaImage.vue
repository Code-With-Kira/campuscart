<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FALLBACK_PRODUCT_IMAGE, safeImageUrl } from '~/utils/productMedia'

const props = withDefaults(defineProps<{
  src?: string | null
  fallback?: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
}>(), { fallback: FALLBACK_PRODUCT_IMAGE, loading: 'lazy' })

const candidate = computed(() => safeImageUrl(props.src) ?? safeImageUrl(props.fallback) ?? FALLBACK_PRODUCT_IMAGE)
const active = ref(candidate.value)
watch(candidate, next => { active.value = next })
function useFallback() {
  const fallback = safeImageUrl(props.fallback) ?? FALLBACK_PRODUCT_IMAGE
  // A missing fallback cannot cause an infinite image-error loop.
  if (active.value !== fallback) active.value = fallback
}
</script>

<template>
  <img
    :src="active"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    decoding="async"
    @error="useFallback"
  >
</template>
