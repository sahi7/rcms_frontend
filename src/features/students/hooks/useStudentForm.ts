// src/features/students/hooks/useStudentForm.ts
import {
  useDetailQuery,
  useCreateMutation,
  useUpdateMutation,
} from '@/hooks/shared/useApiQuery'
import { Student } from '@/types/academic'
import { useClassRooms } from '../../structure/hooks/useClassRooms'
import { useDepartments } from '../../structure/hooks/useDepartments'

const KEY = 'students'
const CREATE_ENDPOINT = '/students/create/'
const UPDATE_ENDPOINT = '/students/create/' // same endpoint as per your original logic

export function useStudentForm(studentId?: string) {
  const isEditing = !!studentId

  // Fetch existing student when editing
  const { data: existingStudent, isLoading: isLoadingStudent } = useDetailQuery<Student>(
    'student',
    `/students/${studentId}/`,
    null
  )

  // Classrooms and departments for dropdowns (reusing your existing hooks)
  const { data: classroomsData } = useClassRooms()
  const { data: departmentsData } = useDepartments()

  // Create mutation
  const createMutation = useCreateMutation<any, Student>(
    CREATE_ENDPOINT,
    [KEY]
  )

  // Update mutation – uses same endpoint with { update: 'True' } flag
  const updateMutation = useUpdateMutation<
    any,
    Student
  >(
    UPDATE_ENDPOINT,
    [KEY, `student-${studentId}`]
  )

  return {
    existingStudent,
    isLoadingStudent,
    createMutation,
    updateMutation,
    isEditing,
    classroomsData,
    departmentsData,
  }
}