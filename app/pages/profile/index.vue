<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { validateEmail, validateNames, type FieldErrors } from '~/utils/accountValidation'

definePageMeta({ middleware: 'customer' })
useHead({ title: 'My Profile | CampusCart' })
const auth = useAuthStore()
const draft = reactive({ first_name: '', last_name: '', email: '' })
const errors = ref<FieldErrors>({})
const feedback = ref('')
const savingError = ref('')
watch(() => auth.user, (user) => {
  if (user) Object.assign(draft, { first_name: user.first_name, last_name: user.last_name, email: user.email })
}, { immediate: true })
async function save() {
  errors.value = validateNames(draft.first_name, draft.last_name)
  const problem = validateEmail(draft.email)
  if (problem) errors.value.email = problem
  if (Object.keys(errors.value).length) return
  savingError.value = ''; feedback.value = ''
  try { await auth.updateProfile({ ...draft }); feedback.value = 'Your temporary demo profile was updated.' }
  catch { savingError.value = 'Could not save your demo profile. Try again.' }
}
async function logout() {
  try { await auth.logout(); await navigateTo('/login') }
  catch { savingError.value = 'Unable to sign out. Please try again.' }
}
</script>

<template>
  <section class="cc-container py-10 sm:py-14">
    <p class="text-sm font-semibold text-campus-green">Customer account · Demo mode</p>
    <h1 class="mt-2 text-3xl font-black text-campus-emerald sm:text-4xl">My Profile</h1>
    <p class="mt-3 max-w-3xl text-sm leading-7 text-gray-600">Your profile exists in temporary server memory. Use fictional details only; this is not a secure production account.</p>
    <div class="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_290px]">
      <form class="rounded-2xl border border-gray-200 p-6 shadow-sm sm:p-8" novalidate @submit.prevent="save">
        <h2 class="mb-5 text-xl font-bold text-campus-emerald">Account details</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <div><label for="profile-first" class="mb-2 block text-sm font-semibold">First name</label><input id="profile-first" v-model.trim="draft.first_name" maxlength="100" autocomplete="given-name" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.first_name" class="mt-1 text-xs text-red-700">{{ errors.first_name }}</p></div>
          <div><label for="profile-last" class="mb-2 block text-sm font-semibold">Last name</label><input id="profile-last" v-model.trim="draft.last_name" maxlength="100" autocomplete="family-name" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.last_name" class="mt-1 text-xs text-red-700">{{ errors.last_name }}</p></div>
          <div class="sm:col-span-2"><label for="profile-email" class="mb-2 block text-sm font-semibold">Email</label><input id="profile-email" v-model.trim="draft.email" type="email" maxlength="255" autocomplete="email" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.email" class="mt-1 text-xs text-red-700">{{ errors.email }}</p></div>
        </div>
        <p v-if="feedback" role="status" class="mt-5 rounded-xl bg-campus-sage p-4 text-sm font-semibold text-campus-emerald">{{ feedback }}</p>
        <p v-if="savingError" role="alert" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{{ savingError }}</p>
        <button type="submit" :disabled="auth.busy" class="mt-6 min-h-12 rounded-xl bg-campus-emerald px-6 font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ auth.busy ? 'Saving…' : 'Save Changes' }}</button>
        <dl class="mt-7 space-y-2 border-t border-gray-200 pt-5 text-xs text-gray-600"><div>Role: <strong>{{ auth.user?.role ?? '—' }}</strong></div><div>Account status: <strong>{{ auth.user?.account_status ?? '—' }}</strong></div></dl>
      </form>
      <aside class="rounded-2xl bg-campus-sage p-6">
        <h2 class="text-lg font-extrabold text-campus-emerald">My CampusCart</h2>
        <nav class="mt-5 flex flex-col gap-3" aria-label="Customer account navigation">
          <NuxtLink to="/profile/addresses" class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campus-emerald hover:underline">Saved Addresses →</NuxtLink>
          <NuxtLink to="/orders" class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campus-emerald hover:underline">My Orders →</NuxtLink>
          <NuxtLink to="/cart" class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campus-emerald hover:underline">Demo Cart →</NuxtLink>
        </nav>
        <button type="button" :disabled="auth.busy" class="mt-6 w-full rounded-xl border border-red-700 px-4 py-3 text-sm font-bold text-red-800 hover:bg-red-50" @click="logout">Sign Out</button>
      </aside>
    </div>
  </section>
</template>
