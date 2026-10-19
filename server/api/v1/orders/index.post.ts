import { requireCustomer } from '../../../utils/mockAccounts'
import { placeDemoOrder } from '../../../utils/mockOrders'
export default defineEventHandler(async event => {
  const user = requireCustomer(event)
  const order = placeDemoOrder(user.user_id, await readBody(event))
  return { success: true, data: order, message: 'Demo campus pickup order placed' }
})
