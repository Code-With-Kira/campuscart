import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PublicAccount } from '~/types/account'
import {
  enterDemoPersona, getDemoSession, loginDemoAccount,
  logoutDemoAccount, registerDemoAccount, updateDemoProfile,
} from '~/services/account'

// The cookie is HttpOnly on the server; Pinia stores only the public profile.
// This does NOT implement production auth or authorization.
export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicAccount | null>(null)
  const initialized = ref(false)
  const busy = ref(false)
  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  let loadingSession: Promise<void> | null = null

  async function ensureSession(force = false) {
    if (!force && initialized.value) return
    if (loadingSession) return loadingSession
    loadingSession = (async () => {
      try { user.value = await getDemoSession() }
      catch { user.value = null }
      finally { initialized.value = true }
    })()
    try { await loadingSession } finally { loadingSession = null }
  }
  async function login(email: string, password: string) {
    busy.value = true
    try { user.value = await loginDemoAccount(email, password); initialized.value = true }
    finally { busy.value = false }
  }
  async function register(body: { first_name: string; last_name: string; email: string; password: string }) {
    busy.value = true
    try { user.value = await registerDemoAccount(body); initialized.value = true }
    finally { busy.value = false }
  }
  async function preview(role: 'CUSTOMER' | 'ADMIN') {
    busy.value = true
    try { user.value = await enterDemoPersona(role); initialized.value = true }
    finally { busy.value = false }
  }
  async function updateProfile(body: { first_name: string; last_name: string; email: string }) {
    busy.value = true
    try { user.value = await updateDemoProfile(body) }
    finally { busy.value = false }
  }
  async function logout() {
    busy.value = true
    try { await logoutDemoAccount(); user.value = null; initialized.value = true }
    finally { busy.value = false }
  }
  return { user, initialized, busy, isCustomer, isAdmin, ensureSession, login, register, preview, updateProfile, logout }
})
