import React from 'react';
import { Logo } from '@/assets/Logo';
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
          <Logo variant='light' size={32} />
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