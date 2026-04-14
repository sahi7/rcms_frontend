// src/app/layout/FlatDashboardSidebar.tsx
// Updated with the same beautiful mobile off-canvas drawer + swipe support
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  Upload,
  FileBarChart,
  Settings,
  Pin,
  PinOff,
  LogOut,
  X,
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
  // ── NEW: Mobile off-canvas props ──
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const teacherNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'view.dashboard' },
  { title: 'Mark Upload', icon: Upload, path: '/dashboard/marks/upload', permission: 'add.markupload' },
  { title: 'Subject Upload Status', icon: FileBarChart, path: '/dashboard/marks/upload-status', permission: 'view.subjectuploadstatus' },
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
  isMobileOpen,
  onMobileClose,
}: FlatDashboardSidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const isExpanded = isPinned || isHovered;
  const showLabels = isExpanded || isMobileOpen;

  const role = user?.role?.toLowerCase() || '';
  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'JD';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // ── Reusable inner content ──
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500 text-white shrink-0">
            <GraduationCap size={24} />
          </div>
          <AnimatePresence>
            {showLabels && (
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
          {showLabels && (
            <motion.button
              onClick={() => setIsPinned(!isPinned)}
              className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/10 md:block hidden"
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
                  onClick={isMobileOpen ? onMobileClose : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <item.icon size={20} />
                  <AnimatePresence>
                    {showLabels && (
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
        <div className={`flex items-center ${showLabels ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10 border border-white/10 shrink-0">
              <AvatarImage src={user?.profile_picture} />
              <AvatarFallback className="bg-orange-600 text-white">
                {getInitials(user?.first_name, user?.last_name)}
              </AvatarFallback>
            </Avatar>

            <AnimatePresence>
              {showLabels && (
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
            {showLabels && (
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
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 280 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:flex fixed top-0 left-0 h-screen z-40 bg-gray-900/90 backdrop-blur-xl border-r border-white/5 flex-col shadow-2xl overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* MOBILE OFF-CANVAS DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(event, info) => {
                if (info.offset.x < -90 || info.velocity.x < -400) {
                  onMobileClose();
                }
              }}
              className="fixed top-0 left-0 h-screen w-72 bg-gray-900/95 backdrop-blur-xl border-r border-white/5 shadow-2xl flex flex-col z-50 md:hidden overflow-hidden"
            >
              {sidebarContent}

              {/* Mobile-only close button */}
              <button
                onClick={onMobileClose}
                className="absolute top-5 right-5 text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 md:hidden z-10"
              >
                <X size={26} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}