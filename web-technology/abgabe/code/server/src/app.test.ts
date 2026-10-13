// Tests für die REST-API: schicken echte HTTP-Requests an die App (mit supertest),
// ohne dass ein Server-Port geöffnet wird.

import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  CreateSessionResponse,
  JoinSessionResponse,
  SessionState,
  SessionSummary,
} from '@scrum-poker/shared'
import { app } from './app'
import { PARTICIPANT_TIMEOUT_MS } from './config'
import { clearSessions, removeInactiveParticipants } from './store'

// Kleine Hilfsfunktionen, damit sich die Tests wie der Ablauf in der App lesen

async function createSession(): Promise<string> {
  const res = await request(app).post('/api/sessions').expect(201)
  return (res.body as CreateSessionResponse).id
}

async function join(sessionId: string, name: string): Promise<string> {
  const res = await request(app)
    .post(`/api/sessions/${sessionId}/participants`)
    .send({ name })
    .expect(201)
  return (res.body as JoinSessionResponse).participantId
}

async function getState(sessionId: string, participantId?: string): Promise<SessionState> {
  const res = await request(app)
    .get(`/api/sessions/${sessionId}`)
    .query(participantId ? { participantId } : {})
    .expect(200)
  return res.body as SessionState
}

function vote(sessionId: string, participantId: string, value: string | null) {
  return request(app)
    .put(`/api/sessions/${sessionId}/participants/${participantId}/vote`)
    .send({ value })
}

beforeEach(() => {
  clearSessions()
})

describe('sessions', () => {
  it('creates, lists and deletes a session', async () => {
    const id = await createSession()
    expect(id).toMatch(/^[0-9a-f]{6}$/)

    const list = await request(app).get('/api/sessions').expect(200)
    const summaries = list.body as SessionSummary[]
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toMatchObject({ id, participantCount: 0 })
    expect(new Date(summaries[0].createdAt).getTime()).not.toBeNaN()

    await request(app).delete(`/api/sessions/${id}`).expect(204)
    await request(app).get(`/api/sessions/${id}`).expect(404)
  })

  it('starts with the Fibonacci deck and no participants', async () => {
    const id = await createSession()
    expect(await getState(id)).toEqual({
      id,
      deck: 'fibonacci',
      revealed: false,
      participants: [],
    })
  })

  it('deletes a session even if participants are in it', async () => {
    const id = await createSession()
    await join(id, 'Anna')
    await request(app).delete(`/api/sessions/${id}`).expect(204)
  })

  it('answers 404 with a JSON error for unknown sessions on every route', async () => {
    const responses = await Promise.all([
      request(app).get('/api/sessions/nope'),
      request(app).delete('/api/sessions/nope'),
      request(app).post('/api/sessions/nope/participants').send({ name: 'Anna' }),
      request(app).delete('/api/sessions/nope/participants/p1'),
      request(app).put('/api/sessions/nope/participants/p1/vote').send({ value: '5' }),
      request(app).put('/api/sessions/nope/deck').send({ deck: 'tshirt' }),
      request(app).post('/api/sessions/nope/reveal'),
      request(app).post('/api/sessions/nope/reset'),
    ])
    for (const res of responses) {
      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: 'Session nicht gefunden.' })
    }
  })

  it('answers 404 with JSON for unknown routes', async () => {
    const res = await request(app).get('/api/unknown').expect(404)
    expect(res.body).toHaveProperty('error')
  })

  it('answers 400 with JSON for invalid JSON', async () => {
    const id = await createSession()
    const res = await request(app)
      .post(`/api/sessions/${id}/participants`)
      .set('Content-Type', 'application/json')
      .send('{ not json')
      .expect(400)
    expect(res.body).toHaveProperty('error')
  })
})

describe('participants', () => {
  it('joins with a trimmed name', async () => {
    const id = await createSession()
    const participantId = await join(id, '  Anna  ')

    const state = await getState(id)
    expect(state.participants).toEqual([
      { id: participantId, name: 'Anna', hasVoted: false, vote: null },
    ])
  })

  it.each([
    ['an empty name', { name: '' }],
    ['a name with only spaces', { name: '   ' }],
    ['a name that is too long', { name: 'x'.repeat(31) }],
    ['a missing name', {}],
    ['a name that is not a string', { name: 42 }],
    ['a participantId that is not a string', { name: 'Anna', participantId: 42 }],
  ])('rejects %s with 400', async (_label, body) => {
    const id = await createSession()
    const res = await request(app).post(`/api/sessions/${id}/participants`).send(body).expect(400)
    expect(res.body).toHaveProperty('error')
  })

  it('accepts a name with exactly 30 characters', async () => {
    const id = await createSession()
    await join(id, 'x'.repeat(30))
  })

  it('leaves a session and is idempotent', async () => {
    const id = await createSession()
    const participantId = await join(id, 'Anna')

    await request(app).delete(`/api/sessions/${id}/participants/${participantId}`).expect(204)
    await request(app).delete(`/api/sessions/${id}/participants/${participantId}`).expect(204)
    expect((await getState(id)).participants).toEqual([])
  })

  it('continues as the same participant with a known participantId', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await join(id, 'Ben') // hält die Runde offen
    await vote(id, anna, '5').expect(200)

    // Reload: Der Client schickt die gespeicherte ID mit
    const res = await request(app)
      .post(`/api/sessions/${id}/participants`)
      .send({ name: 'Anna', participantId: anna })
      .expect(200)
    expect((res.body as JoinSessionResponse).participantId).toBe(anna)

    // Kein zweiter Eintrag, die Stimme ist noch da
    const state = await getState(id, anna)
    expect(state.participants).toHaveLength(2)
    expect(state.participants[0]).toMatchObject({ id: anna, hasVoted: true, vote: '5' })
  })

  it('joins anew with an unknown participantId', async () => {
    const id = await createSession()

    const res = await request(app)
      .post(`/api/sessions/${id}/participants`)
      .send({ name: 'Anna', participantId: 'gone' })
      .expect(201)
    const participantId = (res.body as JoinSessionResponse).participantId
    expect(participantId).not.toBe('gone')
    expect((await getState(id)).participants).toEqual([
      { id: participantId, name: 'Anna', hasVoted: false, vote: null },
    ])
  })

  it('still checks the name when continuing', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')

    await request(app)
      .post(`/api/sessions/${id}/participants`)
      .send({ name: '  ', participantId: anna })
      .expect(400)
  })

  it('answers 200 for an unknown participantId when polling', async () => {
    const id = await createSession()
    await join(id, 'Anna')

    const state = await getState(id, 'unknown')
    expect(state.participants).toHaveLength(1)
  })
})

describe('voting', () => {
  it('hides the votes until the cards are revealed', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    const ben = await join(id, 'Ben')

    await vote(id, anna, '5').expect(200)
    const state = await getState(id, ben)
    expect(state.revealed).toBe(false)
    expect(state.participants).toEqual([
      { id: anna, name: 'Anna', hasVoted: true, vote: null },
      { id: ben, name: 'Ben', hasVoted: false, vote: null },
    ])
    // Der geheime Wert darf nirgends in der Antwort stehen
    expect(JSON.stringify(state)).not.toContain('"5"')
    expect(JSON.stringify(await getState(id))).not.toContain('"5"')

    await request(app).post(`/api/sessions/${id}/reveal`).expect(200)
    const revealed = await getState(id)
    expect(revealed.revealed).toBe(true)
    expect(revealed.participants[0].vote).toBe('5')
    expect(revealed.participants[1]).toMatchObject({ hasVoted: false, vote: null })
  })

  it('shows a participant their own vote, but not the others, before the reveal', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    const ben = await join(id, 'Ben')
    await join(id, 'Cem') // hält die Runde offen, nichts wird automatisch aufgedeckt

    await vote(id, anna, '5').expect(200)
    const res = await vote(id, ben, '8').expect(200)

    // Die Antwort auf Bens Stimme enthält seine eigene Stimme, aber nicht die von Anna
    const afterVote = res.body as SessionState
    expect(afterVote.revealed).toBe(false)
    expect(afterVote.participants.map((participant) => participant.vote)).toEqual([
      null,
      '8',
      null,
    ])
    expect(JSON.stringify(afterVote)).not.toContain('"5"')

    // Anna sieht beim Polling nur ihre eigene Stimme
    const annaView = await getState(id, anna)
    expect(annaView.participants.map((participant) => participant.vote)).toEqual([
      '5',
      null,
      null,
    ])
    expect(JSON.stringify(annaView)).not.toContain('"8"')

    // Ohne participantId wird keine Stimme gezeigt
    const anonymous = await getState(id)
    expect(anonymous.participants.map((participant) => participant.vote)).toEqual([
      null,
      null,
      null,
    ])
  })

  it('reveals automatically when everybody has voted', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    const ben = await join(id, 'Ben')

    await vote(id, anna, '3').expect(200)
    const res = await vote(id, ben, '8').expect(200)

    const state = res.body as SessionState
    expect(state.revealed).toBe(true)
    expect(state.participants.map((participant) => participant.vote)).toEqual(['3', '8'])
  })

  it('reveals automatically when the last missing participant leaves', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    const ben = await join(id, 'Ben')
    await vote(id, anna, '3').expect(200)

    await request(app).delete(`/api/sessions/${id}/participants/${ben}`).expect(204)
    expect((await getState(id)).revealed).toBe(true)
  })

  it('takes a vote back with null', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await join(id, 'Ben')
    await vote(id, anna, '3').expect(200)

    const res = await vote(id, anna, null).expect(200)
    expect((res.body as SessionState).participants[0].hasVoted).toBe(false)
  })

  it('rejects a card that is not in the active deck with 400', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')

    await vote(id, anna, 'XL').expect(400)
    await vote(id, anna, '4').expect(400)
    await request(app)
      .put(`/api/sessions/${id}/participants/${anna}/vote`)
      .send({})
      .expect(400)
  })

  it('answers 404 for an unknown participant', async () => {
    const id = await createSession()
    await vote(id, 'unknown', '5').expect(404)
  })

  it('answers 409 when voting after the reveal', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await request(app).post(`/api/sessions/${id}/reveal`).expect(200)

    const res = await vote(id, anna, '5').expect(409)
    expect(res.body).toHaveProperty('error')
  })

  it('resets the round', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await vote(id, anna, '5').expect(200)

    const res = await request(app).post(`/api/sessions/${id}/reset`).expect(200)
    expect(res.body).toMatchObject({
      revealed: false,
      participants: [{ id: anna, hasVoted: false, vote: null }],
    })
  })
})

describe('deck', () => {
  it('changes the deck and resets the round', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await join(id, 'Ben')
    await vote(id, anna, '5').expect(200)

    const res = await request(app).put(`/api/sessions/${id}/deck`).send({ deck: 'tshirt' }).expect(200)
    const state = res.body as SessionState
    expect(state.deck).toBe('tshirt')
    expect(state.revealed).toBe(false)
    expect(state.participants.every((participant) => !participant.hasVoted)).toBe(true)

    // Karten des neuen Decks sind jetzt gültig
    await vote(id, anna, 'XL').expect(200)
  })

  it('keeps the votes when the same deck is chosen again', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await join(id, 'Ben')
    await vote(id, anna, '5').expect(200)

    const res = await request(app).put(`/api/sessions/${id}/deck`).send({ deck: 'fibonacci' }).expect(200)
    expect((res.body as SessionState).participants[0].hasVoted).toBe(true)
  })

  it.each([[{ deck: 'poker' }], [{ deck: 'toString' }], [{ deck: 42 }], [{}]])('rejects %j with 400', async (body) => {
    const id = await createSession()
    await request(app).put(`/api/sessions/${id}/deck`).send(body).expect(400)
  })
})

describe('heartbeat timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('removes participants who stopped polling', async () => {
    const id = await createSession()
    const anna = await join(id, 'Anna')
    await join(id, 'Ben')

    // Anna pollt weiter, Ben nicht
    vi.advanceTimersByTime(PARTICIPANT_TIMEOUT_MS - 1_000)
    await getState(id, anna)
    vi.advanceTimersByTime(2_000)
    removeInactiveParticipants()

    const state = await getState(id)
    expect(state.participants.map((participant) => participant.name)).toEqual(['Anna'])
  })

  it('keeps empty sessions', async () => {
    const id = await createSession()
    await join(id, 'Anna')

    vi.advanceTimersByTime(PARTICIPANT_TIMEOUT_MS + 1)
    removeInactiveParticipants()

    expect((await getState(id)).participants).toEqual([])
  })
})
