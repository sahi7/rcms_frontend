// src/features/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface User {
  id: string | number;
  email?: string;
  first_name: string;
  last_name: string;
  initials?: string;
  role: string;
  date_joined?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  phone_number?: string;
  enrollment_status?: string;
  emergency_contact?: string;
  department?: { name: string } | null;
  registration_number?: string;
  department_name?: string;
  class_name?: string;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface UsersResponse {
  data: User[];
  pagination: Pagination;
}

interface UseUsersParams {
  role?: "teacher" | "student" | "parent" | null;
  search?: string;
  page?: number;
  pageSize?: number;
  department?: string;
  classId?: string;
  academicYear?: string;
}

export const useUsers = ({
  role,
  search = "",
  page = 1,
  pageSize = 20,
  department = "",
  classId = "",
  academicYear = "",
}: UseUsersParams) => {
  const queryClient = useQueryClient();

  const queryKey = [
    "users",
    role ?? "all",
    search,
    page,
    pageSize,
    department,
    classId,
    academicYear,
  ];

  const query = useQuery<UsersResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ordering: "-date_joined",
      });

      if (role && ["teacher", "student", "parent"].includes(role)) {
        params.append("type", role);
      }
      if (search) params.append("search", search);
      if (department) params.append("department", department);
      if (classId) params.append("class", classId);
      if (academicYear) params.append("academic_year", academicYear);

      const endpoint = role === "student" ? "/students/" : "/users/";
      const res = await api.get(`${endpoint}?${params.toString()}`);
      return res.data as UsersResponse;
    },
    placeholderData: (prev) => prev ?? undefined,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (user: any) => {
      const endpoint = user.role === "student"
        ? `/students/${user.id}/`
        : `/users/${user.id}/`;

      await api.delete(endpoint);
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  return {
    ...query,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};