import { MAX_NAME_LENGTH } from '@scrum-poker/shared'
import { describe, expect, it } from 'vitest'
import { validateName } from './validateName'

describe('validateName', () => {
  it('accepts a normal name', () => {
    expect(validateName('Anna')).toBeNull()
  })

  it('rejects an empty name and a name with only spaces', () => {
    expect(validateName('')).toBe('Bitte gib deinen Namen ein.')
    expect(validateName('   ')).toBe('Bitte gib deinen Namen ein.')
  })

  it('ignores spaces at the start and end when checking the length', () => {
    expect(validateName(` ${'a'.repeat(MAX_NAME_LENGTH)} `)).toBeNull()
    expect(validateName('a'.repeat(MAX_NAME_LENGTH + 1))).toMatch(/höchstens 30 Zeichen/)
  })
})
