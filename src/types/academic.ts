// src/types/academic
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    page_size: number
    total_pages: number
    total_count: number
    has_next: boolean
    has_previous: boolean
  }
  search: {
    term: string
    has_results: boolean
  }
  filters: Record<string, any>
}

export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export interface Term {
  id: string
  academic_year: string
  academic_year_name: string
  term_number: number
  is_current: boolean
  is_results_published: boolean
  is_resit: boolean
  is_completed: boolean
  name: string
  start_date: string
  end_date: string
}

export interface StudyLevel {
  id: string
  name: string
  code: string
  duration_years: number
  is_active: boolean
}

export interface Sequence {
  id: string
  name: string
  code: string
  is_mandatory: boolean
  is_current: boolean
  max_score: number
  term: string
  is_resit: boolean
  is_results_published: boolean
}

export interface Student {
  id: string | number
  registration_number?: string
  first_name: string
  last_name: string
  email?: string
  current_class?: number
  department?: number
  phone_number?: string
  initials?: string
  date_of_birth?: string
  place_of_birth?: string
  nationality?: string
  preferred_language?: string
  enrollment_status?: string
  emergency_guardian_name?: string
  emergency_guardian_email?: string
  emergency_guardian_phone?: string
  emergency_guardian_address?: string
  relationship_to_guardian?: string
  created_at?: string
  updated_at?: string
}

export interface Subject {
  id: number
  name: string
  code: string
}