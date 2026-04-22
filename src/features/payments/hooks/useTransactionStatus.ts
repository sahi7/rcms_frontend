import { useAdaptivePolling } from '@/hooks/shared/useAdaptivePolling'
import { uploadApi } from '@/lib/api'
import type { Transaction, PaymentMethod } from '@/types/payments'

interface UseTransactionStatusArgs {
  reference: string | null
  method: PaymentMethod | null
  enabled?: boolean
  onSettled?: (tx: Transaction) => void
}

/**
 * Polls GET /transaction/{reference} until status is SUCCESSFUL or FAILED.
 *
 * - Uses adaptive polling: the next request only fires AFTER the previous settles.
 * - For `link` payments, the transaction does NOT exist until the user opens the link,
 *   so 404s are expected during the early window — we keep retrying with a slightly
 *   longer backoff until the user returns.
 */
export function useTransactionStatus({
  reference,
  method,
  enabled = true,
  onSettled,
}: UseTransactionStatusArgs) {
  const polling = useAdaptivePolling<Transaction>({
    queryKey: ['payment', 'transaction', reference],
    queryFn: () =>
      uploadApi
        .get<Transaction>(`/payments/transaction/${reference}`)
        .then((r) => r.data),
    enabled: enabled && !!reference,
    isSettled: (tx) =>
      !!tx && (tx.status === 'SUCCESSFUL' || tx.status === 'FAILED'),
    minDelayMs: 2000,
    // For link, the transaction may return 404 for a while — keep retrying silently.
    retryOnError: true,
    errorRetryMs: method === 'link' ? 4000 : 3000,
    onSettled,
  })

  return polling
}
