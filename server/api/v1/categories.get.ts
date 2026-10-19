import { mockCategories } from '../../utils/mockCatalog'
export default defineEventHandler(() => ({
  success: true,
  data: mockCategories.filter(category => category.status === 'ACTIVE'),
  message: 'Demo categories retrieved successfully',
}))
