export interface GenerateReportPayload {
  class_id: number
  department_id?: number
}

export interface GenerateReportResponse {
  report_id: number
  download_url: string
  message: string
}

export interface GeneratedReport {
  id: number
  created_at: string
  download_url: string
  num_students: number
  term_id: number
  class_room_id: number
  department_id: number | null
  created_by_id: number
}

export interface GeneratedReportsResponse {
  next_cursor: number | null
  results: GeneratedReport[]
}
