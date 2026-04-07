// src/types/settings.ts
// Branding / Settings
export interface BrandingSettings {
  logo: string | null
  logo_dark: string | null
  school_name: string
  short_name: string
  motto: string
  address: string
  phone: string
  phone2: string
  email: string
  website: string
  primary_color: string
  primary_dark: string
  accent_color: string
  report_card_header_color: string
  report_card_border_color: string
  grade_a_color: string
  grade_f_color: string
  pdf_footer_text: string
  created_at: string
  updated_at: string
  updated_by: number | null
}

export type BrandingSettingsPayload = Partial<
  Omit<BrandingSettings, 'created_at' | 'updated_at' | 'updated_by'>
>

// Institution
export interface InstitutionData {
  institution_type: string
  code: string
  identifier: string
  max_score_default: string
  passing_score: string
  subject_rotation: string
  is_email_verified: boolean
  is_active: boolean
}

export type InstitutionPayload = Partial<
  Pick<
    InstitutionData,
    | 'institution_type'
    | 'code'
    | 'identifier'
    | 'max_score_default'
    | 'passing_score'
    | 'subject_rotation'
  >
>

// Preferences
export interface GradeRange {
  [grade: string]: [number, number]
}

export interface GpaRanges {
  [grade: string]: number
}

export interface ResitPreferences {
  price_per_unit: number
  resit_max_score: number
  is_resit_payable: boolean
  cutoff_resit_score: number
  balance_resit_score: boolean
  cutoff_by_core_subject: boolean
  allow_resit_without_payment: boolean
}

export interface IdFormatTemplates {
  student: string
  teacher: string
  [key: string]: string
}

export interface PreferencesData {
  academic_period: string
  subject_naming: string
  student_grouping: string
  instructor_title: string
  evaluation_type: string
  grading_scheme: string
  grade_ranges: GradeRange
  class_progression_name: string
  gpa_ranges: GpaRanges
  credit_handling: string
  year_identifier: string
  student_identifier: string
  teacher_identifier: string
  staff_identifier: string
  document_identifier: string
  id_format_templates: IdFormatTemplates
  resit_process: string
  resit_preferences: ResitPreferences
}

export type PreferencesPayload = Partial<PreferencesData>

// Subscription
export interface SubscriptionInfo {
  plan_code: string | null
  plan_price: string | null
  end_date: string | null
  is_active: boolean
}

export interface SubscriptionFeature {
  code: string
  name: string
  type: string
  additional_price: string
}

export interface SubscriptionResponse {
  subscription: SubscriptionInfo
  features: SubscriptionFeature[]
}

export interface SubscriptionUpdatePayload {
  plan_code: string
}

export interface SubscriptionUpdateResponse {
  message: string
  plan: string
  end_date: string
  features: string[]
}

// Plans (for UI display)
export interface PlanOption {
  code: string
  name: string
  price: string
  features: string[]
  recommended?: boolean
}
