// src/features/structure/hooks/useDepartments.ts
import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import { Department, DepartmentPayload } from '@/types/structure'

const KEY = 'departments'
const ENDPOINT = '/departments/'

export function useDepartments(params: Record<string, any> = {}) {
  return useListQuery<Department>(KEY, ENDPOINT, params)
}

export function useCreateDepartment() {
  return useCreateMutation<DepartmentPayload, Department>(ENDPOINT, [KEY])
}

export function useUpdateDepartment() {
  return useUpdateMutation<DepartmentPayload, Department>(ENDPOINT, [KEY])
}

export function useDeleteDepartment() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
