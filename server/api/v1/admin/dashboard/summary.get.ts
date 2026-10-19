import { requireAdmin } from '../../../../utils/mockAccounts'
import { mockCategories, mockProducts } from '../../../../utils/mockCatalog'
import { orderStats } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  const stats=orderStats()
  return {success:true,data:{
    total_products:mockProducts.length,
    available_products:mockProducts.filter(p=>p.status==='ACTIVE'&&p.stock_quantity>0).length,
    total_stock_units:mockProducts.reduce((sum,p)=>sum+p.stock_quantity,0),
    total_categories:mockCategories.length,
    total_orders:stats.total,
    pending_orders:stats.pending,
    ready_orders:stats.ready,
    completed_orders:stats.completed,
    cancelled_orders:stats.cancelled,
    low_stock_products:stats.lowStock,
  },message:'Demo inventory and order summary'}
})
