// src/features/marks/hooks/useMarks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import type { recentBatch, BatchDetail, MarksOverview, UploadScope } from "../types";

// Helper to safely get data (fixes "Object is of type 'unknown'")
const get = async <T>(url: string): Promise<T> => {
  const res = await api.get(url);
  return res.data as T;
};

const post = async <T>(url: string, data: FormData): Promise<T> => {
  const res = await api.post(url, data);
  return res.data as T;
};

export function useMarks() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isPrincipal = user?.role === "principal";

  const overviewQuery = useQuery<MarksOverview>({
    queryKey: ["marks", "overview"],
    queryFn: () => get<MarksOverview>("/marks/overview/"),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const recentQuery = useQuery<recentBatch[]>({
    queryKey: ["marks", "recent"],
    queryFn: async () => {
      const data = await get<{ recent_batches: recentBatch[] }>("/marks/recent/");
      return data.recent_batches;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const scopeQuery = useQuery<UploadScope>({
    queryKey: ["marks", "upload-scope"],
    queryFn: () => get<UploadScope>("/marks/upload-scope/"),
    staleTime: Infinity,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => post<{ group_key: string }>("/marks/upload/", formData),
    onSuccess: async (data) => {
      const groupKey = data.group_key;
      try {
        const batchRes = await get<BatchDetail>(`/marks/batch-det/${groupKey}/`);
        queryClient.setQueryData(["marks", "current-batch"], batchRes);
        toast.success("Marks uploaded – opening editor");
      } catch {
        toast.error("Failed to load marks for editing");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Upload failed");
    },
  });

  const currentBatchQuery = useQuery<BatchDetail | null>({
    queryKey: ["marks", "current-batch"],
    queryFn: () => null, // We won't fetch with this, just use cache
    enabled: false, // Don't automatically fetch
    initialData: null,
  });

  const setCurrentBatch = (batch: BatchDetail | null) => {
    queryClient.setQueryData(["marks", "current-batch"], batch);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ groupKey, updates }: { groupKey: string; updates: any[] }) => {
      await api.patch(`/marks/batch/${groupKey}/`, { marks: updates });
    },
    onSuccess: () => {
      toast.success("Changes saved");
      // queryClient.setQueryData(["marks", "current-batch"], null);
      // setCurrentBatch(null);
      queryClient.invalidateQueries({ queryKey: ["marks", "recent"] });
    },
    // onError: () => toast.error("Save failed"),
    onError: (error: any) => {
      // Extract error message from server response
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to save marks";
      toast.error(errorMessage);
    },
  });

  const currentBatch = currentBatchQuery.data as BatchDetail | null | undefined;

  return {
    overview: overviewQuery.data,
    recent: recentQuery.data ?? [],
    scope: scopeQuery.data,

    isLoadingOverview: overviewQuery.isLoading,
    isLoadingRecent: recentQuery.isLoading,
    isLoadingScope: scopeQuery.isLoading,

    isPrincipal,

    currentBatch,
    setCurrentBatch: setCurrentBatch,

    uploadMarks: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,

    saveBatch: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}