// src/features/reports/hooks/useReportStatus.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { StatusResponse } from "../types";

export const useReportStatus = (jobId: string | null) => {
  return useQuery<StatusResponse, Error>({
    queryKey: ["report-status", jobId],
    queryFn: async (): Promise<StatusResponse> => {
      if (!jobId) throw new Error("No job ID");
      const response = await api.get(`/reports/status/${jobId}/`);
      return response.data as StatusResponse;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // query.data is the latest fetched data
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false; // Stop polling
      }
      return 3000; // Continue polling every 3 seconds
    },
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: 0, // Always consider fresh for real-time progress
  });
};