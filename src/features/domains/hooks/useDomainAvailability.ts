import { useMutation } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { DomainAvailabilityResponse } from '@/types/domains'

/**
 * GET /v1/domains/<DomainName>/available — check availability (uploadApi).
 * Implemented as a mutation so callers can trigger it on-demand from UI.
 */
export function useCheckDomainAvailability() {
  return useMutation<DomainAvailabilityResponse, Error, string>({
    mutationFn: (domainName) =>
      uploadApi
        .get<DomainAvailabilityResponse>(`/domains/${domainName}/available`)
        .then((r) => r.data),
  })
}
