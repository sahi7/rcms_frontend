// src/app/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

export function DashboardLayout() {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const sidebarWidth = isPinned ? 280 : 72;

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, i) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    path: `/${pathSegments.slice(0, i + 1).join('/')}`,
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isPinned={isPinned} setIsPinned={setIsPinned} isHovered={isHovered} setIsHovered={setIsHovered} />

      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.path}>
                {i > 0 && <ChevronRight size={16} className="mx-2 text-gray-400" />}
                <span className={i === breadcrumbs.length - 1 ? 'text-gray-900 font-semibold' : ''}>{crumb.name}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder="Search students, classes..." className="pl-10 h-9 bg-gray-50 border-gray-200 focus-visible:ring-orange-500 rounded-full" />
            </div>

            <button className="relative text-gray-500 hover:text-orange-600">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-orange-500 hover:ring-offset-2">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}