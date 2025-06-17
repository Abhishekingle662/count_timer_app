import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Counter Timer App',
        short_name: 'Count+Timer',
        description: 'A mobile-first PWA for tracking goals with counters and a stopwatch.',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'plus-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'plus-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      includeAssets: ['plus-icon.svg'],
    })
  ],
})
