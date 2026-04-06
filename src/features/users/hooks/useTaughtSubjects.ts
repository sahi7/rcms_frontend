// src/features/users/hooks/useTaughtSubjects.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  useListQuery,
  useCreateMutation,
} from '@/hooks/shared/useApiQuery'

export interface TaughtSubject {
  subject_id: number
  department_id: number
  classroom_ids: number[]
  subject?: { id: number; name: string; code: string }
  department?: { id: number; name: string }
}

export function useTaughtSubjects(userId: string | number) {
  return useListQuery<TaughtSubject>(
    `taught-subjects-${userId}`,                    // string key (required by your useListQuery)
    `/users/${userId}/taught-subjects/`
  )
}

export function useAddTaughtSubject(userId: string | number) {
  return useCreateMutation<
    { subject_id: number; department_id: number; classroom_ids: number[] },
    any
  >(
    `/users/${userId}/taught-subjects/`,
    [`taught-subjects-${userId}`]                  // flat string[] as required by your hook
  )
}

export function useRemoveTaughtSubject(userId: string | number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { subject_id: number; department_id: number }) => {
      await api.delete(`/users/${userId}/taught-subjects/`, {
        data,                                    
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`taught-subjects-${userId}`],
      })
    },
  })
}