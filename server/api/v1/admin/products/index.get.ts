import { requireAdmin } from '../../../../utils/mockAccounts'
import { mockProducts } from '../../../../utils/mockCatalog'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success: true, data: mockProducts, message: 'Demo admin products retrieved' }
})
