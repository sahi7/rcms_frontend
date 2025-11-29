// src/features/settings/subjects/hooks/useSubjects.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Subject {
  id: number;
  name: string;
  code: string;
  coefficient: string;
  max_score: string;
  departments: number[];
}

export const useSubjects = () => {
  return useQuery<Subject[], Error>({
    queryKey: ["subjects"],
    queryFn: async () => {
      const res = await api.get<Subject[]>("/subjects/");
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Subject>) => {
      const res = await api.post<Subject>("/subjects/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create subject");
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Subject> }) => {
      const res = await api.patch<Subject>(`/subjects/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update subject");
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/subjects/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject deleted");
    },
    onError: () => {
      toast.error("Cannot delete subject with assignments");
    },
  });
};