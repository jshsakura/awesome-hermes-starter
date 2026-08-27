import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  // During `npm run dev` the API lives in the container; proxy so the dev
  // server and the built bundle behave identically.
  server: {
    proxy: { '/api': { target: 'http://127.0.0.1:9120', changeOrigin: true } },
  },
})
