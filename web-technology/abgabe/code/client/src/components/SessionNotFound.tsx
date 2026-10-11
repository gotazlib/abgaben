import { Link } from 'react-router-dom'
import './SessionNotFound.css'

export default function SessionNotFound() {
  return (
    <div className="session-not-found" role="alert">
      <h2>Diese Session existiert nicht (mehr)</h2>
      <p>Vielleicht wurde sie gelöscht oder der Link ist falsch.</p>
      <Link to="/">Zurück zur Übersicht</Link>
    </div>
  )
}
