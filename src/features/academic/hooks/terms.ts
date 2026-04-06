// src/features/academic/hooks/terms.ts
import api from "@/lib/api";
import { Term, PaginatedResponse } from '@/types/academic';
import { useListQuery } from '@/hooks/shared/useApiQuery'

export const termsApi = {
  getAll: async (search = '', page = 1, pageSize = 20, academicYearId = '') => {
    const params: Record<string, any> = {
      search,
      page,
      page_size: pageSize,
    };
    if (academicYearId) params.academic_year = academicYearId;

    const response = await api.get<PaginatedResponse<Term>>('/terms/', { params });
    return response.data;
  },

  create: async (data: Partial<Term>) => {
    const response = await api.post<Term>('/terms/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Term>) => {
    const response = await api.patch<Term>(`/terms/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/terms/${id}/`);
  },

  setAsCurrent: async (id: string) => {
    const response = await api.post(`/terms/${id}/set-current/`);
    return response.data;
  },
};

export function useTermsList() {
  return useListQuery<Term>(['terms'], '/terms/')
}