import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePolling } from './usePolling'

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads immediately and then on every interval', async () => {
    let calls = 0
    const fetcher = vi.fn(() => Promise.resolve(++calls))

    const { result } = renderHook(() => usePolling(fetcher, 1000))
    expect(result.current.isLoading).toBe(true)

    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current).toMatchObject({ data: 1, error: null, isLoading: false })

    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(result.current.data).toBe(2)
  })

  it('reports errors', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('Server nicht erreichbar.')))

    const { result } = renderHook(() => usePolling(fetcher, 1000))
    await act(() => vi.advanceTimersByTimeAsync(0))

    expect(result.current.error?.message).toBe('Server nicht erreichbar.')
    expect(result.current.isLoading).toBe(false)
  })

  it('loads again right away on refresh() and keeps the old data meanwhile', async () => {
    let calls = 0
    const fetcher = vi.fn(() => Promise.resolve(++calls))

    const { result } = renderHook(() => usePolling(fetcher, 1000))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.data).toBe(1)

    act(() => result.current.refresh())
    expect(result.current).toMatchObject({ data: 1, isLoading: false })

    // No need to wait for the interval: the new request starts immediately
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.data).toBe(2)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('stops polling and aborts the running request on unmount', async () => {
    const signals: AbortSignal[] = []
    // Never resolves, so that the request is still running on unmount
    const fetcher = vi.fn((signal: AbortSignal) => {
      signals.push(signal)
      return new Promise<number>(() => {})
    })

    const { unmount } = renderHook(() => usePolling(fetcher, 1000))
    unmount()
    await vi.advanceTimersByTimeAsync(5000)

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(signals[0].aborted).toBe(true)
  })

  it('shows data from setData at once and ignores the older running request', async () => {
    let resolveSlow: (value: string) => void = () => {}
    const fetcher = vi.fn(() => new Promise<string>((resolve) => (resolveSlow = resolve)))

    const { result } = renderHook(() => usePolling(fetcher, 1000))
    act(() => result.current.setData('from action'))
    expect(result.current).toMatchObject({ data: 'from action', isLoading: false })

    // The poll started before the action answers late with the old state
    await act(async () => resolveSlow('old poll'))
    expect(result.current.data).toBe('from action')

    // The next poll brings the regular updates again
    await act(() => vi.advanceTimersByTimeAsync(1000))
    await act(async () => resolveSlow('new poll'))
    expect(result.current.data).toBe('new poll')
  })
})
