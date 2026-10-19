import { apiUrl } from '~/utils/apiUrl'
import type { ApiResponse } from '~/types/catalog'
import type { DemoOrder, OrderDetail, PlaceOrderBody } from '~/types/orders'
const api='/api/v1'
async function unwrap<T>(url:string,opts?:Parameters<typeof $fetch>[1]):Promise<T>{
  const response=await $fetch<ApiResponse<T>>(apiUrl(url),opts)
  if(!response.success) throw new Error(response.message || 'Demo request failed')
  return response.data
}
export const placeDemoOrder=(body:PlaceOrderBody)=>unwrap<OrderDetail>(`${api}/orders`,{method:'POST',body})
export const myDemoOrders=()=>unwrap<DemoOrder[]>(`${api}/me/orders`)
export const myDemoOrder=(id:number)=>unwrap<OrderDetail>(`${api}/me/orders/${id}`)
