// src/app/store/authStore.ts

import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  role: "principal" | "teacher" | "parent" | "student";
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export const useAuthStore = create<{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as true — App.tsx will set it to false

  login: async (username: string, password: string) => {
    try {
      const res = await api.post<LoginResponse>("/auth/login/", {
        username,
        password,
      });

      const { access, refresh } = res.data;
      Cookies.set("access_token", access, { expires: 7 });
      // Cookies.set("refresh_token", refresh, { expires: 7 });

      // Fetch user after login
      const meRes = await api.get<User>("/auth/me/");
      set({
        user: meRes.data,
        isAuthenticated: true,
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
    set({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/";
  },

  fetchMe: async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await api.get<User>("/auth/me/");
      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.warn("Invalid token – logging out");
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));