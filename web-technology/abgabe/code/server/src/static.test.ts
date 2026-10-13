// Tests für die Auslieferung des gebauten Clients im Produktivbetrieb (app.ts, SERVE_CLIENT).

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { app as App } from './app'

// Produktivbetrieb: Der Server liefert auch den gebauten Client aus. Ein kleines,
// falsches client/dist in einem temporären Ordner ersetzt den echten Vite-Build.
describe('production: built client', () => {
  let dist: string
  let app: typeof App

  beforeAll(async () => {
    dist = mkdtempSync(join(tmpdir(), 'scrum-poker-dist-'))
    writeFileSync(join(dist, 'index.html'), '<div id="root"></div>')
    writeFileSync(join(dist, 'app.js'), 'console.log("app")')
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CLIENT_DIST', dist)
    // config.ts liest die Umgebung beim Import, darum die App neu laden
    vi.resetModules()
    app = (await import('./app')).app
  })

  afterAll(() => {
    vi.unstubAllEnvs()
    rmSync(dist, { recursive: true, force: true })
  })

  it('delivers index.html at /', async () => {
    const res = await request(app).get('/').expect(200)
    expect(res.type).toBe('text/html')
    expect(res.text).toContain('<div id="root">')
  })

  it('delivers static files', async () => {
    const res = await request(app).get('/app.js').expect(200)
    expect(res.text).toContain('console.log')
  })

  it('answers client routes like /sessions/<id> with index.html (reload)', async () => {
    const res = await request(app).get('/sessions/abc123').expect(200)
    expect(res.text).toContain('<div id="root">')
  })

  it('keeps the API working', async () => {
    const res = await request(app).get('/api/sessions').expect(200)
    expect(res.body).toBeInstanceOf(Array)
  })

  it('answers unknown API routes with JSON 404, not with index.html', async () => {
    const res = await request(app).get('/api/unknown').expect(404)
    expect(res.body).toEqual({ error: 'Route nicht gefunden.' })
  })
})

describe('development: API only', () => {
  it('does not deliver the client without NODE_ENV=production', async () => {
    vi.resetModules()
    const { app } = await import('./app')
    await request(app).get('/sessions/abc123').expect(404)
  })
})
