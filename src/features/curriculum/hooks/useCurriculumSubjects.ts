// src/features/curriculum/hooks/useCurriculumSubjects.ts
import {
  useListQuery,
  useCreateMutation,
  useDeleteMutation,
  useUpdateMutation,
} from '@/hooks/shared/useApiQuery'
import {
  CurriculumSubject,
  CurriculumSubjectPayload,
  CurriculumSubjectListItem,
} from '@/types/curriculum'

const KEY = 'curriculum-subjects'
const ENDPOINT = '/c-subjects/'

export function useCurriculumSubjects(params: Record<string, any> = {}) {
  return useListQuery<CurriculumSubject>(KEY, ENDPOINT, params)
}

export function useUpdateCurriculumSubject() {
  return useUpdateMutation<CurriculumSubjectListItem, CurriculumSubject>(ENDPOINT, [
    KEY,
  ])
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
