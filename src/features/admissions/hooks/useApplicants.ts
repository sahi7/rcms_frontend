import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import {
  Applicant,
  ApplicantSearchParams,
  EducationalHistory,
  StatusUpdatePayload,
  BulkStatusUpdatePayload,
} from '@/types/admissions'
import { SearchPaginatedResponse } from '@/types/shared'

const KEY = 'applicants'

export function useApplicantsSearch(params: ApplicantSearchParams) {
  return useQuery<SearchPaginatedResponse<Applicant>>({
    queryKey: [KEY, 'search', params],
    queryFn: () =>
      uploadApi
        .get<
          SearchPaginatedResponse<Applicant>
        >('/admissions/admin/applicants/search/', { params })
        .then((r) => r.data),
    staleTime: 30 * 1000,
  })
}

export function useApplicantDetail(
  params: ApplicantSearchParams,
  id: string | null
) {
  return useQuery<Applicant | null>({
    queryKey: [KEY, params],
    queryFn: async () => {
      const res = await uploadApi.get(`/admissions/admin/applicants/search/`, {
        params,
      })
      const hit = res.data?.hits?.[0]
      if (!hit) return null // safe fallback
      return hit
    },
    enabled: !!id,
  })
}

export function useEducationalHistory(applicationId: string | null) {
  return useQuery<EducationalHistory[]>({
    queryKey: ['educational-history', applicationId],
    queryFn: () =>
      uploadApi
        .get<
          EducationalHistory[]
        >(`/admissions/applications/${applicationId}/educational-history/`)
        .then((r) => r.data),
    enabled: !!applicationId,
  })
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation<
    Applicant,
    Error,
    { id: string; payload: StatusUpdatePayload }
  >({
    mutationFn: ({ id, payload }) =>
      uploadApi
        .patch<Applicant>(
          `/admissions/admin/applications/${id}/status/`,
          payload,
        )
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useBulkUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation<void, Error, BulkStatusUpdatePayload>({
    mutationFn: (payload) =>
      uploadApi
        .patch('/admissions/admin/applications/bulk/status/', payload)
        .then(() => undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useBulkDeleteApplications() {
  const qc = useQueryClient()
  return useMutation<void, Error, string[]>({
    mutationFn: (ids) =>
      uploadApi
        .delete('/admissions/admin/applications/bulk-delete/', {
          data: { ids },
        })
        .then(() => undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
