import { editAddress, parsedAddressId, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler(async (event) => ({
  success: true, data: editAddress(requireCustomer(event).user_id, parsedAddressId(getRouterParam(event, 'address_id')), await readBody(event)),
  message: 'Demo address updated',
}))
