// Stage 7 unit tests for mock checkout transactional logic.
// Uses TypeScript's own transpiler to exercise the pure server-memory module
// without starting Nuxt. Run `node scripts/verify-stage7-transactions.mjs`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import vm from 'node:vm'
const require = createRequire(import.meta.url)
let ts
try { ts = require('typescript') }
catch { ts = require(path.resolve(path.dirname(process.execPath), '../lib/node_modules/typescript')) }
const root = path.resolve(import.meta.dirname,'..')
const get = p => fs.readFileSync(path.join(root,p),'utf8')
let counter=0
function check(label,fn){fn();console.log(`PASS ${String(++counter).padStart(2,'0')} ${label}`)}
// Fake simple dependencies only; the production module itself is unmodified.
const products=[
  {product_id:101,product_name:'Notebook',price:'129.00',stock_quantity:5,status:'ACTIVE',updated_at:''},
  {product_id:201,product_name:'Mouse',price:'499.00',stock_quantity:2,status:'ACTIVE',updated_at:''},
]
const address={address_id:7,user_id:17,recipient_name:'Test Student',phone_number:'09123456789',barangay:'Ampayon',city:'Butuan'}
const mockAccounts={requireAddress:(userId,addrId)=>{
  if(userId!==address.user_id||addrId!==address.address_id){const e=new Error('Address not found');e.statusCode=404;throw e}
  return address
}}
const original=get('server/utils/mockOrders.ts')
const transpiled=ts.transpileModule(original,{fileName:'mockOrders.ts',reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}})
assert.equal(transpiled.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0)
const mod={exports:{}}
vm.runInNewContext(transpiled.outputText,{
  module:mod,exports:mod.exports,require:(id)=>{
    if(id==='h3')return {createError:(v)=>{const e=new Error(v.statusMessage);e.statusCode=v.statusCode;return e}}
    if(id==='./mockCatalog')return {mockProducts:products}
    if(id==='./mockAccounts')return mockAccounts
    throw Error(`Unexpected dependency ${id}`)
  },console,Date,Map,Set},{filename:'server/utils/mockOrders.ts'})
const m=mod.exports
const place=(id='REQUEST-ABCD123456789',items=[{product_id:101,quantity:2}])=>m.placeDemoOrder(17,{address_id:7,payment_method:'CASH_ON_PICKUP',request_id:id,items})
check('Placement snapshots order, items, contact and unpaid cash',()=>{
 const x=place()
 assert.equal(x.order.subtotal,'258.00')
 assert.equal(x.order.shipping_fee,'0.00')
 assert.equal(x.order.total_amount,'258.00')
 assert.equal(x.order.order_status,'PENDING')
 assert.equal(x.payment.payment_status,'UNPAID')
 assert.equal(x.order_address.recipient_name,'Test Student')
 assert.equal(x.items[0].unit_price,'129.00')
 assert.equal(x.history[0].status,1)
 assert.equal(products[0].stock_quantity,3)
})
check('Idempotent replay returns original order and does not double-deduct',()=>{
 const x=place()
 assert.equal(x.order.order_id,1)
 assert.equal(m.listAllOrders().length,1)
 assert.equal(products[0].stock_quantity,3)
 assert.equal(m.listMovements().length,1)
})
check('Same request ID with altered cart is rejected',()=>assert.throws(()=>place('REQUEST-ABCD123456789',[{product_id:101,quantity:1}]),e=>e.statusCode===409))
check('Another customer cannot access order or pickup contact',()=>assert.throws(()=>m.getOrderDetail(1,18),e=>e.statusCode===404))
check('Fake address owned by another user is rejected',()=>assert.throws(()=>m.placeDemoOrder(18,{address_id:7,payment_method:'CASH_ON_PICKUP',request_id:'REQUEST-WRONGOWNER',items:[{product_id:101,quantity:1}]}),e=>e.statusCode===404))
check('Invalid method and duplicate products rejected',()=>{
 assert.throws(()=>m.placeDemoOrder(17,{address_id:7,payment_method:'CARD',request_id:'REQUEST-BADMETHOD',items:[{product_id:101,quantity:1}]}),e=>e.statusCode===422)
 assert.throws(()=>place('REQUEST-DUPLICATES',[{product_id:101,quantity:1},{product_id:101,quantity:1}]),e=>e.statusCode===422)
})
check('Stock shortfall rejects all lines without partial changes',()=>{
 const count=m.listAllOrders().length
 assert.throws(()=>place('REQUEST-STOCKFAIL',[{product_id:101,quantity:1},{product_id:201,quantity:3}]),e=>e.statusCode===409)
 assert.equal(m.listAllOrders().length,count)
 assert.equal(products[0].stock_quantity,3)
 assert.equal(products[1].stock_quantity,2)
})
check('Price and quantity snapshots survive subsequent product edits',()=>{
 products[0].price='999.00'
 const x=m.getOrderDetail(1,17)
 assert.equal(x.items[0].unit_price,'129.00')
 assert.equal(x.order.total_amount,'258.00')
})
check('Valid ready transition records numeric history code 2',()=>{
 const x=m.updateDemoOrderStatus(1,99,'READY_FOR_PICKUP')
 assert.equal(x.order.order_status,'READY_FOR_PICKUP')
 assert.equal(x.history.at(-1).status,2)
 assert.equal(x.payment.payment_status,'UNPAID')
})
check('Payment switches to PAID only on completed pickup',()=>{
 const x=m.updateDemoOrderStatus(1,99,'COMPLETED')
 assert.equal(x.payment.payment_status,'PAID')
 assert.ok(x.payment.paid_at)
 assert.equal(x.order.order_status,'COMPLETED')
 assert.equal(products[0].stock_quantity,3)
})
check('Completed orders cannot be cancelled or completed twice',()=>{
 assert.throws(()=>m.updateDemoOrderStatus(1,99,'CANCELLED'),e=>e.statusCode===409)
 assert.throws(()=>m.updateDemoOrderStatus(1,99,'COMPLETED'),e=>e.statusCode===409)
})
check('Cancellation restores stock exactly once and logs movement',()=>{
 const x=place('REQUEST-CANCEL1234567',[{product_id:201,quantity:1}])
 assert.equal(products[1].stock_quantity,1)
 const id=x.order.order_id
 const y=m.updateDemoOrderStatus(id,99,'CANCELLED')
 assert.equal(y.payment.payment_status,'UNPAID')
 assert.equal(products[1].stock_quantity,2)
 assert.equal(m.listMovements().filter(r=>r.order_id===id).length,2)
 assert.throws(()=>m.updateDemoOrderStatus(id,99,'CANCELLED'),e=>e.statusCode===409)
 assert.equal(products[1].stock_quantity,2)
})
check('Invalid transition and invalid price never create an order',()=>{
 assert.throws(()=>m.updateDemoOrderStatus(999,99,'COMPLETED'),e=>e.statusCode===404)
 products[1].price='abc'
 assert.throws(()=>place('REQUEST-BADPRICE123',[{product_id:201,quantity:1}]),e=>e.statusCode===422)
 assert.equal(m.listAllOrders().length,2)
})
console.log(`\n${counter} Stage 7 transactional unit tests passed.`)
