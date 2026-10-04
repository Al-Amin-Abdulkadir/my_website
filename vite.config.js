import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // The CMS API runs separately (cms-api/, port 8000). Forwarding these paths to it
    // makes the browser see one site, so the editor's login cookie just works.
    proxy: {
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/public/assets',
    },
  },
})
