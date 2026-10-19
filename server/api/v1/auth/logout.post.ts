import { endSession } from '../../../utils/mockAccounts'
export default defineEventHandler((event) => {
  endSession(event)
  return { success: true, data: null, message: 'Signed out of demo session' }
})
