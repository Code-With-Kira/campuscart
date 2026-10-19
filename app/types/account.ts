// Field names originate from the approved CampusCart ERD.
// These role/status strings are PROVISIONAL mock values, not the finalized SQL enums.
export type DemoRole = 'CUSTOMER' | 'ADMIN'
export type DemoAccountStatus = 'ACTIVE'

export interface PublicAccount {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role: DemoRole
  account_status: DemoAccountStatus
  created_at: string
  updated_at: string
  // password_hash is deliberately never included in client responses.
}

export interface CampusAddress {
  address_id: number
  user_id: number
  address_label: string
  recipient_name: string
  phone_number: string
  barangay: string
  city: string
  is_default: boolean
  created_at: string
}

export type AddressDraft = Pick<CampusAddress,
  'address_label' | 'recipient_name' | 'phone_number' | 'barangay' | 'city' | 'is_default'
>

export interface RegistrationDraft {
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string // form-only; not a database column
}

export interface AccountResponse<T> {
  success: boolean
  data: T
  message: string
}
