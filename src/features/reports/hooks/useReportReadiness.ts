// src/features/reports/hooks/useReportReadiness.ts
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { ReadinessResponse } from "../types";

export const useReportReadiness = () => {
  return useMutation<ReadinessResponse, Error, any>({
    mutationFn: async (payload: any) => {
      const response = await api.post("/reports/readiness/", payload);
      return response.data as ReadinessResponse;
    },
  });
};