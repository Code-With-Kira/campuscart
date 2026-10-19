import { requireAdmin } from '../../../../utils/mockAccounts'
import { addDemoCategory } from '../../../../utils/adminCatalog'
export default defineEventHandler(async event => {
  requireAdmin(event)
  const data = addDemoCategory(await readBody(event))
  setResponseStatus(event, 201)
  return { success: true, data, message: 'Demo category created' }
})
