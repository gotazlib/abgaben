import type { SessionSummary } from '@scrum-poker/shared'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, deleteSession } from '../api/client'
import ErrorMessage from './ErrorMessage'
import './SessionListItem.css'

interface SessionListItemProps {
  session: SessionSummary
  canJoin: boolean
  // Called after the session was deleted on the server
  onDeleted: () => void
}

export default function SessionListItem({ session, canJoin, onDeleted }: SessionListItemProps) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const participantLabel = session.participantCount === 1 ? '1 Person' : `${session.participantCount} Personen`
  const createdAt = new Date(session.createdAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
  // Lets screen readers tell the many "Beitreten" and "Löschen" buttons apart
  const titleId = `session-${session.id}`

  async function handleDelete() {
    if (!window.confirm(`Session ${session.id} (${participantLabel}) wirklich löschen?`)) {
      return
    }
    setIsDeleting(true)
    setError(null)
    try {
      await deleteSession(session.id)
      // No setIsDeleting(false): the entry stays disabled until the refreshed list no longer contains it
      onDeleted()
    } catch (err) {
      // 404: someone else deleted it in the meantime, so the goal is reached anyway
      if (err instanceof ApiError && err.status === 404) {
        onDeleted()
        return
      }
      setError(`Löschen fehlgeschlagen. ${err instanceof Error ? err.message : ''}`)
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
          className="session-item__join"
          disabled={!canJoin || isDeleting}
          aria-describedby={titleId}
          onClick={() => navigate(`/sessions/${session.id}`)}
        >
          Beitreten
        </button>
        <button
          type="button"
          className="session-item__delete"
          disabled={isDeleting}
          aria-describedby={titleId}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? 'Wird gelöscht…' : 'Löschen'}
        </button>
      </div>
      {error !== null && <ErrorMessage message={error} />}
    </li>
  )
}
