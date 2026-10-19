import { useAuthStore } from '~/stores/auth'
export default defineNuxtPlugin((nuxtApp) => {
  // Browser starts without a visible identity, avoiding SSR profile mismatches.
  nuxtApp.hook('app:mounted', () => { void useAuthStore().ensureSession() })
})
