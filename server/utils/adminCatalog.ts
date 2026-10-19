// Stage 7 DEMO-ONLY editing. Data is the existing in-memory catalog; server restart resets edits.
// No new ERD columns or final SQL enum decisions are introduced here.
import { createError } from 'h3'
import { mockProducts, mockCategories } from './mockCatalog'
import type { Product, Category } from '../../app/types/catalog'

function invalid(message: string): never { throw createError({ statusCode: 422, statusMessage: message }) }
function rowOf(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Invalid demo record')
  return body as Record<string, unknown>
}
function limited(input: unknown, max: number, field: string): string {
  if (typeof input !== 'string' || !input.trim() || input.trim().length > max) invalid(`Invalid ${field}`)
  return input.trim()
}
function nonnegativeStock(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 1000000) invalid('Stock must be a nonnegative whole number')
  return value
}
function money(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{1,10}\.\d{2}$/.test(value) || Number(value) <= 0) invalid('Price must be a positive decimal string with two places')
  return value
}
function validCategory(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) invalid('Invalid category_id')
  if (!mockCategories.some(category => category.category_id === value && category.status === 'ACTIVE')) invalid('Category is unavailable')
  return value
}
function productFields(body: unknown) {
  const draft = rowOf(body)
  const product_name = limited(draft.product_name, 200, 'product name')
  const sku = limited(draft.sku, 100, 'SKU').toUpperCase()
  const category_id = validCategory(draft.category_id)
  const description = typeof draft.description === 'string' && draft.description.length <= 10000 ? draft.description.trim() : invalid('Invalid description')
  const price = money(draft.price)
  return { product_name, sku, category_id, description, price }
}
function ensureSkuFree(sku: string, exceptId?: number) {
  if (mockProducts.some(product => product.sku.toUpperCase() === sku.toUpperCase() && product.product_id !== exceptId)) {
    throw createError({ statusCode: 409, statusMessage: 'Demo product SKU already exists' })
  }
}
export function addDemoProduct(body: unknown): Product {
  const fields = productFields(body)
  const draft = rowOf(body)
  const stock_quantity = nonnegativeStock(draft.stock_quantity)
  ensureSkuFree(fields.sku)
  const nextId = Math.max(1000, ...mockProducts.map(p => p.product_id)) + 1
  const now = new Date().toISOString()
  const result: Product = { ...fields, product_id: nextId, stock_quantity, status: 'ACTIVE', created_at: now, updated_at: now }
  mockProducts.push(result)
  return result
}
export function editDemoProduct(productId: number, body: unknown): Product {
  const record = mockProducts.find(p => p.product_id === productId)
  if (!record) throw createError({ statusCode: 404, statusMessage: 'Demo product not found' })
  const fields = productFields(body)
  ensureSkuFree(fields.sku, productId)
  // IMPORTANT: stock_quantity, status, IDs and timestamps CANNOT be altered here.
  // Inventory movements and status rules have not been finalized.
  Object.assign(record, fields, { updated_at: new Date().toISOString() })
  return record
}
function categoryFields(body: unknown) {
  const draft = rowOf(body)
  return {
    category_name: limited(draft.category_name, 150, 'category name'),
    description: typeof draft.description === 'string' && draft.description.length <= 10000
      ? draft.description.trim() : invalid('Invalid category description'),
  }
}
function ensureCategoryNameFree(name: string, exceptId?: number) {
  if (mockCategories.some(c => c.category_name.toLowerCase() === name.toLowerCase() && c.category_id !== exceptId)) {
    throw createError({ statusCode: 409, statusMessage: 'Demo category already exists' })
  }
}
export function addDemoCategory(body: unknown): Category {
  const fields = categoryFields(body)
  ensureCategoryNameFree(fields.category_name)
  const now = new Date().toISOString()
  const category_id = Math.max(0, ...mockCategories.map(c => c.category_id)) + 1
  const row: Category = { ...fields, category_id, status: 'ACTIVE', created_at: now, updated_at: now }
  mockCategories.push(row)
  return row
}
export function editDemoCategory(categoryId: number, body: unknown): Category {
  const record = mockCategories.find(c => c.category_id === categoryId)
  if (!record) throw createError({ statusCode: 404, statusMessage: 'Demo category not found' })
  const fields = categoryFields(body)
  ensureCategoryNameFree(fields.category_name, categoryId)
  Object.assign(record, fields, { updated_at: new Date().toISOString() })
  return record
}
export function parseAdminId(input: string | undefined): number {
  if (!input || !/^[1-9]\d*$/.test(input) || !Number.isSafeInteger(Number(input))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }
  return Number(input)
}
