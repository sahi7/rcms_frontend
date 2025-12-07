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
    refetchInterval: jobId ? 3000 : false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};