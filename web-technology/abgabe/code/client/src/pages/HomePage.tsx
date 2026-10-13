// Startseite (Route "/"): Namen eingeben, neue Session erstellen und die Liste der offenen
// Sessions anzeigen. Die Liste wird alle 3 Sekunden neu vom Server geladen (Polling).

import { validateName, type SessionSummary } from '@scrum-poker/shared'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, getErrorMessage, listSessions } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import LoadingIndicator from '../components/LoadingIndicator'
import NameForm from '../components/NameForm'
import SessionListItem from '../components/SessionListItem'
import { UserContext } from '../UserContext'
import './HomePage.css'

// So oft wird die Liste der offenen Sessions neu geladen
const SESSION_LIST_POLL_INTERVAL_MS = 3000

export default function HomePage() {
  const navigate = useNavigate()

  // Der Name steht nur im Context. Ob er gültig ist, berechnen wir bei jedem Render neu,
  // so kann diese Information nie veralten.
  const { name, setName } = useContext(UserContext)
  const nameError = validateName(name)
  const isNameValid = nameError === null

  // null = noch keine Antwort vom Server
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Wir laden, bis die erste Antwort da ist (eine Liste oder ein Fehler)
  const isLoading = sessions === null && listError === null

  // Polling: Liste sofort laden und danach alle 3 Sekunden wieder
  useEffect(() => {
    // Wird im Cleanup auf true gesetzt. Eine Antwort, die erst danach ankommt, ignorieren wir.
    let ignore = false

    async function loadSessions() {
      try {
        const loadedSessions = await listSessions()
        if (!ignore) {
          setSessions(loadedSessions)
          setListError(null)
        }
      } catch (error) {
        // Die alte Liste bleibt sichtbar, darüber erscheint die Fehlermeldung
        if (!ignore) {
          setListError(getErrorMessage(error))
        }
      }
    }

    loadSessions()
    const intervalId = setInterval(loadSessions, SESSION_LIST_POLL_INTERVAL_MS)

    // Cleanup beim Verlassen der Seite: sonst würde das Polling im Hintergrund weiterlaufen
    return () => {
      ignore = true
      clearInterval(intervalId)
    }
  }, [])

  async function handleCreate() {
    setIsCreating(true)
    setCreateError(null)
    try {
      const sessionId = await createSession()
      // isCreating bleibt true: Die Seite wechselt sowieso zum Pokertisch
      navigate('/sessions/' + sessionId)
    } catch (error) {
      setCreateError('Session konnte nicht erstellt werden. ' + getErrorMessage(error))
      setIsCreating(false)
    }
  }

  // Wird von SessionListItem aufgerufen, nachdem der Server die Session gelöscht hat.
  // Wir entfernen sie sofort aus der Liste, der nächste Poll bestätigt das.
  function handleDeleted(deletedSessionId: string) {
    // Mit einer Funktion bekommen wir die neuste Liste, auch wenn inzwischen ein Poll angekommen ist
    setSessions((currentSessions) => {
      if (currentSessions === null) {
        return null
      }
      // filter() erzeugt eine neue Liste, der alte State wird nicht verändert
      return currentSessions.filter((session) => session.id !== deletedSessionId)
    })
  }

  // Neueste Session zuerst. Zuerst kopieren, weil sort() das Array selbst verändert
  // und State nie direkt verändert werden darf. ISO-Datumstexte lassen sich als Text sortieren.
  let sortedSessions: SessionSummary[] = []
  if (sessions !== null) {
    sortedSessions = [...sessions]
    sortedSessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  return (
    <div className="home-page">
      <div className="home-page__intro">
        <h1>Gemeinsam schätzen</h1>
        <p>Gib deinen Namen ein, erstelle eine neue Session oder tritt einer offenen Session bei.</p>
      </div>

      <div className="home-page__columns">
        <section className="home-page__card" aria-labelledby="start-heading">
          <h2 id="start-heading">Loslegen</h2>
          <NameForm name={name} error={nameError} onNameChange={setName} />
          <button
            type="button"
            className="button home-page__create"
            disabled={!isNameValid || isCreating}
            onClick={handleCreate}
          >
            {isCreating ? 'Wird erstellt…' : 'Neue Session erstellen'}
          </button>
          {createError !== null && <ErrorMessage message={createError} />}
        </section>

        <section className="home-page__card" aria-labelledby="sessions-heading">
          <h2 id="sessions-heading">Offene Sessions</h2>

          {listError !== null && <ErrorMessage message={listError + ' Neuer Versuch läuft automatisch.'} />}

          {isLoading && <LoadingIndicator label="Sessions werden geladen…" />}

          {sessions !== null && sessions.length === 0 && (
            <p className="home-page__empty">Noch keine offenen Sessions. Erstelle die erste!</p>
          )}

          {sortedSessions.length > 0 && !isNameValid && (
            <p className="home-page__hint">Gib zuerst deinen Namen ein, um beizutreten.</p>
          )}

          {sortedSessions.length > 0 && (
            <ul className="session-list">
              {sortedSessions.map((session) => (
                <SessionListItem key={session.id} session={session} canJoin={isNameValid} onDeleted={handleDeleted} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
