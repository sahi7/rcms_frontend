// src/app/layout/DashboardSidebar.tsx

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from "@/app/store/authStore";

import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Building2,
  Users,
  ClipboardCheck,
  FileBarChart,
  Shield,
  Settings,
  Pin,
  PinOff,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { TooltipProvider } from '../../components/ui/Tooltip';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useHasPermission, Can } from '@/hooks/shared/useHasPermission';

const navStructure = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'view.dashboard' },
  {
    title: 'Academic',
    icon: GraduationCap,
    permission: 'view.academic',
    children: [
      { title: 'Academic Years', path: '/dashboard/academic-years', permission: 'view.academic_year' },
      { title: 'Terms', path: '/dashboard/terms', permission: 'view.term' },
      { title: 'Sequences', path: '/dashboard/sequences', permission: 'view.sequence' },
      { title: 'Study Levels', path: '/dashboard/study-levels', permission: 'view.study_level' },
    ],
  },
  {
    title: 'Curriculum',
    icon: BookOpen,
    permission: 'view.curriculum',
    children: [
      { title: 'Subjects', path: '/dashboard/subjects', permission: 'view.subject' },
      { title: 'Curriculum Subjects', path: '/dashboard/curriculum-subjects', permission: 'view.curriculum_subject' },
      { title: 'Subject Assignments', path: '/dashboard/subject-assignments', permission: 'view.subject_assignment' },
    ],
  },
  {
    title: 'School Structure',
    icon: Building2,
    permission: 'view.structure',
    children: [
      { title: 'Faculties', path: '/dashboard/faculties', permission: 'view.faculty' },
      { title: 'Departments', path: '/dashboard/departments', permission: 'view.department' },
      { title: 'Classrooms', path: '/dashboard/classrooms', permission: 'view.classroom' },
      { title: 'Class Assignments', path: '/dashboard/class-assignments', permission: 'view.class_assignment' },
    ],
  },
  {
    title: 'Students',
    icon: Users,
    permission: 'view.student',
    children: [
      { title: 'All Students', path: '/dashboard/students', permission: 'view.student' },
      { title: 'Bulk Upload', path: '/dashboard/students/bulk-upload', permission: 'add.student' },
    ],
  },
  {
    title: 'Marks & Assessments',
    icon: ClipboardCheck,
    permission: 'view.marks',
    children: [
      { title: 'Overview', path: '/dashboard/marks/overview', permission: 'view.marks' },
      { title: 'Upload Marks', path: '/dashboard/marks/upload', permission: 'add.marks' },
    ],
  },
  {
    title: 'Reports',
    icon: FileBarChart,
    permission: 'view.report',
    children: [
      { title: 'Generate Reports', path: '/dashboard/reports/generate', permission: 'view.report' },
    ],
  },
  {
    title: 'Users & Access',
    icon: Shield,
    permission: 'view.user',
    children: [
      { title: 'Users', path: '/dashboard/users', permission: 'view.user' },
      { title: 'Roles', path: '/dashboard/roles', permission: 'view.role' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    permission: 'view.settings',
    children: [
      { title: 'School Settings', path: '/dashboard/settings', permission: 'view.settings' },
      { title: 'Plans & Features', path: '/dashboard/plans', permission: 'view.plan' },
    ],
  },
];

interface DashboardSidebarProps {
  isPinned: boolean;
  setIsPinned: (pinned: boolean) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

export function DashboardSidebar({ isPinned, setIsPinned, isHovered, setIsHovered }: DashboardSidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    // Auto-open groups with active children
    const newOpenGroups: Record<string, boolean> = {};
    navStructure.forEach((group) => {
      if (group.children?.length) {
        const hasActiveChild = group.children.some((child) => location.pathname === child.path || location.pathname.startsWith(child.path + '/'));
        if (hasActiveChild) newOpenGroups[group.title] = true;
      }
    });
    setOpenGroups(newOpenGroups);
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    if (!isExpanded) return;
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
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
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-xl font-bold font-heading text-white tracking-tight">
                EduFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.button onClick={() => setIsPinned(!isPinned)} className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/10">
              {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1.5">
          <TooltipProvider delayDuration={0}>
            {navStructure.map((group) => (
              <Can key={group.title} permission={group.permission}>
                <div className="mb-1">
                  {/* Group Header */}
                  <div
                    onClick={() => group.children?.length && toggleGroup(group.title)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${location.pathname === group.path ? 'bg-orange-500/10 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon size={20} />
                      <AnimatePresence>
                        {isExpanded && <motion.span className="font-medium text-sm">{group.title}</motion.span>}
                      </AnimatePresence>
                    </div>
                    {isExpanded && group.children?.length && <ChevronRight size={16} className={`transition-transform ${openGroups[group.title] ? 'rotate-90' : ''}`} />}
                  </div>

                  {/* Children */}
                  <AnimatePresence>
                    {group.children?.length && isExpanded && openGroups[group.title] && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ml-6 pl-3 border-l border-white/10 py-1 mt-1 space-y-1">
                        {group.children.map((child) => (
                          <Can key={child.path} permission={child.permission}>
                            <Link
                              to={child.path}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === child.path ? 'text-orange-400 bg-orange-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                            >
                              <span className="whitespace-nowrap">{child.title}</span>
                            </Link>
                          </Can>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Can>
            ))}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback className="bg-orange-600 text-white">JD</AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
                  <span className="text-sm font-medium text-white">John Doe</span>
                  <span className="text-xs text-gray-400">Administrator</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.button onClick={() => useAuthStore.getState().logout()} className="text-gray-400 hover:text-red-400 p-2 rounded-md hover:bg-red-500/10">
                <LogOut size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}