// src/types/marks.ts

// Upload Scope
export interface UploadScopeAssignment {
  id: number
  subject_id: number
  department_id: number
  teacher_id: number
  class_rooms__id: number
}

export interface UploadScope {
  assignments: UploadScopeAssignment[]
  terms: { id: number }[]
  classes: { id: number }[]
  sequences: { id: number; max_score: number }[]
}

// Mark Upload
export interface MarkUploadPayload {
  assignment_id: number
  sequence_id: number
  class_id: number
  term_id: number
  is_resit: boolean
  file: File
}

export interface MarkUploadResponse {
  message: string
  group_key: string
  skipped_errors: number
}

// Mark Preview
export interface MarkPreviewSequenceMark {
  mark_id: number | string
  sequence_id: number
  sequence_code: string
  score: number | null
  comment: string | null
  grade: string | null
}

export interface MarkPreviewRow {
  registration_number: string
  subject_code: string
  sequences: MarkPreviewSequenceMark[]
}

export interface MarkPreviewSequenceInfo {
  id: number
  code: string
}

export interface MarkPreviewResponse {
  message: string
  next_cursor: string | null
  sequences: MarkPreviewSequenceInfo[]
  data: MarkPreviewRow[]
}

// Mark Update
export interface MarkChange {
  mark_id: number | string
  score?: number | null
  comment?: string
}

export interface MarkUpdatePayload {
  changes: MarkChange[]
}

// Upload Status
export interface UploadStatusItem {
  id: number
  subject__name: string
  teacher__last_name: string
  class_room__name: string
  is_resit: boolean
}

export interface UploadStatusResponse {
  next_cursor: number | null
  results: UploadStatusItem[]
}

// Student Report (Term mode)
export interface SequenceMark {
  seq_id: number
  max_score: number
  score: number | null
  comment: string | null
}

export interface SubjectReport {
  subject: string
  subject_code: string
  credit_value: number
  sequences_marks: SequenceMark[]
  final_mark: number
  grade: string
  total_marks: number
  passed: boolean
}

export interface StudentReportTermResponse {
  unset_subjects_found: boolean
  non_departmental: any[]
  student_core: number[]
  student_electives: number[]
  subjects: {
    core: SubjectReport[]
    elective: SubjectReport[]
  }
  overall: {
    gpa: number
    grade: string
    attempted_credits: number
    earned_credits: number
  }
  term: {
    id: string
    name: string
    max_score: number | null
  }
}

// Student Report (Sequence mode)
export interface SequenceSubjectReport {
  subject: string
  code: string
  score: number | null
  grade: string
  grade_point: number
  credit_value: number
  comment: string | null
}

export interface StudentReportSequenceResponse {
  unset_subjects_found: boolean
  non_departmental: any[]
  student_core: number[]
  student_electives: number[]
  subjects: SequenceSubjectReport[]
  overall: {
    gpa: number
    grade: string
  }
  sequence: {
    id: string
    name: string
    max_score: number
  }
}

export type StudentReportResponse =
  | StudentReportTermResponse
  | StudentReportSequenceResponse
