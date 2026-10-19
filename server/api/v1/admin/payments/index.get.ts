import { requireAdmin } from '../../../../utils/mockAccounts'
import { listPayments } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success:true,data:listPayments(),message:'Demo payment records (no gateway)' }
})
