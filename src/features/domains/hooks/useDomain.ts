import { useQuery } from '@tanstack/react-query'
import { spaceApi } from '@/lib/api'
import type { DomainDetails } from '@/types/domains'

/**
 * GET /v1/domains/<DomainName> — full domain metadata (spaceApi).
 */
export function useDomain(domainName: string | null | undefined) {
  return useQuery<DomainDetails>({
    queryKey: ['domains', 'details', domainName],
    queryFn: () =>
      spaceApi
        .get<DomainDetails>(`/v1/domains/${domainName}`)
        .then((r) => r.data),
    enabled: !!domainName,
    staleTime: 60 * 1000,
  })
}
