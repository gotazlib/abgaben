import { useState, type FormEvent } from 'react'
import { MAX_NAME_LENGTH } from '@scrum-poker/shared'
import { useUser } from '../context/useUser'
import { validateName } from '../utils/validateName'
import './SessionNameForm.css'

// Shown when someone opens a shared link without a name in the context.
// Saving the name in the context is enough: SessionPage then joins by itself.
export default function SessionNameForm() {
  const { setName } = useUser()
  const [draft, setDraft] = useState('')
  // Same rules and message as on the home page
  const error = validateName(draft)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
