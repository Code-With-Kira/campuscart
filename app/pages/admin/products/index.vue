<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { adminCategories, adminCreateProduct, adminProducts, adminUpdateProduct } from '~/services/admin'
import type { NewProductDraft } from '~/types/admin'
import type { Product, Category } from '~/types/catalog'
import { formatPrice } from '~/utils/money'
import { productImage } from '~/utils/productMedia'
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin Product Management | CampusCart' })
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const search = ref('')
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const feedback = ref('')
const editingId = ref<number | null>(null)
const empty = (): NewProductDraft => ({ sku: '', product_name: '', category_id: 1, description: '', price: '', stock_quantity: 0 })
const draft = reactive<NewProductDraft>(empty())
const filtered = computed(() => products.value.filter(p => `${p.sku} ${p.product_name}`.toLowerCase().includes(search.value.toLowerCase())))
async function reload() {
  loading.value = true; error.value = ''
  try { [products.value, categories.value] = await Promise.all([adminProducts(), adminCategories()]) }
  catch { error.value = 'Unable to retrieve demo products or categories.' }
  finally { loading.value = false }
}
onMounted(reload)
function resetForm() { editingId.value = null; Object.assign(draft, empty()); error.value = '' }
function edit(row: Product) {
  editingId.value = row.product_id
  Object.assign(draft, { sku: row.sku, product_name: row.product_name, category_id: row.category_id,
    description: row.description, price: row.price, stock_quantity: row.stock_quantity })
  feedback.value = ''; error.value = ''
  document.getElementById('product-editor')?.scrollIntoView({ behavior: 'smooth' })
}
function validation(): string {
  if (!draft.sku.trim() || draft.sku.trim().length > 100) return 'SKU is required (maximum 100 characters).'
  if (!draft.product_name.trim() || draft.product_name.trim().length > 200) return 'Product name is required (maximum 200 characters).'
  if (!categories.value.some(c => c.category_id === draft.category_id && c.status === 'ACTIVE')) return 'Select an available category.'
  if (!/^\d{1,10}\.\d{2}$/.test(draft.price) || Number(draft.price) <= 0) return 'Enter a positive price with two decimal places (e.g. 149.00).'
  if (!Number.isSafeInteger(draft.stock_quantity) || draft.stock_quantity < 0) return 'Opening stock must be a nonnegative whole number.'
  return ''
}
async function save() {
  error.value = validation(); feedback.value = ''
  if (error.value) return
  busy.value = true
  try {
    const body = { sku: draft.sku.trim(), product_name: draft.product_name.trim(), category_id: draft.category_id,
      description: draft.description, price: draft.price }
    if (editingId.value !== null) await adminUpdateProduct(editingId.value, body)
    else await adminCreateProduct({ ...body, stock_quantity: draft.stock_quantity })
    feedback.value = editingId.value !== null ? 'Demo product updated.' : 'Demo product created.'
    resetForm()
    await reload()
  } catch (cause: unknown) {
    const issue = cause as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = issue.data?.statusMessage || issue.statusMessage || 'Unable to save product. Check SKU uniqueness and your fields.'
  } finally { busy.value = false }
}
</script>
<template>
  <section>
    <p class="text-xs font-bold uppercase tracking-widest text-campus-green">Admin · In-memory catalog</p>
    <h1 class="mt-2 text-3xl font-black text-campus-emerald">Product Management</h1>
    <p class="mt-3 text-sm leading-7 text-gray-600">Add products and edit their approved catalog fields. Existing stock changes, activation rules and inventory movements remain locked until their business rules are approved. Changes reset on server restart.</p>
    <p v-if="feedback" class="mt-5 rounded-lg bg-campus-sage p-4 text-sm font-bold text-campus-emerald" role="status">{{ feedback }}</p>
    <p v-if="error" class="mt-5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{{ error }}</p>
    <div class="mt-8 grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_350px]">
      <div>
        <label for="product-search" class="mb-2 block text-sm font-bold">Find a product</label>
        <input id="product-search" v-model.trim="search" placeholder="Search SKU or product name" class="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3">
        <div v-if="loading" role="status" class="rounded-lg bg-campus-sage p-5">Loading products…</div>
        <div v-else-if="!filtered.length" role="status" class="rounded-lg bg-campus-sage p-5">No matching products.</div>
        <div v-else class="overflow-x-auto rounded-xl border border-gray-200">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-campus-sage text-campus-emerald"><tr><th scope="col" class="p-3">Product</th><th scope="col" class="p-3">Price</th><th scope="col" class="p-3">Stock</th><th scope="col" class="p-3">Action</th></tr></thead>
            <tbody><tr v-for="row in filtered" :key="row.product_id" class="border-t border-gray-100">
              <td class="p-3"><div class="flex items-center gap-3"><CommonMediaImage :src="productImage(row)" :fallback="productImage(row.product_id)" alt="" :width="56" :height="56" class="h-14 w-14 shrink-0 rounded-lg bg-campus-sage object-contain" /><div><p class="font-bold text-campus-emerald">{{ row.product_name }}</p><p class="text-xs text-gray-600">{{ row.sku }} · {{ row.status }}</p></div></div></td>
              <td class="whitespace-nowrap p-3">{{ formatPrice(row.price) }}</td>
              <td class="p-3">{{ row.stock_quantity }}</td>
              <td class="p-3"><button type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-3 py-2 font-bold text-campus-emerald hover:bg-campus-sage" @click="edit(row)">Edit</button></td>
            </tr></tbody>
          </table>
        </div>
        <button v-if="error && !busy" type="button" class="mt-4 text-sm font-bold text-campus-green underline" @click="reload">Retry loading</button>
      </div>
      <form id="product-editor" class="rounded-2xl border border-gray-200 bg-campus-sage p-5" novalidate @submit.prevent="save">
        <h2 class="text-xl font-extrabold text-campus-emerald">{{ editingId === null ? 'Add demo product' : 'Edit demo product' }}</h2>
        <p class="mt-2 text-xs leading-5 text-gray-600">Only existing ERD product fields. New products use the existing provisional ACTIVE mock status.</p>
        <div class="mt-5 space-y-4">
          <div><label for="admin-sku" class="mb-1 block text-sm font-semibold">SKU *</label><input id="admin-sku" v-model.trim="draft.sku" required maxlength="100" class="w-full rounded-lg border border-gray-300 bg-white p-3"></div>
          <div><label for="admin-pname" class="mb-1 block text-sm font-semibold">Product name *</label><input id="admin-pname" v-model.trim="draft.product_name" required maxlength="200" class="w-full rounded-lg border border-gray-300 bg-white p-3"></div>
          <div><label for="admin-cat" class="mb-1 block text-sm font-semibold">Category *</label><select id="admin-cat" v-model.number="draft.category_id" required class="w-full rounded-lg border border-gray-300 bg-white p-3"><option v-for="category in categories" :key="category.category_id" :value="category.category_id">{{ category.category_name }}</option></select></div>
          <div><label for="admin-price" class="mb-1 block text-sm font-semibold">Price (PHP) *</label><input id="admin-price" v-model.trim="draft.price" required inputmode="decimal" placeholder="149.00" class="w-full rounded-lg border border-gray-300 bg-white p-3"></div>
          <div><label for="admin-desc" class="mb-1 block text-sm font-semibold">Description</label><textarea id="admin-desc" v-model="draft.description" rows="3" maxlength="10000" class="w-full rounded-lg border border-gray-300 bg-white p-3"></textarea></div>
          <div><label for="admin-stock" class="mb-1 block text-sm font-semibold">{{ editingId === null ? 'Opening stock (units) *' : 'Stock (read-only)' }}</label><input id="admin-stock" v-model.number="draft.stock_quantity" type="number" min="0" max="1000000" step="1" :disabled="editingId !== null" required class="w-full rounded-lg border border-gray-300 bg-white p-3 disabled:bg-gray-100"><p v-if="editingId !== null" class="mt-1 text-xs text-gray-600">Stock adjustments will need an approved inventory movement rule.</p></div>
        </div>
        <div class="mt-6 flex flex-wrap gap-2"><button type="submit" :disabled="busy || loading" class="rounded-lg bg-campus-emerald px-5 py-3 text-sm font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ busy ? 'Saving…' : editingId === null ? 'Add Product' : 'Save Changes' }}</button><button v-if="editingId !== null" type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold" @click="resetForm">Cancel Edit</button></div>
      </form>
    </div>
  </section>
</template>
