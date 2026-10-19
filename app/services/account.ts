import { apiUrl } from '~/utils/apiUrl'
import type { AccountResponse, AddressDraft, CampusAddress, PublicAccount } from '~/types/account'
import type { DemoOrder } from '~/types/orders'

const PREFIX = '/api/v1'
const unwrap = <T>(response: AccountResponse<T>): T => {
  if (!response.success) throw new Error(response.message || 'Demo request failed.')
  return response.data
}

// These are temporary Nuxt server-memory handlers, not a production identity API.
export async function getDemoSession() {
  return unwrap(await $fetch<AccountResponse<PublicAccount | null>>(apiUrl(`${PREFIX}/auth/me`)))
}
export async function loginDemoAccount(email: string, password: string) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(apiUrl(`${PREFIX}/auth/login`), {
    method: 'POST', body: { email, password },
  }))
}
export async function registerDemoAccount(body: { first_name: string; last_name: string; email: string; password: string }) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(apiUrl(`${PREFIX}/auth/register`), { method: 'POST', body }))
}
export async function enterDemoPersona(role: 'CUSTOMER' | 'ADMIN') {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(apiUrl(`${PREFIX}/auth/demo`), { method: 'POST', body: { role } }))
}
export async function logoutDemoAccount() {
  return unwrap(await $fetch<AccountResponse<null>>(apiUrl(`${PREFIX}/auth/logout`), { method: 'POST' }))
}
export async function updateDemoProfile(body: { first_name: string; last_name: string; email: string }) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(apiUrl(`${PREFIX}/me/profile`), { method: 'PATCH', body }))
}
export async function getDemoAddresses() {
  return unwrap(await $fetch<AccountResponse<CampusAddress[]>>(apiUrl(`${PREFIX}/me/addresses`)))
}
export async function createDemoAddress(body: AddressDraft) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(apiUrl(`${PREFIX}/me/addresses`), { method: 'POST', body }))
}
export async function updateDemoAddress(addressId: number, body: AddressDraft) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(apiUrl(`${PREFIX}/me/addresses/${addressId}`), { method: 'PATCH', body }))
}
export async function deleteDemoAddress(addressId: number) {
  return unwrap(await $fetch<AccountResponse<null>>(apiUrl(`${PREFIX}/me/addresses/${addressId}`), { method: 'DELETE' }))
}
export async function makeDefaultDemoAddress(addressId: number) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(apiUrl(`${PREFIX}/me/addresses/${addressId}/default`), { method: 'PATCH' }))
}
export async function getDemoOrders(): Promise<DemoOrder[]> {
  return unwrap(await $fetch<AccountResponse<DemoOrder[]>>(apiUrl(`${PREFIX}/me/orders`)))
}
