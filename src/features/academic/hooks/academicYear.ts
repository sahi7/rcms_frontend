// src/features/academic/api/academicYearsApi.ts
import api from "@/lib/api";
import { AcademicYear, PaginatedResponse } from '@/types/academic';

export const academicYearsApi = {
  getAll: async (search = '', page = 1, pageSize = 20) => {
    const response = await api.get<PaginatedResponse<AcademicYear>>('/academic-years/', {
      params: {
        search,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  create: async (data: Partial<AcademicYear>) => {
    const response = await api.post<AcademicYear>('/academic-years/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<AcademicYear>) => {
    const response = await api.patch<AcademicYear>(`/academic-years/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/academic-years/${id}/`);
  },

  /** PATCH is_current: true */
  setAsCurrent: async (id: string) => {
    const response = await api.post(`/academic-years/${id}/set-current/`);
    return response.data;
  },

};