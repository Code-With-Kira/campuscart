import { mockProducts } from '../../../utils/mockCatalog'

export default defineEventHandler(event => {
  const raw = getRouterParam(event, 'product_id')
  if (!raw || !/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }
  const product = mockProducts.find(item => item.product_id === Number(raw) && item.status === 'ACTIVE')
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return { success: true, data: product, message: 'Demo product retrieved successfully' }
})
