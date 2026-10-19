import { beginSession, loginUser } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => ({
  success: true,
  data: beginSession(event, loginUser(await readBody(event))),
  message: 'Demo login successful',
}))
