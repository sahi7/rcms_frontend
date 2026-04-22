import { useInfiniteQuery } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { CursorPaginatedResponse } from '@/types/shared'
import type { PaymentHistoryItem } from '@/types/payments'

interface Filters {
  status?: string
  domain?: string
  limit?: number
}

export function usePaymentHistory(filters: Filters = {}) {
  return useInfiniteQuery<CursorPaginatedResponse<PaymentHistoryItem>>({
    queryKey: ['payments', 'history', filters],
    queryFn: ({ pageParam }) =>
      uploadApi
        .get<CursorPaginatedResponse<PaymentHistoryItem>>(
          '/payments/payment-history',
          {
            params: {
              limit: filters.limit ?? 20,
              status: filters.status || undefined,
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
