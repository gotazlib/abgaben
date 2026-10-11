// The Express app without app.listen(), so that the tests can use it directly.

import express, { type NextFunction, type Request, type Response } from 'express'
import { sessionsRouter } from './routes/sessions'
import { sendError } from './sendError'

export const app = express()

// No CORS needed: in development the Vite dev server forwards /api to this
// server (proxy), so the browser only ever talks to one origin.

app.use(express.json())

app.use('/api/sessions', sessionsRouter)

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
