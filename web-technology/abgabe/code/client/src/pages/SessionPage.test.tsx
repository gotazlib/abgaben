import { StrictMode } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Participant, SessionState } from '@scrum-poker/shared'
import { UserProvider } from '../context/UserContext'
import { NAME_STORAGE_KEY } from '../context/UserContextValue'
import SessionPage from './SessionPage'

// ---------------------------------------------------------------------------
// A tiny fake server: fetch is replaced by a function that answers like the
// real API. Every test can change `state` or the answer of a single route.
// ---------------------------------------------------------------------------

interface FetchCall {
  method: string
  url: string
  body: unknown
}

let state: SessionState
let calls: FetchCall[]
let nextParticipantNumber: number
// Lets a test replace the answer of one route, e.g. with an error
let override: ((call: FetchCall) => Response | undefined) | null

function participant(id: string, name: string, extra: Partial<Participant> = {}): Participant {
  return { id, name, hasVoted: false, vote: null, ...extra }
}

function fakeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const call: FetchCall = {
    method: init?.method ?? 'GET',
    url: String(input),
    body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
  }
  calls.push(call)
  const answer = override?.(call) ?? answerLikeTheServer(call)
  return Promise.resolve(answer)
}

function answerLikeTheServer({ method, url, body }: FetchCall): Response {
  if (method === 'POST' && url === '/api/sessions/abc/participants') {
    const id = `p${nextParticipantNumber++}`
    const { name } = body as { name: string }
    state = { ...state, participants: [...state.participants, participant(id, name)] }
    return Response.json({ participantId: id }, { status: 201 })
  }
  if (method === 'DELETE') {
    const id = url.split('/').pop()
    state = { ...state, participants: state.participants.filter((p) => p.id !== id) }
    return new Response(null, { status: 204 })
  }
  if (method === 'PUT' && url.endsWith('/vote')) {
    const id = url.split('/')[5]
    const { value } = body as { value: string | null }
    state = {
      ...state,
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, hasVoted: value !== null, vote: value } : p,
      ),
    }
    return Response.json(state)
  }
  if (method === 'PUT' && url.endsWith('/deck')) {
    state = { ...state, ...(body as Pick<SessionState, 'deck'>), revealed: false }
    return Response.json(state)
  }
  if (method === 'POST' && url.endsWith('/reveal')) {
    state = { ...state, revealed: true }
    return Response.json(state)
  }
  if (method === 'GET' && url.startsWith('/api/sessions/abc')) {
    return Response.json(state)
  }
  return Response.json({ error: 'Session nicht gefunden.' }, { status: 404 })
}

function callsTo(method: string, urlPart: string): FetchCall[] {
  return calls.filter((call) => call.method === method && call.url.includes(urlPart))
}

function renderSessionPage({ name = 'Anna', path = '/sessions/abc', strict = false } = {}) {
  if (name) {
    localStorage.setItem(NAME_STORAGE_KEY, name)
  }
  const page = (
    <UserProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/sessions/:sessionId" element={<SessionPage />} />
        </Routes>
      </MemoryRouter>
    </UserProvider>
  )
  return render(strict ? <StrictMode>{page}</StrictMode> : page)
}

// Waits until the poker table of the joined participant is visible
async function findOwnSeat() {
  const table = await screen.findByRole('region', { name: 'Pokertisch' })
  return within(table).getByText('Du').closest('li') as HTMLElement
}

beforeEach(() => {
  state = { id: 'abc', deck: 'fibonacci', revealed: false, participants: [] }
  calls = []
  nextParticipantNumber = 1
  override = null
  vi.stubGlobal('fetch', vi.fn(fakeFetch))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SessionPage', () => {
  it('joins on mount and leaves on unmount', async () => {
    const { unmount } = renderSessionPage()

    expect(screen.getByRole('status')).toHaveTextContent('Trete der Session bei')
    const ownSeat = await findOwnSeat()
    expect(ownSeat).toHaveTextContent('Anna')
    expect(callsTo('POST', '/participants')).toEqual([
      { method: 'POST', url: '/api/sessions/abc/participants', body: { name: 'Anna' } },
    ])
    // Polling sends the participantId as heartbeat
    expect(callsTo('GET', '?participantId=p1')).not.toHaveLength(0)

    unmount()
    expect(callsTo('DELETE', '/participants/p1')).toHaveLength(1)
  })

  it('continues as the same participant after a reload (sessionStorage)', async () => {
    // State before the reload: Anna sits at the table and has voted
    state = { ...state, participants: [participant('p7', 'Anna', { hasVoted: true, vote: '8' })] }
    sessionStorage.setItem('scrum-poker:participant:abc', 'p7')
    renderSessionPage({ strict: true })

    const ownSeat = await findOwnSeat()
    expect(ownSeat).toHaveTextContent('Anna')
    expect(screen.getByRole('button', { name: '8' })).toHaveAttribute('aria-pressed', 'true')
    // No second join and nobody left the table, not even in StrictMode
    expect(callsTo('POST', '/participants')).toHaveLength(0)
    expect(callsTo('DELETE', '/participants')).toHaveLength(0)
    expect(state.participants.map((p) => p.id)).toEqual(['p7'])
  })

  it('joins anew after a reload if the saved participant is gone', async () => {
    sessionStorage.setItem('scrum-poker:participant:abc', 'p7')
    renderSessionPage()

    expect(await findOwnSeat()).toHaveTextContent('Anna')
    expect(callsTo('POST', '/participants')).toHaveLength(1)
    expect(sessionStorage.getItem('scrum-poker:participant:abc')).toBe('p1')
  })

  it('forgets the saved participant when leaving', async () => {
    const { unmount } = renderSessionPage()
    await findOwnSeat()
    expect(sessionStorage.getItem('scrum-poker:participant:abc')).toBe('p1')

    unmount()
    expect(callsTo('DELETE', '/participants/p1')).toHaveLength(1)
    expect(sessionStorage.getItem('scrum-poker:participant:abc')).toBeNull()
  })

  it('leaves the first participant again in StrictMode, so that only one remains', async () => {
    renderSessionPage({ strict: true })
    await findOwnSeat()

    await waitFor(() => expect(state.participants.map((p) => p.id)).toEqual(['p2']))
    expect(callsTo('POST', '/participants')).toHaveLength(2)
    expect(callsTo('DELETE', '/participants/p1')).toHaveLength(1)
    expect(screen.getAllByText('Anna')).toHaveLength(1)
  })

  it('does not join without a name, but asks for one', async () => {
    renderSessionPage({ name: '' })

    expect(screen.getByRole('heading', { name: 'Wie heisst du?' })).toBeInTheDocument()
    expect(callsTo('POST', '/participants')).toHaveLength(0)

    // Only spaces: visible message, joining is not possible
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '   ' } })
    expect(screen.getByText('Bitte gib deinen Namen ein.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Beitreten' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Ben ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Beitreten' }))

    expect(await findOwnSeat()).toHaveTextContent('Ben')
    expect(callsTo('POST', '/participants')[0].body).toEqual({ name: 'Ben' })
  })

  it('shows a message with a link home for an unknown session', async () => {
    renderSessionPage({ path: '/sessions/nope' })

    expect(await screen.findByRole('heading', { name: 'Diese Session existiert nicht (mehr)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Zurück zur Übersicht' })).toHaveAttribute('href', '/')
  })

  it('shows the same message when the session is deleted while polling', async () => {
    renderSessionPage()
    await findOwnSeat()

    override = ({ method }) =>
      method === 'GET' ? Response.json({ error: 'Session nicht gefunden.' }, { status: 404 }) : undefined

    expect(
      await screen.findByRole('heading', { name: 'Diese Session existiert nicht (mehr)' }, { timeout: 3000 }),
    ).toBeInTheDocument()
  })

  it('casts a vote on click and takes it back on a second click', async () => {
    renderSessionPage()
    await findOwnSeat()

    fireEvent.click(screen.getByRole('button', { name: '5' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-pressed', 'true'))
    expect(callsTo('PUT', '/vote')[0]).toMatchObject({ url: '/api/sessions/abc/participants/p1/vote', body: { value: '5' } })

    fireEvent.click(screen.getByRole('button', { name: '5' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-pressed', 'false'))
    expect(callsTo('PUT', '/vote')[1].body).toEqual({ value: null })
  })

  it('shows a message when an action fails and stays usable', async () => {
    renderSessionPage()
    await findOwnSeat()
    override = ({ method }) =>
      method === 'PUT' ? Response.json({ error: 'Die Karten sind schon aufgedeckt.' }, { status: 409 }) : undefined

    fireEvent.click(screen.getByRole('button', { name: '8' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Die Karten sind schon aufgedeckt.')
    expect(screen.getByRole('button', { name: '8' })).toBeEnabled()
  })

  it('covers the cards of the others until they are revealed', async () => {
    state.participants = [participant('x', 'Ben', { hasVoted: true }), participant('y', 'Cleo')]
    renderSessionPage()
    await findOwnSeat()

    const ben = screen.getByText('Ben').closest('li') as HTMLElement
    const cleo = screen.getByText('Cleo').closest('li') as HTMLElement
    expect(ben).toHaveTextContent('hat gewählt')
    expect(cleo).toHaveTextContent('wählt noch')
    expect(screen.getByText('1 von 3 haben gewählt')).toBeInTheDocument()

    // Reveal: the server now sends the values
    state.participants[0].vote = '8'
    fireEvent.click(screen.getByRole('button', { name: 'Karten aufdecken' }))

    await waitFor(() => expect(ben).toHaveTextContent('Karte 8'))
    expect(cleo).toHaveTextContent('hat nicht gewählt')
    // After the reveal the hand cards cannot be clicked anymore
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled()
  })

  it('shows the average and highlights a consensus', async () => {
    state.participants = [
      participant('x', 'Ben', { hasVoted: true, vote: '5' }),
      participant('y', 'Cleo', { hasVoted: true, vote: '5' }),
    ]
    state.revealed = true
    renderSessionPage()
    await findOwnSeat()

    expect(screen.getByText('Durchschnitt').nextElementSibling).toHaveTextContent('5')
    expect(screen.getByText('Stimmen').nextElementSibling).toHaveTextContent('2')
    expect(screen.getByText(/Konsens! Alle haben 5 gewählt/)).toHaveClass('round-result__consensus')
  })

  it('leaves out "?" and "☕" from the average and shows no consensus for different votes', async () => {
    state.participants = [
      participant('x', 'Ben', { hasVoted: true, vote: '3' }),
      participant('y', 'Cleo', { hasVoted: true, vote: '8' }),
      participant('z', 'Dan', { hasVoted: true, vote: '?' }),
    ]
    state.revealed = true
    renderSessionPage()
    await findOwnSeat()

    expect(screen.getByText('Durchschnitt').nextElementSibling).toHaveTextContent('5.5')
    expect(screen.getByText(/1 Stimme mit «\?» oder «☕» zählen nicht/)).toBeInTheDocument()
    expect(screen.queryByText(/Konsens/)).not.toBeInTheDocument()
  })

  it('changes the deck for everybody', async () => {
    renderSessionPage()
    await findOwnSeat()
    expect(screen.getByRole('button', { name: 'Fibonacci' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'T-Shirt' }))

    expect(await screen.findByRole('button', { name: 'XL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'T-Shirt' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: '13' })).not.toBeInTheDocument()
    expect(callsTo('PUT', '/deck')[0].body).toEqual({ deck: 'tshirt' })
  })

  it('leaves the session and navigates home with the leave button', async () => {
    renderSessionPage()
    await findOwnSeat()

    fireEvent.click(screen.getByRole('button', { name: 'Verlassen' }))

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(callsTo('DELETE', '/participants/p1')).toHaveLength(1)
  })

  it('offers to join again after the server removed us', async () => {
    renderSessionPage()
    await findOwnSeat()

    // Timeout on the server: we are no longer in the list
    state.participants = []

    const rejoin = await screen.findByRole('button', { name: 'Wieder beitreten' }, { timeout: 3000 })
    fireEvent.click(rejoin)

    expect(await findOwnSeat()).toHaveTextContent('Anna')
    expect(callsTo('POST', '/participants')).toHaveLength(2)
  })

  it('keeps the table visible when the server cannot be reached', async () => {
    renderSessionPage()
    await findOwnSeat()

    override = ({ method }) => (method === 'GET' ? new Response('', { status: 502 }) : undefined)

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent('Server nicht erreichbar.')
    expect(screen.getByRole('region', { name: 'Pokertisch' })).toBeInTheDocument()
  })

  it('copies the link and shows "Kopiert!"', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    renderSessionPage()
    await findOwnSeat()

    fireEvent.click(screen.getByRole('button', { name: 'Link kopieren' }))

    expect(await screen.findByRole('button', { name: 'Kopiert!' })).toBeInTheDocument()
    // jsdom's address; MemoryRouter does not change window.location
    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/')
  })
})
