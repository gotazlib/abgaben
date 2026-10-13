// Gerüst jeder Seite: Kopfzeile mit Link zur Startseite und darunter die Seite,
// die zur aktuellen URL passt. Benutzt von main.tsx.

import { Link, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SessionPage from './pages/SessionPage'

export default function App() {
  return (
    // Zeigt eine Meldung statt einer weissen Seite, falls beim Rendern ein Fehler passiert
    <ErrorBoundary>
      <header className="app-header">
        <Link to="/" className="app-title">
          Scrum Poker
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sessions/:sessionId" element={<SessionPage />} />
          {/* Alle anderen Adressen */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </ErrorBoundary>
  )
}
