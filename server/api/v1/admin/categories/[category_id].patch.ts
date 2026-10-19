import { requireAdmin } from '../../../../utils/mockAccounts'
import { editDemoCategory, parseAdminId } from '../../../../utils/adminCatalog'
export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = parseAdminId(getRouterParam(event, 'category_id'))
  return { success: true, data: editDemoCategory(id, await readBody(event)), message: 'Demo category updated' }
})
