// Ein Eintrag in der Liste der offenen Sessions auf der Startseite. Benutzt von HomePage.
// Zeigt ID, Anzahl Personen und Erstellzeit und hat die Buttons «Beitreten» und «Löschen».

import type { SessionSummary } from '@scrum-poker/shared'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteSession, getErrorMessage } from '../api'
import ErrorMessage from './ErrorMessage'

interface SessionListItemProps {
  session: SessionSummary
  // false, solange der Name ungültig ist
  canJoin: boolean
  // Wird aufgerufen, nachdem der Server die Session gelöscht hat
  onDeleted: (sessionId: string) => void
}

export default function SessionListItem({ session, canJoin, onDeleted }: SessionListItemProps) {
  const navigate = useNavigate()
  // Eigener State pro Eintrag: Es kann immer nur dieser eine Eintrag gerade gelöscht werden
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  let participantLabel = session.participantCount + ' Personen'
  if (session.participantCount === 1) {
    participantLabel = '1 Person'
  }
  const createdAt = new Date(session.createdAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
  // Damit Screenreader die vielen Buttons «Beitreten» und «Löschen» unterscheiden können
  const titleId = 'session-' + session.id

  async function handleDelete() {
    if (!window.confirm('Session ' + session.id + ' (' + participantLabel + ') wirklich löschen?')) {
      return
    }
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteSession(session.id)
      // Kein setIsDeleting(false): Der Eintrag verschwindet jetzt aus der Liste
      onDeleted(session.id)
    } catch (error) {
      setDeleteError('Löschen fehlgeschlagen. ' + getErrorMessage(error))
      setIsDeleting(false)
    }
  }

  return (
    <li className="session-item">
      <div className="session-item__info">
        <span id={titleId} className="session-item__title">
          Session {session.id}
        </span>
        <span className="session-item__meta">
          {participantLabel} · erstellt <time dateTime={session.createdAt}>{createdAt}</time>
        </span>
      </div>
      <div className="session-item__actions">
        <button
          type="button"
          className="button"
          disabled={!canJoin || isDeleting}
          aria-describedby={titleId}
          onClick={() => navigate('/sessions/' + session.id)}
        >
          Beitreten
        </button>
        <button
          type="button"
          className="button button--danger"
          disabled={isDeleting}
          aria-describedby={titleId}
          onClick={handleDelete}
        >
          {isDeleting ? 'Wird gelöscht…' : 'Löschen'}
        </button>
      </div>
      {deleteError !== null && <ErrorMessage message={deleteError} />}
    </li>
  )
}
