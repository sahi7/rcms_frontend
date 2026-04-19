// src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";

// Use the same style you originally had to avoid TS error
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL;
const UPSTREAM_SERVER = (import.meta as any).env?.VITE_UPSTREAM_SERVER;
const SPACE_API_SECRET = (import.meta as any).env?.VITE_SPACE_API_SECRET;
const SPACE_API_KEY = (import.meta as any).env?.VITE_SPACE_API_KEY;
const SPACE_SERVER = (import.meta as any).env?.VITE_SPACE_SERVER;

// console.log('🔥 API_BASE_URL =', API_BASE_URL);
// console.log('🔥 UPSTREAM_SERVER (should be 3000) =', UPSTREAM_SERVER);

// Main API (Django backend - port 8000)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Upload API (should hit port 3000)
export const uploadApi = axios.create({
  baseURL: UPSTREAM_SERVER,  
  withCredentials: true,
});

// Space API[](https://spaceship.dev/api) - sets X-Api-Secret and X-Api-Key from .env
export const spaceApi = axios.create({
  baseURL: SPACE_SERVER,
  headers: {
    'X-Api-Secret': SPACE_API_SECRET,
    'X-Api-Key': SPACE_API_KEY,
  },
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

// Helper to extract API error message (only for spaceApi)
