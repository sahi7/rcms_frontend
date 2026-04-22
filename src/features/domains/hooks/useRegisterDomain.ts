// src/features/domains/hooks/useRegisterDomain.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import type { RegisterDomainPayload } from '@/types/domains'
import type { AsyncOperationResponse } from '@/types/shared'

/**
 * POST /domains/<DomainName>/register — returns 202 with { operationId }.
 */
export function useRegisterDomain() {
  const qc = useQueryClient()
  return useMutation<
    AsyncOperationResponse,
    Error,
    { domainName: string; payload: RegisterDomainPayload }
  >({
    mutationFn: ({ domainName, payload }) =>
      uploadApi
        .post<AsyncOperationResponse>(
          `/domains/${domainName}/register`,
          payload,
        )
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains', 'info'] })
    },
  })
}
