import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '../../../hooks/shared/useApiQuery'
import { Faculty, FacultyPayload } from '@/types/structure'

const KEY = 'faculties'
const ENDPOINT = '/faculties/'

export function useFaculties(params: Record<string, any> = {}) {
  return useListQuery<Faculty>(KEY, ENDPOINT, params)
}

export function useCreateFaculty() {
  return useCreateMutation<FacultyPayload, Faculty>(ENDPOINT, [KEY])
}

export function useUpdateFaculty() {
  return useUpdateMutation<FacultyPayload, Faculty>(ENDPOINT, [KEY])
}

export function useDeleteFaculty() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
