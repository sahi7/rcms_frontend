// src/features/students/hooks/useStudentBulkUpload.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface BulkUploadResponse {
  message: string
  created?: number
  updated?: number
  errors?: string[]
  error_count: number
  success_count?: number
  sample?: any[]
}

export function useStudentBulkUpload() {
  const queryClient = useQueryClient()

  return useMutation<BulkUploadResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<BulkUploadResponse>(
        '/students/bulk-upload/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return data
    },
    onSuccess: () => {
      // Invalidate students list so the table refreshes
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}