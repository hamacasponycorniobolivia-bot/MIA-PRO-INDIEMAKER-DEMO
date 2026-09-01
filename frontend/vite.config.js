import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router')
          ) {
            return 'react'
          }

          if (id.includes('/ethers/')) {
            return 'web3'
          }

          if (
            id.includes('/react-hook-form/') ||
            id.includes('/zod/')
          ) {
            return 'forms'
          }

          if (
            id.includes('/i18next/') ||
            id.includes('/react-i18next/')
          ) {
            return 'i18n'
          }

          if (id.includes('/axios/')) {
            return 'http'
          }

          if (id.includes('/lucide-react/')) {
            return 'icons'
          }
        },
      },
    },
  },
})
