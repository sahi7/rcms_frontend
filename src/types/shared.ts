// src/types/shared.ts
import { Department } from '@/types/structure'

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

export interface User {
  id: number
  first_name: string
  role: string
  department?: Department;
  last_name: string
  email: string
  username?: string
  
  // Basic info
  taught_subjects?: number[]
  phone_number?: string
  enrollment_status?: string
  place_of_birth?: string
  profile_picture?: string
  date_joined?: string
  value?: number
  date_of_birth?: string
  initials?: string
  
  // NEW fields from your code - all optional
  nationality?: string
  preferred_language?: string
  emergency_guardian_name?: string
  emergency_guardian_email?: string
  emergency_guardian_phone?: string
  emergency_guardian_address?: string
  relationship_to_guardian?: string
  subject_ids?: number[]  // For teachers' subjects
}

export interface ListQueryParams {
  page?: number
  page_size?: number
  search?: string
  [key: string]: any
}

// The following below id only for the Admisions feature. They have a different response structure
export interface AdPaginatedResponse<T> {
  items: T[]
  total: number
}

export interface SearchPaginatedResponse<T> {
  hits: T[]
  total: number
}

export interface ApiError {
  detail: string
}

export interface AsyncOperationResponse {
  operationId: string
}
