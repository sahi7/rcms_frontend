import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import {
  ClassAssignment,
  ClassAssignmentPayload,
} from '@/types/curriculum'

const KEY = 'class-assignments'
const ENDPOINT = '/class-assignments/'

export function useClassAssignments(params: Record<string, any> = {}) {
  return useListQuery<ClassAssignment>(KEY, ENDPOINT, params)
}

export function useCreateClassAssignment() {
  return useCreateMutation<ClassAssignmentPayload, ClassAssignment>(ENDPOINT, [
    KEY,
  ])
}

export function useUpdateClassAssignment() {
  return useUpdateMutation<ClassAssignmentPayload, ClassAssignment>(ENDPOINT, [
    KEY,
  ])
}

export function useDeleteClassAssignment() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
