// src/features/curriculum/hooks/useCurriculumSubjects.ts
import {
  useListQuery,
  useCreateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import {
  CurriculumSubjectListItem,
  CurriculumSubjectPayload,
} from '@/types/curriculum'

const KEY = 'curriculum-subjects'
const ENDPOINT = '/c-subjects/'

export function useCurriculumSubjects(params: Record<string, any> = {}) {
  return useListQuery<CurriculumSubjectListItem>(KEY, ENDPOINT, params)
}

export function useCreateCurriculumSubject() {
  return useCreateMutation<CurriculumSubjectPayload, CurriculumSubjectListItem>(
    ENDPOINT,
    [KEY],
  )
}

export function useDeleteCurriculumSubject() {
  return useDeleteMutation(ENDPOINT, [KEY])
}