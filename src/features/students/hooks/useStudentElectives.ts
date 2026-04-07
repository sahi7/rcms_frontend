// src/features/students/hooks/useStudentElectives.ts
import {
  useDetailQuery,
  useCreateMutation,
} from '@/hooks/shared/useApiQuery'
import { useCurriculumSubjects } from '../../curriculum/hooks/useCurriculumSubjects'
import { useSubjects } from '../../curriculum/hooks/useSubjects'
import { useTerms } from '@/features/academic/hooks/terms'

export function useStudentElectives(
  studentId: string,
  currentClass?: number,
  department?: number
) {
  const { data: electivesData, isLoading: isLoadingElectives } = useDetailQuery<{
    subject_ids: number[]
  }>(
    'student-electives',
    `/students/`,
    `${studentId}/electives`
  )

  const { data: curriculumSubjectsData } = useCurriculumSubjects({
    classroom: currentClass,
    department,
  })

  const { data: allSubjectsData } = useSubjects()

  const { data: termsData } = useTerms()

  const saveElectivesMutation = useCreateMutation<
    { electives: number[] },
    any
  >(
    `/students/`,
    ['student-electives']
  )

  return {
    electivesData,
    isLoadingElectives,
    curriculumSubjectsData,
    allSubjectsData,
    termsData,
    saveElectivesMutation,
  }
}