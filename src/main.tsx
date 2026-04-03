import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App.tsx";
import SettingsPage from "@/features/settings/SettingsPage";
import UsersPage from "@/features/users/UsersPage";
import MarksPage from "@/features/marks/MarksPage";
import StudentsPage from "@/features/students/StudentsPage";
import ChangePasswordPage from "@/features/auth/ChangePasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import UserProfilePage from "@/features/users/components/UserProfile/UserProfilePage";
import SubjectsAssignmentsManager from "@/features/settings/components/SubjectsAssignmentsManager";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import DownloadsPage from "@/features/reports/pages/DownloadsPage";
import LandingPage from "@/features/landing/LandingPage";
import LoginPage from "@/features/auth/LoginPage.tsx";
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
// import OnboardingWizard from "@/features/onboarding/OnboardingPage.tsx";
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/onboarding" element={<OnboardingWizard />} /> */}

          {/* Everything else stays exactly as you had it */}
          <Route path="/" element={<App />}>
            {/* your existing routes */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/subjects" element={<SubjectsAssignmentsManager />} />
            <Route path="/settings/profile" element={<UserProfilePage />} />
            <Route path="/marks" element={<MarksPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/downloads" element={<DownloadsPage />} />

            {/* other routes */}
          </Route>
        </Routes>

        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);