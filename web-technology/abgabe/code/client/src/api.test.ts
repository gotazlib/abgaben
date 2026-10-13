// Tests für api.ts: richtige Anfragen an den Server und verständliche Fehlermeldungen.
// fetch wird dafür durch eine Testfunktion ersetzt (vi.stubGlobal).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { castVote, deleteSession, getSession, joinSession } from './api'

function mockFetch(answer: () => Promise<Response>) {
  const fetchMock = vi.fn(answer)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api', () => {
  it('sends JSON to the right URL and returns the parsed answer', async () => {
    const state = { id: 'abc', deck: 'fibonacci', revealed: false, participants: [] }
    const fetchMock = mockFetch(() => Promise.resolve(Response.json(state)))

    expect(await castVote('abc', 'p1', '5')).toEqual(state)
    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/abc/participants/p1/vote', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{"value":"5"}',
    })
  })

  it('sends the saved participantId when joining again after a reload', async () => {
    const fetchMock = mockFetch(() => Promise.resolve(Response.json({ participantId: 'p1' })))

    expect(await joinSession('abc', 'Anna', 'p1')).toBe('p1')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/abc/participants',
      expect.objectContaining({ method: 'POST', body: '{"name":"Anna","participantId":"p1"}' }),
    )
  })

  it('returns null if the session does not exist', async () => {
    mockFetch(() => Promise.resolve(Response.json({ error: 'Session nicht gefunden.' }, { status: 404 })))

    expect(await getSession('nope', 'p1')).toBeNull()
    expect(await joinSession('nope', 'Anna', null)).toBeNull()
  })

  it('treats a 404 when deleting as success, because the session is gone anyway', async () => {
    mockFetch(() => Promise.resolve(Response.json({ error: 'Session nicht gefunden.' }, { status: 404 })))
    await expect(deleteSession('abc')).resolves.toBeUndefined()
  })

  it('throws an error with the message from the server', async () => {
    mockFetch(() => Promise.resolve(Response.json({ error: 'Ungültige Karte.' }, { status: 400 })))
    await expect(castVote('abc', 'p1', '99')).rejects.toThrow('Ungültige Karte.')
  })

  it('reports a network error as "Server nicht erreichbar."', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    await expect(getSession('abc', 'p1')).rejects.toThrow('Server nicht erreichbar.')
  })

  it('reports a 502 from the dev proxy as "Server nicht erreichbar."', async () => {
    mockFetch(() => Promise.resolve(new Response('', { status: 502 })))
    await expect(getSession('abc', 'p1')).rejects.toThrow('Server nicht erreichbar.')
  })
})
