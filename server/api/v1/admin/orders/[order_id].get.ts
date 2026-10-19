import { requireAdmin,parsedAddressId } from '../../../../utils/mockAccounts'
import { getOrderDetail } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return {success:true,data:getOrderDetail(parsedAddressId(getRouterParam(event,'order_id'))),message:'Demo order detail'}
})
