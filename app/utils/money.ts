// Use integer centavos for client-side *display* calculations.
// Checkout totals must be recalculated by the real backend.
export function pesosToCentavos(value: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return 0
  const [whole, fraction = ''] = value.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}
export function formatCentavos(centavos: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP', minimumFractionDigits: 2,
  }).format(centavos / 100)
}
export function formatPrice(price: string): string {
  return formatCentavos(pesosToCentavos(price))
}
