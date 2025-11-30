// src/features/users/hooks/useReferenceData.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useReferenceData = () => {
  return {
    departments: useQuery({
      queryKey: ["departments"],
      queryFn: () => api.get("/departments/").then((r) => r.data),
    }),
    classrooms: useQuery({
      queryKey: ["classrooms"],
      queryFn: () => api.get("/classrooms/").then((r) => r.data),
    }),
    academicYears: useQuery({
      queryKey: ["academic-years"],
      queryFn: () => api.get("/academic-years/").then((r) => r.data),
    }),
  };
};