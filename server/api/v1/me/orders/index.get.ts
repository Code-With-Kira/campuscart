import { requireCustomer } from '../../../../utils/mockAccounts'
import { listCustomerOrders } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  const user=requireCustomer(event)
  return { success:true,data:listCustomerOrders(user.user_id),message:'Your demo orders' }
})
