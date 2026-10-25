// Eingabefeld für den Namen auf der Startseite. Benutzt von HomePage.
// Der Name selbst liegt im Context; die Komponente bekommt ihn und die Fehlermeldung als Props
// und meldet jede Änderung über onNameChange nach oben (Lifting State Up).

import { MAX_NAME_LENGTH } from '../utils/poker.ts'
import type { ChangeEvent } from 'react'
import './NameForm.css'

type Props = {
  name: string
  // Meldung unter dem Feld, null wenn der Name gültig ist
  error: string | null
  onNameChange: (name: string) => void
}

export function NameForm({ name, error, onNameChange }: Props) {
  function updateName(event: ChangeEvent<HTMLInputElement>) {
    onNameChange(event.target.value)
  }

  return (
    <div className="name-form">
      <label htmlFor="name-input" className="name-form__label">
        Dein Name
      </label>
      <input
        id="name-input"
        className={
          error === null
            ? 'name-form__input'
            : 'name-form__input name-form__input--invalid'
        }
        type="text"
        value={name}
        onChange={updateName}
        maxLength={MAX_NAME_LENGTH}
        placeholder="z. B. Anna"
      />
      {error !== null && <p className="name-form__error">{error}</p>}
    </div>
  )
}
