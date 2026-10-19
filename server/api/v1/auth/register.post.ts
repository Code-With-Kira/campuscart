import { beginSession, registerUser } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => {
  const account = registerUser(await readBody(event))
  setResponseStatus(event, 201)
  return { success: true, data: beginSession(event, account), message: 'Temporary demo customer registered' }
})
