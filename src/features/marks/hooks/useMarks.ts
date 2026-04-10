import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { marksApi } from './marksApi'
import type { MarkUpdatePayload, MarkPreviewResponse } from '@/types/marks'

const THIRTY_MINUTES = 30 * 60 * 1000

/** Fetch what the current user is allowed to upload to */
export function useUploadScope() {
  return useQuery({
    queryKey: ['marks', 'upload-scope'],
    queryFn: marksApi.getUploadScope,
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

/** Upload marks file */
export function useUploadMarks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => marksApi.upload(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marks'] })
      qc.invalidateQueries({ queryKey: ['upload-status'] })
    },
  })
}

/** Infinite-scroll mark preview */
export function useMarkPreview(params: {
  group_key: string
  term_id: string | number
  limit?: number
  search?: string
  enabled?: boolean
}) {
  const { group_key, term_id, limit = 200, search, enabled = true } = params
  return useInfiniteQuery<MarkPreviewResponse>({
    queryKey: ['marks', 'preview', group_key, term_id, search],
    queryFn: ({ pageParam }) =>
      marksApi.getPreview({
        group_key,
        term_id,
        limit,
        search: search || undefined,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: enabled && !!group_key && !!term_id,
    staleTime: THIRTY_MINUTES,
  })
}

/** Batch update marks */
export function useUpdateMarks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: MarkUpdatePayload) => marksApi.updateMarks(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marks', 'preview'] })
    },
  })
}

/** Cursor-paginated upload status */
export function useUploadStatus(filters: {
  term?: string
  department?: string
  teacher?: string
  subject?: string
  class?: string
  sequence?: string
  enabled?: boolean
}) {
  const { enabled = true, ...params } = filters
  return useInfiniteQuery({
    queryKey: ['upload-status', params],
    queryFn: ({ pageParam }) =>
      marksApi.getUploadStatus({
        ...params,
        cursor: pageParam as number | undefined,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled,
    staleTime: THIRTY_MINUTES,
  })
}

/** Student performance report */
export function useStudentReport(
  studentId: string,
  params: { term_id?: string; sequence_id?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: ['student-report', studentId, params],
    queryFn: () => marksApi.getStudentMarks(studentId, params),
    enabled: enabled && !!studentId && !!(params.term_id || params.sequence_id),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}
