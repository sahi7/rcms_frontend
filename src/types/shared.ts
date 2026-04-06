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
}

export interface ListQueryParams {
  page?: number
  page_size?: number
  search?: string
  [key: string]: any
}