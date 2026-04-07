import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { PreferencesData, PreferencesPayload } from '@/types/settings'
import { useInstitutionConfigStore } from '@/app/store/institutionConfigStore'

const THIRTY_MINUTES = 30 * 60 * 1000

export function usePreferences() {
  return useQuery<PreferencesData>({
    queryKey: ['preferences'],
    queryFn: () =>
      api.get<PreferencesData>('/preferences/').then((res) => res.data),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const clearConfig = useInstitutionConfigStore((s) => s.clearConfig)

  return useMutation<PreferencesData, Error, PreferencesPayload>({
    mutationFn: (payload) =>
      api
        .patch<PreferencesData>('/preferences/', payload)
        .then((res) => res.data),
    onSuccess: () => {
      clearConfig()
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
      queryClient.invalidateQueries({ queryKey: ['institution-config'] })
    },
  })
}
