import { defineConfig, devices } from '@playwright/test'

// Konfiguration der End-to-End-Tests (e2e/) im echten Browser (Chromium) gegen den echten Server.
// Eigene Ports, damit die Tests auch laufen, während `pnpm dev` offen ist.
const API_PORT = '3101'
const CLIENT_PORT = '5273'

export default defineConfig({
  testDir: './e2e',
  // Die Tests teilen sich einen Server, darum laufen sie nacheinander
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${CLIENT_PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'pnpm --filter @scrum-poker/server start',
      url: `http://localhost:${API_PORT}/api/sessions`,
      env: { PORT: API_PORT },
      reuseExistingServer: false,
    },
    {
      // Bewusst der Dev-Server (nicht der Build): Nur in der Entwicklung startet der
      // React-StrictMode Effekte doppelt und zeigt seine Warnungen.
      command: 'pnpm --filter @scrum-poker/client dev',
      url: `http://localhost:${CLIENT_PORT}`,
      env: { CLIENT_PORT, API_PORT },
      reuseExistingServer: false,
    },
  ],
})
