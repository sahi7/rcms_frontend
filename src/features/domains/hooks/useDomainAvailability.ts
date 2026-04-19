import { useMutation } from '@tanstack/react-query'
import { spaceApi } from '@/lib/api'
import type { DomainAvailabilityResponse } from '@/types/domains'

/**
 * GET /v1/domains/<DomainName>/available — check availability (spaceApi).
 * Implemented as a mutation so callers can trigger it on-demand from UI.
 */
export function useCheckDomainAvailability() {
  return useMutation<DomainAvailabilityResponse, Error, string>({
    mutationFn: (domainName) =>
      spaceApi
        .get<DomainAvailabilityResponse>(`/v1/domains/${domainName}/available`)
        .then((r) => r.data),
  })
}
