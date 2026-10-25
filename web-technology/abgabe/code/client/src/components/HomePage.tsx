// Startseite: Namen eingeben, neue Session erstellen und die Liste der offenen Sessions
// anzeigen. Die Liste wird alle 3 Sekunden neu vom Server geladen (Polling). Benutzt von App.tsx.

import { useContext, useEffect, useState } from 'react'
import { validateName } from '../utils/poker.ts'
import type { SessionSummary } from '../types/poker.ts'
import {
  createSession,
  getErrorMessage,
  listSessions,
} from '../api/sessions.ts'
import { ErrorMessage } from './ErrorMessage.tsx'
import { LoadingIndicator } from './LoadingIndicator.tsx'
import { NameForm } from './NameForm.tsx'
import { SessionListItem } from './SessionListItem.tsx'
import { UserContext } from '../context/UserContext.ts'
import './HomePage.css'

// So oft wird die Liste der offenen Sessions neu geladen
const SESSION_LIST_POLL_INTERVAL_MS = 3000

type Props = {
  // Wechselt zum Pokertisch dieser Session (setzt den State in App)
  onJoin: (sessionId: string) => void
}

export function HomePage({ onJoin }: Props) {
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
    const intervalId = window.setInterval(
      loadSessions,
      SESSION_LIST_POLL_INTERVAL_MS,
    )

    // Cleanup beim Verlassen der Seite: sonst würde das Polling im Hintergrund weiterlaufen
    return () => {
      ignore = true
      window.clearInterval(intervalId)
    }
  }, [])

  async function handleCreate() {
    setIsCreating(true)
    setCreateError(null)
    try {
      const sessionId = await createSession()
      // isCreating bleibt true: Die Seite wechselt sowieso zum Pokertisch
      onJoin(sessionId)
    } catch (error) {
      setCreateError(
        'Session konnte nicht erstellt werden. ' + getErrorMessage(error),
      )
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
      return currentSessions.filter(
        (session) => session.id !== deletedSessionId,
      )
    })
  }

  return (
    <div className="home-page">
      <div className="home-page__intro">
        <h1>Gemeinsam schätzen</h1>
        <p>
          Gib deinen Namen ein, erstelle eine neue Session oder tritt einer
          offenen Session bei.
        </p>
      </div>

      <div className="home-page__columns">
        <section className="home-page__card">
          <h2>Loslegen</h2>
          <NameForm name={name} error={nameError} onNameChange={setName} />
          <button
            type="button"
            className="button home-page__create"
            disabled={!isNameValid || isCreating}
            onClick={handleCreate}
          >
            {isCreating ? 'Wird erstellt …' : 'Neue Session erstellen'}
          </button>
          {createError !== null && <ErrorMessage message={createError} />}
        </section>

        <section className="home-page__card">
          <h2>Offene Sessions</h2>

          {listError !== null && (
            <ErrorMessage
              message={listError + ' Neuer Versuch läuft automatisch.'}
            />
          )}

          {isLoading && <LoadingIndicator label="Sessions werden geladen …" />}

          {sessions !== null && sessions.length === 0 && (
            <p className="home-page__empty">
              Noch keine offenen Sessions. Erstelle die erste!
            </p>
          )}

          {sessions !== null && sessions.length > 0 && !isNameValid && (
            <p className="home-page__hint">
              Gib zuerst deinen Namen ein, um beizutreten.
            </p>
          )}

          {sessions !== null && sessions.length > 0 && (
            <ul className="home-page__sessions">
              {sessions.map((session) => (
                <SessionListItem
                  key={session.id}
                  session={session}
                  canJoin={isNameValid}
                  onJoin={onJoin}
                  onDeleted={handleDeleted}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
