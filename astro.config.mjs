import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import vue from '@astrojs/vue';

import tailwind from '@astrojs/tailwind';

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
    ssr: {
      external: ['node:buffer'],
    },
  },
  integrations: [
    vue(),
    tailwind(),
  ],
});