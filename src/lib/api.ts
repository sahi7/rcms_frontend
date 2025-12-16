// src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";

const SERVER_URL = 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
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

// Response interceptor — minimal refresh (no types needed)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const res = await axios.post("/auth/refresh/", {}, {
          withCredentials: true,
          baseURL: SERVER_URL,
        });
        const newToken = (res.data as any).access;
        Cookies.set("access_token", newToken);

        // Retry original request
        return api(error.config);
      } catch {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor — clean, no types
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       Cookies.remove("access_token");
//       Cookies.remove("refresh_token");
//       // window.location.href = "/";
//     }
//     return Promise.reject(error);
//   }
// );

export default api;