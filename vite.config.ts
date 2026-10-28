import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// En dev, le front appelle /api/... et Vite relaie vers le back Express, qui monte ses routes sous /api.
// Seule exception : le back expose /health hors du préfixe /api.
// Même origine côté navigateur => pas besoin de configurer CORS sur le back pour développer.
const BACK_URL = process.env.VITE_BACK_URL ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      // Règle la plus spécifique en premier : Vite applique la première qui correspond.
      '/api/health': {
        target: BACK_URL,
        changeOrigin: true,
        rewrite: () => '/health',
      },
      '/api': {
        target: BACK_URL,
        changeOrigin: true,
      },
    },
  },
})
