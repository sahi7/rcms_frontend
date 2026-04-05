// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/store/authStore";
import { DashboardLayout } from "@/app/layout/DashboardLayout";
import { DashboardOverview } from "@/app/layout/DashboardOverview";
// import { PlaceholderPage } from "@/pages/dashboard/PlaceholderPage";
import { AcademicYears } from "@/features/academic/pages/AcademicYears";


export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token && !isAuthenticated) {
      fetchMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchMe]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated users get the dashboard layout
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="academic-years" element={<AcademicYears />} />
        
        {/* <Route path="*" element={<PlaceholderPage />} /> */}
      </Route>

      {/* Fallback: any other protected route goes to dashboard */}
      <Route path="/*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}