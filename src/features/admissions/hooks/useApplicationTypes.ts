import {
    useListQuery,
    useCreateMutation,
    useUpdateMutation,
    useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import { uploadApi } from '@/lib/api'
import { ApplicationType, ApplicationTypePayload } from '@/types/admissions'
import { AdPaginatedResponse } from '@/types/shared'

const KEY = 'application-types'
const ENDPOINT = '/admissions/admin/application-types/'

export function useApplicationTypesList() {
    return useListQuery<
        ApplicationType,
        AdPaginatedResponse<ApplicationType>
    >(KEY, ENDPOINT, {}, uploadApi)
}

export function useCreateApplicationType() {
    return useCreateMutation<ApplicationTypePayload, ApplicationType>(
        ENDPOINT,
        [KEY,],
        uploadApi,
    )
}

export function useUpdateApplicationType() {
    return useUpdateMutation<Partial<ApplicationTypePayload>, ApplicationType>(
        ENDPOINT,
        [KEY],
        uploadApi,
    )
}

export function useDeleteApplicationType() {
    return useDeleteMutation(ENDPOINT, [KEY],uploadApi)
}
