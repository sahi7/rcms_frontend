import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  GenerateReportPayload,
  GenerateReportResponse,
  GeneratedReport,
  GeneratedReportsResponse,
} from '@/types/reports'

const THIRTY_MINUTES = 30 * 60 * 1000

export function useGenerateReport(termId: string) {
  const queryClient = useQueryClient()

  return useMutation<GenerateReportResponse, Error, GenerateReportPayload>({
    mutationFn: (payload) =>
      api
        .post<GenerateReportResponse>(
          `/terms/${termId}/generate-reports/`,
          payload,
        )
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] })
    },
  })
}

interface GeneratedReportsParams {
  term_id?: string | number
  class_id?: string | number
  department_id?: string | number
}

export function useGeneratedReports(params: GeneratedReportsParams = {}) {
  const cleanParams: Record<string, any> = {}
  if (params.term_id) cleanParams.term_id = params.term_id
  if (params.class_id) cleanParams.class_id = params.class_id
  if (params.department_id) cleanParams.department_id = params.department_id

  return useQuery<GeneratedReportsResponse>({
    queryKey: ['generated-reports', cleanParams],
    queryFn: () =>
      api
        .get<GeneratedReportsResponse>('/marks/generated-reports/', {
          params: cleanParams,
        })
        .then((res) => res.data),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}
