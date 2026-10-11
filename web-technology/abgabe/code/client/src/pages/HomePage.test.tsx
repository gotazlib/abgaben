import type { SessionSummary } from '@scrum-poker/shared'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UserProvider } from '../context/UserContext'
import { NAME_STORAGE_KEY } from '../context/UserContextValue'
import HomePage from './HomePage'

const olderSession: SessionSummary = { id: 'aaa111', participantCount: 1, createdAt: '2026-10-11T08:00:00.000Z' }
const newerSession: SessionSummary = { id: 'bbb222', participantCount: 3, createdAt: '2026-10-11T09:00:00.000Z' }

// A tiny fake of the REST API: answers like the real server and remembers deletions
function mockServer(initialSessions: SessionSummary[]) {
  let sessions = initialSessions
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    if (method === 'POST' && url === '/api/sessions') {
      return Promise.resolve(Response.json({ id: 'new123' }, { status: 201 }))
    }
    if (method === 'DELETE') {
      sessions = sessions.filter((session) => url !== `/api/sessions/${session.id}`)
      return Promise.resolve(new Response(null, { status: 204 }))
    }
    return Promise.resolve(Response.json(sessions))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

// Stands in for the poker table, so we can see where the navigation went
function SessionPageStub() {
  const { sessionId } = useParams()
  return <p>Pokertisch {sessionId}</p>
}

function renderHomePage() {
  render(
    <UserProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sessions/:sessionId" element={<SessionPageStub />} />
        </Routes>
      </MemoryRouter>
    </UserProvider>,
  )
}

function nameInput() {
  return screen.getByLabelText('Dein Name')
}

function createButton() {
  return screen.getByRole('button', { name: 'Neue Session erstellen' })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('HomePage: name', () => {
  it('fills in the name from localStorage', async () => {
    localStorage.setItem(NAME_STORAGE_KEY, 'Anna')
    mockServer([])
    renderHomePage()

    expect(nameInput()).toHaveValue('Anna')
    expect(nameInput()).toHaveAttribute('aria-invalid', 'false')
    await screen.findByText(/Noch keine offenen Sessions/)
  })

  it('saves every change of the name right away', async () => {
    mockServer([])
    renderHomePage()

    fireEvent.change(nameInput(), { target: { value: 'Ben' } })

    expect(localStorage.getItem(NAME_STORAGE_KEY)).toBe('Ben')
    await screen.findByText(/Noch keine offenen Sessions/)
  })

  it('reports an empty name or a name with only spaces and blocks creating and joining', async () => {
    mockServer([olderSession])
    renderHomePage()
    await screen.findByText('Session aaa111')

    for (const value of ['', '   ']) {
      fireEvent.change(nameInput(), { target: { value } })

      expect(screen.getByText('Bitte gib deinen Namen ein.')).toBeInTheDocument()
      expect(nameInput()).toHaveAttribute('aria-invalid', 'true')
      expect(nameInput()).toHaveAccessibleDescription('Bitte gib deinen Namen ein.')
      expect(createButton()).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Beitreten' })).toBeDisabled()
    }
  })
})

describe('HomePage: create session', () => {
  it('creates a session and navigates to it', async () => {
    localStorage.setItem(NAME_STORAGE_KEY, 'Anna')
    const fetchMock = mockServer([])
    renderHomePage()
    await screen.findByText(/Noch keine offenen Sessions/)

    fireEvent.click(createButton())

    expect(screen.getByRole('button', { name: 'Wird erstellt…' })).toBeDisabled()
    expect(await screen.findByText('Pokertisch new123')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/sessions', expect.objectContaining({ method: 'POST' }))
  })

  it('shows an error if the session cannot be created', async () => {
    localStorage.setItem(NAME_STORAGE_KEY, 'Anna')
    mockServer([])
    renderHomePage()
    await screen.findByText(/Noch keine offenen Sessions/)
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))

    fireEvent.click(createButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('Session konnte nicht erstellt werden.')
    expect(createButton()).toBeEnabled()
  })
})

describe('HomePage: session list', () => {
  it('shows a loading indicator until the first answer arrives', async () => {
    mockServer([])
    renderHomePage()

    expect(screen.getByRole('status')).toHaveTextContent('Sessions werden geladen…')
    await screen.findByText(/Noch keine offenen Sessions/)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('lists the sessions newest first with their number of participants', async () => {
    mockServer([olderSession, newerSession])
    renderHomePage()

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Session bbb222')
    expect(items[0]).toHaveTextContent('3 Personen')
    expect(items[1]).toHaveTextContent('Session aaa111')
    expect(items[1]).toHaveTextContent('1 Person')
  })

  it('shows a message if there are no open sessions', async () => {
    mockServer([])
    renderHomePage()

    expect(await screen.findByText('Noch keine offenen Sessions. Erstelle die erste!')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows an error if the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))
    renderHomePage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Server nicht erreichbar.')
  })

  it('keeps showing the last list while the server is down', async () => {
    // Fake only the interval, so that promises and findBy still work normally
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    mockServer([olderSession])
    renderHomePage()
    await screen.findByText('Session aaa111')

    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))
    await act(() => vi.advanceTimersByTimeAsync(3_000))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server nicht erreichbar.')
    expect(screen.getByText('Session aaa111')).toBeInTheDocument()
  })

  it('navigates to the session when joining', async () => {
    localStorage.setItem(NAME_STORAGE_KEY, 'Anna')
    mockServer([olderSession])
    renderHomePage()

    fireEvent.click(await screen.findByRole('button', { name: 'Beitreten' }))

    expect(await screen.findByText('Pokertisch aaa111')).toBeInTheDocument()
  })
})

describe('HomePage: delete session', () => {
  it('deletes a session after confirming and removes it from the list', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const fetchMock = mockServer([olderSession, newerSession])
    renderHomePage()

    // Newest first, so the first entry is bbb222
    const [item] = await screen.findAllByRole('listitem')
    fireEvent.click(within(item).getByRole('button', { name: 'Löschen' }))

    expect(confirmSpy).toHaveBeenCalledWith('Session bbb222 (3 Personen) wirklich löschen?')
    expect(within(item).getByRole('button', { name: 'Wird gelöscht…' })).toBeDisabled()
    await vi.waitFor(() => expect(screen.queryByText('Session bbb222')).not.toBeInTheDocument())
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/bbb222', expect.objectContaining({ method: 'DELETE' }))
  })

  it('does nothing if the deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const fetchMock = mockServer([olderSession])
    renderHomePage()

    fireEvent.click(await screen.findByRole('button', { name: 'Löschen' }))

    expect(screen.getByText('Session aaa111')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'DELETE' }))
  })
})
