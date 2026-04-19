import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { AsyncOperation } from '@/types/domains'

/**
 * Polls GET /api/v1/async-operations/<operationId> every `intervalMs` until
 * status is 'success' or 'failed'. Pass `null` to disable.
 */
export function useOperationStatus(
  operationId: string | null,
  options: {
    intervalMs?: number
    onSettled?: (op: AsyncOperation) => void
  } = {},
) {
  const { intervalMs = 2500, onSettled } = options
  const [done, setDone] = useState(false)

  const query = useQuery<AsyncOperation>({
    queryKey: ['async-operation', operationId],
    queryFn: () =>
      uploadApi
        .get<AsyncOperation>(`/domains/async/${operationId}`)
        .then((r) => r.data),
    enabled: !!operationId && !done,
    refetchInterval: (q) => {
      const data = q.state.data as AsyncOperation | undefined
      if (!data) return intervalMs
      if (data.status === 'pending') return intervalMs
      return false
    },
  })

  useEffect(() => {
    if (!query.data) return
    if (query.data.status !== 'pending' && !done) {
      setDone(true)
      onSettled?.(query.data)
    }
  }, [query.data, done, onSettled])

  // reset when operationId changes
  useEffect(() => {
    setDone(false)
  }, [operationId])

  return query
}
