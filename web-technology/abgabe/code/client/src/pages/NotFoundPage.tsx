// Seite für alle Adressen, die es nicht gibt (Route "*" in App.tsx).

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section>
      <h1>Seite nicht gefunden</h1>
      <p>Diese Adresse gibt es nicht.</p>
      <Link to="/">Zurück zur Übersicht</Link>
    </section>
  )
}
