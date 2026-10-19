import { apiUrl } from '~/utils/apiUrl'
import type { Product, Category } from '~/types/catalog'
import type { AdminEnvelope, CategoryDraft, DemoInventoryView, DemoSummary, NewProductDraft, ProductDraft } from '~/types/admin'
import type { DemoOrder, DemoPayment, OrderDetail, OrderStatus } from '~/types/orders'
const root = '/api/v1/admin'
async function request<T>(path:string,options?:Parameters<typeof $fetch>[1]):Promise<T>{
  const response=await $fetch<AdminEnvelope<T>>(apiUrl(`${root}${path}`),options)
  if(!response.success)throw new Error(response.message||'Demo request failed')
  return response.data
}
export const adminSummary=()=>request<DemoSummary>('/dashboard/summary')
export const adminProducts=()=>request<Product[]>('/products')
export const adminCreateProduct=(body:NewProductDraft)=>request<Product>('/products',{method:'POST',body})
export const adminUpdateProduct=(id:number,body:ProductDraft)=>request<Product>(`/products/${id}`,{method:'PATCH',body})
export const adminCategories=()=>request<Category[]>('/categories')
export const adminCreateCategory=(body:CategoryDraft)=>request<Category>('/categories',{method:'POST',body})
export const adminUpdateCategory=(id:number,body:CategoryDraft)=>request<Category>(`/categories/${id}`,{method:'PATCH',body})
export const adminInventory=()=>request<DemoInventoryView>('/inventory')
export const adminOrders=()=>request<DemoOrder[]>('/orders')
export const adminOrder=(id:number)=>request<OrderDetail>(`/orders/${id}`)
export const adminUpdateOrderStatus=(id:number,order_status:OrderStatus)=>request<OrderDetail>(`/orders/${id}/status`,{method:'PATCH',body:{order_status}})
export const adminPayments=()=>request<DemoPayment[]>('/payments')
