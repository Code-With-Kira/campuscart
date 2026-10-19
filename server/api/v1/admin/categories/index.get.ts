import { requireAdmin } from '../../../../utils/mockAccounts'
import { mockCategories } from '../../../../utils/mockCatalog'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success: true, data: mockCategories, message: 'Demo admin categories retrieved' }
})
