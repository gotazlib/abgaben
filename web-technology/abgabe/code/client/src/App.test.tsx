// Tests für das Routing in App.tsx: welche Seite bei welcher URL erscheint.

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { UserProvider } from './UserContext'

function renderAt(path: string) {
  render(
    <UserProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </UserProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('routing', () => {
  it('shows the home page on /', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(Response.json([]))))
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Gemeinsam schätzen' })).toBeInTheDocument()
    // Auf die Liste warten, damit sich nach dem Test kein State mehr ändert
    await screen.findByText(/Noch keine offenen Sessions/)
  })

  it('passes the session ID from the URL to the session page', () => {
    renderAt('/sessions/abc123')
    expect(screen.getByRole('heading', { level: 1, name: 'Session abc123' })).toBeInTheDocument()
  })

  it('shows the not found page with a link back for unknown URLs', () => {
    renderAt('/does/not/exist')
    expect(screen.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Zurück zur Übersicht' })).toHaveAttribute('href', '/')
  })

  it('shows the header with a link to the home page on every page', () => {
    renderAt('/does/not/exist')
    expect(screen.getByRole('link', { name: 'Scrum Poker' })).toHaveAttribute('href', '/')
  })
})
