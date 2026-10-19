<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { validateEmail } from '~/utils/accountValidation'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Demo Login | CampusCart' })
const auth = useAuthStore()
const route = useRoute()
const email = ref('')
const password = ref('')
const visible = ref(false)
const errorMessage = ref('')
const emailError = ref('')
// Default disabled for backend handoff. Local QA may explicitly opt into previews.
const showDemoButtons = import.meta.dev && String(useRuntimeConfig().public.enableDemoPreview) === 'true'

function redirectFor(role: string) {
  const requested = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  // Only permit relative in-app paths; never redirect to third-party URLs.
  const safe = requested.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\')
  return safe ? requested : (role === 'ADMIN' ? '/admin' : '/profile')
}
async function submit() {
  emailError.value = validateEmail(email.value)
  errorMessage.value = ''
  if (emailError.value) return
  if (!password.value) { errorMessage.value = 'Enter the demo password for an account registered in this session.'; return }
  try {
    await auth.login(email.value, password.value)
    await navigateTo(redirectFor(auth.user?.role ?? 'CUSTOMER'))
  } catch {
    errorMessage.value = 'Login failed. Use a demo account created during this server session, and check your credentials.'
  } finally { password.value = '' }
}
async function preview(role: 'CUSTOMER' | 'ADMIN') {
  errorMessage.value = ''
  try {
    await auth.preview(role)
    await navigateTo(role === 'ADMIN' ? '/admin' : '/profile')
  } catch { errorMessage.value = 'The development-only preview is unavailable.' }
}
</script>

<template>
  <section>
    <p class="mb-2 text-center text-xs font-bold uppercase tracking-widest text-campus-green">Stage 6 · Development demo</p>
    <h1 class="text-center text-3xl font-black text-campus-emerald">Welcome Back</h1>
    <p class="mt-3 text-center text-sm leading-6 text-gray-600">Log in to an account registered during this local server run. Accounts reset when the server restarts.</p>
    <div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="note">
      Use fictional email addresses and passwords only. This is not a production account service.
    </div>
    <form class="mt-7 space-y-5" novalidate @submit.prevent="submit">
      <div>
        <label for="login-email" class="mb-2 block text-sm font-semibold text-gray-800">Email address</label>
        <input id="login-email" v-model.trim="email" type="email" autocomplete="username" maxlength="255" :aria-invalid="Boolean(emailError)" aria-describedby="login-email-error" class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900" placeholder="student@example.test">
        <p id="login-email-error" v-if="emailError" class="mt-1 text-xs text-red-700">{{ emailError }}</p>
      </div>
      <div>
        <label for="login-password" class="mb-2 block text-sm font-semibold text-gray-800">Demo password</label>
        <div class="flex gap-2">
          <input id="login-password" v-model="password" :type="visible ? 'text' : 'password'" autocomplete="current-password" class="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900" maxlength="128" required>
          <button type="button" class="rounded-lg border border-gray-300 px-3 text-sm font-semibold text-campus-emerald" :aria-label="visible ? 'Hide password' : 'Show password'" @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }}</button>
        </div>
      </div>
      <p v-if="errorMessage" class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
      <button type="submit" :disabled="auth.busy" class="min-h-12 w-full rounded-xl bg-campus-emerald px-5 font-bold text-white hover:bg-campus-green disabled:cursor-wait disabled:opacity-60">{{ auth.busy ? 'Signing in…' : 'Log In' }}</button>
    </form>
    <div v-if="showDemoButtons" class="mt-7 border-t border-gray-200 pt-6">
      <p class="mb-3 text-center text-sm font-bold text-campus-emerald">Try the interface without registering</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <button type="button" :disabled="auth.busy" class="rounded-lg border border-campus-emerald p-3 text-sm font-bold text-campus-emerald hover:bg-campus-sage disabled:opacity-60" @click="preview('CUSTOMER')">Demo Customer</button>
        <button type="button" :disabled="auth.busy" class="rounded-lg border border-campus-emerald p-3 text-sm font-bold text-campus-emerald hover:bg-campus-sage disabled:opacity-60" @click="preview('ADMIN')">Admin Preview</button>
      </div>
      <p class="mt-3 text-xs leading-5 text-gray-600">Preview shortcuts work only in development. They are intentionally unavailable in production builds.</p>
    </div>
    <p class="mt-7 text-center text-sm text-gray-700">Need a demo account? <NuxtLink to="/register" class="font-bold text-campus-green hover:underline">Register here</NuxtLink>.</p>
  </section>
</template>
