import { parsedAddressId, requireCustomer, setDefaultAddress } from '../../../../../utils/mockAccounts'
export default defineEventHandler((event) => ({
  success: true,
  data: setDefaultAddress(requireCustomer(event).user_id, parsedAddressId(getRouterParam(event, 'address_id'))),
  message: 'Default demo address updated',
}))
