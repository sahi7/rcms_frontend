import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { InstitutionData, InstitutionPayload } from '@/types/settings'
import { usePreferences } from '@/features/settings/hooks/usePreferences'


const THIRTY_MINUTES = 30 * 60 * 1000

export function useInstitution() {
  return useQuery<InstitutionData>({
    queryKey: ['institution'],
    queryFn: () =>
      api.get<InstitutionData>('/institution/').then((res) => res.data),
    staleTime: THIRTY_MINUTES,
    gcTime: THIRTY_MINUTES,
  })
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient()
  return useMutation<InstitutionData, Error, InstitutionPayload>({
    mutationFn: (payload) =>
      api
        .patch<InstitutionData>('/institution/', payload)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution'] })
    },
  })
}

export function useIsUni() {
  const { data: userInst } = useInstitution();
  return userInst?.institution_type === 'university';
}

export function useIsSubjectConfig() {
  const { data: prefs } = usePreferences();
  return prefs?.student_grouping === 'teacher_course';
}
