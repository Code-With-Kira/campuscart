import { useCartStore } from '~/stores/cart'

// Demo-only browser-tab persistence; NEVER use for real authenticated carts.
// Initializing after app mount avoids SSR hydration mismatches.
const STORAGE_KEY = 'campuscart-demo-cart-v1'

export default defineNuxtPlugin((nuxtApp) => {
  const cart = useCartStore()

  nuxtApp.hook('app:mounted', () => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) cart.restoreFromSession(JSON.parse(raw) as unknown)
    } catch {
      // Blocked/invalid browser storage must not crash the storefront.
    }

    cart.markRestored()

    cart.$subscribe(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 1,
          items: cart.items,
        }))
      } catch {
        // Cart continues to work in memory if browser storage is unavailable.
      }
    }, { detached: true })
  })
})
