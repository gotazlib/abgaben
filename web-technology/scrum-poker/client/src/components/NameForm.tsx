import { MAX_NAME_LENGTH } from '@scrum-poker/shared'
import type { FormEvent } from 'react'
import './NameForm.css'

interface NameFormProps {
  name: string
  // Message shown below the field, null if the name is valid
  error: string | null
  onNameChange: (name: string) => void
}

export default function NameForm({ name, error, onNameChange }: NameFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // The name is already saved on every keystroke, so Enter only has to
    // prevent the browser from reloading the page.
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
