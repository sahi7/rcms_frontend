import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '../../../hooks/shared/useApiQuery'
import { Subject, SubjectPayload } from '../../../types/curriculum'

const KEY = 'subjects'
const ENDPOINT = '/subjects/'

export function useSubjects(params: Record<string, any> = {}) {
  return useListQuery<Subject>(KEY, ENDPOINT, params)
}

export function useCreateSubject() {
  return useCreateMutation<SubjectPayload, Subject>(ENDPOINT, [KEY])
}

export function useUpdateSubject() {
  return useUpdateMutation<SubjectPayload, Subject>(ENDPOINT, [KEY])
}

export function useDeleteSubject() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
