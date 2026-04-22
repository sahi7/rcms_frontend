import { useEffect, useRef, useState } from 'react'
import { useQuery, type QueryKey } from '@tanstack/react-query'

interface UseAdaptivePollingOptions<T> {
  queryKey: QueryKey
  queryFn: () => Promise<T>
  /** Poll runs only while enabled is true */
  enabled?: boolean
  /** Return true when the polled resource has reached a terminal state. */
  isSettled: (data: T | undefined) => boolean
  /** Minimum delay between polls after a response settles (ms). Default 2000. */
  minDelayMs?: number
  /** Hard stop after N attempts — pass 0 or undefined to disable. */
  maxAttempts?: number
  /** When true, keep polling after a query error (e.g. 404 while waiting). Default true. */
  retryOnError?: boolean
  /** When retryOnError=true, how long between retries (ms). Default 3000. */
  errorRetryMs?: number
  /** Called once when the poll reaches a terminal state. */
  onSettled?: (data: T) => void
  /** Called on every error (so UI can surface it). */
  onError?: (err: unknown) => void
}

/**
 * Adaptive polling hook.
 *
 * Key behavior:
 * - The next request is only scheduled AFTER the previous one settles, so a 25s response
 *   won't stack up more in-flight requests.
 * - When `retryOnError` is true, it keeps polling even on 404s — useful for the payment `link`
 *   flow where the transaction only exists once the user visits the link.
 * - Exposes attempts + seconds elapsed so the UI never goes silent.
 */
export function useAdaptivePolling<T>(options: UseAdaptivePollingOptions<T>) {
  const {
    queryKey,
    queryFn,
    enabled = true,
    isSettled,
    minDelayMs = 2000,
    maxAttempts = 0,
    retryOnError = true,
    errorRetryMs = 3000,
    onSettled,
    onError,
  } = options

  const [attempts, setAttempts] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [stopped, setStopped] = useState(false)
  const settledRef = useRef(false)

  const isPollingActive = enabled && !stopped
  const hitMaxAttempts = !!maxAttempts && attempts >= maxAttempts

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      setAttempts((a) => a + 1)
      return queryFn()
    },
    enabled: isPollingActive && !hitMaxAttempts,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
    // Return false (stop) once settled; otherwise schedule next poll
    refetchInterval: (q) => {
      const data = q.state.data as T | undefined
      const error = q.state.error
      if (!isPollingActive) return false
      if (hitMaxAttempts) return false
      if (data !== undefined && isSettled(data)) return false
      if (error) return retryOnError ? errorRetryMs : false
      return minDelayMs
    },
    refetchIntervalInBackground: false,
  })

  // track start time + elapsed ticker
  useEffect(() => {
    if (isPollingActive && startedAt === null) setStartedAt(Date.now())
    if (!isPollingActive) return
    const id = setInterval(() => {
      if (startedAt)
        setSecondsElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 500)
    return () => clearInterval(id)
  }, [isPollingActive, startedAt])

  // terminal detection
  useEffect(() => {
    if (!query.data || settledRef.current) return
    if (isSettled(query.data)) {
      settledRef.current = true
      onSettled?.(query.data)
    }
  }, [query.data, isSettled, onSettled])

  // surface errors (but keep polling if allowed)
  const lastError = query.error
  useEffect(() => {
    if (lastError) onError?.(lastError)
  }, [lastError, onError])

  const stop = () => setStopped(true)
  const restart = () => {
    settledRef.current = false
    setStopped(false)
    setAttempts(0)
    setStartedAt(Date.now())
    setSecondsElapsed(0)
    query.refetch()
  }

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError && !retryOnError,
    attempts,
    secondsElapsed,
    isSettled: settledRef.current,
    isPolling: isPollingActive && !settledRef.current,
    stop,
    restart,
  }
}
