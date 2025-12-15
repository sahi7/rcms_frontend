// src/features/reports/types.ts
export interface ReadinessResponse {
  ready: boolean;
  total_students: number;
  students_with_complete_marks: number;
  class_average: number;
  missing_marks: Array<{
    student_id: number;
    registration_number: string;
    full_name: string;
    missing_subjects: string[];
    missing_count: number;
  }>;
  message: string;
}

export interface GenerateResponse {
  job_id: string;
  status: "queued";
  message: string;
  check_status_url: string;
}

export interface StatusResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_students: number,
  progress: string;
  percentage: number;
  download_url: string | null;
  message: string;
}