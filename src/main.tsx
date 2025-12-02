import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App.tsx";
import SettingsPage from "@/features/settings/SettingsPage";
import UsersPage from "@/features/users/UsersPage";
import StudentsPage from "@/features/students/StudentsPage";
import ChangePasswordPage from "@/features/auth/ChangePasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import UserProfilePage from "@/features/users/components/UserProfile/UserProfilePage";
import SubjectsAssignmentsManager from "@/features/settings/components/SubjectsAssignmentsManager";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes — always accessible, even when logged out */}
          {/* <Route path="/" element={<LoginPage />} /> */}
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Everything else stays exactly as you had it */}
          <Route path="/" element={<App />}>
            {/* your existing routes */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/subjects" element={<SubjectsAssignmentsManager />} />
            <Route path="/settings/profile" element={<UserProfilePage />} />
            {/* other routes */}
          </Route>
        </Routes>

        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);