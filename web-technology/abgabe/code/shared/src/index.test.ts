// Tests für die gemeinsamen Funktionen in index.ts: validateName() und computeResult().

import { describe, expect, it } from 'vitest'
import { MAX_NAME_LENGTH, computeResult, validateName } from './index'

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
    expect(validateName('a'.repeat(MAX_NAME_LENGTH + 1))).toBe(
      'Der Name darf höchstens 30 Zeichen lang sein.',
    )
  })
})

describe('computeResult', () => {
  it('calculates the average of a Fibonacci round', () => {
    const result = computeResult(['3', '5', '8'], 'fibonacci')

    expect(result.average).toBe(5.3)
    expect(result.averageLabel).toBe('5.3')
    expect(result.voteCount).toBe(3)
  })

  it('ignores "?" and "☕" for the average but still counts them as votes', () => {
    const result = computeResult(['2', '?', '☕', '4'], 'fibonacci')

    expect(result.average).toBe(3)
    expect(result.voteCount).toBe(4)
  })

  it('maps T-shirt sizes to numbers and back to the closest size', () => {
    // S=2, L=5 -> 3.5 -> nächste Grösse ist M (3)
    const result = computeResult(['S', 'L'], 'tshirt')

    expect(result.average).toBe(3.5)
    expect(result.averageLabel).toBe('M')
  })

  it('rounds up to the bigger T-shirt size on a tie', () => {
    // M=3, L=5 -> 4 liegt genau zwischen M und L
    expect(computeResult(['M', 'L'], 'tshirt').averageLabel).toBe('L')
  })

  it('ignores "?" in a T-shirt round', () => {
    const result = computeResult(['XL', '?'], 'tshirt')

    expect(result.average).toBe(8)
    expect(result.averageLabel).toBe('XL')
  })

  it('returns null as average when there is no numeric vote', () => {
    expect(computeResult(['?', '☕'], 'fibonacci')).toEqual({
      average: null,
      averageLabel: null,
      consensus: false,
      voteCount: 2,
    })
    expect(computeResult([], 'tshirt')).toEqual({
      average: null,
      averageLabel: null,
      consensus: false,
      voteCount: 0,
    })
  })

  it('detects a consensus when at least two votes are identical', () => {
    expect(computeResult(['5', '5', '5'], 'fibonacci').consensus).toBe(true)
    expect(computeResult(['5', '8'], 'fibonacci').consensus).toBe(false)
  })

  it('does not call a single vote a consensus', () => {
    expect(computeResult(['5'], 'fibonacci').consensus).toBe(false)
  })
})
