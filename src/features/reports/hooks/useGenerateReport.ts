// src/features/reports/hooks/useGenerateReport.ts
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { GenerateResponse } from "../types";

export const useGenerateReport = () => {
  return useMutation<GenerateResponse, Error, any>({
    mutationFn: async (payload: any) => {
      const response = await api.post("/reports/generate/", payload);
      return response.data as GenerateResponse;
    },
  });
};