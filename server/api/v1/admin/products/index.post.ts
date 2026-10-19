import { requireAdmin } from '../../../../utils/mockAccounts'
import { addDemoProduct } from '../../../../utils/adminCatalog'
export default defineEventHandler(async event => {
  requireAdmin(event)
  const data = addDemoProduct(await readBody(event))
  setResponseStatus(event, 201)
  return { success: true, data, message: 'Demo product created; edits reset on server restart' }
})
