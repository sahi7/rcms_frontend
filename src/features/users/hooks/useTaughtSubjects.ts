import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useListQuery,
  useCreateMutation,
} from '@/hooks/shared/useApiQuery'
import { useAuthStore } from '../../../app/store/authStore'

export interface TaughtSubject {
  subject_id: number
  department_id: number
  classroom_ids: number[]
  subject?: { id: number; name: string; code: string }
  department?: { id: number; name: string }
}

export function useTaughtSubjects(userId: string | number) {
  return useListQuery<TaughtSubject>(
    ['taught-subjects', String(userId)],
    `/users/${userId}/taught-subjects/`,
  )
}

export function useAddTaughtSubject(userId: string | number) {
  return useCreateMutation<
    any,
    { subject_id: number; department_id: number; classroom_ids: number[] }
  >(`/users/${userId}/taught-subjects/`, [['taught-subjects', String(userId)]])
}

export function useRemoveTaughtSubject(userId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { subject_id: number; department_id: number }) => {
      const token = useAuthStore.getState().token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/users/${userId}/taught-subjects/`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: 'Failed to remove taught subject' }
        }
        throw errorData
      }

      if (response.status === 204) return null
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['taught-subjects', String(userId)],
      })
    },
  })
}
