import { useMemo } from 'react'
import { usePaymentHistory } from './usePaymentHistory'
import { useRegistrationsHistory } from './useRegistrationsHistory'
import type { CombinedHistoryItem } from '@/types/payments'

interface Filters {
  domain?: string
  limit?: number
}

export function useCombinedHistory(filters: Filters = {}) {
  const payments = usePaymentHistory({
    domain: filters.domain,
    limit: filters.limit,
  })
  const registrations = useRegistrationsHistory({
    domain: filters.domain,
    limit: filters.limit,
  })

  const combined = useMemo<CombinedHistoryItem[]>(() => {
    const paymentItems = payments.data?.pages.flatMap((p) => p.items) || []
    const registrationItems =
      registrations.data?.pages.flatMap((p) => p.items) || []

    const byDomain = new Map<string, CombinedHistoryItem>()

    for (const p of paymentItems) {
      const key = `${p.domain_name}:${p.created_at}`
      byDomain.set(key, {
        key,
        domain: p.domain_name,
        payment: p,
        createdAt: p.created_at,
      })
    }

    for (const r of registrationItems) {
      // Try to match with the closest payment for the same domain (within 24h)
      let matched: CombinedHistoryItem | undefined
      const rTime = new Date(r.created_at).getTime()
      for (const item of byDomain.values()) {
        if (item.domain === r.domain && item.payment && !item.registration) {
          const pTime = new Date(item.payment.created_at).getTime()
          if (Math.abs(rTime - pTime) < 24 * 3600 * 1000) {
            matched = item
            break
          }
        }
      }
      if (matched) {
        matched.registration = r
      } else {
        const key = `reg:${r.id}`
        byDomain.set(key, {
          key,
          domain: r.domain,
          registration: r,
          createdAt: r.created_at,
        })
      }
    }

    return Array.from(byDomain.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [payments.data, registrations.data])

  return {
    items: combined,
    isLoading: payments.isLoading || registrations.isLoading,
    isError: payments.isError || registrations.isError,
    error: payments.error || registrations.error,
    hasNextPage: payments.hasNextPage || registrations.hasNextPage,
    isFetchingNextPage:
      payments.isFetchingNextPage || registrations.isFetchingNextPage,
    fetchNextPage: () => {
      if (payments.hasNextPage) payments.fetchNextPage()
      if (registrations.hasNextPage) registrations.fetchNextPage()
    },
    refetch: () => {
      payments.refetch()
      registrations.refetch()
    },
  }
}
