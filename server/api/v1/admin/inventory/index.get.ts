import { requireAdmin } from '../../../../utils/mockAccounts'
import { mockProducts } from '../../../../utils/mockCatalog'
import { listMovements } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success:true,data: {
    products:mockProducts.map(({product_id,sku,product_name,stock_quantity})=>({product_id,sku,product_name,stock_quantity})),
    movements:listMovements(),
  },message:'Demo stock and movement history' }
})
