import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The demo build is served from a project page, so assets need the repo name
// as a base. The container build is served from the root and must not have it.
const demo = process.env.VITE_DEMO === '1'

export default defineConfig({
  plugins: [react()],
  base: demo ? '/awesome-hermes-starter/' : '/',
  build: { outDir: demo ? 'demo-dist' : 'dist', emptyOutDir: true },
  // During `npm run dev` the API lives in the container; proxy so the dev
  // server and the built bundle behave identically.
  server: {
    proxy: { '/api': { target: 'http://127.0.0.1:9120', changeOrigin: true } },
  },
})
