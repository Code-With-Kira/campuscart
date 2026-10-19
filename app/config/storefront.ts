/** Source of truth for stable frontend presentation defaults.
 * Dynamic product/category records still belong to the API; these are NOT DB columns.
 * Change this file to replace the display logo, hero artwork or static store copy.
 */
export const storefront = {
  name: 'CampusCart',
  brand: {
    logoSrc: '', // Optional image asset: e.g. '/images/branding/campuscart-logo.svg'. Empty retains original wordmark.
    logoAlt: 'CampusCart',
    wordmarkPrimary: 'Campus',
    wordmarkAccent: 'Cart',
    favicon: '/favicon.svg',
  },
  announcement: 'Your campus essentials, all in one convenient place.',
  featuredProductIds: [201, 101, 301, 202], // Editorial fallback until backend confirms featured-product contract
  navigationFallbackCategories: [
    'School Supplies', 'Tech Accessories', 'Campus Merchandise',
  ],
  hero: {
    eyebrow: 'Made for campus life',
    titleFirst: 'Big goals.',
    titleSecond: 'Little essentials.',
    description: 'From the first lecture to the final project, find school supplies, useful tech and campus-inspired favorites in one easy place.',
    primaryText: 'Shop Now',
    primaryTo: '/products',
    secondaryText: 'About CampusCart',
    secondaryTo: '/information/about',
    disclaimer: 'A student ecommerce project · Product information is sample data',
    tiles: {
      notebook: { image: '/images/products/notebook.svg', alt: 'Illustration of a study notebook', label: 'Study ready', caption: 'School essentials' },
      headphones: { image: '/images/products/headphones.svg', alt: 'Illustration of headphones', label: 'Stay focused', caption: 'Tech accessories' },
      tote: { image: '/images/products/tote.svg', alt: 'Illustration of a campus-inspired tote bag', label: 'Carry your campus day' },
    },
  },
  footer: {
    description: 'Student essentials, thoughtfully gathered. An independent ITE 18 academic demo, not an official university store.',
    socialNotice: 'Social links will appear here once official CampusCart accounts are confirmed.',
    paymentNotice: 'No purchases or payments are processed in this demo.',
    copyright: '© 2026 CampusCart. Student ecommerce project.',
    tagline: 'Made for learning · Inspired by campus life',
  },
} as const
