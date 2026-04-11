import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { User } from '@/types/shared'
import { useAuthStore } from '@/app/store/authStore'

const THIRTY_MINUTES = 30 * 60 * 1000

export function useProfile() {
  const userId = useAuthStore((s) => s?.user?.id)

  return useQuery<User>({
    queryKey: ['profile', userId],
    queryFn: () => api.get<User>(`/users/${userId}/`).then((res) => res.data),
    enabled: !!userId,
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export type ProfilePayload = Partial<
  Pick<
    User,
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'role'
    | 'phone_number'
    | 'place_of_birth'
    | 'profile_picture'
    | 'date_of_birth'
    | 'initials'
    | 'emergency_guardian_name'
    | 'emergency_guardian_email'  
    | 'emergency_guardian_phone'      
    | 'emergency_guardian_address'  
    | 'relationship_to_guardian'         
  >
>

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s?.user?.id)

  return useMutation<User, Error, ProfilePayload>({
    mutationFn: (payload) =>
      api.put<User>(`/users/${userId}/`, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
