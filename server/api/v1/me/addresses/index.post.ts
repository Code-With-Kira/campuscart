import { addAddress, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler(async (event) => {
  const row = addAddress(requireCustomer(event).user_id, await readBody(event))
  setResponseStatus(event, 201)
  return { success: true, data: row, message: 'Demo address saved' }
})
