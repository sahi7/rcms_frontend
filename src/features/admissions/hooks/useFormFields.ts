import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api'
import { useUpdateMutation, useDeleteMutation } from '@/hooks/shared/useApiQuery'
import {
  FormField,
  FormFieldPayload,
  GroupedFormFields,
} from '@/types/admissions'

const KEY = 'form-fields'
const ENDPOINT = '/admissions/admin/form-fields/'

export function useFormFieldsGrouped() {
  return useQuery<GroupedFormFields>({
    queryKey: [KEY, 'grouped'],
    queryFn: () => uploadApi.get<GroupedFormFields>(ENDPOINT).then((r) => r.data),
    staleTime: 30 * 60 * 1000,
  })
}

export function useCreateFormField() {
  const qc = useQueryClient()
  return useMutation<FormField, Error, FormFieldPayload>({
    mutationFn: (payload) =>
      uploadApi.post<FormField>(ENDPOINT, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useBulkCreateFormFields() {
  const qc = useQueryClient()
  return useMutation<FormField[], Error, FormFieldPayload[]>({
    mutationFn: (payload) =>
      uploadApi.post<FormField[]>(`${ENDPOINT}bulk/`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateFormField() {
  return useUpdateMutation<Partial<FormFieldPayload>, FormField>(ENDPOINT, [
    KEY,
  ], uploadApi)
}

export function useDeleteFormField() {
  return useDeleteMutation(ENDPOINT, [KEY], uploadApi)
}
