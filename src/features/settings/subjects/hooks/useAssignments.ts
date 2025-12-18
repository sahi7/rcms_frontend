// src/features/settings/subjects/hooks/useAssignments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Assignment {
  id: number;
  subject: string;        // name, not ID (as per your API)
  teacher: string;        // full name
  department: number;     // department ID
  academic_year: string;  // e.g. "2025/2026"
  class_rooms: number[];  // array of classroom IDs
}

export const useAssignments = () => {
  return useQuery<Assignment[], Error>({
    queryKey: ["subject-assignments"],
    queryFn: async () => {
      const res = await api.get<Assignment[]>("/subject-assignments/");
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Assignment, "id">) => {
      const res = await api.post<Assignment>("/subject-assignments/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-assignments"] });
      toast.success("Teacher assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["marks","upload-scope"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to assign teacher");
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Assignment> }) => {
      const res = await api.patch<Assignment>(`/subject-assignments/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-assignments"] });
      toast.success("Assignment updated");
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/subject-assignments/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-assignments"] });
      toast.success("Assignment removed");
    },
  });
};