import { listAddresses, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler((event) => ({
  success: true, data: listAddresses(requireCustomer(event).user_id), message: 'Demo addresses retrieved',
}))
