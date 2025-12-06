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
  });

  const recentQuery = useQuery<recentBatch[]>({
    queryKey: ["marks", "recent"],
    queryFn: async () => {
      const data = await get<{ recent_batches: recentBatch[] }>("/marks/recent/");
      return data.recent_batches;
    },
  });

  const scopeQuery = useQuery<UploadScope>({
    queryKey: ["marks", "upload-scope"],
    queryFn: () => get<UploadScope>("/marks/upload-scope/"),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => post<{ group_key: string }>("/marks/upload/", formData),
    onSuccess: async (data) => {
      const groupKey = data.group_key;
      try {
        const batchData = await get<BatchDetail>(`/marks/batch-det/${groupKey}/`);
        queryClient.setQueryData(["marks", "current-batch"], batchData);
        toast.success("Marks uploaded – opening editor");
      } catch {
        toast.error("Failed to load marks for editing");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Upload failed");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ groupKey, updates }: { groupKey: string; updates: any[] }) => {
      await api.patch(`/marks/batch/${groupKey}/`, { marks: updates });
    },
    onSuccess: () => {
      toast.success("Changes saved");
      queryClient.setQueryData(["marks", "current-batch"], null);
      queryClient.invalidateQueries({ queryKey: ["marks", "recent"] });
    },
    onError: () => toast.error("Save failed"),
  });

  const currentBatch = queryClient.getQueryData<BatchDetail>(["marks", "current-batch"]);

  return {
    overview: overviewQuery.data,
    recent: recentQuery.data ?? [],
    scope: scopeQuery.data,

    isLoadingOverview: overviewQuery.isLoading,
    isLoadingRecent: recentQuery.isLoading,
    isLoadingScope: scopeQuery.isLoading,

    isPrincipal,

    currentBatch,
    setCurrentBatch: (batch: BatchDetail | null) =>
      queryClient.setQueryData(["marks", "current-batch"], batch),

    uploadMarks: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,

    saveBatch: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}