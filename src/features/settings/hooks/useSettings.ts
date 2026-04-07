import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { BrandingSettings, BrandingSettingsPayload } from '@/types/settings'

const THIRTY_MINUTES = 30 * 60 * 1000

export function useBrandingSettings() {
  return useQuery<BrandingSettings>({
    queryKey: ['branding-settings'],
    queryFn: () =>
      api.get<BrandingSettings>('/settings/').then((res) => res.data),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useUpdateBrandingSettings() {
  const queryClient = useQueryClient()
  return useMutation<BrandingSettings, Error, BrandingSettingsPayload>({
    mutationFn: (payload) =>
      api
        .patch<BrandingSettings>('/settings/', payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding-settings'] })
    },
  })
}
