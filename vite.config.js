import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  // Netlify serves this application at the root of its domain.
  base: '/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      filename: 'sw.js',
      manifestFilename: 'manifest.webmanifest',
      scope: '/',
      registerType: 'autoUpdate',
      // src/main.jsx already registers the worker via virtual:pwa-register.
      // Keep a single registration mechanism.
      injectRegister: null,
      includeAssets: ['rose.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: '/',
        name: 'Rose Planner',
        short_name: 'Rose Planner',
        description: 'Votre quotidien, tout en douceur',
        lang: 'fr',
        theme_color: '#b85b7a',
        background_color: '#fffaf7',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        prefer_related_applications: false,
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
