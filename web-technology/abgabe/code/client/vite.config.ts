/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Ports can be changed with environment variables, e.g. for the E2E tests
// (see playwright.config.ts). Without them, the defaults from the README apply.
const clientPort = Number(process.env.CLIENT_PORT ?? 5173)
const apiPort = Number(process.env.API_PORT ?? 3001)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: clientPort,
    strictPort: true,
    // Forward every request to /api to the Express server. The client only
    // uses relative URLs like /api/sessions and needs no CORS.
    proxy: {
      '/api': `http://localhost:${apiPort}`,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
