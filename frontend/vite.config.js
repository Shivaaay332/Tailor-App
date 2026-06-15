import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // App update hone par automatically naya version aayega
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Tailor Manager PWA',
        short_name: 'Tailor App',
        description: 'Mobile First Tailor Shop Management System',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Ye browser URL bar ko chupa dega, bilkul app jaisa feel aayega
        icons: [
          {
            src: 'pwa-192x192.png', // Tumhe baad me public folder me ek 192x192 logo daalna hoga
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Ek 512x512 logo
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})