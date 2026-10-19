import { mockProducts } from '../../utils/mockCatalog'
import { pesosToCentavos } from '../../../app/utils/money'
import type { CatalogSort } from '../../../app/types/catalog'

const SORTS: readonly CatalogSort[] = ['newest', 'name_asc', 'price_asc', 'price_desc']

function single(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function decimalCents(value: string | undefined, field: string): number | undefined {
  if (value === undefined || value === '') return undefined
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` })
  }
  return pesosToCentavos(value)
}

function positiveInt(value: string | undefined, field: string, fallback: number, max = 10000): number {
  if (value === undefined) return fallback
  if (!/^[1-9]\d*$/.test(value) || Number(value) > max || !Number.isSafeInteger(Number(value))) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` })
  }
  return Number(value)
}

export default defineEventHandler(event => {
  const query = getQuery(event)
  const qRaw = single(query.q) ?? ''
  if (qRaw.length > 100) throw createError({ statusCode: 400, statusMessage: 'Search must be 100 characters or fewer' })
  const q = qRaw.trim().toLocaleLowerCase()
  const categoryId = query.category_id === undefined
    ? undefined : positiveInt(single(query.category_id), 'category_id', 1)
  const min = decimalCents(single(query.min_price), 'min_price')
  const max = decimalCents(single(query.max_price), 'max_price')
  if (min !== undefined && max !== undefined && min > max) {
    throw createError({ statusCode: 400, statusMessage: 'min_price must not exceed max_price' })
  }
  const stockValue = single(query.in_stock)
  if (stockValue !== undefined && !['true', 'false'].includes(stockValue)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid in_stock value' })
  }
  const onlyStock = stockValue === 'true'
  const sort = single(query.sort) ?? 'newest'
  if (!SORTS.includes(sort as CatalogSort)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sort value' })
  }
  const page = positiveInt(single(query.page), 'page', 1)
  const pageSize = positiveInt(single(query.page_size), 'page_size', 12, 24)

  const results = mockProducts.filter(product => product.status === 'ACTIVE'
    && (categoryId === undefined || product.category_id === categoryId)
    && (!q || `${product.product_name} ${product.sku} ${product.description}`.toLocaleLowerCase().includes(q))
    && (!onlyStock || product.stock_quantity > 0)
    && (min === undefined || pesosToCentavos(product.price) >= min)
    && (max === undefined || pesosToCentavos(product.price) <= max))

  // Stage 3 homepage uses the default catalog call. With 12 products and default page_size 12,
  // it still receives all the same mock products and the same `data` array response shape.
  if (sort === 'newest') results.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || a.product_id - b.product_id)
  if (sort === 'name_asc') results.sort((a, b) => a.product_name.localeCompare(b.product_name))
  if (sort === 'price_asc') results.sort((a, b) => pesosToCentavos(a.price) - pesosToCentavos(b.price) || a.product_id - b.product_id)
  if (sort === 'price_desc') results.sort((a, b) => pesosToCentavos(b.price) - pesosToCentavos(a.price) || a.product_id - b.product_id)

  const totalItems = results.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = (page - 1) * pageSize
  return {
    success: true,
    data: results.slice(start, start + pageSize),
    meta: { page, page_size: pageSize, total_items: totalItems, total_pages: totalPages },
    message: 'Demo products retrieved successfully',
  }
})
