import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // The CMS API runs separately (cms-api/, port 8000). Forwarding /api to it makes
    // the browser see one site, so the editor's login cookie just works.
    // (On Vercel, vercel.json does the same job.)
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/public/assets',
    },
  },
})
