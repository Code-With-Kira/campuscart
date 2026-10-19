<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { validateRegistration, type FieldErrors } from '~/utils/accountValidation'
import type { RegistrationDraft } from '~/types/account'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Create Demo Account | CampusCart' })
const auth = useAuthStore()
const draft = reactive<RegistrationDraft>({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' })
const errors = ref<FieldErrors>({})
const serverError = ref('')
const showPassword = ref(false)
async function submit() {
  errors.value = validateRegistration(draft)
  serverError.value = ''
  if (Object.keys(errors.value).length) return
  try {
    await auth.register({ first_name: draft.first_name, last_name: draft.last_name, email: draft.email, password: draft.password })
    draft.password = ''
    draft.confirm_password = ''
    await navigateTo('/profile')
  } catch {
    serverError.value = 'Registration failed. Check your details or try a different fictional demo email.'
  }
}
</script>

<template>
  <section>
    <p class="mb-2 text-center text-xs font-bold uppercase tracking-widest text-campus-green">Stage 6 · Local-only</p>
    <h1 class="text-center text-3xl font-black text-campus-emerald">Create Your Account</h1>
    <p class="mt-3 text-center text-sm leading-6 text-gray-600">Register a temporary demo customer. No real purchases or persistent accounts are created.</p>
    <p class="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Use invented personal details and a unique demo password. Data lasts only while this server runs; do not enter real credentials.</p>
    <form class="mt-7 space-y-5" novalidate @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label for="reg-first" class="mb-2 block text-sm font-semibold">First name</label><input id="reg-first" v-model.trim="draft.first_name" autocomplete="given-name" maxlength="100" :aria-invalid="Boolean(errors.first_name)" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.first_name" class="mt-1 text-xs text-red-700">{{ errors.first_name }}</p></div>
        <div><label for="reg-last" class="mb-2 block text-sm font-semibold">Last name</label><input id="reg-last" v-model.trim="draft.last_name" autocomplete="family-name" maxlength="100" :aria-invalid="Boolean(errors.last_name)" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.last_name" class="mt-1 text-xs text-red-700">{{ errors.last_name }}</p></div>
      </div>
      <div><label for="reg-email" class="mb-2 block text-sm font-semibold">Demo email</label><input id="reg-email" v-model.trim="draft.email" type="email" autocomplete="email" maxlength="255" :aria-invalid="Boolean(errors.email)" class="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="student@example.test"><p v-if="errors.email" class="mt-1 text-xs text-red-700">{{ errors.email }}</p></div>
      <div><label for="reg-password" class="mb-2 block text-sm font-semibold">Demo password (at least 12 characters)</label><div class="flex gap-2"><input id="reg-password" v-model="draft.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="12" maxlength="128" :aria-invalid="Boolean(errors.password)" class="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3"><button type="button" class="rounded-lg border border-gray-300 px-3 text-sm font-semibold text-campus-emerald" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button></div><p v-if="errors.password" class="mt-1 text-xs text-red-700">{{ errors.password }}</p></div>
      <div><label for="reg-confirm" class="mb-2 block text-sm font-semibold">Confirm password</label><input id="reg-confirm" v-model="draft.confirm_password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" maxlength="128" :aria-invalid="Boolean(errors.confirm_password)" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.confirm_password" class="mt-1 text-xs text-red-700">{{ errors.confirm_password }}</p></div>
      <p v-if="serverError" class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{{ serverError }}</p>
      <button type="submit" :disabled="auth.busy" class="min-h-12 w-full rounded-xl bg-campus-emerald px-5 font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ auth.busy ? 'Creating demo account…' : 'Register Demo Account' }}</button>
    </form>
    <p class="mt-7 text-center text-sm">Already have a demo account? <NuxtLink to="/login" class="font-bold text-campus-green hover:underline">Log in</NuxtLink>.</p>
  </section>
</template>
