import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../api/client'
import ErrorMessage from './ErrorMessage'
import './CreateSessionButton.css'

interface CreateSessionButtonProps {
  disabled: boolean
}

export default function CreateSessionButton({ disabled }: CreateSessionButtonProps) {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setIsCreating(true)
    setError(null)
    try {
      const { id } = await createSession()
      // No setIsCreating(false) here: the page changes and this button disappears
      navigate(`/sessions/${id}`)
    } catch (err) {
      setError(`Session konnte nicht erstellt werden. ${err instanceof Error ? err.message : ''}`)
      setIsCreating(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="create-session-button"
        disabled={disabled || isCreating}
        onClick={() => void handleClick()}
      >
        {isCreating ? 'Wird erstellt…' : 'Neue Session erstellen'}
      </button>
      {error !== null && <ErrorMessage message={error} />}
    </>
  )
}
