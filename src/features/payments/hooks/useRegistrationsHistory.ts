import { useInfiniteQuery } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { CursorPaginatedResponse } from '@/types/shared'
import type { RegistrationHistoryItem } from '@/types/payments'

interface Filters {
  registration_status?: string
  payment_status?: string
  domain?: string
  limit?: number
}

export function useRegistrationsHistory(filters: Filters = {}) {
  return useInfiniteQuery<CursorPaginatedResponse<RegistrationHistoryItem>>({
    queryKey: ['registrations', 'history', filters],
    queryFn: ({ pageParam }) =>
      uploadApi
        .get<CursorPaginatedResponse<RegistrationHistoryItem>>(
          '/domains/registrations',
          {
            params: {
              limit: filters.limit ?? 20,
              registration_status: filters.registration_status || undefined,
              payment_status: filters.payment_status || undefined,
              domain: filters.domain || undefined,
              cursor: pageParam || undefined,
            },
          },
        )
        .then((r) => r.data),
    initialPageParam: '',
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
    staleTime: 30_000,
  })
}
