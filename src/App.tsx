// src/App.tsx
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/store/authStore";
import LoginPage from "@/features/auth/LoginPage";
import DashboardLayout from "@/app/layout/DashboardLayout";

export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    
    if (token && !isAuthenticated) {
      console.log("Attempting fetchMe");
      fetchMe()
        .then(() => console.log("fetchMe success"))
        .catch((err) => console.error("fetchMe error:", err))
        .finally(() => {
          console.log("fetchMe completed, setting loading false");
          setIsLoading(false);
        });
    } else {
      console.log("Skipping fetchMe, setting loading false");
      setIsLoading(false);
    }
  }, []);

  // ← THIS IS THE KEY: NEVER unmount LoginPage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* LoginPage is NEVER unmounted — form state survives forever */}
      {!isAuthenticated && <LoginPage />}
      {isAuthenticated && <DashboardLayout />}
    </>
  );
}