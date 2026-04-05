// src/features/academic/hooks/sequenceApi.ts
import api from '@/lib/api';
import { Sequence, PaginatedResponse } from '@/types/academic';

export const sequenceApi = {
  getAll: async (search = '', page = 1, pageSize = 20, term = '') => {
    const params: Record<string, any> = { search, page, page_size: pageSize };
    if (term) params.term = term;

    const response = await api.get<PaginatedResponse<Sequence>>('/sequence/', { params });
    return response.data;
  },

  create: async (data: Partial<Sequence>) => {
    const response = await api.post<Sequence>('/sequence/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Sequence>) => {
    const response = await api.patch<Sequence>(`/sequence/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/sequence/${id}/`);
  },

  setAsCurrent: async (id: string) => {
    const response = await api.post(`/sequences/${id}/set-current/`);
    return response.data;
  },
};