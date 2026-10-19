// Stage 7 demonstration contracts. Field names mirror the approved ERD.
// Enums and numeric history mapping below are approved for MOCK use only.
export type OrderStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID'
export type PaymentMethod = 'CASH_ON_PICKUP'
export type MovementType = 'ORDER_DEDUCTION' | 'ORDER_RESTORATION' // mock enum labels pending final SQL mapping
export interface DemoOrder {
  order_id: number; user_id: number; order_number: string
  subtotal: string; shipping_fee: string; total_amount: string
  order_status: OrderStatus; placed_at: string; created_at: string; updated_at: string
}
export interface DemoOrderItem {
  order_item_id: number; order_id: number; product_id: number
  product_name: string; quantity: number; unit_price: string; subtotal: string
}
export interface DemoOrderAddress {
  order_address_id: number; order_id: number; recipient_name: string
  phone_number: string; barangay: string; city: string
}
export interface DemoPayment {
  payment_id: number; order_id: number; payment_method: PaymentMethod
  payment_status: PaymentStatus; amount: string; payment_reference: string | null
  paid_at: string | null; created_at: string
}
export interface DemoStatusHistory {
  status_history_id: number; order_id: number; changed_by: number
  status: number // ERD is INT: mock mapping 1=PENDING, 2=READY_FOR_PICKUP, 3=COMPLETED, 4=CANCELLED
  remarks: string; created_at: string
}
export interface DemoInventoryMovement {
  movement_id: number; product_id: number; order_id: number | null
  created_by: number; movement_type: MovementType; quantity_change: number
  notes: string; created_at: string
}
export interface OrderDetail {
  order: DemoOrder
  items: DemoOrderItem[]
  order_address: DemoOrderAddress
  payment: DemoPayment
  history: DemoStatusHistory[]
}
export interface PlaceOrderBody {
  address_id: number
  payment_method: PaymentMethod
  items: { product_id: number; quantity: number }[]
  request_id: string // transport-only idempotency token; NOT a database column
}
