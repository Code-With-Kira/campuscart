// Structural and shared-validation checks for Stage 6. Not a Nuxt build or browser test.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { validateRegistration, validateAddress, validateEmail, validateNames } from '../app/utils/accountValidation.ts'
const read = (file) => fs.readFileSync(file, 'utf8')
const file = (path) => assert.ok(fs.existsSync(path), `Missing ${path}`)
let done = 0
function check(label, fn) { fn(); console.log(`PASS ${String(++done).padStart(2, '0')} ${label}`) }
const registration = {first_name:'Alex',last_name:'Student',email:'demo.student@example.test',password:'temporaryDemoPass123',confirm_password:'temporaryDemoPass123'}
const address = {address_label:'Dorm',recipient_name:'Alex Student',phone_number:'0912 000 0000',barangay:'Mock Barangay',city:'Demo City',is_default:true}
check('Valid fictional registration passes shared form checks',()=>assert.deepEqual(validateRegistration(registration),{}))
check('Invalid email fails validation',()=>assert.ok(validateEmail('no-at-sign')))
check('Blank first name is rejected',()=>assert.ok(validateNames('', 'Student').first_name))
check('Short demo password is rejected',()=>assert.ok(validateRegistration({...registration,password:'123'}).password))
check('Password mismatch is rejected',()=>assert.ok(validateRegistration({...registration,confirm_password:'bad'}).confirm_password))
check('Email length is limited',()=>assert.ok(validateEmail('a'.repeat(254)+'@example.test')))
check('Valid ERD-based address draft passes',()=>assert.deepEqual(validateAddress(address),{}))
check('Missing barangay fails',()=>assert.ok(validateAddress({...address,barangay:''}).barangay))
check('Missing city fails',()=>assert.ok(validateAddress({...address,city:''}).city))
check('Invalid demo phone fails',()=>assert.ok(validateAddress({...address,phone_number:'abc'}).phone_number))
check('Overlong address label fails',()=>assert.ok(validateAddress({...address,address_label:'x'.repeat(51)}).address_label))
for(const path of ['app/pages/login.vue','app/pages/register.vue','app/pages/profile/index.vue','app/pages/profile/addresses.vue','app/pages/orders/index.vue','app/pages/orders/[order_id].vue','app/stores/auth.ts','app/middleware/customer.ts','app/middleware/admin.ts','app/plugins/auth-session.client.ts','app/services/account.ts','app/types/account.ts','server/utils/mockAccounts.ts']){
  check(`Stage 6 source exists: ${path}`,()=>file(path))
}
const server = read('server/utils/mockAccounts.ts')
check('Mock sessions are opaque and HttpOnly',()=>assert.ok(server.includes('randomBytes(32)')&&server.includes('httpOnly: true')&&server.includes("sameSite: 'strict'")))
check('Passwords are hashed only on the server',()=>assert.ok(server.includes('scryptSync')&&server.includes('timingSafeEqual')&&!read('app/stores/auth.ts').includes('password_hash')))
check('Server strips hash from account response',()=>assert.ok(server.includes('function publicly')&&!server.split('function publicly')[1].split('function newUser')[0].includes('password_hash')))
check('Registration does not accept client role',()=>assert.ok(server.includes("'CUSTOMER', password")))
check('Development shortcut disabled outside development',()=>assert.ok(server.includes("process.env.NODE_ENV !== 'development'")))
check('Server enforces customer role for me routes',()=>assert.ok(server.includes('function requireCustomer')&&server.includes('account.role !== \'CUSTOMER\'')))
check('Addresses checked against user ID',()=>assert.ok(server.includes('address.user_id === userId')))
check('One default address per user handled',()=>assert.ok(server.includes('clearDefault(userId)')))
check('One account owns at most ten demo addresses',()=>assert.ok(server.includes('existing.length >= 10')))
check('Temporary sessions are stored in server memory',()=>assert.ok(server.includes('new Map<string, StoredSession>')))
check('Address fields match the approved ERD',()=>assert.ok(['address_label','recipient_name','phone_number','barangay','city','is_default'].every(x=>server.includes(x))))
check('Customer orders now use authenticated demo order records',()=>assert.ok(read('server/api/v1/me/orders/index.get.ts').includes('listCustomerOrders') && read('server/api/v1/me/orders/index.get.ts').includes('requireCustomer(event)')))
check('Customer and admin routes use middleware',()=>assert.ok(read('app/pages/profile/index.vue').includes("middleware: 'customer'")&&read('app/pages/admin/index.vue').match(/middleware:\s*'admin'/)))
check('Nav dynamically reflects demo login',()=>assert.ok(read('app/components/layout/SiteHeader.vue').includes('useAuthStore')))
check('Stage 5 cart component fixes preserved',()=>assert.ok(read('app/pages/cart.vue').includes('<CartItem')&&read('app/pages/cart.vue').includes('<CartSummary')))
check('Duplicate DemoCartItem store re-export removed',()=>assert.ok(!read('app/stores/cart.ts').includes("export type { DemoCartItem }")))
check('Stage 5 verifier updated for explicit imports',()=>assert.ok(read('scripts/verify-stage5.mjs').includes("import CartItem from")))
check('Original Nuxt and Tailwind config retained',()=>assert.ok(read('nuxt.config.ts').includes("'@pinia/nuxt'")&&read('nuxt.config.ts').includes('tailwindcss()')))
for(const path of ['server/api/v1/auth/login.post.ts','server/api/v1/auth/register.post.ts','server/api/v1/auth/me.get.ts','server/api/v1/auth/logout.post.ts','server/api/v1/auth/demo.post.ts','server/api/v1/me/profile.patch.ts','server/api/v1/me/addresses/index.get.ts','server/api/v1/me/addresses/index.post.ts','server/api/v1/me/addresses/[address_id].patch.ts','server/api/v1/me/addresses/[address_id].delete.ts','server/api/v1/me/addresses/[address_id]/default.patch.ts','server/api/v1/me/orders/index.get.ts'])check(`Mock API handler exists: ${path}`,()=>file(path))
console.log(`\n${done} Stage 6 structural/validation checks passed. Run Nuxt typecheck, build, API and browser tests on your laptop.`)
