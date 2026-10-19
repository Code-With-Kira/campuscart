import { requireCustomer, parsedAddressId } from '../../../../utils/mockAccounts'
import { getOrderDetail } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  const user=requireCustomer(event)
  return {success:true,data:getOrderDetail(parsedAddressId(getRouterParam(event,'order_id')),user.user_id),message:'Your demo order details'}
})
