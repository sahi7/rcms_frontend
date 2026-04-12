// src/app/layout/FlatDashboardSidebar.tsx
// NEW COMPONENT #1 — Flat hierarchy for TEACHER
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  Upload,
  Edit3,
  FileBarChart,
  Settings,
  Pin,
  PinOff,
  LogOut,
} from 'lucide-react';

import { TooltipProvider } from '../../components/ui/Tooltip';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

import { toSentenceCase } from '@/app/store/institutionConfigStore';
import { useAuthStore } from '@/app/store/authStore';
import { Can } from '@/hooks/shared/useHasPermission';

interface FlatDashboardSidebarProps {
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const teacherNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'view.dashboard' },
  { title: 'Mark Upload', icon: Upload, path: 'marks/upload', permission: 'add.markupload' },
  { title: 'Subject Upload Status', icon: FileBarChart, path: 'marks/upload-status', permission: 'view.subjectuploadstatus' },
];

const studentNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'view.dashboard' },
  { title: 'My Marks', icon: ClipboardCheck, path: '/dashboard/marks/upload-status', permission: 'view.studentmarks' },
  { title: 'Mark Preview', icon: FileBarChart, path: '/dashboard/marks/preview', permission: 'markpre' },
];

export function FlatDashboardSidebar({
  isPinned,
  setIsPinned,
  isHovered,
  setIsHovered,
}: FlatDashboardSidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const isExpanded = isPinned || isHovered;

  const role = user?.role?.toLowerCase() || '';
  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'JD';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 280 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-0 left-0 h-screen z-40 bg-gray-900/90 backdrop-blur-xl border-r border-white/5 flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500 text-white shrink-0">
            <GraduationCap size={24} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold font-heading text-white tracking-tight"
              >
                EduFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.button
              onClick={() => setIsPinned(!isPinned)}
              className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/10"
            >
              {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1.5">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <Can key={item.path} permission={item.permission}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <item.icon size={20} />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Can>
            ))}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10 border border-white/10 shrink-0">
              <AvatarImage src={user?.profile_picture} />
              <AvatarFallback className="bg-orange-600 text-white">
                {getInitials(user?.first_name, user?.last_name)}
              </AvatarFallback>
            </Avatar>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="text-sm font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {toSentenceCase(user?.role ?? 'User')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.button
                onClick={() => useAuthStore.getState().logout()}
                className="text-gray-400 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10 shrink-0"
              >
                <LogOut size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}