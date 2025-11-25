// src/app/store/authStore.ts
import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "principal" | "teacher" | "parent" | "student";
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export const useAuthStore = create<{
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const res = await api.post<LoginResponse>("/auth/login/", {
        username,
        password,
      });

      Cookies.set("access_token", res.data.access, { expires: 7 });
      Cookies.set("refresh_token", res.data.refresh, { expires: 7 });

      const me = await api.get<User>("/auth/me/");
      set({ user: me.data, isAuthenticated: true });
      toast.success("Welcome back!");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Invalid username or password";
      toast.error(errorMessage);
      // ↓↓↓ MUST THROW TO PROPAGATE THE ERROR ↓↓↓
      throw err; // or throw new Error(errorMessage);
    }
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({ user: null, isAuthenticated: false });
    window.location.href = "/";
  },

  fetchMe: async () => {
    const res = await api.get<User>("/auth/me/");
    set({ user: res.data, isAuthenticated: true });
  },
}));