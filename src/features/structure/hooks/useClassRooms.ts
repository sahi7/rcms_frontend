// src/features/structure/hooks/useClassRooms.ts
import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import { ClassRoom, ClassRoomPayload } from '@/types/structure'

const KEY = 'classrooms'
const ENDPOINT = '/classrooms/'

export function useClassRooms(params: Record<string, any> = {}) {
  return useListQuery<ClassRoom>(KEY, ENDPOINT, params)
}

export function useCreateClassRoom() {
  return useCreateMutation<ClassRoomPayload, ClassRoom>(ENDPOINT, [KEY])
}

export function useUpdateClassRoom() {
  return useUpdateMutation<ClassRoomPayload, ClassRoom>(ENDPOINT, [KEY])
}

export function useDeleteClassRoom() {
  return useDeleteMutation(ENDPOINT, [KEY])
}
