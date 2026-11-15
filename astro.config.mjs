import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Live address. Swap this for your own domain if you add one later.
  site: 'https://alaminhossain.ah111.workers.dev',

  // The old /gallery URL now lives under Travel.
  redirects: {
    '/gallery': '/travel/photos',
  },
});
