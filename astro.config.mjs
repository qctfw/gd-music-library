import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import AstroPWA from '@vite-pwa/astro';


// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  vite: {
    build: {
      rollupOptions: {
        external: [
          'workbox-window'
        ],
      },
    },
  },
  integrations: [
    AstroPWA({
      injectRegister: 'script-defer',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Geometry Dash Music Library',
        short_name: 'GD Music Library',
        description: 'Geometry Dash Music Library on your browser!',
        background_color: '#0f172a',
        theme_color: '#115e59',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,json,css,png,webp,jpg,ico,woff2,ttf}'],
        runtimeCaching: [
          {
            urlPattern: ({sameOrigin}) => sameOrigin,
            handler: 'CacheFirst',
            options: {
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
        ],
      }
    }),
    vue(),
    tailwind(),
  ],
});