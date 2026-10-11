import { listSessions } from '../api/client'
import CreateSessionButton from '../components/CreateSessionButton'
import ErrorMessage from '../components/ErrorMessage'
import LoadingIndicator from '../components/LoadingIndicator'
import NameForm from '../components/NameForm'
import SessionList from '../components/SessionList'
import { SESSION_LIST_POLL_INTERVAL_MS } from '../config'
import { useUser } from '../context/useUser'
import { usePolling } from '../hooks/usePolling'
import { validateName } from '../utils/validateName'
import './HomePage.css'

export default function HomePage() {
  // The name lives only in the context. Whether it is valid is derived from it
  // on every render, so it can never get out of sync.
  const { name, setName } = useUser()
  const nameError = validateName(name)
  const isNameValid = nameError === null

  // listSessions is a module function, so its identity never changes (no useCallback needed)
  const { data: sessions, error, isLoading, refresh } = usePolling(listSessions, SESSION_LIST_POLL_INTERVAL_MS)

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
          <CreateSessionButton disabled={!isNameValid} />
        </section>

        <section className="home-page__card" aria-labelledby="sessions-heading">
          <h2 id="sessions-heading">Offene Sessions</h2>

          {/* Shown together with older data: the list stays visible while the server is down */}
          {error !== null && (
            <ErrorMessage message={`${error.message} Neuer Versuch läuft automatisch.`} onRetry={refresh} />
          )}

          {isLoading && <LoadingIndicator label="Sessions werden geladen…" />}

          {sessions !== null && sessions.length === 0 && (
            <p className="home-page__empty">Noch keine offenen Sessions. Erstelle die erste!</p>
          )}

          {sessions !== null && sessions.length > 0 && (
            <>
              {!isNameValid && <p className="home-page__hint">Gib zuerst deinen Namen ein, um beizutreten.</p>}
              <SessionList sessions={sessions} canJoin={isNameValid} onDeleted={refresh} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
