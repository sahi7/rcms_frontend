import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
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
 * GET /contacts/<DomainContactID> — read contact details 
 */
export function useDomainContact() {
  return useQuery<DomainContact>({
    queryKey: ['domains', 'contact'],
    queryFn: () =>
      uploadApi
        .get<DomainContact>(`/domains/contacts/`)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}
