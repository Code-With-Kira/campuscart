// UI-only cart snapshot, NOT a database schema extension.
// Real cart_id/cart_item_id and authoritative prices belong to the backend.
export interface DemoCartItem {
  product_id: number
  product_name: string
  price: string
  stock_quantity: number
  status: 'ACTIVE' | 'INACTIVE' // Mock-only enum values; final SQL enum is unresolved.
  quantity: number
}

export const MAX_DEMO_QUANTITY = 999
export const MAX_DEMO_LINES = 60
const VALID_PRICE = /^\d{1,10}\.\d{2}$/

export function validDemoItem(value: unknown): value is DemoCartItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  return typeof item.product_id === 'number' && Number.isSafeInteger(item.product_id) && item.product_id > 0
    && typeof item.product_name === 'string' && item.product_name.length > 0 && item.product_name.length <= 200
    && typeof item.price === 'string' && VALID_PRICE.test(item.price)
    && typeof item.stock_quantity === 'number' && Number.isSafeInteger(item.stock_quantity) && item.stock_quantity >= 0
    && (item.status === 'ACTIVE' || item.status === 'INACTIVE')
    && typeof item.quantity === 'number' && Number.isSafeInteger(item.quantity)
    && item.quantity >= 1 && item.quantity <= MAX_DEMO_QUANTITY
}

// An invalid storage envelope does not replace valid in-memory cart state.
// Invalid, duplicate, or malformed lines are ignored in a valid envelope.
export function sanitizeDemoCart(payload: unknown): DemoCartItem[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const value = payload as Record<string, unknown>
  if (value.version !== 1 || !Array.isArray(value.items) || value.items.length > MAX_DEMO_LINES) return null
  const seen = new Set<number>()
  const valid: DemoCartItem[] = []
  for (const candidate of value.items as unknown[]) {
    if (!validDemoItem(candidate) || seen.has(candidate.product_id)) continue
    seen.add(candidate.product_id)
    valid.push({
      product_id: candidate.product_id,
      product_name: candidate.product_name,
      price: candidate.price,
      stock_quantity: candidate.stock_quantity,
      status: candidate.status,
      quantity: candidate.quantity,
    })
  }
  return valid
}

export function isPermittedQuantity(next: number, stock: number): boolean {
  return Number.isSafeInteger(next) && next >= 1 && next <= MAX_DEMO_QUANTITY
    && Number.isSafeInteger(stock) && next <= stock
}
