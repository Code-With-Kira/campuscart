// Stage 7 admin view models, not changes to the database ERD.
import type { Product, Category, ApiResponse } from './catalog'
import type { DemoInventoryMovement } from './orders'
export type ProductDraft = Pick<Product, 'sku' | 'product_name' | 'category_id' | 'price' | 'description'>
export type NewProductDraft = ProductDraft & Pick<Product, 'stock_quantity'>
export type CategoryDraft = Pick<Category, 'category_name' | 'description'>
export interface DemoSummary {
  total_products:number; available_products:number; total_stock_units:number; total_categories:number
  total_orders:number; pending_orders:number; ready_orders:number; completed_orders:number
  cancelled_orders:number; low_stock_products:number
}
export interface DemoInventoryRow { product_id:number; sku:string; product_name:string; stock_quantity:number }
export interface DemoInventoryView { products:DemoInventoryRow[]; movements:DemoInventoryMovement[] }
export type AdminEnvelope<T> = ApiResponse<T>
