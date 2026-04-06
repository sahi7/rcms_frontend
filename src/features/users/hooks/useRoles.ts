// src/features/users/hooks/useRoles.ts
import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'

const KEY = 'roles'
const ENDPOINT = '/roles/'

export function useRoles() {
  const rolesList = useListQuery<any>(KEY, ENDPOINT)

  const createMutation = useCreateMutation<any, any>(ENDPOINT, [KEY])
  const updateMutation = useUpdateMutation<any, any>(ENDPOINT, [KEY])
  const deleteMutation = useDeleteMutation(ENDPOINT, [KEY])

  return {
    rolesData: rolesList.data,
    isLoading: rolesList.isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  }
}