import { parsedAddressId, removeAddress, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler((event) => {
  removeAddress(requireCustomer(event).user_id, parsedAddressId(getRouterParam(event, 'address_id')))
  return { success: true, data: null, message: 'Demo address deleted' }
})
