// src/hooks/useApiQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { PaginatedResponse, ListQueryParams } from '@/types/shared'
import api from "@/lib/api";

const THIRTY_MINUTES = 30 * 60 * 1000

export function useListQuery<T>(
  key: string,
  endpoint: string,
  params: ListQueryParams = {},
) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [key, params],
    queryFn: () =>
      api.get<PaginatedResponse<T>>(endpoint, { params }).then((res) => res.data),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useDetailQuery<T>(
  key: string,
  endpoint: string,
  id: number | string | null,
) {
  return useQuery<T>({
    queryKey: [key, id],
    queryFn: () => 
      api.get<T>(`${endpoint}${id}/`).then((res) => res.data),
    enabled: !!id,
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useCreateMutation<TPayload, TResponse = any>(
  endpoint: string,
  invalidateKeys: string[],
) {
  const queryClient = useQueryClient()
  return useMutation<TResponse, Error, TPayload>({
    mutationFn: (payload) =>
      api.post<TResponse>(endpoint, payload).then((res) => res.data),
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      )
    },
  })
}

export function useUpdateMutation<TPayload, TResponse = any>(
  endpoint: string,
  invalidateKeys: string[],
) {
  const queryClient = useQueryClient()
  return useMutation<
    TResponse,
    Error,
    { id: number | string; payload: TPayload }
  >({
    mutationFn: ({ id, payload }) =>
      api.patch<TResponse>(`${endpoint}${id}/`, payload).then((res) => res.data),
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      )
    },
  })
}

// PUT mutation (full replacement) – used for updating user records including taught_subjects
export function usePutMutation<TPayload, TResponse = any>(
  endpoint: string,
  invalidateKeys: (string | (string | number)[])[],
) {
  const queryClient = useQueryClient()
  return useMutation<TResponse, Error, { id: number | string; payload: TPayload }>({
    mutationFn: ({ id, payload }) =>
      api.put<TResponse>(`${endpoint}${id}/`, payload).then((res) => res.data),
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: Array.isArray(key) ? key : [key],
          exact: false,
        })
      )
    },
  })
}

export function useDeleteMutation(endpoint: string, invalidateKeys: string[]) {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number | string>({
    mutationFn: (id) => api.delete(`${endpoint}${id}/`),
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      )
    },
  })
}

export function useSearchQuery<T>(
  key: string,
  endpoint: string,
  search: string,
  enabled: boolean = true,
) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [key, 'search', search],
    queryFn: () =>
      api.get<PaginatedResponse<T>>(endpoint, {
        params: { search, page_size: 20 },
      }).then((res) => res.data),
    enabled: enabled && search.length > 0,
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}