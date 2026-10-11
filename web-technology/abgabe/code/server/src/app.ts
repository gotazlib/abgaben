// The Express app without app.listen(), so that the tests can use it directly.

import express, { type NextFunction, type Request, type Response } from 'express'
import { CLIENT_DIST, SERVE_CLIENT } from './config'
import { sessionsRouter } from './routes/sessions'
import { sendError } from './sendError'

export const app = express()

// No CORS needed: in development the Vite dev server forwards /api to this
// server (proxy), in production this server delivers the client itself. Either
// way the browser only ever talks to one origin.

app.use(express.json())

app.use('/api/sessions', sessionsRouter)

// Production only (see config.ts): deliver the built client as static files.
if (SERVE_CLIENT) {
  app.use(express.static(CLIENT_DIST))
  // SPA fallback: React Router decides about paths like /sessions/<id>, so a
  // direct call or a reload gets index.html. /api keeps its JSON 404 below.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/')) {
      next()
      return
    }
    res.sendFile('index.html', { root: CLIENT_DIST })
  })
}

// Unknown routes answer with JSON as well, not with Express' HTML page
app.use((_req, res) => {
  sendError(res, 404, 'Route nicht gefunden.')
})

// Central error handler: Express recognises it by its four parameters
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // express.json() throws a SyntaxError when the body is not valid JSON
  if (err instanceof SyntaxError) {
    sendError(res, 400, 'Ungültiges JSON im Request-Body.')
    return
  }
  console.error(err)
  // Never send the stack trace to the client
  sendError(res, 500, 'Interner Serverfehler.')
})
