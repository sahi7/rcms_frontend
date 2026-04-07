import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  SubscriptionResponse,
  SubscriptionUpdatePayload,
  SubscriptionUpdateResponse,
} from '@/types/settings'

const THIRTY_MINUTES = 30 * 60 * 1000

export function useSubscription() {
  return useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: () =>
      api
        .get<SubscriptionResponse>('/subscription/')
        .then((res) => res.data),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation<
    SubscriptionUpdateResponse,
    Error,
    SubscriptionUpdatePayload
  >({
    mutationFn: (payload) =>
      api
        .post<SubscriptionUpdateResponse>('/subscription/update/', payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })
}
