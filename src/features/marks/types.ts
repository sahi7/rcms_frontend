// src/features/marks/types.ts

export type recentBatch = {
  id: string;
  group_key: string;
  subject_name: string;
  department: string;
  class_name: string;
  term: string;
  uploaded_by: string;
  uploaded_at: string | null;
  is_editable: boolean;
  time_left_hours: number | null;
};

export type StudentMark = {
  id: string;
  registration_number: string;
  full_name: string;
  score: number | null;
  comment?: string | null;
  grade?: string;
  is_below_half?: boolean;
};

export type BatchDetail = {
  id: string;
  batch: {
    group_key: string;
    subject: string;
    subject_code?: string;
    department: string;
    class_name: string;
    term: string;
    academic_year?: string;
    total_students: number;
    uploaded_at: string | null;
    can_edit: boolean;
    time_left_hours: number | null;
    max_score: number;
  };
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_count: number;
  };
  marks: StudentMark[];
};

export interface MarksOverview {
  total_expected: number;
  uploaded: number;
  percentage: number;
  term: number | string;
  academic_year: string;
}

export interface UploadScope {
  assignments: Array<{
    id: string;
    subject_name: string;
    subject_code: string;
    class_name: string;
    max_score: number;
  }>;
  terms: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string }>;
}