import { useMutation } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type {
  InitiatePaymentPayload,
  InitiatePaymentResponse,
} from '@/types/payments'

/** POST /initiate/ — returns either collect (ussd_code + operator) or link response. */
export function useInitiatePayment() {
  return useMutation<InitiatePaymentResponse, Error, InitiatePaymentPayload>({
    mutationFn: (payload) =>
      uploadApi
        .post<InitiatePaymentResponse>('/payments/initiate/', payload)
        .then((r) => r.data),
  })
}
