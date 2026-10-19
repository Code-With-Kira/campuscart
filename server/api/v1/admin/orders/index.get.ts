import { requireAdmin } from '../../../../utils/mockAccounts'
import { listAllOrders } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success:true,data:listAllOrders(),message:'All demo orders' }
})
