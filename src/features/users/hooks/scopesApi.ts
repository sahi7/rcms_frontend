import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RoleScope, RoleScopePayload } from '@/types/scopes'

const THIRTY_MINUTES = 30 * 60 * 1000

export const scopesApi = {
  getAll: async (params?: Record<string, any>) => {
    const res = await api.get<{ results: RoleScope[]; next_cursor?: number }>(
      '/scopes/',
      { params },
    )
    return res.data
  },
  create: async (data: RoleScopePayload) => {
    const res = await api.post<RoleScope>('/scopes/', data)
    return res.data
  },
  delete: async (id: number | string) => {
    await api.delete(`/scopes/${id}/`)
  },
}

export function useScopes(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['scopes', params],
    queryFn: () => scopesApi.getAll(params),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useCreateScope() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RoleScopePayload) => scopesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scopes'] })
    },
  })
}

export function useDeleteScope() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => scopesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scopes'] })
    },
  })
}
