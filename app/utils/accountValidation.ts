import type { AddressDraft, RegistrationDraft } from '../types/account'

// Shared client-side form checks; all write endpoints validate independently too.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9 ()-]{7,30}$/
export type FieldErrors = Record<string, string>

export function validateNames(first: string, last: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!first.trim() || first.trim().length > 100) errors.first_name = 'First name must be 1–100 characters.'
  if (!last.trim() || last.trim().length > 100) errors.last_name = 'Last name must be 1–100 characters.'
  return errors
}
export function validateEmail(value: string): string {
  return value.length <= 255 && emailPattern.test(value.trim()) ? '' : 'Enter a valid email address (up to 255 characters).'
}
export function validateRegistration(draft: RegistrationDraft): FieldErrors {
  const errors = validateNames(draft.first_name, draft.last_name)
  const emailError = validateEmail(draft.email)
  if (emailError) errors.email = emailError
  if (draft.password.length < 12 || draft.password.length > 128) errors.password = 'Use a demo password between 12 and 128 characters.'
  if (draft.password !== draft.confirm_password) errors.confirm_password = 'Passwords do not match.'
  return errors
}
export function validateAddress(draft: AddressDraft): FieldErrors {
  const errors: FieldErrors = {}
  if (!draft.address_label.trim() || draft.address_label.trim().length > 50) errors.address_label = 'Use a label between 1 and 50 characters.'
  if (!draft.recipient_name.trim() || draft.recipient_name.trim().length > 200) errors.recipient_name = 'Recipient name must be 1–200 characters.'
  if (!phonePattern.test(draft.phone_number.trim())) errors.phone_number = 'Enter a valid demo phone number (7–30 characters).'
  if (!draft.barangay.trim() || draft.barangay.trim().length > 150) errors.barangay = 'Barangay must be 1–150 characters.'
  if (!draft.city.trim() || draft.city.trim().length > 150) errors.city = 'City must be 1–150 characters.'
  return errors
}
