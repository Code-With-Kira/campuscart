// STAGE 6 DEMO ONLY: In-memory records disappear on Nuxt server restart.
// No PostgreSQL, production identity provider, or durable account storage exists.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import type { AddressDraft, CampusAddress, DemoRole, PublicAccount } from '../../app/types/account'

interface StoredAccount extends PublicAccount { password_hash: string }
interface StoredSession { user_id: number; expires: number }
const users = new Map<number, StoredAccount>()
const sessions = new Map<string, StoredSession>()
const addresses = new Map<number, CampusAddress>()
let nextUserId = 1001
let nextAddressId = 3001
const cookieName = 'campuscart_demo_sid'
const sessionLifetime = 1000 * 60 * 60 * 8

function fail(code: number, message: string): never { throw createError({ statusCode: code, statusMessage: message }) }
function stringField(value: unknown, limit: number): string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= limit ? value.trim() : ''
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9 ()-]{7,30}$/
export function normalizeProfile(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(422, 'Invalid profile details')
  const row = body as Record<string, unknown>
  const first_name = stringField(row.first_name, 100)
  const last_name = stringField(row.last_name, 100)
  const email = stringField(row.email, 255).toLowerCase()
  if (!first_name || !last_name || !emailPattern.test(email)) fail(422, 'Check first name, last name, and email')
  return { first_name, last_name, email }
}
function ensureAvailableEmail(email: string, except?: number) {
  if ([...users.values()].some(user => user.email === email && user.user_id !== except)) fail(409, 'This demo email is already registered')
}
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
function passwordMatches(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(':')
  if (!salt || !digest) return false
  const actual = scryptSync(password, salt, 64)
  const expected = Buffer.from(digest, 'hex')
  return expected.length === actual.length && timingSafeEqual(actual, expected)
}
export function publicly(account: StoredAccount): PublicAccount {
  const { user_id, first_name, last_name, email, role, account_status, created_at, updated_at } = account
  return { user_id, first_name, last_name, email, role, account_status, created_at, updated_at }
}
function newUser(first_name: string, last_name: string, email: string, role: DemoRole, password: string) {
  const created_at = new Date().toISOString()
  const account: StoredAccount = {
    user_id: nextUserId++, first_name, last_name, email, role,
    account_status: 'ACTIVE', created_at, updated_at: created_at, password_hash: hashPassword(password),
  }
  users.set(account.user_id, account)
  return account
}
export function registerUser(body: unknown): StoredAccount {
  const fields = normalizeProfile(body)
  const password = (body as Record<string, unknown>).password
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) fail(422, 'Demo password must be 12–128 characters')
  ensureAvailableEmail(fields.email)
  // The client NEVER gets to set its role; registrations are customer accounts.
  return newUser(fields.first_name, fields.last_name, fields.email, 'CUSTOMER', password)
}
export function loginUser(body: unknown): StoredAccount {
  if (!body || typeof body !== 'object') fail(400, 'Invalid login details')
  const value = body as Record<string, unknown>
  const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : ''
  const password = typeof value.password === 'string' ? value.password : ''
  const account = [...users.values()].find(user => user.email === email)
  if (!account || !passwordMatches(password, account.password_hash)) fail(401, 'Incorrect email or password for this demo session')
  return account
}
export function beginSession(event: H3Event, account: StoredAccount) {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { user_id: account.user_id, expires: Date.now() + sessionLifetime })
  setCookie(event, cookieName, token, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: Math.floor(sessionLifetime / 1000),
  })
  return publicly(account)
}
export function currentUser(event: H3Event): StoredAccount | null {
  const token = getCookie(event, cookieName)
  if (!token) return null
  const session = sessions.get(token)
  if (!session || session.expires < Date.now()) {
    sessions.delete(token)
    return null
  }
  return users.get(session.user_id) ?? null
}
export function requireUser(event: H3Event): StoredAccount {
  return currentUser(event) ?? fail(401, 'A demo session is required')
}
export function requireCustomer(event: H3Event): StoredAccount {
  const account = requireUser(event)
  if (account.role !== 'CUSTOMER') fail(403, 'Customer access required')
  return account
}
export function requireAdmin(event: H3Event): StoredAccount {
  const account = requireUser(event)
  if (account.role !== 'ADMIN') fail(403, 'Administrator access required')
  return account
}
export function endSession(event: H3Event) {
  const token = getCookie(event, cookieName)
  if (token) sessions.delete(token)
  deleteCookie(event, cookieName, { path: '/' })
}
export function getDemoPersona(role: DemoRole): StoredAccount {
  // This account-switching shortcut is available ONLY in the Nuxt dev server.
  if (process.env.NODE_ENV !== 'development') fail(404, 'Demo shortcut unavailable')
  const email = role === 'ADMIN' ? 'admin.preview@example.test' : 'student.preview@example.test'
  const existing = [...users.values()].find(user => user.email === email)
  if (existing) return existing
  return role === 'ADMIN'
    ? newUser('CampusCart', 'Administrator', email, 'ADMIN', randomBytes(32).toString('hex'))
    : newUser('Demo', 'Student', email, 'CUSTOMER', randomBytes(32).toString('hex'))
}
export function updateUser(user: StoredAccount, body: unknown): PublicAccount {
  const fields = normalizeProfile(body)
  ensureAvailableEmail(fields.email, user.user_id)
  Object.assign(user, fields, { updated_at: new Date().toISOString() })
  return publicly(user)
}
function normalizeAddress(body: unknown): AddressDraft {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(422, 'Invalid address')
  const row = body as Record<string, unknown>
  const address_label = stringField(row.address_label, 50)
  const recipient_name = stringField(row.recipient_name, 200)
  const phone_number = stringField(row.phone_number, 30)
  const barangay = stringField(row.barangay, 150)
  const city = stringField(row.city, 150)
  if (!address_label || !recipient_name || !phonePattern.test(phone_number) || !barangay || !city) fail(422, 'Check all address fields')
  return { address_label, recipient_name, phone_number, barangay, city, is_default: row.is_default === true }
}
export function listAddresses(userId: number) {
  return [...addresses.values()].filter(row => row.user_id === userId).sort((a, b) => a.address_id - b.address_id)
}
function clearDefault(userId: number) {
  for (const record of addresses.values()) if (record.user_id === userId) record.is_default = false
}
export function addAddress(userId: number, body: unknown): CampusAddress {
  const draft = normalizeAddress(body)
  const existing = listAddresses(userId)
  if (existing.length >= 10) fail(422, 'Maximum of 10 demo addresses')
  const isDefault = draft.is_default || existing.length === 0
  if (isDefault) clearDefault(userId)
  const row: CampusAddress = { ...draft, is_default: isDefault,
    address_id: nextAddressId++, user_id: userId, created_at: new Date().toISOString(),
  }
  addresses.set(row.address_id, row)
  return row
}
export function requireAddress(userId: number, addressId: number): CampusAddress {
  const address = addresses.get(addressId)
  return address && address.user_id === userId ? address : fail(404, 'Demo address not found')
}
export function editAddress(userId: number, addressId: number, body: unknown): CampusAddress {
  const record = requireAddress(userId, addressId)
  const draft = normalizeAddress(body)
  if (draft.is_default) clearDefault(userId)
  Object.assign(record, draft)
  if (!listAddresses(userId).some(row => row.is_default)) record.is_default = true
  return record
}
export function setDefaultAddress(userId: number, addressId: number): CampusAddress {
  const record = requireAddress(userId, addressId)
  clearDefault(userId)
  record.is_default = true
  return record
}
export function removeAddress(userId: number, addressId: number) {
  const record = requireAddress(userId, addressId)
  addresses.delete(record.address_id)
  if (record.is_default) {
    const first = listAddresses(userId)[0]
    if (first) first.is_default = true
  }
}
export function parsedAddressId(value: string | undefined) {
  const id = Number(value)
  if (!value || !/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) fail(400, 'Invalid address ID')
  return id
}
