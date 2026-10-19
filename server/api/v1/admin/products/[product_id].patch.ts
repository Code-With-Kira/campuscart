import { requireAdmin } from '../../../../utils/mockAccounts'
import { editDemoProduct, parseAdminId } from '../../../../utils/adminCatalog'
export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = parseAdminId(getRouterParam(event, 'product_id'))
  return { success: true, data: editDemoProduct(id, await readBody(event)), message: 'Demo product updated' }
})
