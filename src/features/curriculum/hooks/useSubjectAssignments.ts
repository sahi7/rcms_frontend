import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '../../../hooks/shared/useApiQuery'
import {
  SubjectAssignment,
  SubjectAssignmentPayload,
} from '../../../types/curriculum'

const KEY = 'subject-assignments'
const ENDPOINT = '/subject-assignments/'

export function useSubjectAssignments(params: Record<string, any> = {}) {
  return useListQuery<SubjectAssignment>(KEY, ENDPOINT, params)
}

export function useCreateSubjectAssignment() {
  return useCreateMutation<SubjectAssignmentPayload, SubjectAssignment>(
    ENDPOINT,
    [KEY],
  )
}

export function useUpdateSubjectAssignment() {
  return useUpdateMutation<SubjectAssignmentPayload, SubjectAssignment>(
    ENDPOINT,
    [KEY],
  )
}

export function useDeleteSubjectAssignment() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
