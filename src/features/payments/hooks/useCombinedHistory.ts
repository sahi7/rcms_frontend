// src/features/payments/hooks/useCombinedHistory.ts
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
    limit: filters.limit,
  })
  const registrations = useRegistrationsHistory({
    limit: filters.limit,
  })

  const combined = useMemo<CombinedHistoryItem[]>(() => {
    // Safely handle backend responses where `items: null` (instead of `items: []`)
    // This is the exact cause of "p is null" / "can't access property domain_name"
    const paymentItems = payments.data?.pages
      ?.flatMap((page) => page?.items ?? [])
      .filter((item): item is NonNullable<typeof item> => item != null) ?? []

    const registrationItems = registrations.data?.pages
      ?.flatMap((page) => page?.items ?? [])
      .filter((item): item is NonNullable<typeof item> => item != null) ?? []

    const byDomain = new Map<string, CombinedHistoryItem>()

    // Process payments
    for (const p of paymentItems) {
      const key = `${p.domain_name}:${p.created_at}`
      byDomain.set(key, {
        key,
        domain: p.domain_name,
        payment: p,
        createdAt: p.created_at,
      })
    }

    // Process registrations (with matching logic)
    for (const r of registrationItems) {
      let matched: CombinedHistoryItem | undefined
      const rTime = new Date(r.created_at).getTime()

      for (const item of byDomain.values()) {
        if (
          item.domain === r.domain &&
          item.payment &&
          !item.registration
        ) {
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

    let result = Array.from(byDomain.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    // Frontend-only filtering
    if (filters.domain?.trim()) {
      const searchTerm = filters.domain.toLowerCase().trim()
      result = result.filter((item) =>
        item.domain?.toLowerCase().includes(searchTerm),
      )
    }

    return result
  }, [payments.data, registrations.data, filters.domain])

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