// Meldung für eine unbekannte oder gelöschte Session. Benutzt von SessionPage (Beitreten
// schlägt fehl) und PokerRoom (Session während des Pollings gelöscht): gleicher Fehlerzustand.
import { Link } from 'react-router-dom'

export default function SessionNotFound() {
  return (
    <div className="session-not-found" role="alert">
      <h2>Diese Session existiert nicht (mehr)</h2>
      <p>Vielleicht wurde sie gelöscht oder der Link ist falsch.</p>
      <Link to="/">Zurück zur Übersicht</Link>
    </div>
  )
}
