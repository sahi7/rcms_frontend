// ── Admission Cycles ──
export interface AdmissionCycle {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  is_admissions_closed: boolean
  admissions_closed_at: string | null
  migration_completed_at: string | null
}

export interface AdmissionCyclePayload {
  name: string
  start_date: string
  end_date: string
  is_current?: boolean
}

export interface ClosureStatus {
  is_admissions_closed: boolean
  admissions_closed_at: string | null
  end_date: string
}

export interface MigrationStatus {
  migration_completed: boolean
  migration_completed_at: string | null
  total_approved: number
  migrated: number
  failed: number
}

// ── Application Types ──
export interface ApplicationType {
  id: string
  name: string
  description: string
}

export interface ApplicationTypePayload {
  name: string
  description: string
}

// ── Study Programs ──
export interface StudyProgram {
  id: number
  class_room_id: number
  faculty_id?: number
  department_id?: number
  program_id?: number
  level_id?: number
  is_active: boolean
}

export interface StudyProgramPayload {
  class_room_id: number
  faculty_id?: number
  department_id?: number
  program_id?: number
  level_id?: number
  is_active?: boolean
}

// ── Form Fields ──
export type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'FILE'
  | 'IMAGE'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'TEXTAREA'

export interface FieldOption {
  value: string
  label: string
}

export interface FieldConfig {
  max_length?: number
  min_length?: number
  pattern?: string
  rich_text?: boolean
  allow_images?: boolean
  allow_formatting?: boolean
  min?: number
  max?: number
  step?: number
  min_date?: string
  max_date?: string
  allowed_extensions?: string[]
  max_size_mb?: number
  max_width?: number
  max_height?: number
  options?: FieldOption[]
}

export interface FormField {
  id: number
  application_type_id: string
  name: string
  label: string
  field_type: FieldType
  is_required: boolean
  order: number
  config: FieldConfig
  detail: string
}

export interface FormFieldPayload {
  application_type_id: string
  name: string
  label: string
  field_type: FieldType
  is_required: boolean
  order: number
  config: FieldConfig
  detail: string
}

export type GroupedFormFields = Record<string, FormField[]>

// ── Applicants ──
export type ApplicantStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITLISTED'

export interface Applicant {
  id: string
  full_name: string
  email: string
  phone: string
  notes: string
  application_id: string
  applicant_id: string
  status: ApplicantStatus
  admission_cycle_id: string
  application_type_id: string
  study_program_id: string
  gender: string
  nationality: string
  date_of_birth: string
  created_at: string
  submitted_at: string
  custom_fields: Record<string, string>
  address: string
  preferred_language: string
  place_of_birth: string
  country_of_birth: string
  emergency_guardian_name: string
  emergency_guardian_email: string
  emergency_guardian_address: string
  emergency_guardian_phone: string
  relationship_to_guardian: string
  decision_at: string | null
}

export interface ApplicantSearchParams {
  q?: string
  id?: string
  page?: number
  limit?: number
  status?: ApplicantStatus
  admission_cycle_id?: string
  application_type_id?: string
  study_program_id?: string
  gender?: string
  nationality?: string
}

export interface StatusUpdatePayload {
  status: ApplicantStatus
  notes?: string
}

export interface BulkStatusUpdatePayload {
  application_ids: string[]
  status: ApplicantStatus
  notes?: string
}

export interface EducationalHistory {
  school_name: string
  location: string
  from_year: string
  to_year: string
  certificate_obtained: string
  certificate_url: string
}
