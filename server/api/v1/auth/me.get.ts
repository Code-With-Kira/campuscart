import { currentUser, publicly } from '../../../utils/mockAccounts'
export default defineEventHandler((event) => ({
  success: true, data: currentUser(event) ? publicly(currentUser(event)!) : null,
  message: 'Demo session checked',
}))
