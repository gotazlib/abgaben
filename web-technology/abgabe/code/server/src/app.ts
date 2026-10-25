// Die Express-App: JSON lesen, Routen einbinden, Fehler immer als JSON beantworten.
// Ohne app.listen(): das macht index.ts. So bleibt diese Datei reine Konfiguration.

import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import { CLIENT_DIST, SERVE_CLIENT } from './config.ts'
import { sessionsRouter } from './routes/sessions.ts'

export const app = express()

// Kein CORS nötig: Beim Entwickeln leitet der Vite-Dev-Server /api an diesen Server weiter
// (Proxy), im Produktivbetrieb liefert dieser Server den Client selbst aus. Der Browser
// spricht also immer nur mit einer Adresse.

// Liest JSON-Bodies, danach steht der Body in req.body
app.use(express.json())

app.use('/api/sessions', sessionsRouter)

// Nur im Produktivbetrieb (siehe config.ts): den gebauten Client als Dateien ausliefern
if (SERVE_CLIENT) {
  app.use(express.static(CLIENT_DIST))
}

// Unbekannte Routen bekommen auch JSON, nicht die HTML-Seite von Express
app.use((_req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden.' })
})

// Fehler-Handler: Express erkennt ihn an den vier Parametern (darum auch _next)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // express.json() wirft einen SyntaxError, wenn der Body kein gültiges JSON ist
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'Ungültiges JSON im Request-Body.' })
    return
  }
  console.error(err)
  // Nie den Stacktrace an den Client schicken
  res.status(500).json({ error: 'Interner Serverfehler.' })
})
