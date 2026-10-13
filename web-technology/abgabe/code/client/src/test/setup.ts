// Läuft vor jedem Test-File (eingetragen in vite.config.ts): macht nach jedem Test alles sauber.

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Ohne Vitest-Globals räumt die React Testing Library nicht von selbst auf
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})
