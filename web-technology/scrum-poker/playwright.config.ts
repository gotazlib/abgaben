import { defineConfig, devices } from '@playwright/test'

// End-to-end tests in a real browser (Chromium) against the real server.
// Own ports, so that the tests also run while `pnpm dev` is open.
const API_PORT = '3101'
const CLIENT_PORT = '5273'

export default defineConfig({
  testDir: './e2e',
  // The tests share one server, so they run one after the other
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
      // The dev server (and not the build) on purpose: only in development
      // React StrictMode runs effects twice and prints its warnings.
      command: 'pnpm --filter @scrum-poker/client dev',
      url: `http://localhost:${CLIENT_PORT}`,
      env: { CLIENT_PORT, API_PORT },
      reuseExistingServer: false,
    },
  ],
})
