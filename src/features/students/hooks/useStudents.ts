// src/features/students/hooks/useStudents.ts
import { UseQueryOptions } from '@tanstack/react-query'
import { useListQuery, useDeleteMutation } from '@/hooks/shared/useApiQuery'
import { Student, PaginatedResponse } from '@/types/academic'

const KEY = 'students'
const ENDPOINT = '/students/'

export function useStudentsList(
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<PaginatedResponse<Student>>, 'queryKey' | 'queryFn'>
) {
  return useListQuery<Student>(KEY, ENDPOINT, params ?? {}, undefined, options)
}
export function useDeleteStudent() {
  return useDeleteMutation(ENDPOINT, [KEY])
}