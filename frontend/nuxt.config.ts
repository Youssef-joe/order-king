import ws from 'ws';

// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  plugins: ['~/plugins/ws-polyfill.server.ts'],

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    redirect: false, // We handle auth redirects manually
    clientOptions: {
      realtime: {
        transport: ws,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    },
  },

  app: {
    head: {
      title: 'OrderKing — Food Delivery',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Order delicious food from the best restaurants near you' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})
