import { requireAdmin,parsedAddressId } from '../../../../../utils/mockAccounts'
import { updateDemoOrderStatus } from '../../../../../utils/mockOrders'
export default defineEventHandler(async event => {
  const admin=requireAdmin(event)
  const body=await readBody(event)
  const updated=updateDemoOrderStatus(parsedAddressId(getRouterParam(event,'order_id')),admin.user_id,body?.order_status)
  return {success:true,data:updated,message:'Demo order status updated'}
})
