import { MAX_NAME_LENGTH } from '@scrum-poker/shared'

// Same rules as the server (server/src/validation.ts).
// Returns the error message, or null if the name is valid.
export function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed === '') {
    return 'Bitte gib deinen Namen ein.'
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Der Name darf höchstens ${MAX_NAME_LENGTH} Zeichen lang sein.`
  }
  return null
}
