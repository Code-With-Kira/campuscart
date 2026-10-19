import { useAuthStore } from '~/stores/auth'
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  await auth.ensureSession()
  if (!auth.user) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  if (!auth.isAdmin) return navigateTo('/profile')
})
