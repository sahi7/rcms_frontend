import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import {
  useListQuery,
  useUpdateMutation,
  useDeleteMutation,
  useCreateMutation,
} from '@/hooks/shared/useApiQuery'
import { StudyProgram, StudyProgramPayload } from '@/types/admissions'
import { AdPaginatedResponse } from '@/types/shared'

const KEY = 'study-programs'
const ENDPOINT = '/admissions/admin/study-programs/'

export function useStudyProgramsList() {
  return useListQuery<StudyProgram, AdPaginatedResponse<StudyProgram>>(KEY, ENDPOINT, uploadApi)
}

export function useCreateStudyProgram() {
  return useCreateMutation<StudyProgramPayload, StudyProgram>(ENDPOINT, [KEY], uploadApi)
}

export function useUpdateStudyProgram() {
  return useUpdateMutation<Partial<StudyProgramPayload>, StudyProgram>(
    ENDPOINT,
    [KEY],
    uploadApi,
  )
}

export function useDeleteStudyProgram() {
  return useDeleteMutation(ENDPOINT, [KEY])
}

export function useBulkCreateStudyPrograms() {
  const qc = useQueryClient()
  return useMutation<StudyProgram[], Error, StudyProgramPayload[]>({
    mutationFn: (payload) =>
      uploadApi.post<StudyProgram[]>(`${ENDPOINT}bulk/`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useBulkDeleteStudyPrograms() {
  const qc = useQueryClient()
  return useMutation<void, Error, (number | string)[]>({
    mutationFn: (ids) =>
      uploadApi
        .delete('/admissions/study-programs/bulk-delete/', {
          data: { ids },
        })
        .then(() => undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
