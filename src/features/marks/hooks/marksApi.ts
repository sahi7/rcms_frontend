import api from '@/lib/api'
import type {
  MarkUploadResponse,
  MarkPreviewResponse,
  MarkUpdatePayload,
  UploadScope,
  UploadStatusResponse,
  StudentReportResponse,
} from '@/types/marks'

export const marksApi = {
  /** POST /marks/upload/ — upload marks via file */
  upload: async (formData: FormData): Promise<MarkUploadResponse> => {
    const res = await api.post<MarkUploadResponse>('/marks/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  /** GET /marks/upload-scope/ — what the current user is allowed to upload */
  getUploadScope: async (): Promise<UploadScope> => {
    const res = await api.get<UploadScope>('/marks/upload-scope/')
    return res.data
  },

  /** GET /marks/preview/ — cursor-paginated mark preview */
  getPreview: async (params: {
    group_key: string
    term_id: string | number
    limit?: number
    cursor?: string
    search?: string
  }): Promise<MarkPreviewResponse> => {
    const res = await api.get<MarkPreviewResponse>('/marks/preview/', {
      params,
    })
    return res.data
  },

  /** PATCH /marks/update/ — batch update marks */
  updateMarks: async (payload: MarkUpdatePayload) => {
    const res = await api.patch('/marks/update/', payload)
    return res.data
  },

  /** GET /subjects/upload-status/ — cursor-paginated upload progress */
  getUploadStatus: async (params: {
    term?: string
    department?: string
    teacher?: string
    subject?: string
    class?: string
    sequence?: string
    cursor?: number
  }): Promise<UploadStatusResponse> => {
    const res = await api.get<UploadStatusResponse>(
      '/subjects/upload-status/',
      { params },
    )
    return res.data
  },

  /** GET /students/:id/marks/ — student performance report */
  getStudentMarks: async (
    studentId: string,
    params: { term_id?: string; sequence_id?: string },
  ): Promise<StudentReportResponse> => {
    const res = await api.get<StudentReportResponse>(
      `/students/${studentId}/marks/`,
      { params },
    )
    return res.data
  },
}
