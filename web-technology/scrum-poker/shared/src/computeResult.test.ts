import { describe, expect, it } from 'vitest'
import { computeResult } from './index'

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
    // S=2, L=5 -> 3.5 -> closest size is M (3)
    const result = computeResult(['S', 'L'], 'tshirt')

    expect(result.average).toBe(3.5)
    expect(result.averageLabel).toBe('M')
  })

  it('rounds up to the bigger T-shirt size on a tie', () => {
    // M=3, L=5 -> 4 lies exactly between M and L
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
