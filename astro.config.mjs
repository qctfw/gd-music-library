import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import { AstroPWAIntegration } from '@vite-pwa/astro';


// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    vue(),
    AstroPWAIntegration({
      injectRegister: false,
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
      generateSW: {
        globPatterns: ['**/*.{html,js,json,css,png,webp,jpg,ico,woff2,ttf}'],
        globIgnores: ['android-chrome-192x192.png'],
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});