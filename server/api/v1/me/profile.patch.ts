import { requireCustomer, updateUser } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => ({
  success: true,
  data: updateUser(requireCustomer(event), await readBody(event)),
  message: 'Demo profile updated',
}))
