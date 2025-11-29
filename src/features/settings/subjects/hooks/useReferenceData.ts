// src/features/settings/subjects/hooks/useReferenceData.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface RefData {
  departments: { id: number; name: string }[];
  classrooms: { id: number; name: string }[];
  academic_years: { id: number; name: string }[];   // ← This key name must match your backend
  teachers: { id: number; full_name: string }[];
}

export const useReferenceData = () => {
  return useQuery<RefData>({
    queryKey: ["reference-data"],
    queryFn: async () => {
      const res = await api.get<RefData>("/settings/reference-data/");
      return res.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};