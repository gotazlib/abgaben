import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, castVote, deleteSession, getSession } from './client'

function mockFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn(implementation)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('sends JSON to the right URL and returns the parsed answer', async () => {
    const state = { id: 'abc', deck: 'fibonacci', revealed: false, participants: [] }
    const fetchMock = mockFetch(() => Promise.resolve(Response.json(state)))

    await expect(castVote('abc', 'p 1', '5')).resolves.toEqual(state)

    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/abc/participants/p%201/vote', {
      method: 'PUT',
      signal: undefined,
      headers: { 'Content-Type': 'application/json' },
      body: '{"value":"5"}',
    })
  })

  it('handles 204 responses without a body', async () => {
    mockFetch(() => Promise.resolve(new Response(null, { status: 204 })))
    await expect(deleteSession('abc')).resolves.toBeUndefined()
  })

  it('throws an ApiError with the message from the server', async () => {
    mockFetch(() => Promise.resolve(Response.json({ error: 'Session nicht gefunden.' }, { status: 404 })))

    const error = await getSession('nope').catch((err: unknown) => err)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, message: 'Session nicht gefunden.' })
  })

  it('reports a network error as "Server nicht erreichbar."', async () => {
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    await expect(getSession('abc')).rejects.toMatchObject({ status: 0, message: 'Server nicht erreichbar.' })
  })

  it('reports a 502 from the dev proxy as "Server nicht erreichbar."', async () => {
    mockFetch(() => Promise.resolve(new Response('', { status: 502 })))
    await expect(getSession('abc')).rejects.toMatchObject({ status: 502, message: 'Server nicht erreichbar.' })
  })

  it('passes an abort on unchanged instead of turning it into an ApiError', async () => {
    const controller = new AbortController()
    controller.abort()
    mockFetch(() => Promise.reject(new DOMException('Aborted', 'AbortError')))

    const error = await getSession('abc', undefined, controller.signal).catch((err: unknown) => err)
    expect(error).not.toBeInstanceOf(ApiError)
  })
})
