import React, { useEffect, useState, Fragment } from 'react'
import { useAuthStore } from '@/app/store/authStore'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Menu, MoreHorizontal } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
export function DashboardLayout() {
  const [isPinned, setIsPinned] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { getLabel, getPlural } = useInstitutionConfig()
  const { user } = useAuthStore()
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'JD'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768)
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])
  const sidebarWidth = isDesktop && isPinned ? 280 : isDesktop ? 72 : 0
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const getBreadcrumbLabel = (segment: string, _index: number): string => {
    const lower = segment.toLowerCase()
    if (lower === 'terms') return getPlural('academic_period')
    if (lower === 'study-levels') return getPlural('class_progression_name')
    if (lower === 'sequences') return getPlural('academic_period')
    if (lower === 'subjects') return getPlural('subject_naming') || 'Subjects'
    if (lower === 'curriculum-subjects')
      return getPlural('curriculum-subject_naming') || 'Curriculum Subjects'
    if (lower === 'subject-assignments')
      return getPlural('subject_naming-assignments') || 'Subject Assignments'
    if (lower === 'subject') return getLabel('subject_naming') || 'Subject'
    if (lower === 'faculties') return getLabel('faculty') || 'Faculties'
    if (lower === 'departments') return getLabel('department') || 'Departments'
    if (lower === 'classrooms')
      return getLabel('class_progression_name') || 'Classrooms'
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }
  const breadcrumbs = pathSegments.map((segment, i) => ({
    name: getBreadcrumbLabel(segment, i),
    path: `/${pathSegments.slice(0, i + 1).join('/')}`,
  }))
  // Collapse long breadcrumbs: keep first + last 2 on desktop, last 1 on mobile
  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null
    // Mobile: only current page, truncated
    if (!isDesktop) {
      const current = breadcrumbs[breadcrumbs.length - 1]
      const parent =
        breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null
      return (
        <div className="flex items-center text-sm font-medium text-gray-500 min-w-0 flex-1">
          {parent && (
            <>
              <Link
                to={parent.path}
                className="flex-shrink-0 hover:text-gray-900 max-w-[80px] truncate"
              >
                {parent.name}
              </Link>
              <ChevronRight
                size={14}
                className="mx-1.5 text-gray-400 flex-shrink-0"
              />
            </>
          )}
          <span className="text-gray-900 font-semibold truncate">
            {current.name}
          </span>
        </div>
      )
    }
    // Desktop: collapse middle segments if > 4
    const shouldCollapse = breadcrumbs.length > 4
    const visible = shouldCollapse
      ? [breadcrumbs[0], ...breadcrumbs.slice(-2)]
      : breadcrumbs
    return (
      <div className="flex items-center text-sm font-medium text-gray-500 min-w-0 flex-1 overflow-hidden">
        {visible.map((crumb, i) => {
          const isLast = i === visible.length - 1
          const showCollapseAfterFirst = shouldCollapse && i === 0
          const hiddenCrumbs = shouldCollapse ? breadcrumbs.slice(1, -2) : []
          return (
            <Fragment key={crumb.path}>
              {i > 0 && (
                <ChevronRight
                  size={16}
                  className="mx-2 text-gray-400 flex-shrink-0"
                />
              )}
              {isLast ? (
                <span className="text-gray-900 font-semibold truncate max-w-[240px]">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-gray-900 truncate max-w-[160px] flex-shrink-0"
                >
                  {crumb.name}
                </Link>
              )}
              {showCollapseAfterFirst && (
                <>
                  <ChevronRight
                    size={16}
                    className="mx-2 text-gray-400 flex-shrink-0"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex-shrink-0">
                      <MoreHorizontal size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hiddenCrumbs.map((h) => (
                        <DropdownMenuItem key={h.path} asChild>
                          <Link to={h.path}>{h.name}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }
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
        animate={{
          marginLeft: sidebarWidth,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="flex-1 flex flex-col min-h-screen min-w-0"
      >
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Hamburger - Mobile only */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>

            {renderBreadcrumbs()}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-orange-500 hover:ring-offset-2">
              <AvatarImage src={(user as any)?.profile_picture} />
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
  )
}
