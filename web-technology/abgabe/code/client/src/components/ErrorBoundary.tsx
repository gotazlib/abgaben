import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// Catches errors thrown while rendering, so that the user sees a message
// instead of a white page. React offers this only for class components.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert">
          <h1>Etwas ist schiefgelaufen</h1>
          <p>Bitte lade die Seite neu.</p>
          {/* reloadDocument: loads the whole app again, which also resets this boundary */}
          <Link to="/" reloadDocument>
            Zurück zur Übersicht
          </Link>
        </section>
      )
    }
    return this.props.children
  }
}
