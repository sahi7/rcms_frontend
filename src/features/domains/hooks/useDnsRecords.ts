import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type {
  DnsRecordsResponse,
  DnsSavePayload,
  DnsDeletePayload,
} from '@/types/domains'

/**
 * GET /domains/dns/records/<DomainName> — list DNS records
 */
export function useDnsRecords(domainName: string | null | undefined) {
  return useQuery<DnsRecordsResponse>({
    queryKey: ['domains', 'dns', domainName],
    queryFn: () =>
      uploadApi
        .get<DnsRecordsResponse>(`/domains/dns/records/${domainName}`)
        .then((r) => r.data),
    enabled: !!domainName,
    staleTime: 30 * 1000,
  })
}

/**
 * PUT /domains/dns/records — save (replace) DNS records. 204 No Content.
 */
export function useSaveDnsRecords() {
  const qc = useQueryClient()
  return useMutation<void, Error, DnsSavePayload>({
    mutationFn: (payload) =>
      uploadApi.put('/domains/dns/records/', payload).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains', 'dns'] })
    },
  })
}

/**
 * DELETE /domains/dns/records — delete one or more DNS records. 204.
 */
export function useDeleteDnsRecords() {
  const qc = useQueryClient()
  return useMutation<void, Error, DnsDeletePayload[]>({
    mutationFn: (payload) =>
      uploadApi
        .delete('/domains/dns/records', { data: payload })
        .then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains', 'dns'] })
    },
  })
}
