// src/features/students/hooks/useStudentElectives.ts
import {
  useDetailQuery,
  useCreateMutation,
  useListQuery,
} from '@/hooks/shared/useApiQuery'
import { useCurriculumSubjects } from '../../curriculum/hooks/useCurriculumSubjects'
import { useTerms } from '@/features/academic/hooks/terms'
import { Subject } from '@/types/academic'

export function useStudentElectives(
  studentId: string,
  currentClass?: number,
  department?: number
) {
  const { data: electivesData, isLoading: isLoadingElectives } = useDetailQuery<{
    subject_ids: number[]
  }>(
    'student-electives',
    `/students/${studentId}/electives/`,
    null
  )

  const { data: curriculumSubjectsData } = useCurriculumSubjects({
    classroom: currentClass,
    department,
  })

  const { data: allSubjectsData } = useListQuery<Subject>(
    'subjects',
    '/subjects/'
  )

  const { data: termsData } = useTerms()

  const saveElectivesMutation = useCreateMutation<
    { subject_ids: number[]; term: number | null },
    any
  >(
    `/students/${studentId}/electives/`,
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