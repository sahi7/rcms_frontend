// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "sonner";

import App from "./App.tsx";

import { RequestDemoPage } from "./app/pages/RequestDemoPage.tsx";
import { ContactPage } from "./app/pages/ContactPage.tsx";
import { AboutPage } from "./app/pages/AboutPage.tsx";
import { PrivacyPage } from "./app/pages/PrivacyPage.tsx";
import { TermsPage } from "./app/pages/TermsPage.tsx";

import { LandingPage } from '@/features/landing/LandingPage';
import LoginPage from "@/features/auth/LoginPage.tsx";
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import EmailVerificationPage from '@/features/onboarding/EmailVerificationPage';
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import ChangePasswordPage from "@/features/auth/ChangePasswordPage";

import OnboardingWizard from "@/features/onboarding/OnboardingPage.tsx";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
export { queryClient };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />

          <Route path="/request-demo" element={<RequestDemoPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected routes — all go through App (which now only handles auth check) */}
          <Route path="/*" element={<App />} />
        </Routes>

        <Toaster position="top-center" richColors />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);