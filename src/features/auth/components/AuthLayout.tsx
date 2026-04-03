import React from 'react';
import { BrandingPanel } from '../../../components/branding/BrandingPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-white flex-col lg:flex-row">
      {/* Left Column - Branding */}
      <div className="w-full lg:w-5/12 xl:w-1/2 flex-shrink-0 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-6 bg-gray-900 text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-500 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-xl font-bold font-heading">EduFlow</span>
        </div>

        {/* Desktop branding panel */}
        <div className="hidden lg:block h-full">
          <BrandingPanel />
        </div>
      </div>

      {/* Right Column - Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-24 relative">
        {children}
      </div>
    </div>
  );
}