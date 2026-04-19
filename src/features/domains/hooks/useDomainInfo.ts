import { useQuery } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { DomainInfo } from '@/types/domains'

/**
 * GET /domains/info — returns the institution's domain registration state.
 * If DomainName is empty, no domain has been registered yet.
 * DomainContactID is required before registering a domain.
 */
export function useDomainInfo() {
  return useQuery<DomainInfo>({
    queryKey: ['domains', 'info'],
    queryFn: () =>
      uploadApi.get<DomainInfo>('/domains/info').then((r) => r.data),
    staleTime: 60 * 1000,
  })
}
