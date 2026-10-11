import { useCallback, useEffect, useRef, useState } from 'react'

export interface PollingResult<T> {
  data: T | null
  error: Error | null
  // true until the first answer (data or error) has arrived
  isLoading: boolean
  // Loads again right away, e.g. after the user changed something
  refresh: () => void
  // Shows a newer value right away, e.g. the answer to a user action,
  // without waiting for the next poll
  setData: (value: T) => void
}

// Calls `fetcher` immediately and then every `intervalMs` milliseconds.
//
// Important: `fetcher` must keep the same identity between renders
// (wrap it in useCallback), otherwise the polling restarts on every render.
export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number,
): PollingResult<T> {
  const [data, setDataState] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Only a counter: changing it restarts the effect below, which polls at once
  const [refreshCount, setRefreshCount] = useState(0)
  // Controller of the request that is currently running. A ref (and not a
  // local variable of the effect), because setData() needs it too.
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    async function poll() {
      // Cancel the previous request if it is still running. Otherwise a slow,
      // older answer could arrive last and overwrite newer data.
      controllerRef.current?.abort()
      const current = new AbortController()
      controllerRef.current = current

      try {
        const result = await fetcher(current.signal)
        if (current.signal.aborted) return
        setDataState(result)
        setError(null)
      } catch (err) {
        // Aborted on purpose (newer request or unmount): not an error
        if (current.signal.aborted) return
        setError(err instanceof Error ? err : new Error(String(err)))
      }
      setIsLoading(false)
    }

    void poll()
    const intervalId = setInterval(() => void poll(), intervalMs)

    // Cleanup on unmount (or when fetcher/interval change or refresh() is called):
    // stop the timer and cancel the running request, so that no state is set afterwards.
    return () => {
      clearInterval(intervalId)
      controllerRef.current?.abort()
    }
  }, [fetcher, intervalMs, refreshCount])

  function refresh() {
    setRefreshCount((count) => count + 1)
  }

  const setData = useCallback((value: T) => {
    // A poll that is still running was started before this change. Its answer
    // could contain the old state and make the UI flicker back, so we drop it.
    controllerRef.current?.abort()
    setDataState(value)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, error, isLoading, refresh, setData }
}
