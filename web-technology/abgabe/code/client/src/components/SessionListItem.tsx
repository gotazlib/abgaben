// Ein Eintrag in der Liste der offenen Sessions auf der Startseite. Benutzt von HomePage.
// Zeigt ID und Anzahl Personen und hat die Buttons «Beitreten» und «Löschen».

import type { SessionSummary } from '../types/poker.ts'
import { useState } from 'react'
import { deleteSession, getErrorMessage } from '../api/sessions.ts'
import { ErrorMessage } from './ErrorMessage.tsx'
import './SessionListItem.css'

type Props = {
  session: SessionSummary
  // false, solange der Name ungültig ist
  canJoin: boolean
  onJoin: (sessionId: string) => void
  // Wird aufgerufen, nachdem der Server die Session gelöscht hat
  onDeleted: (sessionId: string) => void
}

export function SessionListItem({
  session,
  canJoin,
  onJoin,
  onDeleted,
}: Props) {
  // Eigener State pro Eintrag: Es kann immer nur dieser eine Eintrag gerade gelöscht werden
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  let participantLabel = session.participantCount + ' Personen'
  if (session.participantCount === 1) {
    participantLabel = '1 Person'
  }

  async function handleDelete() {
    if (
      !window.confirm(
        'Session ' +
          session.id +
          ' (' +
          participantLabel +
          ') wirklich löschen?',
      )
    ) {
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
        <span className="session-item__title">Session {session.id}</span>
        <span className="session-item__meta">{participantLabel}</span>
      </div>
      <div className="session-item__actions">
        <button
          type="button"
          className="button"
          disabled={!canJoin || isDeleting}
          onClick={() => onJoin(session.id)}
        >
          Beitreten
        </button>
        <button
          type="button"
          className="button button--danger"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? 'Wird gelöscht …' : 'Löschen'}
        </button>
      </div>
      {deleteError !== null && <ErrorMessage message={deleteError} />}
    </li>
  )
}
