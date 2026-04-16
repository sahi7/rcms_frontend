// src/features/academic/hooks/studyLevels.ts
import api from '@/lib/api';
import { StudyLevel } from '@/types/academic';
import { AdPaginatedResponse } from '@/types/shared';
import { useListQuery, useCreateMutation, useUpdateMutation } from '@/hooks/shared/useApiQuery';

export const studyLevelsApi = {
  getAll: async (search = '', page = 1, pageSize = 20) => {
    const response = await api.get<AdPaginatedResponse<StudyLevel>>('/study-levels/', {
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

export function useStudyLevels() {
  return useListQuery<StudyLevel>('study-levels', '/study-levels/');
}

export function useCreateStudyLevel() {
  return useCreateMutation<Partial<StudyLevel>, StudyLevel>(
    '/study-levels/',
    ['study-levels']
  );
}

export function useUpdateStudyLevel() {
  return useUpdateMutation<Partial<StudyLevel>, StudyLevel>(
    '/study-levels/',
    ['study-levels']
  );
}

// Delete does not match any provided hook from '@/hooks/shared/useApiQuery',
// so we call the api directly (no automatic invalidation – handle it in your component if needed)
export async function deleteStudyLevel(id: string) {
  await api.delete(`/study-levels/${id}/`);
}