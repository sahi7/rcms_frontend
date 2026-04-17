import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import {
  AdmissionCycle,
  AdmissionCyclePayload,
  ClosureStatus,
  MigrationStatus,
} from '@/types/admissions'
import { AdPaginatedResponse } from '@/types/shared'

const KEY = 'admission-cycles'
const ENDPOINT = '/admissions/admin/cycles/'

export function useCyclesList() {
  return useListQuery<AdmissionCycle, AdPaginatedResponse<AdmissionCycle>>(KEY, ENDPOINT, {}, uploadApi)
}

export function useCreateCycle() {
  return useCreateMutation<AdmissionCyclePayload, AdmissionCycle>(ENDPOINT, [
    KEY,
  ], uploadApi)
}

export function useUpdateCycle() {
  return useUpdateMutation<Partial<AdmissionCyclePayload>, AdmissionCycle>(
    ENDPOINT,
    [KEY],
    uploadApi,
  )
}

export function useDeleteCycle() {
  return useDeleteMutation(ENDPOINT, [KEY], uploadApi)
}

export function useSetCurrentCycle() {
  const qc = useQueryClient()
  return useMutation<AdmissionCycle, Error, string>({
    mutationFn: (id) =>
      uploadApi
        .post<AdmissionCycle>(`${ENDPOINT}${id}/set-current/`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useClosureStatus(id: string | null, enabled = true) {
  return useQuery<ClosureStatus>({
    queryKey: ['cycle-closure-status', id],
    queryFn: () =>
      uploadApi
        .get<ClosureStatus>(`${ENDPOINT}${id}/closure-status/`)
        .then((r) => r.data),
    enabled: !!id && enabled,
    staleTime: 0,
  })
}

export function useCloseCycle() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      uploadApi.post(`${ENDPOINT}${id}/close/`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['cycle-closure-status'] })
    },
  })
}

export function useMigrateCycle() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      uploadApi.post(`${ENDPOINT}${id}/migrate-to-students/`).then(() => undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useMigrationStatus(id: string | null, poll: boolean) {
  return useQuery<MigrationStatus>({
    queryKey: ['cycle-migration-status', id],
    queryFn: () =>
      uploadApi
        .get<MigrationStatus>(`${ENDPOINT}${id}/migration-status/`)
        .then((r) => r.data),
    enabled: !!id && poll,
    refetchInterval: (query) => {
      const data = query.state.data as MigrationStatus | undefined
      if (data?.migration_completed) return false
      return 2000
    },
  })
}
