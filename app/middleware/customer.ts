import { useAuthStore } from '~/stores/auth'
export default defineNuxtRouteMiddleware(async (to) => {
  // Client navigation is a usability check; API handlers enforce ownership.
  if (import.meta.server) return
  const auth = useAuthStore()
  await auth.ensureSession()
  if (!auth.user) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  if (!auth.isCustomer) return navigateTo('/admin')
})
