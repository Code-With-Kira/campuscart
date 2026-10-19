import tailwindcss from '@tailwindcss/vite'
import { storefront } from './app/config/storefront'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],

  // Public integration configuration; do not put credentials here.
  // Nuxt supports runtime overrides: NUXT_PUBLIC_API_BASE and NUXT_PUBLIC_ENABLE_DEMO_PREVIEW.
  runtimeConfig: {
    public: {
      apiBase: '/api/v1',
      enableDemoPreview: false,
    },
  },

  css: [
    '@fontsource-variable/inter/wght.css',
    '~/assets/css/main.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: `${storefront.name} | Student Essentials`,
      meta: [
        {
          name: 'description',
          content:
            'CampusCart is a student-focused ecommerce platform for school supplies, technology accessories, and campus merchandise.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: storefront.brand.favicon }],
    },
  },
})
