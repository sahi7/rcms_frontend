// src/features/curriculum/hooks/useCurriculumSubjects.ts
import {
  useListQuery,
  useCreateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import {
  CurriculumSubject,
  CurriculumSubjectPayload,
} from '@/types/curriculum'

const KEY = 'curriculum-subjects'
const ENDPOINT = '/curriculum-subjects/'

export function useCurriculumSubjects(params: Record<string, any> = {}) {
  return useListQuery<CurriculumSubject>(KEY, ENDPOINT, params)
}

export function useCreateCurriculumSubject() {
  return useCreateMutation<CurriculumSubjectPayload, CurriculumSubject>(
    ENDPOINT,
    [KEY],
  )
}

export function useDeleteCurriculumSubject() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
