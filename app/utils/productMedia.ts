// Presentation-only fallback image map. The approved ERD has no image fields.
// Future API responses can optionally include Product.images or Category.image_url.
import type { Product, ProductImage, Category } from '~/types/catalog'

const FALLBACK = '/images/products/placeholder.svg'
const productImages: Record<number, string> = {
  101: '/images/products/notebook.svg',
  102: '/images/products/pen-set.svg',
  103: '/images/products/calculator.svg',
  104: '/images/products/organizer.svg',
  201: '/images/products/mouse.svg',
  202: '/images/products/headphones.svg',
  203: '/images/products/usb-drive.svg',
  204: '/images/products/stand.svg',
  301: '/images/products/tote.svg',
  302: '/images/products/tumbler.svg',
  303: '/images/products/shirt.svg',
  304: '/images/products/lanyard.svg',
}

export const categoryImages: Record<number, string> = {
  1: '/images/categories/school.svg',
  2: '/images/categories/tech.svg',
  3: '/images/categories/merch.svg',
}

export const FALLBACK_PRODUCT_IMAGE = FALLBACK

/** Accept only ordinary http(s) URLs and safe root-relative paths for images. */
export function safeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const url = value.trim()
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url
  if (/^https?:\/\/[^\s/]+/i.test(url)) return url
  return null
}

/** API imagery wins; original SVG mappings remain reliable for offline/mock data. */
export function productImage(product: number | Pick<Product, 'product_id' | 'images'>): string {
  const id = typeof product === 'number' ? product : product.product_id
  if (typeof product !== 'number') {
    const preferred = productImagesFor(product)[0]
    if (preferred) return preferred.url
  }
  return productImages[id] ?? FALLBACK
}

export function productImagesFor(product: Pick<Product, 'product_id' | 'images' >): ProductImage[] {
  const images = Array.isArray(product.images) ? product.images : []
  const valid = images
    .filter((image): image is ProductImage => Boolean(image && typeof image === 'object' && safeImageUrl(image.url)))
    .map(image => ({
      url: safeImageUrl(image.url)!,
      alt: typeof image.alt === 'string' ? image.alt : undefined,
      sort_order: typeof image.sort_order === 'number' && Number.isSafeInteger(image.sort_order) ? image.sort_order : 0,
      is_primary: image.is_primary === true,
    }))
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
  if (valid.length) return valid
  return [{ url: productImages[product.product_id] ?? FALLBACK, alt: undefined, is_primary: true, sort_order: 0 }]
}

export function categoryImage(category: Pick<Category, 'category_id' | 'image_url'>): string {
  return safeImageUrl(category.image_url) ?? categoryImages[category.category_id] ?? FALLBACK
}
