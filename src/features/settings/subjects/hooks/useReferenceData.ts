// src/features/settings/subjects/hooks/useReferenceData.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface RefData {
  departments: { id: number; name: string; code: string; class_rooms: number[] }[];
  classrooms: { id: number; name: string }[];
  academic_years: { id: string; name: string; is_current: boolean }[];
  teachers: { id: number; full_name: string; email: string }[];
  terms: Array<{
    id: number;
    term_number: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
  }>;
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