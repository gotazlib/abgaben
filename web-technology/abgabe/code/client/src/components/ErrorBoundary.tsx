// Fängt Fehler ab, die beim Rendern einer Seite passieren, und zeigt dann eine Meldung
// statt einer weissen Seite. Benutzt von App.tsx um alle Seiten herum.
// Die einzige Klasse in der App: React bietet Error Boundaries nur als Klasse an.

import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  // React ruft diese Funktion auf, wenn ein Kind beim Rendern einen Fehler wirft
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert">
          <h1>Etwas ist schiefgelaufen</h1>
          <p>Bitte lade die Seite neu.</p>
          {/* reloadDocument lädt die ganze App neu, damit ist auch der Fehlerzustand weg */}
          <Link to="/" reloadDocument>
            Zurück zur Übersicht
          </Link>
        </section>
      )
    }
    return this.props.children
  }
}
