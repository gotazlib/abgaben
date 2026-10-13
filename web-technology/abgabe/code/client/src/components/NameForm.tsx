// Eingabefeld für den Namen auf der Startseite. Benutzt von HomePage.
// Der Name selbst liegt im Context; die Komponente bekommt ihn und die Fehlermeldung als Props
// und meldet jede Änderung über onNameChange nach oben (Lifting State Up).

import { MAX_NAME_LENGTH } from '@scrum-poker/shared'
import type { FormEvent } from 'react'

interface NameFormProps {
  name: string
  // Meldung unter dem Feld, null wenn der Name gültig ist
  error: string | null
  onNameChange: (name: string) => void
}

export default function NameForm({ name, error, onNameChange }: NameFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Der Name ist bei jedem Tastendruck schon gespeichert. Enter darf nur die Seite nicht neu laden.
    event.preventDefault()
  }

  return (
    <form className="name-form" onSubmit={handleSubmit}>
      <label htmlFor="name-input" className="name-form__label">
        Dein Name
      </label>
      <input
        id="name-input"
        className="name-form__input"
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="nickname"
        placeholder="z. B. Anna"
        aria-invalid={error !== null}
        aria-describedby={error === null ? undefined : 'name-error'}
      />
      {error !== null && (
        <p id="name-error" className="name-form__error">
          {error}
        </p>
      )}
    </form>
  )
}
