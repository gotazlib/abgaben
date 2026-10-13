// Fragt nach dem Namen, wenn jemand einen geteilten Link ohne gespeicherten Namen öffnet.
// Benutzt von SessionPage. Den Namen in den Context zu schreiben reicht: SessionPage
// sieht dann einen gültigen Namen und tritt von selbst bei.
import { useContext, useState, type FormEvent } from 'react'
import { MAX_NAME_LENGTH, validateName } from '@scrum-poker/shared'
import { UserContext } from '../UserContext'

export default function SessionNameForm() {
  const { setName } = useContext(UserContext)
  const [draft, setDraft] = useState('')
  // Gleiche Regel und gleiche Meldung wie auf der Home-Seite und auf dem Server
  const error = validateName(draft)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Sonst würde der Browser die Seite neu laden
    event.preventDefault()
    if (error === null) {
      setName(draft.trim())
    }
  }

  return (
    <form className="session-name-form" onSubmit={handleSubmit}>
      <h2>Wie heisst du?</h2>
      <p>Damit die anderen dich am Tisch sehen, brauchst du einen Namen.</p>
      <label htmlFor="session-name-input">Name</label>
      <div className="session-name-form__row">
        <input
          id="session-name-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : 'session-name-error'}
        />
        <button type="submit" className="button" disabled={error !== null}>
          Beitreten
        </button>
      </div>
      {error !== null && (
        <p id="session-name-error" className="session-name-form__error">
          {error}
        </p>
      )}
    </form>
  )
}
