// src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";

// Use the same style you originally had to avoid TS error
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const UPSTREAM_SERVER = (import.meta as any).env?.VITE_UPSTREAM_SERVER || 'http://127.0.0.1:3000/api';

// console.log('🔥 API_BASE_URL =', API_BASE_URL);
// console.log('🔥 UPSTREAM_SERVER (should be 3000) =', UPSTREAM_SERVER);

// Main API (Django backend - port 8000)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Upload API (should hit port 3000)
export const uploadApi = axios.create({
  baseURL: UPSTREAM_SERVER,          // ← THIS MUST BE THE UPSTREAM VARIABLE
  withCredentials: true,
});

// Apply interceptors to both
const applyInterceptors = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post("/auth/refresh/", {}, {
            withCredentials: true,
            baseURL: API_BASE_URL,
          });
          const newToken = (res.data as any).access;
          Cookies.set("access_token", newToken);
          return instance(error.config);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
        }
      }
      return Promise.reject(error);
    }
  );
};

applyInterceptors(api);
applyInterceptors(uploadApi);

export default api;