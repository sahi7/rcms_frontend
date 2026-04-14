// src/app/layout/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, ChevronRight, Menu } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';

export function DashboardLayout() {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const { getLabel, getPlural } = useInstitutionConfig();
  const { user } = useAuthStore();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'JD';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Only apply left margin on desktop (≥768px)
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const sidebarWidth = isDesktop && isPinned ? 280 : isDesktop ? 72 : 0;

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbLabel = (segment: string, index: number): string => {
    const lower = segment.toLowerCase();
    if (lower === 'terms') return getPlural('academic_period');
    if (lower === 'study-levels') return getPlural('class_progression_name');
    if (lower === 'sequences') return getPlural('academic_period');
    if (lower === 'subjects') return getPlural('subject_naming') || 'Subjects';
    if (lower === 'curriculum-subjects') return getPlural('curriculum-subject_naming') || 'Curriculum Subjects';
    if (lower === 'subject-assignments') return getPlural('subject_naming-assignments') || 'Subject Assignments';
    if (lower === 'subject') return getLabel('subject_naming') || 'Subject';
    if (lower === 'faculties') return getLabel('faculty') || 'Faculties';
    if (lower === 'departments') return getLabel('department') || 'Departments';
    if (lower === 'classrooms') return getLabel('class_progression_name') || 'Classrooms';

    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  const breadcrumbs = pathSegments.map((segment, i) => ({
    name: getBreadcrumbLabel(segment, i),
    path: `/${pathSegments.slice(0, i + 1).join('/')}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar
        isPinned={isPinned}
        setIsPinned={setIsPinned}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Hamburger - Mobile only */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              <Menu size={26} />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center text-sm font-medium text-gray-500">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                  {i > 0 && <ChevronRight size={16} className="mx-2 text-gray-400" />}
                  <span className={i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : ''}>
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search students, classes..."
                className="pl-10 h-9 bg-gray-50 border-gray-200 focus-visible:ring-orange-500 rounded-full"
              />
            </div>

            <button className="relative text-gray-500 hover:text-orange-600">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <Avatar
              className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-orange-500 hover:ring-offset-2"
            >
              <AvatarImage src={user?.profile_picture} />
              <AvatarFallback className="bg-orange-600 text-white text-xs">
                {getInitials(user?.first_name, user?.last_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}