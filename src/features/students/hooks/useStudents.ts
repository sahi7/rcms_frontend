// src/features/students/hooks/useStudents.ts
import { useListQuery, useDeleteMutation } from '@/hooks/shared/useApiQuery'
import { Student } from '@/types/academic'

const KEY = 'students'
const ENDPOINT = '/students/'

export function useStudentsList(params: Record<string, any> = {}) {
  return useListQuery<Student>(KEY, ENDPOINT, params)
}

export function useDeleteStudent() {
  return useDeleteMutation(ENDPOINT, [KEY])
}