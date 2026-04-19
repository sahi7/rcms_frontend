import { useQuery } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { DomainDetails } from '@/types/domains'

/**
 * GET /domains/domains/<DomainName> — full domain metadata.
 */
export function useDomain(domainName: string | null | undefined) {
  return useQuery<DomainDetails>({
    queryKey: ['domains', 'details', domainName],
    queryFn: () =>
      uploadApi
        .get<DomainDetails>(`/domains/domains/${domainName}`)
        .then((r) => r.data),
    enabled: !!domainName,
    staleTime: 60 * 1000,
  })
}
