// src/features/academic/hooks/studyLevels.ts
import api from '@/lib/api';
import { StudyLevel, PaginatedResponse } from '@/types/academic';

export const studyLevelsApi = {
  getAll: async (search = '', page = 1, pageSize = 20) => {
    const response = await api.get<PaginatedResponse<StudyLevel>>('/study-levels/', {
      params: {
        search,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  },

  create: async (data: Partial<StudyLevel>) => {
    const response = await api.post<StudyLevel>('/study-levels/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<StudyLevel>) => {
    const response = await api.patch<StudyLevel>(`/study-levels/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/study-levels/${id}/`);
  },
};