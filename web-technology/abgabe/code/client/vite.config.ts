// Einstellungen für Vite (Entwicklungsserver und Build) und Vitest (Tests des Clients).

/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Die Ports lassen sich mit Umgebungsvariablen ändern, z. B. für die E2E-Tests
// (siehe playwright.config.ts). Ohne sie gelten die Standardwerte aus dem README.
const clientPort = Number(process.env.CLIENT_PORT ?? 5173)
const apiPort = Number(process.env.API_PORT ?? 3001)

export default defineConfig({
  plugins: [react()],
  server: {
    port: clientPort,
    strictPort: true,
    // Proxy: Jede Anfrage an /api wird an den Express-Server weitergeleitet. So benutzt der
    // Client nur relative URLs wie /api/sessions, und es braucht kein CORS.
    proxy: {
      '/api': `http://localhost:${apiPort}`,
    },
  },
  test: {
    // jsdom spielt in den Tests den Browser (document, localStorage …)
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
