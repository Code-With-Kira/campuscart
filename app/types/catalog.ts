// Database field names are copied from the supplied CampusCart ERD.
// ACTIVE/INACTIVE remain provisional mock enum values until the group approves the SQL enums.
export type MockProductStatus = 'ACTIVE' | 'INACTIVE'

/** API response-only media; not part of the approved products table. */
export interface ProductImage {
  url: string
  alt?: string
  sort_order?: number
  is_primary?: boolean
}

export interface Product {
  images?: ProductImage[] // Optional enriched API data, not an ERD field.
  product_id: number
  category_id: number
  sku: string
  product_name: string
  description: string
  price: string // DECIMAL(12,2) transmitted as a decimal string
  stock_quantity: number
  status: MockProductStatus
  created_at: string
  updated_at: string
}

export interface Category {
  image_url?: string | null // Optional API response metadata, not a database column.
  category_id: number
  category_name: string
  description: string
  status: MockProductStatus
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export type CatalogSort = 'newest' | 'name_asc' | 'price_asc' | 'price_desc'

export interface CatalogQuery {
  q?: string
  category_id?: number
  min_price?: string
  max_price?: string
  in_stock?: boolean
  sort?: CatalogSort
  page?: number
  page_size?: number
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface CatalogPageResponse extends ApiResponse<Product[]> {
  meta: PaginationMeta
}

// UI-only draft values. These are not new database fields.
export interface CatalogFilterDraft {
  q: string
  category_id: string
  min_price: string
  max_price: string
  in_stock: boolean
  sort: CatalogSort
}
