<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { AddressDraft, CampusAddress } from '~/types/account'
import { validateAddress, type FieldErrors } from '~/utils/accountValidation'
import { createDemoAddress, deleteDemoAddress, getDemoAddresses, makeDefaultDemoAddress, updateDemoAddress } from '~/services/account'

definePageMeta({ middleware: 'customer' })
useHead({ title: 'Saved Addresses | CampusCart' })
const auth = useAuthStore()
const rows = ref<CampusAddress[]>([])
const loading = ref(true)
const busy = ref(false)
const editingId = ref<number | null>(null)
const confirmDelete = ref<number | null>(null)
const errorMessage = ref('')
const feedback = ref('')
const errors = ref<FieldErrors>({})
const emptyDraft = (): AddressDraft => ({ address_label: '', recipient_name: '', phone_number: '', barangay: '', city: '', is_default: false })
const draft = reactive<AddressDraft>(emptyDraft())
async function reload() {
  loading.value = true; errorMessage.value = ''
  try { rows.value = await getDemoAddresses() }
  catch { errorMessage.value = 'Unable to retrieve your temporary saved addresses.' }
  finally { loading.value = false }
}
onMounted(async () => {
  await auth.ensureSession()
  if (auth.isCustomer) await reload()
})
function resetForm() {
  Object.assign(draft, emptyDraft()); editingId.value = null; errors.value = {}; confirmDelete.value = null
}
function startEdit(row: CampusAddress) {
  editingId.value = row.address_id
  Object.assign(draft, { address_label: row.address_label, recipient_name: row.recipient_name, phone_number: row.phone_number, barangay: row.barangay, city: row.city, is_default: row.is_default })
  errors.value = {}; feedback.value = ''; errorMessage.value = ''
  document.getElementById('address-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
async function save() {
  errors.value = validateAddress(draft)
  feedback.value = ''; errorMessage.value = ''
  if (Object.keys(errors.value).length) return
  busy.value = true
  try {
    if (editingId.value) await updateDemoAddress(editingId.value, { ...draft })
    else await createDemoAddress({ ...draft })
    feedback.value = editingId.value ? 'Demo address updated.' : 'Demo address added.'
    resetForm()
    await reload()
  } catch { errorMessage.value = 'Could not save this address. Check the fields and try again.' }
  finally { busy.value = false }
}
async function makeDefault(id: number) {
  busy.value = true; errorMessage.value = ''
  try { await makeDefaultDemoAddress(id); await reload(); feedback.value = 'Default demo address changed.' }
  catch { errorMessage.value = 'Unable to change the default address.' }
  finally { busy.value = false }
}
async function remove(id: number) {
  busy.value = true; errorMessage.value = ''
  try { await deleteDemoAddress(id); await reload(); feedback.value = 'Demo address removed.'; confirmDelete.value = null; if (editingId.value === id) resetForm() }
  catch { errorMessage.value = 'Unable to remove this address.' }
  finally { busy.value = false }
}
</script>

<template>
  <section class="cc-container py-10 sm:py-14">
    <NuxtLink to="/profile" class="text-sm font-bold text-campus-green hover:underline">← My Profile</NuxtLink>
    <h1 class="mt-5 text-3xl font-black text-campus-emerald sm:text-4xl">Saved Addresses</h1>
    <p class="mt-3 max-w-3xl text-sm leading-7 text-gray-600">Manage temporary addresses for your demo customer. The approved ERD currently stores label, recipient, phone, barangay and city. It does <strong>not</strong> include a street or unit field. Do not use real delivery information here.</p>
    <p v-if="feedback" role="status" class="mt-6 rounded-lg bg-campus-sage px-4 py-3 text-sm font-semibold text-campus-emerald">{{ feedback }}</p>
    <p v-if="errorMessage" role="alert" class="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{{ errorMessage }} <button v-if="!busy" type="button" class="ml-2 font-bold underline" @click="reload">Retry</button></p>
    <div class="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section aria-labelledby="saved-heading">
        <h2 id="saved-heading" class="mb-5 text-xl font-extrabold text-campus-emerald">Your Addresses</h2>
        <div v-if="loading" role="status" class="rounded-xl bg-campus-sage p-6">Loading demo addresses…</div>
        <div v-else-if="!rows.length" role="status" class="rounded-2xl border border-dashed border-gray-300 bg-campus-sage p-8 text-center">
          <p class="text-lg font-bold text-campus-emerald">No saved addresses yet</p>
          <p class="mt-2 text-sm text-gray-600">Use the form to create your first temporary demo address.</p>
        </div>
        <div v-else class="space-y-4">
          <article v-for="row in rows" :key="row.address_id" class="rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="font-bold text-campus-emerald">{{ row.address_label }}</h3><span v-if="row.is_default" class="rounded-full bg-campus-sage px-3 py-1 text-xs font-bold text-campus-emerald">Default</span></div>
            <p class="mt-3 text-sm font-semibold text-gray-800">{{ row.recipient_name }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ row.phone_number }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ row.barangay }}, {{ row.city }}</p>
            <div class="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              <button type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-3 py-2 text-sm font-bold text-campus-emerald hover:bg-campus-sage" @click="startEdit(row)">Edit</button>
              <button v-if="!row.is_default" type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-3 py-2 text-sm font-bold text-campus-emerald hover:bg-campus-sage" @click="makeDefault(row.address_id)">Set Default</button>
              <button v-if="confirmDelete !== row.address_id" type="button" class="rounded-lg px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" @click="confirmDelete = row.address_id">Remove</button>
              <div v-else class="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm address deletion"><span class="text-xs text-red-800">Delete address?</span><button type="button" :disabled="busy" class="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white" @click="remove(row.address_id)">Delete</button><button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-xs" @click="confirmDelete = null">Cancel</button></div>
            </div>
          </article>
        </div>
      </section>
      <form id="address-form" class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7" novalidate @submit.prevent="save">
        <h2 class="text-xl font-extrabold text-campus-emerald">{{ editingId ? 'Edit Address' : 'Add a Demo Address' }}</h2>
        <p class="mt-2 text-xs leading-5 text-gray-600">For learning only · Maximum 10 per demo customer</p>
        <div class="mt-5 space-y-4">
          <div><label for="addr-label" class="mb-2 block text-sm font-semibold">Address label</label><input id="addr-label" v-model.trim="draft.address_label" maxlength="50" placeholder="Dorm / Home" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.address_label" class="mt-1 text-xs text-red-700">{{ errors.address_label }}</p></div>
          <div><label for="addr-name" class="mb-2 block text-sm font-semibold">Recipient name</label><input id="addr-name" v-model.trim="draft.recipient_name" maxlength="200" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.recipient_name" class="mt-1 text-xs text-red-700">{{ errors.recipient_name }}</p></div>
          <div><label for="addr-phone" class="mb-2 block text-sm font-semibold">Demo phone number</label><input id="addr-phone" v-model.trim="draft.phone_number" type="tel" maxlength="30" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.phone_number" class="mt-1 text-xs text-red-700">{{ errors.phone_number }}</p></div>
          <div><label for="addr-barangay" class="mb-2 block text-sm font-semibold">Barangay</label><input id="addr-barangay" v-model.trim="draft.barangay" maxlength="150" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.barangay" class="mt-1 text-xs text-red-700">{{ errors.barangay }}</p></div>
          <div><label for="addr-city" class="mb-2 block text-sm font-semibold">City</label><input id="addr-city" v-model.trim="draft.city" maxlength="150" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.city" class="mt-1 text-xs text-red-700">{{ errors.city }}</p></div>
          <label class="flex items-center gap-3 text-sm"><input v-model="draft.is_default" type="checkbox" class="h-4 w-4 accent-campus-green">Make this my default demo address</label>
        </div>
        <div class="mt-6 flex flex-wrap gap-3">
          <button type="submit" :disabled="busy" class="min-h-11 rounded-lg bg-campus-emerald px-5 text-sm font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ busy ? 'Saving…' : editingId ? 'Update Address' : 'Save Address' }}</button>
          <button v-if="editingId" type="button" class="rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-700" @click="resetForm">Cancel</button>
        </div>
      </form>
    </div>
  </section>
</template>
