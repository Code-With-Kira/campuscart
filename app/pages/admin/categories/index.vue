<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminCategories, adminCreateCategory, adminUpdateCategory } from '~/services/admin'
import type { Category } from '~/types/catalog'
import type { CategoryDraft } from '~/types/admin'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Manage Categories | CampusCart' })
const rows = ref<Category[]>([])
const busy = ref(false), loading = ref(true), error = ref(''), feedback = ref('')
const editingId = ref<number | null>(null)
const draft = reactive<CategoryDraft>({ category_name: '', description: '' })
async function reload() {
  loading.value = true; error.value = ''
  try { rows.value = await adminCategories() }
  catch { error.value = 'Unable to load demo categories.' }
  finally { loading.value = false }
}
onMounted(reload)
function cancel() { editingId.value = null; Object.assign(draft, { category_name: '', description: '' }) }
function edit(row: Category) { editingId.value = row.category_id; draft.category_name = row.category_name; draft.description = row.description; feedback.value = ''; error.value = ''; document.getElementById('category-form')?.scrollIntoView({ behavior: 'smooth' }) }
async function save() {
  error.value = ''; feedback.value = ''
  if (!draft.category_name.trim() || draft.category_name.trim().length > 150) { error.value = 'Category name must be 1–150 characters.'; return }
  if (draft.description.length > 10000) { error.value = 'Description is too long.'; return }
  busy.value = true
  try {
    const payload = { category_name: draft.category_name.trim(), description: draft.description }
    if (editingId.value !== null) await adminUpdateCategory(editingId.value, payload)
    else await adminCreateCategory(payload)
    feedback.value = editingId.value !== null ? 'Demo category updated.' : 'Demo category added.'
    cancel(); await reload()
  } catch (cause: unknown) { const issue = cause as { data?: { statusMessage?: string } }; error.value = issue.data?.statusMessage || 'Unable to save category. Check for duplicate names.' }
  finally { busy.value = false }
}
</script>
<template>
  <section>
    <p class="text-xs font-bold uppercase tracking-widest text-campus-green">Admin · Mock catalog</p>
    <h1 class="mt-2 text-3xl font-black text-campus-emerald">Category Management</h1>
    <p class="mt-3 text-sm text-gray-600">Create and rename categories. Existing category statuses are unchanged; deletion and deactivation are unavailable to avoid affecting linked products.</p>
    <p v-if="feedback" role="status" class="mt-5 rounded-lg bg-campus-sage p-4 text-sm font-bold text-campus-emerald">{{ feedback }}</p>
    <p v-if="error" role="alert" class="mt-5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800">{{ error }} <button v-if="!busy" type="button" class="underline" @click="reload">Retry</button></p>
    <div class="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div v-if="loading" role="status" class="rounded-lg bg-campus-sage p-6">Loading categories…</div>
        <div v-else-if="!rows.length" class="rounded-lg bg-campus-sage p-6">No categories recorded.</div>
        <div v-else class="space-y-3"><article v-for="row in rows" :key="row.category_id" class="rounded-xl border border-gray-200 p-5">
          <div class="flex flex-wrap items-start justify-between gap-3"><div><h2 class="font-bold text-campus-emerald">{{ row.category_name }}</h2><p class="mt-2 text-sm text-gray-600">{{ row.description || 'No description' }}</p><p class="mt-2 text-xs text-gray-500">ID {{ row.category_id }} · {{ row.status }}</p></div><button type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-4 py-2 text-sm font-bold text-campus-emerald" @click="edit(row)">Edit</button></div>
        </article></div>
      </div>
      <form id="category-form" class="h-fit rounded-xl bg-campus-sage p-5" novalidate @submit.prevent="save">
        <h2 class="text-xl font-extrabold text-campus-emerald">{{ editingId !== null ? 'Edit category' : 'Add demo category' }}</h2>
        <div class="mt-5 space-y-4"><div><label for="category-name" class="mb-1 block text-sm font-semibold">Category name *</label><input id="category-name" v-model.trim="draft.category_name" required maxlength="150" class="w-full rounded-lg border border-gray-300 bg-white p-3"></div>
          <div><label for="category-description" class="mb-1 block text-sm font-semibold">Description</label><textarea id="category-description" v-model="draft.description" maxlength="10000" rows="4" class="w-full rounded-lg border border-gray-300 bg-white p-3"></textarea></div>
        </div>
        <div class="mt-5 flex flex-wrap gap-2"><button type="submit" :disabled="busy || loading" class="rounded-lg bg-campus-emerald px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{{ busy ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Add Category' }}</button><button v-if="editingId !== null" type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold" @click="cancel">Cancel</button></div>
      </form>
    </div>
  </section>
</template>
