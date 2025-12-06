// src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Request interceptor — no explicit types needed (inferred safely)
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — clean, no types
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;