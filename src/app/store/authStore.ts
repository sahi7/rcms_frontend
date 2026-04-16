// src/app/store/authStore.ts

import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { toast } from "sonner";
import { clearStorage } from "@/lib/clearStorage";
import { queryClient } from "@/main";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  role: string;
  value: number
  permissions: string[];
  profile_picture: string

}

interface LoginResponse {
  access: string;
  refresh: string;
}

export const useAuthStore = create<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as true — App.tsx will set it to false
  permissions: [],

  login: async (username: string, password: string) => {
    try {
      const res = await api.post<LoginResponse>("/auth/login/", {
        username,
        password,
      });

      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      // const access = data.access;

      Cookies.remove("access_token");
      Cookies.set("access_token", data['access'], { expires: 7 });

      // Fetch user after login
      // ← NEW: Use TanStack Query (cached!)
      const userData = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => api.get<User>('/auth/me/').then((res) => res.data),
      });

      set({
        user: userData,
        isAuthenticated: true,
        permissions: userData.permissions || [],
        isLoading: false,
      });

      toast.success("Welcome back!");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Invalid username or password";
      toast.error(errorMessage);
      throw err;
    }
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    // set({ user: null, role: null, value: null, permissions: [], isAuthenticated: false, isLoading: false });
    set({ user: null, permissions: [], isAuthenticated: false, isLoading: false });
    clearStorage();
  },

  fetchMe: async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      // set({ user: null, role: null, value: null, permissions: [], isAuthenticated: false, isLoading: false });
      set({ user: null, permissions: [], isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const userData = await queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => api.get<User>('/auth/me/').then((res) => res.data),
        staleTime: 30 * 60 * 1000,
      });

      set({
        user: userData,
        isAuthenticated: true,
        permissions: userData.permissions || [],
        isLoading: false,
      });
    } catch (err) {
      console.warn("Invalid token – logging out");
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      // set({ user: null, role: null, value: null, permissions: [], isAuthenticated: false, isLoading: false });
      set({ user: null, permissions: [], isAuthenticated: false, isLoading: false });
    }
  },
}));