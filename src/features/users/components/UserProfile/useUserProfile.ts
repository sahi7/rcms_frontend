// src/features/users/components/UserProfile/useUserProfile.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore"; // ← your existing store

interface TeacherScopeResponse {
  teacher: { id: string; full_name: string; username: string };
  scope: Record<string, any>;
  summary: any;
}

export function useUserProfile() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuthStore(); // ← get from your store

  // Use the user directly — no extra request!
  const me = user
    ? {
        id: user.id,
        email: user.email,
        firstname: user.first_name || user.first_name || "",
        lastname: user.last_name || user.last_name || "",
        phone: user.phone_number || null,
        role: user.role,
      }
    : null;

  // Only fetch teacher scope if user is teacher
  const scopeQuery = useQuery<TeacherScopeResponse | null>({
    queryKey: ["teacher-scope", me?.id],
    queryFn: async () => {
      const res = await api.get(`/teacher-scope/${me!.id}/`);
      return res.data as TeacherScopeResponse;
    },
    enabled: !!me && me.role === "teacher",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phone?: string | null;
    }) => {
      if (!me?.id) throw new Error("User ID not available");
      await api.patch(`/users/${me.id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-scope", me?.id] });
      // Optionally update auth store if you want instant UI update
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  return {
    me,
    scope: scopeQuery.data ?? null,
    loadingMe: authLoading || !me,
    loadingScope: scopeQuery.isLoading,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}