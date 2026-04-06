// src/types/curriculum.ts 
// Base interface with all fields
export interface SubjectBase {
  id: number
  name: string
  code: string
  credit_value: number
  max_score: number
  departments: number[]
}

// Re-export as original names for backward compatibility
export type Subject = SubjectBase
export type SubjectPayload = Omit<SubjectBase, 'id' | 'departments'>

// Curriculum
export interface CurriculumSubjectBase {
  id: number
  department: number
  subjects: number[],
  subject_role: number
  class_room: number
}

export interface CurriculumSubjectListItem {
  id: number
  department: number
  subject: number 
  subject_role: number
  class_room: number
}

export type CurriculumSubject = CurriculumSubjectBase
export type CurriculumSubjectPayload = Omit<CurriculumSubjectBase, 'id'>

// Subject Assignment
export interface SubjectAssignmentBase {
  id: number
  subject: number
  teacher: number
  department: number | null
  academic_year: string
  class_rooms: number[]
}

export type SubjectAssignment = SubjectAssignmentBase
export type SubjectAssignmentPayload = Omit<SubjectAssignmentBase, 'id'>

// Class Assignment
export interface ClassAssignmentBase {
  id: number
  subjects: number[]
  teacher: number
  academic_year: string
  class_room: number
}

export type ClassAssignment = ClassAssignmentBase
export type ClassAssignmentPayload = Omit<ClassAssignmentBase, 'id'>