import { apiUrl } from '~/utils/apiUrl'
import type {
  ApiResponse, Category, CatalogPageResponse, CatalogQuery, Product,
} from '~/types/catalog'

// Centralized API access. Replace the transport/backend later, not the presentation components.
export async function fetchProducts(): Promise<Product[]> {
  const response = await $fetch<ApiResponse<Product[]>>(apiUrl('/api/v1/products'))
  if (!response.success || !Array.isArray(response.data)) throw new Error('Invalid products response')
  return response.data
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await $fetch<ApiResponse<Category[]>>(apiUrl('/api/v1/categories'))
  if (!response.success || !Array.isArray(response.data)) throw new Error('Invalid categories response')
  return response.data
}

export async function fetchHomepageCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  return { products, categories }
}

// Stage 4: filtered and paginated catalog, using the SAME endpoint as Stage 3.
export async function fetchCatalogPage(query: CatalogQuery = {}): Promise<CatalogPageResponse> {
  const response = await $fetch<CatalogPageResponse>(apiUrl('/api/v1/products'), { query })
  if (!response.success || !Array.isArray(response.data) || !response.meta) {
    throw new Error('Invalid catalog response')
  }
  return response
}

export async function fetchProductById(productId: number): Promise<Product> {
  if (!Number.isSafeInteger(productId) || productId <= 0) throw new Error('Invalid product ID')
  const response = await $fetch<ApiResponse<Product>>(apiUrl(`/api/v1/products/${productId}`))
  if (!response.success || !response.data || response.data.product_id !== productId) {
    throw new Error('Invalid product details response')
  }
  return response.data
}
