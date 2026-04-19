import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadApi, spaceApi } from '@/lib/api'
import type {
  DomainContact,
  DomainContactCreateResponse,
} from '@/types/domains'

/**
 * POST /domains/contacts — create domain contact (one-shot, immutable).
 */
export function useCreateDomainContact() {
  const qc = useQueryClient()
  return useMutation<DomainContactCreateResponse, Error, DomainContact>({
    mutationFn: (payload) =>
      uploadApi
        .post<DomainContactCreateResponse>('/domains/contacts', payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains', 'info'] })
    },
  })
}

/**
 * GET /v1/contacts/<DomainContactID> — read contact details (spaceApi).
 */
export function useDomainContact(contactId: string | null | undefined) {
  return useQuery<DomainContact>({
    queryKey: ['domains', 'contact', contactId],
    queryFn: () =>
      spaceApi
        .get<DomainContact>(`/v1/contacts/${contactId}`)
        .then((r) => r.data),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000,
  })
}
